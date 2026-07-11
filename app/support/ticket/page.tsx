"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Ticket = {
  id: string;
  user_id: string;
  user_name: string | null;
  reason: string;
  image_url: string | null;
  status: string | null;
  created_at: string;
};

export default function SupportTicketPage() {
  const router = useRouter();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [reason, setReason] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);

  function getUserId() {
    return sessionStorage.getItem("user_id");
  }

  function getUserName() {
    return sessionStorage.getItem("name") || "مستخدم";
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  async function loadTickets() {
    const userId = getUserId();

    if (!userId) {
      router.push("/login");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("support_tickets")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error);
      setLoading(false);
      return;
    }

    setTickets(data || []);
    setLoading(false);
  }

  function resetForm() {
    setReason("");
    setImageFile(null);
    setImagePreview("");
    setSuccess(false);
  }

  function openNewTicket() {
    resetForm();
    setSelectedTicket(null);
    setShowForm(true);
  }

  function chooseImage(file: File) {
    if (!file.type.startsWith("image/")) {
      alert("اختر صورة فقط");
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function uploadImage(userId: string) {
    if (!imageFile) return null;

    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${userId}-ticket-${Date.now()}.${fileExt}`;
    const filePath = `tickets/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("support-images")
      .upload(filePath, imageFile);

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data } = supabase.storage
      .from("support-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  async function sendTicket() {
    const userId = getUserId();
    const userName = getUserName();

    if (!userId) {
      router.push("/login");
      return;
    }

    if (!reason.trim()) {
      alert("اكتب سبب المشكلة");
      return;
    }

    setSending(true);

    try {
      const imageUrl = await uploadImage(userId);

      const { error } = await supabase.from("support_tickets").insert({
        user_id: userId,
        user_name: userName,
        reason: reason.trim(),
        image_url: imageUrl,
        status: "closed",
      });

      if (error) {
        throw new Error(error.message);
      }

      setSuccess(true);
      setShowForm(false);
      resetForm();
      await loadTickets();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "حدث خطأ غير متوقع";
      alert(message);
    } finally {
      setSending(false);
    }
  }

  useEffect(() => {
    loadTickets();
  }, []);

  return (
    <main
      dir="rtl"
      className="
      min-h-screen
      bg-slate-100
      px-4
      py-6
      pb-32
      overflow-x-hidden
      "
    >
      <div className="max-w-xl mx-auto">

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
          <button
            onClick={() => router.push("/support")}
            className="
            bg-white/15
            text-white
            px-4
            py-2
            rounded-2xl
            text-sm
            font-bold
            mb-5
            "
          >
            رجوع
          </button>

          <p className="text-teal-100 text-sm font-bold">
            وثيق
          </p>

          <h1 className="text-3xl font-bold mt-2">
            التذاكر
          </h1>

          <p className="text-teal-100 mt-3 text-sm leading-7">
            ارفع مشكلتك بصورة، وبعد الإرسال يتم إغلاق التذكرة والرد خلال 24 ساعة.
          </p>
        </section>

        {loading && (
          <div
            className="
            bg-white
            rounded-[32px]
            p-8
            text-center
            shadow-sm
            border
            border-gray-100
            "
          >
            <div className="text-5xl mb-4">
              ⏳
            </div>

            <p className="font-bold text-gray-500">
              جاري تحميل التذاكر...
            </p>
          </div>
        )}

        {!loading && success && !showForm && !selectedTicket && (
          <div
            className="
            bg-white
            rounded-[32px]
            p-6
            text-center
            shadow-sm
            border
            border-gray-100
            mb-5
            "
          >
            <div className="text-6xl mb-4">
              ✅
            </div>

            <h2 className="text-2xl font-bold text-teal-700 mb-3">
              تم إرسال التذكرة
            </h2>

            <p className="text-gray-500 leading-7 mb-5">
              سوف يتم الرد عليك خلال 24 ساعة، وتم إغلاق التذكرة ولا يمكن تعديلها.
            </p>

            <button
              onClick={() => setSuccess(false)}
              className="
              w-full
              bg-teal-700
              text-white
              py-4
              rounded-2xl
              font-bold
              "
            >
              عرض التذاكر
            </button>
          </div>
        )}

        {!loading && selectedTicket && (
          <div
            className="
            bg-white
            rounded-[32px]
            p-5
            shadow-sm
            border
            border-gray-100
            "
          >
            <button
              onClick={() => setSelectedTicket(null)}
              className="
              bg-gray-100
              text-gray-700
              px-5
              py-3
              rounded-2xl
              font-bold
              mb-5
              "
            >
              رجوع للتذاكر
            </button>

            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <p className="text-sm text-gray-400">
                  رقم التذكرة
                </p>

                <h2 className="font-bold text-gray-900">
                  #{selectedTicket.id.slice(0, 8)}
                </h2>
              </div>

              <span
                className="
                bg-red-50
                text-red-600
                px-4
                py-2
                rounded-full
                text-sm
                font-bold
                "
              >
                مغلقة
              </span>
            </div>

            <div
              className="
              bg-gray-50
              rounded-2xl
              p-4
              mb-4
              "
            >
              <p className="text-sm text-gray-400 mb-2">
                سبب المشكلة
              </p>

              <p className="text-gray-800 leading-8 whitespace-pre-wrap">
                {selectedTicket.reason}
              </p>
            </div>

            {selectedTicket.image_url && (
              <div className="mb-4">
                <p className="font-bold text-gray-800 mb-3">
                  الصورة المرفقة
                </p>

                <img
                  src={selectedTicket.image_url}
                  alt="صورة التذكرة"
                  className="
                  w-full
                  rounded-3xl
                  border
                  border-gray-100
                  shadow-sm
                  "
                />
              </div>
            )}

            <div
              className="
              bg-teal-50
              border
              border-teal-100
              rounded-2xl
              p-4
              mb-4
              "
            >
              <p className="text-teal-800 font-bold mb-1">
                سوف يتم الرد خلال 24 ساعة
              </p>

              <p className="text-teal-700 text-sm leading-6">
                هذه تذكرة قديمة ومغلقة، لذلك لا يمكنك تعديلها.
              </p>
            </div>

            <p className="text-xs text-gray-400 text-center">
              تاريخ الإرسال: {formatDate(selectedTicket.created_at)}
            </p>
          </div>
        )}

        {!loading && showForm && !selectedTicket && (
          <div
            className="
            bg-white
            rounded-[32px]
            p-5
            shadow-sm
            border
            border-gray-100
            "
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-bold text-gray-900">
                فتح تذكرة جديدة
              </h2>

              <button
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="
                bg-gray-100
                text-gray-700
                px-4
                py-2
                rounded-2xl
                font-bold
                "
              >
                إلغاء
              </button>
            </div>

            <label className="block font-bold text-gray-800 mb-2">
              سبب المشكلة
            </label>

            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="اكتب المشكلة بالتفصيل..."
              rows={6}
              className="
              w-full
              rounded-2xl
              p-4
              mb-5
              resize-none
              "
            />

            <label className="block font-bold text-gray-800 mb-3">
              إرفاق صورة
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];

                if (file) {
                  chooseImage(file);
                }

                e.target.value = "";
              }}
            />

            {!imagePreview && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="
                w-full
                border-2
                border-dashed
                border-gray-300
                bg-gray-50
                rounded-3xl
                p-6
                mb-5
                text-center
                active:scale-[0.98]
                transition
                "
              >
                <div className="text-5xl mb-3">
                  📷
                </div>

                <p className="font-bold text-gray-800">
                  اضغط لإرفاق صورة
                </p>

                <p className="text-sm text-gray-400 mt-2">
                  صورة المشكلة أو إثباتها
                </p>
              </button>
            )}

            {imagePreview && (
              <div className="mb-5">
                <img
                  src={imagePreview}
                  alt="معاينة الصورة"
                  className="
                  w-full
                  rounded-3xl
                  border
                  border-gray-100
                  shadow-sm
                  mb-3
                  "
                />

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="
                    bg-gray-100
                    text-gray-700
                    py-3
                    rounded-2xl
                    font-bold
                    "
                  >
                    تغيير الصورة
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview("");
                    }}
                    className="
                    bg-red-50
                    text-red-600
                    py-3
                    rounded-2xl
                    font-bold
                    "
                  >
                    حذف الصورة
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={sendTicket}
              disabled={sending}
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
              {sending ? "جاري الإرسال..." : "إرسال التذكرة"}
            </button>

            <p className="text-center text-gray-400 text-sm mt-4 leading-6">
              بعد الإرسال سيتم إغلاق التذكرة ولا يمكنك تعديلها.
            </p>
          </div>
        )}

        {!loading && !showForm && !selectedTicket && !success && (
          <div
            className="
            bg-white
            rounded-[32px]
            p-5
            shadow-sm
            border
            border-gray-100
            "
          >
            <button
              onClick={openNewTicket}
              className="
              w-full
              bg-teal-700
              hover:bg-teal-800
              text-white
              py-4
              rounded-2xl
              font-bold
              text-lg
              mb-5
              active:scale-[0.97]
              transition
              "
            >
              فتح تذكرة جديدة
            </button>

            <h2 className="text-xl font-bold text-gray-900 mb-4">
              التذاكر القديمة
            </h2>

            {tickets.length === 0 ? (
              <div
                className="
                bg-gray-50
                rounded-3xl
                p-8
                text-center
                "
              >
                <div className="text-6xl mb-4">
                  🎫
                </div>

                <p className="font-bold text-gray-500">
                  لا توجد تذاكر قديمة
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {tickets.map((ticket) => (
                  <button
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className="
                    w-full
                    text-right
                    bg-gray-50
                    hover:bg-gray-100
                    rounded-3xl
                    p-4
                    border
                    border-gray-100
                    active:scale-[0.98]
                    transition
                    "
                  >
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <h3 className="font-bold text-gray-900">
                        تذكرة #{ticket.id.slice(0, 8)}
                      </h3>

                      <span
                        className="
                        bg-red-50
                        text-red-600
                        px-3
                        py-1
                        rounded-full
                        text-xs
                        font-bold
                        "
                      >
                        مغلقة
                      </span>
                    </div>

                    <p className="text-gray-500 text-sm leading-6 line-clamp-2 mb-3">
                      {ticket.reason}
                    </p>

                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-400">
                        {formatDate(ticket.created_at)}
                      </p>

                      {ticket.image_url && (
                        <span className="text-xs text-teal-700 font-bold">
                          📷 صورة مرفقة
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </main>
  );
}