import { formatApiError } from '../../utils/apiUtils';
import { OXPAY_MERCHANT_ID as MERCHANT_CONST, OXPAY_API_ID as API_CONST, OXPAY_PAYMENT_URL_BASE } from '../../constants';

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

  const merchantId = process.env.OXAPAY_MERCHANT_ID || MERCHANT_CONST;
  const apiId = process.env.OXAPAY_API_ID || API_CONST;

  if (!merchantId) {
    return new Response(JSON.stringify({ message: 'Server Configuration Error: OXAPAY_MERCHANT_ID missing.' }), { status: 500, headers });
  }

  try {
    const bodyData = await request.json();
    const { orderId, credits, amount, returnUrl, email, name } = bodyData || {};

    if (!orderId || !credits || !amount || !returnUrl || !email) {
      return new Response(JSON.stringify({ message: 'Invalid request. Missing required fields.' }), { status: 400, headers });
    }

    const formattedAmount = Number(Number(amount).toFixed(2));

    const oxapayHeaders: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (apiId) {
      oxapayHeaders['general_api_key'] = apiId;
    }

    const oxapayRequest = fetch('https://api.oxapay.com/merchants/request', {
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
    const timeoutMs = 6000;
    const timeout = new Promise<Response>((resolve) => {
      setTimeout(() => {
        resolve(new Response(JSON.stringify({ timeout: true }), { status: 200 }));
      }, timeoutMs);
    });
    const response = await Promise.race([oxapayRequest, timeout]);
    const result = await response.json().catch(() => ({ timeout: true }));

    if (result.result === 100 && result.payLink) {
      return new Response(JSON.stringify({ payLink: result.payLink }), { status: 200, headers });
    }

    // Fallback to public payment page if API didn't return a specific payLink or timed out
    if (OXPAY_PAYMENT_URL_BASE) {
      return new Response(JSON.stringify({ payLink: OXPAY_PAYMENT_URL_BASE, message: result.message || 'Using fallback pay link' }), { status: 200, headers });
    }

    return new Response(JSON.stringify({ message: result.message || 'Payment Gateway Error' }), { status: 500, headers });
  } catch (error: any) {
    const formatted = formatApiError(error);
    return new Response(JSON.stringify({ message: formatted }), { status: 500, headers });
  }
}
