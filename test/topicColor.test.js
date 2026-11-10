// each physics topic takes its sensors' group colour: one group per topic
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PHYSICS } from '../src/lib/physics.js';
import { groupColorOf, topicColor } from '../src/lib/topicColor.js';
import { PHYSICS_LINKS } from '../src/lib/nav.js';

test('every topic\'s sensors share one group, so one colour', () => {
  for (const t of PHYSICS) {
    const colors = new Set(t.devices.map((d) => groupColorOf(d.to)));
    assert.equal(colors.size, 1, `${t.slug}: ${[...colors]}`);
    assert.match(topicColor(t), /^--group-/, t.slug);
  }
});

test('the menus\' links carry the icon colour, the text step', () => {
  for (const l of PHYSICS_LINKS) assert.match(l.iconColor, /^--group-[a-z]+-text$/, l.to);
  assert.equal(PHYSICS_LINKS.find((l) => l.to === '/physics/pressure').iconColor, '--group-air-text');
});
