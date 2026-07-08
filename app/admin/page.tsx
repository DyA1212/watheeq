"use client";

import { useEffect, useState } from "react";

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

      {/* Header */}
      <header className="bg-white shadow px-8 py-5 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-teal-700">
          🛡️ لوحة إدارة وثيق
        </h1>

        <div className="font-bold">
          مدير النظام
        </div>
      </header>

      <div className="flex">

        {/* القائمة الجانبية */}
        <aside className="w-72 bg-white min-h-screen shadow">

          <div className="p-6 space-y-3">

            <button className="w-full bg-teal-700 text-white rounded-xl p-4">
              📊 الرئيسية
            </button>

            <button className="w-full border rounded-xl p-4">
              👥 المستخدمون
            </button>

            <button className="w-full border rounded-xl p-4">
              💼 الصفقات
            </button>

            <button className="w-full border rounded-xl p-4">
              💰 المحفظة
            </button>

            <button className="w-full border rounded-xl p-4">
              🏦 السحوبات
            </button>

            <button className="w-full border rounded-xl p-4">
              📝 البلاغات
            </button>

            <button className="w-full border rounded-xl p-4">
              ⚙️ الإعدادات
            </button>

          </div>

        </aside>

        {/* المحتوى */}
        <section className="flex-1 p-8">

          <div className="grid grid-cols-4 gap-6">

            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-gray-500">
                المستخدمون
              </h2>

              <p className="text-4xl font-bold mt-4">
                0
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-gray-500">
                الصفقات
              </h2>

              <p className="text-4xl font-bold mt-4">
                0
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-gray-500">
                الأموال المجمدة
              </h2>

              <p className="text-3xl font-bold mt-4">
                0 ر.س
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-gray-500">
                أرباح وثيق
              </h2>

              <p className="text-3xl font-bold mt-4">
                0 ر.س
              </p>
            </div>

          </div>

          <div className="bg-white rounded-2xl shadow mt-8 p-6">

            <h2 className="text-2xl font-bold mb-5">
              آخر الصفقات
            </h2>

            <table className="w-full text-center">

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

                  <td className="p-5">لا توجد بيانات</td>
                  <td>-</td>
                  <td>-</td>
                  <td>-</td>
                  <td>-</td>

                </tr>

              </tbody>

            </table>

          </div>

        </section>

      </div>

    </main>
  );
}