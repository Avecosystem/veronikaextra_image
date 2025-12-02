
import {createRequire as ___nfyCreateRequire} from "module";
import {fileURLToPath as ___nfyFileURLToPath} from "url";
import {dirname as ___nfyPathDirname} from "path";
let __filename=___nfyFileURLToPath(import.meta.url);
let __dirname=___nfyPathDirname(___nfyFileURLToPath(import.meta.url));
let require=___nfyCreateRequire(import.meta.url);


// netlify/functions/cashfree-webhook.ts
async function handler(request) {
  const headers = {
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,OPTIONS,PATCH,DELETE,POST,PUT",
    "Access-Control-Allow-Headers": "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
    "Content-Type": "application/json"
  };
  if (request.method === "OPTIONS") {
    return new Response("", { status: 200, headers });
  }
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ message: "Method Not Allowed" }), { status: 405, headers });
  }
  const appId = process.env.UPI_APP_ID;
  const secretKey = process.env.UPI_SECRET_KEY;
  if (!appId || !secretKey) {
    return new Response(JSON.stringify({ message: "Server Configuration Error: UPI_APP_ID or UPI_SECRET_KEY missing." }), { status: 500, headers });
  }
  try {
    const payload = await request.json();
    const orderId = payload.order_id || payload.orderId;
    if (!orderId) {
      return new Response(JSON.stringify({ message: "Missing order_id in webhook." }), { status: 400, headers });
    }
    const resp = await fetch(`https://api.cashfree.com/pg/orders/${encodeURIComponent(orderId)}`, {
      method: "GET",
      headers: {
        "x-client-id": appId,
        "x-client-secret": secretKey,
        "x-api-version": "2022-01-01"
      }
    });
    const data = await resp.json();
    if (!resp.ok) {
      return new Response(JSON.stringify({ message: data.message || "Failed to verify order", orderId }), { status: 500, headers });
    }
    const status = data.order_status;
    const verified = status === "PAID" || status === "SUCCESS";
    return new Response(JSON.stringify({ verified, status, orderId }), { status: 200, headers });
  } catch (e) {
    return new Response(JSON.stringify({ message: e?.message || "Unexpected error" }), { status: 500, headers });
  }
}
export {
  handler as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibmV0bGlmeS9mdW5jdGlvbnMvY2FzaGZyZWUtd2ViaG9vay50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiZXhwb3J0IGRlZmF1bHQgYXN5bmMgZnVuY3Rpb24gaGFuZGxlcihyZXF1ZXN0OiBSZXF1ZXN0KSB7XG4gIGNvbnN0IGhlYWRlcnMgPSB7XG4gICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LUNyZWRlbnRpYWxzJzogJ3RydWUnLFxuICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nOiAnKicsXG4gICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnOiAnR0VULE9QVElPTlMsUEFUQ0gsREVMRVRFLFBPU1QsUFVUJyxcbiAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycyc6ICdYLUNTUkYtVG9rZW4sIFgtUmVxdWVzdGVkLVdpdGgsIEFjY2VwdCwgQWNjZXB0LVZlcnNpb24sIENvbnRlbnQtTGVuZ3RoLCBDb250ZW50LU1ENSwgQ29udGVudC1UeXBlLCBEYXRlLCBYLUFwaS1WZXJzaW9uJyxcbiAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nXG4gIH07XG5cbiAgaWYgKHJlcXVlc3QubWV0aG9kID09PSAnT1BUSU9OUycpIHtcbiAgICByZXR1cm4gbmV3IFJlc3BvbnNlKCcnLCB7IHN0YXR1czogMjAwLCBoZWFkZXJzIH0pO1xuICB9XG4gIGlmIChyZXF1ZXN0Lm1ldGhvZCAhPT0gJ1BPU1QnKSB7XG4gICAgcmV0dXJuIG5ldyBSZXNwb25zZShKU09OLnN0cmluZ2lmeSh7IG1lc3NhZ2U6ICdNZXRob2QgTm90IEFsbG93ZWQnIH0pLCB7IHN0YXR1czogNDA1LCBoZWFkZXJzIH0pO1xuICB9XG5cbiAgY29uc3QgYXBwSWQgPSBwcm9jZXNzLmVudi5VUElfQVBQX0lEO1xuICBjb25zdCBzZWNyZXRLZXkgPSBwcm9jZXNzLmVudi5VUElfU0VDUkVUX0tFWTtcbiAgaWYgKCFhcHBJZCB8fCAhc2VjcmV0S2V5KSB7XG4gICAgcmV0dXJuIG5ldyBSZXNwb25zZShKU09OLnN0cmluZ2lmeSh7IG1lc3NhZ2U6ICdTZXJ2ZXIgQ29uZmlndXJhdGlvbiBFcnJvcjogVVBJX0FQUF9JRCBvciBVUElfU0VDUkVUX0tFWSBtaXNzaW5nLicgfSksIHsgc3RhdHVzOiA1MDAsIGhlYWRlcnMgfSk7XG4gIH1cblxuICB0cnkge1xuICAgIGNvbnN0IHBheWxvYWQgPSBhd2FpdCByZXF1ZXN0Lmpzb24oKTtcbiAgICBjb25zdCBvcmRlcklkID0gcGF5bG9hZC5vcmRlcl9pZCB8fCBwYXlsb2FkLm9yZGVySWQ7XG4gICAgaWYgKCFvcmRlcklkKSB7XG4gICAgICByZXR1cm4gbmV3IFJlc3BvbnNlKEpTT04uc3RyaW5naWZ5KHsgbWVzc2FnZTogJ01pc3Npbmcgb3JkZXJfaWQgaW4gd2ViaG9vay4nIH0pLCB7IHN0YXR1czogNDAwLCBoZWFkZXJzIH0pO1xuICAgIH1cblxuICAgIGNvbnN0IHJlc3AgPSBhd2FpdCBmZXRjaChgaHR0cHM6Ly9hcGkuY2FzaGZyZWUuY29tL3BnL29yZGVycy8ke2VuY29kZVVSSUNvbXBvbmVudChvcmRlcklkKX1gLCB7XG4gICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgaGVhZGVyczoge1xuICAgICAgICAneC1jbGllbnQtaWQnOiBhcHBJZCxcbiAgICAgICAgJ3gtY2xpZW50LXNlY3JldCc6IHNlY3JldEtleSxcbiAgICAgICAgJ3gtYXBpLXZlcnNpb24nOiAnMjAyMi0wMS0wMSdcbiAgICAgIH1cbiAgICB9KTtcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcC5qc29uKCk7XG4gICAgaWYgKCFyZXNwLm9rKSB7XG4gICAgICByZXR1cm4gbmV3IFJlc3BvbnNlKEpTT04uc3RyaW5naWZ5KHsgbWVzc2FnZTogZGF0YS5tZXNzYWdlIHx8ICdGYWlsZWQgdG8gdmVyaWZ5IG9yZGVyJywgb3JkZXJJZCB9KSwgeyBzdGF0dXM6IDUwMCwgaGVhZGVycyB9KTtcbiAgICB9XG5cbiAgICBjb25zdCBzdGF0dXMgPSBkYXRhLm9yZGVyX3N0YXR1cztcbiAgICBjb25zdCB2ZXJpZmllZCA9IHN0YXR1cyA9PT0gJ1BBSUQnIHx8IHN0YXR1cyA9PT0gJ1NVQ0NFU1MnO1xuICAgIHJldHVybiBuZXcgUmVzcG9uc2UoSlNPTi5zdHJpbmdpZnkoeyB2ZXJpZmllZCwgc3RhdHVzLCBvcmRlcklkIH0pLCB7IHN0YXR1czogMjAwLCBoZWFkZXJzIH0pO1xuICB9IGNhdGNoIChlOiBhbnkpIHtcbiAgICByZXR1cm4gbmV3IFJlc3BvbnNlKEpTT04uc3RyaW5naWZ5KHsgbWVzc2FnZTogZT8ubWVzc2FnZSB8fCAnVW5leHBlY3RlZCBlcnJvcicgfSksIHsgc3RhdHVzOiA1MDAsIGhlYWRlcnMgfSk7XG4gIH1cbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7QUFBQSxlQUFPLFFBQStCLFNBQWtCO0FBQ3RELFFBQU0sVUFBVTtBQUFBLElBQ2Qsb0NBQW9DO0FBQUEsSUFDcEMsK0JBQStCO0FBQUEsSUFDL0IsZ0NBQWdDO0FBQUEsSUFDaEMsZ0NBQWdDO0FBQUEsSUFDaEMsZ0JBQWdCO0FBQUEsRUFDbEI7QUFFQSxNQUFJLFFBQVEsV0FBVyxXQUFXO0FBQ2hDLFdBQU8sSUFBSSxTQUFTLElBQUksRUFBRSxRQUFRLEtBQUssUUFBUSxDQUFDO0FBQUEsRUFDbEQ7QUFDQSxNQUFJLFFBQVEsV0FBVyxRQUFRO0FBQzdCLFdBQU8sSUFBSSxTQUFTLEtBQUssVUFBVSxFQUFFLFNBQVMscUJBQXFCLENBQUMsR0FBRyxFQUFFLFFBQVEsS0FBSyxRQUFRLENBQUM7QUFBQSxFQUNqRztBQUVBLFFBQU0sUUFBUSxRQUFRLElBQUk7QUFDMUIsUUFBTSxZQUFZLFFBQVEsSUFBSTtBQUM5QixNQUFJLENBQUMsU0FBUyxDQUFDLFdBQVc7QUFDeEIsV0FBTyxJQUFJLFNBQVMsS0FBSyxVQUFVLEVBQUUsU0FBUyxvRUFBb0UsQ0FBQyxHQUFHLEVBQUUsUUFBUSxLQUFLLFFBQVEsQ0FBQztBQUFBLEVBQ2hKO0FBRUEsTUFBSTtBQUNGLFVBQU0sVUFBVSxNQUFNLFFBQVEsS0FBSztBQUNuQyxVQUFNLFVBQVUsUUFBUSxZQUFZLFFBQVE7QUFDNUMsUUFBSSxDQUFDLFNBQVM7QUFDWixhQUFPLElBQUksU0FBUyxLQUFLLFVBQVUsRUFBRSxTQUFTLCtCQUErQixDQUFDLEdBQUcsRUFBRSxRQUFRLEtBQUssUUFBUSxDQUFDO0FBQUEsSUFDM0c7QUFFQSxVQUFNLE9BQU8sTUFBTSxNQUFNLHNDQUFzQyxtQkFBbUIsT0FBTyxDQUFDLElBQUk7QUFBQSxNQUM1RixRQUFRO0FBQUEsTUFDUixTQUFTO0FBQUEsUUFDUCxlQUFlO0FBQUEsUUFDZixtQkFBbUI7QUFBQSxRQUNuQixpQkFBaUI7QUFBQSxNQUNuQjtBQUFBLElBQ0YsQ0FBQztBQUNELFVBQU0sT0FBTyxNQUFNLEtBQUssS0FBSztBQUM3QixRQUFJLENBQUMsS0FBSyxJQUFJO0FBQ1osYUFBTyxJQUFJLFNBQVMsS0FBSyxVQUFVLEVBQUUsU0FBUyxLQUFLLFdBQVcsMEJBQTBCLFFBQVEsQ0FBQyxHQUFHLEVBQUUsUUFBUSxLQUFLLFFBQVEsQ0FBQztBQUFBLElBQzlIO0FBRUEsVUFBTSxTQUFTLEtBQUs7QUFDcEIsVUFBTSxXQUFXLFdBQVcsVUFBVSxXQUFXO0FBQ2pELFdBQU8sSUFBSSxTQUFTLEtBQUssVUFBVSxFQUFFLFVBQVUsUUFBUSxRQUFRLENBQUMsR0FBRyxFQUFFLFFBQVEsS0FBSyxRQUFRLENBQUM7QUFBQSxFQUM3RixTQUFTLEdBQVE7QUFDZixXQUFPLElBQUksU0FBUyxLQUFLLFVBQVUsRUFBRSxTQUFTLEdBQUcsV0FBVyxtQkFBbUIsQ0FBQyxHQUFHLEVBQUUsUUFBUSxLQUFLLFFBQVEsQ0FBQztBQUFBLEVBQzdHO0FBQ0Y7IiwKICAibmFtZXMiOiBbXQp9Cg==
