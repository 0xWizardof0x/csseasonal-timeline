import { rainOnGlass, lightning } from './precipitation.js';

export function createWeatherEffects(layer) {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let momentTimer,
    repeatTimer,
    stopPrecipitation,
    effectKey = '';
  function addElement(parent, tag, className, styles = {}) {
    const el = document.createElement(tag);
    el.className = className;
    for (const [name, value] of Object.entries(styles)) el.style.setProperty(name, value);
    parent.append(el);
    return el;
  }
  function scheduleWeatherMoment(kind, preview) {
    clearTimeout(momentTimer);
    clearInterval(repeatTimer);
    if (kind !== 'wind' && kind !== 'storm') return;
    function attempt() {
      if (document.hidden || motion.matches) return;
      const moment = addElement(layer, 'div', 'weather-moment weather-moment-' + kind);
      if (kind === 'storm') {
        lightning(moment);
      } else {
        for (let i = 0; i < 3; i++)
          addElement(moment, 'span', 'weather-leaf', {
            top: 20 + i * 26 + '%',
            'animation-delay': i * 1.2 + 's'
          });
      }
      setTimeout(() => moment.remove(), kind === 'storm' ? 1150 : 14000);
    }
    momentTimer = setTimeout(attempt, preview ? 250 : 8000);
    repeatTimer = setInterval(attempt, kind === 'storm' ? (preview ? 15000 : 90000) : 300000);
  }
  function addSundogs(group) {
    const ns = 'http://www.w3.org/2000/svg';
    for (const edge of ['left', 'right']) {
      const dog = document.createElementNS(ns, 'svg');
      dog.setAttribute('viewBox', '0 0 400 360');
      dog.setAttribute('aria-hidden', 'true');
      dog.classList.add('sundog', 'sundog-' + edge);
      for (const part of ['bloom', 'fan', 'shaft', 'lower-ray', 'prism', 'core']) {
        const opticalLayer = document.createElementNS(ns, 'use');
        opticalLayer.setAttribute('href', new URL('./sundog.svg#' + part, import.meta.url).href);
        opticalLayer.classList.add('sundog-' + part);
        dog.append(opticalLayer);
      }
      group.append(dog);
    }
  }

  function show(weather, preview = false) {
    const active = weather && !motion.matches && !document.hidden;
    const key = active ? weather.kind + '-' + weather.night + '-' + preview : '';
    if (effectKey === key) return;
    effectKey = key;
    stopPrecipitation?.();
    stopPrecipitation = undefined;
    layer.replaceChildren();
    scheduleWeatherMoment(active ? weather.kind : null, preview);
    if (!active) return;
    const kind = weather.kind;
    const group = addElement(
      layer,
      'div',
      'weather-accents weather-' + kind + (weather.night ? ' weather-night' : '')
    );
    if (kind === 'sun') {
      if (weather.night) addElement(group, 'span', 'weather-orb');
      else addSundogs(group);
      return;
    }
    if (['rain', 'storm', 'snow', 'blizzard'].includes(kind)) {
      stopPrecipitation = rainOnGlass(group, kind);
      return;
    }
    const counts = { wind: 12, cloud: 3, fog: 3 };
    for (let i = 0; i < counts[kind]; i++) {
      const duration = 17 + (i % 5) * 3;
      const particle = addElement(group, 'i', kind === 'wind' && i >= 4 ? 'weather-dust' : '', {
        left: ((i * 37 + 7) % 100) + '%',
        top: ((i * 23 + 11) % 85) + '%',
        'animation-duration': duration + 's',
        'animation-delay': -((i * 0.618 + 0.19) % 1) * duration + 's',
        '--drift': 35 + (i % 5) * 19 + 'px',
        '--leaf-scale': (0.7 + (i % 4) * 0.16).toString()
      });
      if (kind === 'wind' && i < 4) addElement(particle, 'span', 'weather-leaf');
    }
  }
  return {
    show,
    clear() {
      show(null);
    }
  };
}
