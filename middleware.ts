import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_PATHS  = ['/login', '/signup', '/reset-password', '/auth/callback']
const BILLING_PATHS = ['/subscribe', '/billing']

export async function middleware(request: NextRequest) {
  // Read directly from process.env here — middleware runs in the Edge Runtime
  // where module-level imports can't throw during the build phase.
  const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
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
  })

  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  // Public auth pages — redirect logged-in users away
  if (PUBLIC_PATHS.some(p => path.startsWith(p))) {
    if (user && path !== '/auth/callback') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return supabaseResponse
  }

  // PayFast webhook — no auth required
  if (path.startsWith('/api/payfast')) {
    return supabaseResponse
  }

  // Everything else requires authentication
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Billing pages — authenticated but subscription not required
  if (BILLING_PATHS.some(p => path.startsWith(p))) {
    return supabaseResponse
  }

  // App pages — require an active subscription or valid trial
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('status, trial_ends_at')
    .eq('user_id', user.id)
    .single()

  const isActive =
    sub?.status === 'active' ||
    (sub?.status === 'trialing' &&
     sub?.trial_ends_at != null &&
     new Date(sub.trial_ends_at) > new Date())

  if (!isActive) {
    return NextResponse.redirect(new URL('/subscribe', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
