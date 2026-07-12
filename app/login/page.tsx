"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function login() {
    setError("");

    const userEmail = email.trim().toLowerCase();
    const userPassword = password.trim();

    if (!userEmail || !userPassword) {
      setError("يرجى إدخال البريد الإلكتروني وكلمة المرور");
      return;
    }

    const emailRegex =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(userEmail)) {
      setError("البريد الإلكتروني غير صحيح");
      return;
    }

    if (userPassword.length < 8) {
      setError("كلمة المرور لازم تكون 8 أحرف أو أكثر");
      return;
    }

    sessionStorage.clear();

    // حساب المدير
    if (
      userEmail === "deaabd89@gmail.com" &&
      userPassword === "dea2008dd"
    ) {
      sessionStorage.setItem("email", userEmail);
      sessionStorage.setItem("name", "مدير النظام");
      sessionStorage.setItem("phone", "");
      sessionStorage.setItem("role", "admin");
      sessionStorage.setItem("user_id", "admin");

      router.push("/admin");
      return;
    }

    setLoading(true);

    const { data, error: loginError } =
      await supabase.auth.signInWithPassword({
        email: userEmail,
        password: userPassword,
      });

    setLoading(false);

    if (loginError) {
      setError(
        "الإيميل أو كلمة المرور غير صحيحة، أو الحساب لم يتم تفعيله من الإيميل"
      );
      return;
    }

    if (!data.user) {
      setError("حدث خطأ في تسجيل الدخول");
      return;
    }

    sessionStorage.setItem("email", data.user.email || userEmail);
    sessionStorage.setItem(
      "name",
      String(data.user.user_metadata?.name || "مستخدم")
    );
    sessionStorage.setItem(
      "phone",
      String(data.user.user_metadata?.phone || "")
    );
    sessionStorage.setItem(
      "role",
      String(data.user.user_metadata?.role || "user")
    );
    sessionStorage.setItem("user_id", data.user.id);

    router.push("/deal");
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
            تسجيل الدخول
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            أهلاً بك في منصة وثيق
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

        <input
          type="password"
          autoComplete="current-password"
          placeholder="كلمة المرور"
          value={password}
          onChange={(e) =>
            setPassword(
              e.target.value
                .replace(/[\u0600-\u06FF]/g, "")
                .replace(/\s/g, "")
            )
          }
          className="mb-2 w-full rounded-xl border border-gray-300 p-4 text-base text-gray-900 placeholder:text-gray-500 transition focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-200"
          dir="ltr"
        />

        <div className="mb-5 text-left">

          <button
            type="button"
            onClick={() => router.push("/forgot-password")}
            className="text-sm text-teal-700 hover:underline"
          >
            نسيت كلمة المرور؟
          </button>

        </div>

        <button
          onClick={login}
          disabled={loading}
          className="w-full rounded-xl bg-teal-700 py-4 text-base font-semibold text-white transition hover:bg-teal-800 active:scale-[0.98] disabled:opacity-60"
        >
          {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
        </button>

        {error && (
          <p className="mt-4 text-center text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="mt-8 text-center">

          <p className="text-sm text-gray-600">
            ليس لديك حساب؟
          </p>

          <button
            onClick={() => router.push("/register")}
            className="mt-3 w-full rounded-xl border-2 border-teal-700 py-3 font-semibold text-teal-700 transition hover:bg-teal-700 hover:text-white"
          >
            إنشاء حساب جديد
          </button>

        </div>

      </div>
    </div>
  );
}