import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

const SECRET = "smart-parking-secret"

export function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next()
  }

  const token = req.cookies.get("token")?.value

  if (!token) {
    return NextResponse.redirect(
      new URL("/login", req.url)
    )
  }

  try {
    const user = jwt.verify(token, SECRET) as any

    if (
      pathname.startsWith("/analytics") ||
      pathname.startsWith("/history") ||
      pathname.startsWith("/settings") ||
      pathname.startsWith("/cameras")
    ) {
      if (user.role !== "admin") {
        return NextResponse.redirect(
          new URL("/", req.url)
        )
      }
    }

    return NextResponse.next()
  } catch {
    return NextResponse.redirect(
      new URL("/login", req.url)
    )
  }
}

export const config = {
  matcher: [
    "/",
    "/analytics/:path*",
    "/history/:path*",
    "/settings/:path*",
    "/cameras/:path*",
    "/user/:path*",
  ],
}