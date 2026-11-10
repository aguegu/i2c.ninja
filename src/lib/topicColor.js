// A physics topic's colour: its sensors' device group's (lib/devices.js),
// as a CSS variable name. A device link may name a tab (/mpu6050#gyro).
import { DEVICES, DEVICE_GROUPS } from './devices.js';

// a device link's group colour, '--group-...'
export const groupColorOf = (to) => {
  const d = DEVICES.find((x) => x.to === to.split('#')[0]);
  return DEVICE_GROUPS.find((g) => g.name === d?.group)?.color;
};

// a topic's: its first sensor's group (each topic's sensors share one:
// test/topicColor.test.js)
export const topicColor = (topic) => groupColorOf(topic.devices[0].to);
