"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Deal = {
  id: string;
  description?: string;
  seller_amount?: number | string;
  status?: string;
  created_at?: string;
};

export default function WalletPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [bank, setBank] = useState("");
  const [iban, setIban] = useState("");
  const [accountNumber, setAccountNumber] = useState("");

  const [balance, setBalance] = useState(0);
  const [frozen, setFrozen] = useState(0);
  const [pendingTransfer, setPendingTransfer] = useState(0);
  const [transferred, setTransferred] = useState(0);

  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  const [showBankForm, setShowBankForm] = useState(false);

  useEffect(() => {
    loadWallet();
  }, []);

  function money(value: number | string | null | undefined) {
    return Number(value || 0).toLocaleString("ar-SA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  function showInfo(
    type: "available" | "frozen" | "pending" | "transferred"
  ) {
    if (type === "available") {
      alert(
        "الرصيد المتاح للسحب هو المبلغ الذي وصل لك بعد اكتمال الصفقة وتأكيد المشتري للاستلام. يمكنك طلب سحبه إلى حسابك البنكي."
      );
    }

    if (type === "frozen") {
      alert(
        "الرصيد المجمد هو مبلغ الصفقة بعد دفع المشتري. يبقى محفوظًا حتى يؤكد المشتري الاستلام، وبعدها ينتقل إلى الرصيد المتاح."
      );
    }

    if (type === "pending") {
      alert(
        "قيد التحويل هو المبلغ الذي طلبت سحبه إلى حسابك البنكي. يتم مراجعته وتحويله خلال ٢٤ ساعة."
      );
    }

    if (type === "transferred") {
      alert(
        "ما تم تحويله هو مجموع المبالغ التي تم تحويلها فعليًا من وثيق إلى حسابك البنكي."
      );
    }
  }

  async function loadWallet() {
    const userId = sessionStorage.getItem("user_id");

    if (!userId) {
      router.push("/login");
      return;
    }

    const { data, error } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.log(error);
    }

    if (data) {
      setName(data.owner_name || "");
      setBank(data.bank_name || "");
      setIban(data.iban || "");
      setAccountNumber(data.account_number || "");

      setBalance(Number(data.balance || 0));
      setFrozen(Number(data.frozen_balance || 0));
      setPendingTransfer(Number(data.pending_transfer_balance || 0));
      setTransferred(Number(data.transferred_balance || 0));
    }

    const { data: dealsData } = await supabase
      .from("deals")
      .select("id,description,seller_amount,status,created_at")
      .eq("seller_id", userId)
      .in("status", ["paid", "completed"])
      .order("created_at", { ascending: false })
      .limit(5);

    setDeals(dealsData || []);
    setLoading(false);
  }

  async function saveWallet() {
    const userId = sessionStorage.getItem("user_id");

    if (!userId) {
      alert("يجب تسجيل الدخول");
      return;
    }

    if (!name || !bank || !iban || !accountNumber) {
      alert("يرجى تعبئة جميع بيانات الحساب البنكي");
      return;
    }

    setSaving(true);

    const { data: oldWallet } = await supabase
      .from("wallets")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    let result;

    if (oldWallet) {
      result = await supabase
        .from("wallets")
        .update({
          owner_name: name,
          bank_name: bank,
          iban: iban.toUpperCase(),
          account_number: accountNumber,
        })
        .eq("user_id", userId);
    } else {
      result = await supabase.from("wallets").insert([
        {
          user_id: userId,
          owner_name: name,
          bank_name: bank,
          iban: iban.toUpperCase(),
          account_number: accountNumber,
          balance: 0,
          frozen_balance: 0,
          pending_transfer_balance: 0,
          transferred_balance: 0,
        },
      ]);
    }

    setSaving(false);

    if (result.error) {
      alert(result.error.message);
      return;
    }

    alert("تم حفظ بيانات التحويل ✅");
    setShowBankForm(false);
    loadWallet();
  }

  async function withdraw() {
    const userId = sessionStorage.getItem("user_id");

    if (!userId) {
      alert("يجب تسجيل الدخول");
      return;
    }

    if (balance <= 0) {
      alert("لا يوجد رصيد متاح للسحب");
      return;
    }

    const confirmWithdraw = confirm(
      `هل تريد طلب سحب مبلغ ${money(balance)} ر.س؟`
    );

    if (!confirmWithdraw) return;

    setWithdrawing(true);

    const newPendingTransfer = Number(pendingTransfer || 0) + Number(balance);

    const { error } = await supabase
      .from("wallets")
      .update({
        balance: 0,
        pending_transfer_balance: newPendingTransfer,
      })
      .eq("user_id", userId);

    setWithdrawing(false);

    if (error) {
      alert(error.message);
      return;
    }

    setBalance(0);
    setPendingTransfer(newPendingTransfer);

    alert("تم إرسال طلب السحب ✅ سوف يتم السحب خلال ٢٤ ساعة");
  }

  return (
    <main
      dir="rtl"
      className="
      min-h-screen
      bg-slate-100
      px-4
      pt-8
      pb-32
      overflow-x-hidden
      "
    >
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
          الرصيد والمعلومات
        </h1>

        {loading ? (
          <div className="bg-white rounded-3xl p-8 text-center shadow-sm">
            <div className="text-5xl mb-4">⏳</div>

            <p className="font-bold text-gray-500">
              جاري تحميل المحفظة...
            </p>
          </div>
        ) : (
          <>
            {/* الرصيد المتاح */}
            <section
              className="
              bg-white
              rounded-3xl
              shadow-sm
              border
              border-gray-100
              p-5
              mb-5
              "
            >
              <div className="flex items-start justify-between mb-6">
                <button className="text-gray-400 text-2xl">
                  ⋮
                </button>

                <div className="text-right flex-1 px-3">
                  <p className="text-gray-500 text-lg font-medium">
                    رصيد المعاملات المنتهية المتاح للسحب
                  </p>

                  <h2 className="text-4xl font-bold text-green-600 mt-3">
                    {money(balance)} ر.س
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => showInfo("available")}
                  className="
                  w-9
                  h-9
                  rounded-full
                  bg-gray-200
                  text-gray-500
                  flex
                  items-center
                  justify-center
                  font-bold
                  active:scale-95
                  transition
                  "
                >
                  i
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={withdraw}
                  disabled={withdrawing || balance <= 0}
                  className="
                  bg-gray-400
                  disabled:bg-gray-300
                  disabled:text-gray-500
                  text-white
                  rounded-2xl
                  py-4
                  font-bold
                  text-lg
                  active:scale-[0.97]
                  transition
                  "
                >
                  {withdrawing ? "جاري الطلب..." : "سحب الرصيد"}
                </button>

                <button
                  onClick={() => setShowBankForm(!showBankForm)}
                  className="
                  bg-gray-100
                  text-blue-800
                  rounded-2xl
                  py-4
                  font-bold
                  text-lg
                  active:scale-[0.97]
                  transition
                  "
                >
                  بيانات السحب
                </button>
              </div>
            </section>

            {/* الرصيد المجمد */}
            <section
              className="
              bg-white
              rounded-3xl
              shadow-sm
              border
              border-gray-100
              p-5
              mb-5
              "
            >
              <div className="flex items-center justify-between">
                <div
                  className="
                  w-16
                  h-16
                  rounded-full
                  bg-blue-700
                  text-white
                  flex
                  items-center
                  justify-center
                  text-3xl
                  "
                >
                  🔒
                </div>

                <div className="text-right flex-1 px-4">
                  <p className="text-gray-600 text-xl font-bold">
                    رصيد المعاملات المفتوحة
                  </p>

                  <h2 className="text-3xl font-bold text-gray-900 mt-2">
                    {money(frozen)} ر.س
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => showInfo("frozen")}
                  className="
                  w-9
                  h-9
                  rounded-full
                  bg-gray-200
                  text-gray-500
                  flex
                  items-center
                  justify-center
                  font-bold
                  active:scale-95
                  transition
                  "
                >
                  i
                </button>
              </div>
            </section>

            {/* قيد التحويل + المحول */}
            <section className="grid grid-cols-2 gap-4 mb-8">
              <div
                className="
                bg-white
                rounded-3xl
                shadow-sm
                border
                border-gray-100
                p-4
                "
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="
                    w-12
                    h-12
                    rounded-full
                    bg-yellow-500
                    text-white
                    flex
                    items-center
                    justify-center
                    text-2xl
                    "
                  >
                    ↩
                  </div>

                  <button
                    type="button"
                    onClick={() => showInfo("pending")}
                    className="
                    w-8
                    h-8
                    rounded-full
                    bg-gray-200
                    text-gray-500
                    flex
                    items-center
                    justify-center
                    font-bold
                    active:scale-95
                    transition
                    "
                  >
                    i
                  </button>
                </div>

                <p className="text-gray-600 font-bold text-lg">
                  قيد التحويل
                </p>

                <h3 className="text-2xl font-bold text-gray-900 mt-1">
                  {money(pendingTransfer)} ر.س
                </h3>
              </div>

              <div
                className="
                bg-white
                rounded-3xl
                shadow-sm
                border
                border-gray-100
                p-4
                "
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="
                    w-12
                    h-12
                    rounded-full
                    bg-green-500
                    text-white
                    flex
                    items-center
                    justify-center
                    text-2xl
                    "
                  >
                    💰
                  </div>

                  <button
                    type="button"
                    onClick={() => showInfo("transferred")}
                    className="
                    w-8
                    h-8
                    rounded-full
                    bg-gray-200
                    text-gray-500
                    flex
                    items-center
                    justify-center
                    font-bold
                    active:scale-95
                    transition
                    "
                  >
                    i
                  </button>
                </div>

                <p className="text-gray-600 font-bold text-lg">
                  ما تم تحويله
                </p>

                <h3 className="text-2xl font-bold text-gray-900 mt-1">
                  {money(transferred)} ر.س
                </h3>
              </div>
            </section>

            {/* بيانات السحب */}
            {showBankForm && (
              <section
                className="
                bg-white
                rounded-3xl
                shadow-sm
                border
                border-gray-100
                p-5
                mb-8
                "
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-5">
                  بيانات الحساب البنكي
                </h2>

                <input
                  placeholder="اسم صاحب الحساب"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-2xl p-4 mb-4"
                />

                <input
                  placeholder="اسم البنك"
                  value={bank}
                  onChange={(e) => setBank(e.target.value)}
                  className="w-full rounded-2xl p-4 mb-4"
                />

                <input
                  placeholder="رقم الآيبان SA..."
                  value={iban}
                  onChange={(e) =>
                    setIban(e.target.value.toUpperCase())
                  }
                  dir="ltr"
                  className="w-full rounded-2xl p-4 mb-4"
                />

                <input
                  placeholder="رقم الحساب"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  dir="ltr"
                  className="w-full rounded-2xl p-4 mb-5"
                />

                <button
                  onClick={saveWallet}
                  disabled={saving}
                  className="
                  w-full
                  bg-teal-700
                  text-white
                  py-4
                  rounded-2xl
                  font-bold
                  text-lg
                  disabled:opacity-60
                  "
                >
                  {saving ? "جاري الحفظ..." : "حفظ بيانات الحساب"}
                </button>
              </section>
            )}

            {/* سجل العمليات */}
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-5">
                سجل العمليات
              </h2>

              {deals.length === 0 ? (
                <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-gray-100">
                  <div className="text-5xl mb-4">📄</div>

                  <h3 className="text-xl font-bold text-gray-900">
                    لا توجد عمليات حتى الآن
                  </h3>

                  <p className="text-gray-400 mt-2">
                    عند اكتمال الصفقات ستظهر العمليات هنا
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {deals.map((deal) => (
                    <div
                      key={deal.id}
                      className="
                      bg-white
                      rounded-3xl
                      shadow-sm
                      border
                      border-gray-100
                      p-5
                      "
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div
                          className={`
                          w-12
                          h-12
                          rounded-full
                          flex
                          items-center
                          justify-center
                          text-2xl
                          ${
                            deal.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }
                          `}
                        >
                          {deal.status === "completed" ? "✓" : "🔒"}
                        </div>

                        <div className="flex-1 text-right">
                          <p className="text-gray-400 text-sm">
                            {deal.status === "completed"
                              ? "معاملة منتهية"
                              : "معاملة مفتوحة"}
                          </p>

                          <h3 className="text-xl font-bold text-gray-900 mt-1">
                            {deal.description || "صفقة وثيق"}
                          </h3>

                          <p className="text-gray-400 text-sm mt-2">
                            {deal.created_at
                              ? new Date(
                                  deal.created_at
                                ).toLocaleDateString("ar-SA")
                              : "بدون تاريخ"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <span
                          className={`
                          font-bold
                          ${
                            deal.status === "completed"
                              ? "text-green-600"
                              : "text-yellow-600"
                          }
                          `}
                        >
                          {deal.status === "completed"
                            ? "انتهت المعاملة"
                            : "الرصيد مجمد"}
                        </span>

                        <span className="text-xl font-bold text-gray-900">
                          {money(deal.seller_amount)} ر.س
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}