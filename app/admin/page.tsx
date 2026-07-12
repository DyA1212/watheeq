"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const ADMIN_EMAIL = "deaabd89@gmail.com";

type AdminTab = "home" | "users" | "deals" | "reports" | "transfers";

type User = {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  created_at?: string;
};

type Deal = {
  id: string;
  description?: string;
  amount?: number | string;
  commission?: number | string;
  seller_amount?: number | string;
  status?: string;
  seller_id?: string;
  buyer_id?: string;
  created_at?: string;
};

type Wallet = {
  id?: string;
  user_id: string;
  owner_name?: string | null;
  bank_name?: string | null;
  iban?: string | null;
  account_number?: string | null;
  balance?: number | string | null;
  frozen_balance?: number | string | null;
  pending_transfer_balance?: number | string | null;
  transferred_balance?: number | string | null;
};

export default function AdminPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<AdminTab>("home");
  const [loading, setLoading] = useState(true);

  const [users, setUsers] = useState<User[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);

  const [newPasswords, setNewPasswords] = useState<Record<string, string>>({});
  const [changingPasswordId, setChangingPasswordId] = useState("");

  const [updatingDealId, setUpdatingDealId] = useState("");
  const [transferringId, setTransferringId] = useState("");

  const [stats, setStats] = useState({
    users: 0,
    deals: 0,
    active: 0,
    completed: 0,
    cancelled: 0,
    commission: 0,
    transferAmount: 0,
    transferred: 0,
    wallets: 0,
  });

  useEffect(() => {
    async function protectAdminPage() {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      const currentEmail = user?.email?.trim().toLowerCase();

      if (error || !user || currentEmail !== ADMIN_EMAIL) {
        sessionStorage.setItem("role", "user");
        router.replace("/deal");
        return;
      }

      sessionStorage.setItem("role", "admin");
      sessionStorage.setItem("email", currentEmail);
      sessionStorage.setItem("user_id", user.id);

      await loadData();
    }

    protectAdminPage();
  }, [router]);

  function money(value: number | string | null | undefined) {
    return Number(value || 0).toLocaleString("ar-SA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  function dateText(date?: string) {
    if (!date) return "بدون تاريخ";

    return new Date(date).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function statusText(status?: string) {
    if (status === "pending") return "بانتظار الدفع";
    if (status === "paid") return "مبلغ مجمد";
    if (status === "delivered") return "تم التسليم";
    if (status === "completed") return "مكتملة";
    if (status === "cancelled") return "ملغية";

    return "غير معروف";
  }

  function statusStyle(status?: string) {
    if (status === "pending") return "bg-yellow-100 text-yellow-700";
    if (status === "paid") return "bg-blue-100 text-blue-700";
    if (status === "delivered") return "bg-purple-100 text-purple-700";
    if (status === "completed") return "bg-green-100 text-green-700";
    if (status === "cancelled") return "bg-red-100 text-red-700";

    return "bg-gray-100 text-gray-600";
  }

  function getUserName(userId?: string) {
    const user = users.find((u) => String(u.id) === String(userId));

    if (user?.name) return user.name;
    if (user?.email) return user.email;

    return userId || "غير معروف";
  }

  async function loadData() {
    setLoading(true);

    const { data: usersData } = await supabase
      .from("users")
      .select("id, name, email, phone, created_at")
      .order("created_at", { ascending: false });

    const { data: dealsData } = await supabase
      .from("deals")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: walletsData } = await supabase
      .from("wallets")
      .select("*")
      .order("created_at", { ascending: false });

    const safeUsers = (usersData || []) as User[];
    const safeDeals = (dealsData || []) as Deal[];
    const safeWallets = (walletsData || []) as Wallet[];

    const commission =
      safeDeals.reduce(
        (sum: number, deal: Deal) => sum + Number(deal.commission || 0),
        0
      ) || 0;

    const transferAmount =
      safeWallets.reduce(
        (sum: number, wallet: Wallet) =>
          sum + Number(wallet.pending_transfer_balance || 0),
        0
      ) || 0;

    const transferred =
      safeWallets.reduce(
        (sum: number, wallet: Wallet) =>
          sum + Number(wallet.transferred_balance || 0),
        0
      ) || 0;

    setUsers(safeUsers);
    setDeals(safeDeals);
    setWallets(safeWallets);

    setStats({
      users: safeUsers.length,
      deals: safeDeals.length,
      active:
        safeDeals.filter(
          (d: Deal) =>
            d.status === "pending" ||
            d.status === "paid" ||
            d.status === "delivered"
        ).length || 0,
      completed:
        safeDeals.filter((d: Deal) => d.status === "completed").length || 0,
      cancelled:
        safeDeals.filter((d: Deal) => d.status === "cancelled").length || 0,
      commission,
      transferAmount,
      transferred,
      wallets: safeWallets.length,
    });

    setLoading(false);
  }

  async function changeUserPassword(user: User) {
    const newPassword = (newPasswords[user.id] || "").trim();

    if (newPassword.length < 8) {
      alert("كلمة المرور الجديدة لازم تكون 8 أحرف أو أكثر");
      return;
    }

    const confirmed = window.confirm(
      `هل تريد تعيين كلمة مرور جديدة للمستخدم ${
        user.name || user.email || "بدون اسم"
      }؟`
    );

    if (!confirmed) return;

    setChangingPasswordId(user.id);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        alert("انتهت جلسة الأدمن، سجل الدخول مرة ثانية");
        router.replace("/login");
        return;
      }

      const response = await fetch("/api/admin/users/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          userId: user.id,
          newPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result?.error || "تعذر تغيير كلمة المرور");
        return;
      }

      setNewPasswords((current) => ({
        ...current,
        [user.id]: "",
      }));

      alert("تم تغيير كلمة المرور بنجاح ✅");
    } catch {
      alert("حدث خطأ أثناء تغيير كلمة المرور");
    } finally {
      setChangingPasswordId("");
    }
  }

  async function updateDealStatus(
    deal: Deal,
    newStatus: "completed" | "cancelled"
  ) {
    if (deal.status === "completed" || deal.status === "cancelled") {
      alert("هذه الصفقة منتهية بالفعل");
      return;
    }

    const text =
      newStatus === "completed" ? "إنهاء الصفقة" : "إلغاء الصفقة";

    let confirmMessage = `هل أنت متأكد من ${text}؟`;

    if (newStatus === "completed" && deal.status === "pending") {
      confirmMessage =
        "هذه الصفقة لم يتم دفعها بعد. هل تريد إنهاءها بدون تحويل أي مبلغ للبائع؟";
    }

    const confirmUpdate = confirm(confirmMessage);

    if (!confirmUpdate) return;

    setUpdatingDealId(deal.id);

    const { error } = await supabase
      .from("deals")
      .update({
        status: newStatus,
      })
      .eq("id", deal.id);

    if (error) {
      setUpdatingDealId("");
      alert(error.message);
      return;
    }

    if (
      newStatus === "completed" &&
      deal.seller_id &&
      Number(deal.seller_amount || 0) > 0 &&
      (deal.status === "paid" || deal.status === "delivered")
    ) {
      const sellerAmount = Number(deal.seller_amount || 0);

      const { data: walletData } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", deal.seller_id)
        .maybeSingle();

      if (walletData) {
        const oldBalance = Number(walletData.balance || 0);
        const oldFrozen = Number(walletData.frozen_balance || 0);

        await supabase
          .from("wallets")
          .update({
            balance: oldBalance + sellerAmount,
            frozen_balance: Math.max(oldFrozen - sellerAmount, 0),
          })
          .eq("user_id", deal.seller_id);
      } else {
        await supabase.from("wallets").insert([
          {
            user_id: deal.seller_id,
            balance: sellerAmount,
            frozen_balance: 0,
            pending_transfer_balance: 0,
            transferred_balance: 0,
          },
        ]);
      }
    }

    setUpdatingDealId("");

    alert(
      newStatus === "completed"
        ? "تم إنهاء الصفقة ✅"
        : "تم إلغاء الصفقة ✅"
    );

    loadData();
  }

  async function markAsTransferred(wallet: Wallet) {
    const amount = Number(wallet.pending_transfer_balance || 0);

    if (amount <= 0) {
      alert("لا يوجد مبلغ قيد التحويل لهذا المستخدم");
      return;
    }

    const confirmTransfer = confirm(
      `هل أنت متأكد أنك حولت مبلغ ${money(amount)} ر.س إلى حساب ${
        wallet.owner_name || "المستخدم"
      }؟`
    );

    if (!confirmTransfer) return;

    setTransferringId(wallet.user_id);

    const newTransferred = Number(wallet.transferred_balance || 0) + amount;

    const { error } = await supabase
      .from("wallets")
      .update({
        pending_transfer_balance: 0,
        transferred_balance: newTransferred,
      })
      .eq("user_id", wallet.user_id);

    setTransferringId("");

    if (error) {
      alert(error.message);
      return;
    }

    alert("تم تسجيل التحويل بنجاح ✅");
    loadData();
  }

  const navItems: {
    id: AdminTab;
    label: string;
    icon: string;
  }[] = [
    { id: "home", label: "الرئيسية", icon: "📊" },
    { id: "users", label: "المستخدمون", icon: "👥" },
    { id: "deals", label: "الصفقات", icon: "💼" },
    { id: "reports", label: "البلاغات", icon: "📝" },
    { id: "transfers", label: "التحويل", icon: "🏦" },
  ];

  const walletsWithBankData = wallets.filter(
    (wallet) =>
      wallet.owner_name ||
      wallet.bank_name ||
      wallet.iban ||
      wallet.account_number
  );

  const pendingTransferWallets = walletsWithBankData.filter(
    (wallet) => Number(wallet.pending_transfer_balance || 0) > 0
  );

  return (
    <main
      dir="rtl"
      className="
      min-h-screen
      bg-slate-100
      px-4
      pt-5
      pb-32
      overflow-x-hidden
      "
    >
      <div className="max-w-7xl mx-auto">
        <header
          className="
          bg-gradient-to-br
          from-teal-900
          via-teal-800
          to-teal-700
          rounded-[32px]
          p-5
          md:p-8
          text-white
          shadow-lg
          mb-5
          "
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => router.push("/deal")}
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/20"
              >
                <span>→</span>
                الرجوع للرئيسية
              </button>

              <button
                type="button"
                onClick={() => router.push("/profile")}
                className="rounded-xl border border-white/30 bg-white/10 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/20"
              >
                حسابي
              </button>
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
              <div>
              <p className="text-teal-100 text-sm font-bold">
                إدارة وثيق
              </p>

              <h1 className="text-3xl md:text-5xl font-bold mt-2">
                لوحة الإدارة
              </h1>

              <p className="text-teal-100 mt-3">
                إدارة المستخدمين والصفقات والتحويلات
              </p>
            </div>

            <div
              className="
              bg-white/15
              rounded-3xl
              p-4
              backdrop-blur
              min-w-[230px]
              "
            >
              <p className="text-teal-100 text-sm">
                عمولات وثيق
              </p>

              <h2 className="text-3xl font-bold mt-2">
                {money(stats.commission)} ر.س
              </h2>
            </div>
          </div>
          </div>
        </header>

        <section
          className="
          bg-white
          rounded-[28px]
          shadow-sm
          border
          border-gray-100
          p-3
          mb-5
          sticky
          top-3
          z-30
          "
        >
          <div
            className="
            flex
            gap-2
            overflow-x-auto
            md:grid
            md:grid-cols-5
            "
          >
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`
                min-w-[120px]
                md:min-w-0
                rounded-2xl
                px-4
                py-3
                font-bold
                transition
                ${
                  activeTab === item.id
                    ? "bg-teal-700 text-white shadow"
                    : "bg-gray-100 text-gray-600"
                }
                `}
              >
                <span className="ml-1">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        </section>

        {loading ? (
          <div className="bg-white rounded-3xl p-10 text-center shadow-sm">
            <div className="text-5xl mb-4">⏳</div>

            <p className="font-bold text-gray-600">
              جاري تحميل لوحة الإدارة...
            </p>
          </div>
        ) : (
          <>
            {activeTab === "home" && (
              <section className="space-y-5">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                    <p className="text-gray-500 font-bold">
                      المستخدمون
                    </p>

                    <h2 className="text-4xl font-bold text-teal-700 mt-3">
                      {stats.users}
                    </h2>
                  </div>

                  <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                    <p className="text-gray-500 font-bold">
                      الصفقات
                    </p>

                    <h2 className="text-4xl font-bold text-blue-700 mt-3">
                      {stats.deals}
                    </h2>
                  </div>

                  <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                    <p className="text-gray-500 font-bold">
                      الجارية
                    </p>

                    <h2 className="text-4xl font-bold text-yellow-600 mt-3">
                      {stats.active}
                    </h2>
                  </div>

                  <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                    <p className="text-gray-500 font-bold">
                      المكتملة
                    </p>

                    <h2 className="text-4xl font-bold text-green-600 mt-3">
                      {stats.completed}
                    </h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                    <p className="text-gray-500 font-bold">
                      قيد التحويل
                    </p>

                    <h2 className="text-3xl font-bold text-orange-600 mt-3">
                      {money(stats.transferAmount)} ر.س
                    </h2>

                    <button
                      onClick={() => setActiveTab("transfers")}
                      className="mt-4 w-full bg-orange-500 text-white py-3 rounded-2xl font-bold"
                    >
                      فتح التحويل
                    </button>
                  </div>

                  <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                    <p className="text-gray-500 font-bold">
                      تم تحويله
                    </p>

                    <h2 className="text-3xl font-bold text-green-700 mt-3">
                      {money(stats.transferred)} ر.س
                    </h2>
                  </div>

                  <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                    <p className="text-gray-500 font-bold">
                      الصفقات الملغاة
                    </p>

                    <h2 className="text-3xl font-bold text-red-600 mt-3">
                      {stats.cancelled}
                    </h2>
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-5 md:p-8 shadow-sm border border-gray-100">
                  <h2 className="text-2xl font-bold text-gray-900 mb-5">
                    حالة المنصة
                  </h2>

                  <div className="space-y-4">
                    <div className="flex justify-between border-b pb-3">
                      <span>إجمالي المستخدمين</span>
                      <strong>{stats.users}</strong>
                    </div>

                    <div className="flex justify-between border-b pb-3">
                      <span>إجمالي الصفقات</span>
                      <strong>{stats.deals}</strong>
                    </div>

                    <div className="flex justify-between border-b pb-3">
                      <span>الصفقات الجارية</span>
                      <strong className="text-yellow-600">
                        {stats.active}
                      </strong>
                    </div>

                    <div className="flex justify-between border-b pb-3">
                      <span>الصفقات المكتملة</span>
                      <strong className="text-green-600">
                        {stats.completed}
                      </strong>
                    </div>

                    <div className="flex justify-between">
                      <span>عمولات وثيق</span>
                      <strong className="text-teal-700">
                        {money(stats.commission)} ر.س
                      </strong>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {activeTab === "users" && (
              <section className="space-y-4">
                <h2 className="text-3xl font-bold text-gray-900">
                  المستخدمون
                </h2>

                {users.length === 0 ? (
                  <div className="bg-white rounded-3xl p-8 text-center shadow-sm">
                    لا يوجد مستخدمون
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {users.map((user) => (
                      <div
                        key={user.id}
                        className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-14 h-14 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-2xl font-bold">
                            👤
                          </div>

                          <div className="min-w-0">
                            <h3 className="font-bold text-gray-900 truncate">
                              {user.name || "مستخدم بدون اسم"}
                            </h3>

                            <p className="text-gray-400 text-sm truncate">
                              {user.email || "بدون بريد"}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3 text-sm text-gray-600">
                          <p>
                            الجوال:{" "}
                            <span className="font-bold">
                              {user.phone || "غير مسجل"}
                            </span>
                          </p>

                          <p>
                            تاريخ التسجيل:{" "}
                            <span className="font-bold">
                              {dateText(user.created_at)}
                            </span>
                          </p>

                          <div className="pt-2">
                            <label className="mb-2 block font-bold text-gray-700">
                              تعيين كلمة مرور جديدة
                            </label>

                            <input
                              type="password"
                              value={newPasswords[user.id] || ""}
                              onChange={(event) =>
                                setNewPasswords((current) => ({
                                  ...current,
                                  [user.id]: event.target.value,
                                }))
                              }
                              placeholder="8 أحرف أو أكثر"
                              className="w-full rounded-2xl border border-gray-300 p-3 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                              dir="ltr"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => changeUserPassword(user)}
                            disabled={changingPasswordId === user.id}
                            className="w-full rounded-2xl bg-teal-700 py-3 font-bold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {changingPasswordId === user.id
                              ? "جاري التغيير..."
                              : "تغيير كلمة المرور"}
                          </button>

                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {activeTab === "deals" && (
              <section className="space-y-4">
                <h2 className="text-3xl font-bold text-gray-900">
                  الصفقات
                </h2>

                {deals.length === 0 ? (
                  <div className="bg-white rounded-3xl p-8 text-center shadow-sm">
                    لا توجد صفقات
                  </div>
                ) : (
                  <div className="space-y-4">
                    {deals.map((deal, index) => (
                      <div
                        key={deal.id}
                        className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100"
                      >
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">
                              صفقة #{index + 1}
                            </h3>

                            <p className="text-gray-400 text-sm mt-1">
                              {dateText(deal.created_at)}
                            </p>
                          </div>

                          <span
                            className={`
                            px-3
                            py-1.5
                            rounded-full
                            text-xs
                            font-bold
                            ${statusStyle(deal.status)}
                            `}
                          >
                            {statusText(deal.status)}
                          </span>
                        </div>

                        <div className="bg-gray-50 rounded-2xl p-4 mb-4">
                          <p className="text-gray-500 text-sm">
                            الوصف
                          </p>

                          <p className="font-bold text-gray-900 mt-1">
                            {deal.description || "بدون وصف"}
                          </p>
                        </div>

                        <div className="grid grid-cols-3 gap-3 text-center mb-4">
                          <div className="bg-gray-50 rounded-2xl p-3">
                            <p className="text-gray-400 text-xs">
                              المبلغ
                            </p>

                            <p className="font-bold text-gray-900">
                              {money(deal.amount)}
                            </p>
                          </div>

                          <div className="bg-gray-50 rounded-2xl p-3">
                            <p className="text-gray-400 text-xs">
                              العمولة
                            </p>

                            <p className="font-bold text-teal-700">
                              {money(deal.commission)}
                            </p>
                          </div>

                          <div className="bg-gray-50 rounded-2xl p-3">
                            <p className="text-gray-400 text-xs">
                              للبائع
                            </p>

                            <p className="font-bold text-green-700">
                              {money(deal.seller_amount)}
                            </p>
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-2xl p-4 mb-4">
                          <p className="text-gray-400 text-sm">
                            البائع
                          </p>

                          <p className="font-bold text-gray-900">
                            {getUserName(deal.seller_id)}
                          </p>

                          <p className="text-gray-400 text-sm mt-3">
                            المشتري
                          </p>

                          <p className="font-bold text-gray-900">
                            {getUserName(deal.buyer_id)}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() =>
                              updateDealStatus(deal, "completed")
                            }
                            disabled={
                              updatingDealId === deal.id ||
                              deal.status === "completed" ||
                              deal.status === "cancelled"
                            }
                            className="
                            bg-green-600
                            disabled:bg-gray-300
                            disabled:text-gray-500
                            text-white
                            py-3
                            rounded-2xl
                            font-bold
                            "
                          >
                            {updatingDealId === deal.id
                              ? "جاري..."
                              : "إنهاء الصفقة"}
                          </button>

                          <button
                            onClick={() =>
                              updateDealStatus(deal, "cancelled")
                            }
                            disabled={
                              updatingDealId === deal.id ||
                              deal.status === "completed" ||
                              deal.status === "cancelled"
                            }
                            className="
                            bg-red-600
                            disabled:bg-gray-300
                            disabled:text-gray-500
                            text-white
                            py-3
                            rounded-2xl
                            font-bold
                            "
                          >
                            إلغاء الصفقة
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {activeTab === "reports" && (
              <section className="space-y-4">
                <h2 className="text-3xl font-bold text-gray-900">
                  البلاغات
                </h2>

                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center">
                  <div className="text-6xl mb-5">📝</div>

                  <h3 className="text-2xl font-bold text-gray-900">
                    صفحة البلاغات والدعم
                  </h3>

                  <p className="text-gray-500 mt-3">
                    افتح صفحة البلاغات لمتابعة رسائل المستخدمين.
                  </p>

                  <Link
                    href="/admin/support"
                    className="
                    inline-block
                    mt-6
                    bg-teal-700
                    text-white
                    px-8
                    py-4
                    rounded-2xl
                    font-bold
                    "
                  >
                    فتح البلاغات
                  </Link>
                </div>
              </section>
            )}

            {activeTab === "transfers" && (
              <section className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">
                      التحويل
                    </h2>

                    <p className="text-gray-500 mt-2">
                      هنا تظهر المبالغ التي طلب المستخدمون سحبها إلى حساباتهم البنكية.
                    </p>
                  </div>

                  <button
                    onClick={loadData}
                    className="bg-gray-900 text-white px-6 py-3 rounded-2xl font-bold"
                  >
                    تحديث
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                    <p className="text-gray-500 font-bold">
                      طلبات قيد التحويل
                    </p>

                    <h3 className="text-3xl font-bold text-orange-600 mt-2">
                      {pendingTransferWallets.length}
                    </h3>
                  </div>

                  <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                    <p className="text-gray-500 font-bold">
                      إجمالي قيد التحويل
                    </p>

                    <h3 className="text-3xl font-bold text-gray-900 mt-2">
                      {money(stats.transferAmount)} ر.س
                    </h3>
                  </div>

                  <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                    <p className="text-gray-500 font-bold">
                      إجمالي ما تم تحويله
                    </p>

                    <h3 className="text-3xl font-bold text-green-700 mt-2">
                      {money(stats.transferred)} ر.س
                    </h3>
                  </div>
                </div>

                {walletsWithBankData.length === 0 ? (
                  <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-gray-100">
                    <div className="text-6xl mb-5">🏦</div>

                    <h3 className="text-2xl font-bold text-gray-900">
                      لا توجد بيانات تحويل
                    </h3>

                    <p className="text-gray-500 mt-3">
                      عندما يضيف المستخدم بياناته البنكية ستظهر هنا.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {walletsWithBankData.map((wallet) => {
                      const available = Number(
                        wallet.pending_transfer_balance || 0
                      );

                      return (
                        <div
                          key={wallet.user_id}
                          className="
                          bg-white
                          rounded-3xl
                          p-5
                          shadow-sm
                          border
                          border-gray-100
                          "
                        >
                          <div className="flex items-start justify-between gap-3 mb-5">
                            <div>
                              <p className="text-gray-400 text-sm">
                                المستخدم
                              </p>

                              <h3 className="text-xl font-bold text-gray-900">
                                {getUserName(wallet.user_id)}
                              </h3>
                            </div>

                            <span
                              className={`
                              px-3
                              py-1.5
                              rounded-full
                              text-xs
                              font-bold
                              ${
                                available > 0
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-gray-100 text-gray-600"
                              }
                              `}
                            >
                              {available > 0
                                ? "قيد التحويل"
                                : "لا يوجد طلب سحب"}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                            <div className="bg-gray-50 rounded-2xl p-4">
                              <p className="text-gray-400 text-sm">
                                اسم صاحب الحساب
                              </p>

                              <p className="font-bold text-gray-900 mt-1">
                                {wallet.owner_name || "غير مسجل"}
                              </p>
                            </div>

                            <div className="bg-gray-50 rounded-2xl p-4">
                              <p className="text-gray-400 text-sm">
                                البنك
                              </p>

                              <p className="font-bold text-gray-900 mt-1">
                                {wallet.bank_name || "غير مسجل"}
                              </p>
                            </div>

                            <div className="bg-gray-50 rounded-2xl p-4">
                              <p className="text-gray-400 text-sm">
                                الآيبان
                              </p>

                              <p
                                dir="ltr"
                                className="font-bold text-gray-900 mt-1 break-all text-left"
                              >
                                {wallet.iban || "غير مسجل"}
                              </p>
                            </div>

                            <div className="bg-gray-50 rounded-2xl p-4">
                              <p className="text-gray-400 text-sm">
                                رقم الحساب
                              </p>

                              <p
                                dir="ltr"
                                className="font-bold text-gray-900 mt-1 break-all text-left"
                              >
                                {wallet.account_number || "غير مسجل"}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-3 text-center mb-4">
                            <div className="bg-orange-50 rounded-2xl p-3">
                              <p className="text-gray-500 text-xs">
                                قيد التحويل
                              </p>

                              <p className="font-bold text-orange-700 mt-1">
                                {money(wallet.pending_transfer_balance)} ر.س
                              </p>
                            </div>

                            <div className="bg-green-50 rounded-2xl p-3">
                              <p className="text-gray-500 text-xs">
                                متاح
                              </p>

                              <p className="font-bold text-green-700 mt-1">
                                {money(wallet.balance)} ر.س
                              </p>
                            </div>

                            <div className="bg-gray-50 rounded-2xl p-3">
                              <p className="text-gray-500 text-xs">
                                تم تحويله
                              </p>

                              <p className="font-bold text-gray-900 mt-1">
                                {money(wallet.transferred_balance)} ر.س
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => markAsTransferred(wallet)}
                            disabled={
                              available <= 0 ||
                              transferringId === wallet.user_id
                            }
                            className="
                            w-full
                            bg-teal-700
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
                            {transferringId === wallet.user_id
                              ? "جاري التسجيل..."
                              : "تم التحويل"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="bg-yellow-50 border border-yellow-200 rounded-3xl p-5">
                  <h3 className="font-bold text-yellow-800 text-lg">
                    تنبيه مهم
                  </h3>

                  <p className="text-yellow-700 mt-2 leading-7">
                    زر "تم التحويل" لا يحول الفلوس تلقائيًا من البنك. أنت تحول المبلغ من تطبيق البنك،
                    وبعدها تضغط الزر حتى ينتقل المبلغ من قيد التحويل إلى تم تحويله.
                  </p>
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}