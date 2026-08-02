export function formatIndianPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  return digits.length > 5 ? `${digits.slice(0, 5)} ${digits.slice(5)}` : digits;
}
