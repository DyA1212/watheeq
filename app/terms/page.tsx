"use client";

import { useRouter } from "next/navigation";


export default function TermsPage(){

  const router = useRouter();


  return (

    <main className="
    min-h-screen
    bg-gray-100
    p-4
    pb-10
    ">


      <div className="
      max-w-3xl
      mx-auto
      ">


        {/* العنوان */}

        <div className="
        bg-teal-700
        text-white
        rounded-3xl
        p-6
        mb-5
        shadow
        ">


          <button

          onClick={()=>router.back()}

          className="
          bg-white/20
          rounded-full
          px-4
          py-2
          text-sm
          mb-5
          "

          >
            ← رجوع
          </button>



          <h1 className="
          text-3xl
          font-bold
          ">
            الشروط والأحكام
          </h1>


          <p className="
          text-teal-100
          mt-2
          ">
            تعرف على شروط استخدام منصة وثيق
          </p>


        </div>






        <div className="
        bg-white
        rounded-3xl
        shadow
        p-5
        space-y-5
        ">



          <section className="
          bg-gray-50
          rounded-2xl
          p-5
          ">

            <h2 className="font-bold text-lg mb-2">
              📌 استخدام المنصة
            </h2>

            <p className="text-gray-600 leading-8">

              باستخدامك منصة وثيق فإنك توافق على الالتزام
              بهذه الشروط والأحكام، واستخدام المنصة بطريقة
              نظامية وآمنة.

            </p>

          </section>







          <section className="
          bg-gray-50
          rounded-2xl
          p-5
          ">

            <h2 className="font-bold text-lg mb-2">
              👤 مسؤولية المستخدم
            </h2>

            <p className="text-gray-600 leading-8">

              المستخدم مسؤول عن صحة البيانات والمعلومات
              التي يقدمها وعن جميع العمليات التي يقوم بها
              داخل المنصة.

            </p>

          </section>







          <section className="
          bg-gray-50
          rounded-2xl
          p-5
          ">


            <h2 className="font-bold text-lg mb-2">
              💳 الرسوم والعمولة
            </h2>


            <p className="text-gray-600 leading-8">

              يتم تطبيق رسوم الخدمة حسب النسبة الموضحة
              داخل المنصة قبل تحويل المبالغ للمستفيد.

            </p>


          </section>







          <section className="
          bg-gray-50
          rounded-2xl
          p-5
          ">


            <h2 className="font-bold text-lg mb-2">
              🔒 إيقاف الحساب
            </h2>


            <p className="text-gray-600 leading-8">

              يحق لمنصة وثيق إيقاف الحسابات التي تستخدم
              الخدمة بشكل مخالف أو تقدم معلومات غير صحيحة.

            </p>


          </section>




        </div>



      </div>


    </main>

  );

}