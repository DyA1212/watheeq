"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {

  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");



  function signup() {

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();



    if (
      !cleanName ||
      !cleanEmail ||
      !cleanPhone ||
      !password
    ) {
      alert("اكمل جميع البيانات");
      return;
    }



    const emailRegex =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;


    if (!emailRegex.test(cleanEmail)) {
      alert("اكتب بريد إلكتروني صحيح مثال: test@gmail.com");
      return;
    }



    const phoneRegex =
      /^05[0-9]{8}$/;


    if (!phoneRegex.test(cleanPhone)) {
      alert("رقم الجوال غير صحيح مثال: 0512345678");
      return;
    }



    if (password.length < 8) {
      alert("كلمة المرور يجب أن تكون 8 أحرف أو أكثر");
      return;
    }



    const user = {
      id: Date.now().toString(),
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      password,
    };



    localStorage.setItem(
      "user",
      JSON.stringify(user)
    );


    localStorage.setItem("name", user.name);
    localStorage.setItem("email", user.email);
    localStorage.setItem("phone", user.phone);
    localStorage.setItem("user_id", user.id);
    localStorage.setItem("role", "user");



    alert("تم إنشاء الحساب بنجاح ✅");


    router.push("/deal");

  }




  return (

    <div className="flex min-h-screen items-center justify-center bg-gray-100">

      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow">


        <h1 className="mb-6 text-center text-2xl font-bold">
          إنشاء حساب
        </h1>



        <input
          placeholder="الاسم"
          className="mb-3 w-full rounded border p-3"
          value={name}
          onChange={(e)=>setName(e.target.value)}
        />



        <input
          placeholder="البريد الإلكتروني"
          type="text"
          dir="ltr"
          className="mb-3 w-full rounded border p-3"
          value={email}
          onChange={(e)=>
            setEmail(
              e.target.value
              .replace(/[\u0600-\u06FF\s]/g,"")
            )
          }
        />



        <input
          placeholder="رقم الجوال 05xxxxxxxx"
          type="text"
          dir="ltr"
          className="mb-3 w-full rounded border p-3"
          value={phone}
          onChange={(e)=>
            setPhone(
              e.target.value
              .replace(/[^0-9]/g,"")
            )
          }
        />



        <input
          placeholder="كلمة المرور (8 أحرف أو أكثر)"
          type="password"
          dir="ltr"
          className="mb-3 w-full rounded border p-3"
          value={password}
          onChange={(e)=>
            setPassword(
              e.target.value
              .replace(/[\u0600-\u06FF\s]/g,"")
            )
          }
        />



        <button
          onClick={signup}
          className="w-full rounded bg-teal-700 p-3 text-white font-bold"
        >
          إنشاء الحساب
        </button>


      </div>

    </div>

  );

}