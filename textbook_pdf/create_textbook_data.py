"""
미래엔 공통영어 1 (김성연) - 교재 파싱 데이터 생성기
Claude가 직접 분석하여 단어/문법 데이터를 생성합니다.
"""

import json
import uuid
from datetime import datetime

def gen_id(prefix="tw"):
    return prefix + "_" + uuid.uuid4().hex[:12]

now = datetime.utcnow().isoformat() + "Z"

# ============================================================
# LESSON 1: You and I Become "We"
# The Power of Friendliness: Soft but Strong
# ============================================================
lesson1_words = [
    # 핵심 학문 어휘
    ("evolutionary", "진화적인", "adj", "I'm Dr. Edward Wilson, an evolutionary biologist."),
    ("biologist", "생물학자", "noun", "I'm Dr. Edward Wilson, an evolutionary biologist."),
    ("anthropologist", "인류학자", "noun", "The responsive behavior of dogs also caught the attention of an evolutionary anthropologist."),
    ("ancestor", "조상", "noun", "Wolves, who share the same common ancestor."),
    ("gesture", "몸짓, 제스처", "noun", "I noticed that he responded well to my gestures."),
    ("conduct", "수행하다, 실시하다", "verb", "He conducted an experiment to see how dogs would respond."),
    ("conclude", "결론짓다", "verb", "Dr. Hare concluded that the dogs' ability to read human gestures allowed them to perform better."),
    ("cooperative", "협동적인", "adj", "To study their cooperative behavior, Dr. Hare's team set up a device."),
    ("extinction", "멸종", "noun", "Without these characteristics, they could have faced extinction."),
    ("chimpanzee", "침팬지", "noun", "Dr. Hare and his colleagues designed an experiment with chimpanzees and bonobos."),
    ("bonobo", "보노보", "noun", "The bonobos got along much better than the chimpanzees."),
    ("genetically", "유전적으로", "adv", "Although the two are genetically similar, they are different in nature."),
    ("survival", "생존", "noun", "I'll give you another example of how friendliness is related to survival."),
    ("superior", "우월한", "adj", "Neanderthals were known to be intelligent and physically superior to Homo sapiens."),
    ("attribute", "특성, 속성", "noun", "Despite these attributes, however, it was Homo sapiens who ultimately survived."),
    ("thrive", "번성하다", "verb", "It was Homo sapiens who ultimately survived and thrived."),
    ("promote", "촉진하다", "verb", "Our ancestors lived in larger communities that promoted cooperation."),
    ("competitive", "경쟁적인", "adj", "These social differences may have given Homo sapiens a competitive advantage."),
    ("adapt", "적응하다", "verb", "Allowing them to adapt to an ever-changing environment."),
    ("alternative", "대안", "noun", "I propose an alternative view: kindness is the key to success."),
    ("harmonize", "조화를 이루다", "verb", "Just as each flower adds to the beauty when it harmonizes with the others."),
    ("contribute", "기여하다", "verb", "Each person can contribute to a more beautiful world when they cooperate."),
    ("flourish", "번성하다", "verb", "By being kind and working together, we can truly flourish."),
    ("bouquet", "꽃다발", "noun", "Think of our society as a bouquet."),
    ("fascinating", "매혹적인", "adj", "It's fascinating how, in situations like this, we want to help someone in need."),
    ("occasionally", "가끔, 이따금", "adv", "When they occasionally succeeded, they did not share the food with their partner."),
    ("regardless", "~에 상관없이", "prep", "They solved the problem regardless of which individual they were paired with."),
    ("population", "개체 수, 인구", "noun", "The friendly nature of dogs probably provided them a survival advantage that allowed their population to grow larger."),
    ("random", "무작위의", "adj", "The wolves struggled and chose cups at random."),
    ("comforting", "위안이 되는", "adj", "Isn't that a comforting thought?"),
]

lesson1_grammar = [
    {
        "id": gen_id("gq"),
        "unit": 1,
        "grammar_point": "관계대명사 who (주격)",
        "sentence": "wolves, who share the same common ancestor",
        "explanation": "선행사(wolves)가 사람/동물일 때 주격 관계대명사 who를 사용. 관계절이 선행사를 수식함.",
        "key_pattern": "[선행사] + who + 동사",
        "question": "다음 문장에서 관계대명사절을 찾고, 선행사를 쓰시오.",
        "answer": "who share the same common ancestor / 선행사: wolves"
    },
    {
        "id": gen_id("gq"),
        "unit": 1,
        "grammar_point": "분사구문 (부대상황)",
        "sentence": "paying no attention to his gestures",
        "explanation": "분사구문은 접속사+주어를 생략하고 동사를 현재분사로 변환. 여기서는 '~하면서'(동시상황)의 의미.",
        "key_pattern": "주절, + V-ing (~하면서)",
        "question": "다음 분사구문을 접속사를 사용한 절로 바꾸시오: 'paying no attention to his gestures'",
        "answer": "as they paid no attention to his gestures (while / as 사용 가능)"
    },
    {
        "id": gen_id("gq"),
        "unit": 1,
        "grammar_point": "가주어 it ~ 진주어 to부정사",
        "sentence": "It's fascinating how, in situations like this, we want to help someone in need.",
        "explanation": "It은 가주어이고, how절이 진주어. 'It ~ that/how/whether + 절' 구조.",
        "key_pattern": "It + be + 형용사 + that/how + 절",
        "question": "다음 문장에서 가주어와 진주어를 찾으시오.",
        "answer": "가주어: It / 진주어: how ~ in need"
    },
    {
        "id": gen_id("gq"),
        "unit": 1,
        "grammar_point": "조동사 could have p.p. (과거 가능성)",
        "sentence": "Without these characteristics, they could have faced extinction.",
        "explanation": "could have p.p.는 '~했을 수도 있었다'는 과거에 대한 가능성/추측을 나타냄. Without 가정법과 함께 자주 쓰임.",
        "key_pattern": "Without + 명사, 주어 + could have p.p.",
        "question": "'could have faced'가 나타내는 의미를 우리말로 쓰시오.",
        "answer": "~했을 수도 있었다 (과거의 가능성/가정)"
    },
    {
        "id": gen_id("gq"),
        "unit": 1,
        "grammar_point": "관계대명사 which (계속적 용법)",
        "sentence": "Dr. Hare's team set up a device which required two individuals to pull both ends of a rope",
        "explanation": "관계대명사 which는 선행사(a device)를 수식. 'require + 목적어 + to부정사' 구조도 함께 확인.",
        "key_pattern": "[선행사] + which + 동사",
        "question": "밑줄 친 which의 선행사를 쓰시오: 'a device which required two individuals to pull'",
        "answer": "a device"
    },
]

# ============================================================
# LESSON 2: Open a Book, Open the World
# Gathering of the Whakapapa
# ============================================================
lesson2_words = [
    ("genealogy", "족보, 계보", "noun", "For some time, my grandfather had been busy writing down the village genealogy."),
    ("whakapapa", "와카파파 (마오리족 족보)", "noun", "The whakapapa had been in his old house."),
    ("chant", "성가, 노래하다", "noun/verb", "He chanted the names of the ancestors."),
    ("ancestor", "조상", "noun", "He chanted the names of the ancestors, joining the past to the present once more."),
    ("despair", "절망", "noun", "Nani Tama, in despair, went to stay with his daughter."),
    ("faintly", "희미하게, 가늘게", "adv", "I heard my grandfather say faintly, 'I need your help, Grandson.'"),
    ("ashes", "재, 잿더미 (폐허)", "noun", "Trying to find a way out of the ashes of the past."),
    ("shaky", "떨리는", "adj", "Nani began to write the whakapapa again with his shaky hands."),
    ("recall", "떠올리다, 기억해내다", "verb", "They recalled missing names."),
    ("genealogical", "계보의", "adj", "His voice traveled along the lines of our genealogy."),
    ("whisper", "속삭이다", "verb", "After a moment of silence, the old man whispered to Nani, 'Goodbye, friend.'"),
    ("sigh", "한숨 쉬다, 한숨", "noun/verb", "I replied with a sigh."),
    ("burst", "갑자기 ~하다, 폭발하다", "verb", "Sometimes, he burst into a song."),
    ("lift", "들어올리다", "verb", "Lifting up their voices to send the song flying like a bird through the sky."),
    ("gentle", "부드러운, 온화한", "adj", "He welcomed Nani Tama with a gentle smile."),
    ("preserve", "보존하다", "verb", "Our grandfather had saved our past for us."),
    ("manuscript", "원고, 필사본", "noun", "Nani began to write the whakapapa again."),
    ("heritage", "유산", "noun", "He wanted to finish and preserve the village heritage."),
    ("silence", "침묵", "noun", "We traveled all night, mostly in silence."),
    ("destination", "목적지", "noun", "He was searching inside himself for their destination."),
    ("century", "세기, 100년", "noun", "His voice traveled back across the centuries."),
    ("painful", "고통스러운", "adj", "Every slow, painful step hurt him, but he tried to walk."),
    ("weep", "울다", "verb", "Crying, they pressed their noses together to say goodbye."),
    ("dedicate", "헌신하다", "verb", "He dedicated his remaining time to finishing the whakapapa."),
]

lesson2_grammar = [
    {
        "id": gen_id("gq"),
        "unit": 2,
        "grammar_point": "과거완료 had p.p.",
        "sentence": "For some time, my grandfather had been busy writing down the village genealogy.",
        "explanation": "had been + V-ing는 과거완료 진행형. 과거의 특정 시점 이전부터 계속된 동작을 나타냄.",
        "key_pattern": "주어 + had been + V-ing",
        "question": "'had been busy writing'을 우리말로 해석하시오.",
        "answer": "족보를 적느라 바빠 왔었다 (과거 이전부터 계속 바빴음)"
    },
    {
        "id": gen_id("gq"),
        "unit": 2,
        "grammar_point": "간접화법 (평서문)",
        "sentence": "He asked, 'Can you take a week off?' → He asked if I could take a week off.",
        "explanation": "직접화법을 간접화법으로 전환할 때: 의문문은 if/whether 사용, 시제는 한 단계 과거로 이동.",
        "key_pattern": "asked + if/whether + 주어 + 동사(과거형)",
        "question": "'Can you take a week off?'를 간접화법으로 바꾸시오.",
        "answer": "He asked if I could take a week off."
    },
    {
        "id": gen_id("gq"),
        "unit": 2,
        "grammar_point": "접속사 although (양보)",
        "sentence": "Although the two are genetically similar, they are different in nature.",
        "explanation": "although/though는 '비록 ~이지만'의 양보 접속사. 주절과 반대되는 내용을 이끔.",
        "key_pattern": "Although + 절, + 주절",
        "question": "다음 두 문장을 although를 써서 한 문장으로 연결하시오: 'He was sick. He came to school.'",
        "answer": "Although he was sick, he came to school."
    },
    {
        "id": gen_id("gq"),
        "unit": 2,
        "grammar_point": "감각동사 + 목적보어 (지각동사)",
        "sentence": "I heard my grandfather say faintly, 'I need your help.'",
        "explanation": "지각동사(hear, see, feel 등) + 목적어 + 동사원형/V-ing. 동사원형은 동작 전체, V-ing는 진행 중인 동작.",
        "key_pattern": "지각동사 + 목적어 + 동사원형 (전체 동작)",
        "question": "'I heard him say'에서 say 대신 saying을 쓰면 의미가 어떻게 달라지는가?",
        "answer": "say: 말하는 것 전체를 들었다 / saying: 말하는 중인 것을 들었다"
    },
]

# ============================================================
# LESSON 3: Free Yourself with Science
# Tuning Out: The Science of Noise-Cancellation
# ============================================================
lesson3_words = [
    ("vibration", "진동", "noun", "Sound is produced through vibrations that occur from a sound source."),
    ("interference", "간섭", "noun", "Sound waves can also interfere with each other when they meet."),
    ("destructive", "파괴적인, 상쇄하는", "adj", "Destructive interference occurs when a peak of one wave overlaps with a valley of another."),
    ("constructive", "건설적인, 증폭하는", "adj", "Constructive interference occurs when the peaks of two waves overlap."),
    ("circuitry", "회로", "noun", "Inside the headphones are microphones and noise-cancelling circuitry."),
    ("detect", "감지하다", "verb", "Microphones are installed in ticket offices to detect external noise."),
    ("transmit", "전달하다, 송신하다", "verb", "The circuitry analyzes sounds to produce opposite sound waves and transmit them."),
    ("eliminate", "제거하다", "verb", "They use noise-cancelling headsets to improve communication by eliminating vehicle noise."),
    ("cancel out", "상쇄하다", "phrasal verb", "This cancels out the unwanted sound even in noisy surroundings."),
    ("predictable", "예측 가능한", "adj", "This technology is effective for predictable sounds like those of car engines."),
    ("inconsistent", "일관성 없는", "adj", "It's less effective for inconsistent sounds such as those of people talking close to you."),
    ("distracting", "집중을 방해하는", "adj", "Noise can be unpleasant and distracting."),
    ("amplitude", "진폭", "noun", "When peaks of two waves overlap, the amplitude increases."),
    ("frequency", "주파수, 빈도", "noun", "The circuitry analyzes the frequency of outside sounds."),
    ("peak", "꼭대기, 최고점", "noun", "Constructive interference occurs when the peaks of two waves overlap."),
    ("valley", "골짜기, 최저점", "noun", "Destructive interference occurs when a peak overlaps with a valley."),
    ("overlap", "겹치다", "verb", "When the peaks of two waves overlap, it results in a bigger wave."),
    ("generate", "생성하다", "verb", "The circuitry will generate an opposite noise of –1."),
    ("analyze", "분석하다", "verb", "The circuitry analyzes the sounds to produce opposite sound waves."),
    ("address", "해결하다, 다루다", "verb", "Noise-cancellation technology can help address these problems."),
    ("disturbance", "방해, 소란", "noun", "Reducing unwanted disturbances, allowing people to lead more peaceful lives."),
    ("pollution", "오염", "noun", "Many people expect technology will solve various social issues caused by noise pollution."),
    ("advance", "발전하다, 전진하다", "verb", "As technology advances, many people expect it will solve various social issues."),
    ("interpret", "해석하다", "verb", "When these sound waves reach our ears, the brain interprets them as sound."),
    ("convert", "변환하다", "verb", "The circuitry must convert the noise into digital data."),
    ("effectively", "효과적으로", "adv", "This technology is effective for predictable sounds."),
    ("installed", "설치된", "adj", "Microphones are installed in ticket offices to detect external noise."),
    ("surround", "둘러싸다", "verb", "You can hear the music sound clearly even in noisy surroundings."),
]

lesson3_grammar = [
    {
        "id": gen_id("gq"),
        "unit": 3,
        "grammar_point": "수동태 기본형 (be p.p.)",
        "sentence": "Sound is produced through vibrations that occur from a sound source.",
        "explanation": "수동태: be동사 + 과거분사. 행위의 대상이 주어가 됨. by + 행위자는 생략 가능.",
        "key_pattern": "주어 + be + p.p. (+ by 행위자)",
        "question": "'Scientists invented noise-cancelling technology.'를 수동태로 바꾸시오.",
        "answer": "Noise-cancelling technology was invented by scientists."
    },
    {
        "id": gen_id("gq"),
        "unit": 3,
        "grammar_point": "관계대명사 that (목적격)",
        "sentence": "Sound waves can interfere with each other when they meet. There are two types of interference that scientists have discovered.",
        "explanation": "관계대명사 that은 사람/사물 모두에 사용 가능. 목적격 관계대명사는 생략 가능.",
        "key_pattern": "[선행사] + that + 주어 + 동사",
        "question": "다음 문장에서 관계대명사 that을 which로 바꿀 수 있는지 판단하시오: 'It is the technology that changed the world.'",
        "answer": "바꿀 수 있다. (사물 선행사이므로 which 가능. 단, 선행사가 최상급/서수/all 등이면 that 선호)"
    },
    {
        "id": gen_id("gq"),
        "unit": 3,
        "grammar_point": "접속사 so that (목적)",
        "sentence": "This cancels out the unwanted sound, so you can hear the music sound clearly.",
        "explanation": "so that + 주어 + can/could + 동사원형: '~할 수 있도록'의 목적을 나타냄.",
        "key_pattern": "주절 + so that + 주어 + can + 동사원형",
        "question": "'We use technology so that we can live more comfortably.'를 우리말로 해석하시오.",
        "answer": "우리는 더 편안하게 살 수 있도록 기술을 사용한다."
    },
    {
        "id": gen_id("gq"),
        "unit": 3,
        "grammar_point": "부사절 접속사 as soon as",
        "sentence": "Instantly transmit the opposite sound to the speakers as soon as the noise reaches the microphones.",
        "explanation": "as soon as: '~하자마자' 시간의 부사절. 미래의 일에도 현재시제 사용.",
        "key_pattern": "주절 + as soon as + 주어 + 동사(현재형)",
        "question": "'비가 그치자마자 우리는 출발했다'를 as soon as를 이용해 영작하시오.",
        "answer": "We left as soon as it stopped raining."
    },
    {
        "id": gen_id("gq"),
        "unit": 3,
        "grammar_point": "장소 도치 (There + be + 주어)",
        "sentence": "Inside the headphones are microphones and noise-cancelling circuitry.",
        "explanation": "장소 부사구가 문두에 오면 주어와 동사가 도치됨. '헤드폰 안에 마이크와 회로가 있다'",
        "key_pattern": "장소부사구 + be동사 + 주어",
        "question": "'The answer lies inside the box.'를 도치문으로 바꾸시오.",
        "answer": "Inside the box lies the answer."
    },
]

# ============================================================
# LESSON 4: Let It Be Green
# A Better Future for Coffee Waste
# ============================================================
lesson4_words = [
    ("sentiment", "감정, 정서", "noun", "Today this sentiment is shared by many."),
    ("extraction", "추출", "noun", "The world's widespread love of coffee comes at a substantial environmental cost, as the extraction process generates significant waste."),
    ("substantial", "상당한", "adj", "The world's widespread love of coffee comes at a substantial environmental cost."),
    ("dispose", "처리하다, 버리다", "verb", "The remaining 99.8 percent is disposed of as waste."),
    ("landfill", "매립지", "noun", "Spent coffee grounds are classified as general waste and sent to landfills."),
    ("methane", "메탄", "noun", "They break down, releasing methane, a greenhouse gas."),
    ("greenhouse gas", "온실가스", "noun", "Methane is a greenhouse gas that is approximately 25 times more potent than CO2."),
    ("potent", "강력한", "adj", "Methane is approximately 25 times more potent than CO2."),
    ("incinerate", "소각하다", "verb", "Some SCGs are incinerated instead of being buried."),
    ("organic", "유기적인, 유기농의", "adj", "The grounds contain valuable organic compounds and minerals."),
    ("circular economy", "순환 경제", "noun", "A circular economy promotes the reuse of resources for as long as possible."),
    ("collaborate", "협력하다", "verb", "A chain of coffee shops collaborates with an organization to collect spent coffee grounds."),
    ("impurity", "불순물", "noun", "These grounds are processed to remove impurities and dried out."),
    ("fertilizer", "비료", "noun", "The resulting SCGs are sold to fertilizer companies, where they are transformed into organic fertilizer."),
    ("repurpose", "재활용하다, 용도 변경하다", "verb", "By repurposing coffee grounds in this manner, related businesses and local farmers can benefit."),
    ("sustainable", "지속 가능한", "adj", "The government is taking steps toward the creation of a sustainable recycling system."),
    ("recycling", "재활용", "noun", "Korea has shown a growing interest in recycling spent coffee grounds."),
    ("reusable", "재사용 가능한", "adj", "Reusable cups from coffee grounds not only have a visually appealing appearance."),
    ("absorb", "흡수하다", "verb", "Fabric made from coffee grounds absorbs sweat."),
    ("generate", "생성하다, 발생시키다", "verb", "Coffee logs generate more heat and burn for a longer time than wood."),
    ("compound", "화합물, 복합체", "noun", "The grounds contain valuable organic compounds and minerals."),
    ("awareness", "인식, 의식", "noun", "Thanks to increased awareness of the coffee waste problem."),
    ("promote", "촉진하다, 홍보하다", "verb", "A circular economy promotes the reuse of resources."),
    ("significant", "중요한, 상당한", "adj", "The extraction process generates significant waste."),
    ("necessity", "필수품", "noun", "For Koreans, coffee is not just a drink but a daily necessity."),
    ("widespread", "널리 퍼진", "adj", "The world's widespread love of coffee comes at a substantial environmental cost."),
    ("classify", "분류하다", "verb", "Spent coffee grounds are classified as general waste."),
    ("transform", "변환하다, 바꾸다", "verb", "They are transformed into organic fertilizer."),
    ("approximately", "약, 대략", "adv", "Approximately 10 billion tons of coffee was consumed worldwide."),
    ("preserve", "보존하다", "verb", "Reusable cups preserve the taste of the coffee."),
]

lesson4_grammar = [
    {
        "id": gen_id("gq"),
        "unit": 4,
        "grammar_point": "배수 비교 (배수사 + as ~ as)",
        "sentence": "Methane is approximately 25 times more potent than CO2.",
        "explanation": "배수 비교: 배수사 + as 형용사 as 또는 배수사 + 비교급 + than. '~배만큼 ~하다'",
        "key_pattern": "배수사 + as + 원급 + as / 배수사 + 비교급 + than",
        "question": "'메탄은 CO2보다 약 25배 더 강력하다'를 as ~ as 구문으로 영작하시오.",
        "answer": "Methane is approximately 25 times as potent as CO2."
    },
    {
        "id": gen_id("gq"),
        "unit": 4,
        "grammar_point": "관계부사 where",
        "sentence": "The resulting SCGs are sold to fertilizer companies, where they are transformed into organic fertilizer.",
        "explanation": "관계부사 where는 선행사가 장소일 때 사용. 계속적 용법(콤마+where)은 '그리고 거기서'의 의미.",
        "key_pattern": "[장소 선행사] + where + 주어 + 동사",
        "question": "밑줄 친 where의 선행사를 쓰고, where를 전치사+which로 바꾸시오.",
        "answer": "선행사: fertilizer companies / in which (at which도 가능)"
    },
    {
        "id": gen_id("gq"),
        "unit": 4,
        "grammar_point": "분사 형용사 (수동 의미의 과거분사)",
        "sentence": "Fabric made from coffee grounds absorbs sweat, dries quickly, and provides UV protection.",
        "explanation": "과거분사가 명사를 수식할 때 수동/완료의 의미. 'made from coffee grounds'가 'Fabric'을 수식.",
        "key_pattern": "명사 + p.p. + 수식어구",
        "question": "'커피 찌꺼기로 만들어진 컵'을 영어로 쓰시오.",
        "answer": "cups made from coffee grounds"
    },
    {
        "id": gen_id("gq"),
        "unit": 4,
        "grammar_point": "not only A but also B",
        "sentence": "Reusable cups from coffee grounds not only have a visually appealing appearance but also preserve the taste of the coffee.",
        "explanation": "not only A but also B: 'A뿐만 아니라 B도'. 상관접속사로 A와 B는 문법적으로 동일한 형태여야 함.",
        "key_pattern": "not only + A + but also + B",
        "question": "'그는 영리할 뿐만 아니라 친절하기도 하다'를 not only ~ but also를 사용해 영작하시오.",
        "answer": "He is not only intelligent but also kind."
    },
    {
        "id": gen_id("gq"),
        "unit": 4,
        "grammar_point": "by V-ing (수단/방법)",
        "sentence": "By repurposing coffee grounds in this manner, related businesses and local farmers can benefit.",
        "explanation": "by + V-ing: '~함으로써' 수단이나 방법을 나타냄. 문두에 오면 주절의 주어와 일치해야 함.",
        "key_pattern": "By + V-ing ~, 주어 + 동사",
        "question": "'열심히 공부함으로써 그는 시험에 합격했다'를 by V-ing를 사용해 영작하시오.",
        "answer": "By studying hard, he passed the exam."
    },
]

# ============================================================
# 전체 데이터 구성
# ============================================================
lesson_info = {
    1: {
        "title": "You and I Become \"We\"",
        "subtitle": "The Power of Friendliness: Soft but Strong",
        "topic": "진화, 친절함, 협동"
    },
    2: {
        "title": "Open a Book, Open the World",
        "subtitle": "Gathering of the Whakapapa",
        "topic": "문화, 가족, 구전 유산"
    },
    3: {
        "title": "Free Yourself with Science",
        "subtitle": "Tuning Out: The Science of Noise-Cancellation",
        "topic": "과학, 소음 제거 기술"
    },
    4: {
        "title": "Let It Be Green",
        "subtitle": "A Better Future for Coffee Waste",
        "topic": "환경, 지속가능성, 순환경제"
    }
}

def make_word(unit, english, korean, pos, example):
    return {
        "id": gen_id("tw"),
        "unit": unit,
        "lesson_title": lesson_info[unit]["title"],
        "lesson_subtitle": lesson_info[unit]["subtitle"],
        "topic": lesson_info[unit]["topic"],
        "english": english,
        "korean": korean,
        "part_of_speech": pos,
        "example": example,
        "source": "textbook",
        "created_at": now
    }

textbook_words = []
for (eng, kor, pos, ex) in lesson1_words:
    textbook_words.append(make_word(1, eng, kor, pos, ex))
for (eng, kor, pos, ex) in lesson2_words:
    textbook_words.append(make_word(2, eng, kor, pos, ex))
for (eng, kor, pos, ex) in lesson3_words:
    textbook_words.append(make_word(3, eng, kor, pos, ex))
for (eng, kor, pos, ex) in lesson4_words:
    textbook_words.append(make_word(4, eng, kor, pos, ex))

# 문법 QA 전체
grammar_qa = []
for gq in lesson1_grammar + lesson2_grammar + lesson3_grammar + lesson4_grammar:
    gq["lesson_title"] = lesson_info[gq["unit"]]["title"]
    gq["source"] = "textbook"
    gq["created_at"] = now
    grammar_qa.append(gq)

output = {
    "textbook_info": {
        "title": "공통영어 1",
        "publisher": "미래엔",
        "author": "김성연",
        "year": 2026,
        "grade": 1,
        "total_units": 4
    },
    "lesson_info": lesson_info,
    "textbook_words": textbook_words,
    "textbook_grammar": grammar_qa,
    "stats": {
        "total_words": len(textbook_words),
        "total_grammar": len(grammar_qa),
        "words_per_unit": {
            str(u): len([w for w in textbook_words if w["unit"] == u])
            for u in [1, 2, 3, 4]
        }
    }
}

with open('/mnt/g/mathesis/[Word list] Word_gacha/textbook_pdf/textbook_data.json', 'w', encoding='utf-8') as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print("생성 완료!")
print(f"총 단어: {output['stats']['total_words']}개")
print(f"총 문법 QA: {output['stats']['total_grammar']}개")
print(f"단원별 단어:", output['stats']['words_per_unit'])
