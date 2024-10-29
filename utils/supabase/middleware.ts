import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { getUserData } from "@/utils/getUserData";

// Define public routes that don't require authentication
const publicRoutes = new Set(['/sign-in', '/sign-up', '/forgot-password']);

// Define static routes that should always be accessible
const staticRoutes = new Set(['/_next', '/static', '/api/auth', '/favicon.ico']);

export const updateSession = async (request: NextRequest) => {
  try {
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value),
            );
            response = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options),
            );
          },
        },
      },
    );

    const user = await getUserData();
    const path = request.nextUrl.pathname;

    // Allow static routes
    if (Array.from(staticRoutes).some(route => path.startsWith(route))) {
      return response;
    }

    // Handle root path
    if (path === '/') {
      return user
        ? NextResponse.redirect(new URL('/dashboard', request.url))
        : NextResponse.redirect(new URL('/sign-in', request.url));
    }

    // Handle public routes
    if (publicRoutes.has(path)) {
      return user
        ? NextResponse.redirect(new URL('/dashboard', request.url))
        : response;
    }

    // Protect all other routes
    if (!user) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }
};
