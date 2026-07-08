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

    // حساب الأدمن
    if (
      userEmail === "deaabd89@gmail.com" &&
      password === "dea2008dd"
    ) {
      localStorage.setItem("email", userEmail);
      localStorage.setItem("name", "مدير النظام");
      localStorage.setItem("role", "admin");
      localStorage.setItem("user_id", "admin");

      router.push("/deal");
      return;
    }

    // تسجيل دخول المستخدمين من Supabase
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

    localStorage.setItem("email", user.email);
    localStorage.setItem("name", user.name || "");
    localStorage.setItem("phone", user.phone || "");
    localStorage.setItem("role", "user");
    localStorage.setItem("user_id", user.id);

    router.push("/deal");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">

      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg">

        <h1 className="mb-6 text-center text-2xl font-bold">
          تسجيل الدخول
        </h1>

        <input
          type="text"
          placeholder="البريد الإلكتروني"
          value={email}
          onChange={(e) =>
            setEmail(
              e.target.value
                .replace(/[\u0600-\u06FF]/g, "")
                .replace(/\s/g, "")
            )
          }
          className="mb-4 w-full rounded border p-3"
          dir="ltr"
        />

        <input
          type="password"
          placeholder="كلمة المرور"
          value={password}
          onChange={(e) =>
            setPassword(
              e.target.value
                .replace(/[\u0600-\u06FF]/g, "")
                .replace(/\s/g, "")
            )
          }
          className="mb-4 w-full rounded border p-3"
          dir="ltr"
        />

        <button
          onClick={login}
          className="w-full rounded bg-teal-700 p-3 text-white hover:bg-teal-800"
        >
          تسجيل الدخول
        </button>

        {error && (
          <p className="mt-3 text-center text-sm text-red-600">
            {error}
          </p>
        )}

      </div>

    </div>
  );
}