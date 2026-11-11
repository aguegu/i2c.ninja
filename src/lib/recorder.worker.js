// The recorder's writer (lib/recorder.js): a recording's CSV in the site's
// private storage (OPFS), through a sync access handle (workers only),
// each batch appended and flushed to the disk as it comes, so a cut-off
// recording keeps all but its last batch.
//   in:  { type: 'open', dir, id, info, header }  <id>.csv and <id>.json
//        { type: 'write', text }
//        { type: 'close' }
//   out: { type: 'open-done' }, { type: 'close-done' }
//        { type: 'size', size }  after each write
//        { type: 'error', message }
const encoder = new TextEncoder();
let handle = null;
let size = 0;

function append(text) {
  const b = encoder.encode(text);
  handle.write(b, { at: size });
  handle.flush();
  size += b.byteLength;
  postMessage({ type: 'size', size });
}

onmessage = async ({ data }) => {
  try {
    if (data.type === 'open') {
      const dir = await (await navigator.storage.getDirectory()).getDirectoryHandle(data.dir, { create: true });
      const csv = await dir.getFileHandle(`${data.id}.csv`, { create: true });
      handle = await csv.createSyncAccessHandle();
      handle.truncate(0);
      size = 0;
      const meta = await (await dir.getFileHandle(`${data.id}.json`, { create: true })).createSyncAccessHandle();
      meta.truncate(0);
      meta.write(encoder.encode(JSON.stringify({ id: data.id, ...data.info, saved: false })), { at: 0 });
      meta.flush();
      meta.close();
      append(data.header);
      postMessage({ type: 'open-done' });
    } else if (data.type === 'write') {
      append(data.text);
    } else if (data.type === 'close') {
      handle?.flush();
      handle?.close();
      handle = null;
      postMessage({ type: 'close-done' });
    }
  } catch (e) {
    postMessage({ type: 'error', message: e.message || e.name });
  }
};
