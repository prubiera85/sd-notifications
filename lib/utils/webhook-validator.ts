import { createHmac } from "crypto";

/**
 * Validate Linear webhook signature using HMAC
 * @param signature - The signature from the Linear-Signature header
 * @param body - The raw request body as string
 * @param secret - The webhook secret from environment variables
 */
export function validateLinearWebhook(
  signature: string | null,
  body: string,
  secret?: string
): boolean {
  if (!signature) {
    console.error("No signature provided");
    return false;
  }

  const webhookSecret = secret || process.env.LINEAR_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("LINEAR_WEBHOOK_SECRET not configured");
    return false;
  }

  try {
    // Linear uses HMAC-SHA256
    const hmac = createHmac("sha256", webhookSecret);
    hmac.update(body);
    const expectedSignature = hmac.digest("hex");

    // Compare signatures (constant-time comparison to prevent timing attacks)
    return timingSafeEqual(signature, expectedSignature);
  } catch (error) {
    console.error("Error validating webhook signature:", error);
    return false;
  }
}

/**
 * Timing-safe string comparison to prevent timing attacks
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Check if webhook timestamp is recent (within last 5 minutes)
 * Prevents replay attacks
 */
export function isValidTimestamp(timestamp: number): boolean {
  const now = Date.now();
  const fiveMinutesInMs = 5 * 60 * 1000;

  const timeDiff = Math.abs(now - timestamp);

  return timeDiff < fiveMinutesInMs;
}
