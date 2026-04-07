import { auth0 } from "./lib/auth0";

export async function proxy(request: Request) {
  const url = new URL(request.url);
  console.log("[proxy] Request:", url.pathname);
  
  const response = await auth0.middleware(request);
  
  console.log("[proxy] Response status:", response.status);
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
