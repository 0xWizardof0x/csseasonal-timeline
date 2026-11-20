export function fresh(stamp) {
  const age = Date.now() - stamp;
  return Number.isFinite(age) && age >= -300000 && age < 10800000;
}
function parseNws(data) {
  const p = data.properties;
  if (!p || !fresh(Date.parse(p.timestamp))) return null;
  const text = (p.textDescription || '').toLowerCase();
  const kind = /blizzard/.test(text)
    ? 'blizzard'
    : /thunder|storm/.test(text)
      ? 'storm'
      : /snow|sleet|ice|freezing|hail/.test(text)
        ? 'snow'
        : /rain|drizzle|shower/.test(text)
          ? 'rain'
          : Math.max(p.windSpeed?.value || 0, p.windGust?.value || 0) >= 30
            ? 'wind'
            : /fog|mist|haze|smoke/.test(text)
              ? 'fog'
              : /cloud|overcast/.test(text)
                ? 'cloud'
                : /clear|fair|sun/.test(text)
                  ? 'sun'
                  : null;
  return kind
    ? {
        kind,
        stamp: Date.parse(p.timestamp),
        temp: Number.isFinite(p.temperature?.value)
          ? Math.round((p.temperature.value * 9) / 5 + 32)
          : null,
        night: (p.icon || '').includes('/night/'),
        source: 'National Weather Service'
      }
    : null;
}
function parseMeteo(data) {
  const p = data.current;
  if (!p || !fresh(p.time * 1000) || !Number.isFinite(p.weather_code)) return null;
  const c = p.weather_code;
  const kind =
    c >= 95
      ? 'storm'
      : [71, 73, 75, 77, 85, 86].includes(c)
        ? 'snow'
        : c >= 51
          ? 'rain'
          : p.wind_speed_10m >= 30
            ? 'wind'
            : c >= 45
              ? 'fog'
              : c > 1
                ? 'cloud'
                : 'sun';
  return {
    kind,
    stamp: p.time * 1000,
    temp: Number.isFinite(p.temperature_2m) ? Math.round(p.temperature_2m) : null,
    night: p.is_day === 0,
    source: 'Open-Meteo'
  };
}

// Coordinates belong to the host site. No visitor geolocation is requested.
export async function readWeather({ latitude, longitude, station, signal }) {
  const forecast = new URL('https://api.open-meteo.com/v1/forecast');
  forecast.search = new URLSearchParams({
    latitude,
    longitude,
    current: 'temperature_2m,weather_code,is_day,wind_speed_10m',
    temperature_unit: 'fahrenheit',
    wind_speed_unit: 'kmh',
    timeformat: 'unixtime'
  });
  const sources = [];
  if (station)
    sources.push([
      'https://api.weather.gov/stations/' + encodeURIComponent(station) + '/observations/latest',
      parseNws
    ]);
  sources.push([forecast, parseMeteo]);
  for (const [url, parse] of sources) {
    if (signal.aborted) return null;
    try {
      const response = await fetch(url, {
        signal: AbortSignal.any([signal, AbortSignal.timeout(6500)]),
        credentials: 'omit',
        referrerPolicy: 'no-referrer'
      });
      if (response.ok) {
        const observation = parse(await response.json());
        if (observation) return observation;
      }
    } catch {
      /* The date controls and manual weather previews work offline. */
    }
  }
  return null;
}
