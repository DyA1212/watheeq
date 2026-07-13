import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const ADMIN_EMAIL = "deaabd89@gmail.com";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request,
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
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(
            ({ name, value, options }) => {
              response.cookies.set(
                name,
                value,
                options
              );
            }
          );
        },
      },
    }
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isAdminApi =
    pathname.startsWith("/api/admin");

  /*
    المستخدم غير مسجل الدخول.
  */
  if (error || !user) {
    if (isAdminApi) {
      return NextResponse.json(
        {
          error: "يجب تسجيل الدخول أولًا",
        },
        {
          status: 401,
        }
      );
    }

    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set(
      "redirect",
      pathname
    );

    return NextResponse.redirect(loginUrl);
  }

  const currentEmail =
    user.email?.trim().toLowerCase() || "";

  /*
    المستخدم مسجل لكنه ليس الأدمن.
  */
  if (currentEmail !== ADMIN_EMAIL) {
    if (isAdminApi) {
      return NextResponse.json(
        {
          error: "ليس لديك صلاحية لتنفيذ هذه العملية",
        },
        {
          status: 403,
        }
      );
    }

    const dealUrl = request.nextUrl.clone();
    dealUrl.pathname = "/deal";
    dealUrl.search = "";

    return NextResponse.redirect(dealUrl);
  }

  /*
    حساب الأدمن فقط يكمل الطلب.
  */
  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
  ],
};