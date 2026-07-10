"use client";

import { usePathname, useRouter } from "next/navigation";


export default function BottomNav(){

  const router = useRouter();
  const pathname = usePathname();



  return (

    <nav
    className="
    w-full
    bg-white
    rounded-t-[28px]
    px-3
    py-3
    shadow-lg
    border-t
    border-gray-100
    "
    >


      <div className="
      flex
      items-center
      justify-around
      max-w-md
      mx-auto
      ">



        {/* الرئيسية */}

        <button
        onClick={()=>router.push("/deal")}
        className="flex flex-col items-center gap-1"
        >

          <div
          className={`
          w-10
          h-10
          rounded-full
          flex
          items-center
          justify-center
          text-lg
          ${
            pathname === "/deal"
            ?
            "bg-teal-100 scale-110"
            :
            "bg-gray-100"
          }
          `}
          >

          🏠

          </div>


          <span className="text-[11px] text-gray-600">
            الرئيسية
          </span>


        </button>





        {/* صفقاتي */}

        <button
        onClick={()=>router.push("/deals")}
        className="flex flex-col items-center gap-1"
        >

          <div className="
          w-10
          h-10
          rounded-full
          bg-gray-100
          flex
          items-center
          justify-center
          text-lg
          ">

          📋

          </div>


          <span className="text-[11px] text-gray-600">
            صفقاتي
          </span>


        </button>







        {/* إنشاء صفقة */}

        <button
        onClick={()=>router.push("/deal/new")}
        className="
        -mt-7
        flex
        items-center
        justify-center
        "
        >

          <div
          className="
          w-14
          h-14
          rounded-full
          bg-teal-700
          text-white
          text-3xl
          flex
          items-center
          justify-center
          shadow-xl
          border-4
          border-gray-100
          "
          >

          +

          </div>


        </button>







        {/* المحفظة */}

        <button
        onClick={()=>router.push("/wallet")}
        className="flex flex-col items-center gap-1"
        >

          <div className="
          w-10
          h-10
          rounded-full
          bg-gray-100
          flex
          items-center
          justify-center
          text-lg
          ">

          💰

          </div>


          <span className="text-[11px] text-gray-600">
            المحفظة
          </span>


        </button>







        {/* حسابي */}

        <button
        onClick={()=>router.push("/profile")}
        className="flex flex-col items-center gap-1"
        >

          <div className="
          w-10
          h-10
          rounded-full
          bg-gray-100
          flex
          items-center
          justify-center
          text-lg
          ">

          👤

          </div>


          <span className="text-[11px] text-gray-600">
            حسابي
          </span>


        </button>



      </div>


    </nav>

  );

}