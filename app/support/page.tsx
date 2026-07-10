"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function SupportPage() {

  const router = useRouter();

  const [started, setStarted] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [thankYou, setThankYou] = useState(false);
  const [rating, setRating] = useState(0);


  const userId =
    typeof window !== "undefined"
      ? sessionStorage.getItem("user_id")
      : null;


  const userName =
    typeof window !== "undefined"
      ? sessionStorage.getItem("name")
      : "مستخدم";



  async function loadMessages(){

    if(!userId) return;


    const { data,error } = await supabase
      .from("support_messages")
      .select("*")
      .eq("user_id", userId)
      .eq("closed", false)
      .order("created_at",{ascending:true});


    if(!error){

      setMessages(data || []);

    }

  }




  async function startChat(){

    if(!userId) return;


    await supabase
      .from("support_messages")
      .delete()
      .eq("user_id",userId);



    const { error } = await supabase
      .from("support_messages")
      .insert({

        user_id:userId,

        user_name:userName,

        sender:"user",

        message:
        "مرحباً 👋 تم فتح محادثة الدعم. سيتم الرد عليك خلال 24 ساعة.",

        closed:false,

        chat_status:"open"

      });



    if(error){

      console.log(error);
      return;

    }



    setMessages([]);

    setStarted(true);

    loadMessages();

  }





  async function sendMessage(){

    if(!message.trim()) return;


    await supabase
      .from("support_messages")
      .insert({

        user_id:userId,

        user_name:userName,

        sender:"user",

        message:message,

        closed:false,

        chat_status:"open"

      });


    setMessage("");

    loadMessages();

  }




  async function closeChat(){


    await supabase
      .from("support_messages")
      .delete()
      .eq("user_id",userId);



    setMessages([]);

    setStarted(false);

    setShowConfirm(false);

    setShowRating(true);

  }
    async function sendRating(){

    if(rating === 0){

      alert("اختر التقييم ⭐");
      return;

    }


    setThankYou(true);



    setTimeout(()=>{

      router.push("/deal");

    },2000);


  }





  useEffect(()=>{

    // لا يفتح الشات تلقائي
    setStarted(false);

  },[]);





  return (

    <main className="min-h-screen bg-gray-100 p-6">


      <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-lg p-6">


        <h1 className="text-3xl font-bold text-center mb-8">
          🎧 الدعم الفني
        </h1>



        {!started && !showRating && !thankYou && (

          <div className="space-y-4">


            <button

              onClick={startChat}

              className="w-full bg-teal-700 hover:bg-teal-800 text-white p-4 rounded-2xl font-bold"

            >
              💬 التواصل مع الدعم الفني
            </button>



            <button

              onClick={()=>router.push("/support/ticket")}

              className="w-full border-2 border-gray-300 p-4 rounded-2xl font-bold hover:bg-gray-100"

            >
              🎫 ترك تذكرة
            </button>



          </div>

        )}






        {started && !showRating && (

          <>


            <div className="bg-gray-100 rounded-2xl p-4 h-96 overflow-y-auto mb-4">


              {messages.map((m)=>(


                <div

                  key={m.id}

                  className={`flex mb-3 ${
                    m.sender === "user"
                    ? "justify-end"
                    : "justify-start"
                  }`}

                >


                  <div

                    className={`max-w-[75%] px-4 py-3 rounded-2xl text-white ${
                      
                      m.sender === "user"
                      ? "bg-teal-700 rounded-br-none"
                      : "bg-gray-600 rounded-bl-none"

                    }`}

                  >

                    {m.message}

                  </div>


                </div>


              ))}


            </div>





            <div className="flex gap-2">


              <input

                value={message}

                onChange={(e)=>setMessage(e.target.value)}

                placeholder="اكتب رسالتك..."

                className="flex-1 border rounded-2xl p-3 outline-none"

              />



              <button

                onClick={sendMessage}

                className="bg-teal-700 text-white px-5 rounded-2xl font-bold"

              >

                إرسال

              </button>


            </div>





            <button

              onClick={()=>setShowConfirm(true)}

              className="mt-4 text-red-600 border border-red-600 px-5 py-2 rounded-xl text-sm"

            >

              إنهاء الدردشة

            </button>



          </>

        )}






        {showConfirm && (


          <div className="fixed inset-0 bg-black/40 flex items-center justify-center">


            <div className="bg-white rounded-3xl p-6 w-80 text-center">


              <h2 className="font-bold text-xl mb-5">
                هل تريد إنهاء الدردشة؟
              </h2>



              <button

                onClick={closeChat}

                className="bg-red-600 text-white px-6 py-2 rounded-xl mx-2"

              >

                نعم

              </button>



              <button

                onClick={()=>setShowConfirm(false)}

                className="bg-gray-300 px-6 py-2 rounded-xl mx-2"

              >

                لا

              </button>


            </div>


          </div>


        )}
                {showRating && !thankYou && (

          <div className="text-center">


            <h2 className="text-2xl font-bold mb-6">
              ⭐ قيّم خدمة الدعم
            </h2>



            <div className="flex justify-center gap-3 text-4xl">


              {[1,2,3,4,5].map((x)=>(

                <button

                  key={x}

                  onClick={()=>setRating(x)}

                >

                  {x <= rating ? "⭐" : "☆"}

                </button>

              ))}


            </div>





            <button

              onClick={sendRating}

              className="mt-6 bg-teal-700 hover:bg-teal-800 text-white px-8 py-3 rounded-2xl font-bold"

            >

              إرسال التقييم

            </button>



          </div>

        )}







        {thankYou && (

          <div className="text-center">


            <h2 className="text-3xl font-bold text-teal-700 mb-4">

              شكراً على تقييمك ⭐

            </h2>


            <p className="text-gray-500">

              سيتم تحويلك للصفحة الرئيسية...

            </p>


          </div>

        )}




      </div>


    </main>


  );

}
