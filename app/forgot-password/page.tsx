"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Turnstile } from "@marsidev/react-turnstile";
import { supabase } from "@/lib/supabase";

type Step = "email" | "success";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");

  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaKey, setCaptchaKey] = useState(0);

  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  function cleanEmailValue(value: string) {
    return value
      .replace(/[^a-zA-Z0-9@._+-]/g, "")
      .toLowerCase();
  }

  function resetCaptcha() {
    setCaptchaToken("");
    setCaptchaKey((current) => current + 1);
  }

  function getArabicError(errorMessage: string) {
    const message = errorMessage.toLowerCase();

    if (
      message.includes("captcha") ||
      message.includes("challenge") ||
      message.includes("timeout-or-duplicate")
    ) {
      return "انتهت صلاحية التحقق، أكمل التحقق الجديد ثم حاول مرة أخرى";
    }

    if (
      message.includes("rate limit") ||
      message.includes("too many")
    ) {
      return "تم طلب روابط كثيرة، انتظر قليلًا ثم حاول مرة أخرى";
    }

    if (
      message.includes("smtp") ||
      message.includes("email")
    ) {
      return "تعذر إرسال البريد، تحقق من إعدادات البريد ثم حاول مرة أخرى";
    }

    return "حدث خطأ أثناء إرسال الرابط، حاول مرة أخرى";
  }

  async function sendResetLink() {
    setErrorMsg("");
    setMessage("");

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

    if (!siteKey) {
      setErrorMsg("مفتاح التحقق غير موجود في إعدادات الموقع");
      return;
    }

    if (!captchaToken) {
      setErrorMsg("أكمل التحقق من أنك لست روبوتًا أولًا");
      return;
    }

    setLoading(true);

    const token = captchaToken;

    // منع إعادة استخدام رمز التحقق نفسه
    setCaptchaToken("");

    try {
      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/reset-password`
          : "https://watheeq-two.vercel.app/reset-password";

      const { error } =
        await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo,
          captchaToken: token,
        });

      if (error) {
        throw error;
      }

      setEmail(cleanEmail);
      setStep("success");
      setMessage(
        "تم إرسال رابط تغيير كلمة المرور إلى بريدك الإلكتروني ✅"
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      setErrorMsg(getArabicError(errorMessage));
      resetCaptcha();
    } finally {
      setLoading(false);
    }
  }

  function sendAgain() {
    setStep("email");
    setMessage("");
    setErrorMsg("");
    resetCaptcha();
  }

  return (
    <main
      className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-gray-100 flex items-center justify-center px-4 py-8"
      dir="rtl"
    >
      <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl sm:p-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-teal-700 text-3xl font-bold text-white shadow-lg">
            و
          </div>

          <h1 className="text-3xl font-bold text-gray-900">
            {step === "email"
              ? "نسيت كلمة المرور"
              : "تحقق من بريدك"}
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            {step === "email"
              ? "اكتب بريدك الإلكتروني وسنرسل لك رابطًا لتغيير كلمة المرور"
              : `أرسلنا رابط تغيير كلمة المرور إلى ${email}`}
          </p>
        </div>

        {step === "email" && (
          <>
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="البريد الإلكتروني"
              value={email}
              disabled={loading}
              onChange={(event) =>
                setEmail(cleanEmailValue(event.target.value))
              }
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  !loading &&
                  captchaToken
                ) {
                  void sendResetLink();
                }
              }}
              className="mb-4 w-full rounded-xl border border-gray-300 p-4 text-base text-gray-900 placeholder:text-gray-500 transition focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-200 disabled:bg-gray-100"
              dir="ltr"
            />

            {siteKey ? (
              <div className="mb-4 flex justify-center">
                <Turnstile
                  key={captchaKey}
                  siteKey={siteKey}
                  onSuccess={(token) => {
                    setCaptchaToken(token);
                    setErrorMsg("");
                  }}
                  onExpire={() => {
                    setCaptchaToken("");
                    setErrorMsg(
                      "انتهت صلاحية التحقق، أكمله مرة أخرى"
                    );
                  }}
                  onError={() => {
                    setCaptchaToken("");
                    setErrorMsg(
                      "تعذر تشغيل التحقق، حدّث الصفحة وحاول مرة أخرى"
                    );
                  }}
                  options={{
                    theme: "light",
                    size: "flexible",
                    language: "ar",
                  }}
                />
              </div>
            ) : (
              <p className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-center text-sm text-red-700">
                مفتاح Turnstile غير موجود في إعدادات الموقع
              </p>
            )}

            <button
              type="button"
              onClick={() => void sendResetLink()}
              disabled={loading || !captchaToken}
              className="w-full rounded-xl bg-teal-700 py-4 text-base font-semibold text-white transition hover:bg-teal-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "جاري إرسال الرابط..."
                : "إرسال رابط تغيير كلمة المرور"}
            </button>
          </>
        )}

        {step === "success" && (
          <>
            <div className="rounded-2xl border border-green-200 bg-green-50 p-5 text-center">
              <div className="mb-3 text-4xl">✉️</div>

              <p className="text-sm leading-7 text-green-800">
                افتح الرسالة واضغط رابط تغيير كلمة المرور.
                تحقق أيضًا من مجلد الرسائل غير المرغوب فيها.
              </p>
            </div>

            <button
              type="button"
              onClick={sendAgain}
              className="mt-4 w-full rounded-xl border border-gray-300 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              إعادة إرسال الرابط
            </button>

            <button
              type="button"
              onClick={() => router.replace("/login")}
              className="mt-3 w-full rounded-xl bg-teal-700 py-4 text-base font-semibold text-white transition hover:bg-teal-800 active:scale-[0.98]"
            >
              الرجوع لتسجيل الدخول
            </button>
          </>
        )}

        {errorMsg && (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-center text-sm text-red-700">
            {errorMsg}
          </p>
        )}

        {message && (
          <p className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3 text-center text-sm text-green-700">
            {message}
          </p>
        )}

        {step === "email" && (
          <button
            type="button"
            onClick={() => router.push("/login")}
            disabled={loading}
            className="mt-4 w-full rounded-xl border-2 border-teal-700 py-3 font-semibold text-teal-700 transition hover:bg-teal-700 hover:text-white disabled:opacity-60"
          >
            رجوع لتسجيل الدخول
          </button>
        )}
      </div>
    </main>
  );
}