import dotenv from 'dotenv';
dotenv.config({ path: '.env.production' });

console.log('Environment Variables Test (.env.production):');
console.log('NEW_API_KEY:', process.env.NEW_API_KEY ? 'Present' : 'Missing');
console.log('API_KEY:', process.env.API_KEY ? 'Present' : 'Missing');
console.log('PROVIDER_MODEL:', process.env.PROVIDER_MODEL || 'Not set');
console.log('API_ENDPOINT:', process.env.API_ENDPOINT || 'Not set');