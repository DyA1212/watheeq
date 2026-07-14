"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Status = "loading" | "success" | "expired" | "error";

export default function AuthCallbackPage() {
  const router = useRouter();

  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    let cancelled = false;

    async function confirmEmail() {
      try {
        const params = new URLSearchParams(
          window.location.search
        );

        const code = params.get("code");
        const errorCode = params.get("error_code");
        const errorDescription =
          params.get("error_description");

        if (errorCode || errorDescription) {
          const description =
            errorDescription?.toLowerCase() || "";

          const {
            data: { user: existingUser },
          } = await supabase.auth.getUser();

          if (
            existingUser &&
            existingUser.email_confirmed_at
          ) {
            if (!cancelled) {
              setStatus("success");
            }

            return;
          }

          if (
            errorCode === "otp_expired" ||
            description.includes("expired") ||
            description.includes("invalid")
          ) {
            if (!cancelled) {
              setStatus("expired");
            }

            return;
          }

          if (!cancelled) {
            setStatus("error");
          }

          return;
        }

        if (code) {
          const { error: exchangeError } =
            await supabase.auth.exchangeCodeForSession(
              code
            );

          if (exchangeError) {
            const {
              data: { user: existingUser },
            } = await supabase.auth.getUser();

            if (
              existingUser &&
              existingUser.email_confirmed_at
            ) {
              if (!cancelled) {
                setStatus("success");
              }

              return;
            }

            const message =
              exchangeError.message.toLowerCase();

            if (
              message.includes("expired") ||
              message.includes("invalid")
            ) {
              if (!cancelled) {
                setStatus("expired");
              }

              return;
            }

            if (!cancelled) {
              setStatus("error");
            }

            return;
          }
        }

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          if (!cancelled) {
            setStatus("error");
          }

          return;
        }

        if (!user.email_confirmed_at) {
          await supabase.auth.signOut();

          if (!cancelled) {
            setStatus("error");
          }

          return;
        }

        const currentEmail =
          user.email?.trim().toLowerCase() || "";

        const userName = String(
          user.user_metadata?.name ||
            localStorage.getItem(
              `name_${user.id}`
            ) ||
            sessionStorage.getItem(
              "pending_register_name"
            ) ||
            "مستخدم"
        );

        const userPhone = String(
          user.user_metadata?.phone ||
            localStorage.getItem(
              `phone_${user.id}`
            ) ||
            sessionStorage.getItem(
              "pending_register_phone"
            ) ||
            ""
        );

        sessionStorage.setItem(
          "user_id",
          user.id
        );

        sessionStorage.setItem(
          "email",
          currentEmail
        );

        sessionStorage.setItem(
          "name",
          userName
        );

        sessionStorage.setItem(
          "phone",
          userPhone
        );

        sessionStorage.setItem(
          "role",
          "user"
        );

        localStorage.setItem(
          "user_id",
          user.id
        );

        localStorage.setItem(
          "email",
          currentEmail
        );

        localStorage.setItem(
          "role",
          "user"
        );

        localStorage.setItem(
          `name_${user.id}`,
          userName
        );

        localStorage.setItem(
          `phone_${user.id}`,
          userPhone
        );

        sessionStorage.removeItem(
          "pending_register_name"
        );

        sessionStorage.removeItem(
          "pending_register_email"
        );

        sessionStorage.removeItem(
          "pending_register_phone"
        );

        localStorage.setItem(
          "watheeq_email_confirmed",
          String(Date.now())
        );

        if (!cancelled) {
          setStatus("success");
        }
      } catch (error) {
        console.error(
          "Auth callback error:",
          error
        );

        if (!cancelled) {
          setStatus("error");
        }
      }
    }

    confirmEmail();

    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "success") {
    return (
      <main
        className="min-h-screen bg-gray-50 flex items-center justify-center px-4"
        dir="rtl"
      >
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-lg">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
            ✅
          </div>

          <h1 className="mb-3 text-2xl font-bold text-gray-900">
            تم تأكيد الحساب بنجاح
          </h1>

          <p className="mb-6 text-sm leading-7 text-gray-500">
            تم تفعيل حسابك في منصة{" "}
            <b>وثيق</b>.
            <br />
            تم تسجيل دخولك بنجاح.
          </p>

          <button
            type="button"
            onClick={() => {
              window.location.href = "/deal";
            }}
            className="w-full rounded-xl bg-teal-700 py-3 font-bold text-white transition hover:bg-teal-800"
          >
            الدخول إلى الموقع
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
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-lg">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-3xl">
            ⚠️
          </div>

          <h1 className="mb-3 text-2xl font-bold text-gray-900">
            رابط التفعيل منتهي
          </h1>

          <p className="mb-6 text-sm leading-7 text-gray-500">
            هذا الرابط قديم أو تم استخدامه من قبل.
            <br />
            ارجع إلى صفحة إنشاء الحساب واطلب رابط
            تفعيل جديد.
          </p>

          <button
            type="button"
            onClick={() => router.replace("/register")}
            className="w-full rounded-xl bg-teal-700 py-3 font-bold text-white transition hover:bg-teal-800"
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
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-lg">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-3xl">
            ❌
          </div>

          <h1 className="mb-3 text-2xl font-bold text-gray-900">
            تعذر تأكيد الحساب
          </h1>

          <p className="mb-6 text-sm leading-7 text-gray-500">
            الرابط غير صالح أو لم يتم تأكيد البريد.
            <br />
            ارجع إلى الموقع واطلب رابط تفعيل جديد.
          </p>

          <button
            type="button"
            onClick={() => router.replace("/register")}
            className="w-full rounded-xl bg-teal-700 py-3 font-bold text-white transition hover:bg-teal-800"
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
      <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-lg">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-teal-700 text-2xl font-bold text-white">
          و
        </div>

        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          جاري تأكيد الحساب
        </h1>

        <p className="text-sm text-gray-500">
          جاري تفعيل حسابك وتسجيل دخولك...
        </p>
      </div>
    </main>
  );
}