export function formatFrozenDateline(date: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) throw new TypeError("Frozen dateline must be YYYY-MM-DD");
  const parsed = new Date(
    Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12),
  );
  const weekday = new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    weekday: "long",
  }).format(parsed).toUpperCase();
  const month = new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    month: "long",
  }).format(parsed).toUpperCase();
  return `${weekday} · ${parsed.getUTCDate()} ${month} ${parsed.getUTCFullYear()}`;
}
