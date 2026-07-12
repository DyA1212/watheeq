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

  const [verificationEmail, setVerificationEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function register() {
    setErrorMsg("");

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();
    const cleanPassword = password.trim();

    if (
      cleanName === "" ||
      cleanEmail === "" ||
      cleanPhone === "" ||
      cleanPassword === ""
    ) {
      setErrorMsg("عبّي جميع البيانات");
      return;
    }

    const emailCheck =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailCheck.test(cleanEmail)) {
      setErrorMsg("اكتب إيميل صحيح مثال: name@gmail.com");
      return;
    }

    const phoneCheck = /^05[0-9]{8}$/;

    if (!phoneCheck.test(cleanPhone)) {
      setErrorMsg("رقم الجوال غير صحيح مثال: 0512345678");
      return;
    }

    if (cleanPassword.length < 8) {
      setErrorMsg("كلمة المرور لازم تكون 8 أحرف أو أكثر");
      return;
    }

    setLoading(true);

    try {
      const redirectTo = `${window.location.origin}/auth/callback`;

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: cleanPassword,
        options: {
          emailRedirectTo: redirectTo,

          data: {
            name: cleanName,
            phone: cleanPhone,
            role: "user",
          },
        },
      });

      if (error) {
        if (
          error.message.toLowerCase().includes("already registered") ||
          error.message.toLowerCase().includes("already been registered")
        ) {
          setErrorMsg("الإيميل مستخدم مسبقاً");
          return;
        }

        setErrorMsg(error.message);
        return;
      }

      localStorage.setItem("name", cleanName);
      localStorage.setItem("email", cleanEmail);
      localStorage.setItem("phone", cleanPhone);
      localStorage.setItem("role", "user");

      if (data.user?.id) {
        localStorage.setItem("user_id", data.user.id);
      }

      setVerificationEmail(cleanEmail);
      setEmailSent(true);

      setPassword("");
    } catch (error) {
      console.error(error);
      setErrorMsg("حدث خطأ أثناء إنشاء الحساب، حاول مرة ثانية");
    } finally {
      setLoading(false);
    }
  }

  function changeEmail() {
    setEmailSent(false);
    setVerificationEmail("");
    setErrorMsg("");
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-gray-100 flex items-center justify-center px-4 py-8"
      dir="rtl"
    >
      <div className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-gray-200">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-teal-700 text-3xl font-bold text-white shadow-lg">
            و
          </div>

          <h1 className="text-3xl font-bold text-gray-900">
            {emailSent ? "تأكيد البريد الإلكتروني" : "إنشاء حساب"}
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            {emailSent
              ? "باقي خطوة واحدة لتفعيل حسابك"
              : "أنشئ حسابك وسيصلك رابط تحقق على الإيميل"}
          </p>
        </div>

        {emailSent ? (
          <div className="text-center">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-teal-50 text-4xl">
              ✉️
            </div>

            <div className="mb-5 rounded-2xl border border-teal-200 bg-teal-50 p-5">
              <h2 className="mb-2 text-lg font-bold text-teal-800">
                افتح بريدك وفعّل حسابك
              </h2>

              <p className="text-sm leading-7 text-teal-700">
                أرسلنا رابط تأكيد الحساب إلى:
              </p>

              <p
                className="mt-2 break-all font-bold text-gray-900"
                dir="ltr"
              >
                {verificationEmail}
              </p>
            </div>

            <p className="mb-6 text-sm leading-7 text-gray-500">
              افتح الرسالة واضغط على رابط التفعيل.
              <br />
              بعد التأكيد سيتم إدخالك إلى منصة وثيق مباشرة.
            </p>

            <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-700">
              إذا لم تجد الرسالة، تحقق من البريد غير المرغوب فيه.
            </div>

            <button
              type="button"
              onClick={changeEmail}
              className="w-full rounded-xl border-2 border-teal-700 py-3 font-semibold text-teal-700 transition hover:bg-teal-50"
            >
              تعديل البريد الإلكتروني
            </button>

            <button
              type="button"
              onClick={() => router.push("/")}
              className="mt-3 w-full rounded-xl py-3 font-semibold text-gray-500 transition hover:bg-gray-100"
            >
              العودة للرئيسية
            </button>
          </div>
        ) : (
          <>
            <input
              type="text"
              placeholder="الاسم الكامل"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              className="mb-4 w-full rounded-xl border border-gray-300 p-4 text-base focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-200 disabled:bg-gray-100"
            />

            <input
              type="email"
              placeholder="البريد الإلكتروني"
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value
                    .replace(/[\u0600-\u06FF]/g, "")
                    .replace(/\s/g, "")
                )
              }
              disabled={loading}
              className="mb-4 w-full rounded-xl border border-gray-300 p-4 text-base focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-200 disabled:bg-gray-100"
              dir="ltr"
            />

            <input
              type="text"
              inputMode="numeric"
              placeholder="رقم الجوال 05xxxxxxxx"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value.replace(/[^0-9]/g, ""))
              }
              disabled={loading}
              className="mb-4 w-full rounded-xl border border-gray-300 p-4 text-base focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-200 disabled:bg-gray-100"
              dir="ltr"
              maxLength={10}
            />

            <input
              type="password"
              placeholder="كلمة المرور"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                    .replace(/[\u0600-\u06FF]/g, "")
                    .replace(/\s/g, "")
                )
              }
              disabled={loading}
              className="mb-4 w-full rounded-xl border border-gray-300 p-4 text-base focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-200 disabled:bg-gray-100"
              dir="ltr"
            />

            {errorMsg && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-center text-sm text-red-600">
                {errorMsg}
              </div>
            )}

            <button
              type="button"
              onClick={register}
              disabled={loading}
              className="w-full rounded-xl bg-teal-700 py-4 text-base font-semibold text-white transition hover:bg-teal-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "جاري إنشاء الحساب..." : "إنشاء حساب"}
            </button>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                لديك حساب بالفعل؟
              </p>

              <button
                type="button"
                onClick={() => router.push("/login")}
                className="mt-3 w-full rounded-xl border-2 border-teal-700 py-3 font-semibold text-teal-700 transition hover:bg-teal-700 hover:text-white"
              >
                تسجيل الدخول
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}