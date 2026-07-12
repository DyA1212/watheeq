"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function changePassword() {
    setMessage("");
    setErrorMsg("");

    const cleanPassword = password.trim();
    const cleanConfirmPassword = confirmPassword.trim();

    if (!cleanPassword || !cleanConfirmPassword) {
      setErrorMsg("اكتب كلمة المرور الجديدة وتأكيدها");
      return;
    }

    if (cleanPassword.length < 8) {
      setErrorMsg("كلمة المرور لازم تكون 8 أحرف أو أكثر");
      return;
    }

    if (cleanPassword !== cleanConfirmPassword) {
      setErrorMsg("كلمتا المرور غير متطابقتين");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: cleanPassword,
    });

    setLoading(false);

    if (error) {
      setErrorMsg("الرابط غير صالح أو انتهت صلاحيته، اطلب رابط جديد");
      return;
    }

    setMessage("تم تغيير كلمة المرور بنجاح ✅");

    setPassword("");
    setConfirmPassword("");

    setTimeout(() => {
      router.push("/login");
    }, 1200);
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
            تغيير كلمة المرور
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            اكتب كلمة مرور جديدة لحسابك
          </p>

        </div>

        <input
          type="password"
          autoComplete="new-password"
          placeholder="كلمة المرور الجديدة"
          value={password}
          onChange={(e) =>
            setPassword(
              e.target.value
                .replace(/[\u0600-\u06FF]/g, "")
                .replace(/\s/g, "")
            )
          }
          className="mb-4 w-full rounded-xl border border-gray-300 p-4 text-base text-gray-900 placeholder:text-gray-500 transition focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-200"
          dir="ltr"
        />

        <input
          type="password"
          autoComplete="new-password"
          placeholder="تأكيد كلمة المرور الجديدة"
          value={confirmPassword}
          onChange={(e) =>
            setConfirmPassword(
              e.target.value
                .replace(/[\u0600-\u06FF]/g, "")
                .replace(/\s/g, "")
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
          onClick={changePassword}
          disabled={loading}
          className="w-full rounded-xl bg-teal-700 py-4 text-base font-semibold text-white transition hover:bg-teal-800 active:scale-[0.98] disabled:opacity-60"
        >
          {loading ? "جاري التغيير..." : "تغيير كلمة المرور"}
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