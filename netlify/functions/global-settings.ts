
import { promises as fs } from 'fs';
import { join } from 'path';

// Define the path to the global settings file
const SETTINGS_FILE_PATH = join(__dirname, '..', '..', 'data', 'global-settings.json');

// Ensure data directory exists
async function ensureDataDirectory() {
    try {
        const dataDir = join(__dirname, '..', '..', 'data');
        await fs.mkdir(dataDir, { recursive: true });
    } catch (error) {
        console.error('Error creating data directory:', error);
    }
}

// Load settings from file or initialize defaults
async function loadSettings() {
    try {
        await ensureDataDirectory();
        const data = await fs.readFile(SETTINGS_FILE_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // File doesn't exist or is invalid, return defaults
        return {
            globalNotice: '',
            creditsPageNotice: '',
            termsOfService: '',
            privacyPolicy: '',
            socialMediaLinks: {
                instagram: '',
                twitter: '',
                globe: '',
                chain: ''
            }
        };
    }
}

// Save settings to file
async function saveSettings(settings: any) {
    try {
        await ensureDataDirectory();
        await fs.writeFile(SETTINGS_FILE_PATH, JSON.stringify(settings, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving settings:', error);
        return false;
    }
}

export default async function handler(event: any, context: any) {
    // Set CORS headers
    const headers = {
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
        'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    // Load settings from file
    let settingsStore = await loadSettings();

    if (event.httpMethod === 'GET') {
        const { key } = event.queryStringParameters || {};
        if (key && settingsStore[key] !== undefined) {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ success: true, data: settingsStore[key] })
            };
        }
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true, data: settingsStore })
        };
    }

    if (event.httpMethod === 'POST') {
        try {
            // Handle the case where event.body might be a stream or undefined
            let bodyData;
            if (typeof event.body === 'string') {
                bodyData = JSON.parse(event.body);
            } else if (event.body && typeof event.body === 'object') {
                // If it's already parsed, use it directly
                bodyData = event.body;
            } else {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ success: false, message: 'Invalid request body' })
                };
            }
            
            const { key, value } = bodyData;

            if (!key) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ success: false, message: 'Key is required' })
                };
            }

            settingsStore[key] = value;
            
            // Save settings to file
            const saveSuccess = await saveSettings(settingsStore);
            
            if (!saveSuccess) {
                return {
                    statusCode: 500,
                    headers,
                    body: JSON.stringify({ success: false, message: 'Failed to save setting' })
                };
            }

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    data: value,
                    message: 'Setting updated successfully'
                })
            };
        } catch (error) {
            console.error('Error updating setting:', error);
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ success: false, message: 'Failed to update setting' })
            };
        }
    }

    return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ message: 'Method Not Allowed' })
    };
}



// Type definition for the settings store
interface SettingsStore {
    globalNotice: string;
    creditsPageNotice: string;
    termsOfService: string;
    privacyPolicy: string;
    socialMediaLinks: {
        instagram: string;
        twitter: string;
        globe: string;
        chain: string;
    };
    [key: string]: any;
}
