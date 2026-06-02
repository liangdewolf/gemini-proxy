export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  
  // 关键：所有路径都透传到 gemini.google.com
  url.hostname = "gemini.google.com";
  url.protocol = "https:";
  url.port = "";

  const headers = new Headers(request.headers);
  headers.set("Host", "gemini.google.com");
  headers.set("Origin", "https://gemini.google.com");
  headers.set("Referer", "https://gemini.google.com/app");
  
  // 删掉 CF 自带 header，避免 Google 一眼识别
  ["cf-connecting-ip", "cf-ipcountry", "cf-ray", "cf-visitor",
   "cf-worker", "x-forwarded-for", "x-forwarded-proto", "x-real-ip"]
    .forEach(h => headers.delete(h));

  const init = {
    method: request.method,        // ← 必须支持所有方法，包括 POST
    headers,
    redirect: "manual",
  };
  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = request.body;
  }

  const resp = await fetch(url.toString(), init);
  
  // 透传所有响应（含 set-cookie）
  const respHeaders = new Headers(resp.headers);
  respHeaders.set("Access-Control-Allow-Origin", "*");
  
  return new Response(resp.body, {
    status: resp.status,
    statusText: resp.statusText,
    headers: respHeaders,
  });
}
