"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function SupportPage() {
  const router = useRouter();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [started, setStarted] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [thankYou, setThankYou] = useState(false);
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);

  function getUserId() {
    return sessionStorage.getItem("user_id");
  }

  function getUserName() {
    return sessionStorage.getItem("name") || "مستخدم";
  }

  async function loadMessages() {
    const userId = getUserId();

    if (!userId) {
      router.push("/login");
      return;
    }

    const { data, error } = await supabase
      .from("support_messages")
      .select("*")
      .eq("user_id", userId)
      .eq("closed", false)
      .order("created_at", { ascending: true });

    if (error) {
      console.log(error);
      setLoading(false);
      return;
    }

    const openMessages = data || [];

    setMessages(openMessages);

    if (openMessages.length > 0) {
      setStarted(true);
      setShowRating(false);
      setThankYou(false);
    } else {
      setStarted(false);
    }

    setLoading(false);
  }

  async function deleteOldChat() {
    const userId = getUserId();

    if (!userId) {
      router.push("/login");
      return false;
    }

    const { error } = await supabase
      .from("support_messages")
      .delete()
      .eq("user_id", userId);

    if (error) {
      alert(error.message);
      return false;
    }

    return true;
  }

  async function startChat() {
    const userId = getUserId();
    const userName = getUserName();

    if (!userId) {
      router.push("/login");
      return;
    }

    setLoading(true);

    const { data: oldMessages, error: oldError } = await supabase
      .from("support_messages")
      .select("*")
      .eq("user_id", userId)
      .eq("closed", false)
      .order("created_at", { ascending: true });

    if (oldError) {
      console.log(oldError);
      setLoading(false);
      return;
    }

    if (oldMessages && oldMessages.length > 0) {
      setMessages(oldMessages);
      setStarted(true);
      setShowRating(false);
      setThankYou(false);
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("support_messages").insert({
      user_id: userId,
      user_name: userName,
      sender: "support",
      message: "مرحباً 👋 تم فتح محادثة الدعم. سيتم الرد عليك خلال 24 ساعة.",
      image_url: null,
      closed: false,
      chat_status: "open",
    });

    if (error) {
      console.log(error);
      setLoading(false);
      return;
    }

    setStarted(true);
    setShowRating(false);
    setThankYou(false);

    await loadMessages();
  }

  async function sendMessage() {
    const userId = getUserId();
    const userName = getUserName();

    if (!userId) {
      router.push("/login");
      return;
    }

    if (!message.trim()) return;

    const text = message.trim();

    setMessage("");

    const { error } = await supabase.from("support_messages").insert({
      user_id: userId,
      user_name: userName,
      sender: "user",
      message: text,
      image_url: null,
      closed: false,
      chat_status: "open",
    });

    if (error) {
      alert(error.message);
      return;
    }

    await loadMessages();
  }

  async function sendImage(file: File) {
    const userId = getUserId();
    const userName = getUserName();

    if (!userId) {
      router.push("/login");
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("اختر صورة فقط");
      return;
    }

    setUploadingImage(true);

    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `support/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("support-images")
      .upload(filePath, file);

    if (uploadError) {
      setUploadingImage(false);
      alert(uploadError.message);
      return;
    }

    const { data } = supabase.storage
      .from("support-images")
      .getPublicUrl(filePath);

    const imageUrl = data.publicUrl;

    const { error } = await supabase.from("support_messages").insert({
      user_id: userId,
      user_name: userName,
      sender: "user",
      message: "صورة مرفقة",
      image_url: imageUrl,
      closed: false,
      chat_status: "open",
    });

    setUploadingImage(false);

    if (error) {
      alert(error.message);
      return;
    }

    await loadMessages();
  }

  async function closeChat() {
    const deleted = await deleteOldChat();

    if (!deleted) return;

    setMessages([]);
    setStarted(false);
    setShowConfirm(false);
    setShowRating(true);
    setThankYou(false);
  }

  async function sendRating() {
    if (rating === 0) {
      alert("اختر التقييم ⭐");
      return;
    }

    setShowRating(false);
    setThankYou(true);
  }

  async function newChat() {
    setLoading(true);

    const deleted = await deleteOldChat();

    if (!deleted) {
      setLoading(false);
      return;
    }

    setRating(0);
    setThankYou(false);
    setShowRating(false);
    setMessages([]);
    setStarted(false);

    const userId = getUserId();
    const userName = getUserName();

    if (!userId) {
      router.push("/login");
      return;
    }

    const { error } = await supabase.from("support_messages").insert({
      user_id: userId,
      user_name: userName,
      sender: "support",
      message: "مرحباً 👋 تم فتح محادثة دعم جديدة. سيتم الرد عليك خلال 24 ساعة.",
      image_url: null,
      closed: false,
      chat_status: "open",
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    await loadMessages();
  }

  useEffect(() => {
    loadMessages();
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
          <p className="text-teal-100 text-sm font-bold">
            وثيق
          </p>

          <h1 className="text-3xl font-bold mt-2">
            الدعم الفني
          </h1>

          <p className="text-teal-100 mt-3 text-sm leading-7">
            تواصل معنا، ومحادثتك تبقى محفوظة حتى تنهيها بنفسك.
          </p>
        </section>

        <div
          className="
          bg-white
          rounded-[32px]
          shadow-sm
          border
          border-gray-100
          p-5
          "
        >
          {loading && (
            <div className="text-center py-14">
              <div className="text-5xl mb-4">
                ⏳
              </div>

              <p className="font-bold text-gray-500">
                جاري تحميل المحادثة...
              </p>
            </div>
          )}

          {!loading && !started && !showRating && !thankYou && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">
                  🎧
                </div>

                <h2 className="text-2xl font-bold text-gray-900">
                  كيف نقدر نساعدك؟
                </h2>

                <p className="text-gray-500 mt-2 leading-7">
                  ابدأ محادثة مع الدعم، ولو طلعت ورجعت بتبقى المحادثة موجودة.
                </p>
              </div>

              <button
                onClick={startChat}
                className="
                w-full
                bg-teal-700
                hover:bg-teal-800
                text-white
                p-4
                rounded-2xl
                font-bold
                text-lg
                active:scale-[0.97]
                transition
                "
              >
                💬 التواصل مع الدعم الفني
              </button>

              <button
                onClick={() => router.push("/support/ticket")}
                className="
                w-full
                border-2
                border-gray-200
                p-4
                rounded-2xl
                font-bold
                hover:bg-gray-50
                active:scale-[0.97]
                transition
                "
              >
                🎫 ترك تذكرة
              </button>
            </div>
          )}

          {!loading && started && !showRating && !thankYou && (
            <>
              <div
                className="
                bg-gray-100
                rounded-3xl
                p-4
                h-[430px]
                overflow-y-auto
                mb-4
                "
              >
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center">
                    <p className="text-gray-400 font-bold">
                      لا توجد رسائل حتى الآن
                    </p>
                  </div>
                ) : (
                  messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex mb-3 ${
                        m.sender === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[78%] px-4 py-3 rounded-2xl text-white leading-7 ${
                          m.sender === "user"
                            ? "bg-teal-700 rounded-br-none"
                            : "bg-gray-700 rounded-bl-none"
                        }`}
                      >
                        {m.image_url ? (
                          <div>
                            <img
                              src={m.image_url}
                              alt="صورة مرفقة"
                              className="
                              max-w-full
                              rounded-2xl
                              mb-2
                              border
                              border-white/20
                              "
                            />

                            <p className="text-xs opacity-80">
                              {m.message}
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm">
                            {m.message}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];

                    if (file) {
                      sendImage(file);
                    }

                    e.target.value = "";
                  }}
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="
                  w-12
                  h-12
                  rounded-2xl
                  bg-gray-100
                  text-gray-700
                  font-bold
                  text-2xl
                  flex
                  items-center
                  justify-center
                  active:scale-[0.97]
                  transition
                  disabled:opacity-50
                  "
                >
                  {uploadingImage ? "…" : "+"}
                </button>

                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      sendMessage();
                    }
                  }}
                  placeholder="اكتب رسالتك..."
                  className="
                  flex-1
                  rounded-2xl
                  p-3
                  outline-none
                  "
                />

                <button
                  onClick={sendMessage}
                  className="
                  bg-teal-700
                  text-white
                  px-5
                  rounded-2xl
                  font-bold
                  active:scale-[0.97]
                  transition
                  "
                >
                  إرسال
                </button>
              </div>

              <button
                onClick={() => setShowConfirm(true)}
                className="
                mt-4
                w-full
                text-red-600
                border
                border-red-200
                bg-red-50
                px-5
                py-3
                rounded-2xl
                font-bold
                "
              >
                إنهاء المحادثة
              </button>
            </>
          )}

          {showRating && !thankYou && (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">
                ⭐
              </div>

              <h2 className="text-2xl font-bold mb-6 text-gray-900">
                قيّم خدمة الدعم
              </h2>

              <div className="flex justify-center gap-2 text-4xl mb-6">
                {[1, 2, 3, 4, 5].map((x) => (
                  <button
                    key={x}
                    onClick={() => setRating(x)}
                    className="active:scale-90 transition"
                  >
                    {x <= rating ? "⭐" : "☆"}
                  </button>
                ))}
              </div>

              <button
                onClick={sendRating}
                className="
                w-full
                bg-teal-700
                hover:bg-teal-800
                text-white
                px-8
                py-4
                rounded-2xl
                font-bold
                text-lg
                "
              >
                إرسال التقييم
              </button>
            </div>
          )}

          {thankYou && (
            <div className="text-center py-10">
              <div className="text-6xl mb-5">
                ✅
              </div>

              <h2 className="text-3xl font-bold text-teal-700 mb-4">
                شكراً على تقييمك
              </h2>

              <p className="text-gray-500 leading-7 mb-6">
                تم إنهاء المحادثة. تقدر تبدأ محادثة جديدة في أي وقت.
              </p>

              <button
                onClick={newChat}
                className="
                w-full
                bg-teal-700
                text-white
                py-4
                rounded-2xl
                font-bold
                text-lg
                mb-3
                "
              >
                محادثة جديدة
              </button>

              <button
                onClick={() => router.push("/deal")}
                className="
                w-full
                bg-gray-100
                text-gray-700
                py-4
                rounded-2xl
                font-bold
                text-lg
                "
              >
                الرجوع للرئيسية
              </button>
            </div>
          )}
        </div>

        {showConfirm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999] px-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-sm text-center">
              <h2 className="font-bold text-xl mb-3 text-gray-900">
                هل تريد إنهاء المحادثة؟
              </h2>

              <p className="text-gray-500 mb-6 leading-7">
                بعد الإنهاء راح تنحذف المحادثة القديمة وتقدر تبدأ محادثة جديدة.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={closeChat}
                  className="
                  bg-red-600
                  text-white
                  px-6
                  py-3
                  rounded-2xl
                  font-bold
                  "
                >
                  نعم
                </button>

                <button
                  onClick={() => setShowConfirm(false)}
                  className="
                  bg-gray-100
                  text-gray-700
                  px-6
                  py-3
                  rounded-2xl
                  font-bold
                  "
                >
                  لا
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}