import axios from './axios-customize';

/**
 * Module News
 */

// ===== PUBLIC ENDPOINTS =====

/**
 * Get all news with pagination, filter, and sort
 * @param {string} query - Query string (e.g., "page=0&size=10&sort=publishedAt,desc")
 */
export const callFetchNews = (query) => {
  return axios.get(`/news?${query}`);
};

/**
 * Get published news only
 */
export const callFetchPublishedNews = () => {
  return axios.get('/news/published');
};

/**
 * Get featured news
 */
export const callFetchFeaturedNews = () => {
  return axios.get('/news/featured');
};

/**
 * Get news by slug (increments view counter)
 * @param {string} slug - News slug
 */
export const callFetchNewsBySlug = (slug) => {
  return axios.get(`/news/slug/${slug}`);
};

/**
 * Get news by ID
 * @param {number} id - News ID
 */
export const callFetchNewsById = (id) => {
  return axios.get(`/news/${id}`);
};

/**
 * Get all news categories
 */
export const callGetNewsCategories = () => {
  return axios.get('/news/categories');
};

/**
 * Get news by category
 * @param {string} category - Category name (e.g., "VACCINE_INFO", "CHILDREN_HEALTH")
 */
export const callFetchNewsByCategory = (category) => {
  return axios.get(`/news/category/${category}`);
};

// ===== ADMIN ENDPOINTS (Require Authentication) =====

/**
 * Create new news article
 * @param {Object} data - News data
 * @param {string} data.title - Title (required)
 * @param {string} data.shortDescription - Short description (required)
 * @param {string} data.content - Full content (required)
 * @param {string} data.category - Category (required)
 * @param {string} data.author - Author name
 * @param {boolean} data.isFeatured - Is featured
 * @param {boolean} data.isPublished - Is published
 * @param {string} data.tags - Comma-separated tags
 * @param {string} data.source - Content source
 * @param {string} data.thumbnailImage - Thumbnail image URL
 * @param {string} data.coverImage - Cover image URL
 */
export const callCreateNews = (data) => {
  return axios.post('/news', data);
};

/**
 * Update news article
 * @param {number} id - News ID
 * @param {Object} data - News data to update
 */
export const callUpdateNews = (id, data) => {
  return axios.put(`/news/${id}`, data);
};

/**
 * Delete news article (soft delete)
 * @param {number} id - News ID
 */
export const callDeleteNews = (id) => {
  return axios.delete(`/news/${id}`);
};

/**
 * Publish news (change status from draft to published)
 * @param {number} id - News ID
 */
export const callPublishNews = (id) => {
  return axios.patch(`/news/${id}/publish`);
};

/**
 * Unpublish news (change status from published to draft)
 * @param {number} id - News ID
 */
export const callUnpublishNews = (id) => {
  return axios.patch(`/news/${id}/unpublish`);
};
