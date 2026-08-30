# سياسة الخصوصية — TaskUp

**آخر تحديث:** 14 أغسطس 2026
**الإصدار:** 1.0

> ⚠️ **ملاحظة قبل النشر:** هذه الوثيقة تحتوي على حقول بين قوسين معقوفين `[ ]` يجب تعبئتها قبل النشر الفعلي أو تقديم التطبيق للمتاجر (اسم الجهة المالكة، الدولة الخاضعة لها قانونياً).

## من نحن

TaskUp تطبيق لإدارة المهام والمشاريع والتواصل بين فرق العمل، مملوك ومُدار بواسطة **[OWNER_NAME]** ("نحن"، "TaskUp"). هذه السياسة تشرح البيانات التي نجمعها من مستخدمي التطبيق ("أنت"، "المستخدم") وكيف نستخدمها ونحميها.

## البيانات التي نجمعها فعلياً

هذا القسم مبني مباشرة على نموذج البيانات الفعلي في نظام TaskUp، وليس على ميزات مخطط لها لم تُنفَّذ بعد.

| البيانات | الغرض | الأساس القانوني |
|---|---|---|
| رقم الهاتف | الهوية الوحيدة لتسجيل الدخول (عبر رمز تحقق OTP) — لا توجد كلمات مرور في TaskUp إطلاقاً | تنفيذ العقد (توفير الخدمة) |
| الاسم، الصورة الشخصية، لغة الواجهة | تخصيص الملف الشخصي وعرضه لبقية المستخدمين المرتبطين بك | تنفيذ العقد |
| إذن الوصول لجهات الاتصال (نعم/لا فقط) | لعرض من من جهات اتصالك مسجّل بالفعل في TaskUp، عبر مطابقة تجزئة (hash) لأرقام الهواتف — **رقم الهاتف الفعلي من دفتر جهات اتصالك لا يُرسل ولا يُخزَّن أبداً على خوادمنا**، فقط بصمة تجزئة (SHA-256) تُحسب على جهازك | الموافقة الصريحة |
| رمز إشعارات الدفع (Push Token) ونوع الجهاز | إرسال إشعارات التطبيق (مهام جديدة، رسائل، إلخ) | تنفيذ العقد |
| عنوان IP والمعرّف الرقمي للجهاز (User-Agent) وبيانات الجلسة | ربط جلسات الدخول لأغراض الأمان، وإتاحة تسجيل الخروج عن بُعد من أجهزة أخرى | مصلحة مشروعة (أمان الحساب) |
| محتوى المهام والمشاريع والمرفقات | صلب وظيفة التطبيق نفسه | تنفيذ العقد |
| محتوى الملاحظات الشخصية (العنوان والنص، والوسوم، وربطها الاختياري بمهمة) | صلب وظيفة التطبيق نفسه — **العنوان والنص مشفّران على مستوى الحقل بمعيار AES-256-GCM** (راجع قسم التشفير أدناه). عند حذف ملاحظة تُنقل إلى سلة المحذوفات وتُحذف نهائياً تلقائياً بعد **30 يوماً** | تنفيذ العقد |
| محتوى الرسائل بين المستخدمين (محادثات فردية) | صلب وظيفة التطبيق نفسه | تنفيذ العقد |
| تفضيلات الإشعارات لكل تصنيف | تخصيص أي التنبيهات تصلك | تنفيذ العقد |
| نتائج ميزات الذكاء الاصطناعي (تلخيص مهمة، تقييم مخاطر تأخر مهمة، اقتراحات) | مساعدتك على إدارة مهامك — **تُنشأ حالياً بمعالجة محلية على خوادمنا فقط، ولا تُرسل محتويات مهامك إلى أي مزوّد ذكاء اصطناعي خارجي طرف ثالث في النسخة الحالية من التطبيق.** إن اعتمدنا مستقبلاً مزوّداً خارجياً لهذه الميزة، سنحدّث هذه السياسة قبل ذلك وليس بعده | مصلحة مشروعة / موافقة |
| بيانات الاشتراك (خطة مجانية/مدفوعة، تاريخ الانتهاء) | إدارة صلاحيات الوصول للميزات المدفوعة | تنفيذ العقد |
| موافقتك على هذه السياسة وعلى الشروط والأحكام (بالإصدار والتاريخ) | إثبات قانوني بأنك وافقت، ومتى | التزام قانوني |

نحن **لا** نجمع كلمات مرور (لا توجد كلمات مرور في TaskUp إطلاقاً)، ولا نجمع دفتر جهات الاتصال الكامل من جهازك، ولا نبيع بياناتك لأي طرف ثالث لأغراض إعلانية.

## التشفير وحماية البيانات

- **أثناء النقل:** جميع الاتصالات بين تطبيقك وخوادمنا مشفّرة عبر TLS 1.2 كحد أدنى (يُفضَّل TLS 1.3)، مع تفعيل HSTS لإجبار الاتصال المشفّر دائماً.
- **في التخزين:** قاعدة بياناتنا ونسخنا الاحتياطية مشفّرة على مستوى القرص/التخزين لدى مزوّد الاستضافة. بالإضافة إلى ذلك، **رقم هاتفك، ومحتوى رسائلك في المحادثات، وعنوان ونص ملاحظاتك الشخصية مشفّرة على مستوى الحقل بمعيار AES-256-GCM** — أي حتى من له وصول مباشر لقاعدة البيانات لا يرى القيمة الفعلية دون مفتاح التشفير المنفصل.
- **هذا التشفير ليس تشفيراً من الطرف إلى الطرف (End-to-End Encryption).** بيانات مهامك ورسائلك تُخزَّن بحيث يستطيع فريقنا الوصول إليها تقنياً — لكن هذا الوصول **يقتصر على أغراض الإشراف الفني ومعالجة بلاغات إساءة الاستخدام فقط**، ولا يحدث بشكل روتيني أو تلقائي. كل مرة يفتح فيها أحد فريقنا تفاصيل حساب أو مهمة أو مشروع من لوحة التحكم الإدارية، يُسجَّل ذلك تلقائياً في سجل تدقيق (Audit Log) داخلي — راجع SECURITY.md.

## مدة الاحتفاظ بالبيانات والحذف

- نحتفظ ببياناتك طالما حسابك نشط.
- رموز التحقق (OTP) قصيرة العمر جداً (تنتهي صلاحيتها خلال دقائق) ولا تُحتفظ بها بعد الاستخدام أو انتهاء الصلاحية.
- عند تعطيل حسابك من قبلنا (لمخالفة الشروط مثلاً)، تُحفظ بياناتك دون حذف إلى حين طلب الحذف الصريح.
- يمكنك حذف حسابك ذاتياً من داخل التطبيق (الملف الشخصي ← حذف الحساب). نظراً لأن بعض بياناتك (مثل المهام أو الرسائل) قد تكون مرتبطة ببيانات مستخدمين آخرين، فإن الحذف يزيل بياناتك الشخصية المُعرِّفة (الاسم، رقم الهاتف، الصورة) ويعطّل الحساب نهائياً، دون حذف السجلات التي تخص مستخدمين آخرين بشكل يكسر تكاملها.
- حذف ملاحظة ينقلها أولاً إلى سلة المحذوفات وليس حذفاً فورياً نهائياً — بحيث يمكنك التراجع عن الحذف بالخطأ. تُحذف الملاحظات في سلة المحذوفات تلقائياً ونهائياً بعد **30 يوماً**، دون أي خطوة يدوية مطلوبة.

## الأطراف الثالثة

في النسخة الحالية من التطبيق (بيئة تطوير محلية، لم تُنشر بعد لأي مزوّد استضافة إنتاجي)، **لا تُشارَك بياناتك مع أي طرف ثالث** — لا يوجد مزوّد رسائل SMS، ولا مزوّد إشعارات push، ولا خدمة تخزين ملفات خارجية مفعّلة فعلياً بعد؛ جميعها تعمل حالياً كمحاكاة محلية على خوادمنا. عند اعتماد مزوّدين حقيقيين لهذه الخدمات (سيُحدَّدون لاحقاً)، سنحدّث هذا القسم بأسمائهم قبل تفعيلهم فعلياً:

- مزوّد رسائل OTP: **[TBD]**
- مزوّد إشعارات الدفع: **[TBD]**
- مزوّد تخزين الملفات/الصور: **[TBD]**
- مزوّد الاستضافة وقاعدة البيانات: **[TBD]**

## حقوق المستخدم

يحق لك:
- **الوصول** إلى بياناتك الشخصية المخزَّنة لدينا.
- **تصحيح** أي بيانات غير دقيقة (الاسم، الصورة، رقم الهاتف من داخل التطبيق).
- **طلب حذف** بياناتك (راجع الملاحظة أعلاه بخصوص الحالة الحالية للآلية).
- **تصدير** نسخة من بياناتك بصيغة قابلة للقراءة.
- **سحب موافقتك** على معالجة بياناتك في أي وقت، مع العلم أن ذلك قد يعني تعطيل قدرتك على استخدام التطبيق.

لممارسة أي من هذه الحقوق، تواصل معنا على البريد أدناه.

## الأطفال

TaskUp غير موجّه للأطفال دون سن **13 عاماً** (أو السن الأدنى المطلوب قانونياً في بلدك إن كان أعلى)، ولا نجمع عمداً بيانات من هذه الفئة العمرية. إن علمنا أن طفلاً دون هذا السن قدّم لنا بياناته، سنحذفها فور اكتشاف ذلك.

## التواصل معنا

لأي استفسار يخص هذه السياسة، أو لممارسة أي من حقوقك المذكورة أعلاه:

**البريد الإلكتروني:** support@taskupapp.net

## تحديثات هذه السياسة

قد نحدّث هذه السياسة من وقت لآخر. سنُعلمك بأي تغيير جوهري قبل سريانه، وسيظهر تاريخ آخر تحديث دائماً أعلى هذه الصفحة.

---

# Privacy Policy — TaskUp

**Last updated:** August 14, 2026
**Version:** 1.0

> ⚠️ **Note before publishing:** This document contains bracketed placeholders `[ ]` that must be filled in before real publication or app-store submission (owning entity name, legal jurisdiction).

## Who we are

TaskUp is a task, project, and team-communication app owned and operated by **[OWNER_NAME]** ("we", "TaskUp"). This policy explains what data we collect from TaskUp users ("you") and how we use and protect it.

## Data we actually collect

This section is built directly from TaskUp's real data model, not from planned-but-unbuilt features.

| Data | Purpose | Legal basis |
|---|---|---|
| Phone number | Sole login identity (via OTP) — TaskUp has no passwords at all | Contract performance |
| Name, avatar, interface language | Personalizing and displaying your profile to people you're connected with | Contract performance |
| Contacts-permission flag (yes/no only) | Showing which of your contacts are already on TaskUp, via a hash match — **your actual address book is never sent to or stored on our servers**, only a SHA-256 hash computed on your device | Explicit consent |
| Push notification token and device type | Delivering app notifications (new tasks, messages, etc.) | Contract performance |
| IP address, device user-agent, session metadata | Tying login sessions together for security, enabling remote logout of other devices | Legitimate interest (account security) |
| Task, project, and attachment content | The core function of the app | Contract performance |
| Personal note content (title and body, tags, and optional link to a task) | The core function of the app — **title and body are field-level encrypted with AES-256-GCM** (see Encryption below). Deleting a note moves it to Trash, which is automatically and permanently purged after **30 days** | Contract performance |
| Message content in 1:1 conversations | The core function of the app | Contract performance |
| Per-category notification preferences | Customizing which alerts reach you | Contract performance |
| AI feature output (task summaries, delay-risk flags, suggestions) | Helping you manage your tasks — **currently generated by processing done locally on our own servers; your task content is not sent to any third-party AI provider in the current version.** If we ever adopt a third-party provider for this, we will update this policy in advance, not after | Legitimate interest / consent |
| Subscription data (free/paid plan, expiry) | Managing access to paid features | Contract performance |
| Your acceptance of this policy and the Terms (version + timestamp) | Legal proof of consent and when it was given | Legal obligation |

We do **not** collect passwords (TaskUp has none at all), we do not collect your full address book, and we do not sell your data to any third party for advertising purposes.

## Encryption and data protection

- **In transit:** all traffic between your app and our servers is encrypted with TLS 1.2 minimum (TLS 1.3 preferred), with HSTS enforcing encrypted connections.
- **At rest:** our database and backups are encrypted at the disk/storage level by our hosting provider. In addition, **your phone number, the content of your 1:1 messages, and the title/body of your personal notes are encrypted at the field level with AES-256-GCM** — even someone with direct database access cannot read the actual value without the separate encryption key.
- **This is not end-to-end encryption.** Your task and message data is stored in a way our team can technically access — but that access is **limited to technical moderation and abuse-report handling only**, and does not happen routinely or automatically. Every time a team member opens an account, task, or project's details from the admin panel, it's automatically recorded in an internal audit log — see SECURITY.md.

## Retention and deletion

- We retain your data for as long as your account is active.
- OTP codes are extremely short-lived (expire within minutes) and are not retained after use or expiry.
- If we disable your account (e.g. for a Terms violation), your data is kept, not deleted, until an explicit deletion request.
- You can delete your own account from inside the app (Profile → Delete Account). Because some of your data (like tasks or messages) may be linked to other users' data, deletion removes your identifying personal data (name, phone number, photo) and permanently disables the account, without deleting records belonging to other users in a way that would break their integrity.
- Deleting a note moves it to Trash first, not an immediate hard delete — this lets you undo an accidental deletion. Notes left in Trash are permanently and automatically deleted after **30 days**, with no manual step required.

## Third parties

In the app's current state (a local development environment, not yet deployed to any production hosting provider), **your data is not shared with any third party** — there is no live SMS provider, no live push-notification provider, and no external file-storage service active yet; all of these currently run as local simulations on our own servers. Once real providers are chosen (to be determined), we will name them here before they're activated:

- OTP/SMS provider: **[TBD]**
- Push notification provider: **[TBD]**
- File/image storage provider: **[TBD]**
- Hosting and database provider: **[TBD]**

## Your rights

You have the right to:
- **Access** the personal data we hold about you.
- **Correct** inaccurate data (name, avatar, phone number, from within the app).
- **Request deletion** of your data (see the note above on the current state of this mechanism).
- **Export** a readable copy of your data.
- **Withdraw consent** to processing at any time, understanding this may disable your ability to use the app.

To exercise any of these rights, contact us at the email below.

## Children

TaskUp is not directed at children under **13** (or the higher minimum age required by law in your jurisdiction), and we do not knowingly collect data from this age group. If we learn a child under this age has provided us data, we will delete it promptly.

## Contact us

For any question about this policy, or to exercise any of the rights above:

**Email:** support@taskupapp.net

## Changes to this policy

We may update this policy from time to time. We will notify you of any material change before it takes effect, and the "last updated" date at the top of this page will always reflect the current version.
