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
    if (loading) {
      return;
    }

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

    setLoading(true);

    try {
      sessionStorage.removeItem("email");
      sessionStorage.removeItem("name");
      sessionStorage.removeItem("phone");
      sessionStorage.removeItem("role");
      sessionStorage.removeItem("user_id");

      localStorage.removeItem("role");
      localStorage.removeItem("admin");
      localStorage.removeItem("isAdmin");

      await supabase.auth.signOut();

      const { data, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: userEmail,
          password: userPassword,
        });

      if (loginError) {
        const errorMessage = loginError.message.toLowerCase();

        if (errorMessage.includes("email not confirmed")) {
          setError(
            "الحساب لم يتم تفعيله. افتح بريدك الإلكتروني واضغط رابط التأكيد"
          );
          return;
        }

        if (
          errorMessage.includes("invalid login credentials") ||
          errorMessage.includes("invalid credentials")
        ) {
          setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
          return;
        }

        if (errorMessage.includes("too many requests")) {
          setError(
            "تمت محاولات كثيرة، انتظر قليلًا ثم حاول مرة ثانية"
          );
          return;
        }

        setError("تعذر تسجيل الدخول، حاول مرة ثانية");
        return;
      }

      if (!data.user || !data.session) {
        setError("تعذر إنشاء جلسة تسجيل الدخول، حاول مرة ثانية");
        return;
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        await supabase.auth.signOut();
        setError("تعذر التحقق من جلسة تسجيل الدخول");
        return;
      }

      const userName = String(
        user.user_metadata?.name || "مستخدم"
      );

      const userPhone = String(
        user.user_metadata?.phone || ""
      );

      sessionStorage.setItem(
        "email",
        user.email || userEmail
      );

      sessionStorage.setItem("name", userName);
      sessionStorage.setItem("phone", userPhone);
      sessionStorage.setItem("role", "user");
      sessionStorage.setItem("user_id", user.id);

      localStorage.setItem(
        "email",
        user.email || userEmail
      );

      localStorage.setItem("name", userName);
      localStorage.setItem("phone", userPhone);
      localStorage.setItem("user_id", user.id);

      router.replace("/deal");
      router.refresh();
    } catch {
      setError("حدث خطأ غير متوقع، حاول مرة ثانية");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (event.key === "Enter" && !loading) {
      login();
    }
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
          disabled={loading}
          onKeyDown={handleKeyDown}
          onChange={(e) =>
            setEmail(
              e.target.value
                .replace(/[^a-zA-Z0-9@._+-]/g, "")
                .toLowerCase()
            )
          }
          className="mb-4 w-full rounded-xl border border-gray-300 p-4 text-base text-gray-900 placeholder:text-gray-500 transition focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-200 disabled:cursor-not-allowed disabled:bg-gray-100"
          dir="ltr"
        />

        <input
          type="password"
          autoComplete="current-password"
          placeholder="كلمة المرور"
          value={password}
          disabled={loading}
          onKeyDown={handleKeyDown}
          onChange={(e) =>
            setPassword(
              e.target.value
                .replace(/[\u0600-\u06FF]/g, "")
                .replace(/\s/g, "")
            )
          }
          className="mb-2 w-full rounded-xl border border-gray-300 p-4 text-base text-gray-900 placeholder:text-gray-500 transition focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-200 disabled:cursor-not-allowed disabled:bg-gray-100"
          dir="ltr"
        />

        <div className="mb-5 text-left">
          <button
            type="button"
            disabled={loading}
            onClick={() => router.push("/forgot-password")}
            className="text-sm text-teal-700 hover:underline disabled:opacity-50"
          >
            نسيت كلمة المرور؟
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-center text-sm text-red-600">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={login}
          disabled={loading}
          className="w-full rounded-xl bg-teal-700 py-4 text-base font-semibold text-white transition hover:bg-teal-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? "جاري تسجيل الدخول..."
            : "تسجيل الدخول"}
        </button>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            ليس لديك حساب؟
          </p>

          <button
            type="button"
            disabled={loading}
            onClick={() => router.push("/register")}
            className="mt-3 w-full rounded-xl border-2 border-teal-700 py-3 font-semibold text-teal-700 transition hover:bg-teal-700 hover:text-white disabled:opacity-50"
          >
            إنشاء حساب جديد
          </button>
        </div>
      </div>
    </div>
  );
}