export default async function handler(request: Request) {
  const headers = {
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (request.method === 'OPTIONS') {
    return new Response('', { status: 200, headers });
  }
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ message: 'Method Not Allowed' }), { status: 405, headers });
  }

  const appId = process.env.UPI_APP_ID;
  const secretKey = process.env.UPI_SECRET_KEY;
  if (!appId || !secretKey) {
    return new Response(JSON.stringify({ message: 'Server Configuration Error: UPI_APP_ID or UPI_SECRET_KEY missing.' }), { status: 500, headers });
  }

  const url = new URL(request.url);
  const orderId = url.searchParams.get('orderId');
  if (!orderId) {
    return new Response(JSON.stringify({ message: 'Missing orderId' }), { status: 400, headers });
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

  return new Response(JSON.stringify({ orderId, status: data.order_status }), { status: 200, headers });
}
