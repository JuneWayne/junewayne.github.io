// Calendar age from April 19, 2022, midnight in Eastern Time, for every visitor.
const easternClock = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/New_York', year: 'numeric', month: 'numeric', day: 'numeric',
  hour: 'numeric', minute: 'numeric', second: 'numeric', hourCycle: 'h23',
});

export function laylaAge(now = new Date()) {
  const parts = Object.fromEntries(easternClock.formatToParts(now)
    .filter(({ type }) => type !== 'literal').map(({ type, value }) => [type, Number(value)]));
  const months = Math.max(0, (parts.year - 2022) * 12 + parts.month - 4 - (parts.day < 19 ? 1 : 0));
  const anniversary = Date.UTC(2022, 3 + months, 19);
  const days = Math.max(0, Math.floor((Date.UTC(parts.year, parts.month - 1, parts.day) - anniversary) / 86400000));
  const values = [Math.floor(months / 12), months % 12, days, parts.hour, parts.minute, parts.second];
  const units = ['year', 'month', 'day', 'hour', 'minute', 'second'];
  return values.map((value, i) => `${value} ${units[i]}${value === 1 ? '' : 's'}`)
    .map((text, i) => i === 5 ? `and ${text}` : text).join(', ');
}

export function startLaylaAge(node) {
  node.replaceChildren("Layla was adopted back in 2022; she’s now ");
  const ticker = document.createElement('span');
  ticker.className = 'cat-age';
  // Keep the text readable without making screen readers announce every second.
  ticker.setAttribute('aria-live', 'off');
  node.append(ticker, ' old.');
  const update = () => { ticker.textContent = laylaAge(); };
  update();
  const timer = setInterval(update, 1000);
  document.addEventListener('visibilitychange', update);
  return () => {
    clearInterval(timer);
    document.removeEventListener('visibilitychange', update);
  };
}
