import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/login', '/signup', '/reset-password', '/auth/callback']
const BILLING_PATHS = ['/subscribe', '/billing']

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet: { name: string; value: string; options?: object }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options as any)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  // Public paths — no auth needed
  if (PUBLIC_PATHS.some(p => path.startsWith(p))) {
    // Redirect logged-in users away from auth pages
    if (user && path !== '/auth/callback') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return supabaseResponse
  }

  // API webhook — no auth
  if (path.startsWith('/api/payfast')) {
    return supabaseResponse
  }

  // All other routes require auth
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Billing pages — logged in but no active sub is fine here
  if (BILLING_PATHS.some(p => path.startsWith(p))) {
    return supabaseResponse
  }

  // App pages — require active subscription
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('status, trial_ends_at')
    .eq('user_id', user.id)
    .single()

  const isActive =
    sub?.status === 'active' ||
    (sub?.status === 'trialing' && sub?.trial_ends_at && new Date(sub.trial_ends_at) > new Date())

  if (!isActive) {
    return NextResponse.redirect(new URL('/subscribe', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
