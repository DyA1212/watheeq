export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="mx-auto max-w-5xl px-6 py-16">

        <h1 className="mb-4 text-center text-4xl font-bold text-teal-700">
          كيف يعمل وثيق؟
        </h1>

        <p className="mb-12 text-center text-lg text-gray-600">
          وثيق هو وسيط إلكتروني يهدف إلى حماية أموال المشتري والبائع حتى تتم الصفقة
          بكل أمان وشفافية.
        </p>

        <div className="grid gap-6 md:grid-cols-2">

          <div className="rounded-2xl bg-white p-6 shadow">
            <h2 className="mb-3 text-2xl font-bold">
              1️⃣ إنشاء الصفقة
            </h2>
            <p className="text-gray-600">
              يقوم المشتري بإنشاء صفقة وإدخال قيمة المبلغ المطلوب، ثم يشارك رقم
              الصفقة مع البائع.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow">
            <h2 className="mb-3 text-2xl font-bold">
              2️⃣ دفع المبلغ
            </h2>
            <p className="text-gray-600">
              يقوم المشتري بتحويل المبلغ، ويتم تجميد الأموال داخل المنصة حتى
              تنتهي الصفقة.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow">
            <h2 className="mb-3 text-2xl font-bold">
              3️⃣ تسليم المنتج أو الخدمة
            </h2>
            <p className="text-gray-600">
              يسلّم البائع المنتج أو الخدمة كما تم الاتفاق بين الطرفين.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow">
            <h2 className="mb-3 text-2xl font-bold">
              4️⃣ تأكيد الاستلام
            </h2>
            <p className="text-gray-600">
              بعد تأكيد المشتري استلام المنتج، يتم تحويل المبلغ إلى البائع
              تلقائياً بعد خصم عمولة المنصة.
            </p>
          </div>

        </div>

        <div className="mt-12 rounded-2xl bg-teal-700 p-8 text-white">
          <h2 className="mb-4 text-3xl font-bold">
            لماذا تختار وثيق؟
          </h2>

          <ul className="space-y-3 text-lg">
            <li>✅ حماية أموال المشتري حتى استلام المنتج.</li>
            <li>✅ ضمان وصول مستحقات البائع بعد اكتمال الصفقة.</li>
            <li>✅ متابعة جميع الصفقات من خلال حسابك.</li>
            <li>✅ تقليل عمليات الاحتيال والنصب.</li>
            <li>✅ دعم فني للمساعدة عند وجود أي مشكلة.</li>
            <li>✅ منصة سهلة وسريعة وآمنة.</li>
          </ul>
        </div>

        <div className="mt-10 rounded-2xl border border-green-300 bg-green-50 p-6">
          <h2 className="mb-3 text-2xl font-bold text-green-700">
            أمان أموالك
          </h2>

          <p className="leading-8 text-gray-700">
            في وثيق لا يتم تحويل المبلغ مباشرةً إلى البائع، بل يبقى محفوظاً حتى
            يؤكد المشتري استلام المنتج أو الخدمة. وفي حال وجود مشكلة في الصفقة،
            يمكن لفريق الدعم مراجعة الحالة واتخاذ الإجراء المناسب لضمان العدالة
            بين الطرفين.
          </p>
        </div>

      </div>
    </main>
  );
}