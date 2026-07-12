"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const ADMIN_EMAIL = "deaabd89@gmail.com";

export default function ProfilePage() {
  const router = useRouter();

  const [name, setName] = useState("مستخدم");
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const savedName =
        sessionStorage.getItem("name") ||
        localStorage.getItem("name");

      const savedPhone =
        sessionStorage.getItem("phone") ||
        localStorage.getItem("phone");

      const savedImage =
        sessionStorage.getItem("profile_image") ||
        localStorage.getItem("profile_image");

      if (savedName) setName(savedName);
      if (savedPhone) setPhone(savedPhone);
      if (savedImage) setImage(savedImage);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const currentEmail = user.email?.trim().toLowerCase() || "";
      const adminAccount = currentEmail === ADMIN_EMAIL;

      setIsAdmin(adminAccount);

      sessionStorage.setItem("email", currentEmail);
      sessionStorage.setItem("user_id", user.id);
      sessionStorage.setItem("role", adminAccount ? "admin" : "user");
    }

    loadProfile();
  }, [router]);

  function saveData() {
    const cleanName = name.trim();
    const cleanPhone = phone.trim();

    if (!cleanName) {
      alert("اكتب الاسم");
      return;
    }

    if (cleanPhone && !/^05[0-9]{8}$/.test(cleanPhone)) {
      alert("رقم الجوال غير صحيح مثال: 0512345678");
      return;
    }

    sessionStorage.setItem("name", cleanName);
    sessionStorage.setItem("phone", cleanPhone);
    localStorage.setItem("name", cleanName);
    localStorage.setItem("phone", cleanPhone);

    if (image) {
      sessionStorage.setItem("profile_image", image);
      localStorage.setItem("profile_image", image);
    }

    alert("تم حفظ البيانات ✅");
  }

  async function deleteAccount() {
    const confirmDelete = window.confirm(
      "هل أنت متأكد من حذف بيانات الحساب من هذا الجهاز؟"
    );

    if (!confirmDelete) return;

    sessionStorage.clear();
    localStorage.removeItem("name");
    localStorage.removeItem("phone");
    localStorage.removeItem("email");
    localStorage.removeItem("user_id");
    localStorage.removeItem("role");
    localStorage.removeItem("profile_image");
    localStorage.removeItem("admin");
    localStorage.removeItem("isAdmin");

    await supabase.auth.signOut();

    alert("تم تسجيل الخروج وحذف البيانات المحفوظة من الجهاز");
    router.replace("/signup");
  }

  function changeProfileImage(file?: File) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("اختر صورة صحيحة");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("حجم الصورة يجب ألا يتجاوز 2 ميجابايت");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const imageBase64 = reader.result as string;
      setImage(imageBase64);
      sessionStorage.setItem("profile_image", imageBase64);
      localStorage.setItem("profile_image", imageBase64);
    };

    reader.readAsDataURL(file);
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4 pb-28" dir="rtl">
      <div className="mx-auto w-full max-w-2xl rounded-3xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">حسابي</h1>
            <p className="mt-1 text-sm text-gray-500">
              عدّل بيانات حسابك وإعداداته
            </p>
          </div>

          {isAdmin && (
            <button
              type="button"
              onClick={() => router.push("/admin")}
              className="inline-flex items-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-3 py-2 text-sm font-bold text-teal-700 transition hover:bg-teal-100"
            >
              <span>🛡️</span>
              الإدارة
            </button>
          )}
        </div>

        <div className="mb-7 flex flex-col items-center">
          <label className="cursor-pointer">
            <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-white bg-gray-200 shadow">
              {image ? (
                <img
                  src={image}
                  alt="الصورة الشخصية"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-5xl">
                  👤
                </div>
              )}
            </div>

            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) =>
                changeProfileImage(event.target.files?.[0])
              }
            />
          </label>

          <p className="mt-3 text-sm text-gray-500">
            اضغط على الصورة لتغييرها
          </p>
        </div>

        <label className="mb-2 block font-bold text-gray-700">
          الاسم
        </label>

        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="mb-5 w-full rounded-xl border border-gray-300 p-3 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
        />

        <label className="mb-2 block font-bold text-gray-700">
          رقم الجوال
        </label>

        <input
          value={phone}
          inputMode="numeric"
          maxLength={10}
          onChange={(event) =>
            setPhone(event.target.value.replace(/[^0-9]/g, ""))
          }
          placeholder="05xxxxxxxx"
          className="mb-6 w-full rounded-xl border border-gray-300 p-3 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
          dir="ltr"
        />

        <button
          type="button"
          onClick={saveData}
          className="mb-7 w-full rounded-xl bg-teal-700 py-3 font-bold text-white transition hover:bg-teal-800"
        >
          حفظ التعديلات
        </button>

        <div className="overflow-hidden rounded-2xl border border-gray-200">
          <button
            type="button"
            onClick={() => router.push("/terms")}
            className="block w-full border-b border-gray-100 px-4 py-4 text-right font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            الشروط والأحكام
          </button>

          <button
            type="button"
            onClick={() => router.push("/privacy")}
            className="block w-full border-b border-gray-100 px-4 py-4 text-right font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            سياسة الخصوصية
          </button>

          <button
            type="button"
            onClick={() => router.push("/support")}
            className="block w-full px-4 py-4 text-right font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            الدعم الفني
          </button>
        </div>

        <button
          type="button"
          onClick={deleteAccount}
          className="mt-6 block w-full rounded-xl border border-red-200 bg-red-50 py-3 font-bold text-red-600 transition hover:bg-red-100"
        >
          حذف بيانات الحساب من الجهاز
        </button>
      </div>
    </main>
  );
}