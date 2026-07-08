export default function PaymentSuccess() {
  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-xl p-10 max-w-xl w-full">

        <div className="text-center">
          <div className="text-6xl">✅</div>

          <h1 className="text-3xl font-bold mt-4">
            تم استلام طلب التحويل
          </h1>

          <p className="text-gray-500 mt-3">
            شكراً لك، تم إرسال طلبك بنجاح.
          </p>
        </div>

        <div className="mt-8 bg-yellow-50 border border-yellow-300 rounded-xl p-5">
          <p className="font-bold">حالة الصفقة</p>
          <p className="mt-2 text-yellow-700">
            ⏳ بانتظار مراجعة التحويل
          </p>
        </div>

        <button
          className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold"
        >
          العودة للرئيسية
        </button>

      </div>
    </main>
  );
}