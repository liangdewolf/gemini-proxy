export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  url.hostname = "gemini.google.com";
  url.protocol = "https:";
  url.port = "";

  const headers = new Headers(request.headers);
  headers.set("Host", "gemini.google.com");
  headers.set("Origin", "https://gemini.google.com");
  headers.set("Referer", "https://gemini.google.com/app");
  // 去掉 CF 自己加的标识，避免 Google 一眼识别
  headers.delete("cf-connecting-ip");
  headers.delete("cf-ipcountry");
  headers.delete("cf-ray");
  headers.delete("cf-visitor");
  headers.delete("x-forwarded-for");
  headers.delete("x-real-ip");

  return fetch(url.toString(), {
    method: request.method,
    headers,
    body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
    redirect: "manual",
  });
}
