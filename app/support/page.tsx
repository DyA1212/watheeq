"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SupportPage() {

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [closed, setClosed] = useState(false);
  const [rating, setRating] = useState(0);



  useEffect(() => {
    checkChat();
  }, []);




  async function checkChat() {

    const userId = localStorage.getItem("user_id");

    if (!userId) return;



    const { data, error } = await supabase
      .from("support_messages")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", {
        ascending: false
      });



    if(error){
      console.log(error);
      return;
    }



    if(data && data.length > 0){


      if(data[0].chat_status === "closed"){

        setClosed(true);
        setMessages([]);
        setLoading(false);
        return;

      }


    }



    setMessages(
      data?.reverse() || []
    );

    setLoading(false);

  }







  async function sendMessage(){


    if(!message.trim()){

      alert("اكتب الرسالة");
      return;

    }



    const userId = localStorage.getItem("user_id");


    if(!userId){

      alert("يجب تسجيل الدخول");
      return;

    }




    // تأكد أن المحادثة ليست مغلقة

    const { data:last } = await supabase
      .from("support_messages")
      .select("chat_status")
      .eq("user_id",userId)
      .order("created_at",{
        ascending:false
      })
      .limit(1)
      .single();



    if(last?.chat_status === "closed"){

      alert("المحادثة مغلقة، افتح محادثة جديدة");
      setClosed(true);
      return;

    }





    const {error} = await supabase
      .from("support_messages")
      .insert([

        {
          user_id:userId,
          sender:"user",
          message:message,
          chat_status:"open"
        }

      ]);




    if(error){

      alert(error.message);
      return;

    }



    setMessage("");

    checkChat();


  }








  async function closeChat(){


    if(rating === 0){

      alert("اختر تقييم قبل إنهاء المحادثة");
      return;

    }



    const userId = localStorage.getItem("user_id");


    const {error} = await supabase
      .from("support_messages")
      .update({

        chat_status:"closed",
        rating:rating

      })
      .eq(
        "user_id",
        userId
      );



    if(error){

      alert(error.message);
      return;

    }



    setClosed(true);
    setMessages([]);

  }








  async function newChat(){


    const userId = localStorage.getItem("user_id");



    if(!userId) return;




    await supabase
      .from("support_messages")
      .insert([

        {
          user_id:userId,
          sender:"user",
          message:"بدأت محادثة جديدة",
          chat_status:"open"
        }

      ]);



    setClosed(false);
    setMessages([]);
    setRating(0);


    checkChat();


  }








  if(closed){


    return (

      <main className="min-h-screen bg-gray-100 flex items-center justify-center p-6">


        <div className="bg-white rounded-3xl shadow p-8 text-center max-w-md">


          <h1 className="text-3xl font-bold text-teal-700 mb-4">
            انتهت المحادثة
          </h1>



          <p className="text-gray-600 mb-5">
            قيّم تجربتك مع الدعم الفني
          </p>




          <div className="flex justify-center gap-2 text-4xl mb-6">


            {[1,2,3,4,5].map((star)=>(

              <button
                key={star}
                onClick={()=>setRating(star)}
              >

                {star <= rating ? "⭐":"☆"}

              </button>

            ))}


          </div>





          <button
            onClick={newChat}
            className="w-full bg-teal-700 text-white py-3 rounded-xl mb-3"
          >
            فتح محادثة جديدة
          </button>





          <button
            onClick={()=>window.location.href="/deal"}
            className="w-full bg-gray-700 text-white py-3 rounded-xl"
          >
            انتهاء
          </button>



        </div>


      </main>

    );

  }








  return (

    <main className="min-h-screen bg-gray-100 p-6">


      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow p-6">



        <h1 className="text-3xl font-bold text-teal-700 mb-2">
          💬 الدعم الفني
        </h1>



        <p className="text-gray-500 mb-6">
          وقت انتظار الرد عادة أقل من 10 دقائق
        </p>





        <div className="h-96 overflow-y-auto bg-gray-100 rounded-xl p-4 mb-4">


          {loading ? (

            <p>
              جاري التحميل...
            </p>


          ) : messages.length === 0 ? (

            <p className="text-center text-gray-500">
              ابدأ المحادثة
            </p>


          ) : (


            messages.map((msg)=>(

              <div
                key={msg.id}
                className={
                  msg.sender==="user"
                  ?
                  "text-right mb-3"
                  :
                  "text-left mb-3"
                }
              >

                <span
                  className={
                    msg.sender==="user"
                    ?
                    "inline-block bg-teal-700 text-white p-3 rounded-xl"
                    :
                    "inline-block bg-gray-200 p-3 rounded-xl"
                  }
                >

                  {msg.message}

                </span>


              </div>


            ))

          )}


        </div>






        <textarea

          value={message}

          onChange={(e)=>setMessage(e.target.value)}

          placeholder="اكتب رسالتك..."

          className="w-full border rounded-xl p-3 h-28 mb-3"

        />





        <button

          onClick={sendMessage}

          className="w-full bg-teal-700 text-white py-3 rounded-xl mb-4 font-bold"

        >

          إرسال

        </button>







        <p className="text-center text-gray-500 mb-2">
          اختر تقييمك قبل الإنهاء
        </p>





        <div className="flex justify-center text-3xl mb-3">


          {[1,2,3,4,5].map((star)=>(

            <button
              key={star}
              onClick={()=>setRating(star)}
            >

              {star <= rating ? "⭐":"☆"}

            </button>

          ))}


        </div>






        <button

          onClick={closeChat}

          className="w-full bg-red-600 text-white py-3 rounded-xl font-bold"

        >

          إنهاء المحادثة

        </button>



      </div>


    </main>

  );

}