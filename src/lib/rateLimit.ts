/**
 * Rate Limiter en memoria para endpoints SSR en Astro Node.
 * Protege contra saturación de CPU, ataques DoS y bloqueos de IP
 * por parte de los supermercados (VTEX, Cloudflare, Akamai).
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const ipBuckets = new Map<string, RateLimitEntry>();

// Limpieza automática cada 5 minutos para evitar fugas de memoria
let lastCleanup = Date.now();
function cleanupStaleEntries() {
  const now = Date.now();
  if (now - lastCleanup < 5 * 60 * 1000) return;
  lastCleanup = now;

  for (const [key, entry] of ipBuckets.entries()) {
    if (now > entry.resetTime) {
      ipBuckets.delete(key);
    }
  }
}

export interface RateLimitConfig {
  /** Ventana de tiempo en milisegundos (ej. 60_000 = 1 minuto) */
  windowMs: number;
  /** Cantidad máxima de solicitudes permitidas en la ventana */
  max: number;
  /** Prefijo para separar contadores de diferentes endpoints (ej. 'lista', 'buscar') */
  prefix?: string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetSeconds: number;
}

/**
 * Obtiene la dirección IP real del cliente detrás de proxies (LiteSpeed / Cloudflare / Nginx).
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const firstIp = forwarded.split(',')[0].trim();
    if (firstIp) return firstIp;
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  if (cfConnectingIp) return cfConnectingIp.trim();

  return '127.0.0.1';
}

/**
 * Verifica si la solicitud excede el límite de tasa permitido.
 */
export function checkRateLimit(request: Request, config: RateLimitConfig): RateLimitResult {
  cleanupStaleEntries();

  const ip = getClientIp(request);
  const key = `${config.prefix || 'default'}:${ip}`;
  const now = Date.now();

  const entry = ipBuckets.get(key);

  if (!entry || now > entry.resetTime) {
    ipBuckets.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return {
      allowed: true,
      remaining: config.max - 1,
      resetSeconds: Math.ceil(config.windowMs / 1000),
    };
  }

  if (entry.count >= config.max) {
    const resetSeconds = Math.max(1, Math.ceil((entry.resetTime - now) / 1000));
    return {
      allowed: false,
      remaining: 0,
      resetSeconds,
    };
  }

  entry.count += 1;
  const resetSeconds = Math.max(1, Math.ceil((entry.resetTime - now) / 1000));
  return {
    allowed: true,
    remaining: config.max - entry.count,
    resetSeconds,
  };
}

/**
 * Helper para generar respuesta estándar HTTP 429 Too Many Requests
 */
export function rateLimitResponse(result: RateLimitResult): Response {
  return new Response(
    JSON.stringify({
      error: 'Too Many Requests',
      detail: `Has realizado demasiadas solicitudes seguidas. Por favor espera ${result.resetSeconds} segundo${result.resetSeconds === 1 ? '' : 's'} antes de volver a intentar.`,
      retryAfter: result.resetSeconds,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(result.resetSeconds),
        'X-RateLimit-Remaining': '0',
      },
    }
  );
}
