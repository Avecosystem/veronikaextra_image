export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers','X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { return res.status(405).json({ message: 'Method Not Allowed' }); }

  const appId = process.env.UPI_APP_ID;
  const secretKey = process.env.UPI_SECRET_KEY;
  if (!appId || !secretKey) { return res.status(500).json({ message: 'Server Configuration Error: UPI_APP_ID or UPI_SECRET_KEY missing.' }); }

  try {
    const payload = req.body || {};
    const orderId = payload.order_id || payload.orderId;
    if (!orderId) { return res.status(400).json({ message: 'Missing order_id in webhook.' }); }

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
    const status = data.order_status;
    const verified = status === 'PAID' || status === 'SUCCESS';
    return res.status(200).json({ verified, status, orderId });
  } catch (e: any) {
    return res.status(500).json({ message: e?.message || 'Unexpected error' });
  }
}
