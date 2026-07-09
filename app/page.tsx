export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">

      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 px-4 md:px-6 py-4">

          <h1 className="text-2xl md:text-3xl font-bold text-teal-700">
            وثيق
          </h1>

          <nav className="flex w-full md:w-auto justify-center gap-3">
            <a
              href="/login"
              className="px-5 py-2 rounded-lg border hover:bg-gray-100 transition"
            >
              تسجيل الدخول
            </a>

            <a
              href="/signup"
              className="px-5 py-2 rounded-lg bg-teal-700 text-white hover:bg-teal-800 transition"
            >
              إنشاء حساب
            </a>
          </nav>

        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-16 md:py-20 text-center">

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-6">
          وسيطك الآمن لإتمام الصفقات
        </h2>

        <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
          منصة وثيق تحفظ أموال المشتري حتى يستلم المنتج،
          ثم تحول المبلغ للبائع بأمان.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">

          <a
            href="/login"
            className="bg-teal-700 text-white px-8 py-4 rounded-xl w-full sm:w-auto hover:bg-teal-800 transition"
          >
            ابدأ صفقة
          </a>

          <a
            href="/how-it-works"
            className="border px-8 py-4 rounded-xl w-full sm:w-auto hover:bg-gray-100 transition"
          >
            كيف تعمل؟
          </a>

        </div>

      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 px-6 pb-20">

        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="text-xl font-bold mb-3">
            🔒 حماية الأموال
          </h3>
          <p>
            يبقى المبلغ محفوظًا حتى يؤكد المشتري استلام المنتج.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="text-xl font-bold mb-3">
            ⭐ تقييم المستخدمين
          </h3>
          <p>
            تقييمات حقيقية لكل بائع ومشتري بعد كل صفقة.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="text-xl font-bold mb-3">
            🎧 دعم فني
          </h3>
          <p>
            فريق دعم لمساعدتك في أي مشكلة أثناء الصفقة.
          </p>
        </div>

      </section>

      {/* آراء العملاء */}
      <section className="bg-white py-20">

        <div className="max-w-7xl mx-auto px-6">

          <h2 className="text-3xl md:text-4xl font-bold text-center text-teal-700 mb-4">
            آراء عملائنا
          </h2>

          <p className="text-center text-gray-600 mb-8">
            نفخر بثقة عملائنا وتجاربهم الناجحة مع منصة وثيق.
          </p>

          <div className="flex justify-center mb-12">
            <a
              href="/review"
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-xl font-bold transition"
            >
              ⭐ قيّم تجربتك
            </a>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

            <div className="bg-gray-50 rounded-2xl shadow p-6">
              <div className="text-2xl mb-3">⭐⭐⭐⭐⭐</div>
              <p className="text-gray-600 mb-5">
                تعاملت في بيع سيارة وكانت التجربة ممتازة، المبلغ ما تحول إلا بعد استلام السيارة.
              </p>
              <h3 className="font-bold">
                طيف الثقفي
              </h3>
            </div>

            <div className="bg-gray-50 rounded-2xl shadow p-6">
              <div className="text-2xl mb-3">⭐⭐⭐⭐⭐</div>
              <p className="text-gray-600 mb-5">
                منصة ممتازة وتعطيني راحة وثقة عند الشراء من أشخاص ما أعرفهم.
              </p>
              <h3 className="font-bold">
                جود
              </h3>
            </div>

            <div className="bg-gray-50 rounded-2xl shadow p-6">
              <div className="text-2xl mb-3">⭐⭐⭐⭐⭐</div>
              <p className="text-gray-600 mb-5">
                الدعم الفني متعاون جدًا وحل مشكلتي بسرعة، أنصح الجميع باستخدام وثيق.
              </p>
              <h3 className="font-bold">
                رامي محمد
              </h3>
            </div>

            <div className="bg-gray-50 rounded-2xl shadow p-6">
              <div className="text-2xl mb-3">⭐⭐⭐⭐⭐</div>
              <p className="text-gray-600 mb-5">
                أفضل منصة وساطة استخدمتها، سهلة وسريعة وتحافظ على حقوق الطرفين.
              </p>
              <h3 className="font-bold">
                مروان أحمد
              </h3>
            </div>

          </div>

        </div>

      </section>

    </main>
  );
}