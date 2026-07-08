"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function DealsPage() {

  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    loadDeals();
  }, []);


  async function loadDeals() {

    const userId = localStorage.getItem("user_id");


    if (!userId) {
      setLoading(false);
      return;
    }


    const { data, error } = await supabase
      .from("deals")
      .select("*")
      .or(`user_id.eq.${userId},seller_id.eq.${userId}`)
      .order("created_at", { ascending: false });


    if (error) {
      console.log(error);
      setLoading(false);
      return;
    }


    setDeals(data || []);
    setLoading(false);
  }



  function getStatus(status: string) {

    if (status === "pending") {
      return "بانتظار الدفع";
    }


    if (status === "paid") {
      return "مجمّدة 💰";
    }


    if (status === "delivered") {
      return "تم التسليم";
    }


    if (status === "completed") {
      return "منتهية ✅";
    }


    if (status === "cancelled") {
      return "ملغية ❌";
    }


    return status;

  }



  function statusStyle(status: string) {

    if (status === "completed") {
      return "bg-green-100 text-green-700";
    }


    if (status === "cancelled") {
      return "bg-red-100 text-red-700";
    }


    if (status === "paid") {
      return "bg-blue-100 text-blue-700";
    }


    return "bg-yellow-100 text-yellow-700";

  }



  return (

    <main className="min-h-screen bg-gray-100 p-6">


      <div className="max-w-4xl mx-auto">


        <h1 className="text-3xl font-bold text-center text-teal-700 mb-8">
          📋 صفقاتي
        </h1>



        {loading ? (

          <div className="bg-white rounded-3xl p-8 text-center text-gray-900">
            جاري تحميل الصفقات...
          </div>


        ) : deals.length === 0 ? (


          <div className="bg-white rounded-3xl shadow p-8 text-center text-gray-900">
            لا توجد صفقات حالياً
          </div>


        ) : (


          <div className="space-y-5">


            {deals.map((deal, index) => (


              <div
                key={deal.id}
                className="bg-white rounded-3xl shadow p-6 text-gray-900"
              >


                <div className="flex justify-between items-center mb-4">


                  <h2 className="text-xl font-bold">
                    صفقة #{index + 1}
                  </h2>


                  <span
                    className={`px-3 py-1 rounded-full font-bold ${statusStyle(deal.status)}`}
                  >
                    {getStatus(deal.status)}
                  </span>


                </div>



                <p>
                  <strong>الوصف:</strong>{" "}
                  {deal.description}
                </p>



                <p className="mt-2">
                  <strong>المبلغ:</strong>{" "}
                  {deal.amount} ر.س
                </p>



                <p className="mt-2">
                  <strong>العمولة:</strong>{" "}
                  {deal.commission} ر.س
                </p>



                <p className="mt-2 text-green-700 font-bold">
                  يصل للبائع:{" "}
                  {deal.seller_amount} ر.س
                </p>



                {deal.status === "pending" && (

                  <div className="mt-4 bg-gray-100 rounded-xl p-3">

                    <p className="text-gray-700">
                      رابط الدفع:
                    </p>


                    <input
                      readOnly
                      value={`${window.location.origin}/deal/pay/${deal.id}`}
                      className="w-full border rounded-xl p-3 mt-2 bg-white text-gray-900"
                    />


                  </div>

                )}



                {deal.status === "completed" && (

                  <div className="mt-4 bg-green-50 rounded-xl p-3 text-green-700 font-bold">
                    تم إنهاء الصفقة من الإدارة ✅
                  </div>

                )}



                {deal.status === "cancelled" && (

                  <div className="mt-4 bg-red-50 rounded-xl p-3 text-red-700 font-bold">
                    تم إلغاء الصفقة من الإدارة ❌
                  </div>

                )}



                {deal.status !== "pending" &&
                 deal.status !== "completed" &&
                 deal.status !== "cancelled" && (

                  <div className="mt-4 bg-blue-50 rounded-xl p-3 text-blue-700 font-bold">
                    حالة الصفقة: {getStatus(deal.status)}
                  </div>

                )}


              </div>


            ))}


          </div>


        )}


      </div>


    </main>

  );

}