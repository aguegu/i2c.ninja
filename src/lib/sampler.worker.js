// The sensors read off the page's main thread for the USB bridges (the BLE
// darts use lib/mainSampler.js instead, Web Bluetooth being main-thread only).
// The page shows the chooser (a worker can't) and hands over what it picked;
// this opens it again (getDevices) and runs the shared sampler (lib/sampler.js),
// which scans the bus and reads the chosen chips. See lib/sampler.js for the
// message protocol.
import { createSampler } from './sampler.js';
import { adapterFor } from './dongle.js';

async function openBus(m) {
  if (m.fake) {
    const { FakeDongle } = await import('./fakeDongle.js');
    return new FakeDongle(m.fake);
  }
  const devices = await navigator.usb.getDevices();
  const d = devices.find((x) => x.vendorId === m.match.vendorId && x.productId === m.match.productId && x.serialNumber === m.match.serialNumber);
  if (!d) throw Object.assign(new Error('the bridge chosen is no longer there'), { name: 'NotFoundError' });
  return new (adapterFor(d))(d).open(m.sclHz);
}

const sampler = createSampler({ openBus, post: (msg) => postMessage(msg) });
onmessage = ({ data }) => sampler.handle(data);
