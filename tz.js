export const DEFAULT_TIME_ZONE = "Europe/Berlin";

function asDate(value) {
  return value instanceof Date ? value : new Date(value);
}

function part(parts, type) {
  return parts.find((entry) => entry.type === type)?.value;
}

export function calendarKey(value, timeZone = DEFAULT_TIME_ZONE) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(asDate(value));
  return `${part(parts, "year")}-${part(parts, "month")}-${part(parts, "day")}`;
}

export function zonedHour(value, timeZone = DEFAULT_TIME_ZONE) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    hourCycle: "h23",
  }).formatToParts(asDate(value));
  const hour = Number(part(parts, "hour"));
  return hour === 24 ? 0 : hour;
}

export function addCalendarDays(dayKey, delta) {
  const [year, month, day] = dayKey.split("-").map(Number);
  const shifted = new Date(Date.UTC(year, month - 1, day + delta, 12));
  const yyyy = shifted.getUTCFullYear();
  const mm = String(shifted.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(shifted.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function enumerateDayKeys(
  count,
  timeZone = DEFAULT_TIME_ZONE,
  now = new Date(),
) {
  const today = calendarKey(now, timeZone);
  const keys = [];
  for (let offset = count - 1; offset >= 0; offset--) {
    keys.push(addCalendarDays(today, -offset));
  }
  return keys;
}

export function timelineDayLabel(dayKey) {
  const [year, month, day] = dayKey.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12)).toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    },
  );
}

export function dayDisplayParts(dayKey) {
  const [year, month, day] = dayKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 12));
  return {
    weekday: date.toLocaleDateString("en-US", {
      weekday: "long",
      timeZone: "UTC",
    }),
    weekdayShort: date
      .toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" })
      .toUpperCase(),
    weekdayLetter: date.toLocaleDateString("en-US", {
      weekday: "narrow",
      timeZone: "UTC",
    }),
    month: date.toLocaleDateString("en-US", { month: "long", timeZone: "UTC" }),
    day,
    weekdayIndex: date.getUTCDay(),
  };
}

export function periodToggleTarget(period) {
  if (period === "month") return { view: "month", selectToday: false };
  if (period === "day") return { view: "day", selectToday: true };
  return { view: "week", selectToday: false };
}
