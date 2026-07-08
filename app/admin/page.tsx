"use client";

import { useEffect, useState } from "react";
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
      console.log(error);
      setLoading(false);
      return;
    }


    setUsers(data || []);
    setLoading(false);

  }



  async function changePassword(id: string) {

    const password = newPasswords[id];


    if (!password || password.length < 8) {
      alert("كلمة المرور يجب أن تكون 8 أحرف أو أكثر");
      return;
    }



    const { error } = await supabase
      .from("users")
      .update({
        password: password
      })
      .eq("id", id);



    if (error) {

      alert(error.message);
      return;

    }



    alert("تم تغيير كلمة المرور بنجاح ✅");

    loadUsers();

  }




  useEffect(() => {
    loadUsers();
  }, []);



  return (

    <main className="min-h-screen bg-gray-100 p-8">


      <div className="bg-white rounded-xl shadow p-6">


        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          👥 المستخدمون
        </h1>



        {loading ? (

          <p>
            جاري التحميل...
          </p>


        ) : (


          <div className="overflow-x-auto">


            <table className="w-full text-center text-gray-900">


              <thead>

                <tr className="border-b">

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
                    تاريخ التسجيل
                  </th>

                  <th>
                    تعديل
                  </th>

                </tr>

              </thead>



              <tbody>


                {users.map((user)=>(


                  <tr
                    key={user.id}
                    className="border-b"
                  >


                    <td className="p-3">
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
                      {new Date(
                        user.created_at
                      ).toLocaleDateString("ar-SA")}
                    </td>


                    <td>


                      <input
                        type="text"
                        placeholder="الباسورد الجديد"
                        value={newPasswords[user.id] || ""}
                        onChange={(e)=>
                          setNewPasswords({
                            ...newPasswords,
                            [user.id]: e.target.value
                          })
                        }
                        className="border rounded p-2 w-40"
                      />


                      <button
                        onClick={() =>
                          changePassword(user.id)
                        }
                        className="bg-teal-700 text-white px-3 py-2 rounded mr-2"
                      >
                        حفظ
                      </button>


                    </td>


                  </tr>


                ))}


              </tbody>


            </table>


          </div>


        )}


      </div>


    </main>

  );

}