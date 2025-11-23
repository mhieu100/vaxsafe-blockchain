/**
 * Format price in Vietnamese currency
 * @param {number} value - Price value to format
 * @returns {string} Formatted price string with đ symbol
 */
export const formatPrice = (value) => {
  if (typeof value !== 'number') return '0đ';
  return `${value.toLocaleString('vi-VN')}đ`;
};
