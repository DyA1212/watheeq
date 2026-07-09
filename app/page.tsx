export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">

      {/* Header */}
      <header className="bg-white shadow">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-4 md:flex-row md:px-6">

          <h1 className="text-3xl font-bold text-teal-700">
            وثيق
          </h1>

          <nav className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center md:w-auto">
            <a
              href="/login"
              className="w-full rounded-xl border px-5 py-3 text-center transition hover:bg-gray-100 sm:w-auto"
            >
              تسجيل الدخول
            </a>

            <a
              href="/signup"
              className="w-full rounded-xl bg-teal-700 px-5 py-3 text-center text-white transition hover:bg-teal-800 sm:w-auto"
            >
              إنشاء حساب
            </a>
          </nav>

        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 py-12 text-center sm:px-6 md:py-20">

        <h2 className="mb-6 text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
          وسيطك الآمن لإتمام الصفقات
        </h2>

        <p className="mx-auto mb-10 max-w-3xl text-base leading-8 text-gray-600 sm:text-lg md:text-xl">
          منصة وثيق تحفظ أموال المشتري حتى يستلم المنتج،
          ثم تحول المبلغ للبائع بأمان.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">

          <a
            href="/login"
            className="w-full rounded-xl bg-teal-700 px-8 py-4 text-center font-semibold text-white transition hover:bg-teal-800 sm:w-auto"
          >
            ابدأ صفقة
          </a>

          <a
            href="/how-it-works"
            className="w-full rounded-xl border px-8 py-4 text-center font-semibold transition hover:bg-gray-100 sm:w-auto"
          >
            كيف تعمل؟
          </a>

        </div>

      </section>

      {/* Features */}
      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-5 px-4 pb-16 sm:px-6 md:grid-cols-3">

        <div className="rounded-2xl bg-white p-6 shadow">
          <h3 className="mb-3 text-xl font-bold">🔒 حماية الأموال</h3>
          <p className="leading-7 text-gray-600">
            يبقى المبلغ محفوظًا حتى يؤكد المشتري استلام المنتج.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow">
          <h3 className="mb-3 text-xl font-bold">⭐ تقييم المستخدمين</h3>
          <p className="leading-7 text-gray-600">
            تقييمات حقيقية لكل بائع ومشتري بعد كل صفقة.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow">
          <h3 className="mb-3 text-xl font-bold">🎧 دعم فني</h3>
          <p className="leading-7 text-gray-600">
            فريق دعم لمساعدتك في أي مشكلة أثناء الصفقة.
          </p>
        </div>

      </section>

      {/* آراء العملاء */}
      <section className="bg-white py-16">

        <div className="mx-auto max-w-7xl px-4 sm:px-6">

          <h2 className="mb-4 text-center text-3xl font-bold text-teal-700 md:text-4xl">
            آراء عملائنا
          </h2>

          <p className="mx-auto mb-8 max-w-2xl text-center text-gray-600">
            نفخر بثقة عملائنا وتجاربهم الناجحة مع منصة وثيق.
          </p>

          <div className="mb-12 flex justify-center">
            <a
              href="/review"
              className="rounded-xl bg-yellow-500 px-6 py-3 font-bold text-white transition hover:bg-yellow-600"
            >
              ⭐ قيّم تجربتك
            </a>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">

            <div className="rounded-2xl bg-gray-50 p-6 shadow">
              <div className="mb-3 text-2xl">⭐⭐⭐⭐⭐</div>
              <p className="mb-5 leading-7 text-gray-600">
                تعاملت في بيع سيارة وكانت التجربة ممتازة، المبلغ ما تحول إلا بعد استلام السيارة.
              </p>
              <h3 className="font-bold">طيف الثقفي</h3>
            </div>

            <div className="rounded-2xl bg-gray-50 p-6 shadow">
              <div className="mb-3 text-2xl">⭐⭐⭐⭐⭐</div>
              <p className="mb-5 leading-7 text-gray-600">
                منصة ممتازة وتعطيني راحة وثقة عند الشراء من أشخاص ما أعرفهم.
              </p>
              <h3 className="font-bold">جود</h3>
            </div>

            <div className="rounded-2xl bg-gray-50 p-6 shadow">
              <div className="mb-3 text-2xl">⭐⭐⭐⭐⭐</div>
              <p className="mb-5 leading-7 text-gray-600">
                الدعم الفني متعاون جدًا وحل مشكلتي بسرعة، أنصح الجميع باستخدام وثيق.
              </p>
              <h3 className="font-bold">رامي محمد</h3>
            </div>

            <div className="rounded-2xl bg-gray-50 p-6 shadow">
              <div className="mb-3 text-2xl">⭐⭐⭐⭐⭐</div>
              <p className="mb-5 leading-7 text-gray-600">
                أفضل منصة وساطة استخدمتها، سهلة وسريعة وتحافظ على حقوق الطرفين.
              </p>
              <h3 className="font-bold">مروان أحمد</h3>
            </div>

          </div>

        </div>

      </section>

    </main>
  );
}