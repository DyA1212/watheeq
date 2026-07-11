"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Review = {
  id?: string;
  name: string;
  rating: number;
  comment: string;
  created_at?: string;
};

export default function Home() {
  const [reviews, setReviews] = useState<Review[]>([]);

  const defaultReviews: Review[] = [
    {
      name: "طيف الثقفي",
      rating: 5,
      comment:
        "اشتريت حساب ببجي وكانت التجربة آمنة جدًا، المبلغ ظل محفوظ في وثيق لين تأكدت إن الحساب وصلني وكل شيء تمام.",
    },
    {
      name: "حنان",
      rating: 5,
      comment:
        "منصة ممتازة وتعطيني راحة وثقة عند الشراء من أشخاص ما أعرفهم.",
    },
    {
      name: "رامي محمد",
      rating: 5,
      comment:
        "الدعم الفني متعاون جدًا وحل مشكلتي بسرعة، أنصح الجميع باستخدام وثيق.",
    },
    {
      name: "مروان أحمد",
      rating: 5,
      comment:
        "أفضل منصة وساطة استخدمتها، سهلة وسريعة وتحافظ على حقوق الطرفين.",
    },
  ];

  useEffect(() => {
    loadReviews();
  }, []);

  async function loadReviews() {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(8);

    if (error) {
      console.log(error);
      return;
    }

    setReviews(data || []);
  }

  function stars(rating: number) {
    return "⭐".repeat(Number(rating || 5));
  }

  const shownReviews = reviews.length > 0 ? reviews : defaultReviews;

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">

      {/* Header */}
      <header className="bg-white shadow">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">

          <h1 className="text-3xl font-bold text-teal-700">
            وثيق
          </h1>

          <nav className="flex gap-2">

            <a
              href="/login"
              className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-100 transition"
            >
              تسجيل الدخول
            </a>

            <a
              href="/register"
              className="rounded-lg bg-teal-700 text-white px-3 py-2 text-sm hover:bg-teal-800 transition"
            >
              إنشاء حساب
            </a>

          </nav>

        </div>
      </header>



      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 py-12 text-center">

        <h2 className="text-3xl md:text-5xl font-bold leading-tight mb-5">
          وسيطك الآمن لإتمام الصفقات
        </h2>

        <p className="text-base md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          منصة وثيق تحفظ أموال المشتري حتى يستلم المنتج،
          ثم تحول المبلغ للبائع بأمان.
        </p>

        <div className="flex justify-center gap-3 flex-wrap">

          <a
            href="/login"
            className="bg-teal-700 text-white px-5 py-3 rounded-xl hover:bg-teal-800 transition"
          >
            ابدأ صفقة
          </a>

          <a
            href="/how-it-works"
            className="border px-5 py-3 rounded-xl hover:bg-gray-100 transition"
          >
            كيف تعمل؟
          </a>

        </div>

      </section>



      {/* Features */}
      <section className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 px-4 pb-14">

        <div className="bg-white rounded-2xl shadow p-4">
          <h3 className="text-lg font-bold mb-2">
            🔒 حماية الأموال
          </h3>

          <p className="text-sm text-gray-600 leading-6">
            يبقى المبلغ محفوظًا حتى يؤكد المشتري استلام المنتج.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-4">
          <h3 className="text-lg font-bold mb-2">
            ⭐ تقييم المستخدمين
          </h3>

          <p className="text-sm text-gray-600 leading-6">
            تقييمات حقيقية لكل بائع ومشتري بعد كل صفقة.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-4">
          <h3 className="text-lg font-bold mb-2">
            🎧 دعم فني
          </h3>

          <p className="text-sm text-gray-600 leading-6">
            فريق دعم لمساعدتك في أي مشكلة أثناء الصفقة.
          </p>
        </div>

      </section>



      {/* آراء العملاء */}
      <section className="bg-white py-14">

        <div className="max-w-7xl mx-auto px-4">

          <h2 className="text-3xl md:text-4xl font-bold text-center text-teal-700 mb-3">
            آراء عملائنا
          </h2>

          <p className="text-center text-gray-600 mb-8">
            نفخر بثقة عملائنا وتجاربهم الناجحة مع منصة وثيق.
          </p>

          <div className="flex justify-center mb-8">
            <a
              href="/review"
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-3 rounded-xl font-bold transition"
            >
              ⭐ قيّم تجربتك
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {shownReviews.map((review, index) => (
              <div
                key={review.id || index}
                className="
                bg-gray-50
                rounded-2xl
                shadow
                p-4
                border
                border-gray-100
                "
              >
                <div className="text-xl mb-2">
                  {stars(review.rating)}
                </div>

                <p className="text-sm text-gray-600 mb-4 leading-6">
                  {review.comment}
                </p>

                <h3 className="font-bold text-sm">
                  {review.name}
                </h3>
              </div>
            ))}

          </div>

        </div>

      </section>

    </main>
  );
}