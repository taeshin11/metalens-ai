import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextFetchEvent } from 'next/server';

const intlMiddleware = createIntlMiddleware(routing);

// 로그인 필요 라우트
const isProtectedRoute = createRouteMatcher([
  '/(en|ko|ja|zh|es|pt|de|fr)/account(.*)',
  '/(en|ko|ja|zh|es|pt|de|fr)/admin(.*)',
  '/api/lemonsqueezy/checkout(.*)',
  '/api/lemonsqueezy/portal(.*)',
]);

const clerkHandler = clerkMiddleware(async (auth, req: NextRequest) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
  return intlMiddleware(req);
});

export function proxy(request: NextRequest, event: NextFetchEvent) {
  return clerkHandler(request, event);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|json)).*)',
  ],
};
