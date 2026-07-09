"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";


export default function AdminPage() {

  const [stats, setStats] = useState({
    users: 0,
    deals: 0,
    active: 0,
    completed: 0,
    cancelled: 0,
    commission: 0,
  });



  useEffect(() => {

    loadStats();

  }, []);




  async function loadStats() {


    const { data: users } = await supabase
      .from("users")
      .select("id");



    const { data: deals } = await supabase
      .from("deals")
      .select("*");



    const commission =
      deals?.reduce(
        (sum:number, deal:any) =>
          sum + Number(deal.commission || 0),
        0
      ) || 0;



    setStats({

      users: users?.length || 0,

      deals: deals?.length || 0,


      active:
        deals?.filter(
          (d:any)=>
            d.status === "pending" ||
            d.status === "paid" ||
            d.status === "delivered"
        ).length || 0,


      completed:
        deals?.filter(
          (d:any)=>d.status === "completed"
        ).length || 0,


      cancelled:
        deals?.filter(
          (d:any)=>d.status === "cancelled"
        ).length || 0,


      commission,

    });

  }





  return (

    <main className="min-h-screen bg-gray-100">


      <header className="bg-teal-700 text-white p-6 shadow-lg">


        <div className="max-w-7xl mx-auto flex justify-between items-center">


          <div>

            <h1 className="text-4xl font-bold">
              🛡️ لوحة إدارة وثيق
            </h1>


            <p className="text-teal-100 mt-2">
              إدارة المنصة بالكامل
            </p>

          </div>



          <div className="text-right">

            <p className="font-bold text-xl">
              مدير النظام
            </p>


            <p className="text-teal-200">
              الإدارة
            </p>

          </div>


        </div>


      </header>





      <div className="max-w-7xl mx-auto flex gap-6 p-6">



        <aside className="w-72 bg-white rounded-3xl shadow p-5">


          <h2 className="text-2xl font-bold mb-6 text-center">
            القائمة
          </h2>



          <div className="space-y-3">


            <Link
              href="/admin"
              className="block bg-teal-700 text-white p-4 rounded-xl text-center font-bold"
            >
              📊 الرئيسية
            </Link>



            <Link
              href="/admin/users"
              className="block border p-4 rounded-xl hover:bg-gray-100"
            >
              👥 المستخدمون
            </Link>



            <Link
              href="/admin/deals"
              className="block border p-4 rounded-xl hover:bg-gray-100"
            >
              💼 الصفقات
            </Link>



            <Link
              href="/admin/support"
              className="block border p-4 rounded-xl hover:bg-gray-100"
            >
              📝 البلاغات
            </Link>


          </div>


        </aside>




        <section className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">


            <div className="bg-white rounded-3xl shadow p-6">

              <p className="text-gray-500 text-lg">
                👥 المستخدمون
              </p>

              <h2 className="text-5xl font-bold mt-4 text-teal-700">
                {stats.users}
              </h2>

            </div>




            <div className="bg-white rounded-3xl shadow p-6">

              <p className="text-gray-500 text-lg">
                💼 جميع الصفقات
              </p>

              <h2 className="text-5xl font-bold mt-4 text-blue-700">
                {stats.deals}
              </h2>

            </div>




            <div className="bg-white rounded-3xl shadow p-6">

              <p className="text-gray-500 text-lg">
                ⏳ الصفقات الجارية
              </p>

              <h2 className="text-5xl font-bold mt-4 text-yellow-600">
                {stats.active}
              </h2>

            </div>




            <div className="bg-white rounded-3xl shadow p-6">

              <p className="text-gray-500 text-lg">
                ✅ الصفقات المكتملة
              </p>

              <h2 className="text-5xl font-bold mt-4 text-green-600">
                {stats.completed}
              </h2>

            </div>




            <div className="bg-white rounded-3xl shadow p-6">

              <p className="text-gray-500 text-lg">
                ❌ الصفقات الملغاة
              </p>

              <h2 className="text-5xl font-bold mt-4 text-red-600">
                {stats.cancelled}
              </h2>

            </div>




            <div className="bg-white rounded-3xl shadow p-6">

              <p className="text-gray-500 text-lg">
                💰 إجمالي العمولات
              </p>

              <h2 className="text-4xl font-bold mt-4 text-emerald-700">
                {stats.commission} ر.س
              </h2>

            </div>


          </div>





          <div className="bg-white rounded-3xl shadow mt-8 p-8">


            <h2 className="text-3xl font-bold mb-6">
              🚀 اختصارات سريعة
            </h2>



            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">


              <Link
                href="/admin/users"
                className="bg-blue-600 text-white rounded-2xl p-6 text-center font-bold"
              >
                👥 المستخدمين
              </Link>



              <Link
                href="/admin/deals"
                className="bg-green-600 text-white rounded-2xl p-6 text-center font-bold"
              >
                💼 الصفقات
              </Link>



              <Link
                href="/admin/support"
                className="bg-orange-500 text-white rounded-2xl p-6 text-center font-bold"
              >
                📝 الدعم
              </Link>



              <Link
                href="/deal"
                className="bg-gray-800 text-white rounded-2xl p-6 text-center font-bold"
              >
                🏠 الموقع
              </Link>


            </div>


          </div>
                    <div className="bg-white rounded-3xl shadow mt-8 p-8">


            <h2 className="text-3xl font-bold mb-6">
              📈 حالة المنصة
            </h2>



            <div className="space-y-4">


              <div className="flex justify-between border-b pb-3">
                <span>
                  إجمالي المستخدمين
                </span>

                <strong>
                  {stats.users}
                </strong>
              </div>




              <div className="flex justify-between border-b pb-3">
                <span>
                  إجمالي الصفقات
                </span>

                <strong>
                  {stats.deals}
                </strong>
              </div>




              <div className="flex justify-between border-b pb-3">

                <span>
                  الصفقات الجارية
                </span>

                <strong className="text-yellow-600">
                  {stats.active}
                </strong>

              </div>




              <div className="flex justify-between border-b pb-3">

                <span>
                  الصفقات المكتملة
                </span>

                <strong className="text-green-600">
                  {stats.completed}
                </strong>

              </div>




              <div className="flex justify-between border-b pb-3">

                <span>
                  الصفقات الملغاة
                </span>

                <strong className="text-red-600">
                  {stats.cancelled}
                </strong>

              </div>




              <div className="flex justify-between">

                <span>
                  عمولات وثيق
                </span>

                <strong className="text-teal-700">
                  {stats.commission} ر.س
                </strong>

              </div>


            </div>


          </div>



        </section>


      </div>


    </main>

  );


}