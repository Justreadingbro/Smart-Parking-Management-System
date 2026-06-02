import jwt from "jsonwebtoken"

const SECRET = "smart-parking-secret"

export function getUser(token: string) {
  try {
    return jwt.verify(token, SECRET)
  } catch {
    return null
  }
}