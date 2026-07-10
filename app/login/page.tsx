"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function login() {
    setError("");

    const userEmail = email.trim().toLowerCase();

    if (!userEmail || !password) {
      setError("يرجى إدخال البريد الإلكتروني وكلمة المرور");
      return;
    }

    const emailRegex =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(userEmail)) {
      setError("البريد الإلكتروني غير صحيح");
      return;
    }

    if (password.length < 8) {
      setError("كلمة المرور غير صحيحة");
      return;
    }


    // تنظيف الحساب القديم قبل تسجيل دخول جديد
    sessionStorage.clear();



    // حساب المدير
    if (
      userEmail === "deaabd89@gmail.com" &&
      password === "dea2008dd"
    ) {

      sessionStorage.setItem("email", userEmail);
      sessionStorage.setItem("name", "مدير النظام");
      sessionStorage.setItem("role", "admin");
      sessionStorage.setItem("user_id", "admin");

      router.push("/deal");
      return;
    }



    // تسجيل دخول المستخدم
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("email", userEmail)
      .eq("password", password)
      .maybeSingle();



    if (userError || !user) {
      setError("الحساب غير موجود أو كلمة المرور غير صحيحة.");
      return;
    }



    sessionStorage.setItem("email", user.email);
    sessionStorage.setItem("name", user.name || "");
    sessionStorage.setItem("phone", user.phone || "");
    sessionStorage.setItem("role", "user");
    sessionStorage.setItem("user_id", user.id);



    router.push("/deal");
  }



  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-gray-100 flex items-center justify-center px-4 py-8">

      <div className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-gray-200">


        <div className="mb-8 text-center">

          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-teal-700 text-3xl font-bold text-white shadow-lg">
            و
          </div>


          <h1 className="text-3xl font-bold text-gray-900">
            تسجيل الدخول
          </h1>


          <p className="mt-2 text-sm text-gray-500">
            أهلاً بك في منصة وثيق
          </p>

        </div>



        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="البريد الإلكتروني"
          value={email}
          onChange={(e) =>
            setEmail(
              e.target.value
                .replace(/[^a-zA-Z0-9@._+-]/g, "")
                .toLowerCase()
            )
          }
          className="mb-4 w-full rounded-xl border border-gray-300 p-4 text-base text-gray-900 placeholder:text-gray-500 transition focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-200"
          dir="ltr"
        />



        <input
          type="password"
          placeholder="كلمة المرور"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value.replace(/\s/g, ""))
          }
          className="mb-2 w-full rounded-xl border border-gray-300 p-4 text-base text-gray-900 placeholder:text-gray-500 transition focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-200"
          dir="ltr"
        />



        <div className="mb-5 text-left">

          <button
            type="button"
            className="text-sm text-teal-700 hover:underline"
          >
            نسيت كلمة المرور؟
          </button>

        </div>




        <button
          onClick={login}
          className="w-full rounded-xl bg-teal-700 py-4 text-base font-semibold text-white transition hover:bg-teal-800 active:scale-[0.98]"
        >
          تسجيل الدخول
        </button>



        {error && (
          <p className="mt-4 text-center text-sm text-red-600">
            {error}
          </p>
        )}




        <div className="mt-8 text-center">

          <p className="text-sm text-gray-600">
            ليس لديك حساب؟
          </p>


          <button
            onClick={() => router.push("/register")}
            className="mt-3 w-full rounded-xl border-2 border-teal-700 py-3 font-semibold text-teal-700 transition hover:bg-teal-700 hover:text-white"
          >
            إنشاء حساب جديد
          </button>


        </div>


      </div>

    </div>
  );
}
