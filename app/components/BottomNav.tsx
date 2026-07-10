"use client";

import { usePathname, useRouter } from "next/navigation";


export default function BottomNav(){

  const router = useRouter();
  const pathname = usePathname();



  const items = [
    {
      name:"الرئيسية",
      icon:"🏠",
      path:"/deal"
    },
    {
      name:"صفقاتي",
      icon:"📋",
      path:"/deals"
    },
    {
      name:"المحفظة",
      icon:"💰",
      path:"/wallet"
    },
    {
      name:"حسابي",
      icon:"👤",
      path:"/profile"
    },
  ];



  return (

    <nav
    className="
    mt-8
    bg-white
    rounded-[30px]
    px-4
    py-3
    shadow-lg
    border
    border-gray-100
    mx-4
    "
    >


      <div className="flex justify-around items-center">



        {/* الرئيسية */}

        <button

        onClick={()=>router.push("/deal")}

        className="flex flex-col items-center gap-1"

        >

          <div
          className={`
          w-11
          h-11
          rounded-full
          flex
          items-center
          justify-center
          text-xl

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


          <span className="text-xs text-gray-600">
            الرئيسية
          </span>


        </button>





        {/* صفقاتي */}

        <button

        onClick={()=>router.push("/deals")}

        className="flex flex-col items-center gap-1"

        >

          <div
          className="
          w-11
          h-11
          rounded-full
          bg-gray-100
          flex
          items-center
          justify-center
          text-xl
          "
          >

          📋

          </div>


          <span className="text-xs text-gray-600">
            صفقاتي
          </span>


        </button>






        {/* زر الاضافة */}

        <button

        onClick={()=>router.push("/deal/new")}

        className="
        -mt-8
        flex
        items-center
        justify-center
        "

        >

          <div
          className="
          w-16
          h-16
          rounded-full
          bg-teal-700
          text-white
          text-4xl
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

          <div
          className="
          w-11
          h-11
          rounded-full
          bg-gray-100
          flex
          items-center
          justify-center
          text-xl
          "
          >

          💰

          </div>


          <span className="text-xs text-gray-600">
            المحفظة
          </span>


        </button>






        {/* حسابي */}

        <button

        onClick={()=>router.push("/profile")}

        className="flex flex-col items-center gap-1"

        >

          <div
          className="
          w-11
          h-11
          rounded-full
          bg-gray-100
          flex
          items-center
          justify-center
          text-xl
          "
          >

          👤

          </div>


          <span className="text-xs text-gray-600">
            حسابي
          </span>


        </button>



      </div>


    </nav>

  );

}