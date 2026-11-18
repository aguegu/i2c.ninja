// A Worker-shaped runner that samples on the main thread, for a Dart reached
// over Bluetooth (Web Bluetooth can't run in a worker). It presents the same
// interface lib/useSources.js uses from a Worker — postMessage, addEventListener
// ('message'), removeEventListener, terminate — so the page drives either behind
// one handle. The bus is the Dart it was given, opened by the shared sampler
// (lib/sampler.js). The BLE link reads in one round trip per period (the FIFO
// pump), so the main thread carries it comfortably at these rates.
import Dart from 'atiic/adapters/dart';
import { createSampler } from './sampler.js';

export class MainSampler {
  constructor(device) {
    this.device = device;
    this.listeners = new Set();
    this.sampler = createSampler({
      openBus: (m) => new Dart(this.device).open(m.sclHz),
      post: (msg) => this.emit(msg),
    });
  }

  emit(msg) {
    const event = { data: msg };
    for (const fn of [...this.listeners]) queueMicrotask(() => fn(event));
  }

  addEventListener(type, fn) {
    if (type === 'message') this.listeners.add(fn);
  }

  removeEventListener(type, fn) {
    if (type === 'message') this.listeners.delete(fn);
  }

  postMessage(msg) {
    this.sampler.handle(msg);
  }

  async terminate() {
    await this.sampler.stop();
    this.listeners.clear();
  }
}
