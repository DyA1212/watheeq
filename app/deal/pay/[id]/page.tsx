"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function PaymentPage() {
  const params = useParams();
  const id = params.id as string;

  const [deal, setDeal] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function getDeal() {
      const { data, error } = await supabase
        .from("deals")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.log(error);
        return;
      }

      setDeal(data);
    }

    if (id) {
      getDeal();
    }
  }, [id]);

  async function updateStatus(newStatus: string) {
    setLoading(true);

    try {
      const { error } = await supabase
        .from("deals")
        .update({
          status: newStatus,
        })
        .eq("id", id);

      if (error) {
        throw error;
      }

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
              total_profit:
                Number(wallet.total_profit || 0) +
                Number(deal.commission || 0),
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

      // تحويل المبلغ للبائع عند اكتمال الصفقة
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
        balance:
          Number(wallet.balance || 0) +
          Number(deal.seller_amount || 0),
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

      setDeal({
        ...deal,
        status: newStatus,
      });

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

  if (!deal) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        جاري تحميل الصفقة...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6 flex justify-center">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-xl">

        <h1 className="text-3xl font-bold text-teal-700 mb-6 text-center">
          💳 دفع الصفقة
        </h1>

        <div className="space-y-5">

          <div>
            <p className="text-gray-500">وصف المنتج</p>
            <p className="font-bold">{deal.description}</p>
          </div>

          <div>
            <p className="text-gray-500">السعر</p>
            <p className="font-bold text-xl">
              {deal.amount} ر.س
            </p>
          </div>

          <div>
            <p className="text-gray-500">عمولة وثيق</p>
            <p className="font-bold">
              {deal.commission} ر.س
            </p>
          </div>

          <div className="bg-green-50 rounded-xl p-4">
            <p className="text-green-700 font-bold">
              المبلغ للبائع
            </p>

            <p className="text-xl font-bold">
              {deal.seller_amount} ر.س
            </p>
          </div>

          <div className="bg-gray-100 rounded-xl p-4">
            <p>الحالة</p>

            <p className="font-bold text-teal-700">
              {getStatus(deal.status)}
            </p>
          </div>


          {deal.status === "pending" && (
            <button
              onClick={() => updateStatus("paid")}
              disabled={loading}
              className="w-full bg-teal-700 hover:bg-teal-800 text-white py-4 rounded-xl font-bold text-lg"
            >
              {loading ? "جاري الدفع..." : "💳 ادفع الآن"}
            </button>
          )}


          {deal.status === "paid" && (
            <>
              <div className="bg-yellow-100 text-yellow-700 p-4 rounded-xl text-center font-bold">
                🔒 تم الدفع
                <br />
                المبلغ مجمد حتى تأكيد الاستلام
              </div>

              <button
                onClick={() => updateStatus("completed")}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold text-lg"
              >
                {loading ? "جاري التأكيد..." : "✅ تم الاستلام"}
              </button>
            </>
          )}


          {deal.status === "completed" && (
            <div className="bg-green-100 text-green-700 p-4 rounded-xl text-center font-bold">
              ✅ اكتملت الصفقة
              <br />
              💰 تم تحويل المبلغ إلى محفظة البائع
            </div>
          )}

        </div>
      </div>
    </main>
  );
}