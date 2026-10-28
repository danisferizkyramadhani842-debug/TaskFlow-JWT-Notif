import { apiFetch } from './api';

const authHeader = (token) => ({ Authorization: `Bearer ${token}` });

export async function getTasks(token) {
  const result = await apiFetch('/tasks', { headers: authHeader(token) });
  return result.data || [];
}

export function createTask(token, judul, deskripsi) {
  return apiFetch('/tasks', {
    method: 'POST',
    headers: authHeader(token),
    body: JSON.stringify({ judul, deskripsi }),
  });
}

export function updateTaskStatus(token, id, status) {
  return apiFetch(`/tasks/${id}/status`, {
    method: 'PATCH',
    headers: authHeader(token),
    body: JSON.stringify({ status }),
  });
}
