/**
 * Get image source with fallback handling
 * @param {string|undefined|null} imageUrl - Image URL to process
 * @returns {string} Valid image URL or fallback
 */
export const getImageSrc = (imageUrl) => {
  // Return fallback if no image URL provided
  if (!imageUrl) {
    return getDefaultVaccineImage();
  }

  // Handle relative URLs
  if (imageUrl.startsWith('/')) {
    return imageUrl;
  }

  // Handle external URLs - check if they're valid
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // Handle base64 data URLs
  if (imageUrl.startsWith('data:')) {
    return imageUrl;
  }

  // Fallback for invalid URLs
  return getDefaultVaccineImage();
};

/**
 * Get default vaccine placeholder image (SVG base64)
 * @returns {string} Base64 encoded SVG image
 */
export const getDefaultVaccineImage = () => {
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmOGZhZmMiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNlMmU4ZjAiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2cpIi8+PGNpcmNsZSBjeD0iMTUwIiBjeT0iMTAwIiByPSI0MCIgZmlsbD0iIzM5OGVmNCIgb3BhY2l0eT0iMC4xIi8+PHRleHQgeD0iNTAlIiB5PSI0NSUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIzNiIgZmlsbD0iIzM5OGVmNCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+💉PC90ZXh0Pjx0ZXh0IHg9IjUwJSIgeT0iNjAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2MzY3NmQiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlZhY2NpbmUgSW1hZ2U8L3RleHQ+PC9zdmc+';
};

/**
 * Check if URL is a valid image
 * @param {string} url - URL to validate
 * @returns {Promise<boolean>} True if valid image URL
 */
export const isValidImageUrl = async (url) => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const contentType = response.headers.get('content-type');
    return (response.ok && contentType?.startsWith('image/')) || false;
  } catch {
    return false;
  }
};

/**
 * Preload image to check if it loads successfully
 * @param {string} src - Image source URL
 * @returns {Promise<boolean>} True if image loads successfully
 */
export const preloadImage = (src) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
  });
};

/**
 * Get enhanced image props for Ant Design Image component
 * @param {string|undefined|null} imageUrl - Image URL
 * @param {string} [alt='Image'] - Alt text for image
 * @returns {object} Image props object
 */
export const getImageProps = (imageUrl, alt = 'Image') => {
  const src = getImageSrc(imageUrl);

  return {
    src,
    alt,
    fallback: getDefaultVaccineImage(),
    placeholder: '💉 Loading...',
  };
};
