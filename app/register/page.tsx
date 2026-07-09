"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  async function register() {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    if (
      cleanName === "" ||
      cleanEmail === "" ||
      cleanPhone === "" ||
      password === ""
    ) {
      alert("عبّي جميع البيانات");
      return;
    }

    const emailCheck =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailCheck.test(cleanEmail)) {
      alert("اكتب إيميل صحيح مثال: name@gmail.com");
      return;
    }

    const phoneCheck = /^05[0-9]{8}$/;

    if (!phoneCheck.test(cleanPhone)) {
      alert("رقم الجوال غير صحيح مثال: 0512345678");
      return;
    }

    if (password.length < 8) {
      alert("كلمة المرور لازم تكون 8 أحرف أو أكثر");
      return;
    }

    const { data: oldUser, error: checkError } = await supabase
      .from("users")
      .select("id")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (checkError) {
      console.log(checkError);
    }

    if (oldUser) {
      alert("الإيميل مستخدم مسبقاً");
      return;
    }

    const { data, error } = await supabase
      .from("users")
      .insert({
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        password,
        wallet: 0,
      })
      .select()
      .single();

    if (error) {
      alert(error.message);
      return;
    }

    localStorage.setItem("email", data.email);
    localStorage.setItem("name", data.name);
    localStorage.setItem("phone", data.phone);
    localStorage.setItem("role", "user");
    localStorage.setItem("user_id", data.id);

    alert("تم إنشاء الحساب بنجاح ✅");

    router.push("/deal");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-gray-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-gray-200">

        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-teal-700 text-3xl font-bold text-white shadow-lg">
            و
          </div>

          <h1 className="text-3xl font-bold text-gray-900">
            إنشاء حساب
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            أنشئ حسابك وابدأ استخدام منصة وثيق
          </p>
        </div>

        <input
          type="text"
          placeholder="الاسم الكامل"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mb-4 w-full rounded-xl border border-gray-300 p-4 text-base focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-200"
        />

        <input
          type="email"
          placeholder="البريد الإلكتروني"
          value={email}
          onChange={(e) =>
            setEmail(
              e.target.value
                .replace(/[\u0600-\u06FF]/g, "")
                .replace(/\s/g, "")
            )
          }
          className="mb-4 w-full rounded-xl border border-gray-300 p-4 text-base focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-200"
          dir="ltr"
        />

        <input
          type="text"
          placeholder="رقم الجوال 05xxxxxxxx"
          value={phone}
          onChange={(e) =>
            setPhone(e.target.value.replace(/[^0-9]/g, ""))
          }
          className="mb-4 w-full rounded-xl border border-gray-300 p-4 text-base focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-200"
          dir="ltr"
          maxLength={10}
        />

        <input
          type="password"
          placeholder="كلمة المرور"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-6 w-full rounded-xl border border-gray-300 p-4 text-base focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-200"
          dir="ltr"
        />

        <button
          onClick={register}
          className="w-full rounded-xl bg-teal-700 py-4 text-base font-semibold text-white transition hover:bg-teal-800 active:scale-[0.98]"
        >
          إنشاء حساب
        </button>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            لديك حساب بالفعل؟
          </p>

          <button
            onClick={() => router.push("/login")}
            className="mt-3 w-full rounded-xl border-2 border-teal-700 py-3 font-semibold text-teal-700 transition hover:bg-teal-700 hover:text-white"
          >
            تسجيل الدخول
          </button>
        </div>

      </div>
    </div>
  );
}