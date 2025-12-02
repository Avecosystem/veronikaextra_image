export default async function handler(request: Request) {
  const headers = {
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
    'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
    'Content-Type': 'application/json'
  };

  if (request.method === 'OPTIONS') {
    return new Response('', { status: 200, headers });
  }
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ message: 'Method Not Allowed' }), { status: 405, headers });
  }

  const appId = process.env.UPI_APP_ID;
  const secretKey = process.env.UPI_SECRET_KEY;
  if (!appId || !secretKey) {
    return new Response(JSON.stringify({ message: 'Server Configuration Error: UPI_APP_ID or UPI_SECRET_KEY missing.' }), { status: 500, headers });
  }

  try {
    const payload = await request.json();
    const orderId = payload.order_id || payload.orderId;
    if (!orderId) {
      return new Response(JSON.stringify({ message: 'Missing order_id in webhook.' }), { status: 400, headers });
    }

    const resp = await fetch(`https://api.cashfree.com/pg/orders/${encodeURIComponent(orderId)}`, {
      method: 'GET',
      headers: {
        'x-client-id': appId,
        'x-client-secret': secretKey,
        'x-api-version': '2022-01-01'
      }
    });
    const data = await resp.json();
    if (!resp.ok) {
      return new Response(JSON.stringify({ message: data.message || 'Failed to verify order', orderId }), { status: 500, headers });
    }

    const status = data.order_status;
    const verified = status === 'PAID' || status === 'SUCCESS';
    return new Response(JSON.stringify({ verified, status, orderId }), { status: 200, headers });
  } catch (e: any) {
    return new Response(JSON.stringify({ message: e?.message || 'Unexpected error' }), { status: 500, headers });
  }
}
