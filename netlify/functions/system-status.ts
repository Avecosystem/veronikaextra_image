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

  const status = {
    imageApiKeyPresent: !!(process.env.NEW_API_KEY || process.env.API_KEY),
    imageEndpoint: process.env.API_ENDPOINT || 'https://api.a4f.co/v1/images/generations',
    providerModel: process.env.PROVIDER_MODEL || 'provider-4/imagen-3.5',
    oxapayMerchantPresent: !!process.env.OXAPAY_MERCHANT_ID,
    oxapayApiPresent: !!process.env.OXAPAY_API_ID,
    upiAppPresent: !!process.env.UPI_APP_ID,
    upiSecretPresent: !!process.env.UPI_SECRET_KEY,
    publicAppBaseUrl: process.env.PUBLIC_APP_BASE_URL || null
  };
  return new Response(JSON.stringify(status), { status: 200, headers });
}
