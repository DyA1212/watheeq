"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function AdminUsersPage() {

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [newPasswords, setNewPasswords] = useState<any>({});



  async function loadUsers() {

    setLoading(true);


    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });



    if (error) {

      alert(error.message);
      setLoading(false);
      return;

    }


    setUsers(data || []);
    setLoading(false);

  }





  async function changePassword(id:string) {


    const password = newPasswords[id];


    if (!password || password.length < 8) {

      alert("كلمة المرور لازم تكون 8 أحرف أو أكثر");
      return;

    }



    const { error } = await supabase
      .from("users")
      .update({
        password: password
      })
      .eq("id", id);



    if(error){

      alert(error.message);
      return;

    }



    alert("تم تغيير كلمة المرور ✅");



    setNewPasswords({
      ...newPasswords,
      [id]:""
    });



    loadUsers();

  }






  useEffect(()=>{

    loadUsers();

  },[]);







  return (

    <main className="min-h-screen bg-gray-100 p-6">


      <div className="max-w-7xl mx-auto">



        <Link
          href="/admin"
          className="inline-block bg-teal-700 text-white px-5 py-3 rounded-xl mb-6"
        >
          ← الرجوع للوحة الإدارة
        </Link>





        <div className="bg-white rounded-2xl shadow p-6">


          <h1 className="text-3xl font-bold mb-6">
            👥 المستخدمون
          </h1>





          {loading ? (

            <p>
              جاري التحميل...
            </p>


          ) : users.length === 0 ? (

            <p>
              لا يوجد مستخدمون
            </p>


          ) : (


            <div className="overflow-x-auto">


              <table className="w-full text-center">


                <thead>

                  <tr className="border-b bg-gray-100">


                    <th className="p-3">
                      الاسم
                    </th>


                    <th>
                      الإيميل
                    </th>


                    <th>
                      الجوال
                    </th>


                    <th>
                      كلمة المرور
                    </th>


                    <th>
                      تغيير كلمة المرور
                    </th>


                  </tr>

                </thead>





                <tbody>


                {users.map((user)=>(


                  <tr
                    key={user.id}
                    className="border-b"
                  >



                    <td className="p-3 font-bold">
                      {user.name}
                    </td>




                    <td>
                      {user.email}
                    </td>




                    <td>
                      {user.phone}
                    </td>




                    <td>
                      {user.password}
                    </td>




                    <td>


                      <div className="flex justify-center gap-2">


                        <input

                          type="text"

                          placeholder="الباسورد الجديد"

                          value={
                            newPasswords[user.id] || ""
                          }


                          onChange={(e)=>

                            setNewPasswords({

                              ...newPasswords,

                              [user.id]:e.target.value

                            })

                          }


                          className="border rounded-lg p-2 w-44"

                        />



                        <button

                          onClick={() =>
                            changePassword(user.id)
                          }

                          className="bg-green-600 text-white px-4 py-2 rounded-lg"

                        >
                          حفظ
                        </button>


                      </div>


                    </td>




                  </tr>


                ))}


                </tbody>


              </table>


            </div>


          )}



        </div>


      </div>


    </main>

  );

}
