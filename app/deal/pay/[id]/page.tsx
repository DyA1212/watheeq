"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function PaymentPage() {
  const params = useParams();
  const id = params.id as string;
  const [deal, setDeal] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  const [isSeller, setIsSeller] = useState(false); 
  const [checkingAuth, setCheckingAuth] = useState(true); 

  useEffect(() => {
    async function getDealAndCheckUser() {
      try {
        // 1. جلب بيانات الصفقة
        const { data: dealData, error: dealError } = await supabase
          .from("deals")
          .select("*")
          .eq("id", id)
          .single();

        if (dealError) {
          console.error("خطأ في جلب الصفقة:", dealError);
          return;
        }

       const currentUserId = sessionStorage.getItem("user_id");

if (!currentUserId) {
  alert("يجب تسجيل الدخول أولاً لفتح رابط الدفع");
  window.location.href = "/login";
  return;
}

// منع البائع من فتح رابط الدفع
if (
  String(currentUserId).trim() ===
  String(dealData.seller_id).trim()
) {
  setIsSeller(true);
  return;
}

// أول مشتري يفتح الرابط يتم ربط الصفقة بحسابه
if (!dealData.buyer_id) {
  const { data: updatedDeal, error: buyerError } = await supabase
    .from("deals")
    .update({
      buyer_id: currentUserId,
    })
    .eq("id", id)
    .is("buyer_id", null)
    .select()
    .single();

  if (buyerError || !updatedDeal) {
    alert("تعذر ربط الصفقة بالمشتري");
    return;
  }

  setDeal(updatedDeal);
  return;
}

// منع أي حساب غير المشتري المرتبط
if (
  String(currentUserId).trim() !==
  String(dealData.buyer_id).trim()
) {
  alert("هذا الرابط مخصص لمشتري آخر");
  window.location.href = "/deal";
  return;
}

setDeal(dealData);
        
      } catch (err) {
        console.error("حدث خطأ أثناء التحقق من الهوية:", err);
      } finally {
        setCheckingAuth(false);
      }
    }

    if (id) {
      getDealAndCheckUser();
    }
  }, [id]);

  async function updateStatus(newStatus: string) {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("deals")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      if (newStatus === "paid") {
        const { data: wallet } = await supabase
          .from("admin_wallet")
          .select("*")
          .eq("id", 1)
          .maybeSingle();

        if (wallet) {
          await supabase
            .from("admin_wallet")
            .update({
              total_profit: Number(wallet.total_profit || 0) + Number(deal.commission || 0),
              updated_at: new Date().toISOString(),
            })
            .eq("id", 1);
        } else {
          await supabase
            .from("admin_wallet")
            .insert({
              id: 1,
              total_profit: Number(deal.commission || 0),
              updated_at: new Date().toISOString(),
            });
        }
      }

      if (newStatus === "completed") {
        const { data: wallet } = await supabase
          .from("wallets")
          .select("balance")
          .eq("user_id", deal.seller_id)
          .maybeSingle();

        if (wallet) {
          await supabase
            .from("wallets")
            .update({
              balance: Number(wallet.balance || 0) + Number(deal.seller_amount || 0),
            })
            .eq("user_id", deal.seller_id);
        } else {
          await supabase
            .from("wallets")
            .insert({
              user_id: deal.seller_id,
              balance: Number(deal.seller_amount || 0),
            });
        }
      }

      setDeal({ ...deal, status: newStatus });
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  function getStatus(status: string) {
    if (status === "pending") return "بانتظار الدفع";
    if (status === "paid") return "مجمّد";
    if (status === "completed") return "مكتملة";
    return status;
  }

 if (checkingAuth) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div
        className="text-lg font-bold text-teal-700 animate-pulse"
        dir="rtl"
      >
        جاري تحميل بيانات الصفقة والتحقق من الأمان...
      </div>
    </main>
  );
}

// حظر البائع
if (isSeller) {
  return (
    <main
      className="min-h-screen bg-gray-100 p-6 flex items-center justify-center"
      dir="rtl"
    >
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md text-center border-t-4 border-red-500">
        <div className="text-red-500 text-5xl mb-4">⚠️</div>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          غير مسموح بالدخول
        </h1>

        <p className="text-gray-600 leading-relaxed">
          أنت بائع هذه الصفقة. هذا الرابط مخصص فقط للمشتري لإتمام
          عملية الدفع وتأكيد استلام السلعة.
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

  // إذا لم تكن البائع (مشتري أو زائر) سيعرض لك الصفحة ولن يحجبها بـ "يرجى تسجيل الدخول"
  return (
    <main className="min-h-screen bg-gray-100 p-6 flex justify-center">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-xl">
        <h1 className="text-3xl font-bold text-teal-700 mb-6 text-center">
          💳 دفع الصفقة
        </h1>

        <div className="space-y-5 text-right" dir="rtl">
          <div>
            <p className="text-gray-500">وصف المنتج</p>
            <p className="font-bold">{deal.description}</p>
          </div>

          <div>
            <p className="text-gray-500">السعر</p>
            <p className="font-bold text-xl"> {deal.amount} ر.س </p>
          </div>

          <div>
            <p className="text-gray-500">عمولة وثيق</p>
            <p className="font-bold"> {deal.commission} ر.س </p>
          </div>

          <div className="bg-green-50 rounded-xl p-4">
            <p className="text-green-700 font-bold"> المبلغ للبائع </p>
            <p className="text-xl font-bold"> {deal.seller_amount} ر.س </p>
          </div>

          <div className="bg-gray-100 rounded-xl p-4">
            <p className="text-gray-500">الحالة</p>
            <p className="font-bold text-teal-700">
              {getStatus(deal.status)}
            </p>
          </div>

          {deal.status === "pending" && (
            <button
              onClick={() => updateStatus("paid")}
              disabled={loading}
              className="w-full bg-teal-700 hover:bg-teal-800 text-white py-4 rounded-xl font-bold text-lg transition-colors"
            >
              {loading ? "جاري الدفع..." : "💳 ادفع الآن"}
            </button>
          )}

          {deal.status === "paid" && (
            <div className="space-y-3">
              <div className="bg-yellow-100 text-yellow-700 p-4 rounded-xl text-center font-bold">
                🔒 تم الدفع <br /> المبلغ مجمد حتى تأكيد الاستلام
              </div>
              <button
                onClick={() => updateStatus("completed")}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold text-lg transition-colors"
              >
                {loading ? "جاري التأكيد..." : "✅ تم الاستلام"}
              </button>
            </div>
          )}

          {deal.status === "completed" && (
            <div className="bg-green-100 text-green-700 p-4 rounded-xl text-center font-bold">
              ✅ اكتملت الصفقة <br /> 💰 تم تحويل المبلغ إلى محفظة البائع
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
