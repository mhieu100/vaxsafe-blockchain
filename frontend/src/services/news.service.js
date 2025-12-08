import apiClient from '../services/apiClient';

export const callFetchNews = (query) => {
  return apiClient.get(`/api/news?${query}`);
};

export const callFetchPublishedNews = () => {
  return apiClient.get('/api/news/published');
};

export const callFetchFeaturedNews = () => {
  return apiClient.get('/api/news/featured');
};

export const callFetchNewsBySlug = (slug) => {
  return apiClient.get(`/api/news/slug/${slug}`);
};

export const callFetchNewsById = (id) => {
  return apiClient.get(`/api/news/${id}`);
};

export const callGetNewsCategories = () => {
  return apiClient.get('/api/news/categories');
};

export const callFetchNewsByCategory = (category) => {
  return apiClient.get(`/api/news/category/${category}`);
};

export const callCreateNews = (data) => {
  return apiClient.post('/api/news', data);
};

export const callUpdateNews = (id, data) => {
  return apiClient.put(`/api/news/${id}`, data);
};

export const callDeleteNews = (id) => {
  return apiClient.delete(`/api/news/${id}`);
};

export const callPublishNews = (id) => {
  return apiClient.patch(`/api/news/${id}/publish`);
};

export const callUnpublishNews = (id) => {
  return apiClient.patch(`/api/news/${id}/unpublish`);
};
