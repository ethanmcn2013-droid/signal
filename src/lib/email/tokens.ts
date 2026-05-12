import { customAlphabet } from "nanoid";

// 24-char URL-safe token. Collision probability is negligible at our scale.
const alphabet =
  "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
const make = customAlphabet(alphabet, 24);

export function generateUnsubscribeToken(): string {
  return make();
}
