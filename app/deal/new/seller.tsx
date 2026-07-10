"use client";

import { useState } from "react";

export default function SellerForm() {
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [deliveryDays, setDeliveryDays] = useState("");
  const [images, setImages] = useState<FileList | null>(null);

  const fee = price ? Math.round(Number(price) * 0.1) : 0;
  const total = price ? Number(price) + fee : 0;

  function createDeal() {
    if (!productName || !description || !price || !deliveryDays) {
      alert("يرجى تعبئة جميع البيانات");
      return;
    }

    if (!images || images.length === 0) {
      alert("يرجى رفع صورة واحدة على الأقل");
      return;
    }

    if (images.length > 10) {
      alert("الحد الأقصى 10 صور");
      return;
    }

    // مؤقتًا
    alert("تم إنشاء الصفقة بنجاح، سيتم ربطها بـ Supabase لاحقًا.");
  }

  return (
    <div className="space-y-4">

      <input
        type="text"
        placeholder="اسم المنتج"
        value={productName}
        onChange={(e) => setProductName(e.target.value)}
        className="w-full rounded-xl border p-3"
      />

      <textarea
        placeholder="اكتب وصفًا دقيقًا للمنتج"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full rounded-xl border p-3 h-36"
      />

      <input
        type="number"
        placeholder="سعر المنتج (ريال)"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="w-full rounded-xl border p-3"
      />

      <input
        type="number"
        placeholder="مدة التسليم (بالأيام)"
        value={deliveryDays}
        onChange={(e) => setDeliveryDays(e.target.value)}
        className="w-full rounded-xl border p-3"
      />

      <div className="rounded-xl border border-dashed p-4">
        <label className="block mb-2 font-semibold">
          صور المنتج (حتى 10 صور)
        </label>

        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setImages(e.target.files)}
        />

        <p className="text-sm text-gray-500 mt-2">
          عدد الصور:
          {" "}
          {images?.length ?? 0}
          {" "}
          / 10
        </p>
      </div>

      <div className="rounded-xl bg-gray-100 p-4 space-y-2">
        <div className="flex justify-between">
          <span>سعر المنتج</span>
          <span>{price || 0} ر.س</span>
        </div>

        <div className="flex justify-between">
          <span>عمولة وثيق (10%)</span>
          <span>{fee} ر.س</span>
        </div>

        <div className="flex justify-between font-bold text-teal-700">
          <span>الإجمالي</span>
          <span>{total} ر.س</span>
        </div>
      </div>

      <button
        onClick={createDeal}
        className="w-full rounded-xl bg-teal-700 py-4 text-white font-bold hover:bg-teal-800"
      >
        إنشاء رابط الصفقة
      </button>

    </div>
  );
}
