/**
 * Format a number as currency
 * @param amount - The amount to format
 * @param currencyCode - The currency code (e.g. USD, EUR, CHF)
 * @returns Formatted currency string
 */
export const formatCurrency = (
  amount: number,
  currencyCode = 'USD',
): string => {
  if (isNaN(amount)) return '';

  try {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch (error) {
    // Fallback if Intl.NumberFormat fails
    return `${amount.toLocaleString('de-CH')} ${currencyCode}`;
  }
};
