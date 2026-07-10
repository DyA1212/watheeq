"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";


export default function WalletPage() {

  const router = useRouter();


  const [name,setName] = useState("");
  const [bank,setBank] = useState("");
  const [iban,setIban] = useState("");
  const [accountNumber,setAccountNumber] = useState("");


  const [balance,setBalance] = useState(0);
  const [frozen,setFrozen] = useState(0);
  const [transferred,setTransferred] = useState(0);



  useEffect(()=>{

    loadWallet();

  },[]);




  async function loadWallet(){

    const userId = sessionStorage.getItem("user_id");

    if(!userId) return;



    const {data,error} = await supabase
    .from("wallets")
    .select("*")
    .eq("user_id",userId)
    .single();



    if(data && !error){

      setName(data.owner_name || "");
      setBank(data.bank_name || "");
      setIban(data.iban || "");
      setAccountNumber(data.account_number || "");

      setBalance(data.balance || 0);
      setFrozen(data.frozen_balance || 0);
      setTransferred(data.transferred_balance || 0);

    }

  }





  async function saveWallet(){


    const userId = sessionStorage.getItem("user_id");


    if(!userId){

      alert("يجب تسجيل الدخول");
      return;

    }



    if(!name || !bank || !iban || !accountNumber){

      alert("يرجى تعبئة جميع البيانات");
      return;

    }





    const {data:oldWallet}=await supabase
    .from("wallets")
    .select("id")
    .eq("user_id",userId)
    .single();




    let result;



    if(oldWallet){


      result = await supabase
      .from("wallets")
      .update({

        owner_name:name,
        bank_name:bank,
        iban:iban.toUpperCase(),
        account_number:accountNumber

      })
      .eq("user_id",userId);



    }else{


      result = await supabase
      .from("wallets")
      .insert([{

        user_id:userId,
        owner_name:name,
        bank_name:bank,
        iban:iban.toUpperCase(),
        account_number:accountNumber,
        balance:0,
        frozen_balance:0,
        transferred_balance:0

      }]);


    }





    if(result.error){

      alert(result.error.message);
      return;

    }



    alert("تم حفظ بيانات التحويل ✅");


  }








  return (

    <main className="
    min-h-screen
    bg-gray-100
    p-4
    pb-28
    ">



      <div className="
      max-w-xl
      mx-auto
      ">





        <div className="
        bg-teal-700
        text-white
        rounded-3xl
        p-5
        shadow
        mb-5
        ">


          <h1 className="
          text-2xl
          font-bold
          ">
            المحفظة 💰
          </h1>


          <p className="
          text-teal-100
          mt-2
          text-sm
          ">
            إدارة أموالك وبيانات التحويل
          </p>


        </div>








        <div className="
        grid
        grid-cols-1
        gap-4
        mb-5
        ">





          <div className="
          bg-white
          rounded-3xl
          p-5
          shadow
          ">

            <p className="text-gray-500">
              الرصيد المتاح 💰
            </p>

            <h2 className="
            text-3xl
            font-bold
            text-teal-700
            mt-2
            ">
              {balance} ر.س
            </h2>

          </div>






          <div className="
          bg-white
          rounded-3xl
          p-5
          shadow
          ">

            <p className="text-gray-500">
              الرصيد المجمد 🔒
            </p>

            <h2 className="
            text-3xl
            font-bold
            text-orange-500
            mt-2
            ">
              {frozen} ر.س
            </h2>

          </div>






          <div className="
          bg-white
          rounded-3xl
          p-5
          shadow
          ">

            <p className="text-gray-500">
              الرصيد المحول 🔄
            </p>

            <h2 className="
            text-3xl
            font-bold
            text-blue-600
            mt-2
            ">
              {transferred} ر.س
            </h2>

          </div>



        </div>









        <div className="
        bg-white
        rounded-3xl
        shadow
        p-5
        ">



          <h2 className="
          font-bold
          text-xl
          mb-5
          ">
            بيانات التحويل البنكي
          </h2>





          <input
          placeholder="اسم صاحب الحساب"
          value={name}
          onChange={(e)=>setName(e.target.value)}
          className="
          w-full
          border
          rounded-xl
          p-3
          mb-4
          "
          />





          <input
          placeholder="اسم البنك"
          value={bank}
          onChange={(e)=>setBank(e.target.value)}
          className="
          w-full
          border
          rounded-xl
          p-3
          mb-4
          "
          />






          <input
          placeholder="رقم الآيبان SA..."
          value={iban}
          onChange={(e)=>setIban(e.target.value.toUpperCase())}
          dir="ltr"
          className="
          w-full
          border
          rounded-xl
          p-3
          mb-4
          "
          />







          <input
          placeholder="رقم الحساب"
          value={accountNumber}
          onChange={(e)=>setAccountNumber(e.target.value)}
          dir="ltr"
          className="
          w-full
          border
          rounded-xl
          p-3
          mb-5
          "
          />







          <button

          onClick={saveWallet}

          className="
          w-full
          bg-teal-700
          text-white
          py-3
          rounded-xl
          font-bold
          "
          >

            حفظ البيانات

          </button>






          <button

          onClick={()=>router.push("/withdraw")}

          className="
          w-full
          mt-4
          bg-gray-800
          text-white
          py-3
          rounded-xl
          font-bold
          "
          >

            تحويل

          </button>





        </div>





      </div>



    </main>

  );

}
