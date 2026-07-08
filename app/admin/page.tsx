"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminPage() {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const email = localStorage.getItem("email");
    const role = localStorage.getItem("role");

    if (email === "deaabd89@gmail.com" || role === "admin") {
      setAllowed(true);
    }
  }, []);

  if (!allowed) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100">
        <h1 className="text-2xl font-bold text-red-600">
          ليس لديك صلاحية الدخول
        </h1>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100">

      <header className="bg-white shadow px-8 py-5 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-teal-700">
          🛡️ لوحة إدارة وثيق
        </h1>

        <div className="font-bold text-gray-900">
          مدير النظام
        </div>
      </header>


      <div className="flex">

        <aside className="w-72 bg-white min-h-screen shadow">

          <div className="p-6 space-y-3">

            <Link href="/admin">
              <button className="w-full bg-teal-700 text-white rounded-xl p-4">
                📊 الرئيسية
              </button>
            </Link>


            <Link href="/admin/users">
              <button className="w-full border rounded-xl p-4 text-gray-900 hover:bg-gray-100">
                👥 المستخدمون
              </button>
            </Link>


            <Link href="/admin/deals">
              <button className="w-full border rounded-xl p-4 text-gray-900 hover:bg-gray-100">
                💼 الصفقات
              </button>
            </Link>


            <Link href="/admin/wallet">
              <button className="w-full border rounded-xl p-4 text-gray-900 hover:bg-gray-100">
                💰 المحفظة
              </button>
            </Link>


            <Link href="/admin/withdrawals">
              <button className="w-full border rounded-xl p-4 text-gray-900 hover:bg-gray-100">
                🏦 السحوبات
              </button>
            </Link>


            <Link href="/admin/reports">
              <button className="w-full border rounded-xl p-4 text-gray-900 hover:bg-gray-100">
                📝 البلاغات
              </button>
            </Link>


            <Link href="/admin/settings">
              <button className="w-full border rounded-xl p-4 text-gray-900 hover:bg-gray-100">
                ⚙️ الإعدادات
              </button>
            </Link>


          </div>

        </aside>


        <section className="flex-1 p-8">


          <div className="grid grid-cols-4 gap-6">


            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-gray-700">
                المستخدمون
              </h2>

              <p className="text-4xl font-bold mt-4 text-gray-900">
                0
              </p>
            </div>


            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-gray-700">
                الصفقات
              </h2>

              <p className="text-4xl font-bold mt-4 text-gray-900">
                0
              </p>
            </div>


            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-gray-700">
                الأموال المجمدة
              </h2>

              <p className="text-3xl font-bold mt-4 text-gray-900">
                0 ر.س
              </p>
            </div>


            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-gray-700">
                أرباح وثيق
              </h2>

              <p className="text-3xl font-bold mt-4 text-gray-900">
                0 ر.س
              </p>
            </div>


          </div>


          <div className="bg-white rounded-2xl shadow mt-8 p-6">

            <h2 className="text-2xl font-bold mb-5 text-gray-900">
              آخر الصفقات
            </h2>


            <table className="w-full text-center text-gray-900">

              <thead>
                <tr className="border-b">

                  <th className="p-3">#</th>
                  <th>البائع</th>
                  <th>المشتري</th>
                  <th>المبلغ</th>
                  <th>الحالة</th>

                </tr>
              </thead>


              <tbody>

                <tr>
                  <td className="p-5" colSpan={5}>
                    لا توجد بيانات
                  </td>
                </tr>

              </tbody>

            </table>


          </div>


        </section>


      </div>


    </main>
  );
}