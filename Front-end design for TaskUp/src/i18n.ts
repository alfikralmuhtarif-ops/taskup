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
    aiSuggestion: '✨ اقتراح ذكي',
    aiSuggestionText: 'يبدو أن الموعد قريب ولا تزال المهمة بانتظار الاعتماد النهائي.',
    addAction: 'إضافة إجراء',
    dismiss: 'تجاهل',
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
    aiSummaryLabel: '✨ ملخص ذكي',
    aiSummaryText: 'تمت مراجعة العقد وتحديث البنود المالية. النسخة الحالية جاهزة للاعتماد، ولا تزال المهمة بانتظار موافقة المدير.',
    riskLabel: '⚠️ يحتاج انتباه',
    riskText: 'الموعد غداً ولم يتم اعتماد النسخة النهائية بعد.',
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
          heading: '1. القبول والموافقة',
          body: 'يُعدّ استخدامك لتطبيق TaskUp قبولاً صريحاً لهذه الشروط والأحكام. إذا كنت لا توافق على أي من هذه الشروط، يُرجى التوقف عن استخدام التطبيق فوراً. يحق لنا تعديل هذه الشروط في أي وقت، وسيتم إخطارك بأي تغييرات جوهرية.',
        },
        {
          heading: '2. وصف الخدمة',
          body: 'TaskUp هو تطبيق لإدارة المهام والفرق، يتيح للمستخدمين إنشاء المهام وتعيينها ومتابعتها وإكمالها. الخدمة الأساسية مجانية، وتتوفر ميزات إضافية ضمن اشتراك Task AI المدفوع.',
        },
        {
          heading: '3. حساب المستخدم',
          body: 'أنت مسؤول عن الحفاظ على سرية بيانات حسابك. يجب أن تكون بالغاً (18 سنة أو أكثر) أو تحت إشراف ولي الأمر. يُحظر إنشاء حسابات وهمية أو انتحال هوية أشخاص آخرين. نحتفظ بالحق في تعليق أو إلغاء أي حساب يُخالف هذه الشروط.',
        },
        {
          heading: '4. الاستخدام المقبول',
          body: 'يُلتزم المستخدم باستخدام التطبيق للأغراض المشروعة حصراً. يُحظر استخدام TaskUp لنشر محتوى مسيء أو مضلل أو غير قانوني، أو إرسال بريد عشوائي أو محاولة اختراق أنظمتنا أو أنظمة مستخدمين آخرين.',
        },
        {
          heading: '5. الملكية الفكرية',
          body: 'جميع حقوق الملكية الفكرية المتعلقة بتطبيق TaskUp، بما فيها الاسم والشعار والتصميم والبرمجيات، محفوظة لشركة TaskUp. لا يُمنح المستخدم سوى رخصة استخدام محدودة وغير حصرية وغير قابلة للتحويل.',
        },
        {
          heading: '6. المحتوى الذي ترفعه',
          body: 'تحتفظ بملكية كامل المحتوى الذي ترفعه أو تنشره عبر TaskUp. بالرفع، تمنحنا رخصة غير حصرية لعرض هذا المحتوى وتخزينه بما يكفي لتقديم الخدمة. لن نستخدم محتواك لأي غرض تسويقي دون موافقتك الصريحة.',
        },
        {
          heading: '7. الأمان والبيانات',
          body: 'نلتزم باتخاذ تدابير أمنية معقولة لحماية بياناتك. غير أننا لا نضمن أماناً مطلقاً لأي نظام رقمي. يُنصح بعدم مشاركة معلومات بالغة الحساسية عبر أي تطبيق رقمي.',
        },
        {
          heading: '8. إيقاف الخدمة',
          body: 'نحتفظ بالحق في إيقاف الخدمة أو تعديلها في أي وقت مع الإخطار المسبق قدر الإمكان. في حال إيقاف الخدمة نهائياً، ستُتاح لك فرصة تصدير بياناتك قبل ثلاثين (30) يوماً من الإغلاق.',
        },
        {
          heading: '9. حدود المسؤولية',
          body: 'لا تتحمل TaskUp المسؤولية عن أي خسائر غير مباشرة أو أضرار تنجم عن استخدام التطبيق أو عدم القدرة على الوصول إليه. الحد الأقصى لمسؤوليتنا لا يتجاوز ما دفعته من رسوم اشتراك خلال الثلاثة أشهر الماضية.',
        },
        {
          heading: '10. القانون المطبّق',
          body: 'تخضع هذه الشروط وتُفسَّر وفقاً لأنظمة المملكة العربية السعودية. أي نزاع يُحال إلى المحاكم السعودية المختصة أو يُسوَّى بالتحكيم وفقاً لما يتفق عليه الطرفان.',
        },
        {
          heading: '11. التواصل معنا',
          body: 'لأي استفسار بشأن هذه الشروط، تواصل معنا عبر: support@taskupapp.net',
        },
      ],
    },

    privacy: {
      title: 'سياسة الخصوصية',
      intro: 'نحن في TaskUp نأخذ خصوصيتك على محمل الجد. توضح هذه السياسة كيفية جمع بياناتك واستخدامها وحمايتها ومشاركتها.',
      sections: [
        {
          heading: '1. البيانات التي نجمعها',
          body: 'نجمع البيانات التي تقدمها مباشرةً عند التسجيل (الاسم، رقم الجوال، الصورة الشخصية)، وبيانات الاستخدام مثل المهام والتحديثات والملفات التي ترفعها، وبيانات الجهاز كنوعه ونظام تشغيله وعنوان IP.',
        },
        {
          heading: '2. كيف نستخدم بياناتك',
          body: 'نستخدم بياناتك لتشغيل الخدمة وتحسينها، وإرسال الإشعارات المتعلقة بمهامك، وتقديم دعم العملاء، وتحليل الاستخدام لتطوير التطبيق. لن نبيع بياناتك لأطراف ثالثة بأي شكل من الأشكال.',
        },
        {
          heading: '3. مشاركة البيانات',
          body: 'لا نشارك بياناتك الشخصية مع أطراف ثالثة إلا في هذه الحالات: مزودو الخدمات الذين يساعدوننا في تشغيل التطبيق (مع إلزامهم بالسرية)، أو بموجب أمر قضائي أو متطلبات قانونية، أو بموافقتك الصريحة.',
        },
        {
          heading: '4. الأمان وحماية البيانات',
          body: 'نستخدم تشفير TLS لحماية البيانات أثناء النقل، وتشفير AES-256 للبيانات المخزنة. نجري تقييمات أمنية دورية ونلتزم بمعايير ISO 27001. فريق الأمان لدينا يعمل على مدار الساعة لرصد أي تهديدات.',
        },
        {
          heading: '5. جهات الاتصال',
          body: 'إذا منحتنا إذن الوصول إلى جهات الاتصال، نستخدم هذه البيانات فقط لمساعدتك في إيجاد زملائك على TaskUp. لا نخزن قائمة جهات اتصالك على خوادمنا ولا نشاركها مع أي طرف.',
        },
        {
          heading: '6. الإشعارات',
          body: 'نرسل إشعارات تتعلق بالمهام المعيّنة لك والتحديثات والمواعيد والمنشنات فقط. يمكنك التحكم الكامل في إعدادات الإشعارات من داخل التطبيق أو من إعدادات جهازك في أي وقت.',
        },
        {
          heading: '7. الاحتفاظ بالبيانات',
          body: 'نحتفظ ببياناتك طالما حسابك نشط. عند حذف حسابك، يتم مسح بياناتك الشخصية خلال 30 يوماً، مع الاحتفاظ ببعض البيانات المطلوبة قانونياً لمدة لا تتجاوز ما تقتضيه الأنظمة.',
        },
        {
          heading: '8. حقوقك',
          body: 'يحق لك الوصول إلى بياناتك، وتصحيحها، وحذفها، وتصديرها في أي وقت. يمكنك أيضاً الاعتراض على معالجة بعض البيانات أو طلب تقييدها. للاستفادة من هذه الحقوق تواصل معنا عبر support@taskupapp.net',
        },
        {
          heading: '9. ملفات تعريف الارتباط',
          body: 'يستخدم تطبيقنا بيانات تخزين محلي (Local Storage) فقط لتذكر تفضيلاتك مثل اللغة المختارة والجلسة. لا نستخدم ملفات تعريف ارتباط للتتبع الإعلاني.',
        },
        {
          heading: '10. خصوصية الأطفال',
          body: 'TaskUp غير مخصص للأطفال دون سن 18 عاماً. إذا علمنا بجمع بيانات طفل دون سن القانونية، سنحذفها فوراً. إذا كنت ولي أمر وتعتقد أن طفلك سجّل حساباً، تواصل معنا على الفور.',
        },
        {
          heading: '11. التغييرات على هذه السياسة',
          body: 'قد نعدّل هذه السياسة من وقت لآخر. سنُخطرك بأي تغييرات جوهرية عبر إشعار داخل التطبيق أو رسالة نصية قبل 14 يوماً من سريان التغيير.',
        },
        {
          heading: '12. تواصل معنا',
          body: 'لأي استفسار متعلق بخصوصيتك: support@taskupapp.net | العنوان: الرياض، المملكة العربية السعودية',
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
    aiSuggestion: '✨ Smart suggestion',
    aiSuggestionText: 'The deadline is approaching and the task is still awaiting final approval.',
    addAction: 'Add action',
    dismiss: 'Dismiss',
    composerPlaceholder: 'Write an update...',

    taskReport: 'Task Report',
    progress: 'Progress',
    lastUpdate: 'Last update',
    updateCount: 'Updates',
    agoMinutes: '20 minutes ago',
    completed: 'Completed',
    remaining: 'Remaining',
    lastActivity: 'Last activity',
    aiSummaryLabel: '✨ AI Summary',
    aiSummaryText: 'The contract has been reviewed and financial terms updated. The current version is ready for approval, and the task is awaiting manager sign-off.',
    riskLabel: '⚠️ Needs attention',
    riskText: "The deadline is tomorrow and the final version hasn't been approved yet.",
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
          heading: '1. Acceptance',
          body: 'Your use of TaskUp constitutes explicit acceptance of these Terms. If you do not agree to any of these terms, please stop using the application immediately. We reserve the right to modify these Terms at any time, and you will be notified of any material changes.',
        },
        {
          heading: '2. Description of Service',
          body: 'TaskUp is a task and team management application that allows users to create, assign, track, and complete tasks. The core service is free, with additional features available under a paid Task AI subscription.',
        },
        {
          heading: '3. User Account',
          body: 'You are responsible for maintaining the confidentiality of your account credentials. You must be an adult (18 or older) or under parental supervision. Creating fake accounts or impersonating others is prohibited. We reserve the right to suspend or terminate any account that violates these Terms.',
        },
        {
          heading: '4. Acceptable Use',
          body: 'You agree to use the application for lawful purposes only. It is prohibited to use TaskUp to post offensive, misleading, or illegal content, send spam, or attempt to breach our systems or those of other users.',
        },
        {
          heading: '5. Intellectual Property',
          body: 'All intellectual property rights related to TaskUp — including the name, logo, design, and software — are owned by TaskUp. Users are granted only a limited, non-exclusive, non-transferable license to use the application.',
        },
        {
          heading: '6. Your Content',
          body: 'You retain ownership of all content you upload or post through TaskUp. By uploading, you grant us a non-exclusive license to display and store that content as necessary to provide the service. We will not use your content for marketing without your explicit consent.',
        },
        {
          heading: '7. Security & Data',
          body: 'We take reasonable security measures to protect your data. However, we cannot guarantee absolute security for any digital system. We advise against sharing highly sensitive information through any digital application.',
        },
        {
          heading: '8. Service Termination',
          body: 'We reserve the right to discontinue or modify the service at any time with prior notice where possible. In the event of permanent shutdown, you will have the opportunity to export your data 30 days before closure.',
        },
        {
          heading: '9. Limitation of Liability',
          body: 'TaskUp is not liable for any indirect losses or damages resulting from use of the application or inability to access it. Our maximum liability shall not exceed the subscription fees paid by you in the last three months.',
        },
        {
          heading: '10. Governing Law',
          body: 'These Terms are governed by and construed in accordance with the laws of the Kingdom of Saudi Arabia. Any dispute shall be referred to the competent Saudi courts or resolved by arbitration as agreed by both parties.',
        },
        {
          heading: '11. Contact Us',
          body: 'For any questions regarding these Terms, contact us at: support@taskupapp.net',
        },
      ],
    },

    privacy: {
      title: 'Privacy Policy',
      intro: 'At TaskUp, we take your privacy seriously. This policy explains how we collect, use, protect, and share your data.',
      sections: [
        {
          heading: '1. Data We Collect',
          body: 'We collect data you provide directly at registration (name, phone number, profile photo), usage data such as tasks, updates, and files you upload, and device data such as device type, operating system, and IP address.',
        },
        {
          heading: '2. How We Use Your Data',
          body: 'We use your data to operate and improve the service, send task-related notifications, provide customer support, and analyze usage to develop the application. We will never sell your data to third parties under any circumstances.',
        },
        {
          heading: '3. Data Sharing',
          body: 'We do not share your personal data with third parties except in these cases: service providers who help us operate the app (bound by confidentiality), or under a court order or legal requirement, or with your explicit consent.',
        },
        {
          heading: '4. Security',
          body: 'We use TLS encryption to protect data in transit and AES-256 encryption for stored data. We conduct regular security assessments and comply with ISO 27001 standards. Our security team operates around the clock to monitor threats.',
        },
        {
          heading: '5. Contacts',
          body: 'If you grant us access to your contacts, we use this data only to help you find your colleagues on TaskUp. We do not store your contact list on our servers or share it with any third party.',
        },
        {
          heading: '6. Notifications',
          body: 'We send notifications related only to tasks assigned to you, updates, deadlines, and mentions. You have full control over notification settings within the app or your device settings at any time.',
        },
        {
          heading: '7. Data Retention',
          body: 'We retain your data for as long as your account is active. Upon account deletion, your personal data is erased within 30 days, with some legally required data retained for no longer than applicable regulations require.',
        },
        {
          heading: '8. Your Rights',
          body: 'You have the right to access, correct, delete, and export your data at any time. You may also object to or request restriction of certain data processing. To exercise these rights, contact us at support@taskupapp.net',
        },
        {
          heading: '9. Cookies & Storage',
          body: 'Our application uses local storage only to remember your preferences such as language and session. We do not use tracking or advertising cookies.',
        },
        {
          heading: '10. Children\'s Privacy',
          body: 'TaskUp is not intended for children under 18. If we become aware of data collected from an underage user, we will delete it immediately. If you are a parent who believes your child registered an account, contact us at once.',
        },
        {
          heading: '11. Policy Changes',
          body: 'We may update this policy from time to time. We will notify you of any material changes via an in-app notice or text message at least 14 days before the change takes effect.',
        },
        {
          heading: '12. Contact Us',
          body: 'For any privacy-related inquiries: support@taskupapp.net | Address: Riyadh, Saudi Arabia',
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
