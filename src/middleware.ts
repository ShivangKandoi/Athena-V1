import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define paths that are always accessible
const publicPaths = ['/auth/login', '/auth/register']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow access to public paths
  if (publicPaths.includes(pathname)) {
    return NextResponse.next()
  }

  // Check if user has auth token
  const token = request.cookies.get('token')?.value

  // If no token and trying to access protected route, redirect to login
  if (!token && pathname !== '/auth/login') {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
} 