import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
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

    return res.status(200).json(status);
}
