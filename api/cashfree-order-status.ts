export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'GET') { return res.status(405).json({ message: 'Method Not Allowed' }); }

  const appId = process.env.UPI_APP_ID;
  const secretKey = process.env.UPI_SECRET_KEY;
  if (!appId || !secretKey) { return res.status(500).json({ message: 'Server Configuration Error: UPI_APP_ID or UPI_SECRET_KEY missing.' }); }

  const orderId = req.query.orderId;
  if (!orderId) { return res.status(400).json({ message: 'Missing orderId' }); }

  const resp = await fetch(`https://api.cashfree.com/pg/orders/${encodeURIComponent(orderId)}`, {
    method: 'GET',
    headers: {
      'x-client-id': appId,
      'x-client-secret': secretKey,
      'x-api-version': '2022-01-01'
    }
  });
  const data = await resp.json();
  if (!resp.ok) { return res.status(500).json({ message: data.message || 'Failed to verify order', orderId }); }
  return res.status(200).json({ orderId, status: data.order_status });
}
