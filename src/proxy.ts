import type { NextRequest } from "next/server";

import { authProxy } from "@/platform/auth/proxy";

export function proxy(request: NextRequest) {
  return authProxy(request);
}

export const config = {
  // Everything except Next.js internals, app icons and static files.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|apple-icon$|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
