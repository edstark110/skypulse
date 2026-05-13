// Real, working booking handoff — Google Flights search URL.
export function bookingUrl(query) {
  const parts = [`Flights from ${query.from} to ${query.to}`, `on ${query.depart}`];
  if (query.tripType === 'round' && query.ret) parts.push(`returning ${query.ret}`);
  return 'https://www.google.com/travel/flights?q=' + encodeURIComponent(parts.join(' '));
}
