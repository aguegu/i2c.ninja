// The device list's groups: every device in one of DEVICE_GROUPS, the list
// in their order with each group's devices together (the menus, the footer
// and /devices show it as it stands)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEVICES, DEVICE_GROUPS, DEVICES_BY_GROUP } from '../src/lib/devices.js';

const NAMES = DEVICE_GROUPS.map((g) => g.name);

test('every device is in a known group', () => {
  for (const d of DEVICES) assert.ok(NAMES.includes(d.group), `${d.name}: group ${d.group}`);
});

test('the list runs group by group, in the groups\' order', () => {
  const order = DEVICES.map((d) => NAMES.indexOf(d.group));
  for (let i = 1; i < order.length; i++) assert.ok(order[i] >= order[i - 1], `${DEVICES[i].name} (${DEVICES[i].group}) after ${DEVICES[i - 1].name} (${DEVICES[i - 1].group})`);
});

test('the grouped list has every device once, and no empty group', () => {
  assert.deepEqual(DEVICES_BY_GROUP.flatMap((g) => g.devices), DEVICES);
  for (const g of DEVICES_BY_GROUP) assert.ok(g.devices.length, g.name);
});

test('every group has its colour, each its own', () => {
  for (const g of DEVICE_GROUPS) assert.match(g.color ?? '', /^--group-/, g.name);
  assert.equal(new Set(DEVICE_GROUPS.map((g) => g.color)).size, DEVICE_GROUPS.length);
});
