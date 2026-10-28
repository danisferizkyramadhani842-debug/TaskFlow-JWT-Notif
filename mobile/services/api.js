const BASE_URL = (process.env.EXPO_PUBLIC_API_URL || '').replace(/\/$/, '');

export async function apiFetch(path, options = {}) {
  if (!BASE_URL) {
    throw new Error('EXPO_PUBLIC_API_URL belum diisi. Atur file mobile/.env dan restart Expo.');
  }

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
  } catch {
    throw new Error('API tidak dapat dijangkau. Periksa backend, IP laptop, Wi-Fi, dan firewall.');
  }

  let data = null;
  try {
    data = response.status === 204 ? null : await response.json();
  } catch {
    throw new Error('Respons API tidak valid.');
  }
  if (!response.ok) throw new Error(data?.pesan || `Request gagal (${response.status})`);
  return data;
}
