"use client";

import { useRouter } from "next/navigation";


export default function PrivacyPage(){

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



        {/* الهيدر */}

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

            سياسة الخصوصية

          </h1>




          <p className="
          text-teal-100
          mt-2
          ">

            كيف نحافظ على بياناتك داخل منصة وثيق

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


            <h2 className="
            font-bold
            text-lg
            mb-2
            ">

              🔐 حماية البيانات

            </h2>



            <p className="
            text-gray-600
            leading-8
            ">

              نهتم في منصة وثيق بحماية بيانات المستخدمين
              والحفاظ على خصوصيتهم وتوفير تجربة استخدام آمنة.

            </p>



          </section>









          <section className="
          bg-gray-50
          rounded-2xl
          p-5
          ">


            <h2 className="
            font-bold
            text-lg
            mb-2
            ">

              📋 البيانات التي نجمعها

            </h2>




            <p className="
            text-gray-600
            leading-8
            ">

              قد نقوم بجمع بيانات الحساب مثل الاسم والبريد
              الإلكتروني ورقم الجوال وبيانات التحويل البنكي
              التي يدخلها المستخدم.

            </p>



          </section>









          <section className="
          bg-gray-50
          rounded-2xl
          p-5
          ">



            <h2 className="
            font-bold
            text-lg
            mb-2
            ">

              ⚙️ استخدام البيانات

            </h2>




            <p className="
            text-gray-600
            leading-8
            ">

              تستخدم البيانات لتقديم خدمات المنصة،
              تحسين تجربة المستخدم، ومعالجة العمليات
              وإدارة الصفقات.

            </p>




          </section>









          <section className="
          bg-gray-50
          rounded-2xl
          p-5
          ">



            <h2 className="
            font-bold
            text-lg
            mb-2
            ">

              🛡️ حماية المعلومات

            </h2>




            <p className="
            text-gray-600
            leading-8
            ">

              نعمل على حماية معلومات المستخدمين وعدم
              مشاركتها مع أي جهة غير مصرح لها.

            </p>




          </section>









          <section className="
          bg-gray-50
          rounded-2xl
          p-5
          ">



            <h2 className="
            font-bold
            text-lg
            mb-2
            ">

              💬 التواصل معنا

            </h2>




            <p className="
            text-gray-600
            leading-8
            ">

              يمكن للمستخدم التواصل مع الدعم الفني عند
              وجود أي استفسار أو مشكلة.

            </p>




          </section>





        </div>



      </div>


    </main>

  );

}