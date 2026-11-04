// The CH341 dongle from a page: pick it in the browser's chooser, open it
// (atiic's Ch341 over WebUSB), and when that fails, say what's likely
// missing. Shared by the setup check and the device pages.
import Ch341, { FILTERS } from 'atiic/adapters/ch341';

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

// the chooser, then the dongle opened as an I2C bus at sclHz
export async function openDongle(sclHz) {
  let device;
  try {
    device = await navigator.usb.requestDevice({ filters: FILTERS });
  } catch (e) {
    throw new DongleError('choose', e);
  }
  try {
    return await new Ch341(device).open(sclHz);
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
  linux: 'Linux keeps USB devices to root unless a udev rule gives the dongle to you (Setup, step 3); then unplug and plug the dongle back in.',
  windows: 'Windows lets the browser open only devices on the WinUSB driver: bind the dongle to WinUSB with Zadig (Setup, step 3), then unplug and plug it back in.',
};

// { title, detail } for a DongleError (or anything thrown talking to it)
export function explain(e, platform) {
  const cause = e.cause ?? e;
  if (e.stage === 'choose') {
    if (cause.name === 'NotFoundError') {
      return {
        title: 'No dongle chosen',
        detail: 'If the dongle wasn\'t in the list: check it\'s plugged in and its yellow jumper is on I2C (on TTL it\'s a serial port, which WebUSB doesn\'t list).',
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
        ? 'Most likely the kernel\'s spi-ch341 driver holds it: release it (Setup, step 3, after each plug), or block the driver. Otherwise another tab or program has it open.'
        : 'Another tab or program has it open: close it, or unplug and plug the dongle back in.',
    };
  }
  return { title: 'Talking to the dongle failed', detail: 'Unplug it, plug it back in and try again.' };
}

export const hex = (a) => `0x${a.toString(16).padStart(2, '0')}`;
