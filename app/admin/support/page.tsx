"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminSupportPage() {

  const [chats, setChats] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [reply, setReply] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [closed, setClosed] = useState(false);



  useEffect(() => {
    loadChats();
  }, []);




  async function loadChats() {


    const { data,error } = await supabase
      .from("support_messages")
      .select("*")
      .order("created_at",{ascending:false});



    if(error){
      console.log(error);
      return;
    }



    const users:any = {};



    data.forEach((msg)=>{


      if(!users[msg.user_id]){


        users[msg.user_id] = {

          user_id:msg.user_id,
          status:msg.chat_status || "open",
          last:msg

        };


      }


    });



    setChats(
      Object.values(users)
      .filter((x:any)=>x.status !== "closed")
    );


  }





  async function openChat(userId:string){


    setSelectedUser(userId);


    const {data,error}=await supabase
      .from("support_messages")
      .select("*")
      .eq("user_id",userId)
      .order("created_at",{ascending:true});



    if(error){
      console.log(error);
      return;
    }



    setMessages(data || []);



    const last = data?.[data.length-1];


    if(last?.chat_status==="closed"){

      setClosed(true);

    }else{

      setClosed(false);

    }



    const rate = data?.find(
      (x)=>x.rating
    );


    setRating(
      rate?.rating || null
    );


  }





  async function sendReply(){


    if(!reply.trim()){
      return;
    }



    if(closed){

      alert("المحادثة مغلقة");
      return;

    }




    const {error}=await supabase
      .from("support_messages")
      .insert([

        {

          user_id:selectedUser,

          sender:"admin",

          message:reply,

          chat_status:"open"

        }

      ]);




    if(error){

      alert(error.message);
      return;

    }



    setReply("");

    openChat(selectedUser);


  }







  async function closeChat(){


    if(!selectedUser){
      return;
    }




    const {error}=await supabase
      .from("support_messages")
      .update({

        chat_status:"closed"

      })
      .eq(
        "user_id",
        selectedUser
      );




    if(error){

      alert(error.message);
      return;

    }




    alert("تم إغلاق المحادثة ✅");



    setSelectedUser("");

    setMessages([]);

    loadChats();



  }







  return (

    <main className="min-h-screen bg-gray-100 p-6">


      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">


        <div className="bg-white rounded-3xl shadow p-5">


          <h1 className="text-2xl font-bold text-teal-700 mb-5">
            💬 طلبات الدعم
          </h1>



          {
            chats.length === 0 ?

            <p className="text-gray-500">
              لا توجد محادثات
            </p>

            :

            chats.map((chat)=>(


              <button

              key={chat.user_id}

              onClick={()=>openChat(chat.user_id)}

              className="w-full text-right border rounded-xl p-4 mb-3 hover:bg-gray-100"

              >


              <p>
                المستخدم
              </p>

              <p className="text-sm text-gray-500">
                {chat.user_id}
              </p>


              </button>


            ))

          }


        </div>







        <div className="md:col-span-2 bg-white rounded-3xl shadow p-6">



        <h2 className="text-2xl font-bold mb-4">
          المحادثة
        </h2>




        {
          selectedUser ?

          <>


          <div className="h-96 overflow-y-auto bg-gray-100 rounded-xl p-4">


          {
            messages.map((msg)=>(


              <div
              key={msg.id}
              className={
                msg.sender==="admin"
                ?
                "text-left mb-3"
                :
                "text-right mb-3"
              }
              >


              <span
              className={
                msg.sender==="admin"
                ?
                "bg-gray-300 p-3 rounded-xl inline-block"
                :
                "bg-teal-700 text-white p-3 rounded-xl inline-block"
              }
              >

              {msg.message}

              </span>


              </div>


            ))
          }


          </div>





          {
            rating &&

            <p className="mt-3 text-yellow-600 font-bold">
              تقييم العميل: ⭐ {rating}/5
            </p>

          }






          {
            !closed &&

            <>

            <textarea

            value={reply}

            onChange={(e)=>setReply(e.target.value)}

            placeholder="اكتب الرد..."

            className="w-full border rounded-xl p-3 mt-4"

            />



            <button

            onClick={sendReply}

            className="w-full bg-teal-700 text-white p-3 rounded-xl mt-3"

            >

            إرسال الرد

            </button>


            <button

            onClick={closeChat}

            className="w-full bg-red-600 text-white p-3 rounded-xl mt-3"

            >

            إغلاق المحادثة

            </button>


            </>

          }



          </>


          :

          <p className="text-gray-500">
            اختر محادثة من القائمة
          </p>


        }



        </div>


      </div>


    </main>

  );

}