
import {createRequire as ___nfyCreateRequire} from "module";
import {fileURLToPath as ___nfyFileURLToPath} from "url";
import {dirname as ___nfyPathDirname} from "path";
let __filename=___nfyFileURLToPath(import.meta.url);
let __dirname=___nfyPathDirname(___nfyFileURLToPath(import.meta.url));
let require=___nfyCreateRequire(import.meta.url);


// netlify/functions/cashfree-order-status.ts
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
  const appId = process.env.UPI_APP_ID;
  const secretKey = process.env.UPI_SECRET_KEY;
  if (!appId || !secretKey) {
    return new Response(JSON.stringify({ message: "Server Configuration Error: UPI_APP_ID or UPI_SECRET_KEY missing." }), { status: 500, headers });
  }
  const url = new URL(request.url);
  const orderId = url.searchParams.get("orderId");
  if (!orderId) {
    return new Response(JSON.stringify({ message: "Missing orderId" }), { status: 400, headers });
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
  return new Response(JSON.stringify({ orderId, status: data.order_status }), { status: 200, headers });
}
export {
  handler as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibmV0bGlmeS9mdW5jdGlvbnMvY2FzaGZyZWUtb3JkZXItc3RhdHVzLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJleHBvcnQgZGVmYXVsdCBhc3luYyBmdW5jdGlvbiBoYW5kbGVyKHJlcXVlc3Q6IFJlcXVlc3QpIHtcbiAgY29uc3QgaGVhZGVycyA9IHtcbiAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctQ3JlZGVudGlhbHMnOiAndHJ1ZScsXG4gICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbic6ICcqJyxcbiAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcyc6ICdHRVQsT1BUSU9OUycsXG4gICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnOiAnQ29udGVudC1UeXBlJyxcbiAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nXG4gIH07XG5cbiAgaWYgKHJlcXVlc3QubWV0aG9kID09PSAnT1BUSU9OUycpIHtcbiAgICByZXR1cm4gbmV3IFJlc3BvbnNlKCcnLCB7IHN0YXR1czogMjAwLCBoZWFkZXJzIH0pO1xuICB9XG4gIGlmIChyZXF1ZXN0Lm1ldGhvZCAhPT0gJ0dFVCcpIHtcbiAgICByZXR1cm4gbmV3IFJlc3BvbnNlKEpTT04uc3RyaW5naWZ5KHsgbWVzc2FnZTogJ01ldGhvZCBOb3QgQWxsb3dlZCcgfSksIHsgc3RhdHVzOiA0MDUsIGhlYWRlcnMgfSk7XG4gIH1cblxuICBjb25zdCBhcHBJZCA9IHByb2Nlc3MuZW52LlVQSV9BUFBfSUQ7XG4gIGNvbnN0IHNlY3JldEtleSA9IHByb2Nlc3MuZW52LlVQSV9TRUNSRVRfS0VZO1xuICBpZiAoIWFwcElkIHx8ICFzZWNyZXRLZXkpIHtcbiAgICByZXR1cm4gbmV3IFJlc3BvbnNlKEpTT04uc3RyaW5naWZ5KHsgbWVzc2FnZTogJ1NlcnZlciBDb25maWd1cmF0aW9uIEVycm9yOiBVUElfQVBQX0lEIG9yIFVQSV9TRUNSRVRfS0VZIG1pc3NpbmcuJyB9KSwgeyBzdGF0dXM6IDUwMCwgaGVhZGVycyB9KTtcbiAgfVxuXG4gIGNvbnN0IHVybCA9IG5ldyBVUkwocmVxdWVzdC51cmwpO1xuICBjb25zdCBvcmRlcklkID0gdXJsLnNlYXJjaFBhcmFtcy5nZXQoJ29yZGVySWQnKTtcbiAgaWYgKCFvcmRlcklkKSB7XG4gICAgcmV0dXJuIG5ldyBSZXNwb25zZShKU09OLnN0cmluZ2lmeSh7IG1lc3NhZ2U6ICdNaXNzaW5nIG9yZGVySWQnIH0pLCB7IHN0YXR1czogNDAwLCBoZWFkZXJzIH0pO1xuICB9XG5cbiAgY29uc3QgcmVzcCA9IGF3YWl0IGZldGNoKGBodHRwczovL2FwaS5jYXNoZnJlZS5jb20vcGcvb3JkZXJzLyR7ZW5jb2RlVVJJQ29tcG9uZW50KG9yZGVySWQpfWAsIHtcbiAgICBtZXRob2Q6ICdHRVQnLFxuICAgIGhlYWRlcnM6IHtcbiAgICAgICd4LWNsaWVudC1pZCc6IGFwcElkLFxuICAgICAgJ3gtY2xpZW50LXNlY3JldCc6IHNlY3JldEtleSxcbiAgICAgICd4LWFwaS12ZXJzaW9uJzogJzIwMjItMDEtMDEnXG4gICAgfVxuICB9KTtcbiAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3AuanNvbigpO1xuICBpZiAoIXJlc3Aub2spIHtcbiAgICByZXR1cm4gbmV3IFJlc3BvbnNlKEpTT04uc3RyaW5naWZ5KHsgbWVzc2FnZTogZGF0YS5tZXNzYWdlIHx8ICdGYWlsZWQgdG8gdmVyaWZ5IG9yZGVyJywgb3JkZXJJZCB9KSwgeyBzdGF0dXM6IDUwMCwgaGVhZGVycyB9KTtcbiAgfVxuXG4gIHJldHVybiBuZXcgUmVzcG9uc2UoSlNPTi5zdHJpbmdpZnkoeyBvcmRlcklkLCBzdGF0dXM6IGRhdGEub3JkZXJfc3RhdHVzIH0pLCB7IHN0YXR1czogMjAwLCBoZWFkZXJzIH0pO1xufVxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7OztBQUFBLGVBQU8sUUFBK0IsU0FBa0I7QUFDdEQsUUFBTSxVQUFVO0FBQUEsSUFDZCxvQ0FBb0M7QUFBQSxJQUNwQywrQkFBK0I7QUFBQSxJQUMvQixnQ0FBZ0M7QUFBQSxJQUNoQyxnQ0FBZ0M7QUFBQSxJQUNoQyxnQkFBZ0I7QUFBQSxFQUNsQjtBQUVBLE1BQUksUUFBUSxXQUFXLFdBQVc7QUFDaEMsV0FBTyxJQUFJLFNBQVMsSUFBSSxFQUFFLFFBQVEsS0FBSyxRQUFRLENBQUM7QUFBQSxFQUNsRDtBQUNBLE1BQUksUUFBUSxXQUFXLE9BQU87QUFDNUIsV0FBTyxJQUFJLFNBQVMsS0FBSyxVQUFVLEVBQUUsU0FBUyxxQkFBcUIsQ0FBQyxHQUFHLEVBQUUsUUFBUSxLQUFLLFFBQVEsQ0FBQztBQUFBLEVBQ2pHO0FBRUEsUUFBTSxRQUFRLFFBQVEsSUFBSTtBQUMxQixRQUFNLFlBQVksUUFBUSxJQUFJO0FBQzlCLE1BQUksQ0FBQyxTQUFTLENBQUMsV0FBVztBQUN4QixXQUFPLElBQUksU0FBUyxLQUFLLFVBQVUsRUFBRSxTQUFTLG9FQUFvRSxDQUFDLEdBQUcsRUFBRSxRQUFRLEtBQUssUUFBUSxDQUFDO0FBQUEsRUFDaEo7QUFFQSxRQUFNLE1BQU0sSUFBSSxJQUFJLFFBQVEsR0FBRztBQUMvQixRQUFNLFVBQVUsSUFBSSxhQUFhLElBQUksU0FBUztBQUM5QyxNQUFJLENBQUMsU0FBUztBQUNaLFdBQU8sSUFBSSxTQUFTLEtBQUssVUFBVSxFQUFFLFNBQVMsa0JBQWtCLENBQUMsR0FBRyxFQUFFLFFBQVEsS0FBSyxRQUFRLENBQUM7QUFBQSxFQUM5RjtBQUVBLFFBQU0sT0FBTyxNQUFNLE1BQU0sc0NBQXNDLG1CQUFtQixPQUFPLENBQUMsSUFBSTtBQUFBLElBQzVGLFFBQVE7QUFBQSxJQUNSLFNBQVM7QUFBQSxNQUNQLGVBQWU7QUFBQSxNQUNmLG1CQUFtQjtBQUFBLE1BQ25CLGlCQUFpQjtBQUFBLElBQ25CO0FBQUEsRUFDRixDQUFDO0FBQ0QsUUFBTSxPQUFPLE1BQU0sS0FBSyxLQUFLO0FBQzdCLE1BQUksQ0FBQyxLQUFLLElBQUk7QUFDWixXQUFPLElBQUksU0FBUyxLQUFLLFVBQVUsRUFBRSxTQUFTLEtBQUssV0FBVywwQkFBMEIsUUFBUSxDQUFDLEdBQUcsRUFBRSxRQUFRLEtBQUssUUFBUSxDQUFDO0FBQUEsRUFDOUg7QUFFQSxTQUFPLElBQUksU0FBUyxLQUFLLFVBQVUsRUFBRSxTQUFTLFFBQVEsS0FBSyxhQUFhLENBQUMsR0FBRyxFQUFFLFFBQVEsS0FBSyxRQUFRLENBQUM7QUFDdEc7IiwKICAibmFtZXMiOiBbXQp9Cg==
