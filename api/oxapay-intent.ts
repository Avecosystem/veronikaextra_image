import { OXPAY_MERCHANT_ID as MERCHANT_CONST, OXPAY_API_ID as API_CONST, OXPAY_PAYMENT_URL_BASE } from '../constants';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers','X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { return res.status(405).json({ message: 'Method Not Allowed' }); }

  const merchantId = process.env.OXAPAY_MERCHANT_ID || MERCHANT_CONST;
  const apiId = process.env.OXAPAY_API_ID || API_CONST;
  if (!merchantId) { return res.status(500).json({ message: 'Server Configuration Error: OXAPAY_MERCHANT_ID missing.' }); }

  try {
    const { orderId, credits, amount, returnUrl, email, name } = req.body || {};
    if (!orderId || !credits || !amount || !returnUrl || !email) { return res.status(400).json({ message: 'Invalid request. Missing required fields.' }); }
    const formattedAmount = Number(Number(amount).toFixed(2));

    const oxapayHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
    if (apiId) { oxapayHeaders['general_api_key'] = apiId; }

    const resp = await fetch('https://api.oxapay.com/merchants/request', {
      method: 'POST',
      headers: oxapayHeaders,
      body: JSON.stringify({
        merchant: merchantId,
        amount: formattedAmount,
        currency: 'USD',
        lifeTime: 30,
        feePaidByPayer: 0,
        underPaidCover: 0,
        returnUrl,
        description: `Purchase ${credits} Credits - ${name || email}`,
        orderId,
        email
      })
    });
    const result = await resp.json();
    if (result.result === 100 && result.payLink) { return res.status(200).json({ payLink: result.payLink }); }
    if (OXPAY_PAYMENT_URL_BASE) { return res.status(200).json({ payLink: OXPAY_PAYMENT_URL_BASE, message: result.message || 'Using fallback pay link' }); }
    return res.status(500).json({ message: result.message || 'Payment Gateway Error' });
  } catch (e: any) {
    return res.status(500).json({ message: e?.message || 'Unexpected error' });
  }
}
