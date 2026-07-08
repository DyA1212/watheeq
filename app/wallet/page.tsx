"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function WalletPage() {

  const router = useRouter();

  const [name, setName] = useState("");
  const [bank, setBank] = useState("");
  const [iban, setIban] = useState("");
  const [accountNumber, setAccountNumber] = useState("");



  useEffect(() => {

    loadWallet();

  }, []);




  async function loadWallet() {

    const userId = localStorage.getItem("user_id");


    if (!userId) return;



    const { data, error } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", userId)
      .single();



    if (data && !error) {

      setName(data.owner_name);
      setBank(data.bank_name);
      setIban(data.iban);
      setAccountNumber(data.account_number);

    }

  }





  async function saveWallet() {


    const userId = localStorage.getItem("user_id");


    if (!userId) {

      alert("يجب تسجيل الدخول");
      return;

    }




    if (
      !name ||
      !bank ||
      !iban ||
      !accountNumber
    ) {

      alert("يرجى تعبئة جميع البيانات");
      return;

    }




    const { data: oldWallet } = await supabase
      .from("wallets")
      .select("id")
      .eq("user_id", userId)
      .single();




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


      result = await supabase
        .from("wallets")
        .insert([
          {
            user_id: userId,
            owner_name: name,
            bank_name: bank,
            iban: iban.toUpperCase(),
            account_number: accountNumber,
          }
        ]);

    }




    if (result.error) {

      alert(result.error.message);
      return;

    }



    alert("تم حفظ بيانات التحويل ✅");

  }






  return (

    <main className="min-h-screen bg-slate-100 p-6 flex justify-center items-center">


      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden">


        <div className="bg-teal-700 text-white p-8">

          <h1 className="text-3xl font-bold">
            المحفظة
          </h1>

          <p className="text-teal-100 mt-2">
            بيانات الحساب البنكي لاستلام الأرباح
          </p>

        </div>



        <div className="p-8">


          <input
            placeholder="اسم صاحب الحساب"
            value={name}
            onChange={(e)=>setName(e.target.value)}
            className="w-full border rounded-xl p-3 mb-4"
          />



          <input
            placeholder="اسم البنك"
            value={bank}
            onChange={(e)=>setBank(e.target.value)}
            className="w-full border rounded-xl p-3 mb-4"
          />



          <input
            placeholder="رقم الآيبان SA..."
            value={iban}
            onChange={(e)=>setIban(e.target.value.toUpperCase())}
            dir="ltr"
            className="w-full border rounded-xl p-3 mb-4"
          />



          <input
            placeholder="رقم الحساب"
            value={accountNumber}
            onChange={(e)=>setAccountNumber(e.target.value)}
            dir="ltr"
            className="w-full border rounded-xl p-3 mb-6"
          />



          <button
            onClick={saveWallet}
            className="w-full bg-teal-700 hover:bg-teal-800 text-white py-3 rounded-xl font-bold"
          >
            حفظ بيانات التحويل
          </button>




          <button
            onClick={() => router.push("/deal")}
            className="w-full mt-4 bg-gray-700 text-white py-3 rounded-xl font-bold"
          >
            العودة
          </button>


        </div>


      </div>


    </main>

  );

}