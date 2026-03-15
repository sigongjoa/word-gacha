import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getCorsHeaders } from '../_shared/cors.ts'
import { json } from '../_shared/auth.ts'

// ── 교재 데이터 (미래엔 공통영어 1, 김성연) ────────────────────────────
const LESSON_INFO: Record<number, { title: string; subtitle: string; topic: string }> = {
  1: { title: 'You and I Become "We"',       subtitle: 'The Power of Friendliness: Soft but Strong',          topic: '진화, 친절함, 협동' },
  2: { title: 'Open a Book, Open the World', subtitle: 'Gathering of the Whakapapa',                          topic: '문화, 가족, 구전 유산' },
  3: { title: 'Free Yourself with Science',  subtitle: 'Tuning Out: The Science of Noise-Cancellation',       topic: '과학, 소음 제거 기술' },
  4: { title: 'Let It Be Green',             subtitle: 'A Better Future for Coffee Waste',                    topic: '환경, 지속가능성, 순환경제' },
}

interface TWord { id: string; unit: number; english: string; korean: string; part_of_speech: string; example: string }

const TEXTBOOK_WORDS: TWord[] = [
  // ── Lesson 1 ─────────────────────────────────────────────────────────
  { id:'tw_l1_01', unit:1, english:'evolutionary',  korean:'진화적인',              part_of_speech:'adj',         example:"I'm Dr. Edward Wilson, an evolutionary biologist." },
  { id:'tw_l1_02', unit:1, english:'biologist',     korean:'생물학자',              part_of_speech:'noun',        example:"I'm Dr. Edward Wilson, an evolutionary biologist." },
  { id:'tw_l1_03', unit:1, english:'anthropologist',korean:'인류학자',              part_of_speech:'noun',        example:'The responsive behavior of dogs caught the attention of an evolutionary anthropologist.' },
  { id:'tw_l1_04', unit:1, english:'ancestor',      korean:'조상',                 part_of_speech:'noun',        example:'Wolves, who share the same common ancestor.' },
  { id:'tw_l1_05', unit:1, english:'gesture',       korean:'몸짓, 제스처',          part_of_speech:'noun',        example:'I noticed that he responded well to my gestures.' },
  { id:'tw_l1_06', unit:1, english:'conduct',       korean:'수행하다, 실시하다',     part_of_speech:'verb',        example:'He conducted an experiment to see how dogs would respond.' },
  { id:'tw_l1_07', unit:1, english:'conclude',      korean:'결론짓다',              part_of_speech:'verb',        example:"Dr. Hare concluded that the dogs' ability to read human gestures allowed them to perform better." },
  { id:'tw_l1_08', unit:1, english:'cooperative',   korean:'협동적인',              part_of_speech:'adj',         example:"To study their cooperative behavior, Dr. Hare's team set up a device." },
  { id:'tw_l1_09', unit:1, english:'extinction',    korean:'멸종',                 part_of_speech:'noun',        example:'Without these characteristics, they could have faced extinction.' },
  { id:'tw_l1_10', unit:1, english:'genetically',   korean:'유전적으로',            part_of_speech:'adv',         example:'Although the two are genetically similar, they are different in nature.' },
  { id:'tw_l1_11', unit:1, english:'survival',      korean:'생존',                 part_of_speech:'noun',        example:"I'll give you another example of how friendliness is related to survival." },
  { id:'tw_l1_12', unit:1, english:'superior',      korean:'우월한',               part_of_speech:'adj',         example:'Neanderthals were known to be intelligent and physically superior to Homo sapiens.' },
  { id:'tw_l1_13', unit:1, english:'attribute',     korean:'특성, 속성',           part_of_speech:'noun',        example:'Despite these attributes, however, it was Homo sapiens who ultimately survived.' },
  { id:'tw_l1_14', unit:1, english:'thrive',        korean:'번성하다',              part_of_speech:'verb',        example:'It was Homo sapiens who ultimately survived and thrived.' },
  { id:'tw_l1_15', unit:1, english:'promote',       korean:'촉진하다',              part_of_speech:'verb',        example:'Our ancestors lived in larger communities that promoted cooperation.' },
  { id:'tw_l1_16', unit:1, english:'competitive',   korean:'경쟁적인',              part_of_speech:'adj',         example:'These social differences may have given Homo sapiens a competitive advantage.' },
  { id:'tw_l1_17', unit:1, english:'adapt',         korean:'적응하다',              part_of_speech:'verb',        example:'Allowing them to adapt to an ever-changing environment.' },
  { id:'tw_l1_18', unit:1, english:'alternative',   korean:'대안',                 part_of_speech:'noun',        example:'I propose an alternative view: kindness is the key to success.' },
  { id:'tw_l1_19', unit:1, english:'harmonize',     korean:'조화를 이루다',         part_of_speech:'verb',        example:'Just as each flower adds to the beauty when it harmonizes with the others.' },
  { id:'tw_l1_20', unit:1, english:'contribute',    korean:'기여하다',              part_of_speech:'verb',        example:'Each person can contribute to a more beautiful world when they cooperate.' },
  { id:'tw_l1_21', unit:1, english:'flourish',      korean:'번성하다',              part_of_speech:'verb',        example:'By being kind and working together, we can truly flourish.' },
  { id:'tw_l1_22', unit:1, english:'bouquet',       korean:'꽃다발',               part_of_speech:'noun',        example:'Think of our society as a bouquet.' },
  { id:'tw_l1_23', unit:1, english:'fascinating',   korean:'매혹적인',              part_of_speech:'adj',         example:"It's fascinating how we want to help someone in need." },
  { id:'tw_l1_24', unit:1, english:'occasionally',  korean:'가끔, 이따금',          part_of_speech:'adv',         example:'When they occasionally succeeded, they did not share the food.' },
  { id:'tw_l1_25', unit:1, english:'regardless',    korean:'~에 상관없이',          part_of_speech:'prep',        example:'They solved the problem regardless of which individual they were paired with.' },
  { id:'tw_l1_26', unit:1, english:'population',    korean:'개체 수, 인구',         part_of_speech:'noun',        example:'The friendly nature of dogs allowed their population to grow larger than that of wolves.' },
  { id:'tw_l1_27', unit:1, english:'random',        korean:'무작위의',              part_of_speech:'adj',         example:'The wolves struggled and chose cups at random.' },
  { id:'tw_l1_28', unit:1, english:'comforting',    korean:'위안이 되는',           part_of_speech:'adj',         example:"Isn't that a comforting thought?" },
  { id:'tw_l1_29', unit:1, english:'chimpanzee',    korean:'침팬지',               part_of_speech:'noun',        example:'Dr. Hare and his colleagues designed an experiment with chimpanzees and bonobos.' },
  { id:'tw_l1_30', unit:1, english:'bonobo',        korean:'보노보',               part_of_speech:'noun',        example:'The bonobos got along much better than the chimpanzees.' },

  // ── Lesson 2 ─────────────────────────────────────────────────────────
  { id:'tw_l2_01', unit:2, english:'genealogy',     korean:'족보, 계보',            part_of_speech:'noun',        example:'For some time, my grandfather had been busy writing down the village genealogy.' },
  { id:'tw_l2_02', unit:2, english:'whakapapa',     korean:'와카파파 (마오리 족보)', part_of_speech:'noun',        example:'The whakapapa had been in his old house.' },
  { id:'tw_l2_03', unit:2, english:'chant',         korean:'성가, 노래하다',        part_of_speech:'noun/verb',   example:'He chanted the names of the ancestors.' },
  { id:'tw_l2_04', unit:2, english:'despair',       korean:'절망',                 part_of_speech:'noun',        example:'Nani Tama, in despair, went to stay with his daughter.' },
  { id:'tw_l2_05', unit:2, english:'faintly',       korean:'희미하게, 가늘게',       part_of_speech:'adv',         example:"I heard my grandfather say faintly, 'I need your help, Grandson.'" },
  { id:'tw_l2_06', unit:2, english:'ashes',         korean:'재, 잿더미 (폐허)',      part_of_speech:'noun',        example:'Trying to find a way out of the ashes of the past.' },
  { id:'tw_l2_07', unit:2, english:'shaky',         korean:'떨리는',               part_of_speech:'adj',         example:'Nani began to write the whakapapa again with his shaky hands.' },
  { id:'tw_l2_08', unit:2, english:'recall',        korean:'떠올리다, 기억해내다',   part_of_speech:'verb',        example:'They recalled missing names.' },
  { id:'tw_l2_09', unit:2, english:'whisper',       korean:'속삭이다',              part_of_speech:'verb',        example:"After a moment of silence, the old man whispered to Nani, 'Goodbye, friend.'" },
  { id:'tw_l2_10', unit:2, english:'sigh',          korean:'한숨 쉬다, 한숨',       part_of_speech:'noun/verb',   example:'I replied with a sigh.' },
  { id:'tw_l2_11', unit:2, english:'burst',         korean:'갑자기 ~하다, 폭발하다', part_of_speech:'verb',        example:'Sometimes, he burst into a song.' },
  { id:'tw_l2_12', unit:2, english:'lift',          korean:'들어올리다',            part_of_speech:'verb',        example:'Lifting up their voices to send the song flying like a bird through the sky.' },
  { id:'tw_l2_13', unit:2, english:'gentle',        korean:'부드러운, 온화한',       part_of_speech:'adj',         example:'He welcomed Nani Tama with a gentle smile.' },
  { id:'tw_l2_14', unit:2, english:'silence',       korean:'침묵',                 part_of_speech:'noun',        example:'We traveled all night, mostly in silence.' },
  { id:'tw_l2_15', unit:2, english:'century',       korean:'세기, 100년',           part_of_speech:'noun',        example:'His voice traveled back across the centuries.' },
  { id:'tw_l2_16', unit:2, english:'painful',       korean:'고통스러운',            part_of_speech:'adj',         example:'Every slow, painful step hurt him, but he tried to walk.' },
  { id:'tw_l2_17', unit:2, english:'heritage',      korean:'유산',                 part_of_speech:'noun',        example:'He wanted to finish and preserve the village heritage.' },
  { id:'tw_l2_18', unit:2, english:'dedicate',      korean:'헌신하다',              part_of_speech:'verb',        example:'He dedicated his remaining time to finishing the whakapapa.' },
  { id:'tw_l2_19', unit:2, english:'destination',   korean:'목적지',               part_of_speech:'noun',        example:'He was searching inside himself for their destination.' },
  { id:'tw_l2_20', unit:2, english:'preserve',      korean:'보존하다',              part_of_speech:'verb',        example:'Our grandfather had saved our past for us.' },
  { id:'tw_l2_21', unit:2, english:'manuscript',    korean:'원고, 필사본',          part_of_speech:'noun',        example:'Nani began to write the whakapapa again.' },
  { id:'tw_l2_22', unit:2, english:'sentiment',     korean:'감정, 정서',            part_of_speech:'noun',        example:'Today this sentiment is shared by many.' },
  { id:'tw_l2_23', unit:2, english:'weep',          korean:'울다',                 part_of_speech:'verb',        example:'Crying, they pressed their noses together to say goodbye.' },
  { id:'tw_l2_24', unit:2, english:'gather',        korean:'모으다, 수집하다',       part_of_speech:'verb',        example:'It took Nani Tama almost two years to gather most of the whakapapa.' },

  // ── Lesson 3 ─────────────────────────────────────────────────────────
  { id:'tw_l3_01', unit:3, english:'vibration',     korean:'진동',                 part_of_speech:'noun',        example:'Sound is produced through vibrations that occur from a sound source.' },
  { id:'tw_l3_02', unit:3, english:'interference',  korean:'간섭',                 part_of_speech:'noun',        example:'Sound waves can also interfere with each other when they meet.' },
  { id:'tw_l3_03', unit:3, english:'destructive',   korean:'파괴적인, 상쇄하는',    part_of_speech:'adj',         example:'Destructive interference occurs when a peak of one wave overlaps with a valley.' },
  { id:'tw_l3_04', unit:3, english:'constructive',  korean:'건설적인, 증폭하는',    part_of_speech:'adj',         example:'Constructive interference occurs when the peaks of two waves overlap.' },
  { id:'tw_l3_05', unit:3, english:'circuitry',     korean:'회로',                 part_of_speech:'noun',        example:'Inside the headphones are microphones and noise-cancelling circuitry.' },
  { id:'tw_l3_06', unit:3, english:'detect',        korean:'감지하다',              part_of_speech:'verb',        example:'Microphones are installed in ticket offices to detect external noise.' },
  { id:'tw_l3_07', unit:3, english:'transmit',      korean:'전달하다, 송신하다',     part_of_speech:'verb',        example:'The circuitry analyzes sounds to produce opposite sound waves and transmit them.' },
  { id:'tw_l3_08', unit:3, english:'eliminate',     korean:'제거하다',              part_of_speech:'verb',        example:'They use noise-cancelling headsets to improve communication by eliminating vehicle noise.' },
  { id:'tw_l3_09', unit:3, english:'cancel out',    korean:'상쇄하다',              part_of_speech:'phrasal verb', example:'This cancels out the unwanted sound even in noisy surroundings.' },
  { id:'tw_l3_10', unit:3, english:'predictable',   korean:'예측 가능한',           part_of_speech:'adj',         example:'This technology is effective for predictable sounds like those of car engines.' },
  { id:'tw_l3_11', unit:3, english:'inconsistent',  korean:'일관성 없는',           part_of_speech:'adj',         example:"It's less effective for inconsistent sounds such as those of people talking." },
  { id:'tw_l3_12', unit:3, english:'distracting',   korean:'집중을 방해하는',       part_of_speech:'adj',         example:'Noise can be unpleasant and distracting.' },
  { id:'tw_l3_13', unit:3, english:'frequency',     korean:'주파수, 빈도',          part_of_speech:'noun',        example:'The circuitry analyzes the frequency of outside sounds.' },
  { id:'tw_l3_14', unit:3, english:'peak',          korean:'꼭대기, 최고점',        part_of_speech:'noun',        example:'Constructive interference occurs when the peaks of two waves overlap.' },
  { id:'tw_l3_15', unit:3, english:'valley',        korean:'골짜기, 최저점',        part_of_speech:'noun',        example:'Destructive interference occurs when a peak overlaps with a valley.' },
  { id:'tw_l3_16', unit:3, english:'overlap',       korean:'겹치다',               part_of_speech:'verb',        example:'When the peaks of two waves overlap, it results in a bigger wave.' },
  { id:'tw_l3_17', unit:3, english:'generate',      korean:'생성하다',              part_of_speech:'verb',        example:'The circuitry will generate an opposite noise of –1.' },
  { id:'tw_l3_18', unit:3, english:'analyze',       korean:'분석하다',              part_of_speech:'verb',        example:'The circuitry analyzes the sounds to produce opposite sound waves.' },
  { id:'tw_l3_19', unit:3, english:'address',       korean:'해결하다, 다루다',       part_of_speech:'verb',        example:'Noise-cancellation technology can help address these problems.' },
  { id:'tw_l3_20', unit:3, english:'disturbance',   korean:'방해, 소란',            part_of_speech:'noun',        example:'Reducing unwanted disturbances, allowing people to lead more peaceful lives.' },
  { id:'tw_l3_21', unit:3, english:'pollution',     korean:'오염',                 part_of_speech:'noun',        example:'Many people expect technology will solve issues caused by noise pollution.' },
  { id:'tw_l3_22', unit:3, english:'interpret',     korean:'해석하다',              part_of_speech:'verb',        example:'When these sound waves reach our ears, the brain interprets them as sound.' },
  { id:'tw_l3_23', unit:3, english:'convert',       korean:'변환하다',              part_of_speech:'verb',        example:'The circuitry must convert the noise into digital data.' },
  { id:'tw_l3_24', unit:3, english:'amplitude',     korean:'진폭',                 part_of_speech:'noun',        example:'When peaks of two waves overlap, the amplitude increases.' },
  { id:'tw_l3_25', unit:3, english:'surround',      korean:'둘러싸다',              part_of_speech:'verb',        example:'You can hear the music clearly even in noisy surroundings.' },
  { id:'tw_l3_26', unit:3, english:'advance',       korean:'발전하다, 전진하다',     part_of_speech:'verb',        example:'As technology advances, many people expect it will solve various social issues.' },
  { id:'tw_l3_27', unit:3, english:'installed',     korean:'설치된',               part_of_speech:'adj',         example:'Microphones are installed in ticket offices to detect external noise.' },
  { id:'tw_l3_28', unit:3, english:'external',      korean:'외부의',               part_of_speech:'adj',         example:'Microphones pick up sounds from the outside (external noise).' },

  // ── Lesson 4 ─────────────────────────────────────────────────────────
  { id:'tw_l4_01', unit:4, english:'extraction',    korean:'추출',                 part_of_speech:'noun',        example:'The extraction process generates significant waste.' },
  { id:'tw_l4_02', unit:4, english:'substantial',   korean:'상당한',               part_of_speech:'adj',         example:"The world's widespread love of coffee comes at a substantial environmental cost." },
  { id:'tw_l4_03', unit:4, english:'dispose',       korean:'처리하다, 버리다',       part_of_speech:'verb',        example:'The remaining 99.8 percent is disposed of as waste.' },
  { id:'tw_l4_04', unit:4, english:'landfill',      korean:'매립지',               part_of_speech:'noun',        example:'Spent coffee grounds are classified as general waste and sent to landfills.' },
  { id:'tw_l4_05', unit:4, english:'methane',       korean:'메탄',                 part_of_speech:'noun',        example:'They break down, releasing methane, a greenhouse gas.' },
  { id:'tw_l4_06', unit:4, english:'greenhouse gas',korean:'온실가스',              part_of_speech:'noun',        example:'Methane is a greenhouse gas approximately 25 times more potent than CO2.' },
  { id:'tw_l4_07', unit:4, english:'potent',        korean:'강력한',               part_of_speech:'adj',         example:'Methane is approximately 25 times more potent than CO2.' },
  { id:'tw_l4_08', unit:4, english:'incinerate',    korean:'소각하다',              part_of_speech:'verb',        example:'Some SCGs are incinerated instead of being buried.' },
  { id:'tw_l4_09', unit:4, english:'organic',       korean:'유기적인, 유기농의',     part_of_speech:'adj',         example:'The grounds contain valuable organic compounds and minerals.' },
  { id:'tw_l4_10', unit:4, english:'circular economy', korean:'순환 경제',         part_of_speech:'noun',        example:'A circular economy promotes the reuse of resources for as long as possible.' },
  { id:'tw_l4_11', unit:4, english:'collaborate',   korean:'협력하다',              part_of_speech:'verb',        example:'A chain of coffee shops collaborates with an organization to collect spent coffee grounds.' },
  { id:'tw_l4_12', unit:4, english:'impurity',      korean:'불순물',               part_of_speech:'noun',        example:'These grounds are processed to remove impurities and dried out.' },
  { id:'tw_l4_13', unit:4, english:'fertilizer',    korean:'비료',                 part_of_speech:'noun',        example:'The resulting SCGs are transformed into organic fertilizer.' },
  { id:'tw_l4_14', unit:4, english:'repurpose',     korean:'재활용하다, 용도 변경하다', part_of_speech:'verb',     example:'By repurposing coffee grounds in this manner, businesses and farmers can benefit.' },
  { id:'tw_l4_15', unit:4, english:'sustainable',   korean:'지속 가능한',           part_of_speech:'adj',         example:'The government is taking steps toward the creation of a sustainable recycling system.' },
  { id:'tw_l4_16', unit:4, english:'reusable',      korean:'재사용 가능한',         part_of_speech:'adj',         example:'Reusable cups from coffee grounds not only have a visually appealing appearance.' },
  { id:'tw_l4_17', unit:4, english:'absorb',        korean:'흡수하다',              part_of_speech:'verb',        example:'Fabric made from coffee grounds absorbs sweat.' },
  { id:'tw_l4_18', unit:4, english:'compound',      korean:'화합물, 복합체',        part_of_speech:'noun',        example:'The grounds contain valuable organic compounds and minerals.' },
  { id:'tw_l4_19', unit:4, english:'awareness',     korean:'인식, 의식',            part_of_speech:'noun',        example:'Thanks to increased awareness of the coffee waste problem.' },
  { id:'tw_l4_20', unit:4, english:'significant',   korean:'중요한, 상당한',        part_of_speech:'adj',         example:'The extraction process generates significant waste.' },
  { id:'tw_l4_21', unit:4, english:'necessity',     korean:'필수품',               part_of_speech:'noun',        example:'For Koreans, coffee is not just a drink but a daily necessity.' },
  { id:'tw_l4_22', unit:4, english:'widespread',    korean:'널리 퍼진',             part_of_speech:'adj',         example:"The world's widespread love of coffee comes at a substantial environmental cost." },
  { id:'tw_l4_23', unit:4, english:'classify',      korean:'분류하다',              part_of_speech:'verb',        example:'Spent coffee grounds are classified as general waste.' },
  { id:'tw_l4_24', unit:4, english:'transform',     korean:'변환하다, 바꾸다',       part_of_speech:'verb',        example:'They are transformed into organic fertilizer.' },
  { id:'tw_l4_25', unit:4, english:'approximately', korean:'약, 대략',             part_of_speech:'adv',         example:'Approximately 10 billion tons of coffee was consumed worldwide.' },
  { id:'tw_l4_26', unit:4, english:'sentiment',     korean:'감정, 정서',            part_of_speech:'noun',        example:'Today this sentiment is shared by many.' },
  { id:'tw_l4_27', unit:4, english:'promote',       korean:'촉진하다, 홍보하다',     part_of_speech:'verb',        example:'A circular economy promotes the reuse of resources.' },
  { id:'tw_l4_28', unit:4, english:'preserve',      korean:'보존하다',              part_of_speech:'verb',        example:'Reusable cups preserve the taste of the coffee.' },
  { id:'tw_l4_29', unit:4, english:'recycle',       korean:'재활용하다',            part_of_speech:'verb',        example:'Korea has shown a growing interest in recycling spent coffee grounds.' },
  { id:'tw_l4_30', unit:4, english:'dispose of',    korean:'~을 처리하다, 버리다',   part_of_speech:'phrasal verb', example:'The remaining 99.8 percent is disposed of as waste.' },
]

interface TGrammar {
  id: string; unit: number; grammar_point: string
  sentence: string; explanation: string; key_pattern: string
  question: string; answer: string
}

const TEXTBOOK_GRAMMAR: TGrammar[] = [
  // ── Lesson 1 ────────────────────────────────────────────────────────
  { id:'gq_l1_01', unit:1, grammar_point:'관계대명사 who (주격)',
    sentence:'wolves, who share the same common ancestor',
    explanation:'선행사(wolves)가 사람/동물일 때 주격 관계대명사 who 사용. 관계절이 선행사를 수식함.',
    key_pattern:'[선행사] + who + 동사',
    question:'다음 문장에서 관계대명사절을 찾고, 선행사를 쓰시오: "wolves, who share the same common ancestor"',
    answer:'관계대명사절: who share the same common ancestor / 선행사: wolves' },
  { id:'gq_l1_02', unit:1, grammar_point:'분사구문 (부대상황 - ~하면서)',
    sentence:'The wolves struggled and chose cups at random, paying no attention to his gestures.',
    explanation:"분사구문은 접속사+주어를 생략하고 동사를 현재분사로 변환. '~하면서'의 동시상황.",
    key_pattern:'주절, + V-ing (~하면서)',
    question:"다음 분사구문을 접속사를 사용한 절로 바꾸시오: 'paying no attention to his gestures'",
    answer:'as/while they paid no attention to his gestures' },
  { id:'gq_l1_03', unit:1, grammar_point:'조동사 could have p.p. (과거 가능성)',
    sentence:'Without these characteristics, they could have faced extinction.',
    explanation:"could have p.p.는 '~했을 수도 있었다'는 과거에 대한 가능성. Without 가정법과 함께 자주 쓰임.",
    key_pattern:'Without + 명사, 주어 + could have p.p.',
    question:"'could have faced'가 나타내는 의미와 시제를 쓰시오.",
    answer:'~했을 수도 있었다 / 과거에 대한 가능성(가정)' },
  { id:'gq_l1_04', unit:1, grammar_point:'관계대명사 which (목적격)',
    sentence:"Dr. Hare's team set up a device which required two individuals to pull both ends of a rope.",
    explanation:'관계대명사 which는 선행사(a device)를 수식. require+목적어+to부정사 구조도 함께 확인.',
    key_pattern:'[사물 선행사] + which + 동사',
    question:"밑줄 친 which의 선행사를 쓰시오: 'a device which required two individuals to pull'",
    answer:'a device' },
  { id:'gq_l1_05', unit:1, grammar_point:'가주어 It ~ 진주어 how절',
    sentence:"It's fascinating how, in situations like this, we want to help someone in need.",
    explanation:'It은 가주어, how절이 진주어. It + be + 형용사 + that/how + 절 구조.',
    key_pattern:'It + be + 형용사 + how + 절',
    question:"다음 문장에서 가주어와 진주어를 찾으시오: \"It's fascinating how we want to help someone in need.\"",
    answer:'가주어: It / 진주어: how we want to help someone in need' },

  // ── Lesson 2 ────────────────────────────────────────────────────────
  { id:'gq_l2_01', unit:2, grammar_point:'과거완료 진행형 had been V-ing',
    sentence:'For some time, my grandfather had been busy writing down the village genealogy.',
    explanation:'had been + V-ing는 과거완료 진행형. 과거의 특정 시점 이전부터 계속된 동작을 나타냄.',
    key_pattern:'주어 + had been + V-ing',
    question:"'had been busy writing'을 우리말로 해석하고, 이 시제가 나타내는 의미를 쓰시오.",
    answer:'족보를 적느라 바빠 왔었다 / 과거 이전 시점부터 계속 진행된 동작' },
  { id:'gq_l2_02', unit:2, grammar_point:'간접화법 전환 (의문문)',
    sentence:'"Can you take a week off?" → He asked if I could take a week off.',
    explanation:'직접화법 의문문→간접화법: if/whether 사용, 시제 한 단계 과거로 이동, 인칭 변환.',
    key_pattern:'asked + if/whether + 주어 + 동사(과거형)',
    question:"\"Can you take a week off?\"를 간접화법으로 바꾸시오.",
    answer:'He asked if I could take a week off.' },
  { id:'gq_l2_03', unit:2, grammar_point:'양보 접속사 although/though',
    sentence:'Although the two are genetically similar, they are different in nature.',
    explanation:"although/though는 '비록 ~이지만'의 양보 접속사. 주절과 반대되는 내용을 이끔.",
    key_pattern:'Although + 절, + 주절',
    question:"다음 두 문장을 although를 써서 연결하시오: 'He was sick.' + 'He came to school.'",
    answer:'Although he was sick, he came to school.' },
  { id:'gq_l2_04', unit:2, grammar_point:'지각동사 + 목적어 + 동사원형/V-ing',
    sentence:"I heard my grandfather say faintly, 'I need your help.'",
    explanation:'지각동사(hear, see, feel 등) + 목적어 + 동사원형(전체 동작) / V-ing(진행 중인 동작).',
    key_pattern:'지각동사 + 목적어 + 동사원형 또는 V-ing',
    question:"'I heard him say'와 'I heard him saying'의 의미 차이를 쓰시오.",
    answer:'say: 말하는 것 전체를 들었다 / saying: 말하는 중인 것을 들었다' },

  // ── Lesson 3 ────────────────────────────────────────────────────────
  { id:'gq_l3_01', unit:3, grammar_point:'수동태 기본형 be p.p.',
    sentence:'Sound is produced through vibrations that occur from a sound source.',
    explanation:'수동태: be동사 + 과거분사. 행위의 대상이 주어가 됨. by + 행위자는 생략 가능.',
    key_pattern:'주어 + be + p.p. (+ by 행위자)',
    question:"'Scientists invented noise-cancelling technology.'를 수동태로 바꾸시오.",
    answer:'Noise-cancelling technology was invented by scientists.' },
  { id:'gq_l3_02', unit:3, grammar_point:'시간 접속사 as soon as (~하자마자)',
    sentence:'Instantly transmit the opposite sound to the speakers as soon as the noise reaches the microphones.',
    explanation:"as soon as: '~하자마자' 시간의 부사절. 미래의 일에도 현재시제 사용.",
    key_pattern:'주절 + as soon as + 주어 + 동사(현재형)',
    question:"'비가 그치자마자 우리는 출발했다'를 as soon as를 이용해 영작하시오.",
    answer:'We left as soon as it stopped raining.' },
  { id:'gq_l3_03', unit:3, grammar_point:'장소 도치 (부사구 + be + 주어)',
    sentence:'Inside the headphones are microphones and noise-cancelling circuitry.',
    explanation:"장소 부사구가 문두에 오면 주어와 동사가 도치됨. '헤드폰 안에 마이크와 회로가 있다'",
    key_pattern:'장소부사구 + be동사 + 주어',
    question:"'The answer lies inside the box.'를 도치문으로 바꾸시오.",
    answer:'Inside the box lies the answer.' },
  { id:'gq_l3_04', unit:3, grammar_point:'목적 접속사 so that',
    sentence:'This cancels out the unwanted sound so that you can hear the music sound clearly.',
    explanation:"so that + 주어 + can/could + 동사원형: '~할 수 있도록'의 목적.",
    key_pattern:'주절 + so that + 주어 + can + 동사원형',
    question:"'우리는 더 편안하게 살 수 있도록 기술을 사용한다'를 so that을 이용해 영작하시오.",
    answer:'We use technology so that we can live more comfortably.' },

  // ── Lesson 4 ────────────────────────────────────────────────────────
  { id:'gq_l4_01', unit:4, grammar_point:'배수 비교 (배수사 + as ~ as / 비교급 + than)',
    sentence:'Methane is approximately 25 times more potent than CO2.',
    explanation:"배수 비교: 배수사 + as 형용사 as / 배수사 + 비교급 + than. '~배만큼 ~하다'",
    key_pattern:'배수사 + as + 원급 + as  /  배수사 + 비교급 + than',
    question:"'메탄은 CO2보다 약 25배 더 강력하다'를 as ~ as 구문으로 영작하시오.",
    answer:'Methane is approximately 25 times as potent as CO2.' },
  { id:'gq_l4_02', unit:4, grammar_point:'관계부사 where (장소 선행사)',
    sentence:'The resulting SCGs are sold to fertilizer companies, where they are transformed into organic fertilizer.',
    explanation:"관계부사 where는 선행사가 장소일 때 사용. 계속적 용법(콤마+where)은 '그리고 거기서'.",
    key_pattern:'[장소 선행사] + where + 주어 + 동사',
    question:"밑줄 친 where의 선행사를 쓰고, where를 전치사+which로 바꾸시오.",
    answer:'선행사: fertilizer companies / in which (at which도 가능)' },
  { id:'gq_l4_03', unit:4, grammar_point:'not only A but also B (상관접속사)',
    sentence:'Reusable cups not only have a visually appealing appearance but also preserve the taste of the coffee.',
    explanation:"not only A but also B: 'A뿐만 아니라 B도'. A와 B는 문법적으로 동일한 형태.",
    key_pattern:'not only + A + but also + B',
    question:"'그는 영리할 뿐만 아니라 친절하기도 하다'를 not only ~ but also를 사용해 영작하시오.",
    answer:'He is not only intelligent but also kind.' },
  { id:'gq_l4_04', unit:4, grammar_point:'by V-ing (수단/방법 - ~함으로써)',
    sentence:'By repurposing coffee grounds in this manner, related businesses and local farmers can benefit.',
    explanation:"by + V-ing: '~함으로써' 수단/방법. 문두에 오면 주절의 주어와 일치해야 함.",
    key_pattern:'By + V-ing ~, 주어 + 동사',
    question:"'열심히 공부함으로써 그는 시험에 합격했다'를 by V-ing를 사용해 영작하시오.",
    answer:'By studying hard, he passed the exam.' },
  { id:'gq_l4_05', unit:4, grammar_point:'과거분사 후치 수식 (명사 + p.p.)',
    sentence:'Fabric made from coffee grounds absorbs sweat, dries quickly, and provides UV protection.',
    explanation:"과거분사가 명사를 후치 수식할 때 수동/완료의 의미. 'made from coffee grounds'가 Fabric 수식.",
    key_pattern:'명사 + p.p. + 수식어구',
    question:"'커피 찌꺼기로 만들어진 컵'을 영어로 쓰시오.",
    answer:'cups made from coffee grounds' },
]

// ── 메인 핸들러 ───────────────────────────────────────────────────────
Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req)
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const url    = new URL(req.url)
  const rest   = url.pathname.match(/\/textbook(.*)/)?.[1] ?? ''
  const parts  = rest.split('/').filter(Boolean)  // ['words'] or ['words','tw_l1_01','add'] or ['grammar']
  const action = parts[0]  // 'words' | 'grammar' | 'daily'
  const wordId = parts[1]  // textbook word id (for /words/:id/add)

  // ── GET /textbook/words?unit=N  (전체 or unit별 단어 목록)
  if (req.method === 'GET' && action === 'words') {
    const unitParam = url.searchParams.get('unit')
    const unit = unitParam ? parseInt(unitParam) : null
    const words = unit ? TEXTBOOK_WORDS.filter(w => w.unit === unit) : TEXTBOOK_WORDS
    return json(words.map(w => ({ ...w, lesson_info: LESSON_INFO[w.unit] })))
  }

  // ── GET /textbook/grammar?unit=N  (전체 or unit별 문법 QA)
  if (req.method === 'GET' && action === 'grammar') {
    const unitParam = url.searchParams.get('unit')
    const unit = unitParam ? parseInt(unitParam) : null
    const grammar = unit ? TEXTBOOK_GRAMMAR.filter(g => g.unit === unit) : TEXTBOOK_GRAMMAR
    return json(grammar.map(g => ({ ...g, lesson_info: LESSON_INFO[g.unit] })))
  }

  // ── GET /textbook/daily?student_id=X&unit=N  (오늘의 추천 단어)
  // 학생이 아직 단어장에 없는 교재 단어를 unit별로 최대 10개 반환
  if (req.method === 'GET' && action === 'daily') {
    const studentId = url.searchParams.get('student_id')
    const unitParam = url.searchParams.get('unit')
    const unit = unitParam ? parseInt(unitParam) : null

    let pool = unit ? TEXTBOOK_WORDS.filter(w => w.unit === unit) : TEXTBOOK_WORDS

    if (studentId) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      )
      const { data: myWords } = await supabase
        .from('words')
        .select('english')
        .eq('student_id', studentId)

      if (myWords?.length) {
        const mySet = new Set(myWords.map((w: { english: string }) => w.english.toLowerCase()))
        pool = pool.filter(w => !mySet.has(w.english.toLowerCase()))
      }
    }

    // 최대 10개 반환
    const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, 10)
    return json(shuffled.map(w => ({ ...w, lesson_info: LESSON_INFO[w.unit] })))
  }

  // ── POST /textbook/words/:wordId/add  (학생 단어장에 추가)
  // body: { student_id }
  if (req.method === 'POST' && action === 'words' && wordId && parts[2] === 'add') {
    const { student_id } = await req.json()
    if (!student_id) return json({ error: 'student_id가 필요합니다' }, 400)

    const tw = TEXTBOOK_WORDS.find(w => w.id === wordId)
    if (!tw) return json({ error: '교재 단어를 찾을 수 없습니다' }, 404)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )
    const { data, error } = await supabase.from('words').insert({
      student_id,
      english:    tw.english,
      korean:     tw.korean,
      blank_type: 'korean',
      status:     'approved',
      added_by:   'textbook',
      box:        1,
    }).select().single()

    if (error) {
      if (error.code === '23505') return json({ error: '이미 단어장에 있는 단어입니다' }, 409)
      return json({ error: error.message }, 500)
    }
    return json(data)
  }

  // ── GET /textbook/info  (교재 정보)
  if (req.method === 'GET' && action === 'info') {
    return json({
      title: '공통영어 1', publisher: '미래엔', author: '김성연',
      year: 2026, grade: 1, total_units: 4,
      lesson_info: LESSON_INFO,
      stats: {
        total_words: TEXTBOOK_WORDS.length,
        total_grammar: TEXTBOOK_GRAMMAR.length,
        words_per_unit: [1,2,3,4].reduce((acc,u) => {
          acc[u] = TEXTBOOK_WORDS.filter(w => w.unit === u).length; return acc
        }, {} as Record<number,number>)
      }
    })
  }

  return json({ error: 'Not found' }, 404)
})
