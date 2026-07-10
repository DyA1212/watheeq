"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";


export default function ProfilePage() {

  const router = useRouter();

  const [name, setName] = useState("مستخدم");
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);



  useEffect(() => {

    const savedName = sessionStorage.getItem("name");
    const savedPhone = sessionStorage.getItem("phone");
    const savedImage = sessionStorage.getItem("profile_image");

    const role = sessionStorage.getItem("role");
    const email = sessionStorage.getItem("email");



    if(savedName) setName(savedName);

    if(savedPhone) setPhone(savedPhone);

    if(savedImage) setImage(savedImage);



    if(role === "admin" || email === "deaabd89@gmail.com") {
      setIsAdmin(true);
    }


  }, []);





  function saveData(){

    sessionStorage.setItem("name", name);

    sessionStorage.setItem("phone", phone);


    if(image){

      sessionStorage.setItem(
        "profile_image",
        image
      );

    }


    alert("تم حفظ البيانات");

  }






  function deleteAccount(){

    const confirmDelete = window.confirm(
      "هل أنت متأكد من حذف الحساب؟"
    );


    if(confirmDelete){

      sessionStorage.removeItem("name");
      sessionStorage.removeItem("phone");
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("email");
      sessionStorage.removeItem("role");
      sessionStorage.removeItem("profile_image");


      alert("تم حذف الحساب بنجاح");

      router.push("/signup");

    }

  }






  return (

    <main className="
    min-h-screen
    bg-gray-100
    p-4
    pb-28
    ">


      <div className="
      max-w-2xl
      mx-auto
      bg-white
      rounded-3xl
      shadow-xl
      p-6
      ">


        <h1 className="
        text-2xl
        font-bold
        mb-6
        text-center
        ">
          حسابي
        </h1>





        {/* الصورة */}

        <div className="
        flex
        flex-col
        items-center
        mb-7
        ">


          <label className="cursor-pointer">


            <div className="
            w-32
            h-32
            rounded-full
            bg-gray-200
            overflow-hidden
            shadow
            border-4
            border-white
            ">


              {image ? (

                <img
                src={image}
                alt="الصورة الشخصية"
                className="
                w-full
                h-full
                object-cover
                "
                />

              ) : (

                <div className="
                flex
                items-center
                justify-center
                h-full
                text-5xl
                ">
                  👤
                </div>

              )}


            </div>




            <input

            type="file"

            accept="image/*"

            className="hidden"

            onChange={(e)=>{


              const file = e.target.files?.[0];


              if(file){


                const reader = new FileReader();


                reader.onload = ()=>{


                  const imageBase64 =
                  reader.result as string;


                  setImage(imageBase64);


                  sessionStorage.setItem(
                    "profile_image",
                    imageBase64
                  );


                };


                reader.readAsDataURL(file);


              }


            }}

            />


          </label>



          <p className="
          text-sm
          text-gray-500
          mt-3
          ">
            اضغط على الصورة لتغييرها
          </p>



        </div>







        <label className="block mb-2 font-bold">
          الاسم
        </label>


        <input

        value={name}

        onChange={(e)=>setName(e.target.value)}

        className="
        w-full
        border
        rounded-xl
        p-3
        mb-5
        "

        />







        <label className="block mb-2 font-bold">
          رقم الجوال
        </label>


        <input

        value={phone}

        onChange={(e)=>setPhone(e.target.value)}

        placeholder="05xxxxxxxx"

        className="
        w-full
        border
        rounded-xl
        p-3
        mb-6
        "

        />







        <button

        onClick={saveData}

        className="
        w-full
        bg-teal-700
        text-white
        py-3
        rounded-xl
        font-bold
        mb-6
        "

        >

          حفظ التعديلات

        </button>







        <div className="space-y-3 text-center">



          <button
          onClick={()=>router.push("/terms")}
          className="text-blue-600 block w-full"
          >
            الشروط والأحكام
          </button>



          <button
          onClick={()=>router.push("/privacy")}
          className="text-blue-600 block w-full"
          >
            سياسة الخصوصية
          </button>



          <button
          onClick={()=>router.push("/support")}
          className="text-blue-600 block w-full"
          >
            الدعم الفني
          </button>





          {isAdmin && (

            <button

            onClick={()=>router.push("/admin")}

            className="
            w-full
            bg-purple-600
            text-white
            py-3
            rounded-xl
            font-bold
            "

            >
              🛡️ لوحة الإدارة
            </button>

          )}






          <button

          onClick={deleteAccount}

          className="
          text-red-600
          block
          w-full
          font-bold
          "

          >
            حذف الحساب
          </button>



        </div>


      </div>


    </main>

  );


}
