import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If env vars are missing, skip auth and just pass through
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[v0] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
    return supabaseResponse
  }

  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            for (const { name, value } of cookiesToSet) {
              request.cookies.set(name, value)
            }
            supabaseResponse = NextResponse.next({
              request,
            })
            for (const { name, value, options } of cookiesToSet) {
              supabaseResponse.cookies.set(name, value, options)
            }
          },
        },
      },
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (
      (request.nextUrl.pathname.startsWith('/protected') ||
        request.nextUrl.pathname.startsWith('/editor')) &&
      !user
    ) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      return NextResponse.redirect(url)
    }
  } catch (e) {
    console.error('[v0] Middleware auth error:', e)
    // On error, still allow the request through rather than crashing
    return supabaseResponse
  }

  return supabaseResponse
}
