import test from 'node:test';
import assert from 'node:assert/strict';
import {
  themeFor,
  localDate,
  localMidnight,
  holidaysFor,
  occasionPoints,
  snapOccasionDay,
  adjacentOccasionDay
} from '../src/calendar.js';

test('the widget exposes the original six Valentine palette tokens', () => {
  const t = themeFor(new Date('2026-02-14T18:00:00Z'));
  assert.equal(t.id, 'valentines');
  assert.equal(t.season, 'winter');
  assert.deepEqual(Object.keys(t.palette).sort(), [
    'accent',
    'border',
    'page',
    'secondary',
    'soft',
    'strong'
  ]);
  assert.equal(t.palette.accent, '#90465e');
});
test('the local calendar follows midnight across daylight saving transitions', () => {
  const day = (d) => localMidnight(d, 'America/Chicago');
  assert.equal(day('2026-03-09') - day('2026-03-08'), 23 * 3600000);
  assert.equal(day('2026-11-02') - day('2026-11-01'), 25 * 3600000);
  const at = new Date('2026-03-01T02:00:00Z');
  assert.equal(localDate(at), '2026-02-28');
  assert.equal(themeFor(at, '', 'Asia/Tokyo').season, 'spring');
  assert.equal(themeFor(at).season, 'winter');
});
test('multi-day, floating and overlapping observances retain their individual identities', () => {
  const at = new Date('2026-01-01T18:00:00Z');
  assert.equal(themeFor(at).id, 'new-year');
  assert.ok(!themeFor(at).activeOccasions.some((p) => p.id === 'kwanzaa'));
  assert.equal(holidaysFor(2026).find((h) => h.id === 'thanksgiving').date, '2026-11-26');
  for (const id of ['hanukkah', 'eid-fitr', 'eid-adha'])
    assert.ok(holidaysFor(2026).some((h) => h.id === id));
});
test('Día de los Muertos follows Halloween and covers both local calendar days', () => {
  const id = 'dia-de-los-muertos';
  for (const zone of ['America/Chicago', 'America/Mexico_City']) {
    const at = (date) => themeFor(new Date(localMidnight(date, zone)), '', zone).id;
    assert.equal(at('2026-10-31'), 'halloween');
    assert.equal(at('2026-11-01'), id);
    assert.equal(at('2026-11-02'), id);
    assert.equal(at('2026-11-03'), 'autumn');
  }
});
test('New Year’s Eve marks December 31 until local midnight', () => {
  for (const [year, lastDay] of [[2026, 364], [2028, 365]]) {
    const eve = occasionPoints(year).find((p) => p.id === 'new-years-eve');
    assert.equal(eve.date, year + '-12-31');
    assert.equal(eve.day, lastDay);
    const midnight = localMidnight((year + 1) + '-01-01', 'America/Chicago');
    const before = themeFor(new Date(midnight - 1));
    assert.equal(before.id, eve.id);
    assert.ok(!before.activeOccasions.some((p) => p.id === 'kwanzaa'));
    const morning = themeFor(new Date(midnight));
    assert.equal(morning.id, 'new-year');
    assert.notDeepEqual(before.palette, morning.palette);
    assert.notEqual(before.symbol, morning.symbol);
  }
});
test('the Kwanzaa theme ends at midnight and the last four ordinary days stay selectable', () => {
  assert.equal(themeFor(new Date('2027-12-28T18:00:00Z'), 'hanukkah').id, 'hanukkah');
  for (const year of [2026, 2027, 2028]) {
    const start = localMidnight(year + '-12-26');
    assert.equal(themeFor(new Date(start)).id, 'kwanzaa');
    assert.equal(themeFor(new Date(localMidnight(year + '-12-27') - 1)).id, 'kwanzaa');
    for (const day of [27, 28, 29, 30]) {
      const date = year + '-12-' + day;
      assert.equal(themeFor(new Date(localMidnight(date))).id, 'winter');
      const index = (Date.parse(date) - Date.UTC(year, 0, 1)) / 86400000;
      assert.equal(snapOccasionDay(year, index), index);
    }
    assert.equal(themeFor(new Date(localMidnight(year + '-12-31'))).id, 'new-years-eve');
  }
});
test('preview snapping and adjacent jumps include leap years', () => {
  const points = occasionPoints(2028);
  const valentines = points.find((p) => p.id === 'valentines');
  assert.equal(snapOccasionDay(2028, valentines.day - 2), valentines.day);
  assert.equal(adjacentOccasionDay(2028, 365, 1), 365);
  assert.equal(adjacentOccasionDay(2026, 0, -1), 0);
});
