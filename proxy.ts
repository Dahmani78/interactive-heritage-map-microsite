import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ne pas toucher aux routes internes / fichiers statiques
  if (
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/data/") ||
    pathname.startsWith("/tiles/") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Laisser passer si déjà localisé
  if (
    pathname === "/fr" ||
    pathname.startsWith("/fr/") ||
    pathname === "/en" ||
    pathname.startsWith("/en/")
  ) {
    return NextResponse.next();
  }

  // Redirection MVP vers /fr
  const url = request.nextUrl.clone();
  url.pathname = `/fr${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/:path*"],
};
