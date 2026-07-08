export default function TransactionPage() {
  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl p-8">

          {/* العنوان */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-teal-700">
                صفقة #1001
              </h1>
              <p className="text-gray-500 mt-1">
                آخر تحديث قبل دقيقة
              </p>
            </div>

            <span className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full font-bold">
              بانتظار تأكيد الاستلام
            </span>
          </div>

          {/* شريط التقدم */}
          <div className="mt-10">
            <h2 className="font-bold mb-4">حالة الصفقة</h2>

            <div className="w-full bg-gray-200 h-3 rounded-full">
              <div className="bg-teal-600 h-3 rounded-full w-3/4"></div>
            </div>

            <div className="flex justify-between mt-4 text-sm text-gray-600">
              <span>💳 تم الدفع</span>
              <span>📦 تم التسليم</span>
              <span>📥 بانتظار التأكيد</span>
            </div>
          </div>

          {/* المعلومات */}
          <div className="mt-10 grid gap-4">

            <div className="bg-slate-50 rounded-xl p-4 flex justify-between">
              <span>المبلغ</span>
              <strong>4,500 ريال</strong>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 flex justify-between">
              <span>البائع</span>
              <strong>محمد</strong>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 flex justify-between">
              <span>المشتري</span>
              <strong>أحمد</strong>
            </div>

          </div>

          {/* الأزرار */}
          <div className="mt-10 grid gap-4">

            <button className="bg-teal-700 hover:bg-teal-800 text-white py-4 rounded-2xl text-lg font-bold transition">
              ✅ تأكيد استلام الطلب
            </button>

            <button className="border-2 border-teal-700 text-teal-700 hover:bg-teal-50 py-4 rounded-2xl text-lg font-bold transition">
              🛟 طلب مساعدة
            </button>

          </div>

          {/* التنبيه */}
          <div className="bg-slate-50 border rounded-2xl p-5 mt-8">
            <h3 className="font-bold text-lg mb-3">
              ماذا يحدث بعد ذلك؟
            </h3>

            <p className="text-gray-600">
              بعد الضغط على <strong>تأكيد استلام الطلب</strong> سيتم إنهاء
              الصفقة وتحويل المبلغ إلى حساب البائع، وبعدها يستطيع الطرفان تقييم
              بعضهما.
            </p>

            <p className="text-gray-600 mt-4">
              إذا واجهت أي مشكلة، لا تؤكد الاستلام، واضغط على
              <strong> طلب مساعدة </strong>
              وسيقوم فريق <strong>وثيق</strong> بمراجعة الطلب قبل تحويل
              المبلغ.
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}