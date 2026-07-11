"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Deal = {
  id: string;
  created_at?: string;
  role?: string;
  amount?: number | string;
  description?: string;
  commission?: number | string;
  seller_amount?: number | string;
  status?: string;
  seller_id?: string;
  buyer_id?: string;
  user_id?: string;
};

export default function DealsPage() {
  const router = useRouter();

  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"active" | "old">("active");
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
    loadDeals();
  }, []);

  async function loadDeals() {
    const userId = sessionStorage.getItem("user_id");

    if (!userId) {
      router.push("/login");
      return;
    }

    const { data, error } = await supabase
      .from("deals")
      .select("*")
      .or(
        `seller_id.eq.${userId},buyer_id.eq.${userId},user_id.eq.${userId}`
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error);
      setLoading(false);
      return;
    }

    setDeals(data || []);
    setLoading(false);
  }

  function statusText(status?: string) {
    if (status === "pending") return "بانتظار الدفع";
    if (status === "paid") return "مبلغ مجمد";
    if (status === "delivered") return "تم التسليم";
    if (status === "completed") return "مكتملة";
    if (status === "cancelled") return "ملغية";

    return "غير معروف";
  }

  function statusStyle(status?: string) {
    if (status === "pending") {
      return "bg-yellow-50 text-yellow-700 border-yellow-200";
    }

    if (status === "paid") {
      return "bg-orange-50 text-orange-700 border-orange-200";
    }

    if (status === "delivered") {
      return "bg-blue-50 text-blue-700 border-blue-200";
    }

    if (status === "completed") {
      return "bg-green-50 text-green-700 border-green-200";
    }

    if (status === "cancelled") {
      return "bg-red-50 text-red-700 border-red-200";
    }

    return "bg-gray-50 text-gray-600 border-gray-200";
  }

  function isOldDeal(status?: string) {
    return status === "completed" || status === "cancelled";
  }

  function formatMoney(value?: number | string) {
    return Number(value || 0).toLocaleString("ar-SA");
  }

  function formatDate(date?: string) {
    if (!date) return "بدون تاريخ";

    return new Date(date).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  async function copyPaymentLink(dealId: string) {
    const link = `${origin}/deal/pay/${dealId}`;

    try {
      await navigator.clipboard.writeText(link);
      alert("تم نسخ رابط الدفع");
    } catch {
      alert(link);
    }
  }

  const activeDeals = deals.filter((deal) => !isOldDeal(deal.status));
  const oldDeals = deals.filter((deal) => isOldDeal(deal.status));

  const shownDeals = activeTab === "active" ? activeDeals : oldDeals;

  return (
    <main
      dir="rtl"
      className="
      min-h-screen
      bg-white
      px-4
      pt-10
      pb-32
      overflow-x-hidden
      "
    >
      <div className="max-w-3xl mx-auto">

        {/* العنوان */}
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
          المعاملات
        </h1>



        {/* التبويبات */}
        <div
          className="
          bg-gray-100
          rounded-2xl
          p-1.5
          grid
          grid-cols-2
          gap-2
          mb-10
          "
        >
          <button
            onClick={() => setActiveTab("active")}
            className={`
            py-4
            rounded-2xl
            font-bold
            text-lg
            transition
            ${
              activeTab === "active"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500"
            }
            `}
          >
            سارية
          </button>

          <button
            onClick={() => setActiveTab("old")}
            className={`
            py-4
            rounded-2xl
            font-bold
            text-lg
            transition
            ${
              activeTab === "old"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500"
            }
            `}
          >
            سابقة
          </button>
        </div>



        {/* التحميل */}
        {loading && (
          <div className="text-center mt-24">

            <div
              className="
              mx-auto
              w-28
              h-28
              rounded-full
              bg-gray-50
              flex
              items-center
              justify-center
              mb-6
              "
            >
              <div className="text-5xl">
                ⏳
              </div>
            </div>

            <p className="text-gray-500 font-bold text-lg">
              جاري تحميل المعاملات...
            </p>

          </div>
        )}



        {/* لا توجد معاملات */}
        {!loading && shownDeals.length === 0 && (
          <div className="text-center mt-20">

            <div
              className="
              mx-auto
              w-36
              h-36
              rounded-full
              bg-gray-50
              flex
              items-center
              justify-center
              mb-8
              "
            >
              <div className="text-7xl opacity-40">
                📄
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900">
              {activeTab === "active"
                ? "لا توجد لديك أي معاملات حالية"
                : "لا توجد لديك أي معاملات سابقة"}
            </h2>

            <p className="text-gray-400 text-lg mt-4">
              {activeTab === "active"
                ? "قم بإنشاء معاملة جديدة الآن"
                : "المعاملات المكتملة أو الملغية ستظهر هنا"}
            </p>

            {activeTab === "active" && (
              <button
                onClick={() => router.push("/deal/new")}
                className="
                mt-8
                bg-blue-700
                text-white
                px-12
                py-4
                rounded-full
                font-bold
                text-lg
                shadow-md
                active:scale-[0.97]
                transition
                "
              >
                إنشاء معاملة جديدة
              </button>
            )}

          </div>
        )}



        {/* قائمة المعاملات */}
        {!loading && shownDeals.length > 0 && (
          <div className="space-y-4">

            {shownDeals.map((deal, index) => (
              <div
                key={deal.id}
                className="
                bg-white
                rounded-3xl
                border
                border-gray-100
                shadow-sm
                p-5
                active:scale-[0.98]
                transition
                "
              >

                <div className="flex items-start justify-between gap-3 mb-4">

                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      معاملة #{index + 1}
                    </h2>

                    <p className="text-gray-400 text-sm mt-1">
                      {formatDate(deal.created_at)}
                    </p>
                  </div>

                  <span
                    className={`
                    px-3
                    py-1.5
                    rounded-full
                    border
                    text-xs
                    font-bold
                    ${statusStyle(deal.status)}
                    `}
                  >
                    {statusText(deal.status)}
                  </span>

                </div>



                <div className="bg-gray-50 rounded-2xl p-4 mb-4">

                  <p className="text-gray-500 text-sm mb-1">
                    الوصف
                  </p>

                  <p className="text-gray-900 font-bold leading-7">
                    {deal.description || "لا يوجد وصف"}
                  </p>

                </div>



                <div className="grid grid-cols-3 gap-3 text-center">

                  <div className="bg-gray-50 rounded-2xl p-3">
                    <p className="text-gray-400 text-xs">
                      المبلغ
                    </p>

                    <p className="text-gray-900 font-bold mt-1">
                      {formatMoney(deal.amount)}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-3">
                    <p className="text-gray-400 text-xs">
                      العمولة
                    </p>

                    <p className="text-gray-900 font-bold mt-1">
                      {formatMoney(deal.commission)}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-3">
                    <p className="text-gray-400 text-xs">
                      للبائع
                    </p>

                    <p className="text-teal-700 font-bold mt-1">
                      {formatMoney(deal.seller_amount)}
                    </p>
                  </div>

                </div>



                {deal.status === "pending" && (
                  <button
                    onClick={() => copyPaymentLink(deal.id)}
                    className="
                    mt-4
                    w-full
                    py-3
                    rounded-2xl
                    bg-gray-100
                    text-gray-900
                    font-bold
                    "
                  >
                    نسخ رابط الدفع
                  </button>
                )}



                <button
                  onClick={() => router.push(`/deal/pay/${deal.id}`)}
                  className="
                  mt-3
                  w-full
                  py-3
                  rounded-2xl
                  bg-gray-900
                  text-white
                  font-bold
                  "
                >
                  عرض التفاصيل
                </button>

              </div>
            ))}

          </div>
        )}

      </div>
    </main>
  );
}