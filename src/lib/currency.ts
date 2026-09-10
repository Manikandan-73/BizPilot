/**
 * INR currency helpers for the onboarding flow.
 * Values are stored as plain numbers (rupees) in state/persistence;
 * these helpers only handle display formatting and input parsing.
 */

const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

/** Format a numeric rupee value as a localized INR string, e.g. 485000 -> "₹4,85,000" */
export function formatINR(value: number | undefined | null): string {
  if (value === undefined || value === null || Number.isNaN(value)) return '₹0';
  return inrFormatter.format(value);
}

/** Parse a currency input string back into a plain number (strips ₹, commas, spaces). */
export function parseCurrencyInput(raw: string): number {
  const cleaned = raw.replace(/[₹,\s]/g, '');
  const value = Number(cleaned);
  return Number.isNaN(value) ? 0 : value;
}