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

  function clearCurrentAccountData() {
    sessionStorage.removeItem("user_id");
    sessionStorage.removeItem("email");
    sessionStorage.removeItem("name");
    sessionStorage.removeItem("phone");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("profile_image");

    localStorage.removeItem("user_id");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    localStorage.removeItem("admin");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("profile_image");
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
        نقفل أي جلسة قديمة، خصوصًا جلسة الأدمن،
        قبل إنشاء الحساب الجديد.
      */
      await supabase.auth.signOut();
      clearCurrentAccountData();

      /*
        التحقق هل البريد موجود في جدول profiles.
      */
      const {
        data: existingUser,
        error: profileCheckError,
      } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", cleanEmail)
        .maybeSingle();

      if (profileCheckError) {
        console.error(
          "Profile check error:",
          profileCheckError
        );

        setErrorMsg(
          "تعذر التحقق من البريد، حاول مرة ثانية"
        );
        return;
      }

      if (existingUser) {
        setErrorMsg(
          "هذا الحساب موجود بالفعل، سجل الدخول"
        );
        return;
      }

      const redirectTo =
        `${window.location.origin}/auth/callback`;

      const { data, error } =
        await supabase.auth.signUp({
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
        const message =
          error.message.toLowerCase();

        if (
          message.includes("already registered") ||
          message.includes(
            "already been registered"
          ) ||
          message.includes("user already exists")
        ) {
          setErrorMsg(
            "هذا الحساب موجود بالفعل، سجل الدخول"
          );
          return;
        }

        if (
          message.includes("rate limit") ||
          message.includes(
            "email rate limit exceeded"
          ) ||
          message.includes("too many requests")
        ) {
          setErrorMsg(
            "تم طلب روابط كثيرة لهذا البريد، حاول بعد قليل"
          );
          return;
        }

        if (
          message.includes("smtp") ||
          message.includes(
            "sending confirmation email"
          )
        ) {
          setErrorMsg(
            "تعذر إرسال رسالة التفعيل، تحقق من إعدادات البريد"
          );
          return;
        }

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
        نحفظ الملف في profiles فقط.
        لا نسجل دخول المستخدم ولا نحفظ جلسة له الآن.
      */
      const { error: profileInsertError } =
        await supabase
          .from("profiles")
          .insert({
            id: data.user.id,
            email: cleanEmail,
            name: cleanName,
            phone: cleanPhone,
          });

      if (
        profileInsertError &&
        profileInsertError.code !== "23505"
      ) {
        console.error(
          "Profile insert error:",
          profileInsertError
        );
      }

      /*
        لو Supabase أنشأ جلسة مؤقتة،
        نقفلها حتى لا يدخل قبل تأكيد البريد.
      */
      if (data.session) {
        await supabase.auth.signOut();
      }

      clearCurrentAccountData();

      /*
        نخزن معلومات مؤقتة فقط، وليست جلسة دخول.
      */
      sessionStorage.setItem(
        "pending_register_name",
        cleanName
      );

      sessionStorage.setItem(
        "pending_register_email",
        cleanEmail
      );

      sessionStorage.setItem(
        "pending_register_phone",
        cleanPhone
      );

      setVerificationEmail(cleanEmail);
      setEmailSent(true);
      setPassword("");
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

  function changeEmail() {
    setEmailSent(false);
    setVerificationEmail("");
    setPassword("");
    setErrorMsg("");

    sessionStorage.removeItem(
      "pending_register_name"
    );

    sessionStorage.removeItem(
      "pending_register_email"
    );

    sessionStorage.removeItem(
      "pending_register_phone"
    );
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
            {emailSent
              ? "تأكيد البريد الإلكتروني"
              : "إنشاء حساب"}
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

            <p className="mb-5 text-sm leading-7 text-gray-500">
              افتح آخر رسالة وصلتك واضغط رابط
              التفعيل.
              <br />
              لن يتم تسجيل الدخول قبل تأكيد البريد.
            </p>

            <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-700">
              إذا لم تجد الرسالة، تحقق من البريد غير
              المرغوب فيه.
            </div>

            {errorMsg && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-center text-sm text-red-600">
                {errorMsg}
              </div>
            )}

            <button
              type="button"
              onClick={changeEmail}
              className="w-full rounded-xl border-2 border-teal-700 py-3 font-semibold text-teal-700 transition hover:bg-teal-50"
            >
              تعديل البريد الإلكتروني
            </button>

            <button
              type="button"
              onClick={() => router.push("/login")}
              className="mt-3 w-full rounded-xl py-3 font-semibold text-gray-600 transition hover:bg-gray-100"
            >
              الذهاب لتسجيل الدخول
            </button>

            <button
              type="button"
              onClick={() => router.push("/")}
              className="mt-2 w-full rounded-xl py-3 font-semibold text-gray-500 transition hover:bg-gray-100"
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
              onChange={(event) =>
                setName(event.target.value)
              }
              disabled={loading}
              className="mb-4 w-full rounded-xl border border-gray-300 p-4 text-base focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-200 disabled:bg-gray-100"
            />

            <input
              type="email"
              placeholder="البريد الإلكتروني"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value
                    .replace(
                      /[\u0600-\u06FF]/g,
                      ""
                    )
                    .replace(/\s/g, "")
                    .toLowerCase()
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
              onChange={(event) =>
                setPhone(
                  event.target.value.replace(
                    /[^0-9]/g,
                    ""
                  )
                )
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
              onChange={(event) =>
                setPassword(
                  event.target.value
                    .replace(
                      /[\u0600-\u06FF]/g,
                      ""
                    )
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
              {loading
                ? "جاري إنشاء الحساب..."
                : "إنشاء حساب"}
            </button>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                لديك حساب بالفعل؟
              </p>

              <button
                type="button"
                onClick={() =>
                  router.push("/login")
                }
                disabled={loading}
                className="mt-3 w-full rounded-xl border-2 border-teal-700 py-3 font-semibold text-teal-700 transition hover:bg-teal-700 hover:text-white disabled:opacity-50"
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