import { getAuth } from 'firebase/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const withAuthHeaders = async (headers = {}) => {
  const user = getAuth().currentUser;
  if (!user) {
    throw new Error('You are not authenticated.');
  }

  const token = await user.getIdToken();
  return {
    Authorization: `Bearer ${token}`,
    ...headers,
  };
};

const parseJsonSafe = async (response) => {
  try {
    return await response.json();
  } catch (error) {
    return null;
  }
};

const request = async (path, options = {}) => {
  const headers = await withAuthHeaders({
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers || {}),
  });

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  const payload = await parseJsonSafe(response);

  if (!response.ok) {
    const message = payload?.message || `Request failed with status ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
};

export const listTaskBundles = async () => request('/api/task-bundles');

export const createTaskBundle = async (body) =>
  request('/api/task-bundles', {
    method: 'POST',
    body: JSON.stringify(body),
  });

export const updateTaskBundle = async (bundleId, body) =>
  request(`/api/task-bundles/${bundleId}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });

export const deleteTaskBundle = async (bundleId) =>
  request(`/api/task-bundles/${bundleId}`, {
    method: 'DELETE',
  });

export const listTaskBundleItems = async (bundleId) =>
  request(`/api/task-bundles/${bundleId}/items`);

export const createTaskBundleItem = async (bundleId, body) =>
  request(`/api/task-bundles/${bundleId}/items`, {
    method: 'POST',
    body: JSON.stringify(body),
  });

export const updateTaskBundleItem = async (bundleId, itemId, body) =>
  request(`/api/task-bundles/${bundleId}/items/${itemId}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });

export const deleteTaskBundleItem = async (bundleId, itemId) =>
  request(`/api/task-bundles/${bundleId}/items/${itemId}`, {
    method: 'DELETE',
  });

export const importTaskBundleToDeliverable = async (deliverableId, body) =>
  request(`/api/deliverables/${deliverableId}/import-task-bundle`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
