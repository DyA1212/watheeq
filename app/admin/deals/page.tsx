"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminDealsPage() {
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function getDeals() {
    setLoading(true);

    const { data, error } = await supabase
      .from("deals")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error.message);
      setLoading(false);
      return;
    }

    setDeals(data || []);
    setLoading(false);
  }


  async function updateStatus(id: string, status: string) {

    const { error } = await supabase
      .from("deals")
      .update({
        status: status,
      })
      .eq("id", id);


    if (error) {
      alert("حدث خطأ: " + error.message);
      return;
    }


    if (status === "completed") {
      alert("تم إنهاء الصفقة بنجاح ✅");
    }

    if (status === "cancelled") {
      alert("تم إلغاء الصفقة ❌");
    }


    getDeals();
  }


  useEffect(() => {
    getDeals();
  }, []);


  return (
    <main className="min-h-screen bg-gray-100 p-8">

      <div className="bg-white rounded-xl shadow p-6">


        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          💼 جميع الصفقات
        </h1>


        {loading ? (

          <p className="text-gray-700">
            جاري التحميل...
          </p>

        ) : deals.length === 0 ? (

          <p className="text-gray-700">
            لا توجد صفقات حالياً
          </p>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full text-center text-gray-900">


              <thead>

                <tr className="border-b">

                  <th className="p-3">
                    المبلغ
                  </th>

                  <th>
                    العمولة
                  </th>

                  <th>
                    حصة البائع
                  </th>

                  <th>
                    الحالة
                  </th>

                  <th>
                    التاريخ
                  </th>

                  <th>
                    التحكم
                  </th>

                </tr>

              </thead>


              <tbody>


                {deals.map((deal) => (

                  <tr
                    key={deal.id}
                    className="border-b"
                  >


                    <td className="p-3">
                      {deal.amount} ر.س
                    </td>


                    <td>
                      {deal.commission} ر.س
                    </td>


                    <td>
                      {deal.seller_amount} ر.س
                    </td>


                    <td>
                      {deal.status}
                    </td>


                    <td>
                      {new Date(
                        deal.created_at
                      ).toLocaleDateString("ar-SA")}
                    </td>


                    <td className="space-x-2">


                      <button
                        onClick={() =>
                          updateStatus(
                            deal.id,
                            "completed"
                          )
                        }
                        className="bg-green-600 text-white px-4 py-2 rounded-lg"
                      >
                        إنهاء
                      </button>


                      <button
                        onClick={() =>
                          updateStatus(
                            deal.id,
                            "cancelled"
                          )
                        }
                        className="bg-red-600 text-white px-4 py-2 rounded-lg"
                      >
                        إلغاء
                      </button>


                    </td>


                  </tr>

                ))}


              </tbody>


            </table>


          </div>

        )}


      </div>


    </main>
  );
}