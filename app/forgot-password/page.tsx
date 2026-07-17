"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Turnstile } from "@marsidev/react-turnstile";
import { supabase } from "@/lib/supabase";

type Step = "email" | "code" | "password" | "success";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("email");

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaKey, setCaptchaKey] = useState(0);

  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  function clearMessages() {
    setMessage("");
    setErrorMsg("");
  }

  function resetCaptcha() {
    setCaptchaToken("");
    setCaptchaKey((current) => current + 1);
  }

  function cleanEmailValue(value: string) {
    return value
      .replace(/[^a-zA-Z0-9@._+-]/g, "")
      .toLowerCase();
  }

  function getArabicError(errorMessage: string) {
    const lowerMessage = errorMessage.toLowerCase();

    if (
      lowerMessage.includes("captcha") ||
      lowerMessage.includes("challenge")
    ) {
      return "تحقق من أنك لست روبوتًا ثم حاول مرة أخرى";
    }

    if (
      lowerMessage.includes("rate limit") ||
      lowerMessage.includes("too many")
    ) {
      return "تم طلب أكواد كثيرة، انتظر قليلًا ثم حاول مرة أخرى";
    }

    if (
      lowerMessage.includes("expired") ||
      lowerMessage.includes("otp_expired")
    ) {
      return "انتهت صلاحية الكود، اطلب كودًا جديدًا";
    }

    if (
      lowerMessage.includes("invalid") ||
      lowerMessage.includes("token")
    ) {
      return "الكود غير صحيح أو انتهت صلاحيته";
    }

    if (lowerMessage.includes("same password")) {
      return "كلمة المرور الجديدة يجب أن تختلف عن القديمة";
    }

    if (lowerMessage.includes("password")) {
      return "تعذر تغيير كلمة المرور، تأكد أنها 8 أحرف على الأقل";
    }

    return "حدث خطأ، حاول مرة أخرى";
  }

  async function sendResetCode() {
    clearMessages();

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
      setErrorMsg("انتظر حتى يكتمل التحقق من أنك لست روبوتًا");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        cleanEmail,
        {
          captchaToken,
        }
      );

      if (error) {
        throw error;
      }

      setEmail(cleanEmail);
      setCode("");
      setStep("code");
      setMessage("تم إرسال كود من 6 أرقام إلى بريدك الإلكتروني ✅");
      resetCaptcha();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      setErrorMsg(getArabicError(errorMessage));
      resetCaptcha();
    } finally {
      setLoading(false);
    }
  }

  async function verifyResetCode() {
    clearMessages();

    const cleanCode = code.replace(/\D/g, "").slice(0, 6);

    if (cleanCode.length !== 6) {
      setErrorMsg("اكتب الكود المكوّن من 6 أرقام");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: cleanCode,
        type: "recovery",
      });

      if (error) {
        throw error;
      }

      if (!data.session) {
        setErrorMsg("تعذر تأكيد الكود، اطلب كودًا جديدًا");
        return;
      }

      setStep("password");
      setMessage("تم تأكيد الكود، اكتب كلمة المرور الجديدة");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      setErrorMsg(getArabicError(errorMessage));
    } finally {
      setLoading(false);
    }
  }

  async function changePassword() {
    clearMessages();

    if (newPassword.length < 8) {
      setErrorMsg("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
      return;
    }

    if (/\s/.test(newPassword)) {
      setErrorMsg("كلمة المرور لا يجب أن تحتوي على مسافات");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("كلمتا المرور غير متطابقتين");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      await supabase.auth.signOut();

      setStep("success");
      setMessage("تم تغيير كلمة المرور بنجاح ✅");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      setErrorMsg(getArabicError(errorMessage));
    } finally {
      setLoading(false);
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
            {step === "email" && "نسيت كلمة المرور"}
            {step === "code" && "تأكيد الكود"}
            {step === "password" && "كلمة مرور جديدة"}
            {step === "success" && "تم تغيير كلمة المرور"}
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            {step === "email" &&
              "اكتب بريدك الإلكتروني وسيصلك كود تحقق"}
            {step === "code" &&
              `اكتب الكود المرسل إلى ${email}`}
            {step === "password" &&
              "اكتب كلمة المرور الجديدة وأكدها"}
            {step === "success" &&
              "يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة"}
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
              onChange={(event) =>
                setEmail(cleanEmailValue(event.target.value))
              }
              onKeyDown={(event) => {
                if (event.key === "Enter" && !loading) {
                  void sendResetCode();
                }
              }}
              className="mb-4 w-full rounded-xl border border-gray-300 p-4 text-base text-gray-900 placeholder:text-gray-500 transition focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-200"
              dir="ltr"
            />

            {siteKey && (
              <div className="mb-4 flex justify-center">
                <Turnstile
                  key={captchaKey}
                  siteKey={siteKey}
                  onSuccess={(token) => {
                    setCaptchaToken(token);
                    setErrorMsg("");
                  }}
                  onExpire={() => setCaptchaToken("")}
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
            )}

            <button
              type="button"
              onClick={sendResetCode}
              disabled={loading}
              className="w-full rounded-xl bg-teal-700 py-4 text-base font-semibold text-white transition hover:bg-teal-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "جاري الإرسال..." : "إرسال الكود"}
            </button>
          </>
        )}

        {step === "code" && (
          <>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="000000"
              maxLength={6}
              value={code}
              onChange={(event) =>
                setCode(
                  event.target.value.replace(/\D/g, "").slice(0, 6)
                )
              }
              onKeyDown={(event) => {
                if (event.key === "Enter" && !loading) {
                  void verifyResetCode();
                }
              }}
              className="mb-4 w-full rounded-xl border border-gray-300 p-4 text-center text-3xl font-bold tracking-[0.35em] text-gray-900 transition focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-200"
              dir="ltr"
            />

            <button
              type="button"
              onClick={verifyResetCode}
              disabled={loading}
              className="w-full rounded-xl bg-teal-700 py-4 text-base font-semibold text-white transition hover:bg-teal-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "جاري التحقق..." : "تأكيد الكود"}
            </button>

            <button
              type="button"
              onClick={() => {
                clearMessages();
                setStep("email");
                setCode("");
                resetCaptcha();
              }}
              disabled={loading}
              className="mt-3 w-full rounded-xl border border-gray-300 py-3 font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
            >
              إعادة إرسال الكود
            </button>
          </>
        )}

        {step === "password" && (
          <>
            <input
              type="password"
              autoComplete="new-password"
              placeholder="كلمة المرور الجديدة"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              className="mb-4 w-full rounded-xl border border-gray-300 p-4 text-base text-gray-900 transition focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-200"
              dir="ltr"
            />

            <input
              type="password"
              autoComplete="new-password"
              placeholder="تأكيد كلمة المرور الجديدة"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === "Enter" && !loading) {
                  void changePassword();
                }
              }}
              className="mb-4 w-full rounded-xl border border-gray-300 p-4 text-base text-gray-900 transition focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-200"
              dir="ltr"
            />

            <p className="mb-4 text-center text-xs text-gray-500">
              يجب أن تكون كلمة المرور 8 أحرف على الأقل
            </p>

            <button
              type="button"
              onClick={changePassword}
              disabled={loading}
              className="w-full rounded-xl bg-teal-700 py-4 text-base font-semibold text-white transition hover:bg-teal-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "جاري تغيير كلمة المرور..."
                : "تغيير كلمة المرور"}
            </button>
          </>
        )}

        {step === "success" && (
          <button
            type="button"
            onClick={() => router.replace("/login")}
            className="w-full rounded-xl bg-teal-700 py-4 text-base font-semibold text-white transition hover:bg-teal-800 active:scale-[0.98]"
          >
            تسجيل الدخول
          </button>
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

        {step !== "success" && (
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
    </div>
  );
}