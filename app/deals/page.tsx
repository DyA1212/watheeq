"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";


export default function DealsPage() {


  const [deals,setDeals] = useState<any[]>([]);
  const [loading,setLoading] = useState(true);



  useEffect(()=>{

    loadDeals();

  },[]);




  async function loadDeals(){


    const userId = localStorage.getItem("user_id");


    if(!userId){

      setLoading(false);
      return;

    }



    const {data,error}=await supabase
    .from("deals")
    .select("*")
    .or(`seller_id.eq.${userId},buyer_id.eq.${userId}`)
    .order("created_at",{ascending:false});



    if(error){

      console.log(error);
      setLoading(false);
      return;

    }



    setDeals(data || []);
    setLoading(false);


  }






  function statusText(status:string){


    const list:any={

      pending:"بانتظار الدفع ⏳",
      paid:"مبلغ مجمد 🔒",
      delivered:"تم التسليم 📦",
      completed:"مكتملة ✅",
      cancelled:"ملغية ❌"

    };


    return list[status] || status;


  }





  function statusColor(status:string){


    if(status==="completed")
      return "bg-green-100 text-green-700";


    if(status==="cancelled")
      return "bg-red-100 text-red-700";


    if(status==="paid")
      return "bg-orange-100 text-orange-700";


    return "bg-blue-100 text-blue-700";


  }






  const activeDeals = deals.filter(
    d =>
    d.status==="pending" ||
    d.status==="paid" ||
    d.status==="delivered"
  );


  const completedDeals = deals.filter(
    d=>d.status==="completed"
  );


  const cancelledDeals = deals.filter(
    d=>d.status==="cancelled"
  );







  function DealCard({deal,index}:any){


    return (

      <div className="
      bg-white
      rounded-3xl
      shadow
      p-5
      ">



        <div className="
        flex
        justify-between
        items-center
        mb-4
        ">


          <h2 className="
          font-bold
          text-lg
          ">

            صفقة #{index+1}

          </h2>



          <span className={`
          px-3
          py-1
          rounded-full
          text-xs
          font-bold
          ${statusColor(deal.status)}
          `}>

            {statusText(deal.status)}

          </span>


        </div>





        <div className="
        text-sm
        text-gray-700
        space-y-2
        ">


          <p>
            الوصف:
            <span className="font-bold">
             {" "}{deal.description}
            </span>
          </p>



          <p>
            المبلغ:
            <span className="font-bold">
             {" "}{deal.amount} ر.س
            </span>
          </p>



          <p>
            العمولة:
            <span className="font-bold">
             {" "}{deal.commission || 0} ر.س
            </span>
          </p>



        </div>







        {deal.status==="pending" && (

          <div className="
          mt-4
          bg-gray-100
          rounded-2xl
          p-3
          ">


            <p className="text-sm mb-2">
              رابط الدفع:
            </p>


            <input

            readOnly

            value={`${window.location.origin}/deal/pay/${deal.id}`}

            className="
            w-full
            border
            rounded-xl
            p-2
            text-xs
            "

            />


          </div>

        )}






      </div>

    );


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
        mb-5
        ">


          <h1 className="text-2xl font-bold">
            صفقاتي 📋
          </h1>


          <p className="text-teal-100 text-sm mt-2">
            متابعة جميع الصفقات الخاصة بك
          </p>


        </div>







        {loading ? (

          <div className="
          bg-white
          rounded-3xl
          p-6
          text-center
          ">
            جاري التحميل...
          </div>


        ) : deals.length===0 ? (


          <div className="
          bg-white
          rounded-3xl
          p-8
          text-center
          ">


            <div className="text-5xl mb-4">
              📋
            </div>


            <h2 className="font-bold text-lg">
              لا توجد صفقات
            </h2>


          </div>


        ) : (


          <div className="space-y-6">



            {activeDeals.length>0 && (

              <section>

                <h2 className="font-bold text-lg mb-3">
                  الصفقات النشطة 🟡
                </h2>


                <div className="space-y-3">

                {activeDeals.map((d,i)=>(

                  <DealCard
                  key={d.id}
                  deal={d}
                  index={i}
                  />

                ))}

                </div>

              </section>

            )}






            {completedDeals.length>0 && (

              <section>

                <h2 className="font-bold text-lg mb-3">
                  الصفقات المكتملة ✅
                </h2>


                <div className="space-y-3">

                {completedDeals.map((d,i)=>(

                  <DealCard
                  key={d.id}
                  deal={d}
                  index={i}
                  />

                ))}

                </div>


              </section>

            )}







            {cancelledDeals.length>0 && (

              <section>

                <h2 className="font-bold text-lg mb-3">
                  الصفقات الملغية ❌
                </h2>


                <div className="space-y-3">

                {cancelledDeals.map((d,i)=>(

                  <DealCard
                  key={d.id}
                  deal={d}
                  index={i}
                  />

                ))}

                </div>


              </section>

            )}



          </div>


        )}



      </div>



    </main>

  );


}