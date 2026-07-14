"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  function clearCurrentAccountData() {
    sessionStorage.clear();

    localStorage.removeItem("user_id");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    localStorage.removeItem("phone");
    localStorage.removeItem("profile_image");
    localStorage.removeItem("admin");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("confirmed_user");
    localStorage.removeItem("watheeq_email_confirmed");
  }

  async function register() {
    if (loading) {
      return;
    }

    setErrorMsg("");

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();
    const cleanPassword = password.trim();

    if (
      !cleanName ||
      !cleanEmail ||
      !cleanPhone ||
      !cleanPassword
    ) {
      setErrorMsg("عبّي جميع البيانات");
      return;
    }

    const emailCheck =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailCheck.test(cleanEmail)) {
      setErrorMsg(
        "اكتب إيميل صحيح مثال: name@gmail.com"
      );
      return;
    }

    const phoneCheck = /^05[0-9]{8}$/;

    if (!phoneCheck.test(cleanPhone)) {
      setErrorMsg(
        "رقم الجوال غير صحيح مثال: 0512345678"
      );
      return;
    }

    if (cleanPassword.length < 8) {
      setErrorMsg(
        "كلمة المرور لازم تكون 8 أحرف أو أكثر"
      );
      return;
    }

    setLoading(true);

    try {
      /*
        نقفل جلسة أي حساب قديم قبل إنشاء الحساب الجديد.
      */
      await supabase.auth.signOut();
      clearCurrentAccountData();

      const { data, error } =
        await supabase.auth.signUp({
          email: cleanEmail,
          password: cleanPassword,
          options: {
            data: {
              name: cleanName,
              phone: cleanPhone,
              role: "user",
            },
          },
        });

      if (error) {
        const message = error.message.toLowerCase();

        if (
          message.includes("already registered") ||
          message.includes("already been registered") ||
          message.includes("user already exists") ||
          message.includes("already exists")
        ) {
          setErrorMsg(
            "هذا الحساب موجود بالفعل، سجل الدخول"
          );
          return;
        }

        if (
          message.includes("rate limit") ||
          message.includes("too many requests")
        ) {
          setErrorMsg(
            "تمت محاولات كثيرة، انتظر قليلًا ثم حاول مرة ثانية"
          );
          return;
        }

        if (
          message.includes("password") &&
          message.includes("weak")
        ) {
          setErrorMsg(
            "كلمة المرور ضعيفة، استخدم كلمة أقوى"
          );
          return;
        }

        console.error("Sign up error:", error);

        setErrorMsg(
          "تعذر إنشاء الحساب، حاول مرة ثانية"
        );
        return;
      }

      if (!data.user) {
        setErrorMsg(
          "تعذر إنشاء الحساب، حاول مرة ثانية"
        );
        return;
      }

      /*
        في بعض إعدادات Supabase يرجع مستخدم بدون identities
        إذا كان البريد مسجلًا من قبل.
      */
      if (
        Array.isArray(data.user.identities) &&
        data.user.identities.length === 0
      ) {
        await supabase.auth.signOut();

        setErrorMsg(
          "هذا الحساب موجود بالفعل، سجل الدخول"
        );
        return;
      }

      /*
        بما أن Confirm email مطفأ، لازم ترجع جلسة مباشرة.
      */
      if (!data.session) {
        await supabase.auth.signOut();

        setErrorMsg(
          "لم يتم تسجيل الدخول مباشرة. تأكد أن خيار Confirm email مطفأ في Supabase"
        );
        return;
      }

      const user = data.user;
      const currentEmail =
        user.email?.trim().toLowerCase() ||
        cleanEmail;

      const userName = String(
        user.user_metadata?.name ||
          cleanName ||
          "مستخدم"
      );

      const userPhone = String(
        user.user_metadata?.phone ||
          cleanPhone ||
          ""
      );

      /*
        بيانات الجلسة الحالية.
      */
      sessionStorage.setItem("user_id", user.id);
      sessionStorage.setItem("email", currentEmail);
      sessionStorage.setItem("name", userName);
      sessionStorage.setItem("phone", userPhone);
      sessionStorage.setItem("role", "user");

      /*
        بيانات دائمة منفصلة لكل حساب.
      */
      localStorage.setItem("user_id", user.id);
      localStorage.setItem("email", currentEmail);
      localStorage.setItem("role", "user");

      localStorage.setItem(
        `name_${user.id}`,
        userName
      );

      localStorage.setItem(
        `phone_${user.id}`,
        userPhone
      );

      localStorage.removeItem("name");
      localStorage.removeItem("phone");
      localStorage.removeItem("profile_image");
      localStorage.removeItem("admin");
      localStorage.removeItem("isAdmin");

      /*
        تأكيد أن جلسة Supabase تعمل قبل الدخول.
      */
      const {
        data: { user: verifiedUser },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !verifiedUser) {
        await supabase.auth.signOut();
        clearCurrentAccountData();

        setErrorMsg(
          "تم إنشاء الحساب لكن تعذر بدء الجلسة، سجل الدخول يدويًا"
        );
        return;
      }

      router.replace("/deal");
      router.refresh();
    } catch (error) {
      console.error("Register error:", error);

      await supabase.auth.signOut();
      clearCurrentAccountData();

      setErrorMsg(
        "حدث خطأ أثناء إنشاء الحساب، حاول مرة ثانية"
      );
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (event.key === "Enter" && !loading) {
      register();
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
            إنشاء حساب
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            أنشئ حسابك وابدأ استخدام منصة وثيق
          </p>
        </div>

        <input
          type="text"
          placeholder="الاسم الكامل"
          value={name}
          disabled={loading}
          onKeyDown={handleKeyDown}
          onChange={(event) =>
            setName(event.target.value)
          }
          className="mb-4 w-full rounded-xl border border-gray-300 p-4 text-base text-gray-900 placeholder:text-gray-500 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-200 disabled:cursor-not-allowed disabled:bg-gray-100"
        />

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
                .replace(/[\u0600-\u06FF]/g, "")
                .replace(/\s/g, "")
                .toLowerCase()
            )
          }
          className="mb-4 w-full rounded-xl border border-gray-300 p-4 text-base text-gray-900 placeholder:text-gray-500 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-200 disabled:cursor-not-allowed disabled:bg-gray-100"
          dir="ltr"
        />

        <input
          type="text"
          inputMode="numeric"
          autoComplete="tel"
          placeholder="رقم الجوال 05xxxxxxxx"
          value={phone}
          disabled={loading}
          maxLength={10}
          onKeyDown={handleKeyDown}
          onChange={(event) =>
            setPhone(
              event.target.value.replace(
                /[^0-9]/g,
                ""
              )
            )
          }
          className="mb-4 w-full rounded-xl border border-gray-300 p-4 text-base text-gray-900 placeholder:text-gray-500 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-200 disabled:cursor-not-allowed disabled:bg-gray-100"
          dir="ltr"
        />

        <input
          type="password"
          autoComplete="new-password"
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
          className="mb-4 w-full rounded-xl border border-gray-300 p-4 text-base text-gray-900 placeholder:text-gray-500 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-200 disabled:cursor-not-allowed disabled:bg-gray-100"
          dir="ltr"
        />

        {errorMsg && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-center text-sm leading-6 text-red-600">
            {errorMsg}
          </div>
        )}

        <button
          type="button"
          onClick={register}
          disabled={loading}
          className="w-full rounded-xl bg-teal-700 py-4 text-base font-semibold text-white transition hover:bg-teal-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? "جاري إنشاء الحساب..."
            : "إنشاء الحساب والدخول"}
        </button>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            لديك حساب بالفعل؟
          </p>

          <button
            type="button"
            disabled={loading}
            onClick={() => router.push("/login")}
            className="mt-3 w-full rounded-xl border-2 border-teal-700 py-3 font-semibold text-teal-700 transition hover:bg-teal-700 hover:text-white disabled:opacity-50"
          >
            تسجيل الدخول
          </button>
        </div>
      </div>
    </div>
  );
}