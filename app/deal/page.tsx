"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function DealPage() {

  const router = useRouter();

  const [name, setName] = useState("مستخدم");

  const [activeDeals, setActiveDeals] = useState(0);
  const [completedDeals, setCompletedDeals] = useState(0);
  const [cancelledDeals, setCancelledDeals] = useState(0);


  useEffect(() => {

    const userId = localStorage.getItem("user_id");
    const savedName = localStorage.getItem("name");


    if (!userId) {
      router.push("/login");
      return;
    }


    if (savedName) {
      setName(savedName);
    }


    loadStats(userId);

  }, [router]);



  async function loadStats(userId:string) {

    const { data, error } = await supabase
      .from("deals")
      .select("status")
      .or(`seller_id.eq.${userId},buyer_id.eq.${userId}`);


    if(error){
      console.log(error);
      return;
    }


    setActiveDeals(
      data?.filter(
        deal =>
        deal.status === "pending" ||
        deal.status === "paid" ||
        deal.status === "delivered"
      ).length || 0
    );


    setCompletedDeals(
      data?.filter(
        deal =>
        deal.status === "completed"
      ).length || 0
    );


    setCancelledDeals(
      data?.filter(
        deal =>
        deal.status === "cancelled"
      ).length || 0
    );

  }



  return (

    <main className="min-h-screen bg-gray-100 p-4 sm:p-6">


      <div className="max-w-7xl mx-auto">


        {/* الهيدر */}

        <div className="bg-teal-700 rounded-3xl text-white p-5 sm:p-8 mb-6 sm:mb-8">


          <h1 className="text-2xl sm:text-4xl font-bold">
            👋 أهلاً بك، {name}
          </h1>


          <p className="mt-3 text-sm sm:text-lg text-teal-100">
            مرحبًا بك في منصة وثيق، اختر الخدمة التي تريدها.
          </p>


        </div>





        {/* الخدمات */}


        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">



          <a
          href="/deal/new"
          className="bg-white rounded-3xl shadow p-5 sm:p-8 hover:shadow-xl transition text-gray-900"
          >

            <div className="text-4xl sm:text-5xl mb-3">
              ➕
            </div>


            <h2 className="text-xl sm:text-2xl font-bold mb-2">
              إنشاء صفقة جديدة
            </h2>


            <p className="text-gray-600 text-sm sm:text-base">
              ابدأ صفقة جديدة كبائع أو مشتري.
            </p>


          </a>





          <a
          href="/deals"
          className="bg-white rounded-3xl shadow p-5 sm:p-8 hover:shadow-xl transition text-gray-900"
          >

            <div className="text-4xl sm:text-5xl mb-3">
              📋
            </div>


            <h2 className="text-xl sm:text-2xl font-bold mb-2">
              صفقاتي
            </h2>


            <p className="text-gray-600 text-sm sm:text-base">
              جميع الصفقات الحالية والسابقة.
            </p>


          </a>





          <a
          href="/wallet"
          className="bg-white rounded-3xl shadow p-5 sm:p-8 hover:shadow-xl transition text-gray-900"
          >

            <div className="text-4xl sm:text-5xl mb-3">
              💰
            </div>


            <h2 className="text-xl sm:text-2xl font-bold mb-2">
              المحفظة
            </h2>


            <p className="text-gray-600 text-sm sm:text-base">
              الرصيد والأموال المجمدة.
            </p>


          </a>





          <a
          href="/profile"
          className="bg-white rounded-3xl shadow p-5 sm:p-8 hover:shadow-xl transition text-gray-900"
          >

            <div className="text-4xl sm:text-5xl mb-3">
              👤
            </div>


            <h2 className="text-xl sm:text-2xl font-bold mb-2">
              حسابي
            </h2>


            <p className="text-gray-600 text-sm sm:text-base">
              البيانات الشخصية والإعدادات.
            </p>


          </a>



        </div>







        {/* الاحصائيات */}


        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-8">



          <div className="bg-white rounded-2xl shadow p-5">

            <h3 className="text-gray-700 text-sm">
              الصفقات النشطة
            </h3>


            <p className="text-3xl sm:text-4xl font-bold mt-3 text-blue-600">
              {activeDeals}
            </p>


          </div>





          <div className="bg-white rounded-2xl shadow p-5">

            <h3 className="text-gray-700 text-sm">
              الصفقات المنتهية
            </h3>


            <p className="text-3xl sm:text-4xl font-bold mt-3 text-green-600">
              {completedDeals}
            </p>


          </div>





          <div className="bg-white rounded-2xl shadow p-5">

            <h3 className="text-gray-700 text-sm">
              الصفقات الملغية
            </h3>


            <p className="text-3xl sm:text-4xl font-bold mt-3 text-red-600">
              {cancelledDeals}
            </p>


          </div>





          <div className="bg-white rounded-2xl shadow p-5">

            <h3 className="text-gray-700 text-sm">
              الرصيد
            </h3>


            <p className="text-3xl sm:text-4xl font-bold mt-3 text-green-600">
              0 ر.س
            </p>


          </div>



        </div>



      </div>


    </main>

  );

}