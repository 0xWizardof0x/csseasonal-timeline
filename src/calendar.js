/* Season Timeline. Calendar rules and palettes from Magical Minds, CivicLine and Buenos Días. */
const addDays = (date, days) =>
  new Date(Date.parse(date + 'T12:00:00Z') + days * 86400000).toISOString().slice(0, 10);

export const seasonalPalettes = {
  spring: {
    accent: '#416d4b',
    strong: '#2e5339',
    page: '#f1f7df',
    soft: '#c3e1a9',
    secondary: '#d976a1',
    border: '#bfd0a8'
  },
  summer: {
    accent: '#276a75',
    strong: '#1c505a',
    page: '#fff3ce',
    soft: '#b8e5df',
    secondary: '#efb33e',
    border: '#d5e1ce'
  },
  autumn: {
    accent: '#955034',
    strong: '#743c26',
    page: '#fff0dc',
    soft: '#edcc9f',
    secondary: '#c16c31',
    border: '#e3d3bd'
  },
  winter: {
    accent: '#3e6188',
    strong: '#2e486b',
    page: '#e9f2ff',
    soft: '#bdd5ef',
    secondary: '#9a87c8',
    border: '#d0dce9'
  }
};
const seasonNames = { spring: 'Spring', summer: 'Summer', autumn: 'Autumn', winter: 'Winter' };
const holidayPalettes = {
  gold: {
    accent: '#635077',
    strong: '#493957',
    page: '#fff5d8',
    soft: '#ead18e',
    secondary: '#b28a35',
    border: '#dfd4be'
  },
  patriotic: {
    accent: '#365b7d',
    strong: '#25435f',
    page: '#f4f3f8',
    soft: '#c6d8ed',
    secondary: '#ae4e51',
    border: '#d6deea'
  },
  mlk: {
    accent: '#344e70',
    strong: '#253e5d',
    page: '#f6f2e8',
    soft: '#d8c18d',
    secondary: '#ae813c',
    border: '#c4ac79'
  },
  independence: {
    accent: '#264d87',
    strong: '#b33943',
    page: '#f4f6fc',
    soft: '#c3d2ec',
    secondary: '#c43e4c',
    border: '#a9bbd9'
  },
  'new-year': {
    accent: '#575275',
    strong: '#333b61',
    page: '#f3eff9',
    soft: '#d4c9e7',
    secondary: '#b8994e',
    border: '#b8a068'
  },
  presidents: {
    accent: '#526e8a',
    strong: '#354f6c',
    page: '#edf2f6',
    soft: '#c9d7e1',
    secondary: '#a68b50',
    border: '#a5b8c8'
  },
  memorial: {
    accent: '#526a72',
    strong: '#354c57',
    page: '#f0f3ed',
    soft: '#c6d3c0',
    secondary: '#a75659',
    border: '#a2b29e'
  },
  juneteenth: {
    accent: '#9c404e',
    strong: '#74323f',
    page: '#fff2dd',
    soft: '#e6c783',
    secondary: '#567257',
    border: '#b38e53'
  },
  labor: {
    accent: '#376c72',
    strong: '#234f58',
    page: '#eaf2ef',
    soft: '#c5d7cc',
    secondary: '#bd974e',
    border: '#91aaa5'
  },
  indigenous: {
    accent: '#57745f',
    strong: '#395b4b',
    page: '#f2f0e4',
    soft: '#c3d0ae',
    secondary: '#a27d5b',
    border: '#9eac8c'
  },
  veterans: {
    accent: '#4b6780',
    strong: '#304c68',
    page: '#f1f3f6',
    soft: '#c5d2df',
    secondary: '#9e8c59',
    border: '#b6a273'
  },
  freedom: {
    accent: '#8b3b42',
    strong: '#652a32',
    page: '#fff0cf',
    soft: '#bbd4ae',
    secondary: '#518457',
    border: '#e0dcc5'
  },
  harvest: {
    accent: '#92502f',
    strong: '#6f3b24',
    page: '#fff0dc',
    soft: '#ebc48a',
    secondary: '#af7b2f',
    border: '#e4ceb3'
  },
  christmas: {
    accent: '#23583c',
    strong: '#8d2635',
    page: '#faf4e8',
    soft: '#bdd4b9',
    secondary: '#b72d42',
    border: '#b39855'
  },
  hanukkah: {
    accent: '#315c91',
    strong: '#234775',
    page: '#eff4ff',
    soft: '#c3d6ef',
    secondary: '#c5a350',
    border: '#99b1d0'
  },
  kwanzaa: {
    accent: '#2b6446',
    strong: '#982f32',
    page: '#faf0df',
    soft: '#c1d4ad',
    secondary: '#bc3a39',
    border: '#b99b65'
  },
  eid: {
    accent: '#256d65',
    strong: '#20564e',
    page: '#f0f5e8',
    soft: '#b8d7c7',
    secondary: '#bc9647',
    border: '#9fbaa3'
  },
  'eid-adha': {
    accent: '#776087',
    strong: '#594468',
    page: '#f6f0f8',
    soft: '#d3c3df',
    secondary: '#b99a51',
    border: '#b29bbf'
  },
  'dia-de-los-muertos': {
    accent: '#a75223',
    strong: '#4c2e55',
    page: '#fff4df',
    soft: '#efc184',
    secondary: '#df9530',
    border: '#c79a73'
  },
  halloween: {
    accent: '#69507f',
    strong: '#4b385f',
    page: '#f0e7f7',
    soft: '#d3bee5',
    secondary: '#ed9b42',
    border: '#e3d0bb'
  },
  valentines: {
    accent: '#90465e',
    strong: '#713449',
    page: '#fff0f4',
    soft: '#efbccc',
    secondary: '#cf6a89',
    border: '#e8d2dc'
  }
};

const iso = (year, month, day) =>
  `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
const nthWeekday = (year, month, weekday, n) =>
  iso(
    year,
    month,
    1 + ((weekday - new Date(Date.UTC(year, month - 1, 1)).getUTCDay() + 7) % 7) + (n - 1) * 7
  );
const lastMonday = (year, month) => {
  const end = new Date(Date.UTC(year, month, 0));
  return iso(year, month, end.getUTCDate() - ((end.getUTCDay() + 6) % 7));
};
// Federal calendar rules: OPM; fixed holidays use their actual date, not substitute office-closure days.
// Valentine's Day and Halloween are additional studio/community themes.
const holidayCache = new Map();
const hebrewFormat = new Intl.DateTimeFormat('en-US-u-ca-hebrew', {
  timeZone: 'UTC',
  month: 'long',
  day: 'numeric'
});
const islamicFormat = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', {
  timeZone: 'UTC',
  month: 'numeric',
  day: 'numeric'
});
// Hebrew dates are calculated, not fixed to a Gregorian month. Eid uses the
// Umm al-Qura planning calendar; local moon-sighting observance can differ.
// Sources: chabad.org/holidays/chanukah, islamic-relief.org.uk, kwanzaadc.org.
function lunarOccasions(year) {
  const result = [];
  for (let time = Date.UTC(year, 0, 1, 12); time < Date.UTC(year + 1, 0, 1, 12); time += 86400000) {
    const at = new Date(time),
      date = at.toISOString().slice(0, 10);
    const h = Object.fromEntries(hebrewFormat.formatToParts(at).map((p) => [p.type, p.value]));
    const i = Object.fromEntries(islamicFormat.formatToParts(at).map((p) => [p.type, p.value]));
    if (h.month === 'Kislev' && h.day === '25')
      result.push({
        id: 'hanukkah',
        label: 'Hanukkah',
        date: addDays(date, -1),
        endDate: addDays(date, 7),
        palette: 'hanukkah',
        symbol: '🕎',
        note: 'Begins at sundown; continues for eight nights.'
      });
    if (i.month === '10' && i.day === '1')
      result.push({
        id: 'eid-fitr',
        label: 'Eid al-Fitr',
        date,
        endDate: addDays(date, 2),
        palette: 'eid',
        symbol: '☾',
        note: 'Planning date; local moon-sighting observance may differ.'
      });
    if (i.month === '12' && i.day === '10')
      result.push({
        id: 'eid-adha',
        label: 'Eid al-Adha',
        date,
        endDate: addDays(date, 3),
        palette: 'eid-adha',
        symbol: '✦',
        note: 'Planning date; local moon-sighting observance may differ.'
      });
  }
  return result;
}
export function holidaysFor(year) {
  const cached = holidayCache.get(year);
  if (cached) return cached;
  const result = [
    ...lunarOccasions(year),
    { id: 'new-year', label: 'New Year’s Day', date: iso(year, 1, 1), palette: 'new-year', symbol: '✦' },
    {
      id: 'mlk',
      label: 'Martin Luther King Jr. Day',
      date: nthWeekday(year, 1, 1, 3),
      palette: 'mlk',
      symbol: '♡'
    },
    {
      id: 'valentines',
      label: 'Valentine’s Day',
      date: iso(year, 2, 14),
      palette: 'valentines',
      symbol: '♡'
    },
    {
      id: 'presidents',
      label: 'Presidents’ Day',
      date: nthWeekday(year, 2, 1, 3),
      palette: 'presidents',
      symbol: '★'
    },
    {
      id: 'memorial',
      label: 'Memorial Day',
      date: lastMonday(year, 5),
      palette: 'memorial',
      symbol: '✿'
    },
    {
      id: 'juneteenth',
      label: 'Juneteenth',
      date: iso(year, 6, 19),
      palette: 'juneteenth',
      symbol: '✦'
    },
    {
      id: 'independence',
      label: 'Independence Day',
      date: iso(year, 7, 4),
      palette: 'independence',
      symbol: '✳'
    },
    { id: 'labor', label: 'Labor Day', date: nthWeekday(year, 9, 1, 1), palette: 'labor', symbol: '✦' },
    {
      id: 'october-holiday',
      label: 'Indigenous Peoples’ Day',
      date: nthWeekday(year, 10, 1, 2),
      palette: 'indigenous',
      symbol: '❧'
    },
    { id: 'halloween', label: 'Halloween', date: iso(year, 10, 31), palette: 'halloween', symbol: '☾' },
    {
      id: 'dia-de-los-muertos',
      label: 'Día de los Muertos',
      date: iso(year, 11, 1),
      endDate: iso(year, 11, 2),
      palette: 'dia-de-los-muertos',
      symbol: '✿'
    },
    { id: 'veterans', label: 'Veterans Day', date: iso(year, 11, 11), palette: 'veterans', symbol: '★' },
    {
      id: 'thanksgiving',
      label: 'Thanksgiving',
      date: nthWeekday(year, 11, 4, 4),
      palette: 'harvest',
      symbol: '🦃'
    },
    { id: 'christmas', label: 'Christmas', date: iso(year, 12, 25), palette: 'christmas', symbol: '✧' },
    {
      id: 'kwanzaa',
      label: 'Kwanzaa',
      date: iso(year, 12, 26),
      endDate: iso(year, 12, 26),
      palette: 'kwanzaa',
      symbol: '✦'
    },
    { id: 'new-years-eve', label: 'New Year’s Eve', date: iso(year, 12, 31), endDate: iso(year, 12, 31), palette: 'new-year', symbol: '✦' }
  ];
  holidayCache.set(year, result);
  return result;
}
const formatters = new Map();
export const defaultZone = 'America/Chicago';

function localParts(at, timeZone) {
  if (!formatters.has(timeZone)) {
    formatters.set(
      timeZone,
      new Intl.DateTimeFormat('en-CA', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hourCycle: 'h23'
      })
    );
  }
  return Object.fromEntries(
    formatters
      .get(timeZone)
      .formatToParts(at)
      .map((p) => [p.type, p.value])
  );
}

export function localDate(at = new Date(), timeZone = defaultZone) {
  const p = localParts(at, timeZone);
  return [p.year, p.month, p.day].join('-');
}

export function localMidnight(date, timeZone = defaultZone) {
  const target = Date.parse(date + 'T00:00:00Z');
  let candidate = target;
  for (let attempt = 0; attempt < 4; attempt++) {
    const p = localParts(candidate, timeZone);
    const wallTime = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
    const correction = target - wallTime;
    if (!correction) break;
    candidate += correction;
  }
  return candidate;
}

export const holidayWindow = (date, timeZone = defaultZone) => ({
  start: localMidnight(addDays(date, -1), timeZone),
  end: localMidnight(addDays(date, 2), timeZone)
});
const occurrenceCache = new Map();
function windowsFor(year, timeZone) {
  const key = timeZone + '/' + year;
  if (!occurrenceCache.has(key)) {
    const windows = [year - 1, year, year + 1].flatMap(holidaysFor).map((holiday) => ({
      ...holiday,
      ...(holiday.endDate
        ? {
            start: localMidnight(holiday.date, timeZone),
            end: localMidnight(addDays(holiday.endDate, 1), timeZone)
          }
        : holidayWindow(holiday.date, timeZone))
    }));
    occurrenceCache.set(key, windows);
  }
  return occurrenceCache.get(key);
}
function isYearEndBreak(date) {
  const monthDay = date.slice(5);
  return monthDay >= '12-27' && monthDay <= '12-30';
}
export function themeFor(at = new Date(), preferredId = '', timeZone = defaultZone) {
  const date = localDate(at, timeZone),
    month = +date.slice(5, 7),
    year = +date.slice(0, 4);
  const season =
    month >= 3 && month <= 5
      ? 'spring'
      : month >= 6 && month <= 8
        ? 'summer'
        : month >= 9 && month <= 11
          ? 'autumn'
          : 'winter';
  const occurrences = windowsFor(year, timeZone);
  // The selected occasion wins when two observances overlap.
  const winterBreak = isYearEndBreak(date);
  const candidates = occurrences.filter((day) =>
    at.getTime() >= day.start && at.getTime() < day.end && (!winterBreak || day.id === preferredId)
  );
  const isObserved = (day) => date >= day.date && date <= (day.endDate || day.date);
  const activeOccasions = candidates.filter(isObserved);
  const holiday = candidates.sort(
    (a, b) =>
      Number(b.id === preferredId) - Number(a.id === preferredId) ||
      Number(b.date === date) - Number(a.date === date) ||
      Number(isObserved(b)) - Number(isObserved(a)) ||
      Math.abs(at.getTime() - localMidnight(a.date, timeZone)) -
        Math.abs(at.getTime() - localMidnight(b.date, timeZone))
  )[0];
  const nextChange = Math.min(
    localMidnight(addDays(date, 1), timeZone),
    ...occurrences.flatMap((day) => [day.start, day.end]).filter((time) => time > at.getTime())
  );
  return {
    id: holiday?.id || season,
    date,
    season,
    holiday,
    activeOccasions,
    palette: holiday ? holidayPalettes[holiday.palette] : seasonalPalettes[season],
    label: holiday?.label || seasonNames[season],
    symbol: holiday?.symbol || { spring: '❀', summer: '☀', autumn: '❧', winter: '❄' }[season],
    nextChange
  };
}

// Snap only after a pointer release: keyboard arrows keep their one-day precision.
export function occasionPoints(year) {
  const start = Date.UTC(year, 0, 1);
  return holidaysFor(year)
    .map((occasion) => ({
      ...occasion,
      day: Math.round((Date.parse(occasion.date + 'T00:00:00Z') - start) / 86400000)
    }))
    .sort((a, b) => a.day - b.day);
}
export function snapOccasionDay(year, day, radius = 3) {
  const last = (Date.UTC(year + 1, 0, 1) - Date.UTC(year, 0, 1)) / 86400000 - 1;
  const bounded = Math.max(0, Math.min(last, Math.round(day)));
  if (isYearEndBreak(addDays(iso(year, 1, 1), bounded))) return bounded;
  const nearest = occasionPoints(year).reduce((best, item) =>
    Math.abs(item.day - bounded) < Math.abs(best.day - bounded) ? item : best
  );
  return Math.abs(nearest.day - bounded) <= radius ? nearest.day : bounded;
}
export function adjacentOccasionDay(year, day, direction) {
  const points = occasionPoints(year);
  return direction === 1
    ? (points.find((point) => point.day > day)?.day ??
        (Date.UTC(year + 1, 0, 1) - Date.UTC(year, 0, 1)) / 86400000 - 1)
    : ([...points].reverse().find((point) => point.day < day)?.day ?? 0);
}
