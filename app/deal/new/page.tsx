"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function DealPage() {
  const router = useRouter();

  const [role, setRole] = useState<"" | "seller" | "buyer">("");
  const [dealLink, setDealLink] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);

  const numericAmount = Number(amount) || 0;
  const commission = numericAmount * 0.1;
  const sellerAmount = numericAmount - commission;

  async function createDeal() {
    if (loading) {
      return;
    }

    if (role === "") {
      alert("اختر هل أنت بائع أو مشتري");
      return;
    }

    if (role === "seller") {
      if (!amount || !description.trim()) {
        alert("يرجى تعبئة جميع البيانات");
        return;
      }

      if (!images || images.length === 0) {
        alert("يرجى رفع صورة واحدة على الأقل");
        return;
      }

      if (images.length > 10) {
        alert("الحد الأقصى 10 صور");
        return;
      }

      const cleanAmount = Number(amount);

      if (!Number.isFinite(cleanAmount) || cleanAmount <= 0) {
        alert("سعر المنتج غير صحيح");
        return;
      }

      setLoading(true);

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          alert("انتهت جلسة تسجيل الدخول، سجل الدخول مرة ثانية");
          router.push("/login");
          return;
        }

        const calculatedCommission = cleanAmount * 0.1;
        const calculatedSellerAmount =
          cleanAmount - calculatedCommission;

        const { data, error } = await supabase
          .from("deals")
          .insert([
            {
              role: "seller",
              seller_id: user.id,
              user_id: user.id,
              amount: cleanAmount,
              description: description.trim(),
              commission: calculatedCommission,
              seller_amount: calculatedSellerAmount,
              status: "pending",
              buyer_confirmed: false,
              created_at: new Date().toISOString(),
            },
          ])
          .select()
          .single();

        if (error) {
          console.error("خطأ إنشاء الصفقة:", error);
          alert(`تعذر إنشاء الصفقة: ${error.message}`);
          return;
        }

        if (!data?.id) {
          alert("تم إنشاء الصفقة، لكن تعذر الحصول على رابطها");
          return;
        }

        const paymentLink = `${window.location.origin}/deal/pay/${data.id}`;

        let copied = false;

        try {
          await navigator.clipboard.writeText(paymentLink);
          copied = true;
        } catch (copyError) {
          console.error("تعذر نسخ الرابط:", copyError);
        }

        alert(
          copied
            ? `تم إنشاء الصفقة بنجاح ✅

رابط الدفع:
${paymentLink}

تم نسخ الرابط`
            : `تم إنشاء الصفقة بنجاح ✅

رابط الدفع:
${paymentLink}

انسخ الرابط وأرسله للمشتري`
        );

        router.push("/deals");
      } catch (error) {
        console.error("خطأ غير متوقع:", error);
        alert("حدث خطأ غير متوقع، حاول مرة ثانية");
      } finally {
        setLoading(false);
      }

      return;
    }

    if (role === "buyer") {
      const cleanLink = dealLink.trim();

      if (!cleanLink) {
        alert("أدخل رابط الصفقة");
        return;
      }

      try {
        const url = new URL(cleanLink);
        const parts = url.pathname.split("/").filter(Boolean);
        const dealId = parts[parts.length - 1];

        if (!dealId) {
          alert("رابط الصفقة غير صحيح");
          return;
        }

        router.push(`/deal/pay/${dealId}`);
      } catch {
        const parts = cleanLink.split("/").filter(Boolean);
        const dealId = parts[parts.length - 1];

        if (!dealId) {
          alert("رابط الصفقة غير صحيح");
          return;
        }

        router.push(`/deal/pay/${dealId}`);
      }
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 flex justify-center items-center p-4 sm:p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-xl">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-teal-700 mb-2">
          إنشاء صفقة جديدة
        </h1>

        <p className="text-center text-gray-500 mb-8">
          اختر دورك في الصفقة
        </p>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-8">
          <button
            type="button"
            onClick={() => setRole("seller")}
            disabled={loading}
            className={`rounded-xl p-4 border font-bold transition disabled:opacity-60 ${
              role === "seller"
                ? "bg-teal-700 border-teal-700 text-white"
                : "bg-white border-gray-300 text-gray-800 hover:border-teal-600"
            }`}
          >
            🏷️ أنا بائع
          </button>

          <button
            type="button"
            onClick={() => setRole("buyer")}
            disabled={loading}
            className={`rounded-xl p-4 border font-bold transition disabled:opacity-60 ${
              role === "buyer"
                ? "bg-teal-700 border-teal-700 text-white"
                : "bg-white border-gray-300 text-gray-800 hover:border-teal-600"
            }`}
          >
            🛒 أنا مشتري
          </button>
        </div>

        {role === "seller" && (
          <>
            <label className="block mb-2 font-semibold text-gray-700">
              صور المنتج
            </label>

            <input
              type="file"
              accept="image/*"
              multiple
              disabled={loading}
              onChange={(e) => setImages(e.target.files)}
              className="w-full border border-gray-300 rounded-xl p-3 mb-4 disabled:bg-gray-100"
            />

            <p className="text-xs text-gray-500 mb-4">
              يمكنك اختيار من صورة واحدة إلى 10 صور
            </p>

            <textarea
              placeholder="اكتب وصفًا دقيقًا للمنتج"
              value={description}
              disabled={loading}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-3 mb-4 h-32 resize-none outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100 disabled:bg-gray-100"
            />

            <input
              type="number"
              inputMode="decimal"
              min="1"
              step="0.01"
              placeholder="سعر المنتج (ريال)"
              value={amount}
              disabled={loading}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-3 mb-4 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100 disabled:bg-gray-100"
            />

            {numericAmount > 0 && (
              <div className="bg-gray-100 rounded-xl p-4 mb-6">
                <p className="text-gray-700">
                  عمولة وثيق:
                  <b> {commission.toFixed(2)} ر.س (10%)</b>
                </p>

                <p className="text-green-700 font-bold mt-2">
                  سيصل للبائع: {sellerAmount.toFixed(2)} ر.س
                </p>
              </div>
            )}
          </>
        )}

        {role === "buyer" && (
          <input
            type="text"
            placeholder="الصق رابط الصفقة هنا"
            value={dealLink}
            disabled={loading}
            onChange={(e) => setDealLink(e.target.value)}
            className="w-full border border-gray-300 rounded-xl p-3 mb-6 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100 disabled:bg-gray-100"
            dir="ltr"
          />
        )}

        <button
          type="button"
          onClick={createDeal}
          disabled={loading}
          className="w-full bg-teal-700 hover:bg-teal-800 text-white py-4 rounded-xl font-bold text-lg transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "جاري إنشاء الصفقة..." : "متابعة"}
        </button>
      </div>
    </main>
  );
}