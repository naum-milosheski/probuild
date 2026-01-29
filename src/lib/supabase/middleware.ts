import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    const {
        data: { user },
    } = await supabase.auth.getUser()

    // 1. Redirect unauthenticated users to login
    if (
        !user &&
        (request.nextUrl.pathname.startsWith('/dashboard') || request.nextUrl.pathname.startsWith('/portal'))
    ) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    // 2. Role-based redirection for authenticated users
    if (user) {
        // Check if user is a client
        const { data: client } = await supabase
            .from('clients')
            .select('id')
            .eq('auth_id', user.id)
            .single()

        const isClient = !!client

        // CLIENT trying to access DASHBOARD -> Redirect to PORTAL
        if (isClient && request.nextUrl.pathname.startsWith('/dashboard')) {
            const url = request.nextUrl.clone()
            url.pathname = '/portal'
            return NextResponse.redirect(url)
        }

        // ADMIN trying to access PORTAL -> Redirect to DASHBOARD
        if (!isClient && request.nextUrl.pathname.startsWith('/portal')) {
            const url = request.nextUrl.clone()
            url.pathname = '/dashboard'
            return NextResponse.redirect(url)
        }

        // Redirect from /login to appropriate home
        if (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup') {
            const url = request.nextUrl.clone()
            url.pathname = isClient ? '/portal' : '/dashboard'
            return NextResponse.redirect(url)
        }
    }

    return supabaseResponse
}
