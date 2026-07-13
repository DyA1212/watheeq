"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const ADMIN_EMAIL = "deaabd89@gmail.com";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function clearOldAccountData() {
    sessionStorage.removeItem("email");
    sessionStorage.removeItem("name");
    sessionStorage.removeItem("phone");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("user_id");
    sessionStorage.removeItem("profile_image");
    sessionStorage.removeItem("confirmed_user");

    localStorage.removeItem("email");
    localStorage.removeItem("name");
    localStorage.removeItem("phone");
    localStorage.removeItem("role");
    localStorage.removeItem("user_id");
    localStorage.removeItem("profile_image");

    localStorage.removeItem("admin");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("confirmed_user");
    localStorage.removeItem("watheeq_email_confirmed");
  }

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
      /*
        تسجيل الخروج من أي حساب قديم في Supabase
        قبل الدخول بالحساب الجديد.
      */
      await supabase.auth.signOut();

      /*
        حذف بيانات الحساب السابق من التخزين.
      */
      clearOldAccountData();

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

        if (
          errorMessage.includes("too many requests") ||
          errorMessage.includes("rate limit")
        ) {
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
        clearOldAccountData();

        setError("تعذر التحقق من جلسة تسجيل الدخول");
        return;
      }

      const currentEmail = (
        user.email ||
        userEmail
      ).trim().toLowerCase();

      const role =
        currentEmail === ADMIN_EMAIL ? "admin" : "user";

      /*
        كل مستخدم له مفاتيح خاصة به.
        هذا يمنع اختلاط الاسم والصورة بين الحسابات.
      */
      const savedName = localStorage.getItem(
        `name_${user.id}`
      );

      const savedPhone = localStorage.getItem(
        `phone_${user.id}`
      );

      const savedImage = localStorage.getItem(
        `profile_image_${user.id}`
      );

      const userName = String(
        savedName ||
          user.user_metadata?.name ||
          "مستخدم"
      );

      const userPhone = String(
        savedPhone ||
          user.user_metadata?.phone ||
          ""
      );

      /*
        sessionStorage يحتوي بيانات الحساب المفتوح الآن فقط.
      */
      sessionStorage.setItem("user_id", user.id);
      sessionStorage.setItem("email", currentEmail);
      sessionStorage.setItem("name", userName);
      sessionStorage.setItem("phone", userPhone);
      sessionStorage.setItem("role", role);

      if (savedImage) {
        sessionStorage.setItem(
          "profile_image",
          savedImage
        );
      } else {
        sessionStorage.removeItem("profile_image");
      }

      /*
        حفظ هوية الحساب الحالي.
        بيانات الملف الشخصي الدائمة تكون مرتبطة بـ user.id.
      */
      localStorage.setItem("user_id", user.id);
      localStorage.setItem("email", currentEmail);
      localStorage.setItem("role", role);

      localStorage.setItem(
        `name_${user.id}`,
        userName
      );

      localStorage.setItem(
        `phone_${user.id}`,
        userPhone
      );

      /*
        لا نحفظ الاسم أو الصورة بمفتاح عام،
        حتى لا تظهر بيانات حساب في حساب آخر.
      */
      localStorage.removeItem("name");
      localStorage.removeItem("phone");
      localStorage.removeItem("profile_image");

      router.replace("/deal");
      router.refresh();
    } catch {
      await supabase.auth.signOut();
      clearOldAccountData();

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
      <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl sm:p-8">
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
          onChange={(event) =>
            setEmail(
              event.target.value
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
          onChange={(event) =>
            setPassword(
              event.target.value
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
            onClick={() =>
              router.push("/forgot-password")
            }
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