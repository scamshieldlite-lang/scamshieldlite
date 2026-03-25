export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function isExpired(date: Date): boolean {
  return date < new Date();
}

export function nowPlusDays(days: number): Date {
  return addDays(new Date(), days);
}
