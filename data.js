/* ============================================================
   POG'ONA — Barcha ma'lumotlar bazasi (data.js)
   Muhammadamin tomonidan, 2026
   ============================================================ */

/* ============ DARAJA MA'LUMOTLARI ============ */
const LEVELS = ["A1","A2","B1","B2","C1","C2"];

const LEVEL_INFO = {
  "Pre-A1": {
    name: "Boshlang'ichdan past",
    emoji: "🌱",
    desc: "Hali alifbodan boshlashingiz kerak. Xafa bo'lmang — har bir professional bir vaqtlar noldan boshlagan!",
    tips: [
      "Alifbo va tovushlarni o'rganing (Phonics)",
      "Kuniga 10 ta yangi so'z yodlang",
      "Duolingo ilovasidan boshlang",
      "Oddiy inglizcha qo'shiqlar tinglang"
    ],
    next: "A1"
  },
  "A1": {
    name: "Beginner",
    emoji: "🐣",
    desc: "Oddiy jumlalarni tushunasiz va o'zingizni tanishtira olasiz. Endi asosiy poydevorni mustahkamlash vaqti.",
    tips: [
      "Kuniga 15 daqiqa mashq qiling",
      "Eng ko'p ishlatiladigan 500 so'zni yodlang",
      "to be, to have, Present Simple fe'llarini o'rganing",
      "Oddiy dialoglarni takrorlang"
    ],
    next: "A2"
  },
  "A2": {
    name: "Elementary",
    emoji: "🐥",
    desc: "Kundalik muloqotga yetarli. Endi zamonlar, savol tuzish va o'qishni mashq qilish vaqti.",
    tips: [
      "Past Simple, Future, Present Continuous zamonlarini o'rganing",
      "Qisqa hikoyalar o'qing (200-300 so'z)",
      "Podkastlarni sekin tezlikda tinglang",
      "Kuniga 20 daqiqa gapirishni mashq qiling"
    ],
    next: "B1"
  },
  "B1": {
    name: "Intermediate",
    emoji: "🦅",
    desc: "Mustaqil gaplashasiz, sayohat qila olasiz. Endi murakkabroq grammatika va tinglash vaqti.",
    tips: [
      "Present Perfect, Passive, shart gaplarni o'rganing",
      "Podkastlarni tabiiy tezlikda tinglang",
      "Kitob o'qing (B1 darajali, 400-600 so'z)",
      "Yozma mashqlar qiling — kunlik 5 jumla"
    ],
    next: "B2"
  },
  "B2": {
    name: "Upper-Intermediate",
    emoji: "🦁",
    desc: "Erkin va tushunarli gaplashasiz. IELTS 5.5–6.5 darajasidasiz. Endi nozik jihatlarni o'rganish vaqti.",
    tips: [
      "Idiomalar va frazal fe'llarni o'rganing",
      "Rasmiy va norasmiy yozuvni farqlang",
      "Filmlarni subtitrsiz ko'ring",
      "IELTS yoki TOEFL ga tayyorlaning"
    ],
    next: "C1"
  },
  "C1": {
    name: "Advanced",
    emoji: "🦉",
    desc: "Murakkab matnlarni tushunasiz, akademik muhitda ishlay olasiz. IELTS 7–8 darajasi.",
    tips: [
      "Inversiya va nozik grammatikani o'rganing",
      "Akademik maqolalar yozing",
      "Adabiyot va klassik matnlarni o'qing",
      "Professional sohalarda ingliz tilida ishlang"
    ],
    next: "C2"
  },
  "C2": {
    name: "Proficient",
    emoji: "👑",
    desc: "Ona tili egasiga yaqin daraja. Nozik uslub, adabiyot va professional tarjimaga e'tibor bering.",
    tips: [
      "Adabiyotni asl tilida o'qing",
      "She'riyat va drama bilan ishlang",
      "Tarjima ko'nikmalarini rivojlantiring",
      "Akademik va ilmiy maqolalar yozing"
    ],
    next: null
  }
};

/* ============ DARAJA SAVOLLARI (48 ta) ============ */
/* Har daraja uchun 8 tadan */
const RAW = [
  /* ============ A1 ============ */
  ["She ___ a student.", ["am","is","are","be"], 1],
  ["I ___ coffee every morning.", ["drink","drinks","drinking","drank"], 0],
  ["This is ___ apple.", ["a","an","two","some"], 1],
  ["___ are my keys?", ["What","Where","Who","When"], 1],
  ["There ___ two books on the desk.", ["is","are","am","be"], 1],
  ["My name ___ Aziz.", ["am","is","are","be"], 1],
  ["I ___ from Uzbekistan.", ["am","is","are","be"], 0],
  ["She ___ two brothers.", ["have","has","having","haves"], 1],

  /* ============ A2 ============ */
  ["Yesterday we ___ to the market.", ["go","goes","went","gone"], 2],
  ["He is ___ than his brother.", ["tall","taller","tallest","more tall"], 1],
  ["I ___ TV when you called.", ["watch","was watching","watched","am watching"], 1],
  ["We don't have ___ milk left.", ["some","any","a","many"], 1],
  ["I'm going to ___ my grandparents.", ["visit","visiting","visited","visits"], 0],
  ["She ___ her homework already.", ["finish","finishes","has finished","finishing"], 2],
  ["This book is ___ than that one.", ["interesting","more interesting","most interesting","interestinger"], 1],
  ["I've lived here ___ two years.", ["since","for","from","during"], 1],

  /* ============ B1 ============ */
  ["If it rains tomorrow, we ___ at home.", ["stay","will stay","would stay","stayed"], 1],
  ["I have lived here ___ 2019.", ["for","since","from","during"], 1],
  ["The report ___ by the manager yesterday.", ["wrote","was written","is writing","has wrote"], 1],
  ["She asked me where ___.", ["I lived","did I live","do I live","I do live"], 0],
  ["You ___ smoke here. It's forbidden.", ["mustn't","don't have to","needn't","may"], 0],
  ["He's been working here ___ 2015.", ["since","for","from","during"], 0],
  ["I wish I ___ more time yesterday.", ["have","had","would have","will have"], 1],
  ["The book ___ I read was amazing.", ["who","which","whose","what"], 1],

  /* ============ B2 ============ */
  ["If I ___ more time, I would learn another language.", ["have","had","would have","will have"], 1],
  ["By the time we arrived, the film ___.", ["already started","had already started","has already started","was starting"], 1],
  ["He suggested ___ a taxi to the airport.", ["to take","taking","take","took"], 1],
  ["I wish I ___ speak French fluently.", ["can","could","would","will"], 1],
  ["The new policy, ___ was announced last week, caused debate.", ["who","whose","which","what"], 2],
  ["She's used to ___ up early.", ["get","getting","got","gets"], 1],
  ["Not until later ___ the truth.", ["I realized","did I realize","I did realize","realized I"], 1],
  ["It's the first time I ___ such a thing.", ["see","saw","have seen","had seen"], 2],

  /* ============ C1 ============ */
  ["Had I known about the delay, I ___ earlier.", ["would leave","would have left","had left","will have left"], 1],
  ["She is known for her ___ attention to detail.", ["meticulous","meticulously","meticulosity","meticule"], 0],
  ["Not only ___ the exam, but she also got the top score.", ["she passed","did she pass","she did pass","passed she"], 1],
  ["It's high time the government ___ action on climate change.", ["takes","took","will take","has taken"], 1],
  ["The film received ___ reviews, with critics divided.", ["mixed","blended","combined","scattered"], 0],
  ["Little ___ that he was being watched.", ["he knew","did he know","he did know","knew he"], 1],
  ["She would rather ___ at home tonight.", ["stay","to stay","staying","stayed"], 0],
  ["___ his help, we would have failed.", ["But for","Except for","Besides","Apart from"], 0],

  /* ============ C2 ============ */
  ["Hardly ___ the building when the alarm went off.", ["he had entered","had he entered","did he enter","he entered"], 1],
  ["Her argument, though eloquent, was ultimately ___.", ["specious","spacious","precious","auspicious"], 0],
  ["The minister's statement was deliberately ___.", ["equivocal","equitable","equable","equestrian"], 0],
  ["Were it not for her intervention, the project ___ collapsed.", ["would have","will have","had","would"], 0],
  ["The two theories are not mutually exclusive; they are ___.", ["complementary","complimentary","complemental","compliant"], 0],
  ["His ___ demeanor belied a fierce ambition.", ["unassuming","unassumed","assuming","assumed"], 0],
  ["The proposal was met with ___ silence.", ["stony","stone","stoned","stoning"], 0],
  ["She has an ___ memory for names.", ["unerring","unerred","erring","erred"], 0]
];

/* ============ LUG'AT (60 so'z) ============ */
const VOCAB = [
  ["borrow","qarz olmoq"],
  ["lend","qarz bermoq"],
  ["reliable","ishonchli"],
  ["achieve","erishmoq"],
  ["huge","ulkan"],
  ["improve","yaxshilamoq"],
  ["schedule","jadval"],
  ["ancient","qadimiy"],
  ["employer","ish beruvchi"],
  ["employee","xodim"],
  ["neighbor","qo'shni"],
  ["delay","kechikish"],
  ["deadline","oxirgi muddat"],
  ["environment","atrof-muhit"],
  ["knowledge","bilim"],
  ["journey","sayohat"],
  ["careful","ehtiyotkor"],
  ["weather","ob-havo"],
  ["skill","ko'nikma"],
  ["opportunity","imkoniyat"],
  ["challenge","qiyinchilik"],
  ["success","muvaffaqiyat"],
  ["failure","muvaffaqiyatsizlik"],
  ["decision","qaror"],
  ["advice","maslahat"],
  ["opinion","fikr"],
  ["reason","sabab"],
  ["purpose","maqsad"],
  ["result","natija"],
  ["method","usul"],
  ["quality","sifat"],
  ["quantity","miqdor"],
  ["increase","oshmoq"],
  ["decrease","kamaymoq"],
  ["compare","taqqoslamoq"],
  ["describe","ta'riflamoq"],
  ["explain","tushuntirmoq"],
  ["suggest","taklif qilmoq"],
  ["recommend","tavsiya qilmoq"],
  ["consider","hisobga olmoq"],
  ["develop","rivojlantirmoq"],
  ["manage","boshqarmoq"],
  ["support","qo'llab-quvvatlamoq"],
  ["prevent","oldini olmoq"],
  ["avoid","chetlab o'tmoq"],
  ["allow","ruxsat bermoq"],
  ["require","talab qilmoq"],
  ["provide","ta'minlamoq"],
  ["receive","qabul qilmoq"],
  ["deliver","yetkazmoq"],
  ["establish","o'rnatmoq"],
  ["maintain","saqlab turmoq"],
  ["reduce","kamaytirmoq"],
  ["expand","kengaytirmoq"],
  ["protect","himoya qilmoq"],
  ["destroy","yo'q qilmoq"],
  ["create","yaratmoq"],
  ["replace","almashtirmoq"],
  ["recognize","tanimoq"],
  ["imagine","tasavvur qilmoq"]
];

/* ============ GRAMMATIKA (25 izohli savol) ============ */
const GRAMMAR = [
  ["She ___ to school every day.", ["goes","go","going","gone"], 0, "he/she/it dan keyin fe'lga -s qo'shiladi."],
  ["I have ___ finished my homework.", ["already","ago","tomorrow","since"], 0, "already Present Perfect bilan ishlatiladi."],
  ["There isn't ___ water in the bottle.", ["some","any","a","an"], 1, "Inkor gapda any ishlatiladi."],
  ["They ___ football when it started to rain.", ["played","were playing","play","have played"], 1, "Uzilgan davomiy harakat: Past Continuous."],
  ["This is the ___ book I've ever read.", ["best","better","good","most good"], 0, "good ning orttirma darajasi: the best."],
  ["If I ___ you, I would apologize.", ["am","was","were","be"], 2, "Second Conditional: if I were you."],
  ["She enjoys ___ novels.", ["read","to read","reading","reads"], 2, "enjoy dan keyin -ing shakli keladi."],
  ["The window ___ by someone last night.", ["broke","was broken","is broken","has broke"], 1, "Passive o'tgan zamon: was/were + V3."],
  ["He doesn't ___ spicy food.", ["likes","like","liking","liked"], 1, "doesn't dan keyin fe'l o'zgarmaydi."],
  ["I'll call you as soon as I ___ home.", ["get","will get","got","am getting"], 0, "as soon as dan keyin Present Simple."],
  ["By next year, I ___ here for five years.", ["will work","will have worked","work","worked"], 1, "Future Perfect: will have + V3."],
  ["She made me ___ for hours.", ["wait","to wait","waiting","waited"], 0, "make + object + bare infinitive."],
  ["I'd rather ___ now.", ["leave","to leave","leaving","left"], 0, "would rather + bare infinitive."],
  ["It's worth ___ this book.", ["read","to read","reading","reads"], 2, "worth + -ing."],
  ["He denied ___ the money.", ["steal","to steal","stealing","stole"], 2, "deny + -ing."],
  ["I'm looking forward to ___ you.", ["see","seeing","saw","seen"], 1, "look forward to + -ing."],
  ["Neither John ___ Mary came.", ["or","nor","and","but"], 1, "neither ... nor."],
  ["The more you practice, ___ you become.", ["the better","better","the best","best"], 0, "the more ... the better."],
  ["She's the woman ___ car was stolen.", ["who","which","whose","that"], 2, "whose — egalik."],
  ["Only after the meeting ___ the news.", ["he heard","did he hear","he did hear","heard he"], 1, "Only after + inversion."],
  ["I wish I ___ studied harder.", ["have","had","would","will"], 1, "wish + Past Perfect — o'tmishga afsus."],
  ["He's said ___ leaving soon.", ["to be","be","being","been"], 0, "Passive infinitive: to be + V3."],
  ["___ having little money, he was happy.", ["Despite","Although","However","Because"], 0, "Despite + noun/-ing."],
  ["Hardly had I arrived ___ it started raining.", ["than","when","that","then"], 1, "Hardly ... when."],
  ["The house ___ we stayed was old.", ["which","where","that","who"], 1, "where — joy."]
];

/* ============ O'QISH MATNLARI (4 ta) ============ */
const READINGS = [
  {
    title: "Tom's Day",
    text: "Tom wakes up at six every morning. He runs in the park for thirty minutes, then has breakfast with his sister. He works at a bookshop, and he loves it because he can read new books for free. On weekends, he visits his grandmother in the countryside.",
    q: [
      ["What does Tom do after he wakes up?", ["He runs in the park","He goes to work","He reads books","He visits his sister"], 0],
      ["Why does Tom love his job?", ["It pays well","He can read new books for free","It is close to home","He works with his sister"], 1],
      ["Where does his grandmother live?", ["In the city","In a bookshop","In the countryside","In the park"], 2],
      ["When does Tom visit his grandmother?", ["Every morning","On weekdays","Every evening","On weekends"], 3]
    ]
  },
  {
    title: "Learning Languages",
    text: "Learning a new language takes time and patience. Many experts suggest studying for just fifteen minutes every day rather than three hours once a week. Consistency matters more than intensity. Reading simple books, listening to podcasts, and speaking with native speakers are all effective methods. The key is to make the process enjoyable so you keep going.",
    q: [
      ["What do experts suggest?", ["Studying 3 hours weekly","Studying 15 minutes daily","Studying only weekends","Not studying"], 1],
      ["What matters more?", ["Intensity","Consistency","Speed","Money"], 1],
      ["Which is NOT mentioned?", ["Reading books","Listening to podcasts","Speaking with natives","Watching TV"], 3],
      ["What is the key?", ["Studying hard","Making it enjoyable","Paying money","Being fast"], 1]
    ]
  },
  {
    title: "Remote Work",
    text: "Remote work has transformed the modern workplace. Employees save time on commuting and can design their own schedules. However, it also brings challenges: isolation, difficulty separating work from personal life, and the need for strong self-discipline. Companies are responding by offering hybrid models that combine office and home days.",
    q: [
      ["What benefit is mentioned?", ["Free food","No commuting","Higher salary","More meetings"], 1],
      ["Which is NOT a challenge?", ["Isolation","Work-life separation","Self-discipline","Higher salary"], 3],
      ["What are companies offering?", ["Only remote","Only office","Hybrid models","No work"], 2],
      ["What is the aim?", ["Reduce salary","Best of both worlds","Close offices","Fire employees"], 1]
    ]
  },
  {
    title: "Healthy Habits",
    text: "Research shows that small daily habits have a bigger impact on health than occasional intense workouts. Drinking enough water, walking for twenty minutes, and sleeping seven to eight hours are simple but powerful. Nutritionists recommend eating vegetables with every meal and avoiding sugary drinks. Consistency, not perfection, is what matters most.",
    q: [
      ["What has a bigger impact?", ["Occasional workouts","Small daily habits","Skipping meals","Sleeping less"], 1],
      ["How long should you walk?", ["5 minutes","20 minutes","2 hours","All day"], 1],
      ["What should you avoid?", ["Vegetables","Water","Sugary drinks","Sleep"], 2],
      ["What matters most?", ["Perfection","Consistency","Speed","Money"], 1]
    ]
  }
];

/* ============ TINGLASH (10 ta) ============ */
const LISTENING = [
  ["The weather tomorrow will be sunny with a slight chance of rain in the afternoon.", ["Sunny","Rainy","Snowy","Cloudy"], 0, "sunny — quyoshli."],
  ["I'd like to book a table for two at seven o'clock this evening.", ["Book a table","Order food","Pay bill","Call taxi"], 0, "book a table — stol band qilish."],
  ["Could you please send me the report by Friday afternoon?", ["Buy report","Send report","Read report","Write report"], 1, "send the report — hisobotni yuborish."],
  ["The meeting has been postponed until next Monday due to the storm.", ["Cancelled","Postponed","Started","Finished"], 1, "postponed — keyinga surildi."],
  ["Our flight departs at 6:45 AM from Terminal 2, Gate 14.", ["6:45 AM","7:45 AM","6:15 AM","14:00"], 0, "departs at 6:45 AM."],
  ["She has been working as a software engineer for over five years.", ["Doctor","Engineer","Teacher","Lawyer"], 1, "software engineer."],
  ["The museum is closed on Mondays but open every other day from 9 to 6.", ["Always open","Closed Mondays","Open only Mondays","Closed weekends"], 1, "closed on Mondays."],
  ["Please turn off your mobile phones during the presentation.", ["Turn on","Turn off","Charge","Buy"], 1, "turn off — o'chirish."],
  ["Could you give me a discount if I buy two items?", ["Yes","No","Maybe","Not sure"], 0, "discount — chegirma so'ralmoqda."],
  ["The train leaves from platform 3 in ten minutes.", ["Platform 1","Platform 2","Platform 3","Platform 4"], 2, "platform 3."]
];

/* ============ BOLALAR UCHUN (16 ta) ============ */
const KIDS = [
  ["🐱 What is this?", ["A cat","A dog","A bird","A fish"], 0],
  ["🍎 What is this?", ["A banana","An apple","An orange","A grape"], 1],
  ["🚗 What is this?", ["A bus","A bike","A car","A train"], 2],
  ["☀️ What is this?", ["The moon","A star","A cloud","The sun"], 3],
  ["How many legs does a dog have?", ["Two","Three","Four","Six"], 2],
  ["The sky is ___.", ["blue","red","green","pink"], 0],
  ["I ___ a boy.", ["is","am","are","be"], 1],
  ["What do you say in the morning?", ["Good night","Good morning","Goodbye","Sorry"], 1],
  ["1, 2, 3, ___, 5", ["six","four","seven","two"], 1],
  ["🐘 What is this?", ["A mouse","An elephant","A lion","A tiger"], 1],
  ["What color is grass?", ["Blue","Green","Red","Yellow"], 1],
  ["How many days in a week?", ["Five","Six","Seven","Eight"], 2],
  ["I have two ___.", ["hand","hands","handes","hand's"], 1],
  ["🐟 Where does a fish live?", ["In a tree","In water","On land","In the sky"], 1],
  ["What do you drink?", ["Water","Bread","Chair","Book"], 0],
  ["The opposite of 'big' is ___.", ["Tall","Small","Wide","Long"], 1]
];

/* ============ BIZNES (12 ta) ============ */
const BUSINESS = [
  ["Could you send me the ___ by Friday?", ["report","reporter","reporting","reported"], 0],
  ["We need to ___ a meeting to discuss the budget.", ["make","hold","do","play"], 1, "Meeting bilan hold fe'li ishlatiladi."],
  ["Please find the document ___ to this email.", ["attached","attaching","attach","attachment"], 0],
  ["I look forward to ___ from you.", ["hear","hearing","heard","be hearing"], 1, "look forward to dan keyin -ing keladi."],
  ["The deadline has been ___ until next Monday.", ["extended","extensed","extending","extend"], 0],
  ["Let's ___ the agenda before we start.", ["go over","go on","go out","go off"], 0, "go over — ko'rib chiqmoq."],
  ["Our profit ___ by 15% last year.", ["raised","rose","risen","rised"], 1, "rise — o'tgan zamoni rose."],
  ["We should ___ a follow-up meeting next week.", ["schedule","scheduling","scheduled","schedules"], 0],
  ["The client has requested a ___ of the contract.", ["revise","revision","revising","revised"], 1],
  ["Please ___ the attached invoice for your records.", ["retain","retrain","retaliate","retract"], 0],
  ["Our team is ___ to delivering high-quality results.", ["commit","committed","committing","commitment"], 1],
  ["The proposal was turned ___ due to budget constraints.", ["up","down","on","off"], 1, "turn down — rad etmoq."]
];

/* ============ FRAZAL FE'LLAR (15 ta) ============ */
const PHRASAL_VERBS = [
  ["I need to ___ my homework before dinner.", ["hand in","hand out","hand over","hand down"], 0, "hand in — topshirmoq."],
  ["The meeting was ___ until next week.", ["put off","put on","put up","put down"], 0, "put off — keyinga surmoq."],
  ["Can you ___ the word in the dictionary?", ["look up","look after","look for","look into"], 0, "look up — qidirib topmoq."],
  ["She ___ her mother very well.", ["takes after","takes off","takes up","takes in"], 0, "takes after — o'xshamoq."],
  ["We should ___ the problem carefully.", ["look into","look up","look out","look over"], 0, "look into — o'rganmoq."],
  ["Don't forget to ___ the lights before leaving.", ["turn off","turn on","turn up","turn down"], 0, "turn off — o'chirmoq."],
  ["He ___ smoking last year.", ["gave up","gave in","gave out","gave away"], 0, "gave up — tashlamoq."],
  ["I can't ___ what he means.", ["figure out","figure in","figure on","figure up"], 0, "figure out — tushunmoq."],
  ["The car ___ on the highway.", ["broke down","broke up","broke out","broke in"], 0, "broke down — buzildi."],
  ["We need to ___ this issue immediately.", ["deal with","deal in","deal out","deal up"], 0, "deal with — hal qilmoq."],
  ["She ___ the offer without hesitation.", ["turned down","turned up","turned on","turned off"], 0, "turned down — rad etdi."],
  ["Let's ___ the details later.", ["go over","go out","go on","go by"], 0, "go over — ko'rib chiqmoq."],
  ["He ___ a new hobby last month.", ["took up","took off","took in","took out"], 0, "took up — boshlamoq."],
  ["I'll ___ you ___ at the airport.", ["pick up","drop off","put on","take off"], 0, "pick up — olib ketmoq."],
  ["The event was ___ due to rain.", ["called off","called on","called up","called in"], 0, "called off — bekor qilindi."]
];

/* ============ YOZISH TOPSHIRIQLARI (8 ta) ============ */
const WRITING_TASKS = [
  { title: "Mening kunim", prompt: "Write about your daily routine in 3-5 sentences.", hint: "I wake up at 7. I have breakfast. I go to work..." },
  { title: "Kechagi kun", prompt: "Write about what you did yesterday in 3-5 sentences.", hint: "Yesterday I went to... I saw... I ate..." },
  { title: "Rejalar", prompt: "Write about your plans for next weekend in 3-5 sentences.", hint: "Next weekend I will... I'm going to..." },
  { title: "Fikringiz", prompt: "Do you prefer working from home or in an office? Why? (3-5 sentences)", hint: "I prefer... because... On the one hand..." },
  { title: "Sayohat", prompt: "Describe your dream vacation in 4-6 sentences.", hint: "I would like to visit... The weather would be..." },
  { title: "Taom", prompt: "Describe your favorite dish and how to make it in 4-6 sentences.", hint: "My favorite dish is... First, you need..." },
  { title: "Kitob", prompt: "Write about a book or movie that changed your thinking.", hint: "The book/movie is called... It made me realize..." },
  { title: "Kelajak", prompt: "Where do you see yourself in 5 years? Write 4-6 sentences.", hint: "In five years, I hope... I will probably..." }
];

/* ============ MASLAHATLAR ============ */
const TIPS = [
  { icon: "🎯", title: "Aniq maqsad qo'ying", text: "Kuniga 15 daqiqa — haftada 3 soatdan ko'ra foydaliroq. Kichik, doimiy qadamlar eng katta natija beradi." },
  { icon: "🔊", title: "Baland ovozda gapiring", text: "O'zingizga gapirib ko'ring. Ayniqsa yangi so'zlarni takrorlashda. Bu talaffuz va xotirani yaxshilaydi." },
  { icon: "📖", title: "Har kuni o'qing", text: "Boshlang'ich darajada 5 daqiqa, o'rta darajada 20 daqiqa. Kitob, maqola yoki yangiliklar bo'lishi mumkin." },
  { icon: "🎧", title: "Tinglashni mashq qiling", text: "Podkastlar, YouTube, musiqa — hammasi yordam beradi. Avval subtitr bilan, keyin subtitrsiz." },
  { icon: "✍️", title: "Yozma mashqlar", text: "Kuniga 3-5 jumla yozing. Xato qilishdan qo'rqmang — xatolar orqali o'rganasiz." },
  { icon: "🗣️", title: "Suhbatdosh toping", text: "Tandem, HelloTalk, yoki Telegram guruhlarida suhbatdosh toping. Tirik muloqot eng tez o'rgatadi." },
  { icon: "📱", title: "Telefoningizni inglizchaga o'zgartiring", text: "Kundalik interfeys ingliz tilida bo'lsa, beixtiyor o'rganasiz. Kichik o'zgarish, katta ta'sir." },
  { icon: "🔁", title: "Takrorlash — onasi", text: "Yangi so'zni 1, 3, 7 va 21-kuni takrorlang. Bu uzoq muddatli xotiraga o'tishning eng samarali usuli." },
  { icon: "🎬", title: "Filmlarni inglizcha ko'ring", text: "Avval o'zbek subtitr, keyin ingliz subtitr, keyin subtitrsiz. Bir xil filmni bir necha marta ko'rish mumkin." },
  { icon: "🏆", title: "O'zingizni mukofotlang", text: "Har hafta maqsadga erishganingizda o'zingizni mukofotlang. Bu motivatsiyani saqlashga yordam beradi." }
];

/* ============ YUTUQLAR (Achievements) ============ */
const ACHIEVEMENTS = [
  { id: "first", emoji: "🎉", title: "Birinchi qadam", desc: "Birinchi testni yakunlang" },
  { id: "streak3", emoji: "🔥", title: "3 kun ketma-ket", desc: "3 kun ketma-ket mashq qiling" },
  { id: "streak7", emoji: "💎", title: "Bir hafta", desc: "7 kun ketma-ket mashq qiling" },
  { id: "perfect", emoji: "🌟", title: "Mukammal", desc: "Bitta bo'limda 100% oling" },
  { id: "b2", emoji: "🦁", title: "B2 daraja", desc: "B2 yoki undan yuqori daraja oling" },
  { id: "c1", emoji: "🦉", title: "C1 daraja", desc: "C1 yoki C2 daraja oling" },
  { id: "grammar", emoji: "📘", title: "Grammatikachi", desc: "Grammatika bo'limini yakunlang" },
  { id: "reader", emoji: "📚", title: "Kitobxon", desc: "O'qish bo'limini yakunlang" },
  { id: "listener", emoji: "🎧", title: "Tinglovchi", desc: "Tinglash bo'limini yakunlang" },
  { id: "writer", emoji: "✍️", title: "Yozuvchi", desc: "Yozish mashqini bajaring" },
  { id: "vocab100", emoji: "🎓", title: "So'z boyligi", desc: "60 ta so'zni to'liq o'rganing" },
  { id: "allround", emoji: "🏆", title: "Hamma yoq", desc: "Barcha bo'limlarni sinab ko'ring" }
];

/* ============ MENYU ============ */
const MENU = [
  ["home","Bosh sahifa"],
  ["level","Daraja testi"],
  ["grammar","Grammatika"],
  ["vocab","Lug'at"],
    ["read","O'qish"],
  ["listen","Tinglash"],
  ["phrase","Frazal fe'llar"],
  ["kids","Bolalar"],
  ["biz","Biznes"],
  ["write","Yozish"],
  ["cards","Kartochkalar"],
  ["tips","Maslahatlar"],
  ["achv","Yutuqlar"],
  ["stats","Statistika"]
];

/* ============ BO'LIMLAR (Modes) ============ */
const MODES = [
  { key:"level",   icon:"🎯", cls:"blue",   title:"Daraja testi",      desc:"30 savol, A1 dan C2 gacha. Aniq darajangizni bilib oling.", tag:"Hamma uchun" },
  { key:"grammar", icon:"📘", cls:"purple", title:"Grammatika",        desc:"25 izohli mashq. Har javobdan keyin tushuntirish.",       tag:"Maktab va talabalar" },
  { key:"vocab",   icon:"📖", cls:"green",  title:"Lug'at",            desc:"60 so'z. O'zbekcha ma'nosini toping va yodlang.",         tag:"Yangi boshlovchilar" },
  { key:"read",    icon:"📚", cls:"orange", title:"O'qish",            desc:"4 xil matn. O'qib tushunishni mashq qiling.",             tag:"IELTS va imtihon" },
  { key:"listen",  icon:"🎧", cls:"pink",   title:"Tinglash",          desc:"Ovozli savollar. Eshitib tushunishni rivojlantiring.",    tag:"Barcha darajalar" },
  { key:"phrase",  icon:"🔗", cls:"yellow", title:"Frazal fe'llar",    desc:"15 ta eng ko'p ishlatiladigan frazal fe'l.",              tag:"O'rta daraja" },
  { key:"kids",    icon:"🧒", cls:"orange", title:"Bolalar uchun",     desc:"Rasmli va juda oson savollar. 6-12 yosh uchun.",          tag:"Bolalar" },
  { key:"biz",     icon:"💼", cls:"blue",   title:"Biznes ingliz tili",desc:"Ish xatlari va uchrashuv iboralari.",                     tag:"Xodimlar" },
  { key:"write",   icon:"✍️", cls:"purple", title:"Yozish mashqi",     desc:"Yozish ko'nikmasini rivojlantiring.",                     tag:"Barcha darajalar" },
  { key:"cards",   icon:"🃏", cls:"green",  title:"Kartochkalar",      desc:"60 so'zni aylantirib, o'yin tarzida yodlang.",            tag:"Hamma uchun" },
  { key:"tips",    icon:"💡", cls:"yellow", title:"Maslahatlar",       desc:"Ingliz tilini o'rganishning 10 ta oltin qoidasi.",        tag:"Hamma uchun" },
  { key:"achv",    icon:"🏆", cls:"pink",   title:"Yutuqlar",          desc:"12 ta yutuq. O'z yutuqlaringizni qo'lga kiriting.",       tag:"Motivatsiya" },
  { key:"stats",   icon:"📊", cls:"blue",   title:"Statistika",        desc:"Natijalaringiz va o'sishingizni kuzatib boring.",         tag:"Hamma uchun" }
];

/* ============ KUNLIK SO'Z ============ */
/* Har kuni bitta so'z — bu indekslar orqali tanlanadi */
const DAILY_WORDS = [
  ["serendipity", "tasodifan topilgan yaxshi narsa"],
  ["resilience", "qiyinchilikka chidamlilik"],
  ["eloquent", "notiq, ta'sirchan"],
  ["pragmatic", "amaliy, foydali"],
  ["ambiguous", "noaniq, ikki xil ma'noli"],
  ["meticulous", "juda sinchkov, ehtiyotkor"],
  ["pensive", "o'ychan, xayolchan"],
  ["ubiquitous", "hamma joyda uchraydigan"],
  ["tenacious", "qat'iyatli, qaysar"],
  ["candid", "ochiq, samimiy"],
  ["nuance", "nozik farq"],
  ["paradigm", "namuna, andoza"],
  ["empathy", "hamdardlik, his qilish"],
  ["diligent", "mehnatkash, tirishqoq"],
  ["versatile", "ko'p qirrali"],
  ["innovative", "innovatsion, yangilik qiluvchi"],
  ["articulate", "aniq va tushunarli ifoda qiluvchi"],
  ["profound", "chuqur, teran"],
  ["intricate", "murakkab, nozik"],
  ["notorious", "yomon nom chiqargan"]
];

/* ============ KUNLIK IBORALAR ============ */
const DAILY_PHRASES = [
  { en: "Break a leg!", uz: "Omad tilayman!" },
  { en: "It's a piece of cake.", uz: "Bu juda oson." },
  { en: "Let's call it a day.", uz: "Bugunlik tugatamiz." },
  { en: "You're pulling my leg.", uz: "Meni aldayapsan." },
  { en: "Hit the books.", uz: "Dars qilishga kirishmoq." },
  { en: "Once in a blue moon.", uz: "Juda kamdan-kam." },
  { en: "Under the weather.", uz: "Betob, tushkun." },
  { en: "Speak of the devil.", uz: "O'zi haqida gap ketganda o'zi kelib qoldi." },
  { en: "The ball is in your court.", uz: "Endi sizning navbatingiz." },
  { en: "Bite the bullet.", uz: "Tishni tishga qo'yib, chidash." },
  { en: "Cost an arm and a leg.", uz: "Juda qimmat." },
  { en: "Every cloud has a silver lining.", uz: "Har yomon narsada yaxshi tomoni bor." },
  { en: "Go the extra mile.", uz: "Kutilganidan ko'proq harakat qilmoq." },
  { en: "Burn the midnight oil.", uz: "Yarim kechagacha ishlamoq." },
  { en: "The best of both worlds.", uz: "Ikki dunyoning eng yaxshisi." }
];

/* ============ FOYDALI RESURSLAR ============ */
const RESOURCES = [
  { icon:"📱", title:"Duolingo", desc:"Boshlang'ich uchun eng yaxshi bepul ilova", url:"https://duolingo.com" },
  { icon:"🎧", title:"BBC Learning English", desc:"Podkastlar, videolar va mashqlar", url:"https://bbc.co.uk/learningenglish" },
  { icon:"📚", title:"British Council", desc:"Bepul kurslar va mashqlar", url:"https://learnenglish.britishcouncil.org" },
  { icon:"🎬", title:"TED Talks", desc:"Qiziqarli ma'ruzalar, subtitrli", url:"https://ted.com/talks" },
  { icon:"📖", title:"Cambridge Dictionary", desc:"Ishonchli lug'at va misollar", url:"https://dictionary.cambridge.org" },
  { icon:"🗣️", title:"HelloTalk", desc:"Chet elliklar bilan suhbat", url:"https://hellotalk.com" }
];

/* ============ HAFTA KUNLARI (o'rganish rejasi) ============ */
const WEEK_PLAN = [
  { day:"Du", icon:"📘", task:"Grammatika: 10 mashq",               min:15 },
  { day:"Se", icon:"📖", task:"Lug'at: 20 yangi so'z",              min:15 },
  { day:"Ch", icon:"🎧", task:"Tinglash: 1 podkast",                 min:20 },
  { day:"Pa", icon:"📚", task:"O'qish: 1 matn + savollar",           min:20 },
  { day:"Ju", icon:"✍️", task:"Yozish: kunlik 5 jumla",              min:15 },
  { day:"Sh", icon:"🃏", task:"Kartochkalar: 30 so'z takror",        min:15 },
  { day:"Ya", icon:"🎯", task:"Daraja testi: natijani tekshirish",   min:15 }
];

/* ============ EXPORT (brauzer uchun) ============ */
/* Barcha o'zgaruvchilar global — app.js da ishlatiladi */
