import {
  themeFor,
  localDate,
  localMidnight,
  defaultZone,
  occasionPoints,
  snapOccasionDay,
  adjacentOccasionDay
} from './calendar.js';
import { createWeatherEffects } from './effects.js';
import { readWeather, fresh } from './weather.js';

const asset = (name) => new URL(name, import.meta.url).href;
const dayMs = 86_400_000;
const weatherLabels = {
  off: 'Off',
  sun: 'Sun',
  rain: 'Rain',
  snow: 'Snow',
  wind: 'Wind',
  storm: 'Thunderstorm',
  blizzard: 'Blizzard'
};
const dayLabel = new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeZone: 'UTC' });
const monthLabel = new Intl.DateTimeFormat('en-US', { month: 'short', timeZone: 'UTC' });
const dateAt = (year, day) => new Date(Date.UTC(year, 0, 1) + day * dayMs);
const iso = (date) => date.toISOString().slice(0, 10);

export function applyTheme(target, theme) {
  target.dataset.season = theme.season;
  target.dataset.occasion = theme.holiday?.id || '';
  for (const [name, value] of Object.entries(theme.palette)) {
    target.style.setProperty('--season-' + name, value);
  }
}

const template = document.createElement('template');
template.innerHTML = `
  <link rel="stylesheet" href="${asset('./timeline.css')}">
  <link rel="stylesheet" href="${asset('./weather-effects.css')}">
  <details>
    <summary><svg viewBox="0 0 24 24" aria-hidden="true"><use></use></svg><span>Season timeline</span><strong id="brief"></strong></summary>
    <div class="controls">
      <div class="date"><output id="date"></output><button id="today" type="button">Back to today</button></div>
      <label for="day">Preview a date</label><input id="day" type="range" min="0" max="364">
      <div class="ticks" aria-hidden="true"></div><div class="months" aria-label="Jump to month"></div>
      <div class="pickers"><label>Year <select id="year"></select></label><label>Occasion <select id="occasion"></select></label></div>
      <fieldset><legend>Weather effects</legend><div id="weather"></div></fieldset>
      <p id="status" role="status"></p>
      <small id="attribution" hidden>Weather from <a href="https://www.weather.gov/">NWS</a> and <a href="https://open-meteo.com/">Open-Meteo</a>.</small>
    </div>
  </details>
  <div class="atmosphere" aria-hidden="true"></div>`;

function rememberStyles(target) {
  const properties = ['page', 'accent', 'strong', 'soft', 'secondary', 'border'].map(
    (name) => '--season-' + name
  );
  const previous = properties.map((name) => [
    name,
    target.style.getPropertyValue(name),
    target.style.getPropertyPriority(name)
  ]);
  const attributes = ['data-season', 'data-occasion'].map((name) => [name, target.getAttribute(name)]);
  return () => {
    for (const [name, value, priority] of previous) target.style.setProperty(name, value, priority);
    for (const [name, value] of attributes) {
      if (value === null) target.removeAttribute(name);
      else target.setAttribute(name, value);
    }
  };
}

export class SeasonTimeline extends HTMLElement {
  connectedCallback() {
    const view = this.shadowRoot || this.attachShadow({ mode: 'open' });
    view.replaceChildren(template.content.cloneNode(true));
    const get = (id) => view.getElementById(id);
    const target = this.hasAttribute('page-theme') ? document.documentElement : this;
    const restore = rememberStyles(target);
    const zone = this.getAttribute('time-zone') || defaultZone;
    const hasLive = this.hasAttribute('live-weather');
    const hasCoords = this.hasAttribute('latitude') && this.hasAttribute('longitude');
    const location = {
      latitude: hasCoords ? Number(this.getAttribute('latitude')) : 41.88,
      longitude: hasCoords ? Number(this.getAttribute('longitude')) : -87.63,
      station: this.getAttribute('station') ?? (hasCoords ? '' : 'KMDW')
    };
    const signalController = new AbortController();
    const { signal } = signalController;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const atmosphere = createWeatherEffects(view.querySelector('.atmosphere'));
    const years = get('year'),
      range = get('day'),
      occasions = get('occasion');
    const choices = hasLive ? { live: 'Live weather', ...weatherLabels } : weatherLabels;
    const defaultWeather = hasLive ? 'live' : 'off';
    const storage = this.getAttribute('storage-key');
    let today = localDate(new Date(), zone);
    let date = '',
      preferred = '',
      mode = defaultWeather,
      observation = null;
    let lastYear = 0,
      themeKey = '',
      boundaryTimer,
      lastFetch = 0,
      pending = false;

    function readPreview() {
      try {
        const saved = storage && JSON.parse(sessionStorage.getItem(storage));
        if (saved?.today !== today) return;
        const dt = new Date(saved.date + 'T12:00:00Z');
        if (Number.isFinite(+dt) && iso(dt) === saved.date) date = saved.date;
        if (typeof saved.preferred === 'string') preferred = saved.preferred;
        if (Object.hasOwn(choices, saved.mode)) mode = saved.mode;
      } catch {
        /* Storage is optional. */
      }
    }
    function save() {
      if (!storage) return;
      try {
        if (!date && mode === defaultWeather) sessionStorage.removeItem(storage);
        else sessionStorage.setItem(storage, JSON.stringify({ today, date, preferred, mode }));
      } catch {
        /* Storage is optional. */
      }
    }
    function preview(dateString, occasion = '') {
      date = dateString;
      preferred = occasion;
      save();
      render();
    }
    function jump(day) {
      preview(iso(dateAt(Number(years.value), day)));
    }
    function fillYear(year) {
      lastYear = year;
      const days = (Date.UTC(year + 1, 0, 1) - Date.UTC(year, 0, 1)) / dayMs;
      range.max = days - 1;
      occasions.replaceChildren(new Option('Choose an occasion', ''));
      const ticks = view.querySelector('.ticks');
      ticks.replaceChildren();
      for (const point of occasionPoints(year)) {
        if (point.day < 0 || point.day >= days) continue;
        occasions.add(
          new Option(
            point.label + ' · ' + dayLabel.format(dateAt(year, point.day)),
            point.id + '|' + point.date
          )
        );
        const tick = document.createElement('i');
        tick.style.left = (100 * point.day) / (days - 1) + '%';
        ticks.append(tick);
      }
    }
    function renderWeather() {
      const live = observation && fresh(observation.stamp) ? observation : null;
      const show = mode === 'live' ? live : mode === 'off' ? null : { kind: mode, night: false };
      atmosphere.show(show, mode !== 'live');
      for (const b of get('weather').children) b.setAttribute('aria-pressed', String(b.value === mode));
      let status = mode === 'off' ? 'Weather effects off.' : weatherLabels[mode] + ' preview.';
      if (mode === 'live') {
        if (live)
          status = [
            live.source,
            weatherLabels[live.kind] || live.kind,
            live.temp == null ? '' : live.temp + '°F'
          ]
            .filter(Boolean)
            .join(' · ');
        else
          status = pending
            ? 'Checking live weather…'
            : 'Live weather unavailable. Previews are available.';
      }
      get('status').textContent = status + (motion.matches ? ' Reduced motion is on.' : '');
    }
    async function refreshWeather() {
      if (!hasLive || mode !== 'live' || document.hidden || pending || Date.now() - lastFetch < 600_000)
        return;
      pending = true;
      lastFetch = Date.now();
      renderWeather();
      const next = await readWeather({ ...location, signal });
      if (signal.aborted) return;
      if (next) observation = next;
      pending = false;
      renderWeather();
    }
    const render = () => {
      const now = new Date(),
        liveDate = localDate(now, zone);
      if (liveDate !== today) {
        today = liveDate;
        date = preferred = '';
        mode = defaultWeather;
        save();
      }
      const yearNow = Number(today.slice(0, 4));
      if (years.options[0]?.value !== String(yearNow - 1)) {
        years.replaceChildren();
        for (let y = yearNow - 1; y <= yearNow + 5; y++) years.add(new Option(y, y));
      }
      const live = themeFor(now, '', zone);
      const theme = date
        ? themeFor(new Date(localMidnight(date, zone) + dayMs / 2), preferred, zone)
        : live;
      clearTimeout(boundaryTimer);
      boundaryTimer = setTimeout(render, Math.max(50, live.nextChange - Date.now() + 30));
      const key = [theme.date, theme.id, date, preferred].join('|');
      if (themeKey !== key) {
        themeKey = key;
        applyTheme(target, theme);
        view.querySelector('details').dataset.occasion = theme.holiday?.id || '';
        const year = Number(theme.date.slice(0, 4));
        if (lastYear !== year) fillYear(year);
        years.value = year;
        range.value = (Date.parse(theme.date + 'T00:00:00Z') - Date.UTC(year, 0, 1)) / dayMs;
        const label = dayLabel.format(dateAt(year, +range.value));
        range.setAttribute('aria-valuetext', label + ' · ' + theme.label);
        get('brief').textContent = [
          theme.label,
          ...theme.activeOccasions.filter((x) => x.id !== theme.id).map((x) => x.label)
        ].join(' · ');
        get('date').textContent = (date ? 'Preview · ' : 'Today · ') + label;
        occasions.value = theme.holiday ? theme.id + '|' + theme.holiday.date : '';
        view.querySelector('use').setAttribute('href', asset('./calendar-marks.svg#' + theme.id));
        this.dispatchEvent(
          new CustomEvent('season-change', { bubbles: true, composed: true, detail: theme })
        );
      }
      renderWeather();
      refreshWeather();
    };

    for (let month = 0; month < 12; month++) {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = monthLabel.format(new Date(Date.UTC(2024, month)));
      b.onclick = () => preview(iso(new Date(Date.UTC(+years.value, month, 1))));
      view.querySelector('.months').append(b);
    }
    for (const [kind, label] of Object.entries(choices)) {
      const b = document.createElement('button');
      b.type = 'button';
      b.value = kind;
      b.textContent = label;
      b.onclick = () => {
        mode = kind;
        save();
        render();
      };
      get('weather').append(b);
    }
    range.oninput = () => jump(+range.value);
    range.onpointerup = () => jump(snapOccasionDay(+years.value, +range.value));
    range.onkeydown = (e) => {
      if (e.key !== 'PageUp' && e.key !== 'PageDown') return;
      e.preventDefault();
      jump(adjacentOccasionDay(+years.value, +range.value, e.key === 'PageUp' ? 1 : -1));
    };
    occasions.onchange = () => {
      if (occasions.value) {
        const [id, day] = occasions.value.split('|');
        preview(day, id);
      }
    };
    years.onchange = () => {
      const selected = (date || today).split('-').map(Number);
      const y = +years.value,
        m = selected[1],
        d = Math.min(selected[2], new Date(Date.UTC(y, m, 0)).getUTCDate());
      preview(iso(new Date(Date.UTC(y, m - 1, d))));
    };
    get('today').onclick = () => {
      mode = defaultWeather;
      preview('');
    };
    get('attribution').hidden = !hasLive;
    view.querySelector('details').open = this.hasAttribute('open');
    motion.addEventListener('change', renderWeather, { signal });
    document.addEventListener('visibilitychange', render, { signal });
    window.addEventListener('pageshow', render, { signal });
    const clock = setInterval(() => {
      if (!document.hidden) render();
    }, 60_000);
    this.dispose = () => {
      signalController.abort();
      clearTimeout(boundaryTimer);
      clearInterval(clock);
      atmosphere.clear();
      restore();
    };
    readPreview();
    render();
  }

  disconnectedCallback() {
    this.dispose?.();
  }
}

if (!customElements.get('season-timeline')) customElements.define('season-timeline', SeasonTimeline);
