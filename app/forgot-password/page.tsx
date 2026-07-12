"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendResetLink() {
    setMessage("");
    setErrorMsg("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setErrorMsg("اكتب بريدك الإلكتروني");
      return;
    }

    const emailRegex =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(cleanEmail)) {
      setErrorMsg("البريد الإلكتروني غير صحيح");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    setMessage("تم إرسال رابط تغيير كلمة المرور على بريدك الإلكتروني ✅");
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-gray-100 flex items-center justify-center px-4 py-8"
      dir="rtl"
    >
      <div className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-gray-200">

        <div className="mb-8 text-center">

          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-teal-700 text-3xl font-bold text-white shadow-lg">
            و
          </div>

          <h1 className="text-3xl font-bold text-gray-900">
            نسيت كلمة المرور
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            اكتب بريدك وسيصلك رابط تغيير كلمة المرور
          </p>

        </div>

        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="البريد الإلكتروني"
          value={email}
          onChange={(e) =>
            setEmail(
              e.target.value
                .replace(/[^a-zA-Z0-9@._+-]/g, "")
                .toLowerCase()
            )
          }
          className="mb-4 w-full rounded-xl border border-gray-300 p-4 text-base text-gray-900 placeholder:text-gray-500 transition focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-200"
          dir="ltr"
        />

        {errorMsg && (
          <p className="mb-4 text-center text-sm text-red-600">
            {errorMsg}
          </p>
        )}

        {message && (
          <p className="mb-4 rounded-xl bg-green-50 border border-green-200 p-3 text-center text-sm text-green-700">
            {message}
          </p>
        )}

        <button
          onClick={sendResetLink}
          disabled={loading}
          className="w-full rounded-xl bg-teal-700 py-4 text-base font-semibold text-white transition hover:bg-teal-800 active:scale-[0.98] disabled:opacity-60"
        >
          {loading ? "جاري الإرسال..." : "إرسال رابط التغيير"}
        </button>

        <button
          onClick={() => router.push("/login")}
          className="mt-4 w-full rounded-xl border-2 border-teal-700 py-3 font-semibold text-teal-700 transition hover:bg-teal-700 hover:text-white"
        >
          رجوع لتسجيل الدخول
        </button>

      </div>
    </div>
  );
}