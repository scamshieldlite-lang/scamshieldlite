export function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}
export function isExpired(date) {
    return date < new Date();
}
export function nowPlusDays(days) {
    return addDays(new Date(), days);
}
//# sourceMappingURL=date.js.map