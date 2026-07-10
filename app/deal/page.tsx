"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DealPage() {
  const router = useRouter();

  const [name, setName] = useState("مستخدم");

  useEffect(() => {
    const userId = sessionStorage.getItem("user_id");
    const savedName = sessionStorage.getItem("name");

    if (!userId) {
      router.push("/login");
      return;
    }

    if (savedName) {
      setName(savedName);
    }
  }, [router]);

  return (
    <main
      dir="rtl"
      className="
      min-h-screen
      bg-gray-100
      overflow-x-hidden
      pb-32
      "
    >
      {/* الهيدر */}
      <section
        className="
        bg-gradient-to-br
        from-teal-900
        via-teal-800
        to-teal-700
        text-white
        px-5
        md:px-10
        pt-6
        pb-24
        md:pb-20
        rounded-b-[34px]
        shadow-lg
        "
      >
        <div
          className="
          max-w-7xl
          mx-auto
          flex
          items-start
          justify-between
          gap-4
          "
        >
          <div className="text-right">
            <p className="text-teal-100 text-sm">
              أهلاً بك 👋
            </p>

            <h1 className="text-2xl md:text-3xl font-bold mt-1 text-white">
              {name}
            </h1>
          </div>

          <div className="text-left">
            <h2 className="text-3xl md:text-4xl font-bold tracking-wide text-white">
              وثيق
            </h2>

            <p className="text-teal-100 text-sm mt-1">
              منصة الصفقات الآمنة
            </p>
          </div>
        </div>
      </section>

      {/* المحتوى */}
      <div className="max-w-7xl mx-auto px-4 md:px-10">
        {/* كرت لا توجد صفقات */}
        <section className="-mt-16 relative z-20">
          <div
            className="
            bg-white
            rounded-[32px]
            shadow-lg
            p-6
            text-center
            w-full
            max-w-xl
            mx-auto
            border
            border-gray-100
            "
          >
            <div className="text-5xl mb-4">
              📋
            </div>

            <h2 className="text-2xl font-bold text-gray-900">
              لا توجد صفقات حالياً
            </h2>

            <p className="text-gray-500 mt-3 text-sm">
              ابدأ أول صفقة لك مع وثيق الآن
            </p>

            <button
              onClick={() => router.push("/deal/new")}
              className="
              mt-6
              bg-teal-700
              hover:bg-teal-800
              text-white
              w-full
              py-4
              rounded-2xl
              font-bold
              text-lg
              shadow-md
              active:scale-[0.97]
              transition
              "
            >
              إنشاء صفقة الآن
            </button>
          </div>
        </section>

        {/* لوحة التحكم */}
        <section className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-right">
            لوحة التحكم
          </h2>

          <div
            className="
            grid
            grid-cols-2
            md:grid-cols-4
            gap-4
            "
          >
            <button
              onClick={() => router.push("/deals")}
              className="
              bg-white
              rounded-[28px]
              shadow-sm
              border
              border-gray-100
              p-5
              text-center
              active:scale-[0.97]
              transition
              "
            >
              <div className="mx-auto w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center text-3xl mb-4">
                💼
              </div>

              <h3 className="font-bold text-lg text-gray-900">
                صفقاتي
              </h3>

              <p className="text-gray-500 text-sm mt-2">
                عرض جميع صفقاتك
              </p>
            </button>

            <button
              onClick={() => router.push("/wallet")}
              className="
              bg-white
              rounded-[28px]
              shadow-sm
              border
              border-gray-100
              p-5
              text-center
              active:scale-[0.97]
              transition
              "
            >
              <div className="mx-auto w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center text-3xl mb-4">
                💰
              </div>

              <h3 className="font-bold text-lg text-gray-900">
                المحفظة
              </h3>

              <p className="text-gray-500 text-sm mt-2">
                عرض رصيدك وإدارته
              </p>
            </button>

            <button
              onClick={() => router.push("/profile")}
              className="
              bg-white
              rounded-[28px]
              shadow-sm
              border
              border-gray-100
              p-5
              text-center
              active:scale-[0.97]
              transition
              "
            >
              <div className="mx-auto w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center text-3xl mb-4">
                👤
              </div>

              <h3 className="font-bold text-lg text-gray-900">
                حسابي
              </h3>

              <p className="text-gray-500 text-sm mt-2">
                إدارة بيانات حسابك
              </p>
            </button>

            <button
              onClick={() => router.push("/profile")}
              className="
              bg-white
              rounded-[28px]
              shadow-sm
              border
              border-gray-100
              p-5
              text-center
              active:scale-[0.97]
              transition
              "
            >
              <div className="mx-auto w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center text-3xl mb-4">
                ⚙️
              </div>

              <h3 className="font-bold text-lg text-gray-900">
                الإعدادات
              </h3>

              <p className="text-gray-500 text-sm mt-2">
                إعدادات التطبيق
              </p>
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}