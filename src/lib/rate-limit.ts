/**
 * Rate limiting best-effort en memoria (Sección 72).
 *
 * LIMITACIÓN CONOCIDA: en un entorno serverless (Vercel) cada instancia
 * de función tiene su propia memoria — esto NO es un límite global
 * confiable bajo alta concurrencia o múltiples instancias frías. Sirve
 * como primera barrera de costo S/0 contra abuso accidental/básico
 * (Sección 19). Para protección real a escala, migrar a un contador
 * compartido (p. ej. Upstash Redis, gratuito hasta cierto uso) sin
 * cambiar la firma de `checkRateLimit`.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds?: number;
}

export function checkRateLimit(key: string, limit: number, windowSeconds: number): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { allowed: true };
  }

  if (bucket.count >= limit) {
    return { allowed: false, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  bucket.count += 1;
  return { allowed: true };
}
