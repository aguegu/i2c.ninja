// The recorder: a page's readings written to a CSV on the disk as they come,
// for as long as it runs (days, if need be), the disk the limit, not the
// memory. The file lives in the site's private storage (the origin private
// file system, OPFS), written by lib/recorder.worker.js, which flushes each
// batch to disk; Save hands it to the browser's downloads. One slot only, no
// history: a recording cut off (the tab closed, a crash) is offered again on
// the next visit, to save or delete; a saved one is deleted on the next visit
// (not sooner: its download may still be reading it). Each recording its own
// file, <id>.csv with <id>.json (its name, start, saved), in recordings/.
//
// What it records: every series a page registers with a name (each
// LiveChart registers its own; useImu its two), the readings as the page
// gets them (tap(), from lib/series.js and useImu). Readings of the same
// moment share a row; columns of a series not read at that moment stay
// empty.
//
// The CSV (UTF-8, with a byte order mark for Excel): time (ISO 8601, UTC),
// t_ms (since its first row), then a
// column per series, "<chart> <label> (<unit>)".
import { ref, computed } from 'vue';

const BATCH_MS = 1000; // a batch to the disk each second
const BATCH_CHARS = 256 * 1024; // or sooner, once this much is waiting
const ROOM_EVERY_MS = 10000; // the storage estimate read again
const DIR = 'recordings';

export const hasRecorder = typeof navigator !== 'undefined' && !!navigator.storage?.getDirectory && typeof Worker !== 'undefined';

// the named series on the page: source function -> { title, unit, labels }
const named = new Map();

// a series' name for the recorder (title a string, or a function read when a
// recording starts: the chip found by then); returns its unregister
export function nameSeries(source, title, unit, labels) {
  if (named.has(source)) return () => {};
  const entry = { title, unit, labels };
  named.set(source, entry);
  return () => { if (named.get(source) === entry) named.delete(source); };
}

// the state the button shows
export const recording = ref(false);
export const rows = ref(0);
export const bytes = ref(0);
export const startedAt = ref(null); // a Date
export const room = ref(null); // bytes left in the site's quota, or null
export const failure = ref(null);
// a recording left from before, { name, size, started, saved }
export const leftover = ref(null);

let worker = null;
let columns = null; // source -> first column index
let width = 0;
let t0 = null; // the first row's time
let row = null; // the row being filled: { t, cells }
let text = '';
let batchTimer = 0;
let roomTimer = 0;
let wakeLock = null;
let name = '';
let id = '';

const folder = async () => (await navigator.storage.getDirectory()).getDirectoryHandle(DIR, { create: true });

const quote = (s) => (/[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s);

function endRow() {
  if (!row) return;
  t0 ??= row.t;
  // the readings' times are on the page's clock: performance.timeOrigin makes them the wall clock's
  text += `${new Date(performance.timeOrigin + row.t).toISOString()},${+(row.t - t0).toFixed(3)},${row.cells.join(',')}\n`;
  rows.value++;
  row = null;
  if (text.length >= BATCH_CHARS) sendBatch();
}

// a reading: from lib/series.js and useImu, (source, t ms on the page's clock, values)
export function tap(source, t, values) {
  if (!recording.value) return;
  const at = columns.get(source);
  if (at === undefined) return;
  if (row && row.t !== t) endRow();
  if (!row) row = { t, cells: new Array(width).fill('') };
  values.forEach((v, k) => { row.cells[at + k] = Number.isFinite(v) ? String(v) : ''; });
}

function sendBatch() {
  if (!text) return;
  worker.postMessage({ type: 'write', text });
  text = '';
}

function call(w, msg) {
  return new Promise((resolve, reject) => {
    const onMessage = ({ data }) => {
      if (data.type === 'error') { w.removeEventListener('message', onMessage); reject(new Error(data.message)); }
      else if (data.type === `${msg.type}-done`) { w.removeEventListener('message', onMessage); resolve(data); }
    };
    w.addEventListener('message', onMessage);
    w.postMessage(msg);
  });
}

async function readRoom() {
  try {
    const { quota, usage } = await navigator.storage.estimate();
    room.value = quota - usage;
  } catch { room.value = null; }
}

async function holdScreen() {
  try { wakeLock = await navigator.wakeLock?.request('screen'); } catch { wakeLock = null; }
}
const onVisible = () => { if (recording.value && document.visibilityState === 'visible') holdScreen(); };
const onLeave = (e) => { if (recording.value) e.preventDefault(); };

const stamp = (d) => d.toISOString().slice(0, 19).replace('T', '-').replaceAll(':', '');

// start one: the series named on the page now are its columns
export async function startRecording(label) {
  if (recording.value || !hasRecorder) return;
  failure.value = null;
  await checkLeftover();
  if (leftover.value) {
    failure.value = 'A recording from before is still here: save or delete it first.';
    return;
  }
  const sources = [...named.entries()];
  if (!sources.length) {
    failure.value = 'Nothing to record on this page.';
    return;
  }
  columns = new Map();
  const head = ['\uFEFFtime', 't_ms']; // the byte order mark: Excel reads the file as UTF-8 (°, µ, φ)
  width = 0;
  for (const [source, { title, unit, labels }] of sources) {
    columns.set(source, width);
    const t = typeof title === 'function' ? title() : title;
    for (const l of labels) head.push(quote(`${t} ${l}${unit ? ` (${unit})` : ''}`));
    width += labels.length;
  }
  const started = new Date();
  name = `${label}-${stamp(started)}.csv`;
  id = String(started.getTime());
  worker = new Worker(new URL('./recorder.worker.js', import.meta.url), { type: 'module' });
  worker.addEventListener('message', ({ data }) => {
    if (data.type === 'size') bytes.value = data.size;
    else if (data.type === 'error' && recording.value) { failure.value = `Recording stopped: ${data.message}`; stopRecording(); }
  });
  try {
    await call(worker, { type: 'open', dir: DIR, id, info: { name, started: started.toISOString() }, header: `${head.join(',')}\n` });
  } catch (e) {
    worker.terminate();
    worker = null;
    failure.value = `Can't record here: ${e.message}`;
    return;
  }
  leftover.value = null;
  t0 = null;
  row = null;
  text = '';
  rows.value = 0;
  bytes.value = 0;
  startedAt.value = started;
  recording.value = true;
  batchTimer = setInterval(sendBatch, BATCH_MS);
  readRoom();
  roomTimer = setInterval(readRoom, ROOM_EVERY_MS);
  holdScreen();
  document.addEventListener('visibilitychange', onVisible);
  addEventListener('beforeunload', onLeave);
}

// stop one and save it: the Stop button, leaving the page
export async function stopRecording() {
  if (!recording.value) return;
  recording.value = false;
  endRow();
  clearInterval(batchTimer);
  clearInterval(roomTimer);
  document.removeEventListener('visibilitychange', onVisible);
  removeEventListener('beforeunload', onLeave);
  wakeLock?.release().catch(() => {});
  wakeLock = null;
  sendBatch();
  const w = worker;
  worker = null;
  try {
    await call(w, { type: 'close' });
  } catch (e) {
    failure.value = `The recording didn't close cleanly: ${e.message}`;
  }
  w.terminate();
  await checkLeftover();
  if (leftover.value?.id === id) await saveLeftover();
}

// the recording not yet saved, if any: { id, name, started, size }
export async function checkLeftover() {
  if (!hasRecorder || recording.value) return;
  try {
    const dir = await folder();
    let found = null;
    for await (const [n, h] of dir.entries()) {
      if (!n.endsWith('.json')) continue;
      const info = JSON.parse(await (await h.getFile()).text());
      if (info.saved) continue;
      const file = await (await dir.getFileHandle(`${info.id}.csv`)).getFile();
      found = { ...info, size: file.size };
    }
    leftover.value = found;
  } catch {
    leftover.value = null;
  }
}

async function writeInfo(dir, info) {
  const w = await (await dir.getFileHandle(`${info.id}.json`, { create: true })).createWritable();
  await w.write(JSON.stringify(info));
  await w.close();
}

// hand it to the browser's downloads, then mark it saved: deleted on the
// next visit
export async function saveLeftover() {
  const l = leftover.value;
  if (!l) return;
  const dir = await folder();
  const file = await (await dir.getFileHandle(`${l.id}.csv`)).getFile();
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = l.name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
  await writeInfo(dir, { id: l.id, name: l.name, started: l.started, saved: true });
  leftover.value = null;
}

export async function deleteLeftover() {
  const l = leftover.value;
  if (!l) return;
  const dir = await folder();
  for (const n of [`${l.id}.csv`, `${l.id}.json`]) await dir.removeEntry(n).catch(() => {});
  leftover.value = null;
}

// on the site's start: the saved ones go (and any file without its info),
// an unsaved one is offered
export async function tidyRecordings() {
  if (!hasRecorder) return;
  try {
    const dir = await folder();
    const keep = new Set();
    const drop = [];
    for await (const [n, h] of dir.entries()) {
      if (!n.endsWith('.json')) continue;
      const info = JSON.parse(await (await h.getFile()).text());
      if (info.saved) drop.push(`${info.id}.csv`, n);
      else keep.add(`${info.id}.csv`).add(n);
    }
    for await (const n of dir.keys()) if (!keep.has(n) && !drop.includes(n)) drop.push(n);
    for (const n of drop) await dir.removeEntry(n).catch(() => {});
  } catch { /* nothing to tidy */ }
  await checkLeftover();
}

export const elapsed = (now) => (startedAt.value ? now - startedAt.value.getTime() : 0);
export const anyLeftover = computed(() => !!leftover.value);
