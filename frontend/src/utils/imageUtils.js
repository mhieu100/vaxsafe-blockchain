export const getImageSrc = (imageUrl) => {
  if (!imageUrl) {
    return getDefaultVaccineImage();
  }

  if (imageUrl.startsWith('/')) {
    return imageUrl;
  }

  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  if (imageUrl.startsWith('data:')) {
    return imageUrl;
  }

  return getDefaultVaccineImage();
};

export const getDefaultVaccineImage = () => {
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmOGZhZmMiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNlMmU4ZjAiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2cpIi8+PGNpcmNsZSBjeD0iMTUwIiBjeT0iMTAwIiByPSI0MCIgZmlsbD0iIzM5OGVmNCIgb3BhY2l0eT0iMC4xIi8+PHRleHQgeD0iNTAlIiB5PSI0NSUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIzNiIgZmlsbD0iIzM5OGVmNCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+💉PC90ZXh0Pjx0ZXh0IHg9IjUwJSIgeT0iNjAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2MzY3NmQiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlZhY2NpbmUgSW1hZ2U8L3RleHQ+PC9zdmc+';
};

export const isValidImageUrl = async (url) => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const contentType = response.headers.get('content-type');
    return (response.ok && contentType?.startsWith('image/')) || false;
  } catch {
    return false;
  }
};

export const preloadImage = (src) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
  });
};

export const getImageProps = (imageUrl, alt = 'Image') => {
  const src = getImageSrc(imageUrl);

  return {
    src,
    alt,
    fallback: getDefaultVaccineImage(),
    placeholder: '💉 Loading...',
  };
};
