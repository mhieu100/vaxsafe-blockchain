export const getColorStatus = (status) => {
  switch (status) {
    case 'PENDING':
      return 'magenta';
    case 'SCHEDULED':
      return 'processing';
    case 'CONFIRMED':
      return 'success';
    case 'CANCELLED':
      return 'error';
  }
};
