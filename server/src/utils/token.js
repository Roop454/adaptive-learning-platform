import jwt from "jsonwebtoken";

const DEFAULT_EXPIRY = "7d";

export function signToken(userId, secret) {
  return jwt.sign({ sub: String(userId) }, secret, { expiresIn: DEFAULT_EXPIRY });
}

export function verifyToken(token, secret) {
  return jwt.verify(token, secret);
}
