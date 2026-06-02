import jwt from "jsonwebtoken"

const SECRET = "smart-parking-secret"

export function generateToken(payload: any) {
  return jwt.sign(payload, SECRET, {
    expiresIn: "7d",
  })
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, SECRET)
  } catch {
    return null
  }
}