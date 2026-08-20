import { strict as assert } from "node:assert";
import {
  DEFAULT_TIME_ZONE,
  calendarKey,
  zonedHour,
  enumerateDayKeys,
  addCalendarDays,
  periodToggleTarget,
} from "../tz.js";

const berlinNight = new Date("2026-08-20T01:00:17+02:00");
const easternEvening = new Date("2026-08-19T19:00:17-04:00");

assert.equal(DEFAULT_TIME_ZONE, "Europe/Berlin");
assert.equal(calendarKey(berlinNight, "Europe/Berlin"), "2026-08-20");
assert.equal(calendarKey(berlinNight, "America/New_York"), "2026-08-19");
assert.equal(calendarKey(easternEvening, "Europe/Berlin"), "2026-08-20");
assert.equal(zonedHour(berlinNight, "Europe/Berlin"), 1);
assert.equal(zonedHour(berlinNight, "America/New_York"), 19);

assert.equal(addCalendarDays("2026-08-01", -1), "2026-07-31");
assert.equal(addCalendarDays("2026-08-20", 0), "2026-08-20");

const keys = enumerateDayKeys(7, "Europe/Berlin", berlinNight);
assert.equal(keys.length, 7);
assert.equal(keys[keys.length - 1], "2026-08-20");
assert.equal(keys[0], "2026-08-14");

assert.deepEqual(periodToggleTarget("day"), { view: "day", selectToday: true });
assert.deepEqual(periodToggleTarget("week"), {
  view: "week",
  selectToday: false,
});
assert.deepEqual(periodToggleTarget("month"), {
  view: "month",
  selectToday: false,
});

console.log("Timezone tests passed");
