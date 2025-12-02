
import {createRequire as ___nfyCreateRequire} from "module";
import {fileURLToPath as ___nfyFileURLToPath} from "url";
import {dirname as ___nfyPathDirname} from "path";
let __filename=___nfyFileURLToPath(import.meta.url);
let __dirname=___nfyPathDirname(___nfyFileURLToPath(import.meta.url));
let require=___nfyCreateRequire(import.meta.url);


// netlify/functions/upi-intent.ts
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
    const body = await request.json();
    const { orderId, amount, returnUrl, email, name, phone = "9999999999" } = body || {};
    if (!orderId || !amount || !returnUrl || !email || !name) {
      return new Response(JSON.stringify({ message: "Invalid request. Missing required fields." }), { status: 400, headers });
    }
    const customerId = (email || name || orderId).replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 45);
    const baseUrl = (process.env.PUBLIC_APP_BASE_URL || "https://veronikaextra.netlify.app").replace(/\/$/, "");
    const httpsReturnUrl = `${baseUrl}/#/profile?order_id={order_id}&status={order_status}`;
    const payload = {
      order_id: orderId,
      order_amount: Number(amount),
      order_currency: "INR",
      customer_details: {
        customer_id: customerId,
        customer_email: email,
        customer_phone: phone,
        customer_name: name
      },
      order_meta: {
        return_url: httpsReturnUrl
      }
    };
    const response = await fetch("https://api.cashfree.com/pg/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client-id": appId,
        "x-client-secret": secretKey,
        "x-api-version": "2022-01-01"
      },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) {
      return new Response(JSON.stringify({ message: data.message || "Payment Gateway Error" }), { status: 500, headers });
    }
    if (data && data.payment_link) {
      return new Response(JSON.stringify({ payLink: data.payment_link }), { status: 200, headers });
    }
    return new Response(JSON.stringify({ message: "Payment link not returned by gateway." }), { status: 500, headers });
  } catch (error) {
    return new Response(JSON.stringify({ message: error?.message || "Unexpected error" }), { status: 500, headers });
  }
}
export {
  handler as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibmV0bGlmeS9mdW5jdGlvbnMvdXBpLWludGVudC50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiZXhwb3J0IGRlZmF1bHQgYXN5bmMgZnVuY3Rpb24gaGFuZGxlcihyZXF1ZXN0OiBSZXF1ZXN0KSB7XG4gIGNvbnN0IGhlYWRlcnMgPSB7XG4gICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LUNyZWRlbnRpYWxzJzogJ3RydWUnLFxuICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nOiAnKicsXG4gICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnOiAnR0VULE9QVElPTlMsUEFUQ0gsREVMRVRFLFBPU1QsUFVUJyxcbiAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycyc6ICdYLUNTUkYtVG9rZW4sIFgtUmVxdWVzdGVkLVdpdGgsIEFjY2VwdCwgQWNjZXB0LVZlcnNpb24sIENvbnRlbnQtTGVuZ3RoLCBDb250ZW50LU1ENSwgQ29udGVudC1UeXBlLCBEYXRlLCBYLUFwaS1WZXJzaW9uJyxcbiAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nXG4gIH07XG5cbiAgaWYgKHJlcXVlc3QubWV0aG9kID09PSAnT1BUSU9OUycpIHtcbiAgICByZXR1cm4gbmV3IFJlc3BvbnNlKCcnLCB7IHN0YXR1czogMjAwLCBoZWFkZXJzIH0pO1xuICB9XG4gIGlmIChyZXF1ZXN0Lm1ldGhvZCAhPT0gJ1BPU1QnKSB7XG4gICAgcmV0dXJuIG5ldyBSZXNwb25zZShKU09OLnN0cmluZ2lmeSh7IG1lc3NhZ2U6ICdNZXRob2QgTm90IEFsbG93ZWQnIH0pLCB7IHN0YXR1czogNDA1LCBoZWFkZXJzIH0pO1xuICB9XG5cbiAgY29uc3QgYXBwSWQgPSBwcm9jZXNzLmVudi5VUElfQVBQX0lEO1xuICBjb25zdCBzZWNyZXRLZXkgPSBwcm9jZXNzLmVudi5VUElfU0VDUkVUX0tFWTtcblxuICBpZiAoIWFwcElkIHx8ICFzZWNyZXRLZXkpIHtcbiAgICByZXR1cm4gbmV3IFJlc3BvbnNlKEpTT04uc3RyaW5naWZ5KHsgbWVzc2FnZTogJ1NlcnZlciBDb25maWd1cmF0aW9uIEVycm9yOiBVUElfQVBQX0lEIG9yIFVQSV9TRUNSRVRfS0VZIG1pc3NpbmcuJyB9KSwgeyBzdGF0dXM6IDUwMCwgaGVhZGVycyB9KTtcbiAgfVxuXG4gIHRyeSB7XG4gICAgY29uc3QgYm9keSA9IGF3YWl0IHJlcXVlc3QuanNvbigpO1xuICAgIGNvbnN0IHsgb3JkZXJJZCwgYW1vdW50LCByZXR1cm5VcmwsIGVtYWlsLCBuYW1lLCBwaG9uZSA9ICc5OTk5OTk5OTk5JyB9ID0gYm9keSB8fCB7fTtcblxuICAgIGlmICghb3JkZXJJZCB8fCAhYW1vdW50IHx8ICFyZXR1cm5VcmwgfHwgIWVtYWlsIHx8ICFuYW1lKSB7XG4gICAgICByZXR1cm4gbmV3IFJlc3BvbnNlKEpTT04uc3RyaW5naWZ5KHsgbWVzc2FnZTogJ0ludmFsaWQgcmVxdWVzdC4gTWlzc2luZyByZXF1aXJlZCBmaWVsZHMuJyB9KSwgeyBzdGF0dXM6IDQwMCwgaGVhZGVycyB9KTtcbiAgICB9XG5cbiAgICBjb25zdCBjdXN0b21lcklkID0gKGVtYWlsIHx8IG5hbWUgfHwgb3JkZXJJZCkucmVwbGFjZSgvW15hLXpBLVowLTlfLV0vZywgJ18nKS5zbGljZSgwLCA0NSk7XG4gICAgY29uc3QgYmFzZVVybCA9IChwcm9jZXNzLmVudi5QVUJMSUNfQVBQX0JBU0VfVVJMIHx8ICdodHRwczovL3Zlcm9uaWthZXh0cmEubmV0bGlmeS5hcHAnKS5yZXBsYWNlKC9cXC8kLywgJycpO1xuICAgIGNvbnN0IGh0dHBzUmV0dXJuVXJsID0gYCR7YmFzZVVybH0vIy9wcm9maWxlP29yZGVyX2lkPXtvcmRlcl9pZH0mc3RhdHVzPXtvcmRlcl9zdGF0dXN9YDtcbiAgICBjb25zdCBwYXlsb2FkID0ge1xuICAgICAgb3JkZXJfaWQ6IG9yZGVySWQsXG4gICAgICBvcmRlcl9hbW91bnQ6IE51bWJlcihhbW91bnQpLFxuICAgICAgb3JkZXJfY3VycmVuY3k6ICdJTlInLFxuICAgICAgY3VzdG9tZXJfZGV0YWlsczoge1xuICAgICAgICBjdXN0b21lcl9pZDogY3VzdG9tZXJJZCxcbiAgICAgICAgY3VzdG9tZXJfZW1haWw6IGVtYWlsLFxuICAgICAgICBjdXN0b21lcl9waG9uZTogcGhvbmUsXG4gICAgICAgIGN1c3RvbWVyX25hbWU6IG5hbWVcbiAgICAgIH0sXG4gICAgICBvcmRlcl9tZXRhOiB7XG4gICAgICAgIHJldHVybl91cmw6IGh0dHBzUmV0dXJuVXJsXG4gICAgICB9XG4gICAgfTtcblxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goJ2h0dHBzOi8vYXBpLmNhc2hmcmVlLmNvbS9wZy9vcmRlcnMnLCB7XG4gICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgJ3gtY2xpZW50LWlkJzogYXBwSWQsXG4gICAgICAgICd4LWNsaWVudC1zZWNyZXQnOiBzZWNyZXRLZXksXG4gICAgICAgICd4LWFwaS12ZXJzaW9uJzogJzIwMjItMDEtMDEnXG4gICAgICB9LFxuICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkocGF5bG9hZClcbiAgICB9KTtcblxuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XG4gICAgaWYgKCFyZXNwb25zZS5vaykge1xuICAgICAgcmV0dXJuIG5ldyBSZXNwb25zZShKU09OLnN0cmluZ2lmeSh7IG1lc3NhZ2U6IGRhdGEubWVzc2FnZSB8fCAnUGF5bWVudCBHYXRld2F5IEVycm9yJyB9KSwgeyBzdGF0dXM6IDUwMCwgaGVhZGVycyB9KTtcbiAgICB9XG5cbiAgICBpZiAoZGF0YSAmJiBkYXRhLnBheW1lbnRfbGluaykge1xuICAgICAgcmV0dXJuIG5ldyBSZXNwb25zZShKU09OLnN0cmluZ2lmeSh7IHBheUxpbms6IGRhdGEucGF5bWVudF9saW5rIH0pLCB7IHN0YXR1czogMjAwLCBoZWFkZXJzIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgUmVzcG9uc2UoSlNPTi5zdHJpbmdpZnkoeyBtZXNzYWdlOiAnUGF5bWVudCBsaW5rIG5vdCByZXR1cm5lZCBieSBnYXRld2F5LicgfSksIHsgc3RhdHVzOiA1MDAsIGhlYWRlcnMgfSk7XG4gIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICByZXR1cm4gbmV3IFJlc3BvbnNlKEpTT04uc3RyaW5naWZ5KHsgbWVzc2FnZTogZXJyb3I/Lm1lc3NhZ2UgfHwgJ1VuZXhwZWN0ZWQgZXJyb3InIH0pLCB7IHN0YXR1czogNTAwLCBoZWFkZXJzIH0pO1xuICB9XG59XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7O0FBQUEsZUFBTyxRQUErQixTQUFrQjtBQUN0RCxRQUFNLFVBQVU7QUFBQSxJQUNkLG9DQUFvQztBQUFBLElBQ3BDLCtCQUErQjtBQUFBLElBQy9CLGdDQUFnQztBQUFBLElBQ2hDLGdDQUFnQztBQUFBLElBQ2hDLGdCQUFnQjtBQUFBLEVBQ2xCO0FBRUEsTUFBSSxRQUFRLFdBQVcsV0FBVztBQUNoQyxXQUFPLElBQUksU0FBUyxJQUFJLEVBQUUsUUFBUSxLQUFLLFFBQVEsQ0FBQztBQUFBLEVBQ2xEO0FBQ0EsTUFBSSxRQUFRLFdBQVcsUUFBUTtBQUM3QixXQUFPLElBQUksU0FBUyxLQUFLLFVBQVUsRUFBRSxTQUFTLHFCQUFxQixDQUFDLEdBQUcsRUFBRSxRQUFRLEtBQUssUUFBUSxDQUFDO0FBQUEsRUFDakc7QUFFQSxRQUFNLFFBQVEsUUFBUSxJQUFJO0FBQzFCLFFBQU0sWUFBWSxRQUFRLElBQUk7QUFFOUIsTUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXO0FBQ3hCLFdBQU8sSUFBSSxTQUFTLEtBQUssVUFBVSxFQUFFLFNBQVMsb0VBQW9FLENBQUMsR0FBRyxFQUFFLFFBQVEsS0FBSyxRQUFRLENBQUM7QUFBQSxFQUNoSjtBQUVBLE1BQUk7QUFDRixVQUFNLE9BQU8sTUFBTSxRQUFRLEtBQUs7QUFDaEMsVUFBTSxFQUFFLFNBQVMsUUFBUSxXQUFXLE9BQU8sTUFBTSxRQUFRLGFBQWEsSUFBSSxRQUFRLENBQUM7QUFFbkYsUUFBSSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxNQUFNO0FBQ3hELGFBQU8sSUFBSSxTQUFTLEtBQUssVUFBVSxFQUFFLFNBQVMsNENBQTRDLENBQUMsR0FBRyxFQUFFLFFBQVEsS0FBSyxRQUFRLENBQUM7QUFBQSxJQUN4SDtBQUVBLFVBQU0sY0FBYyxTQUFTLFFBQVEsU0FBUyxRQUFRLG1CQUFtQixHQUFHLEVBQUUsTUFBTSxHQUFHLEVBQUU7QUFDekYsVUFBTSxXQUFXLFFBQVEsSUFBSSx1QkFBdUIscUNBQXFDLFFBQVEsT0FBTyxFQUFFO0FBQzFHLFVBQU0saUJBQWlCLEdBQUcsT0FBTztBQUNqQyxVQUFNLFVBQVU7QUFBQSxNQUNkLFVBQVU7QUFBQSxNQUNWLGNBQWMsT0FBTyxNQUFNO0FBQUEsTUFDM0IsZ0JBQWdCO0FBQUEsTUFDaEIsa0JBQWtCO0FBQUEsUUFDaEIsYUFBYTtBQUFBLFFBQ2IsZ0JBQWdCO0FBQUEsUUFDaEIsZ0JBQWdCO0FBQUEsUUFDaEIsZUFBZTtBQUFBLE1BQ2pCO0FBQUEsTUFDQSxZQUFZO0FBQUEsUUFDVixZQUFZO0FBQUEsTUFDZDtBQUFBLElBQ0Y7QUFFQSxVQUFNLFdBQVcsTUFBTSxNQUFNLHNDQUFzQztBQUFBLE1BQ2pFLFFBQVE7QUFBQSxNQUNSLFNBQVM7QUFBQSxRQUNQLGdCQUFnQjtBQUFBLFFBQ2hCLGVBQWU7QUFBQSxRQUNmLG1CQUFtQjtBQUFBLFFBQ25CLGlCQUFpQjtBQUFBLE1BQ25CO0FBQUEsTUFDQSxNQUFNLEtBQUssVUFBVSxPQUFPO0FBQUEsSUFDOUIsQ0FBQztBQUVELFVBQU0sT0FBTyxNQUFNLFNBQVMsS0FBSztBQUNqQyxRQUFJLENBQUMsU0FBUyxJQUFJO0FBQ2hCLGFBQU8sSUFBSSxTQUFTLEtBQUssVUFBVSxFQUFFLFNBQVMsS0FBSyxXQUFXLHdCQUF3QixDQUFDLEdBQUcsRUFBRSxRQUFRLEtBQUssUUFBUSxDQUFDO0FBQUEsSUFDcEg7QUFFQSxRQUFJLFFBQVEsS0FBSyxjQUFjO0FBQzdCLGFBQU8sSUFBSSxTQUFTLEtBQUssVUFBVSxFQUFFLFNBQVMsS0FBSyxhQUFhLENBQUMsR0FBRyxFQUFFLFFBQVEsS0FBSyxRQUFRLENBQUM7QUFBQSxJQUM5RjtBQUVBLFdBQU8sSUFBSSxTQUFTLEtBQUssVUFBVSxFQUFFLFNBQVMsd0NBQXdDLENBQUMsR0FBRyxFQUFFLFFBQVEsS0FBSyxRQUFRLENBQUM7QUFBQSxFQUNwSCxTQUFTLE9BQVk7QUFDbkIsV0FBTyxJQUFJLFNBQVMsS0FBSyxVQUFVLEVBQUUsU0FBUyxPQUFPLFdBQVcsbUJBQW1CLENBQUMsR0FBRyxFQUFFLFFBQVEsS0FBSyxRQUFRLENBQUM7QUFBQSxFQUNqSDtBQUNGOyIsCiAgIm5hbWVzIjogW10KfQo=
