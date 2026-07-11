"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type SupportMessage = {
  id: string;
  user_id: string;
  user_name: string | null;
  sender: string;
  message: string;
  image_url: string | null;
  closed: boolean;
  chat_status: string | null;
  created_at: string;
};

type Ticket = {
  id: string;
  user_id: string;
  user_name: string | null;
  reason: string;
  image_url: string | null;
  status: string | null;
  admin_reply: string | null;
  replied_at: string | null;
  reply_status: string | null;
  created_at: string;
};

type ChatGroup = {
  user_id: string;
  user_name: string;
  last_message: string;
  last_time: string;
  messages: SupportMessage[];
};

export default function AdminSupportPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"chats" | "tickets">("chats");

  const [loading, setLoading] = useState(true);

  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [chatGroups, setChatGroups] = useState<ChatGroup[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatGroup | null>(null);
  const [replyMessage, setReplyMessage] = useState("");

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [ticketReply, setTicketReply] = useState("");

  const [sending, setSending] = useState(false);

  function formatDate(date: string) {
    return new Date(date).toLocaleString("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function checkAdmin() {
    const role = sessionStorage.getItem("role");
    const email = sessionStorage.getItem("email");

    if (role !== "admin" && email !== "deaabd89@gmail.com") {
      router.push("/deal");
      return false;
    }

    return true;
  }

  async function loadData() {
    if (!checkAdmin()) return;

    setLoading(true);

    const { data: messageData, error: messageError } = await supabase
      .from("support_messages")
      .select("*")
      .eq("closed", false)
      .order("created_at", { ascending: true });

    if (messageError) {
      console.log(messageError);
    }

    const allMessages = messageData || [];
    setMessages(allMessages);

    const grouped: Record<string, ChatGroup> = {};

    allMessages.forEach((msg: SupportMessage) => {
      if (!grouped[msg.user_id]) {
        grouped[msg.user_id] = {
          user_id: msg.user_id,
          user_name: msg.user_name || "مستخدم",
          last_message: msg.message,
          last_time: msg.created_at,
          messages: [],
        };
      }

      grouped[msg.user_id].messages.push(msg);
      grouped[msg.user_id].last_message = msg.message;
      grouped[msg.user_id].last_time = msg.created_at;
    });

    const groups = Object.values(grouped).sort(
      (a, b) =>
        new Date(b.last_time).getTime() - new Date(a.last_time).getTime()
    );

    setChatGroups(groups);

    if (selectedChat) {
      const updatedSelected = groups.find(
        (group) => group.user_id === selectedChat.user_id
      );

      setSelectedChat(updatedSelected || null);
    }

    const { data: ticketData, error: ticketError } = await supabase
      .from("support_tickets")
      .select("*")
      .order("created_at", { ascending: false });

    if (ticketError) {
      console.log(ticketError);
    }

    setTickets(ticketData || []);

    if (selectedTicket) {
      const updatedTicket = (ticketData || []).find(
        (ticket: Ticket) => ticket.id === selectedTicket.id
      );

      setSelectedTicket(updatedTicket || null);
    }

    setLoading(false);
  }

  async function sendChatReply() {
    if (!selectedChat) return;

    if (!replyMessage.trim()) {
      alert("اكتب الرد");
      return;
    }

    setSending(true);

    const { error } = await supabase.from("support_messages").insert({
      user_id: selectedChat.user_id,
      user_name: selectedChat.user_name,
      sender: "support",
      message: replyMessage.trim(),
      image_url: null,
      closed: false,
      chat_status: "open",
    });

    setSending(false);

    if (error) {
      alert(error.message);
      return;
    }

    setReplyMessage("");
    await loadData();
  }

  async function endChat(userId: string) {
    const ok = confirm(
      "هل تريد إنهاء هذه المحادثة؟ ستختفي من عند المستخدم."
    );

    if (!ok) return;

    const { error } = await supabase
      .from("support_messages")
      .update({
        closed: true,
        chat_status: "closed",
      })
      .eq("user_id", userId)
      .eq("closed", false);

    if (error) {
      alert(error.message);
      return;
    }

    setSelectedChat(null);
    await loadData();

    alert("تم إنهاء المحادثة واختفت من عند المستخدم ✅");
  }

  async function replyToTicket() {
    if (!selectedTicket) return;

    if (!ticketReply.trim()) {
      alert("اكتب الرد على التذكرة");
      return;
    }

    setSending(true);

    const { error } = await supabase
      .from("support_tickets")
      .update({
        admin_reply: ticketReply.trim(),
        replied_at: new Date().toISOString(),
        reply_status: "replied",
        status: "closed",
      })
      .eq("id", selectedTicket.id);

    setSending(false);

    if (error) {
      alert(error.message);
      return;
    }

    setTicketReply("");
    await loadData();

    alert("تم الرد على التذكرة ✅");
  }

  useEffect(() => {
    loadData();

    const interval = setInterval(() => {
      loadData();
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <main
      dir="rtl"
      className="
      min-h-screen
      bg-slate-100
      px-4
      py-6
      overflow-x-hidden
      "
    >
      <div className="max-w-6xl mx-auto">

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
            onClick={() => router.push("/admin")}
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
            رجوع للوحة الإدارة
          </button>

          <p className="text-teal-100 text-sm font-bold">
            وثيق
          </p>

          <h1 className="text-3xl font-bold mt-2">
            البلاغات والدعم
          </h1>

          <p className="text-teal-100 mt-3 text-sm leading-7">
            هنا تظهر محادثات الدعم والتذاكر، وتقدر ترد عليها أو تنهيها.
          </p>
        </section>

        <div
          className="
          bg-white
          rounded-[30px]
          p-2
          shadow-sm
          border
          border-gray-100
          mb-5
          grid
          grid-cols-2
          gap-2
          "
        >
          <button
            onClick={() => {
              setActiveTab("chats");
              setSelectedTicket(null);
            }}
            className={`py-3 rounded-2xl font-bold transition ${
              activeTab === "chats"
                ? "bg-teal-700 text-white"
                : "bg-gray-50 text-gray-600"
            }`}
          >
            المحادثات
          </button>

          <button
            onClick={() => {
              setActiveTab("tickets");
              setSelectedChat(null);
            }}
            className={`py-3 rounded-2xl font-bold transition ${
              activeTab === "tickets"
                ? "bg-teal-700 text-white"
                : "bg-gray-50 text-gray-600"
            }`}
          >
            التذاكر
          </button>
        </div>

        {loading && (
          <div
            className="
            bg-white
            rounded-[32px]
            p-10
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
              جاري تحميل البلاغات...
            </p>
          </div>
        )}

        {!loading && activeTab === "chats" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            <section
              className="
              bg-white
              rounded-[32px]
              p-5
              shadow-sm
              border
              border-gray-100
              lg:col-span-1
              "
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                الأشخاص اللي مكلمين الدعم
              </h2>

              {chatGroups.length === 0 ? (
                <div className="bg-gray-50 rounded-3xl p-8 text-center">
                  <div className="text-5xl mb-3">
                    💬
                  </div>

                  <p className="font-bold text-gray-500">
                    لا توجد محادثات حالياً
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {chatGroups.map((chat) => (
                    <button
                      key={chat.user_id}
                      onClick={() => setSelectedChat(chat)}
                      className={`w-full text-right rounded-3xl p-4 border transition active:scale-[0.98] ${
                        selectedChat?.user_id === chat.user_id
                          ? "bg-teal-50 border-teal-200"
                          : "bg-gray-50 border-gray-100"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-gray-900">
                          {chat.user_name}
                        </h3>

                        <span className="bg-green-50 text-green-700 text-xs px-3 py-1 rounded-full font-bold">
                          مفتوحة
                        </span>
                      </div>

                      <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                        {chat.last_message}
                      </p>

                      <p className="text-xs text-gray-400">
                        {formatDate(chat.last_time)}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </section>

            <section
              className="
              bg-white
              rounded-[32px]
              p-5
              shadow-sm
              border
              border-gray-100
              lg:col-span-2
              "
            >
              {!selectedChat ? (
                <div className="h-[520px] flex items-center justify-center text-center">
                  <div>
                    <div className="text-6xl mb-4">
                      🎧
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      اختر محادثة
                    </h2>

                    <p className="text-gray-500">
                      اختر شخص من القائمة عشان ترد عليه.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div>
                      <p className="text-sm text-gray-400">
                        محادثة مع
                      </p>

                      <h2 className="text-2xl font-bold text-gray-900">
                        {selectedChat.user_name}
                      </h2>
                    </div>

                    <button
                      onClick={() => endChat(selectedChat.user_id)}
                      className="
                      bg-red-50
                      text-red-600
                      border
                      border-red-100
                      px-4
                      py-3
                      rounded-2xl
                      font-bold
                      "
                    >
                      إنهاء المحادثة
                    </button>
                  </div>

                  <div
                    className="
                    bg-gray-100
                    rounded-3xl
                    p-4
                    h-[420px]
                    overflow-y-auto
                    mb-4
                    "
                  >
                    {selectedChat.messages.map((m) => (
                      <div
                        key={m.id}
                        className={`flex mb-3 ${
                          m.sender === "user"
                            ? "justify-start"
                            : "justify-end"
                        }`}
                      >
                        <div
                          className={`max-w-[78%] px-4 py-3 rounded-2xl leading-7 ${
                            m.sender === "user"
                              ? "bg-white text-gray-800 rounded-br-none"
                              : "bg-teal-700 text-white rounded-bl-none"
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
                                border-gray-100
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

                          <p className="text-[10px] opacity-60 mt-2">
                            {formatDate(m.created_at)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          sendChatReply();
                        }
                      }}
                      placeholder="اكتب ردك هنا..."
                      className="
                      flex-1
                      rounded-2xl
                      p-4
                      outline-none
                      "
                    />

                    <button
                      onClick={sendChatReply}
                      disabled={sending}
                      className="
                      bg-teal-700
                      disabled:bg-gray-300
                      text-white
                      px-6
                      rounded-2xl
                      font-bold
                      "
                    >
                      إرسال
                    </button>
                  </div>
                </>
              )}
            </section>
          </div>
        )}

        {!loading && activeTab === "tickets" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            <section
              className="
              bg-white
              rounded-[32px]
              p-5
              shadow-sm
              border
              border-gray-100
              lg:col-span-1
              "
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                التذاكر
              </h2>

              {tickets.length === 0 ? (
                <div className="bg-gray-50 rounded-3xl p-8 text-center">
                  <div className="text-5xl mb-3">
                    🎫
                  </div>

                  <p className="font-bold text-gray-500">
                    لا توجد تذاكر حالياً
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tickets.map((ticket) => (
                    <button
                      key={ticket.id}
                      onClick={() => {
                        setSelectedTicket(ticket);
                        setTicketReply(ticket.admin_reply || "");
                      }}
                      className={`w-full text-right rounded-3xl p-4 border transition active:scale-[0.98] ${
                        selectedTicket?.id === ticket.id
                          ? "bg-teal-50 border-teal-200"
                          : "bg-gray-50 border-gray-100"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-gray-900">
                          {ticket.user_name || "مستخدم"}
                        </h3>

                        {ticket.admin_reply ? (
                          <span className="bg-green-50 text-green-700 text-xs px-3 py-1 rounded-full font-bold">
                            تم الرد
                          </span>
                        ) : (
                          <span className="bg-yellow-50 text-yellow-700 text-xs px-3 py-1 rounded-full font-bold">
                            ينتظر الرد
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                        {ticket.reason}
                      </p>

                      <p className="text-xs text-gray-400">
                        {formatDate(ticket.created_at)}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </section>

            <section
              className="
              bg-white
              rounded-[32px]
              p-5
              shadow-sm
              border
              border-gray-100
              lg:col-span-2
              "
            >
              {!selectedTicket ? (
                <div className="h-[520px] flex items-center justify-center text-center">
                  <div>
                    <div className="text-6xl mb-4">
                      🎫
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      اختر تذكرة
                    </h2>

                    <p className="text-gray-500">
                      اختر تذكرة من القائمة عشان تشوف التفاصيل وترد عليها.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div>
                      <p className="text-sm text-gray-400">
                        تذكرة من
                      </p>

                      <h2 className="text-2xl font-bold text-gray-900">
                        {selectedTicket.user_name || "مستخدم"}
                      </h2>
                    </div>

                    <span className="bg-red-50 text-red-600 px-4 py-2 rounded-full text-sm font-bold">
                      مغلقة للمستخدم
                    </span>
                  </div>

                  <div className="bg-gray-50 rounded-3xl p-4 mb-4">
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
                        max-h-[420px]
                        object-contain
                        rounded-3xl
                        border
                        border-gray-100
                        bg-gray-50
                        "
                      />
                    </div>
                  )}

                  <label className="block font-bold text-gray-800 mb-2">
                    رد الأدمن
                  </label>

                  <textarea
                    value={ticketReply}
                    onChange={(e) => setTicketReply(e.target.value)}
                    placeholder="اكتب الرد على التذكرة..."
                    rows={5}
                    className="
                    w-full
                    rounded-2xl
                    p-4
                    mb-4
                    resize-none
                    "
                  />

                  <button
                    onClick={replyToTicket}
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
                    "
                  >
                    {sending ? "جاري الإرسال..." : "إرسال الرد"}
                  </button>

                  {selectedTicket.admin_reply && (
                    <div className="bg-green-50 border border-green-100 rounded-3xl p-4 mt-4">
                      <p className="font-bold text-green-700 mb-2">
                        تم الرد على هذه التذكرة
                      </p>

                      <p className="text-green-700 text-sm leading-7">
                        {selectedTicket.admin_reply}
                      </p>

                      {selectedTicket.replied_at && (
                        <p className="text-xs text-green-600 mt-3">
                          وقت الرد: {formatDate(selectedTicket.replied_at)}
                        </p>
                      )}
                    </div>
                  )}

                  <p className="text-xs text-gray-400 text-center mt-4">
                    تاريخ التذكرة: {formatDate(selectedTicket.created_at)}
                  </p>
                </>
              )}
            </section>
          </div>
        )}

      </div>
    </main>
  );
}