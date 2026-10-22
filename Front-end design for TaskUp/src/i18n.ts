export type Lang = 'ar' | 'en'

export const t = {
  ar: {
    // Language selection
    chooseLanguage: 'اختر لغتك',
    arabic: 'العربية',
    english: 'English',
    continue: 'متابعة',

    // Welcome
    tagline: 'من المهمة إلى الإنجاز.',
    taglineEn: 'From Task to Done.',
    startNow: 'إنشاء حساب جديد',
    signIn: 'تسجيل الدخول',
    alreadyHaveAccount: 'لديك حساب بالفعل؟',
    loginTitle: 'مرحباً بعودتك',
    loginSubtitle: 'أدخل رقم جوالك لتسجيل الدخول.',
    newUser: 'مستخدم جديد؟',
    createAccount: 'إنشاء حساب',
    termsNote: 'بالمتابعة توافق على شروط الاستخدام وسياسة الخصوصية',
    point1: 'أنجز مع فريقك',
    point2: 'تابع كل مهمة',
    point3: 'لا يضيع شيء',

    // Phone
    welcomeTitle: 'أهلاً بك في TaskUp',
    phoneSubtitle: 'أدخل رقم جوالك للبدء.',
    phonePlaceholder: '5XXXXXXXX',
    smsnote: 'سنرسل لك رمز تحقق عبر SMS',
    next: 'متابعة',

    // OTP
    otpTitle: 'أدخل رمز التحقق',
    otpSubtitle: 'أرسلنا رمزًا إلى رقم جوالك.',
    resend: 'إعادة إرسال الرمز',
    notReceived: 'لم يصلك الرمز؟',
    verify: 'تحقق',

    // Profile Setup
    profileTitle: 'ما اسمك؟',
    profileSubtitle: 'سيعرفك زملاؤك بهذا الاسم.',
    addPhoto: 'إضافة صورة',
    namePlaceholder: 'الاسم',

    // Contacts
    contactsTitle: 'اعثر على زملائك بسهولة',
    contactsSubtitle: 'يمكن لـTaskUp مساعدتك في العثور على الأشخاص الذين يعملون معك.',
    allowContacts: 'السماح بالوصول إلى جهات الاتصال',
    notNow: 'ليس الآن',

    // Notifications
    notifTitle: 'لا تفوّت أي تحديث',
    notifSubtitle: 'سنخبرك عندما يتم تعيين مهمة لك أو يحدث شيء مهم.',
    allowNotif: 'السماح بالإشعارات',

    // Home
    goodMorning: 'صباح الخير 👋',
    searchPlaceholder: 'ابحث عن مهمة، مشروع أو شخص...',
    todayQuestion: 'ما الذي تريد إنجازه اليوم؟',
    sectionNow: 'عليك الآن',
    sectionLate: 'متأخرة',
    sectionUpcoming: 'قادمة',
    sectionTeam: 'آخر تحديثات الفريق',
    viewAll: 'عرض الكل',
    create: 'إنشاء',

    // Task Card
    inProgress: 'قيد التنفيذ',
    notStarted: 'لم تبدأ',
    done: 'مكتملة',

    // Create Sheet
    createWhat: 'ماذا تريد إنشاء؟',
    createTask: 'مهمة',
    createTaskDesc: 'عمل مستقل يحتاج إنجازًا',
    createProject: 'مشروع',
    createProjectDesc: 'مجموعة من المهام المترابطة',

    // Create Task
    newTask: 'مهمة جديدة',
    taskTitleLabel: 'عنوان المهمة *',
    taskTitlePlaceholder: 'ماذا تريد إنجازه؟',
    assigneeLabel: 'المسؤول',
    dueDateLabel: 'الموعد',
    detailsLabel: 'التفاصيل (اختياري)',
    detailsPlaceholder: 'أضف تفاصيل...',
    projectLabel: 'المشروع (اختياري)',
    projectPlaceholder: 'إضافة إلى مشروع...',
    createBtn: 'إنشاء المهمة',

    // Create Project
    newProject: 'مشروع جديد',
    projectNameLabel: 'اسم المشروع *',
    projectNamePlaceholder: 'ما اسم المشروع؟',
    projectDescLabel: 'وصف المشروع (اختياري)',
    projectDescPlaceholder: 'وصف قصير عن الهدف من المشروع...',
    projectMembersLabel: 'أعضاء المشروع (اختياري)',
    projectColorLabel: 'لون المشروع',
    createProjectBtn: 'إنشاء المشروع',

    // Member picker
    addMember: 'إضافة عضو',
    searchMember: 'ابحث بالاسم أو رقم الجوال...',
    onTaskUp: 'على TaskUp',
    inviteExternal: 'دعوة خارجية',
    notOnTaskUp: 'ليس على TaskUp بعد',
    sendInvite: 'إرسال دعوة',
    inviteSent: 'تم إرسال الدعوة ✓',
    externalLabel: 'خارجي',
    inviteByPhone: 'دعوة برقم الجوال',
    enterPhoneOrName: 'أدخل رقم الجوال أو الاسم',
    inviteNote: 'سيصله رابط للانضمام إلى TaskUp والمشاركة في المهمة تلقائياً.',
    confirmDone: 'تم',
    pendingInvite: 'دعوة معلّقة',
    addFirstTask: 'أضف أول مهمة',
    projectCreatedTitle: 'تم إنشاء المشروع! 🎉',
    projectCreatedSub: 'مشروعك جاهز. ابدأ بإضافة أول مهمة.',
    today: 'اليوم',
    tomorrow: 'غداً',
    thisWeek: 'هذا الأسبوع',
    nextWeek: 'الأسبوع القادم',

    // Task Detail
    report: 'التقرير',
    markDone: 'تم الإنجاز ✓',
    assignee: 'المسؤول',
    dueDate: 'الموعد',
    sharedWith: 'شارك مع',
    details: 'التفاصيل',
    composerPlaceholder: 'اكتب تحديثًا...',

    // Task Report
    taskReport: 'تقرير المهمة',
    progress: 'التقدم',
    lastUpdate: 'آخر تحديث',
    updateCount: 'عدد التحديثات',
    agoMinutes: 'منذ 20 دقيقة',
    completed: 'تم إنجازه',
    remaining: 'المتبقي',
    lastActivity: 'آخر نشاط',
    riskLabel: '⚠️ يحتاج انتباه',
    update: 'تحديث',
    updates: 'تحديثات',

    // Projects
    projects: 'المشاريع',
    tasks: 'مهمة',
    members: 'أشخاص',
    late: 'متأخرة',

    // Project Detail
    tasksLabel: 'المهام',
    ofTasks: 'مهمة مكتملة',

    // Notifications
    notifications: 'الإشعارات',
    markAllRead: 'تحديد الكل كمقروء',
    newSection: 'جديد',
    earlierSection: 'سابق',

    // Profile
    myTasks: 'المهام',
    myProjects: 'المشاريع',
    completedTasks: 'المكتملة',
    notifSettings: 'الإشعارات',
    contactsSettings: 'جهات الاتصال',
    help: 'المساعدة',
    language: 'اللغة',
    termsOfUse: 'شروط الاستخدام',
    privacyPolicy: 'سياسة الخصوصية',
    logout: 'تسجيل الخروج',

    // Legal screens
    lastUpdated: 'آخر تحديث: أغسطس 2026',
    termsAccept: 'بالمتابعة، أقر بأنني قرأت وأوافق على هذه الشروط.',
    privacyAccept: 'بالمتابعة، أقر بأنني قرأت وأوافق على سياسة الخصوصية.',
    iAgree: 'أوافق',

    terms: {
      title: 'شروط الاستخدام',
      intro: 'مرحباً بك في TaskUp. باستخدامك لهذا التطبيق، فإنك توافق على الالتزام بالشروط والأحكام التالية. يُرجى قراءتها بعناية قبل البدء.',
      sections: [
        {
          heading: "1. القبول والموافقة",
          body: "استخدامك لتطبيق TaskUp يعني موافقتك على هذه الشروط. إن لم توافق عليها، يُرجى التوقف عن استخدام التطبيق. قد نعدّل هذه الشروط، وسنُخطرك بأي تغيير جوهري داخل التطبيق قبل سريانه.",
        },
        {
          heading: "2. وصف الخدمة",
          body: "TaskUp تطبيق لإدارة المهام والمشاريع والملاحظات والمحادثات بين أعضاء الفريق. الخدمة مجانية بالكامل حالياً ولا توجد اشتراكات أو مدفوعات داخل التطبيق. إذا أضفنا ميزات مدفوعة مستقبلاً فسنحدّث هذه الشروط ونُعلمك قبل تفعيلها.",
        },
        {
          heading: "3. الأهلية والحساب",
          body: "يجب أن تكون بالغاً (18 سنة فأكثر) لاستخدام TaskUp. التسجيل يتم برقم جوالك عبر رمز تحقق لمرة واحدة (OTP) — لا توجد كلمة مرور تُنشئها أو نخزّنها. أنت المسؤول الوحيد عن أمان جهازك ورقم جوالك وعن أي نشاط يجري عبر حسابك. يُحظر انتحال هوية غيرك أو إنشاء حسابات وهمية.",
        },
        {
          heading: "4. الاستخدام المقبول",
          body: "التزم باستخدام التطبيق للأغراض المشروعة فقط. يُحظر نشر محتوى مسيء أو مضلل أو غير قانوني، أو التحرش بمستخدم آخر، أو إرسال رسائل عشوائية، أو محاولة الوصول غير المصرّح به لأنظمتنا أو لحسابات غيرك، أو استخدام التطبيق بما يخالف أنظمة المملكة العربية السعودية.",
        },
        {
          heading: "5. الإبلاغ والحظر وتعليق الحساب",
          body: "يمكنك حظر أي مستخدم من داخل المحادثة، فتتوقف الرسائل بينكما في الاتجاهين ولا يمكنه بدء محادثة جديدة معك، وتجد قائمة المحظورين في «الحساب ← المستخدمون المحظورون» لإلغاء الحظر وقت ما شئت. ويمكنك الإبلاغ عن أي مستخدم أو عن رسالة بعينها، وتصل البلاغات إلى فريق المراجعة لدينا. نحتفظ بالحق في تعطيل أي حساب يخالف هذه الشروط، وقد يتم ذلك دون إشعار مسبق في الحالات الجسيمة.",
        },
        {
          heading: "6. المحتوى الذي تنشئه",
          body: "تحتفظ بملكية كامل ما تنشئه أو ترفعه عبر TaskUp من مهام ومشاريع وملاحظات ورسائل وملفات. بإنشائه، تمنحنا رخصة محدودة لتخزينه وعرضه لك ولمن شاركته معهم بالقدر اللازم لتشغيل الخدمة فقط. لن نستخدم محتواك لأي غرض تسويقي، ولن نبيعه، ولن ندرّب عليه أي نموذج ذكاء اصطناعي.",
        },
        {
          heading: "7. الملكية الفكرية",
          body: "اسم TaskUp وشعاره وتصميمه وبرمجياته مملوكة لنا. يُمنح المستخدم رخصة استخدام محدودة وغير حصرية وغير قابلة للتحويل، لا تشمل نسخ التطبيق أو تعديله أو إعادة هندسته.",
        },
        {
          heading: "8. حذف الحساب",
          body: "يمكنك حذف حسابك في أي وقت من (حسابي ← حذف الحساب). عند الحذف نُخفي هويتك فوراً: يُستبدل اسمك وصورتك ورقم جوالك بقيم مجهولة، وتُلغى جلساتك، ويُعطّل الحساب نهائياً بحيث لا يمكن الدخول إليه مجدداً. لا نحذف السجلات المرتبطة بمستخدمين آخرين (كرسالة أرسلتها لشخص أو مهمة يشارك فيها فريق) لأن حذفها يمسّ بيانات غيرك ويُفسد تكامل سجلاتهم.",
        },
        {
          heading: "9. إنهاء الخدمة أو تعديلها",
          body: "قد نعدّل الخدمة أو نوقفها. في حال الإيقاف النهائي سنُخطرك مسبقاً قدر الإمكان لتتمكن من طلب نسخة من بياناتك عبر البريد الموضّح أدناه. لا تتوفر حالياً أداة تصدير ذاتية داخل التطبيق.",
        },
        {
          heading: "10. إخلاء المسؤولية",
          body: "يُقدَّم التطبيق \"كما هو\" دون ضمان صريح أو ضمني بخلوّه من الأخطاء أو باستمرار عمله دون انقطاع. لا نتحمل مسؤولية القرارات التي تتخذها بناءً على محتوى التطبيق، ولا نضمن أماناً مطلقاً لأي نظام رقمي — يُنصح بعدم تبادل معلومات بالغة الحساسية عبر أي تطبيق.",
        },
        {
          heading: "11. حدود المسؤولية",
          body: "بالقدر الذي تسمح به الأنظمة، لا نتحمل المسؤولية عن أي أضرار غير مباشرة أو تبعية أو فقدان بيانات أو أرباح ناتجة عن استخدام التطبيق أو تعذّر الوصول إليه. وبما أن الخدمة مجانية ولا تُحصَّل عنها أي رسوم، فلا تترتب علينا مسؤولية مالية تعويضية عن استخدامها.",
        },
        {
          heading: "12. القانون الحاكم",
          body: "تخضع هذه الشروط لأنظمة المملكة العربية السعودية وتُفسَّر وفقاً لها، وتختص المحاكم السعودية بالنظر في أي نزاع ينشأ عنها.",
        },
        {
          heading: "13. التواصل معنا",
          body: "لأي استفسار بشأن هذه الشروط: support@taskupapp.net",
        },
      ],
    },

    privacy: {
      title: 'سياسة الخصوصية',
      intro: 'نحن في TaskUp نأخذ خصوصيتك على محمل الجد. توضح هذه السياسة كيفية جمع بياناتك واستخدامها وحمايتها ومشاركتها.',
      sections: [
        {
          heading: "1. البيانات التي نجمعها فعلياً",
          body: "رقم جوالك (الهوية الوحيدة للدخول)، والاسم والصورة الشخصية إن أضفتهما، والمحتوى الذي تنشئه: المهام والمشاريع والملاحظات والرسائل والملفات المرفقة. ونسجّل عنوان IP مؤقتاً للحد من محاولات إرسال رموز التحقق المتكررة. إن فعّلت الإشعارات نخزّن معرّف جهازك لإرسالها. لا نجمع موقعك الجغرافي، ولا نستخدم أي أدوات تتبّع إعلاني.",
        },
        {
          heading: "2. كيف نستخدم بياناتك",
          body: "لتشغيل الخدمة حصراً: عرض مهامك ومشاريعك، وتوصيل رسائلك، وإرسال إشعاراتك، وحماية الحساب من إساءة الاستخدام. لا نبيع بياناتك، ولا نستخدمها للإعلانات، ولا ندرّب عليها أي نموذج ذكاء اصطناعي.",
        },
        {
          heading: "3. الأساس النظامي للمعالجة",
          body: "نعالج رقم جوالك ومحتواك لتنفيذ العقد بيننا (تقديم الخدمة التي طلبتها). ونعتمد على موافقتك الصريحة لما هو اختياري كالإشعارات ومطابقة جهات الاتصال، ويمكنك سحبها متى شئت.",
        },
        {
          heading: "4. التشفير وحماية البيانات",
          body: "أثناء النقل: كل الاتصال بخوادمنا عبر TLS 1.2 أو أحدث. وعند التخزين: رقم جوالك ونصوص رسائلك وعنوان ملاحظاتك ومحتواها مشفّرة على مستوى الحقل بمعيار AES-256-GCM، أي أن من يصل إلى قاعدة البيانات مباشرةً لا يرى قيمها الفعلية دون مفتاح تشفير منفصل. للشفافية: عناوين المهام والمشاريع وأوصافها ليست مشفّرة على مستوى الحقل، وتحميها ضوابط الوصول وتشفير القرص لدى مزوّد الاستضافة. لا نزعم حيازة أي شهادة أمنية، ولا يوجد لدينا فريق مراقبة على مدار الساعة.",
        },
        {
          heading: "5. مشاركة البيانات",
          body: "لا نبيع بياناتك ولا نشاركها لأغراض تسويقية. تقتصر المشاركة على: مزوّدي البنية التقنية الذين نعتمد عليهم لتشغيل الخدمة (الاستضافة وإرسال الرسائل النصية والإشعارات) بالقدر اللازم فقط، أو استجابةً لطلب نظامي من جهة مختصة، أو بموافقتك الصريحة.",
        },
        {
          heading: "6. جهات الاتصال",
          body: "إن اخترت البحث عن زملائك من جهات اتصالك، تُحوَّل الأرقام على جهازك إلى بصمات تجزئة (SHA-256) قبل إرسالها، ونطابقها لدينا لنعرف من هو مسجّل بالفعل. أرقام دفتر جهات اتصالك الفعلية لا تُرسل ولا تُخزَّن على خوادمنا، ولا نحتفظ بالبصمات بعد إتمام المطابقة.",
        },
        {
          heading: "7. الإشعارات",
          body: "نرسل إشعارات تتعلق بمهامك ومشاريعك ورسائلك فقط. يمكنك التحكم بكل نوع منها من (حسابي ← الإشعارات)، وإيقافها كلياً من إعدادات جهازك.",
        },
        {
          heading: "8. وصول فريقنا وسجل الرقابة",
          body: "وصول فريقنا إلى محتوى المستخدمين مقصور على أغراض المراجعة والدعم عند وجود بلاغ أو مشكلة تقنية. وكل اطّلاع على تفاصيل حساب أو مهمة أو مشروع يُسجَّل تلقائياً في سجل رقابي يبيّن من اطّلع ومتى، ولا يمكن حذف هذا السجل من داخل لوحة التحكم.",
        },
        {
          heading: "9. الاحتفاظ بالبيانات وحذف الحساب",
          body: "نحتفظ ببياناتك ما دام حسابك قائماً. عند حذف الحساب من داخل التطبيق نُخفي هويتك فوراً: يُستبدل الاسم والصورة ورقم الجوال بقيم مجهولة، وتُلغى الجلسات، ويُعطّل الحساب نهائياً. لا نستطيع محو السجلات المتشابكة مع مستخدمين آخرين (رسالة أرسلتها لشخص، أو مهمة يشارك فيها فريق) لأن حذفها يمسّ بياناتهم — لكنها لا تبقى منسوبة إليك باسم أو رقم.",
        },
        {
          heading: "10. حقوقك",
          body: "لك الحق في الوصول إلى بياناتك وتصحيحها وحذفها والاعتراض على معالجتها. التصحيح والحذف متاحان مباشرةً من داخل التطبيق. للحصول على نسخة من بياناتك أو لأي طلب آخر، راسلنا على support@taskupapp.net وسنستجيب خلال ثلاثين يوماً. لا تتوفر حالياً أداة تصدير ذاتية داخل التطبيق.",
        },
        {
          heading: "11. التخزين على جهازك",
          body: "نستخدم التخزين المحلي في التطبيق لحفظ جلستك ولغتك المختارة فقط. لا نستخدم ملفات تعريف ارتباط للتتبع الإعلاني ولا نشارك أي معرّف مع شبكات إعلانية.",
        },
        {
          heading: "12. خصوصية الأطفال",
          body: "TaskUp غير مخصص لمن هم دون 18 عاماً ولا نجمع بياناتهم عن قصد. إن علمنا بتسجيل حساب لطفل، نحذفه فوراً. إن كنت ولي أمر وتعتقد أن طفلك سجّل حساباً، راسلنا وسنتصرف فوراً.",
        },
        {
          heading: "13. التغييرات على هذه السياسة",
          body: "قد نحدّث هذه السياسة. سنُخطرك بأي تغيير جوهري داخل التطبيق قبل أربعة عشر يوماً من سريانه.",
        },
        {
          heading: "14. تواصل معنا",
          body: "لأي استفسار متعلق بخصوصيتك: support@taskupapp.net — العنوان: الرياض، المملكة العربية السعودية.",
        },
      ],
    },

    // Nav
    navHome: 'الرئيسية',
    navProjects: 'المشاريع',
    navNotif: 'الإشعارات',
    navProfile: 'حسابي',
    navChats: 'المحادثات',

    // Conversations
    chatsTitle: 'المحادثات',
    noChats: 'لا توجد محادثات بعد',
    noChatsHint: 'ابدأ محادثة مع أحد زملائك',
    typeMessage: 'اكتب رسالة...',
    linkToTask: 'ربط بمهمة',
    linkedTask: 'مرتبطة بمهمة',
    suggestLink: 'هل تقصد مهمة',
    linkBtn: 'ربط',
    skipLink: 'تجاهل',
    taskLinked: 'تم ربط المهمة ✓',
    today2: 'اليوم',
    yesterday: 'أمس',
    online: 'متصل الآن',
    offline: 'آخر ظهور منذ ساعة',

    // Notes
    navNotes: 'الملاحظات',
    notesTitle: 'الملاحظات',
    newNote: 'ملاحظة جديدة',
    untitledNote: 'ملاحظة بدون عنوان',
    notePlaceholderTitle: 'العنوان',
    notePlaceholderContent: 'ابدأ الكتابة...',
    allNotes: 'كل الملاحظات',
    pinned: 'مثبّتة',
    trash: 'سلة المحذوفات',
    searchNotes: 'ابحث في الملاحظات...',
    noNotes: 'لا توجد ملاحظات',
    noNotesHint: 'أنشئ ملاحظتك الأولى للبدء',
    noNotesInTrash: 'سلة المحذوفات فارغة',
    trashHint: 'تُحذف الملاحظات نهائياً بعد 30 يوماً من نقلها هنا',
    pin: 'تثبيت',
    unpin: 'إلغاء التثبيت',
    deleteNote: 'حذف',
    restoreNote: 'استعادة',
    saving: 'جارٍ الحفظ...',
    savedNote: 'تم الحفظ',
    linkedToTaskLabel: 'مرتبطة بمهمة',
    selectNotePrompt: 'اختر ملاحظة لعرضها أو أنشئ ملاحظة جديدة',
    deleteNoteConfirm: 'نقل هذه الملاحظة إلى سلة المحذوفات؟',
    backToList: 'رجوع',
  },

  en: {
    chooseLanguage: 'Choose your language',
    arabic: 'العربية',
    english: 'English',
    continue: 'Continue',

    tagline: 'From Task to Done.',
    taglineEn: 'من المهمة إلى الإنجاز.',
    startNow: 'Create an Account',
    signIn: 'Sign In',
    alreadyHaveAccount: 'Already have an account?',
    loginTitle: 'Welcome back',
    loginSubtitle: 'Enter your phone number to sign in.',
    newUser: 'New to TaskUp?',
    createAccount: 'Create account',
    termsNote: 'By continuing you agree to our Terms of Service and Privacy Policy',
    point1: 'Get things done with your team',
    point2: 'Track every task',
    point3: 'Nothing gets lost',

    welcomeTitle: 'Welcome to TaskUp',
    phoneSubtitle: 'Enter your phone number to get started.',
    phonePlaceholder: 'Phone number',
    smsnote: "We'll send you a verification code via SMS",
    next: 'Continue',

    otpTitle: 'Enter verification code',
    otpSubtitle: 'We sent a code to your phone number.',
    resend: 'Resend code',
    notReceived: "Didn't receive the code?",
    verify: 'Verify',

    profileTitle: "What's your name?",
    profileSubtitle: 'Your teammates will know you by this name.',
    addPhoto: 'Add photo',
    namePlaceholder: 'Name',

    contactsTitle: 'Find your teammates easily',
    contactsSubtitle: 'TaskUp can help you find the people you work with.',
    allowContacts: 'Allow access to contacts',
    notNow: 'Not now',

    notifTitle: "Don't miss any update",
    notifSubtitle: "We'll notify you when a task is assigned or something important happens.",
    allowNotif: 'Allow notifications',

    goodMorning: 'Good morning 👋',
    searchPlaceholder: 'Search tasks, projects or people...',
    todayQuestion: 'What do you want to get done today?',
    sectionNow: 'Action needed',
    sectionLate: 'Overdue',
    sectionUpcoming: 'Upcoming',
    sectionTeam: 'Team activity',
    viewAll: 'View all',
    create: 'Create',

    inProgress: 'In Progress',
    notStarted: 'Not Started',
    done: 'Done',

    createWhat: 'What do you want to create?',
    createTask: 'Task',
    createTaskDesc: 'A standalone piece of work',
    createProject: 'Project',
    createProjectDesc: 'A collection of related tasks',

    newTask: 'New Task',
    taskTitleLabel: 'Task title *',
    taskTitlePlaceholder: 'What do you want to get done?',
    assigneeLabel: 'Assignee',
    dueDateLabel: 'Due date',
    detailsLabel: 'Details (optional)',
    detailsPlaceholder: 'Add details...',
    projectLabel: 'Project (optional)',
    projectPlaceholder: 'Add to a project...',
    createBtn: 'Create Task',

    newProject: 'New Project',
    projectNameLabel: 'Project name *',
    projectNamePlaceholder: "What's the project called?",
    projectDescLabel: 'Description (optional)',
    projectDescPlaceholder: 'Brief description of the project goal...',
    projectMembersLabel: 'Project members (optional)',
    projectColorLabel: 'Project color',
    createProjectBtn: 'Create Project',

    addMember: 'Add member',
    searchMember: 'Search by name or phone...',
    onTaskUp: 'On TaskUp',
    inviteExternal: 'External invite',
    notOnTaskUp: 'Not on TaskUp yet',
    sendInvite: 'Send invite',
    inviteSent: 'Invite sent ✓',
    externalLabel: 'External',
    inviteByPhone: 'Invite by phone',
    enterPhoneOrName: 'Enter phone number or name',
    inviteNote: "They'll receive a link to join TaskUp and will be added to the task automatically.",
    confirmDone: 'Done',
    pendingInvite: 'Pending invite',
    addFirstTask: 'Add first task',
    projectCreatedTitle: 'Project created! 🎉',
    projectCreatedSub: 'Your project is ready. Start by adding the first task.',
    today: 'Today',
    tomorrow: 'Tomorrow',
    thisWeek: 'This week',
    nextWeek: 'Next week',

    report: 'Report',
    markDone: 'Mark Done ✓',
    assignee: 'Assignee',
    dueDate: 'Due date',
    sharedWith: 'Shared with',
    details: 'Details',
    composerPlaceholder: 'Write an update...',

    taskReport: 'Task Report',
    progress: 'Progress',
    lastUpdate: 'Last update',
    updateCount: 'Updates',
    agoMinutes: '20 minutes ago',
    completed: 'Completed',
    remaining: 'Remaining',
    lastActivity: 'Last activity',
    riskLabel: '⚠️ Needs attention',
    update: 'update',
    updates: 'updates',

    projects: 'Projects',
    tasks: 'tasks',
    members: 'members',
    late: 'overdue',

    tasksLabel: 'Tasks',
    ofTasks: 'tasks completed',

    notifications: 'Notifications',
    markAllRead: 'Mark all as read',
    newSection: 'New',
    earlierSection: 'Earlier',

    myTasks: 'Tasks',
    myProjects: 'Projects',
    completedTasks: 'Completed',
    notifSettings: 'Notifications',
    contactsSettings: 'Contacts',
    help: 'Help',
    language: 'Language',
    termsOfUse: 'Terms of Use',
    privacyPolicy: 'Privacy Policy',
    logout: 'Log out',

    lastUpdated: 'Last updated: August 2026',
    termsAccept: 'By continuing, I confirm that I have read and agree to these Terms.',
    privacyAccept: 'By continuing, I confirm that I have read and agree to the Privacy Policy.',
    iAgree: 'I Agree',

    terms: {
      title: 'Terms of Use',
      intro: 'Welcome to TaskUp. By using this application, you agree to be bound by the following terms and conditions. Please read them carefully before getting started.',
      sections: [
        {
          heading: "1. Acceptance",
          body: "Using TaskUp means you accept these Terms. If you do not agree to them, please stop using the app. We may amend these Terms, and will notify you in the app before any material change takes effect.",
        },
        {
          heading: "2. Description of Service",
          body: "TaskUp is an app for managing tasks, projects, notes and team conversations. The service is currently free in full — there are no subscriptions and no in-app purchases. If paid features are introduced later, we will update these Terms and notify you before they take effect.",
        },
        {
          heading: "3. Eligibility and Account",
          body: "You must be 18 or older to use TaskUp. You register with your phone number and a one-time code (OTP) — there is no password for you to create or for us to store. You are solely responsible for the security of your device and phone number, and for activity carried out through your account. Impersonating someone else or creating fake accounts is prohibited.",
        },
        {
          heading: "4. Acceptable Use",
          body: "Use the app only for lawful purposes. You may not post abusive, misleading or unlawful content, harass another user, send spam, attempt unauthorised access to our systems or to other people's accounts, or use the app in breach of the laws of Saudi Arabia.",
        },
        {
          heading: "5. Reporting, Blocking and Suspension",
          body: "You can block any user from inside a conversation: messages stop in both directions and they cannot start a new conversation with you, and the list under Account → Blocked Users lets you unblock anyone at any time. You can also report any user, or one specific message, and reports reach our review team. We may disable any account that breaches these Terms, without prior notice in serious cases.",
        },
        {
          heading: "6. Content You Create",
          body: "You keep ownership of everything you create or upload through TaskUp — tasks, projects, notes, messages and files. By creating it, you grant us a limited licence to store it and display it to you and to the people you shared it with, only to the extent needed to run the service. We will not use your content for marketing, will not sell it, and will not train any AI model on it.",
        },
        {
          heading: "7. Intellectual Property",
          body: "The TaskUp name, logo, design and software are ours. You receive a limited, non-exclusive, non-transferable licence to use the app, which does not include copying, modifying or reverse-engineering it.",
        },
        {
          heading: "8. Deleting Your Account",
          body: "You can delete your account at any time from Profile - Delete Account. On deletion we anonymise you immediately: your name, photo and phone number are replaced with anonymous values, your sessions are revoked, and the account is permanently disabled so it cannot be signed into again. We do not erase records entangled with other people (a message you sent someone, or a task a team shares), because deleting those would damage other users' own records.",
        },
        {
          heading: "9. Changing or Ending the Service",
          body: "We may modify or discontinue the service. If we shut it down permanently we will give as much notice as we reasonably can, so you can request a copy of your data at the address below. There is no self-service export tool in the app today.",
        },
        {
          heading: "10. Disclaimer",
          body: "The app is provided \"as is\", without any express or implied warranty that it will be error-free or run without interruption. We are not responsible for decisions you make based on content in the app, and no digital system can be guaranteed absolutely secure — we advise against exchanging highly sensitive information through any app.",
        },
        {
          heading: "11. Limitation of Liability",
          body: "To the extent permitted by law, we are not liable for indirect or consequential damages, lost data or lost profits arising from your use of, or inability to access, the app. As the service is free and no fees are charged for it, no compensatory financial liability arises from its use.",
        },
        {
          heading: "12. Governing Law",
          body: "These Terms are governed by and construed under the laws of Saudi Arabia, and the Saudi courts have jurisdiction over any dispute arising from them.",
        },
        {
          heading: "13. Contact Us",
          body: "For any question about these Terms: support@taskupapp.net",
        },
      ],
    },

    privacy: {
      title: 'Privacy Policy',
      intro: 'At TaskUp, we take your privacy seriously. This policy explains how we collect, use, protect, and share your data.',
      sections: [
        {
          heading: "1. Data We Actually Collect",
          body: "Your phone number (the only sign-in identity), your name and photo if you add them, and the content you create: tasks, projects, notes, messages and attached files. We record your IP address temporarily to rate-limit repeated verification-code requests. If you enable notifications we store your device token to deliver them. We do not collect your location and use no advertising trackers.",
        },
        {
          heading: "2. How We Use Your Data",
          body: "Only to run the service: showing your tasks and projects, delivering your messages, sending your notifications, and protecting the account from abuse. We do not sell your data, do not use it for advertising, and do not train any AI model on it.",
        },
        {
          heading: "3. Legal Basis",
          body: "We process your phone number and content to perform our contract with you — providing the service you asked for. Optional things such as notifications and contact matching rely on your explicit consent, which you can withdraw at any time.",
        },
        {
          heading: "4. Encryption and Data Protection",
          body: "In transit: all communication with our servers uses TLS 1.2 or newer. At rest: your phone number, your message text, and your note titles and contents are encrypted at the field level with AES-256-GCM, so anyone with direct database access cannot read their real values without a separate encryption key. For transparency: task and project titles and descriptions are not field-encrypted, and are protected by access controls and the hosting provider's disk encryption. We claim no security certification, and we do not operate a round-the-clock monitoring team.",
        },
        {
          heading: "5. Data Sharing",
          body: "We do not sell your data or share it for marketing. Sharing is limited to: infrastructure providers we rely on to run the service (hosting, SMS delivery, push notifications), only as far as needed; a lawful request from a competent authority; or your explicit consent.",
        },
        {
          heading: "6. Contacts",
          body: "If you choose to find colleagues from your contacts, the numbers are converted on your device into SHA-256 hashes before being sent, and we match those to see who is already registered. The actual numbers from your address book are never sent to or stored on our servers, and we do not keep the hashes after matching.",
        },
        {
          heading: "7. Notifications",
          body: "We send notifications only about your tasks, projects and messages. You can control each type from Profile - Notifications, and turn them off entirely in your device settings.",
        },
        {
          heading: "8. Staff Access and the Audit Log",
          body: "Our team's access to user content is limited to moderation and support — when there is a report or a technical problem. Every view of an account, task or project detail is automatically written to an audit log recording who looked and when, and that log cannot be deleted from within the admin console.",
        },
        {
          heading: "9. Retention and Account Deletion",
          body: "We keep your data for as long as your account exists. When you delete your account from inside the app we anonymise you immediately: name, photo and phone number are replaced with anonymous values, sessions are revoked, and the account is permanently disabled. We cannot erase records entangled with other users (a message you sent someone, or a task a team shares), because deleting those would affect their data — but they are no longer attributed to you by name or number.",
        },
        {
          heading: "10. Your Rights",
          body: "You have the right to access, correct, delete and object to the processing of your data. Correction and deletion are available directly in the app. To obtain a copy of your data, or for any other request, write to support@taskupapp.net and we will respond within thirty days. There is no self-service export tool in the app today.",
        },
        {
          heading: "11. Storage on Your Device",
          body: "The app uses local storage only to keep your session and your chosen language. We use no advertising cookies and share no identifier with any ad network.",
        },
        {
          heading: "12. Children's Privacy",
          body: "TaskUp is not intended for anyone under 18 and we do not knowingly collect their data. If we learn that a child has registered, we delete the account immediately. If you are a parent and believe your child has registered, contact us and we will act at once.",
        },
        {
          heading: "13. Changes to This Policy",
          body: "We may update this policy. We will notify you in the app fourteen days before any material change takes effect.",
        },
        {
          heading: "14. Contact Us",
          body: "For any privacy question: support@taskupapp.net — Address: Riyadh, Saudi Arabia.",
        },
      ],
    },
    navHome: 'Home',
    navProjects: 'Projects',
    navNotif: 'Alerts',
    navProfile: 'Profile',
    navChats: 'Chats',

    // Conversations
    chatsTitle: 'Messages',
    noChats: 'No conversations yet',
    noChatsHint: 'Start a conversation with a teammate',
    typeMessage: 'Type a message...',
    linkToTask: 'Link to task',
    linkedTask: 'Linked to task',
    suggestLink: 'Did you mean task',
    linkBtn: 'Link',
    skipLink: 'Dismiss',
    taskLinked: 'Task linked ✓',
    today2: 'Today',
    yesterday: 'Yesterday',
    online: 'Online',
    offline: 'Last seen an hour ago',

    // Notes
    navNotes: 'Notes',
    notesTitle: 'Notes',
    newNote: 'New note',
    untitledNote: 'Untitled note',
    notePlaceholderTitle: 'Title',
    notePlaceholderContent: 'Start writing...',
    allNotes: 'All notes',
    pinned: 'Pinned',
    trash: 'Trash',
    searchNotes: 'Search notes...',
    noNotes: 'No notes',
    noNotesHint: 'Create your first note to get started',
    noNotesInTrash: 'Trash is empty',
    trashHint: 'Notes are permanently deleted 30 days after being moved here',
    pin: 'Pin',
    unpin: 'Unpin',
    deleteNote: 'Delete',
    restoreNote: 'Restore',
    saving: 'Saving...',
    savedNote: 'Saved',
    linkedToTaskLabel: 'Linked to task',
    selectNotePrompt: 'Select a note to view it, or create a new one',
    deleteNoteConfirm: 'Move this note to Trash?',
    backToList: 'Back',
  },
}
