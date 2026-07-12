import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const ADMIN_EMAIL = "deaabd89@gmail.com";

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "غير مصرح لك بتنفيذ هذه العملية" },
        { status: 401 }
      );
    }

    const accessToken = authorization.slice(7);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const publicKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const secretKey =
      process.env.SUPABASE_SECRET_KEY ||
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !publicKey || !secretKey) {
      return NextResponse.json(
        { error: "إعدادات الخادم غير مكتملة" },
        { status: 500 }
      );
    }

    const authClient = createClient(supabaseUrl, publicKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const {
      data: { user: adminUser },
      error: adminError,
    } = await authClient.auth.getUser(accessToken);

    if (
      adminError ||
      !adminUser ||
      adminUser.email?.trim().toLowerCase() !== ADMIN_EMAIL
    ) {
      return NextResponse.json(
        { error: "هذه العملية مسموحة للأدمن فقط" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const userId = String(body?.userId || "").trim();
    const newPassword = String(body?.newPassword || "").trim();

    if (!userId) {
      return NextResponse.json(
        { error: "معرّف المستخدم غير موجود" },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "كلمة المرور لازم تكون 8 أحرف أو أكثر" },
        { status: 400 }
      );
    }

    const adminClient = createClient(supabaseUrl, secretKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { error: updateError } =
      await adminClient.auth.admin.updateUserById(userId, {
        password: newPassword,
      });

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "حدث خطأ غير متوقع في الخادم" },
      { status: 500 }
    );
  }
}