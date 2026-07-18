"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type LinkStatus = "checking" | "ready" | "invalid" | "success";

export default function ResetPasswordPage() {
  const router = useRouter();

  const changingRef = useRef(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [linkStatus, setLinkStatus] =
    useState<LinkStatus>("checking");

  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function prepareRecoverySession() {
      try {
        const params = new URLSearchParams(
          window.location.search
        );

        const code = params.get("code");

        /*
          أولًا نتأكد هل Supabase أنشأ جلسة تلقائيًا
          من رابط استعادة كلمة المرور.
        */
        const {
          data: { session: currentSession },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (currentSession) {
          setLinkStatus("ready");
          setErrorMsg("");
          return;
        }

        /*
          عند استخدام PKCE يرجع المستخدم إلى الصفحة
          ومعه code في الرابط. نحوله إلى جلسة.
        */
        if (code) {
          const {
            data,
            error: exchangeError,
          } = await supabase.auth.exchangeCodeForSession(code);

          if (!mounted) return;

          if (!exchangeError && data.session) {
            setLinkStatus("ready");
            setErrorMsg("");

            /*
              نحذف code من شريط الرابط حتى لا تتم
              محاولة استخدامه مرة ثانية عند تحديث الصفحة.
            */
            window.history.replaceState(
              {},
              document.title,
              window.location.pathname
            );

            return;
          }

          /*
            قد يكون Supabase عالج الرمز تلقائيًا،
            لذلك نتحقق من الجلسة مرة ثانية.
          */
          const {
            data: { session: sessionAfterExchange },
          } = await supabase.auth.getSession();

          if (!mounted) return;

          if (sessionAfterExchange) {
            setLinkStatus("ready");
            setErrorMsg("");
            return;
          }

          if (exchangeError) {
            console.error(
              "Recovery code exchange error:",
              exchangeError
            );
          }
        }

        if (sessionError) {
          console.error(
            "Recovery session error:",
            sessionError
          );
        }

        /*
          نعطي Supabase وقتًا قصيرًا لمعالجة روابط
          الاستعادة التي تستخدم البيانات بعد علامة #.
        */
        window.setTimeout(async () => {
          if (!mounted) return;

          const {
            data: { session: delayedSession },
          } = await supabase.auth.getSession();

          if (!mounted) return;

          if (delayedSession) {
            setLinkStatus("ready");
            setErrorMsg("");
          } else {
            setLinkStatus("invalid");
          }
        }, 1500);
      } catch (error) {
        console.error(
          "Password recovery initialization error:",
          error
        );

        if (mounted) {
          setLinkStatus("invalid");
        }
      }
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (
        (event === "PASSWORD_RECOVERY" ||
          event === "SIGNED_IN" ||
          event === "INITIAL_SESSION") &&
        session
      ) {
        setLinkStatus("ready");
        setErrorMsg("");
      }

      if (event === "SIGNED_OUT") {
        setLinkStatus((currentStatus) =>
          currentStatus === "success"
            ? "success"
            : currentStatus
        );
      }
    });

    void prepareRecoverySession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  function cleanPasswordValue(value: string) {
    return value
      .replace(/[\u0600-\u06FF]/g, "")
      .replace(/\s/g, "");
  }

  function getArabicError(errorMessage: string) {
    const lowerMessage = errorMessage.toLowerCase();

    if (
      lowerMessage.includes("same password") ||
      lowerMessage.includes("different from the old")
    ) {
      return "كلمة المرور الجديدة يجب أن تختلف عن كلمة المرور القديمة";
    }

    if (
      lowerMessage.includes("weak") ||
      lowerMessage.includes("password should be") ||
      lowerMessage.includes("password must be")
    ) {
      return "كلمة المرور ضعيفة، استخدم 8 أحرف على الأقل";
    }

    if (
      lowerMessage.includes("session") ||
      lowerMessage.includes("jwt") ||
      lowerMessage.includes("token") ||
      lowerMessage.includes("code") ||
      lowerMessage.includes("expired")
    ) {
      return "انتهت صلاحية الرابط، اطلب رابطًا جديدًا";
    }

    return "تعذر تغيير كلمة المرور، حاول مرة أخرى";
  }

  async function changePassword() {
    if (changingRef.current || loading) {
      return;
    }

    setMessage("");
    setErrorMsg("");

    if (linkStatus !== "ready") {
      setErrorMsg(
        "رابط تغيير كلمة المرور غير صالح أو انتهت صلاحيته"
      );
      return;
    }

    if (!password || !confirmPassword) {
      setErrorMsg("اكتب كلمة المرور الجديدة وتأكيدها");
      return;
    }

    if (password.length < 8) {
      setErrorMsg("كلمة المرور لازم تكون 8 أحرف أو أكثر");
      return;
    }

    if (/\s/.test(password)) {
      setErrorMsg(
        "كلمة المرور لا يجب أن تحتوي على مسافات"
      );
      return;
    }

    if (/[\u0600-\u06FF]/.test(password)) {
      setErrorMsg(
        "كلمة المرور لا يجب أن تحتوي على أحرف عربية"
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("كلمتا المرور غير متطابقتين");
      return;
    }

    changingRef.current = true;
    setLoading(true);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        setLinkStatus("invalid");
        setErrorMsg(
          "انتهت صلاحية الرابط، اطلب رابطًا جديدًا"
        );
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        throw error;
      }

      setPassword("");
      setConfirmPassword("");
      setLinkStatus("success");
      setMessage("تم تغيير كلمة المرور بنجاح ✅");

      await supabase.auth.signOut();

      window.setTimeout(() => {
        router.replace("/login");
      }, 1500);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unknown error";

      setErrorMsg(getArabicError(errorMessage));
    } finally {
      changingRef.current = false;
      setLoading(false);
    }
  }

  function goToForgotPassword() {
    router.replace("/forgot-password");
  }

  if (linkStatus === "checking") {
    return (
      <main
        className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-gray-100 flex items-center justify-center px-4 py-8"
        dir="rtl"
      >
        <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-2xl">
          <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-teal-100 border-t-teal-700" />

          <h1 className="text-xl font-bold text-gray-900">
            جاري التحقق من الرابط
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            انتظر لحظات من فضلك
          </p>
        </div>
      </main>
    );
  }

  if (linkStatus === "invalid") {
    return (
      <main
        className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-gray-100 flex items-center justify-center px-4 py-8"
        dir="rtl"
      >
        <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl sm:p-8">
          <div className="mb-7 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-4xl">
              ⚠️
            </div>

            <h1 className="text-2xl font-bold text-gray-900">
              الرابط غير صالح
            </h1>

            <p className="mt-3 text-sm leading-7 text-gray-500">
              رابط تغيير كلمة المرور غير صحيح أو انتهت
              صلاحيته. اطلب رابطًا جديدًا ثم افتحه من البريد.
            </p>
          </div>

          <button
            type="button"
            onClick={goToForgotPassword}
            className="w-full rounded-xl bg-teal-700 py-4 text-base font-semibold text-white transition hover:bg-teal-800 active:scale-[0.98]"
          >
            طلب رابط جديد
          </button>

          <button
            type="button"
            onClick={() => router.replace("/login")}
            className="mt-4 w-full rounded-xl border-2 border-teal-700 py-3 font-semibold text-teal-700 transition hover:bg-teal-700 hover:text-white"
          >
            رجوع لتسجيل الدخول
          </button>
        </div>
      </main>
    );
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
            {linkStatus === "success"
              ? "تم تغيير كلمة المرور"
              : "تغيير كلمة المرور"}
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            {linkStatus === "success"
              ? "سيتم تحويلك إلى تسجيل الدخول"
              : "اكتب كلمة مرور جديدة لحسابك"}
          </p>
        </div>

        {linkStatus === "ready" && (
          <>
            <input
              type="password"
              autoComplete="new-password"
              placeholder="كلمة المرور الجديدة"
              value={password}
              disabled={loading}
              onChange={(event) => {
                setPassword(
                  cleanPasswordValue(event.target.value)
                );
                setErrorMsg("");
              }}
              className="mb-4 w-full rounded-xl border border-gray-300 p-4 text-base text-gray-900 placeholder:text-gray-500 transition focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-200 disabled:bg-gray-100"
              dir="ltr"
            />

            <input
              type="password"
              autoComplete="new-password"
              placeholder="تأكيد كلمة المرور الجديدة"
              value={confirmPassword}
              disabled={loading}
              onChange={(event) => {
                setConfirmPassword(
                  cleanPasswordValue(event.target.value)
                );
                setErrorMsg("");
              }}
              className="mb-4 w-full rounded-xl border border-gray-300 p-4 text-base text-gray-900 placeholder:text-gray-500 transition focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-200 disabled:bg-gray-100"
              dir="ltr"
            />

            <p className="mb-4 text-center text-xs leading-6 text-gray-500">
              استخدم 8 أحرف على الأقل، ومن دون مسافات أو
              أحرف عربية
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

        {linkStatus === "success" && (
          <div className="rounded-2xl border border-green-200 bg-green-50 p-5 text-center">
            <div className="mb-3 text-4xl">✅</div>

            <p className="text-sm leading-7 text-green-800">
              تم حفظ كلمة المرور الجديدة، ويمكنك الآن تسجيل
              الدخول بها.
            </p>
          </div>
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

        {linkStatus === "ready" && (
          <button
            type="button"
            onClick={() => router.replace("/login")}
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