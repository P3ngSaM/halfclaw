import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

function createDashScopeTtsProxy(env) {
  const endpoint =
    env.DASHSCOPE_TTS_ENDPOINT ||
    "https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation";
  const apiKey = env.DASHSCOPE_API_KEY || "";
  const model = env.DASHSCOPE_TTS_MODEL || "qwen3-tts-flash";

  console.log(`[TTS Proxy Init] apiKey=${apiKey ? "SET(" + apiKey.slice(0, 6) + "...)" : "MISSING"}, model=${model}`);

  const handler = async (req, res) => {
    if (!req.url || !req.url.startsWith("/api/tts")) {
      return false;
    }

    if (req.method !== "POST") {
      res.statusCode = 405;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "method_not_allowed" }));
      return true;
    }

    if (!apiKey) {
      console.error("[TTS Proxy] API key is missing! Check .env.local");
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "server_missing_api_key" }));
      return true;
    }

    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }

    let payload;
    try {
      payload = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
    } catch {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "invalid_json" }));
      return true;
    }

    const text = String(payload?.text || "").trim();
    const voice = String(payload?.voice || "Cherry").trim() || "Cherry";
    console.log(`[TTS Proxy] voice="${voice}", text="${text.slice(0, 30)}..."`);
    if (!text) {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "missing_text" }));
      return true;
    }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          input: {
            text,
            voice,
            language_type: "Auto",
          },
        }),
      });

      const textBody = await response.text();
      let data = {};
      try {
        data = JSON.parse(textBody || "{}");
      } catch {
        data = { raw: textBody };
      }

      if (!response.ok) {
        console.error(`[TTS Proxy] DashScope returned ${response.status}:`, JSON.stringify(data));
        res.statusCode = response.status;
        res.setHeader("Content-Type", "application/json");
        res.end(
          JSON.stringify({
            error: "dashscope_request_failed",
            detail: data,
          }),
        );
        return true;
      }

      const audioUrl = data?.output?.audio?.url;
      if (!audioUrl) {
        res.statusCode = 502;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "missing_audio_url", detail: data }));
        return true;
      }

      // Proxy the audio through our server to avoid Mixed Content issues
      // when accessed via HTTPS (e.g. https://www.ta24h.com)
      try {
        const audioResp = await fetch(audioUrl);
        if (!audioResp.ok) {
          // Fallback: return the URL directly
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ url: audioUrl }));
          return true;
        }
        const audioBuffer = Buffer.from(await audioResp.arrayBuffer());
        const base64 = audioBuffer.toString("base64");
        const contentType = audioResp.headers.get("content-type") || "audio/mpeg";
        const dataUri = `data:${contentType};base64,${base64}`;
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ url: dataUri }));
      } catch (audioErr) {
        console.error("[TTS Proxy] Audio download failed, returning raw URL:", audioErr.message);
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ url: audioUrl }));
      }
      return true;
    } catch (error) {
      console.error("[TTS Proxy Error]", error);
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          error: "proxy_runtime_error",
          detail: String(error?.message || error),
        }),
      );
      return true;
    }
  };

  return {
    name: "dashscope-tts-proxy",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const handled = await handler(req, res);
        if (!handled) next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const handled = await handler(req, res);
        if (!handled) next();
      });
    },
  };
}

/* ── Reservation API plugin ── */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

function createReservationApi() {
  const DATA_FILE = join(process.cwd(), "data", "reservations.json");

  function ensureFile() {
    const dir = join(process.cwd(), "data");
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    if (!existsSync(DATA_FILE)) {
      writeFileSync(DATA_FILE, "[]", "utf8");
    }
  }

  function readAll() {
    ensureFile();
    try {
      return JSON.parse(readFileSync(DATA_FILE, "utf8"));
    } catch {
      return [];
    }
  }

  function append(entry) {
    const list = readAll();
    list.push(entry);
    writeFileSync(DATA_FILE, JSON.stringify(list, null, 2), "utf8");
    return list.length;
  }

  const handler = async (req, res) => {
    // GET /api/reservations — return count + list
    if (req.url === "/api/reservations" && req.method === "GET") {
      const list = readAll();
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ count: list.length, data: list }));
      return true;
    }

    // POST /api/reserve — create reservation
    if (req.url === "/api/reserve" && req.method === "POST") {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);

      let payload;
      try {
        payload = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
      } catch {
        res.statusCode = 400;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "invalid_json" }));
        return true;
      }

      const contact = String(payload?.contact || "").trim();
      if (!contact) {
        res.statusCode = 400;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "missing_contact" }));
        return true;
      }

      // Check duplicate
      const existing = readAll();
      const dup = existing.find((e) => e.contact === contact);
      if (dup) {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ success: true, rank: existing.indexOf(dup) + 1, total: existing.length, message: "already_reserved" }));
        return true;
      }

      const entry = {
        contact,
        referrer: String(payload?.referrer || "").trim() || null,
        created_at: new Date().toISOString(),
        ip: req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "",
        ua: req.headers["user-agent"] || "",
      };

      const total = append(entry);
      console.log(`[Reserve] #${total} — ${contact}`);

      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ success: true, rank: total, total }));
      return true;
    }

    return false;
  };

  return {
    name: "reservation-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const handled = await handler(req, res);
        if (!handled) next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const handled = await handler(req, res);
        if (!handled) next();
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react(), createDashScopeTtsProxy(env), createReservationApi()],
    server: {
      port: 8800,
      strictPort: true,
      host: "0.0.0.0",
      allowedHosts: ["127.0.0.1", "localhost", "www.ta24h.com", "ta24h.com"],
      cors: true,
    },
    preview: {
      port: 8800,
      strictPort: true,
      host: "0.0.0.0",
      allowedHosts: ["127.0.0.1", "localhost", "www.ta24h.com", "ta24h.com"],
      cors: true,
    },
  };
});
