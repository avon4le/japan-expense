/* ============================================================
   日本旅遊記帳 —— Gemini 中繼站（Cloudflare Worker）
   ------------------------------------------------------------
   作用：手機/電腦的瀏覽器 → 這個 Worker → Google Gemini
   為什麼要它：有些網路環境會擋掉「瀏覽器直接呼叫 Google AI」，
   透過 Worker（在伺服器上跑）就不會被擋，也能把金鑰藏起來。

   設定步驟看 README 的「附錄：架設中繼站」。
   ============================================================ */

// ⬇️ 把你的 Gemini API 金鑰貼在這裡（引號中間）
const GEMINI_KEY = "貼上你的_AIza_開頭金鑰";

export default {
  async fetch(request) {
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // 瀏覽器的預檢請求
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: cors });
    }
    if (request.method !== "POST") {
      return new Response("這是 API 中繼站，請用 POST。", { status: 405, headers: cors });
    }
    if (!GEMINI_KEY || GEMINI_KEY.startsWith("貼上")) {
      return json({ error: { message: "Worker 還沒設定 GEMINI_KEY" } }, 500, cors);
    }

    let payload;
    try {
      payload = await request.json();
    } catch (e) {
      return json({ error: { message: "request body 不是合法 JSON" } }, 400, cors);
    }

    // App 會把 model 放在 body 裡，其餘就是 Gemini 的標準 request
    const model = payload.model || "gemini-3.6-flash";
    delete payload.model;

    const target =
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_KEY}`;

    let g;
    try {
      g = await fetch(target, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (e) {
      return json({ error: { message: "中繼站連不到 Google：" + e } }, 502, cors);
    }

    const text = await g.text();
    return new Response(text, {
      status: g.status,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  },
};

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}
