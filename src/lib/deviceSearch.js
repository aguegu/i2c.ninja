// /devices' quick filter: does a device match what's typed? Every word of
// the query must match. A word like 0x44 is an I2C address, checked against
// the device's addresses (a range, 0x40-0x4F, counts each in it); any other
// word is looked for, ignoring case, spaces and dashes, in its name, its
// short addresses (aliases: SHT31 finds the SHT3x), maker, type, group and
// what it measures.
import { aliasesOf } from './aliases.js';

const HEX_WORD = /^0x[0-9a-f]{1,2}$/;
const HEX_ALL = /0x[0-9a-f]{1,2}(?:\s*-\s*0x[0-9a-f]{1,2})?/gi;
const squash = (s) => s.toLowerCase().replace(/[\s\-_/·.,:;()]+/g, '');

// the addresses on its bus line: 'I2C 0x68 / 0x69' -> [0x68, 0x69];
// 'I2C 0x40-0x4F' -> 0x40 ... 0x4F
export function addressesOf(bus) {
  const out = [];
  for (const m of bus.match(HEX_ALL) ?? []) {
    const [a, b = a] = m.split('-').map((x) => parseInt(x.trim(), 16));
    for (let v = a; v <= b; v++) out.push(v);
  }
  return out;
}

export function matches(device, query) {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const text = squash([device.name, ...aliasesOf(device.to).map((a) => a.slice(1)), device.maker, device.kind, device.group, device.measures].join(' '));
  const addresses = addressesOf(device.bus);
  return words.every((w) => (HEX_WORD.test(w) ? addresses.includes(parseInt(w, 16)) : text.includes(squash(w))));
}
