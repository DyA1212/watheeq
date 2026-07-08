export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">

      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <h1 className="text-3xl font-bold text-teal-700">
            وثيق
          </h1>

          <nav className="flex gap-4">
            <a
              href="/login"
              className="px-4 py-2 rounded-lg border"
            >
              تسجيل الدخول
            </a>

            <a
              href="/signup"
              className="px-4 py-2 rounded-lg bg-teal-700 text-white"
            >
              إنشاء حساب
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h2 className="text-5xl font-bold mb-6">
          وسيطك الآمن لإتمام الصفقات
        </h2>

        <p className="text-xl text-gray-600 mb-10">
          منصة وثيق تحفظ أموال المشتري حتى يستلم المنتج،
          ثم تحول المبلغ للبائع بأمان.
        </p>

        <div className="flex justify-center gap-4">
          <a
            href="/login"
            className="bg-teal-700 text-white px-8 py-4 rounded-xl"
          >
            ابدأ صفقة
          </a>

          <a
            href="/how-it-works"
            className="border px-8 py-4 rounded-xl"
          >
            كيف تعمل؟
          </a>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto grid md:grid-cols-3 gap-6 px-6 pb-20">

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

          <h2 className="text-4xl font-bold text-center text-teal-700 mb-4">
            آراء عملائنا
          </h2>

          <p className="text-center text-gray-600 mb-12">
            نفخر بثقة عملائنا وتجاربهم الناجحة مع منصة وثيق.
          </p>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">

            <div className="bg-gray-50 rounded-2xl shadow p-6">
              <div className="text-2xl mb-3">⭐⭐⭐⭐⭐</div>
              <p className="text-gray-600 mb-5">
                تعاملت في بيع سيارة وكانت التجربة ممتازة، المبلغ ما تحول للبائع إلا بعد استلامي للسيارة.
              </p>
              <h3 className="font-bold">محمد العتيبي</h3>
            </div>

            <div className="bg-gray-50 rounded-2xl shadow p-6">
              <div className="text-2xl mb-3">⭐⭐⭐⭐⭐</div>
              <p className="text-gray-600 mb-5">
                منصة ممتازة وتعطيني راحة وثقة عند الشراء من أشخاص ما أعرفهم.
              </p>
              <h3 className="font-bold">سارة الشمري</h3>
            </div>

            <div className="bg-gray-50 rounded-2xl shadow p-6">
              <div className="text-2xl mb-3">⭐⭐⭐⭐⭐</div>
              <p className="text-gray-600 mb-5">
                الدعم الفني متعاون جدًا وحل مشكلتي بسرعة، أنصح الجميع باستخدام وثيق.
              </p>
              <h3 className="font-bold">عبدالله القحطاني</h3>
            </div>

            <div className="bg-gray-50 rounded-2xl shadow p-6">
              <div className="text-2xl mb-3">⭐⭐⭐⭐⭐</div>
              <p className="text-gray-600 mb-5">
                أفضل منصة وساطة استخدمتها، سهلة وسريعة وتحافظ على حقوق الطرفين.
              </p>
              <h3 className="font-bold">نورة الحربي</h3>
            </div>

          </div>

        </div>
      </section>

    </main>
  );
}