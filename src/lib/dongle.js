// The USB dongle from a page: pick it in the browser's chooser, open it
// (atiic's Ch341 or Ch347 over WebUSB, by the device picked), and when that
// fails, say what's likely missing. Shared by the setup check and the
// device pages. Both give the same I2C bus: scan, write, read, writeRead.
import Ch341, { FILTERS as CH341_FILTERS } from 'atiic/adapters/ch341';
import Ch347, { FILTERS as CH347_FILTERS } from 'atiic/adapters/ch347';

// a CH341 in I2C mode (1a86:5512), a CH347T in mode 1 (55db), a CH347F (55de)
const ADAPTERS = [
  { filters: CH341_FILTERS, Adapter: Ch341 },
  { filters: CH347_FILTERS, Adapter: Ch347 },
];
const FILTERS = ADAPTERS.flatMap((a) => a.filters);
const adapterFor = (device) => ADAPTERS.find((a) => a.filters.some((f) => f.vendorId === device.vendorId && f.productId === device.productId)).Adapter;

export const hasWebUsb = typeof navigator !== 'undefined' && 'usb' in navigator;

// the platform the page runs on, for the setup steps that differ
export function detectPlatform() {
  const p = (navigator.userAgentData?.platform || navigator.userAgent).toLowerCase();
  if (p.includes('android')) return 'android';
  if (p.includes('cros') || p.includes('chrome os')) return 'chromeos';
  if (p.includes('win')) return 'windows';
  if (p.includes('mac')) return 'macos';
  return 'linux';
}

// a failure on the way to an open bus: where it happened, and why
export class DongleError extends Error {
  constructor(stage, cause) {
    super(`${cause.name}: ${cause.message}`);
    this.stage = stage; // 'choose' or 'open'
    this.cause = cause;
  }
}

// the chooser (CH341s and CH347s), then the one picked opened as an I2C bus
// at sclHz
export async function openDongle(sclHz) {
  let device;
  try {
    device = await navigator.usb.requestDevice({ filters: FILTERS });
  } catch (e) {
    throw new DongleError('choose', e);
  }
  try {
    return await new (adapterFor(device))(device).open(sclHz);
  } catch (e) {
    try {
      await device.close();
    } catch {
      // not open: nothing to close
    }
    throw new DongleError('open', e);
  }
}

const PERMISSION_HINT = {
  linux: 'Linux keeps USB devices to root unless a udev rule gives the dongle to you (Get started, step 3); then unplug and plug the dongle back in.',
  windows: 'Windows lets the browser open only devices on the WinUSB driver: bind the dongle to WinUSB with Zadig (Get started, step 3), then unplug and plug it back in.',
};

// { title, detail } for a DongleError (or anything thrown talking to it)
export function explain(e, platform) {
  const cause = e.cause ?? e;
  if (e.stage === 'choose') {
    if (cause.name === 'NotFoundError') {
      return {
        title: 'No dongle chosen',
        detail: 'If the dongle wasn\'t in the list: check it\'s plugged in, and set for I2C: a CH341T\'s yellow jumper on I2C (on TTL it\'s a serial port, which WebUSB doesn\'t list), a CH347T in mode 1 (S1 on, S2 off).',
      };
    }
    return { title: 'The chooser failed', detail: '' };
  }
  if (e.stage === 'open' && cause.name === 'SecurityError') {
    return {
      title: 'The system didn\'t let the browser open the dongle',
      detail: PERMISSION_HINT[platform] ?? `${PERMISSION_HINT.linux} ${PERMISSION_HINT.windows}`,
    };
  }
  if (e.stage === 'open' && cause.name === 'NetworkError') {
    return {
      title: 'The dongle is busy',
      detail: platform === 'linux'
        ? 'On a CH341, most likely the kernel\'s spi-ch341 driver holds it: release it (Get started, step 3, after each plug), or block the driver. Otherwise another tab or program has it open.'
        : 'Another tab or program has it open: close it, or unplug and plug the dongle back in.',
    };
  }
  return { title: 'Talking to the dongle failed', detail: 'Unplug it, plug it back in and try again.' };
}

export const hex = (a) => `0x${a.toString(16).padStart(2, '0')}`;
