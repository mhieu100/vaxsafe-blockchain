export const formatPrice = (value) => {
  if (typeof value !== 'number') return '0đ';
  return `${value.toLocaleString('vi-VN')}đ`;
};
