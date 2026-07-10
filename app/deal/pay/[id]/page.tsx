"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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
};

export default function PaymentPage() {
  const params = useParams();
  const id = params.id as string;

  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSeller, setIsSeller] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [pageError, setPageError] = useState("");

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
          throw new Error(
            dealError?.message || "لم يتم العثور على الصفقة"
          );
        }

        const sellerId = String(dealData.seller_id || "").trim();
        const currentId = String(currentUserId).trim();

        // منع البائع من فتح رابط الدفع
        if (currentId === sellerId) {
          setIsSeller(true);
          return;
        }

        // أول مشتري يفتح الرابط يتم ربط الصفقة بحسابه
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

        // منع أي حساب غير المشتري المرتبط
        if (
          currentId !== String(dealData.buyer_id).trim()
        ) {
          alert("هذا الرابط مخصص لمشتري آخر");
          window.location.href = "/deal";
          return;
        }

        setDeal(dealData);
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "حدث خطأ أثناء تحميل الصفقة";

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

  async function updateStatus(newStatus: "paid" | "completed") {
    if (!deal || loading) return;

    setLoading(true);

    try {
      const currentUserId = sessionStorage.getItem("user_id");

      if (!currentUserId) {
        throw new Error("يجب تسجيل الدخول");
      }

      if (
        String(currentUserId).trim() !==
        String(deal.buyer_id).trim()
      ) {
        throw new Error("لا يمكنك تنفيذ هذا الإجراء");
      }

      const sellerAmount = Number(deal.seller_amount || 0);
      const commission = Number(deal.commission || 0);

      if (newStatus === "paid") {
        if (deal.status !== "pending") {
          throw new Error("تم دفع هذه الصفقة مسبقًا");
        }

        // تغيير الحالة فقط إذا كانت ما زالت pending
        const { data: updatedDeal, error: dealUpdateError } =
          await supabase
            .from("deals")
            .update({
              status: "paid",
            })
            .eq("id", id)
            .eq("status", "pending")
            .select("*")
            .maybeSingle();

        if (dealUpdateError) {
          throw dealUpdateError;
        }

        if (!updatedDeal) {
          throw new Error("تمت معالجة هذه الصفقة مسبقًا");
        }

        // إضافة العمولة لمحفظة الإدارة
        const { data: adminWallet, error: adminReadError } =
          await supabase
            .from("admin_wallet")
            .select("total_profit")
            .eq("id", 1)
            .maybeSingle();

        if (adminReadError) {
          throw adminReadError;
        }

        if (adminWallet) {
          const { error: adminUpdateError } = await supabase
            .from("admin_wallet")
            .update({
              total_profit:
                Number(adminWallet.total_profit || 0) + commission,
              updated_at: new Date().toISOString(),
            })
            .eq("id", 1);

          if (adminUpdateError) {
            throw adminUpdateError;
          }
        } else {
          const { error: adminInsertError } = await supabase
            .from("admin_wallet")
            .insert({
              id: 1,
              total_profit: commission,
              updated_at: new Date().toISOString(),
            });

          if (adminInsertError) {
            throw adminInsertError;
          }
        }

        // إضافة مبلغ البائع إلى الرصيد المجمد
        const { data: sellerWallet, error: walletReadError } =
          await supabase
            .from("wallets")
            .select(
              "balance,frozen_balance,transferred_balance"
            )
            .eq("user_id", deal.seller_id)
            .maybeSingle();

        if (walletReadError) {
          throw walletReadError;
        }

        if (sellerWallet) {
          const { error: walletUpdateError } = await supabase
            .from("wallets")
            .update({
              frozen_balance:
                Number(sellerWallet.frozen_balance || 0) +
                sellerAmount,
            })
            .eq("user_id", deal.seller_id);

          if (walletUpdateError) {
            throw walletUpdateError;
          }
        } else {
          const { error: walletInsertError } = await supabase
            .from("wallets")
            .insert({
              user_id: deal.seller_id,
              balance: 0,
              frozen_balance: sellerAmount,
              transferred_balance: 0,
            });

          if (walletInsertError) {
            throw walletInsertError;
          }
        }

        setDeal(updatedDeal);
      }

      if (newStatus === "completed") {
        if (deal.status !== "paid") {
          throw new Error("يجب دفع الصفقة أولاً");
        }

        const { data: sellerWallet, error: walletReadError } =
          await supabase
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

        const currentFrozen = Number(
          sellerWallet.frozen_balance || 0
        );

        if (currentFrozen < sellerAmount) {
          throw new Error("الرصيد المجمد غير كافٍ");
        }

        // تغيير الحالة فقط إذا كانت ما زالت paid
        const { data: updatedDeal, error: dealUpdateError } =
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

        if (dealUpdateError) {
          throw dealUpdateError;
        }

        if (!updatedDeal) {
          throw new Error("تم تأكيد استلام هذه الصفقة مسبقًا");
        }

        // نقل المبلغ من المجمد إلى المتاح
        const { error: walletUpdateError } = await supabase
          .from("wallets")
          .update({
            balance:
              Number(sellerWallet.balance || 0) + sellerAmount,
            frozen_balance: currentFrozen - sellerAmount,
          })
          .eq("user_id", deal.seller_id);

        if (walletUpdateError) {
          throw walletUpdateError;
        }

        setDeal(updatedDeal);
      }
        } catch (error: unknown) {
      console.error("الخطأ الحقيقي:", error);

      const message =
        error instanceof Error
          ? error.message
          : JSON.stringify(error);

      alert(message);
    } finally {
      setLoading(false);
    }
  }

  function getStatus(status: string) {
    if (status === "pending") return "بانتظار الدفع";
    if (status === "paid") return "تم الدفع — المبلغ مجمد";
    if (status === "completed") return "مكتملة";
    if (status === "cancelled") return "ملغية";

    return status;
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
            أنت بائع هذه الصفقة. رابط الدفع مخصص للمشتري
            فقط لإتمام عملية الدفع وتأكيد استلام السلعة.
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
          <div className="text-4xl mb-4">❌</div>

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
      className="min-h-screen bg-gray-100 p-4 sm:p-6 flex justify-center"
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
              {Number(deal.amount || 0).toLocaleString("ar-SA")} ر.س
            </p>
          </div>

          <div>
            <p className="text-gray-500 text-sm">
              عمولة وثيق
            </p>

            <p className="font-bold mt-1">
              {Number(deal.commission || 0).toLocaleString("ar-SA")} ر.س
            </p>
          </div>

          <div className="bg-green-50 rounded-2xl p-4">
            <p className="text-green-700 font-bold">
              المبلغ المستحق للبائع
            </p>

            <p className="text-xl font-bold mt-1">
              {Number(deal.seller_amount || 0).toLocaleString("ar-SA")} ر.س
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

          {deal.status === "pending" && (
            <button
              type="button"
              onClick={() => updateStatus("paid")}
              disabled={loading}
              className="w-full bg-teal-700 hover:bg-teal-800 disabled:opacity-60 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold text-lg transition"
            >
              {loading ? "جاري الدفع..." : "💳 ادفع الآن"}
            </button>
          )}

          {deal.status === "paid" && (
            <div className="space-y-4">
              <div className="bg-yellow-100 text-yellow-800 p-4 rounded-2xl text-center font-bold leading-7">
                🔒 تم الدفع بنجاح
                <br />
                المبلغ موجود في الرصيد المجمد للبائع حتى
                تأكيد الاستلام.
              </div>

              <button
                type="button"
                onClick={() => updateStatus("completed")}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold text-lg transition"
              >
                {loading
                  ? "جاري التأكيد..."
                  : "✅ تم الاستلام"}
              </button>
            </div>
          )}

          {deal.status === "completed" && (
            <div className="bg-green-100 text-green-800 p-4 rounded-2xl text-center font-bold leading-7">
              ✅ اكتملت الصفقة
              <br />
              💰 تم نقل المبلغ من الرصيد المجمد إلى الرصيد
              المتاح للبائع.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}