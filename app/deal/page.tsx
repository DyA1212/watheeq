"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";


export default function DealPage() {


  const router = useRouter();

  const [name, setName] = useState("مستخدم");



  useEffect(() => {


    const userId = sessionStorage.getItem("user_id");
    const savedName = sessionStorage.getItem("name");



    if (!userId) {

      router.push("/login");

      return;

    }



    if(savedName){

      setName(savedName);

    }


  }, [router]);




  return (


    <main className="
    w-full
    min-h-screen
    bg-gray-100
    overflow-x-hidden
    pb-6
    ">



      {/* الهيدر */}


      <section className="
      bg-teal-700
      text-white
      rounded-b-3xl
      px-5
      py-5
      shadow-md
      ">


        <div className="
        flex
        justify-between
        items-center
        gap-4
        ">



          <div>


            <h2 className="text-xl font-bold">

              وثيق

            </h2>


            <p className="text-teal-100 text-xs mt-1">

              منصة الصفقات الآمنة

            </p>


          </div>





          <div className="text-right">


            <p className="text-teal-100 text-xs">

              أهلاً بك 👋

            </p>


            <h1 className="text-lg font-bold break-all">

              {name}

            </h1>


          </div>



        </div>



      </section>







      {/* محتوى الرئيسية */}


      <section className="
      px-4
      mt-5
      ">


        <div className="
        bg-white
        rounded-3xl
        shadow-sm
        p-5
        text-center
        w-full
        max-w-sm
        mx-auto
        ">



          <div className="text-4xl mb-3">

            📋

          </div>




          <h2 className="
          text-lg
          font-bold
          text-gray-900
          ">

            لا توجد صفقات حالياً

          </h2>




          <p className="
          text-gray-500
          text-sm
          mt-2
          ">

            ابدأ أول صفقة لك مع وثيق الآن

          </p>





          <button

          onClick={()=>router.push("/deal/new")}


          className="
          mt-5
          bg-teal-700
          text-white
          w-full
          py-3
          rounded-2xl
          font-bold
          shadow
          active:scale-95
          transition
          "

          >

            إنشاء صفقة الآن


          </button>




        </div>



      </section>




    </main>


  );


}
