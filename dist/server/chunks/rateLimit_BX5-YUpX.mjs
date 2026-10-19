const ipBuckets = /* @__PURE__ */ new Map();
let lastCleanup = Date.now();
function cleanupStaleEntries() {
  const now = Date.now();
  if (now - lastCleanup < 5 * 60 * 1e3) return;
  lastCleanup = now;
  for (const [key, entry] of ipBuckets.entries()) {
    if (now > entry.resetTime) {
      ipBuckets.delete(key);
    }
  }
}
function getClientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const firstIp = forwarded.split(",")[0].trim();
    if (firstIp) return firstIp;
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  const cfConnectingIp = request.headers.get("cf-connecting-ip");
  if (cfConnectingIp) return cfConnectingIp.trim();
  return "127.0.0.1";
}
function checkRateLimit(request, config) {
  cleanupStaleEntries();
  const ip = getClientIp(request);
  const key = `${config.prefix || "default"}:${ip}`;
  const now = Date.now();
  const entry = ipBuckets.get(key);
  if (!entry || now > entry.resetTime) {
    ipBuckets.set(key, {
      count: 1,
      resetTime: now + config.windowMs
    });
    return {
      allowed: true,
      remaining: config.max - 1,
      resetSeconds: Math.ceil(config.windowMs / 1e3)
    };
  }
  if (entry.count >= config.max) {
    const resetSeconds2 = Math.max(1, Math.ceil((entry.resetTime - now) / 1e3));
    return {
      allowed: false,
      remaining: 0,
      resetSeconds: resetSeconds2
    };
  }
  entry.count += 1;
  const resetSeconds = Math.max(1, Math.ceil((entry.resetTime - now) / 1e3));
  return {
    allowed: true,
    remaining: config.max - entry.count,
    resetSeconds
  };
}
function rateLimitResponse(result) {
  return new Response(
    JSON.stringify({
      error: "Too Many Requests",
      detail: `Has realizado demasiadas solicitudes seguidas. Por favor espera ${result.resetSeconds} segundo${result.resetSeconds === 1 ? "" : "s"} antes de volver a intentar.`,
      retryAfter: result.resetSeconds
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(result.resetSeconds),
        "X-RateLimit-Remaining": "0"
      }
    }
  );
}

export { checkRateLimit as c, rateLimitResponse as r };
