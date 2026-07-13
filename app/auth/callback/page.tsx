"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();

  const [status, setStatus] = useState<
    "loading" | "success" | "expired" | "error"
  >("loading");

  useEffect(() => {
    async function confirmEmail() {
      try {
        const params = new URLSearchParams(window.location.search);

        const code = params.get("code");
        const errorCode = params.get("error_code");
        const errorDescription = params.get("error_description");

        if (errorCode || errorDescription) {
          if (
            errorCode === "otp_expired" ||
            errorDescription?.toLowerCase().includes("expired")
          ) {
            setStatus("expired");
            return;
          }

          setStatus("error");
          return;
        }

        if (!code) {
          setStatus("error");
          return;
        }

        const { data, error } =
          await supabase.auth.exchangeCodeForSession(code);

        if (error || !data.user) {
          setStatus("error");
          return;
        }

        const user = data.user;

        const name =
          user.user_metadata?.name ||
          localStorage.getItem("name") ||
          "مستخدم";

        const phone =
          user.user_metadata?.phone ||
          localStorage.getItem("phone") ||
          "";

        sessionStorage.setItem("user_id", user.id);
        sessionStorage.setItem("email", user.email || "");
        sessionStorage.setItem("name", name);
        sessionStorage.setItem("phone", phone);
        sessionStorage.setItem("role", "user");

        localStorage.setItem("user_id", user.id);
        localStorage.setItem("email", user.email || "");
        localStorage.setItem("name", name);
        localStorage.setItem("phone", phone);

        localStorage.setItem(
          "watheeq_email_confirmed",
          String(Date.now())
        );

      setStatus("success");
      } catch {
        setStatus("error");
      }
    }

    confirmEmail();
  }, [router]);

  if (status === "success") {
  return (
    <main
      className="min-h-screen bg-gray-50 flex items-center justify-center px-4"
      dir="rtl"
    >
      <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-8 text-center">

        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
          ✅
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          تم تأكيد الحساب بنجاح
        </h1>

        <p className="text-sm text-gray-500 leading-7 mb-6">
          تم تفعيل حسابك في منصة <b>وثيق</b>.
          <br />
          يمكنك الآن العودة إلى الموقع.
        </p>

        <button
          type="button"
          onClick={() => router.replace("/")}
          className="w-full rounded-xl bg-teal-700 py-3 font-bold text-white hover:bg-teal-800"
        >
          العودة إلى الموقع
        </button>

      </div>
    </main>
  );
}

  if (status === "expired") {
    return (
      <main
        className="min-h-screen bg-gray-50 flex items-center justify-center px-4"
        dir="rtl"
      >
        <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-3xl">
            ⚠️
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            رابط التفعيل منتهي
          </h1>

          <p className="text-sm text-gray-500 leading-7 mb-6">
            هذا الرابط قديم أو تم استخدامه من قبل.
            ارجع لصفحة إنشاء الحساب واطلب رابط تفعيل جديد.
          </p>

          <button
            type="button"
            onClick={() => router.replace("/register")}
            className="w-full rounded-xl bg-teal-700 py-3 font-bold text-white"
          >
            العودة لإنشاء الحساب
          </button>
        </div>
      </main>
    );
  }

  if (status === "error") {
    return (
      <main
        className="min-h-screen bg-gray-50 flex items-center justify-center px-4"
        dir="rtl"
      >
        <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-3xl">
            ❌
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            تعذر تأكيد الحساب
          </h1>

          <p className="text-sm text-gray-500 leading-7 mb-6">
            الرابط غير صالح. جرّب إرسال رابط تفعيل جديد.
          </p>

          <button
            type="button"
            onClick={() => router.replace("/register")}
            className="w-full rounded-xl bg-teal-700 py-3 font-bold text-white"
          >
            العودة لإنشاء الحساب
          </button>
        </div>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen bg-gray-50 flex items-center justify-center px-4"
      dir="rtl"
    >
      <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-8 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-teal-700 text-2xl font-bold text-white">
          و
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          جاري تأكيد الحساب
        </h1>

        <p className="text-sm text-gray-500">
         جاري تأكيد حسابك...
        </p>
      </div>
    </main>
  );
}