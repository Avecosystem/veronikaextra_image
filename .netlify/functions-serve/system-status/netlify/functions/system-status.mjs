
import {createRequire as ___nfyCreateRequire} from "module";
import {fileURLToPath as ___nfyFileURLToPath} from "url";
import {dirname as ___nfyPathDirname} from "path";
let __filename=___nfyFileURLToPath(import.meta.url);
let __dirname=___nfyPathDirname(___nfyFileURLToPath(import.meta.url));
let require=___nfyCreateRequire(import.meta.url);


// netlify/functions/system-status.ts
async function handler(request) {
  const headers = {
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };
  if (request.method === "OPTIONS") {
    return new Response("", { status: 200, headers });
  }
  if (request.method !== "GET") {
    return new Response(JSON.stringify({ message: "Method Not Allowed" }), { status: 405, headers });
  }
  const status = {
    imageApiKeyPresent: !!(process.env.NEW_API_KEY || process.env.API_KEY),
    imageEndpoint: process.env.API_ENDPOINT || "https://api.a4f.co/v1/images/generations",
    providerModel: process.env.PROVIDER_MODEL || "provider-4/imagen-3.5",
    oxapayMerchantPresent: !!process.env.OXAPAY_MERCHANT_ID,
    oxapayApiPresent: !!process.env.OXAPAY_API_ID,
    upiAppPresent: !!process.env.UPI_APP_ID,
    upiSecretPresent: !!process.env.UPI_SECRET_KEY,
    publicAppBaseUrl: process.env.PUBLIC_APP_BASE_URL || null
  };
  return new Response(JSON.stringify(status), { status: 200, headers });
}
export {
  handler as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibmV0bGlmeS9mdW5jdGlvbnMvc3lzdGVtLXN0YXR1cy50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiZXhwb3J0IGRlZmF1bHQgYXN5bmMgZnVuY3Rpb24gaGFuZGxlcihyZXF1ZXN0OiBSZXF1ZXN0KSB7XG4gIGNvbnN0IGhlYWRlcnMgPSB7XG4gICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LUNyZWRlbnRpYWxzJzogJ3RydWUnLFxuICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nOiAnKicsXG4gICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnOiAnR0VULE9QVElPTlMnLFxuICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJzogJ0NvbnRlbnQtVHlwZScsXG4gICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJ1xuICB9O1xuXG4gIGlmIChyZXF1ZXN0Lm1ldGhvZCA9PT0gJ09QVElPTlMnKSB7XG4gICAgcmV0dXJuIG5ldyBSZXNwb25zZSgnJywgeyBzdGF0dXM6IDIwMCwgaGVhZGVycyB9KTtcbiAgfVxuICBpZiAocmVxdWVzdC5tZXRob2QgIT09ICdHRVQnKSB7XG4gICAgcmV0dXJuIG5ldyBSZXNwb25zZShKU09OLnN0cmluZ2lmeSh7IG1lc3NhZ2U6ICdNZXRob2QgTm90IEFsbG93ZWQnIH0pLCB7IHN0YXR1czogNDA1LCBoZWFkZXJzIH0pO1xuICB9XG5cbiAgY29uc3Qgc3RhdHVzID0ge1xuICAgIGltYWdlQXBpS2V5UHJlc2VudDogISEocHJvY2Vzcy5lbnYuTkVXX0FQSV9LRVkgfHwgcHJvY2Vzcy5lbnYuQVBJX0tFWSksXG4gICAgaW1hZ2VFbmRwb2ludDogcHJvY2Vzcy5lbnYuQVBJX0VORFBPSU5UIHx8ICdodHRwczovL2FwaS5hNGYuY28vdjEvaW1hZ2VzL2dlbmVyYXRpb25zJyxcbiAgICBwcm92aWRlck1vZGVsOiBwcm9jZXNzLmVudi5QUk9WSURFUl9NT0RFTCB8fCAncHJvdmlkZXItNC9pbWFnZW4tMy41JyxcbiAgICBveGFwYXlNZXJjaGFudFByZXNlbnQ6ICEhcHJvY2Vzcy5lbnYuT1hBUEFZX01FUkNIQU5UX0lELFxuICAgIG94YXBheUFwaVByZXNlbnQ6ICEhcHJvY2Vzcy5lbnYuT1hBUEFZX0FQSV9JRCxcbiAgICB1cGlBcHBQcmVzZW50OiAhIXByb2Nlc3MuZW52LlVQSV9BUFBfSUQsXG4gICAgdXBpU2VjcmV0UHJlc2VudDogISFwcm9jZXNzLmVudi5VUElfU0VDUkVUX0tFWSxcbiAgICBwdWJsaWNBcHBCYXNlVXJsOiBwcm9jZXNzLmVudi5QVUJMSUNfQVBQX0JBU0VfVVJMIHx8IG51bGxcbiAgfTtcbiAgcmV0dXJuIG5ldyBSZXNwb25zZShKU09OLnN0cmluZ2lmeShzdGF0dXMpLCB7IHN0YXR1czogMjAwLCBoZWFkZXJzIH0pO1xufVxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7OztBQUFBLGVBQU8sUUFBK0IsU0FBa0I7QUFDdEQsUUFBTSxVQUFVO0FBQUEsSUFDZCxvQ0FBb0M7QUFBQSxJQUNwQywrQkFBK0I7QUFBQSxJQUMvQixnQ0FBZ0M7QUFBQSxJQUNoQyxnQ0FBZ0M7QUFBQSxJQUNoQyxnQkFBZ0I7QUFBQSxFQUNsQjtBQUVBLE1BQUksUUFBUSxXQUFXLFdBQVc7QUFDaEMsV0FBTyxJQUFJLFNBQVMsSUFBSSxFQUFFLFFBQVEsS0FBSyxRQUFRLENBQUM7QUFBQSxFQUNsRDtBQUNBLE1BQUksUUFBUSxXQUFXLE9BQU87QUFDNUIsV0FBTyxJQUFJLFNBQVMsS0FBSyxVQUFVLEVBQUUsU0FBUyxxQkFBcUIsQ0FBQyxHQUFHLEVBQUUsUUFBUSxLQUFLLFFBQVEsQ0FBQztBQUFBLEVBQ2pHO0FBRUEsUUFBTSxTQUFTO0FBQUEsSUFDYixvQkFBb0IsQ0FBQyxFQUFFLFFBQVEsSUFBSSxlQUFlLFFBQVEsSUFBSTtBQUFBLElBQzlELGVBQWUsUUFBUSxJQUFJLGdCQUFnQjtBQUFBLElBQzNDLGVBQWUsUUFBUSxJQUFJLGtCQUFrQjtBQUFBLElBQzdDLHVCQUF1QixDQUFDLENBQUMsUUFBUSxJQUFJO0FBQUEsSUFDckMsa0JBQWtCLENBQUMsQ0FBQyxRQUFRLElBQUk7QUFBQSxJQUNoQyxlQUFlLENBQUMsQ0FBQyxRQUFRLElBQUk7QUFBQSxJQUM3QixrQkFBa0IsQ0FBQyxDQUFDLFFBQVEsSUFBSTtBQUFBLElBQ2hDLGtCQUFrQixRQUFRLElBQUksdUJBQXVCO0FBQUEsRUFDdkQ7QUFDQSxTQUFPLElBQUksU0FBUyxLQUFLLFVBQVUsTUFBTSxHQUFHLEVBQUUsUUFBUSxLQUFLLFFBQVEsQ0FBQztBQUN0RTsiLAogICJuYW1lcyI6IFtdCn0K
