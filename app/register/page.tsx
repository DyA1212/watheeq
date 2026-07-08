"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {

  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");



  function register() {


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




    // منع العربي والرموز الغريبة في الإيميل

    const emailCheck =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;


    if (!emailCheck.test(cleanEmail)) {

      alert("اكتب إيميل صحيح مثال: name@gmail.com");
      return;

    }





    // رقم سعودي فقط

    const phoneCheck =
      /^05[0-9]{8}$/;


    if (!phoneCheck.test(cleanPhone)) {

      alert("رقم الجوال غير صحيح مثال: 0512345678");
      return;

    }





    if (password.length < 8) {

      alert("كلمة المرور لازم تكون 8 أحرف أو أكثر");
      return;

    }





    const oldUser = localStorage.getItem("user");


    if (oldUser) {

      const old = JSON.parse(oldUser);


      if (old.email === cleanEmail) {

        alert("الإيميل مستخدم مسبقاً");
        return;

      }

    }




    const user = {

      id: Date.now().toString(),

      name: cleanName,

      email: cleanEmail,

      phone: cleanPhone,

      password: password,

    };




    localStorage.setItem(
      "user",
      JSON.stringify(user)
    );


    localStorage.setItem(
      "email",
      user.email
    );


    localStorage.setItem(
      "name",
      user.name
    );


    localStorage.setItem(
      "phone",
      user.phone
    );


    localStorage.setItem(
      "role",
      "user"
    );


    localStorage.setItem(
      "user_id",
      user.id
    );



    alert("تم إنشاء الحساب بنجاح ✅");


    router.push("/deal");

  }





  return (

    <main className="min-h-screen flex items-center justify-center bg-gray-100">


      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">


        <h1 className="text-3xl font-bold text-center mb-6">
          إنشاء حساب
        </h1>



        <input
          type="text"
          placeholder="الاسم الكامل"
          value={name}
          onChange={(e)=>setName(e.target.value)}
          className="w-full border rounded-lg p-3 mb-4"
        />



        <input
          type="text"
          placeholder="الإيميل مثال name@gmail.com"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          className="w-full border rounded-lg p-3 mb-4"
          dir="ltr"
        />



        <input
          type="text"
          placeholder="رقم الجوال 05xxxxxxxx"
          value={phone}
          onChange={(e)=>setPhone(e.target.value)}
          className="w-full border rounded-lg p-3 mb-4"
          dir="ltr"
        />



        <input
          type="password"
          placeholder="كلمة المرور"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          className="w-full border rounded-lg p-3 mb-6"
          dir="ltr"
        />



        <button
          onClick={register}
          className="w-full bg-teal-700 hover:bg-teal-800 text-white py-3 rounded-lg font-bold"
        >
          إنشاء حساب
        </button>


      </div>


    </main>

  );

}