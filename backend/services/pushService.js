const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

export async function kirimExpoPush(expoPushToken, pesan) {
  const response = await fetch(EXPO_PUSH_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: expoPushToken,
      sound: 'default',
      title: pesan.title,
      body: pesan.body,
      data: pesan.data || {},
    }),
    signal: AbortSignal.timeout(12000),
  });

  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error('Respons Expo Push Service bukan JSON yang valid');
  }

  if (!response.ok) {
    throw new Error(`Expo Push Service mengembalikan HTTP ${response.status}`);
  }
  const ticket = Array.isArray(result.data) ? result.data[0] : result.data;
  if (ticket?.status === 'error') {
    throw new Error(ticket.message || ticket.details?.error || 'Pengiriman push gagal');
  }
  return result;
}
