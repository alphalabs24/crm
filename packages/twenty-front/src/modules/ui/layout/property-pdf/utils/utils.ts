/**
 * PDF Generator utility functions
 */

/**
 * Format feature names in a more readable way by replacing underscores with spaces,
 * converting to lowercase, and capitalizing the first letter of each word
 */
export const formatFeatureName = (feature: string): string => {
  return feature
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());
};

/**
 * Truncate text to a maximum number of characters
 * If text exceeds maxLength, it will be truncated and "..." will be appended
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) return text || '';
  return text.substring(0, maxLength) + '...';
};
