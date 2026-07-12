"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Deal = {
  id: string;
  description: string;
  amount: number | string;
  commission: number | string;
  seller_amount: number | string;
  status: string;
  seller_id: string;
  buyer_id: string | null;
  payment_id?: string | null;
  payment_status?: string | null;
  payment_method?: string | null;
  paid_at?: string | null;
};

declare global {
  interface Window {
    Moyasar?: {
      init: (config: Record<string, any>) => void;
    };
  }
}

export default function PaymentPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const id = params.id as string;
  const moyasarPaymentId = searchParams.get("id");

  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSeller, setIsSeller] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [pageError, setPageError] = useState("");

  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [formError, setFormError] = useState("");
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [verifiedPaymentId, setVerifiedPaymentId] = useState("");

  useEffect(() => {
    async function getDealAndCheckUser() {
      setCheckingAuth(true);
      setPageError("");

      try {
        const currentUserId = sessionStorage.getItem("user_id");

        if (!currentUserId) {
          alert("يجب تسجيل الدخول أولاً لفتح رابط الدفع");
          window.location.href = "/login";
          return;
        }

        const { data: dealData, error: dealError } = await supabase
          .from("deals")
          .select("*")
          .eq("id", id)
          .single();

        if (dealError || !dealData) {
          throw new Error(dealError?.message || "لم يتم العثور على الصفقة");
        }

        const sellerId = String(dealData.seller_id || "").trim();
        const currentId = String(currentUserId).trim();

        if (currentId === sellerId) {
          setIsSeller(true);
          return;
        }

        if (!dealData.buyer_id) {
          const { data: updatedDeals, error: buyerError } = await supabase
            .from("deals")
            .update({
              buyer_id: currentUserId,
            })
            .eq("id", id)
            .is("buyer_id", null)
            .select("*");

          if (buyerError) {
            throw new Error(buyerError.message);
          }

          const updatedDeal = updatedDeals?.[0];

          if (!updatedDeal) {
            const { data: latestDeal, error: latestError } = await supabase
              .from("deals")
              .select("*")
              .eq("id", id)
              .maybeSingle();

            if (latestError) {
              throw new Error(latestError.message);
            }

            if (!latestDeal) {
              throw new Error("لم يتم العثور على الصفقة");
            }

            if (
              String(latestDeal.buyer_id || "").trim() ===
              String(currentUserId).trim()
            ) {
              setDeal(latestDeal);
              return;
            }

            if (latestDeal.buyer_id) {
              throw new Error("هذا الرابط مخصص لمشتري آخر");
            }

            throw new Error("تعذر ربط الصفقة بالمشتري");
          }

          setDeal(updatedDeal);
          return;
        }

        if (currentId !== String(dealData.buyer_id).trim()) {
          alert("هذا الرابط مخصص لمشتري آخر");
          window.location.href = "/deal";
          return;
        }

        setDeal(dealData);
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "حدث خطأ أثناء تحميل الصفقة";

        console.error(error);
        setPageError(message);
      } finally {
        setCheckingAuth(false);
      }
    }

    if (id) {
      getDealAndCheckUser();
    }
  }, [id]);

  useEffect(() => {
    if (!deal) return;
    if (!moyasarPaymentId) return;
    if (verifiedPaymentId === moyasarPaymentId) return;
    if (deal.status !== "pending") return;

    setVerifiedPaymentId(moyasarPaymentId);
    verifyPayment(moyasarPaymentId);
  }, [deal, moyasarPaymentId, verifiedPaymentId]);

  useEffect(() => {
    if (!showPaymentForm) return;
    if (!deal) return;
    if (deal.status !== "pending") return;

    const timer = setTimeout(() => {
      initMoyasarForm();
    }, 200);

    return () => clearTimeout(timer);
  }, [showPaymentForm, deal?.id]);

  function money(value?: number | string) {
    return Number(value || 0).toLocaleString("ar-SA");
  }

  function getStatus(status: string) {
    if (status === "pending") return "بانتظار الدفع";
    if (status === "paid") return "تم الدفع — المبلغ مجمد";
    if (status === "completed") return "مكتملة";
    if (status === "cancelled") return "ملغية";

    return status;
  }

  function loadMoyasarAssets() {
    return new Promise<void>((resolve, reject) => {
      const existingCss = document.getElementById("moyasar-css");
      const existingScript = document.getElementById("moyasar-js");

      if (!existingCss) {
        const link = document.createElement("link");
        link.id = "moyasar-css";
        link.rel = "stylesheet";
        link.href = "https://cdn.moyasar.com/mpf/1.15.0/moyasar.css";
        document.head.appendChild(link);
      }

      if (window.Moyasar) {
        resolve();
        return;
      }

      if (existingScript) {
        existingScript.addEventListener("load", () => resolve());
        existingScript.addEventListener("error", () =>
          reject(new Error("تعذر تحميل نموذج الدفع"))
        );
        return;
      }

      const script = document.createElement("script");
      script.id = "moyasar-js";
      script.src = "https://cdn.moyasar.com/mpf/1.15.0/moyasar.js";
      script.async = true;

      script.onload = () => resolve();
      script.onerror = () => reject(new Error("تعذر تحميل نموذج الدفع"));

      document.body.appendChild(script);
    });
  }

  async function initMoyasarForm() {
    if (!deal) return;

    setFormError("");

    try {
      const publishableKey = (
        process.env.NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY || ""
      ).trim();

      if (!publishableKey) {
        throw new Error("مفتاح الدفع العام غير موجود في ملف .env.local");
      }

      if (
        !publishableKey.startsWith("pk_test_") &&
        !publishableKey.startsWith("pk_live_")
      ) {
        throw new Error("مفتاح الدفع العام غير صحيح. لازم يبدأ بـ pk_test_");
      }

      await loadMoyasarAssets();

      const formElement = document.querySelector(".mysr-form");

      if (!formElement) {
        throw new Error("تعذر تجهيز نموذج الدفع");
      }

      formElement.innerHTML = "";

      const amountInHalalas = Math.round(Number(deal.amount || 0) * 100);

      if (amountInHalalas < 100) {
        throw new Error("أقل مبلغ مسموح للدفع هو 1 ريال");
      }

      const currentUserId = sessionStorage.getItem("user_id") || "";

      window.Moyasar?.init({
        element: ".mysr-form",
        amount: amountInHalalas,
        currency: "SAR",
        description: `Watheeq deal ${deal.id}`,
        publishable_api_key: publishableKey,
        callback_url: `${window.location.origin}/deal/pay/${deal.id}`,
        supported_networks: ["mada", "visa", "mastercard"],
        methods: ["creditcard"],
        language: "ar",
        fixed_width: false,
        metadata: {
          deal_id: deal.id,
          buyer_id: currentUserId,
          seller_id: deal.seller_id,
        },
        on_completed: async function (payment: any) {
          if (payment?.id && payment?.status === "paid") {
            await verifyPayment(payment.id);
          }
        },
        on_failure: async function (error: string) {
          setFormError(error || "فشلت عملية الدفع");
        },
      });

      setTimeout(() => {
        const form = document.querySelector(".mysr-form");

        if (!form) return;

        const text = form.textContent || "";
        const stillLoading = text.toLowerCase().includes("loading");
        const hasInput = form.querySelector("input");

        if (stillLoading && !hasInput) {
          setFormError(
            "نموذج الدفع تأخر في التحميل. حدث الصفحة وجرب بطاقة / مدى مرة ثانية."
          );
        }
      }, 12000);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "حدث خطأ في نموذج الدفع";

      setFormError(message);
    }
  }

  function openCardPayment() {
    setShowPaymentForm(true);
    setFormError("");
  }

  function openApplePay() {
    alert(
      "Apple Pay يحتاج تفعيل على الدومين الحقيقي من بوابة الدفع. جرّب الآن بطاقة / مدى أولاً."
    );
  }

  async function verifyPayment(paymentId: string) {
    if (!deal) return;
    if (loading || verifyingPayment) return;

    setVerifyingPayment(true);
    setLoading(true);

    try {
      const currentUserId = sessionStorage.getItem("user_id");

      if (!currentUserId) {
        throw new Error("يجب تسجيل الدخول");
      }

      if (String(currentUserId).trim() !== String(deal.buyer_id).trim()) {
        throw new Error("لا يمكنك تنفيذ هذا الإجراء");
      }

      const response = await fetch("/api/moyasar/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dealId: deal.id,
          paymentId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "فشل التحقق من الدفع");
      }

      setDeal(result.deal);
      setShowPaymentForm(false);

      window.history.replaceState(null, "", `/deal/pay/${deal.id}`);

      alert("تم الدفع بنجاح ✅");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "حدث خطأ أثناء التحقق من الدفع";

      alert(message);
    } finally {
      setVerifyingPayment(false);
      setLoading(false);
    }
  }

  async function confirmReceived() {
    if (!deal || loading) return;

    setLoading(true);

    try {
      const currentUserId = sessionStorage.getItem("user_id");

      if (!currentUserId) {
        throw new Error("يجب تسجيل الدخول");
      }

      if (String(currentUserId).trim() !== String(deal.buyer_id).trim()) {
        throw new Error("لا يمكنك تنفيذ هذا الإجراء");
      }

      const sellerAmount = Number(deal.seller_amount || 0);

      if (deal.status !== "paid") {
        throw new Error("يجب دفع الصفقة أولاً");
      }

      const { data: sellerWallet, error: walletReadError } = await supabase
        .from("wallets")
        .select("balance,frozen_balance")
        .eq("user_id", deal.seller_id)
        .maybeSingle();

      if (walletReadError) {
        throw walletReadError;
      }

      if (!sellerWallet) {
        const { error: walletInsertError } = await supabase
          .from("wallets")
          .insert({
            user_id: deal.seller_id,
            balance: sellerAmount,
            frozen_balance: 0,
            transferred_balance: 0,
            pending_transfer_balance: 0,
          });

        if (walletInsertError) {
          throw walletInsertError;
        }

        const { data: completedDeal, error: completedDealError } =
          await supabase
            .from("deals")
            .update({
              status: "completed",
              buyer_confirmed: true,
            })
            .eq("id", id)
            .eq("status", "paid")
            .select("*")
            .maybeSingle();

        if (completedDealError) {
          throw completedDealError;
        }

        if (!completedDeal) {
          throw new Error("تم تأكيد الصفقة مسبقًا");
        }

        setDeal(completedDeal);
        return;
      }

      const currentFrozen = Number(sellerWallet.frozen_balance || 0);

      if (currentFrozen < sellerAmount) {
        throw new Error("الرصيد المجمد غير كافٍ");
      }

      const { data: updatedDeal, error: dealUpdateError } = await supabase
        .from("deals")
        .update({
          status: "completed",
          buyer_confirmed: true,
        })
        .eq("id", id)
        .eq("status", "paid")
        .select("*")
        .maybeSingle();

      if (dealUpdateError) {
        throw dealUpdateError;
      }

      if (!updatedDeal) {
        throw new Error("تم تأكيد استلام هذه الصفقة مسبقًا");
      }

      const { error: walletUpdateError } = await supabase
        .from("wallets")
        .update({
          balance: Number(sellerWallet.balance || 0) + sellerAmount,
          frozen_balance: currentFrozen - sellerAmount,
        })
        .eq("user_id", deal.seller_id);

      if (walletUpdateError) {
        throw walletUpdateError;
      }

      setDeal(updatedDeal);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : JSON.stringify(error);

      alert(message);
    } finally {
      setLoading(false);
    }
  }

  if (checkingAuth) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div
          className="text-center text-base font-bold text-teal-700 animate-pulse"
          dir="rtl"
        >
          جاري تحميل بيانات الصفقة والتحقق من الأمان...
        </div>
      </main>
    );
  }

  if (isSeller) {
    return (
      <main
        className="min-h-screen bg-gray-100 p-4 flex items-center justify-center"
        dir="rtl"
      >
        <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 w-full max-w-md text-center border-t-4 border-red-500">
          <div className="text-red-500 text-5xl mb-4">
            ⚠️
          </div>

          <h1 className="text-2xl font-bold text-gray-800 mb-3">
            غير مسموح بالدخول
          </h1>

          <p className="text-gray-600 leading-7">
            أنت بائع هذه الصفقة. رابط الدفع مخصص للمشتري فقط.
          </p>
        </div>
      </main>
    );
  }

  if (pageError) {
    return (
      <main
        className="min-h-screen bg-gray-100 p-4 flex items-center justify-center"
        dir="rtl"
      >
        <div className="bg-white rounded-3xl shadow p-6 w-full max-w-md text-center">
          <div className="text-4xl mb-4">
            ❌
          </div>

          <h1 className="text-xl font-bold text-red-600">
            تعذر تحميل الصفقة
          </h1>

          <p className="text-gray-600 mt-3">
            {pageError}
          </p>
        </div>
      </main>
    );
  }

  if (!deal) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg font-bold text-red-600" dir="rtl">
          تعذر تحميل بيانات الصفقة
        </div>
      </main>
    );
  }

  return (
    <main
      className="
      min-h-screen
      bg-gray-100
      p-4
      sm:p-6
      flex
      justify-center
      overflow-x-hidden
      "
      dir="rtl"
    >
      <div className="bg-white rounded-3xl shadow-xl p-5 sm:p-8 w-full max-w-xl h-fit">
        <h1 className="text-2xl sm:text-3xl font-bold text-teal-700 mb-6 text-center">
          💳 دفع الصفقة
        </h1>

        <div className="space-y-5 text-right">
          <div>
            <p className="text-gray-500 text-sm">
              وصف المنتج
            </p>

            <p className="font-bold mt-1 break-words">
              {deal.description}
            </p>
          </div>

          <div>
            <p className="text-gray-500 text-sm">
              السعر
            </p>

            <p className="font-bold text-xl mt-1">
              {money(deal.amount)} ر.س
            </p>
          </div>

          <div>
            <p className="text-gray-500 text-sm">
              عمولة وثيق
            </p>

            <p className="font-bold mt-1">
              {money(deal.commission)} ر.س
            </p>
          </div>

          <div className="bg-green-50 rounded-2xl p-4">
            <p className="text-green-700 font-bold">
              المبلغ المستحق للبائع
            </p>

            <p className="text-xl font-bold mt-1">
              {money(deal.seller_amount)} ر.س
            </p>
          </div>

          <div className="bg-gray-100 rounded-2xl p-4">
            <p className="text-gray-500 text-sm">
              الحالة
            </p>

            <p className="font-bold text-teal-700 mt-1">
              {getStatus(deal.status)}
            </p>
          </div>

          {moyasarPaymentId && deal.status === "pending" && (
            <div className="bg-blue-50 text-blue-700 p-4 rounded-2xl text-center font-bold leading-7">
              {verifyingPayment
                ? "جاري التحقق من الدفع..."
                : "تم الرجوع من صفحة الدفع، انتظر تحديث الحالة."}
            </div>
          )}

          {deal.status === "pending" && (
            <div className="space-y-4">
              {!showPaymentForm && (
                <>
                  <div className="bg-yellow-50 text-yellow-800 rounded-2xl p-4 text-sm leading-7 text-center">
                    اختر طريقة الدفع المناسبة لك
                  </div>

                  <button
                    type="button"
                    onClick={openApplePay}
                    disabled={loading || verifyingPayment}
                    className="
                    w-full
                    bg-black
                    hover:bg-gray-900
                    disabled:opacity-60
                    disabled:cursor-not-allowed
                    text-white
                    py-4
                    rounded-2xl
                    font-bold
                    text-lg
                    transition
                    "
                  >
                     Apple Pay
                  </button>

                  <button
                    type="button"
                    onClick={openCardPayment}
                    disabled={loading || verifyingPayment}
                    className="
                    w-full
                    bg-teal-700
                    hover:bg-teal-800
                    disabled:opacity-60
                    disabled:cursor-not-allowed
                    text-white
                    py-4
                    rounded-2xl
                    font-bold
                    text-lg
                    transition
                    "
                  >
                    💳 بطاقة / مدى
                  </button>
                </>
              )}

              {showPaymentForm && (
                <div className="bg-gray-50 border border-gray-100 rounded-3xl p-4">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <h2 className="font-bold text-gray-900">
                      الدفع بالبطاقة / مدى
                    </h2>

                    <button
                      type="button"
                      onClick={() => {
                        setShowPaymentForm(false);
                        setFormError("");
                      }}
                      className="bg-white text-gray-700 px-4 py-2 rounded-2xl font-bold text-sm"
                    >
                      تغيير
                    </button>
                  </div>

                  {formError && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-2xl mb-4 text-sm font-bold leading-6 text-center">
                      {formError}
                    </div>
                  )}

                  <div className="mysr-form" />

                  {verifyingPayment && (
                    <p className="text-center text-teal-700 font-bold mt-4">
                      جاري التحقق من الدفع...
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {deal.status === "paid" && (
            <div className="space-y-4">
              <div className="bg-yellow-100 text-yellow-800 p-4 rounded-2xl text-center font-bold leading-7">
                🔒 تم الدفع بنجاح
                <br />
                المبلغ مجمد للبائع داخل وثيق، وعمولة وثيق مسجلة في أرباح الإدارة.
              </div>

              {deal.payment_id && (
                <div className="bg-gray-50 rounded-2xl p-4 text-center">
                  <p className="text-gray-500 text-sm">
                    رقم عملية الدفع
                  </p>

                  <p className="font-bold text-gray-900 mt-1 break-all">
                    {deal.payment_id}
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={confirmReceived}
                disabled={loading}
                className="
                w-full
                bg-green-600
                hover:bg-green-700
                disabled:opacity-60
                disabled:cursor-not-allowed
                text-white
                py-4
                rounded-2xl
                font-bold
                text-lg
                transition
                "
              >
                {loading ? "جاري التأكيد..." : "✅ تم الاستلام"}
              </button>
            </div>
          )}

          {deal.status === "completed" && (
            <div className="bg-green-100 text-green-800 p-4 rounded-2xl text-center font-bold leading-7">
              ✅ اكتملت الصفقة
              <br />
              💰 تم نقل مبلغ البائع من الرصيد المجمد إلى الرصيد المتاح.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}