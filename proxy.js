export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  // 把请求 URL 改写到 gemini.google.com，路径和 query 完全保留
  url.hostname = "gemini.google.com";
  url.protocol = "https:";
  url.port = "";

  // 复制 headers，强制 Host/Origin/Referer 为 Google
  const headers = new Headers(request.headers);
  headers.set("Host", "gemini.google.com");
  headers.set("Origin", "https://gemini.google.com");
  headers.set("Referer", "https://gemini.google.com/app");
  
  // 重要：删掉 CF 自加的 header，避免被 Google 一眼识别为代理流量
  ["cf-connecting-ip", "cf-ipcountry", "cf-ray", "cf-visitor",
   "cf-worker", "cdn-loop", "x-forwarded-for",
   "x-forwarded-proto", "x-real-ip"].forEach(h => headers.delete(h));

  const init = {
    method: request.method,    // ← 必须支持所有方法（你之前 POST 拿到 405 就是因为没支持）
    headers,
    redirect: "manual",
  };
  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = request.body;
  }

  const upstream = await fetch(url.toString(), init);

  // 透传响应（含 set-cookie，否则你的 /debug B_guest 抓不到访客 cookie）
  const respHeaders = new Headers(upstream.headers);
  respHeaders.set("Access-Control-Allow-Origin", "*");
  
  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: respHeaders,
  });
}
