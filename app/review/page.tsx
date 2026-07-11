"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ReviewPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  async function submitReview() {
    if (!name.trim()) {
      alert("اكتب اسمك");
      return;
    }

    if (!comment.trim()) {
      alert("اكتب تجربتك");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("reviews").insert([
      {
        name: name.trim(),
        rating,
        comment: comment.trim(),
      },
    ]);

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("تم إرسال تقييمك بنجاح ✅");
    router.push("/");
  }

  return (
    <main
      dir="rtl"
      className="
      min-h-screen
      bg-slate-100
      px-4
      pt-6
      pb-10
      overflow-x-hidden
      "
    >
      <div className="w-full max-w-md mx-auto">

        <button
          onClick={() => router.push("/")}
          className="
          mb-4
          bg-white
          text-gray-700
          px-5
          py-3
          rounded-2xl
          font-bold
          shadow-sm
          active:scale-[0.97]
          transition
          "
        >
          رجوع
        </button>

        <section
          className="
          bg-gradient-to-br
          from-teal-900
          via-teal-800
          to-teal-700
          text-white
          rounded-[32px]
          p-5
          shadow-lg
          mb-5
          "
        >
          <p className="text-teal-100 text-sm font-bold">
            وثيق
          </p>

          <h1 className="text-3xl font-bold mt-2">
            قيّم تجربتك
          </h1>

          <p className="text-teal-100 mt-3 text-sm leading-7">
            شاركنا رأيك عشان نطوّر وثيق ونحسّن تجربة المستخدمين.
          </p>
        </section>

        <section
          className="
          bg-white
          rounded-[32px]
          shadow-sm
          border
          border-gray-100
          p-5
          "
        >
          <label className="block font-bold text-gray-800 mb-2">
            اسمك
          </label>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="اكتب اسمك"
            className="
            w-full
            rounded-2xl
            p-4
            mb-5
            text-base
            "
          />

          <label className="block font-bold text-gray-800 mb-3">
            التقييم
          </label>

          <div className="flex justify-center gap-1 mb-5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className="
                text-4xl
                active:scale-90
                transition
                "
              >
                {star <= rating ? "⭐" : "☆"}
              </button>
            ))}
          </div>

          <div
            className="
            bg-gray-50
            rounded-2xl
            p-4
            text-center
            mb-5
            "
          >
            <p className="text-gray-500 text-sm">
              تقييمك الحالي
            </p>

            <p className="text-2xl font-bold text-gray-900 mt-1">
              {rating} من 5
            </p>
          </div>

          <label className="block font-bold text-gray-800 mb-2">
            تجربتك
          </label>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="اكتب رأيك عن وثيق..."
            rows={5}
            className="
            w-full
            rounded-2xl
            p-4
            mb-5
            resize-none
            text-base
            "
          />

          <button
            onClick={submitReview}
            disabled={loading}
            className="
            w-full
            bg-teal-700
            hover:bg-teal-800
            disabled:bg-gray-300
            disabled:text-gray-500
            text-white
            py-4
            rounded-2xl
            font-bold
            text-lg
            active:scale-[0.97]
            transition
            "
          >
            {loading ? "جاري الإرسال..." : "إرسال التقييم"}
          </button>
        </section>

      </div>
    </main>
  );
}