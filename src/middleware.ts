import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAdmin = token?.role === 'ADMIN'
    const pathname = req.nextUrl.pathname

    // Protege rotas de admin
    if (pathname.startsWith('/dashboard/users') && !isAdmin) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/members/:path*',
    '/api/payments/:path*',
    '/api/financial/:path*',
    '/api/users/:path*',
  ]
}
