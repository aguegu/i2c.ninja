// Which bridge a bus is, for keeping a sensor's calibration with it (a
// sensor is taken to stay wired to its bridge): { model, id, label }. id
// tells one unit from another, or is null when the model's units all look
// alike: a Dart's chip ID (its USB serial; over Bluetooth, from its INFO
// reply), a CH347F's USB serial; a CH347T reports the same placeholder on
// every unit, a CH341 none. Worker-safe: no page objects.
const MODELS = {
  'ffff:da92': 'Dart',
  '1a86:5512': 'CH341',
  '1a86:55db': 'CH347T',
  '1a86:55de': 'CH347F',
};
const PLACEHOLDERS = new Set(['', '0123456789']);
const hex4 = (n) => n.toString(16).padStart(4, '0');

export async function bridgeOf(bus) {
  if (bus.isFake) return { model: 'fake', id: 'fake', label: 'the fake bridge' };
  // a Dart, USB or Bluetooth: its INFO reply's chip ID
  if (typeof bus.info === 'function' && bus.protocol !== undefined) {
    try {
      const { uniqueId } = await bus.info();
      if (uniqueId) return { model: 'Dart', id: uniqueId, label: `Dart-${uniqueId.slice(-4)}` };
    } catch {
      // fall through to its USB descriptor, if any
    }
  }
  const d = bus.device;
  const model = d && d.vendorId !== undefined ? MODELS[`${hex4(d.vendorId)}:${hex4(d.productId)}`] ?? `${hex4(d.vendorId)}:${hex4(d.productId)}` : 'bridge';
  const serial = d?.serialNumber ?? '';
  if (PLACEHOLDERS.has(serial)) return { model, id: null, label: `any ${model}` };
  return { model, id: serial, label: `${model} ${serial}` };
}

// the bridge's part of a calibration's key: one unit, or the whole model
export const bridgeKey = (b) => (b ? `${b.model}:${b.id ?? '*'}` : '?:*');
