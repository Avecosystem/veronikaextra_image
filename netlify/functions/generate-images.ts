import { formatApiError } from '../../utils/apiUtils';
import prisma from '../../lib/prisma';
import jwt from 'jsonwebtoken';

export default async function handler(request: Request, context: any) {
    const headers = {
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
        'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
        'Content-Type': 'application/json'
    };

    if (request.method === 'OPTIONS') {
        return new Response('', { status: 200, headers });
    }

    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ message: 'Method Not Allowed' }), { status: 405, headers });
    }

    // Validate API Key from Server Environment
    const apiKey = process.env.NEW_API_KEY || process.env.API_KEY;
    const model = process.env.PROVIDER_MODEL || "provider-4/imagen-3.5";

    console.log("🔍 Environment variables check:");
    console.log("  NEW_API_KEY:", process.env.NEW_API_KEY ? 'Set' : 'Not set');

    if (!apiKey) {
        console.error("CRITICAL: API_KEY missing in server environment.");
        return new Response(JSON.stringify({
            message: 'Server Configuration Error: API Key is missing.'
        }), { status: 500, headers });
    }

    try {
        // AUTHENTICATION & CREDIT CHECK
        const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return new Response(JSON.stringify({ message: 'Unauthorized: Login required' }), { status: 401, headers });
        }

        const token = authHeader.split(' ')[1];
        let userId: number;

        try {
            const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'super-secret-key');
            userId = decoded.userId;
        } catch (e) {
            return new Response(JSON.stringify({ message: 'Unauthorized: Invalid token' }), { status: 401, headers });
        }

        const bodyData = await request.json().catch(() => null);
        if (!bodyData) {
            return new Response(JSON.stringify({ message: 'Invalid request body' }), { status: 400, headers });
        }

        const { prompt, numberOfImages = 1 } = bodyData;
        const validImageCount = Math.max(1, Math.min(6, numberOfImages));
        const COST_PER_IMAGE = 5;
        const totalCost = validImageCount * COST_PER_IMAGE;

        // Check user credits
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return new Response(JSON.stringify({ message: 'User not found' }), { status: 404, headers });
        }

        if (user.credits < totalCost) {
            return new Response(JSON.stringify({
                message: `Insufficient credits. Required: ${totalCost}, Available: ${user.credits}`,
                required: totalCost,
                available: user.credits
            }), { status: 403, headers });
        }

        // Deduct credits
        await prisma.user.update({
            where: { id: userId },
            data: { credits: { decrement: totalCost } }
        });

        // Log credit usage
        await prisma.creditHistory.create({
            data: {
                userId,
                amount: totalCost,
                type: 'deducted',
                description: `Generated ${validImageCount} image(s)`
            }
        });

        if (!prompt) {
            return new Response(JSON.stringify({ message: 'Prompt is required' }), { status: 400, headers });
        }

        const apiUrl = process.env.API_ENDPOINT || "https://api.a4f.co/v1/images/generations";
        console.log(`🎨 Generating ${validImageCount} images for user ${userId} (Cost: ${totalCost} credits)`);

        // Prepare the request payload
        const payload = {
            model: model,
            prompt: prompt,
            n: 1,
            size: "1024x1024"
        };

        console.log('📤 Sending payload:', JSON.stringify(payload, null, 2));

        // Create an array of promises for parallel execution
        const imagePromises = Array.from({ length: validImageCount }, async (_, i) => {
            try {
                console.log(`🔐 Generating image ${i + 1} of ${validImageCount}`);

                const apiHeaders = {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                };

                const response = await fetchWithTimeout(apiUrl, {
                    method: 'POST',
                    headers: apiHeaders,
                    body: JSON.stringify(payload)
                }, 25000);

                if (!response.ok) {
                    let errorMessage = `HTTP Error: ${response.status} ${response.statusText}`;
                    try {
                        const errorData = await response.json();
                        errorMessage = errorData.error?.message || errorData.message || errorMessage;
                        console.error(`Full API error response for image ${i + 1}:`, errorData);
                    } catch (e) {
                        console.error("Could not parse error response:", e);
                    }
                    throw new Error(`Error generating image ${i + 1}: ${errorMessage}`);
                }

                console.log(`✅ Image ${i + 1} generated successfully`);
                const data = await response.json();
                console.log(`🔎 API raw response for image ${i + 1}:`, JSON.stringify(data));

                if (data && data.data && Array.isArray(data.data) && data.data.length > 0) {
                    const item = data.data[0];
                    return {
                        id: `img-${Date.now()}-${i}`,
                        url: item.url || item.b64_json,
                        prompt: prompt
                    };
                }
                if (data && data.image && (data.image.url || data.image.b64_json)) {
                    return {
                        id: `img-${Date.now()}-${i}`,
                        url: data.image.url || data.image.b64_json,
                        prompt: prompt
                    };
                }
                if (data && data.url) {
                    return {
                        id: `img-${Date.now()}-${i}`,
                        url: data.url,
                        prompt: prompt
                    };
                }
                if (data && data.images && Array.isArray(data.images) && data.images.length > 0) {
                    const item = data.images[0];
                    return {
                        id: `img-${Date.now()}-${i}`,
                        url: item.url || item.b64_json || item,
                        prompt: prompt
                    };
                }
                return null;
            } catch (error: any) {
                console.error(`Failed to generate image ${i + 1}:`, error.message);
                return null;
            }
        });

        // Wait for all images to complete
        const results = await Promise.all(imagePromises);
        const images = results.filter(img => img !== null);

        if (images.length === 0) {
            throw new Error("No images generated. Please try a different prompt.");
        }

        return new Response(JSON.stringify({ images }), { status: 200, headers });

    } catch (error: any) {
        console.error("Backend Generation Error:", error);
        const formattedError = formatApiError(error);

        console.error("Debug Info:");
        console.error("  - API Key Present:", !!apiKey);
        console.error("  - Model:", model);
        console.error("  - Endpoint:", process.env.API_ENDPOINT || "https://api.a4f.co/v1/images/generations");

        return new Response(JSON.stringify({
            message: formattedError,
            debugInfo: {
                apiKeyPresent: !!apiKey,
                model: model,
                endpoint: process.env.API_ENDPOINT || "https://api.a4f.co/v1/images/generations"
            }
        }), { status: 500, headers });
    }
}

// Helper function with timeout
async function fetchWithTimeout(url: string, options: any, timeoutMs: number = 30000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}
