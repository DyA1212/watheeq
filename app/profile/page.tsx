"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const ADMIN_EMAIL = "deaabd89@gmail.com";

export default function ProfilePage() {
  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [name, setName] = useState("مستخدم");
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error || !user) {
          sessionStorage.clear();
          router.replace("/login");
          return;
        }

        const currentUserId = user.id;
        const currentEmail =
          user.email?.trim().toLowerCase() || "";

        setUserId(currentUserId);
        setIsAdmin(currentEmail === ADMIN_EMAIL);

        /*
          كل بيانات المستخدم محفوظة بمفتاح يحتوي user.id
          حتى لا تختلط بيانات الحسابات مع بعضها.
        */
        const savedName = localStorage.getItem(
          `name_${currentUserId}`
        );

        const savedPhone = localStorage.getItem(
          `phone_${currentUserId}`
        );

        const savedImage = localStorage.getItem(
          `profile_image_${currentUserId}`
        );

        const profileName = String(
          savedName ||
            user.user_metadata?.name ||
            "مستخدم"
        );

        const profilePhone = String(
          savedPhone ||
            user.user_metadata?.phone ||
            ""
        );

        setName(profileName);
        setPhone(profilePhone);
        setImage(savedImage || "");

        /*
          sessionStorage يحتوي بيانات الحساب المفتوح حاليًا فقط.
        */
        sessionStorage.setItem("user_id", currentUserId);
        sessionStorage.setItem("email", currentEmail);
        sessionStorage.setItem("name", profileName);
        sessionStorage.setItem("phone", profilePhone);
        sessionStorage.setItem(
          "role",
          currentEmail === ADMIN_EMAIL ? "admin" : "user"
        );

        if (savedImage) {
          sessionStorage.setItem(
            "profile_image",
            savedImage
          );
        } else {
          sessionStorage.removeItem("profile_image");
        }

        /*
          حذف المفاتيح القديمة المشتركة بين الحسابات.
        */
        localStorage.removeItem("name");
        localStorage.removeItem("phone");
        localStorage.removeItem("profile_image");
      } catch {
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  async function saveData() {
    if (!userId || saving) {
      return;
    }

    const cleanName = name.trim();
    const cleanPhone = phone.trim();

    if (!cleanName) {
      alert("اكتب الاسم");
      return;
    }

    if (
      cleanPhone &&
      !/^05[0-9]{8}$/.test(cleanPhone)
    ) {
      alert("رقم الجوال غير صحيح مثال: 0512345678");
      return;
    }

    setSaving(true);

    try {
      /*
        تحديث بيانات المستخدم داخل Supabase Auth.
        هذا يخلي الاسم والجوال مرتبطين بالحساب.
      */
      const { error } =
        await supabase.auth.updateUser({
          data: {
            name: cleanName,
            phone: cleanPhone,
          },
        });

      if (error) {
        alert("تعذر حفظ البيانات، حاول مرة ثانية");
        return;
      }

      /*
        تخزين خاص بكل مستخدم باستخدام user.id.
      */
      localStorage.setItem(
        `name_${userId}`,
        cleanName
      );

      localStorage.setItem(
        `phone_${userId}`,
        cleanPhone
      );

      if (image) {
        localStorage.setItem(
          `profile_image_${userId}`,
          image
        );
      } else {
        localStorage.removeItem(
          `profile_image_${userId}`
        );
      }

      /*
        تحديث بيانات الجلسة الحالية للعرض في باقي الصفحات.
      */
      sessionStorage.setItem("name", cleanName);
      sessionStorage.setItem("phone", cleanPhone);

      if (image) {
        sessionStorage.setItem(
          "profile_image",
          image
        );
      } else {
        sessionStorage.removeItem("profile_image");
      }

      setName(cleanName);
      setPhone(cleanPhone);

      alert("تم حفظ البيانات ✅");
    } catch {
      alert("حدث خطأ أثناء حفظ البيانات");
    } finally {
      setSaving(false);
    }
  }

  function changeProfileImage(file?: File) {
    if (!file || !userId) {
      return;
    }

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
      const imageBase64 = String(reader.result || "");

      setImage(imageBase64);

      localStorage.setItem(
        `profile_image_${userId}`,
        imageBase64
      );

      sessionStorage.setItem(
        "profile_image",
        imageBase64
      );
    };

    reader.readAsDataURL(file);
  }

  async function deleteAccountData() {
    const confirmDelete = window.confirm(
      "هل أنت متأكد من حذف بيانات الحساب من هذا الجهاز وتسجيل الخروج؟"
    );

    if (!confirmDelete) {
      return;
    }

    if (userId) {
      localStorage.removeItem(`name_${userId}`);
      localStorage.removeItem(`phone_${userId}`);
      localStorage.removeItem(
        `profile_image_${userId}`
      );
    }

    localStorage.removeItem("email");
    localStorage.removeItem("user_id");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    localStorage.removeItem("phone");
    localStorage.removeItem("profile_image");
    localStorage.removeItem("admin");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("confirmed_user");
    localStorage.removeItem(
      "watheeq_email_confirmed"
    );

    sessionStorage.clear();

    await supabase.auth.signOut();

    alert(
      "تم تسجيل الخروج وحذف البيانات المحفوظة من الجهاز"
    );

    router.replace("/signup");
  }

  async function logout() {
    const confirmed = window.confirm(
      "هل تريد تسجيل الخروج؟"
    );

    if (!confirmed) {
      return;
    }

    sessionStorage.clear();

    localStorage.removeItem("email");
    localStorage.removeItem("user_id");
    localStorage.removeItem("role");
    localStorage.removeItem("admin");
    localStorage.removeItem("isAdmin");

    await supabase.auth.signOut();

    router.replace("/login");
  }

  if (loading) {
    return (
      <main
        className="min-h-screen bg-gray-100 flex items-center justify-center p-4"
        dir="rtl"
      >
        <div className="rounded-3xl bg-white p-8 text-center shadow-lg">
          <div className="mb-4 text-4xl">⏳</div>

          <p className="font-bold text-gray-600">
            جاري تحميل الحساب...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen bg-gray-100 p-4 pb-28"
      dir="rtl"
    >
      <div className="mx-auto w-full max-w-2xl rounded-3xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              حسابي
            </h1>

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
                changeProfileImage(
                  event.target.files?.[0]
                )
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
          disabled={saving}
          onChange={(event) =>
            setName(event.target.value)
          }
          className="mb-5 w-full rounded-xl border border-gray-300 p-3 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100 disabled:bg-gray-100"
        />

        <label className="mb-2 block font-bold text-gray-700">
          رقم الجوال
        </label>

        <input
          value={phone}
          inputMode="numeric"
          maxLength={10}
          disabled={saving}
          onChange={(event) =>
            setPhone(
              event.target.value.replace(
                /[^0-9]/g,
                ""
              )
            )
          }
          placeholder="05xxxxxxxx"
          className="mb-6 w-full rounded-xl border border-gray-300 p-3 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100 disabled:bg-gray-100"
          dir="ltr"
        />

        <button
          type="button"
          onClick={saveData}
          disabled={saving}
          className="mb-7 w-full rounded-xl bg-teal-700 py-3 font-bold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving
            ? "جاري الحفظ..."
            : "حفظ التعديلات"}
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
          onClick={logout}
          className="mt-6 block w-full rounded-xl border border-gray-300 bg-gray-50 py-3 font-bold text-gray-700 transition hover:bg-gray-100"
        >
          تسجيل الخروج
        </button>

        <button
          type="button"
          onClick={deleteAccountData}
          className="mt-3 block w-full rounded-xl border border-red-200 bg-red-50 py-3 font-bold text-red-600 transition hover:bg-red-100"
        >
          حذف بيانات الحساب من الجهاز
        </button>
      </div>
    </main>
  );
}