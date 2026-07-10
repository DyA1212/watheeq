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

  const commission = amount ? Number(amount) * 0.10 : 0;
  const sellerAmount = amount ? Number(amount) - commission : 0;

  async function addAdminProfit() {

    console.log("بدأ تحديث أرباح الإدارة");

    const { data: wallet, error } = await supabase
      .from("admin_wallet")
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    if (error) {
      console.log("خطأ قراءة المحفظة:", error);
      return;
    }

    if (wallet) {

      const { error: updateError } = await supabase
        .from("admin_wallet")
        .update({
          total_profit:
            Number(wallet.total_profit) + Number(commission),
          updated_at: new Date().toISOString(),
        })
        .eq("id", 1);

      console.log("نتيجة التحديث:", updateError);

    } else {

      const { error: insertError } = await supabase
        .from("admin_wallet")
        .insert([
          {
            id: 1,
            total_profit: Number(commission),
            updated_at: new Date().toISOString(),
          },
        ]);

      console.log("نتيجة الإنشاء:", insertError);

    }

  }async function createDeal() {

  if (role === "") {
    alert("اختر هل أنت بائع أو مشتري");
    return;
  }

  if (role === "seller") {

    if (!amount || !description) {
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

    const userId = sessionStorage.getItem("user_id");

    if (!userId) {
      alert("لم يتم العثور على حساب المستخدم");
      return;
    }

    const { data, error } = await supabase
      .from("deals")
      .insert([
        {
          role: "seller",
          seller_id: userId,
          amount: Number(amount),
          description,
          commission: Number(commission),
          seller_amount: Number(sellerAmount),
          status: "pending",
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.log(error);
      alert(error.message);
      return;
    }

    // تحديث أرباح الإدارة
    await addAdminProfit();

    const paymentLink =
      `${window.location.origin}/deal/pay/${data.id}`;

    await navigator.clipboard.writeText(paymentLink);

    alert(
      `تم إنشاء الصفقة بنجاح ✅

رابط الدفع:
${paymentLink}

تم نسخ الرابط`
    );

    router.push("/deals");
    return;
  }

  if (role === "buyer") {

    if (!dealLink.trim()) {
      alert("أدخل رابط الصفقة");
      return;
    }

    const dealId = dealLink.split("/").pop();

    router.push(`/deal/pay/${dealId}`);
  }

}return (
  <main className="min-h-screen bg-gray-100 flex justify-center items-center p-6">
    <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-xl">

      <h1 className="text-3xl font-bold text-center text-teal-700 mb-2">
        إنشاء صفقة جديدة
      </h1>

      <p className="text-center text-gray-500 mb-8">
        اختر دورك في الصفقة
      </p>

      <div className="grid grid-cols-2 gap-4 mb-8">

        <button
          onClick={() => setRole("seller")}
          className={`rounded-xl p-4 border font-bold ${
            role === "seller"
              ? "bg-teal-700 text-white"
              : "bg-white"
          }`}
        >
          🏷️ أنا بائع
        </button>

        <button
          onClick={() => setRole("buyer")}
          className={`rounded-xl p-4 border font-bold ${
            role === "buyer"
              ? "bg-teal-700 text-white"
              : "bg-white"
          }`}
        >
          🛒 أنا مشتري
        </button>

      </div>

      {role === "seller" && (
        <>

          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setImages(e.target.files)}
            className="w-full border rounded-xl p-3 mb-3"
          />

          <textarea
            placeholder="اكتب وصفاً دقيقاً للمنتج"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded-xl p-3 mb-4 h-32"
          />

          <input
            type="number"
            placeholder="سعر المنتج (ريال)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border rounded-xl p-3 mb-4"
          />

          {amount && (
            <div className="bg-gray-100 rounded-xl p-4 mb-6">

              <p>
                عمولة وثيق:
                <b> {commission.toFixed(2)} ر.س (10%)</b>
              </p>

              <p className="text-green-700 font-bold mt-2">
                سيصل للبائع:
                {" "}
                {sellerAmount.toFixed(2)} ر.س
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
          onChange={(e) => setDealLink(e.target.value)}
          className="w-full border rounded-xl p-3 mb-6"
        />
      )}

      <button
        onClick={createDeal}
        className="w-full bg-teal-700 hover:bg-teal-800 text-white py-4 rounded-xl font-bold text-lg"
      >
        متابعة
      </button>

    </div>
  </main>
);

}
