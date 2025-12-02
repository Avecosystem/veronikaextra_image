const https = require('https');

const apiKey = 'ddc-a4f-07842c4bb9ae4099b39833a26a4acf46';
const endpoint = 'https://api.a4f.co/v1/images/generations';

const payload = JSON.stringify({
    model: 'provider-4/imagen-3.5',
    prompt: 'A test image',
    n: 1,
    size: '1024x1024'
});

console.log('Testing API with:');
console.log('Endpoint:', endpoint);

const options = {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
    }
};

const req = https.request(endpoint, options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    let data = '';
    res.on('data', (d) => {
        data += d;
    });
    res.on('end', () => {
        try {
            const parsed = JSON.parse(data);
            console.log('Parsed Response:', JSON.stringify(parsed, null, 2));
        } catch (e) {
            console.log('Raw Response:', data);
        }
    });
});

req.on('error', (e) => {
    console.error('Error:', e);
});

req.write(payload);
req.end();
