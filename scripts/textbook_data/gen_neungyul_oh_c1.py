import json
import uuid
from datetime import datetime

def gen_id(prefix):
    return prefix + "_" + uuid.uuid4().hex[:12]

now = datetime.utcnow().isoformat() + "Z"

lesson_info = {
    "1": {"title": "A Journey into Yourself", "subtitle": "", "topic": "자기 발견, 도전, 성장"},
    "2": {"title": "Health Matters", "subtitle": "", "topic": "정신건강, 의료, 봉사"},
    "3": {"title": "Nature", "subtitle": "", "topic": "자연, 환경, 지속가능성"},
    "4": {"title": "The Winds of Change", "subtitle": "", "topic": "사진, 사회변화, 역사"},
    "SL": {"title": "Special Lesson", "subtitle": "", "topic": "전통, 일상, 문화"},
}

# ──────────────────────────────────────────
# Lesson 1 단어
# ──────────────────────────────────────────
L1 = lesson_info["1"]
words_l1_raw = [
    ("discover", "발견하다", "verb", "She discovered a new passion through the challenge."),
    ("challenge", "도전", "noun", "Every challenge is an opportunity to grow."),
    ("semester", "학기", "noun", "The new semester started with an exciting assignment."),
    ("comfort", "편안함", "noun", "Leaving your comfort zone helps you grow."),
    ("assignment", "과제", "noun", "The assignment required students to try something new."),
    ("involve", "포함하다", "verb", "The task involved a lot of creativity."),
    ("give it a try", "한번 해보다", "phrase", "I decided to give it a try even though I was nervous."),
    ("preference", "선호도", "noun", "My preference changed after I tried the activity."),
    ("opportunity", "기회", "noun", "This is a great opportunity for self-discovery."),
    ("awkward", "어색한", "adj", "It felt awkward at first, but I kept going."),
    ("absorbed", "몰두한", "adj", "She was absorbed in the new activity."),
    ("satisfying", "만족스러운", "adj", "Completing the challenge was very satisfying."),
    ("distract", "주의를 분산시키다", "verb", "Don't let fear distract you from trying."),
    ("overcome", "극복하다", "verb", "He overcame his shyness through the experience."),
    ("discomfort", "불편함", "noun", "Feeling discomfort is part of growth."),
    ("come across", "우연히 만나다", "phrase", "I came across an interesting activity online."),
    ("assure", "확신시키다", "verb", "The instructor assured us it would be fun."),
    ("sign up", "등록하다", "phrase", "She signed up for a pottery class."),
    ("instructor", "강사", "noun", "The instructor was very encouraging."),
    ("properly", "제대로", "adv", "Make sure to do the task properly."),
    ("manage to", "간신히 ~하다", "phrase", "I managed to complete the assignment on time."),
    ("excitement", "흥분", "noun", "There was a sense of excitement at the start."),
    ("adventure", "모험", "noun", "Trying new things is a kind of adventure."),
    ("forehead", "이마", "noun", "Sweat dripped down her forehead during the task."),
    ("concern", "걱정", "noun", "Her concern faded as she got more comfortable."),
    ("overall", "전반적인", "adj", "The overall experience was very positive."),
    ("reaction", "반응", "noun", "His reaction surprised everyone."),
    ("perspective", "관점", "noun", "The experience gave her a new perspective."),
    ("capable", "능력 있는", "adj", "She realized she was more capable than she thought."),
]

words_l1 = []
for (eng, kor, pos, ex) in words_l1_raw:
    words_l1.append({
        "id": gen_id("tw"),
        "unit": 1,
        "lesson_title": L1["title"],
        "lesson_subtitle": L1["subtitle"],
        "topic": L1["topic"],
        "english": eng,
        "korean": kor,
        "part_of_speech": pos,
        "example": ex,
        "source": "textbook",
        "created_at": now,
    })

# ──────────────────────────────────────────
# Lesson 2 단어
# ──────────────────────────────────────────
L2 = lesson_info["2"]
words_l2_raw = [
    ("founder", "창립자", "noun", "She is the founder of a mental health organization."),
    ("inspire", "영감을 주다", "verb", "His story inspired many young people."),
    ("come up with", "생각해내다", "phrase", "She came up with a new way to help patients."),
    ("psychiatrist", "정신과의사", "noun", "The psychiatrist developed a new therapy program."),
    ("severely", "심하게", "adv", "He was severely depressed after losing his job."),
    ("depressed", "우울한", "adj", "Many people feel depressed without proper support."),
    ("afford", "~할 여유가 있다", "verb", "Not everyone can afford mental health treatment."),
    ("transportation", "교통", "noun", "Lack of transportation limits access to care."),
    ("treatment", "치료", "noun", "Early treatment can prevent serious illness."),
    ("population", "인구", "noun", "A large portion of the population needs mental health support."),
    ("accessible", "접근 가능한", "adj", "Mental health care should be accessible to everyone."),
    ("therapy", "치료법", "noun", "Talk therapy can be very effective."),
    ("depression", "우울증", "noun", "Depression is a common mental health condition."),
    ("anxiety", "불안", "noun", "Anxiety can be managed with proper help."),
    ("respected", "존경받는", "adj", "She is a respected figure in the medical community."),
    ("volunteer", "자원봉사자", "noun", "Many volunteers help at the counseling center."),
    ("counselor", "상담사", "noun", "The counselor listened carefully to the patient."),
    ("empathy", "공감", "noun", "Empathy is key to effective counseling."),
    ("engage in", "~에 참여하다", "phrase", "Students are encouraged to engage in counseling."),
    ("reliable", "신뢰할 수 있는", "adj", "A reliable support system is essential for recovery."),
    ("relate to", "~와 공감하다", "phrase", "It helps to talk to someone who can relate to you."),
    ("struggle", "힘겨워하다", "verb", "Many people struggle silently with mental illness."),
    ("incredibly", "믿을 수 없을 정도로", "adv", "The program was incredibly successful."),
    ("face-to-face", "대면으로", "adj", "Face-to-face counseling is most effective."),
    ("available", "이용 가능한", "adj", "Online therapy is now widely available."),
    ("vision", "비전", "noun", "The founder had a vision of accessible mental health care."),
    ("distance", "거리", "noun", "Distance is no longer a barrier to mental health care."),
    ("expand", "확장하다", "verb", "The program plans to expand to rural areas."),
    ("wounded", "상처받은", "adj", "Wounded soldiers often need mental health support."),
    ("be ashamed of", "~을 부끄러워하다", "phrase", "No one should be ashamed of seeking help."),
    ("go through", "겪다", "phrase", "She went through a difficult period but recovered."),
    ("pass away", "돌아가시다", "phrase", "His mentor passed away, but the work continues."),
    ("recovery", "회복", "noun", "Recovery is possible with the right support."),
    ("back on track", "다시 정상화되다", "phrase", "After therapy, she got back on track."),
    ("rewarding", "보람 있는", "adj", "Helping others is deeply rewarding."),
]

words_l2 = []
for (eng, kor, pos, ex) in words_l2_raw:
    words_l2.append({
        "id": gen_id("tw"),
        "unit": 2,
        "lesson_title": L2["title"],
        "lesson_subtitle": L2["subtitle"],
        "topic": L2["topic"],
        "english": eng,
        "korean": kor,
        "part_of_speech": pos,
        "example": ex,
        "source": "textbook",
        "created_at": now,
    })

# ──────────────────────────────────────────
# Lesson 3 단어
# ──────────────────────────────────────────
L3 = lesson_info["3"]
words_l3_raw = [
    ("appreciate", "감사하다", "verb", "We should appreciate the beauty of nature."),
    ("produce", "생산하다", "verb", "Trees produce oxygen for all living things."),
    ("nest", "둥지", "noun", "Birds build nests in trees."),
    ("branch", "나뭇가지", "noun", "The bird sat on a branch."),
    ("urban", "도시의", "adj", "Urban areas need more green spaces."),
    ("millennium", "천년", "noun", "Some trees have lived for over a millennium."),
    ("drought", "가뭄", "noun", "The drought severely damaged the crops."),
    ("decline", "감소하다", "verb", "Bee populations are declining rapidly."),
    ("threat", "위협", "noun", "Climate change is a major threat to biodiversity."),
    ("resident", "주민", "noun", "Local residents joined the tree planting campaign."),
    ("consumption", "소비", "noun", "Reducing energy consumption helps the environment."),
    ("emission", "배출", "noun", "Carbon emissions are a major cause of climate change."),
    ("ambitious", "야심찬", "adj", "The city had ambitious plans to reduce emissions."),
    ("interactive", "상호작용의", "adj", "The interactive app tracks your carbon footprint."),
    ("symbol", "상징", "noun", "The tree is a symbol of life and strength."),
    ("indicate", "나타내다", "verb", "The data indicates a decline in air quality."),
    ("species", "종", "noun", "Many species are endangered due to habitat loss."),
    ("council", "위원회", "noun", "The city council approved the new green policy."),
    ("unexpected", "예상치 못한", "adj", "There were unexpected benefits from the reforestation."),
    ("phenomenon", "현상", "noun", "Climate change is a global phenomenon."),
    ("separate", "분리하다", "verb", "We should separate recyclables from trash."),
    ("popularity", "인기", "noun", "Eco-friendly products are growing in popularity."),
    ("sustainable", "지속 가능한", "adj", "We need sustainable energy solutions."),
    ("collective", "집단적인", "adj", "Climate action requires collective effort."),
    ("generation", "세대", "noun", "We must protect the planet for future generations."),
    ("environmentally friendly", "친환경적인", "phrase", "Choose environmentally friendly products when possible."),
    ("measure", "측정하다", "verb", "Scientists measure temperature changes over decades."),
    ("monitor", "모니터링하다", "verb", "Satellites monitor deforestation from space."),
    ("on track", "순조롭게 진행 중인", "phrase", "The project is on track to meet its goals."),
]

words_l3 = []
for (eng, kor, pos, ex) in words_l3_raw:
    words_l3.append({
        "id": gen_id("tw"),
        "unit": 3,
        "lesson_title": L3["title"],
        "lesson_subtitle": L3["subtitle"],
        "topic": L3["topic"],
        "english": eng,
        "korean": kor,
        "part_of_speech": pos,
        "example": ex,
        "source": "textbook",
        "created_at": now,
    })

# ──────────────────────────────────────────
# Lesson 4 단어
# ──────────────────────────────────────────
L4 = lesson_info["4"]
words_l4_raw = [
    ("capture", "포착하다", "verb", "The photographer captured the moment perfectly."),
    ("grab hold of", "붙잡다", "phrase", "She grabbed hold of the railing for support."),
    ("convey", "전달하다", "verb", "A powerful photo can convey strong emotions."),
    ("complex", "복잡한", "adj", "Social issues are often complex and layered."),
    ("spark", "불꽃, 촉발하다", "noun", "The photo sparked a national debate."),
    ("industry", "산업", "noun", "The steel industry employed thousands of workers."),
    ("steel mill", "제철소", "noun", "Children worked long hours in steel mills."),
    ("regard A as B", "A를 B로 여기다", "phrase", "Many regard her as a pioneer in photojournalism."),
    ("economic", "경제적인", "adj", "Economic hardship led to child labor."),
    ("likely", "~할 것 같은", "adj", "Children are more likely to be exploited."),
    ("flare", "불꽃", "noun", "Flares from the steel mill lit the night sky."),
    ("oil-soaked", "기름에 젖은", "adj", "Workers wore oil-soaked clothes."),
    ("beneath", "아래에", "prep", "The child worked beneath dangerous machines."),
    ("article", "기사", "noun", "The article exposed the harsh working conditions."),
    ("feature", "특집으로 다루다", "verb", "The magazine featured her photo on the cover."),
    ("flame", "불꽃", "noun", "Flames from the furnace lit the worker's face."),
    ("put out", "끄다", "phrase", "They could not put out the fire in time."),
    ("impact", "영향", "noun", "Her photography had a lasting impact on society."),
    ("awareness", "인식", "noun", "The photos raised awareness of child labor."),
    ("standard", "기준", "noun", "New labor standards were established after the reform."),
    ("establish", "확립하다", "verb", "The law established minimum working age requirements."),
    ("passage", "통로", "noun", "The narrow passage led to the factory floor."),
    ("expose", "폭로하다", "verb", "The documentary exposed illegal working conditions."),
    ("harsh", "가혹한", "adj", "Children faced harsh conditions in factories."),
    ("revolution", "혁명", "noun", "The industrial revolution changed working conditions."),
    ("employ", "고용하다", "verb", "Factories employed young children in dangerous jobs."),
    ("go on strike", "파업하다", "phrase", "Workers went on strike to demand better conditions."),
    ("reveal", "드러내다", "verb", "The photos revealed the truth about child labor."),
    ("committee", "위원회", "noun", "A committee was formed to investigate child labor."),
    ("investigative", "조사적인", "adj", "The investigative report shocked the nation."),
    ("pretend", "~인 척하다", "verb", "She pretended to be a worker to enter the factory."),
    ("insurance", "보험", "noun", "Workers had no insurance in case of accidents."),
    ("inspector", "조사관", "noun", "Government inspectors visited the factories."),
    ("take advantage of", "~을 이용하다", "phrase", "Factory owners took advantage of child workers."),
    ("helpless", "무력한", "adj", "The children were helpless against exploitation."),
    ("weave", "짜다", "verb", "Children were forced to weave cloth in factories."),
    ("equipment", "장비", "noun", "Old equipment made the factories more dangerous."),
    ("tragic", "비극적인", "adj", "Many children died in tragic accidents."),
    ("can't help but", "~하지 않을 수 없다", "phrase", "You can't help but feel moved by the photos."),
    ("exhibition", "전시회", "noun", "An exhibition of her photographs toured the country."),
    ("ban", "금지하다", "verb", "The government banned child labor in 1938."),
    ("congress", "의회", "noun", "Congress passed laws to protect child workers."),
    ("illegal", "불법적인", "adj", "Child labor is now illegal in most countries."),
]

words_l4 = []
for (eng, kor, pos, ex) in words_l4_raw:
    words_l4.append({
        "id": gen_id("tw"),
        "unit": 4,
        "lesson_title": L4["title"],
        "lesson_subtitle": L4["subtitle"],
        "topic": L4["topic"],
        "english": eng,
        "korean": kor,
        "part_of_speech": pos,
        "example": ex,
        "source": "textbook",
        "created_at": now,
    })

# ──────────────────────────────────────────
# Special Lesson 단어
# ──────────────────────────────────────────
LSL = lesson_info["SL"]
words_sl_raw = [
    ("tradition", "전통", "noun", "The tradition has been passed down for centuries."),
    ("purely", "순전히", "adv", "The custom exists purely for cultural reasons."),
    ("prove", "증명하다", "verb", "The event proved that traditions still matter."),
    ("ordinary", "평범한", "adj", "An ordinary day became extraordinary."),
    ("barely", "거의 ~않다", "adv", "He could barely recognize the old neighborhood."),
    ("servant", "하인", "noun", "Servants played an important role in historical households."),
    ("pass by", "지나가다", "phrase", "Years passed by, but the tradition remained."),
    ("spot", "발견하다", "verb", "She spotted an interesting custom at the festival."),
    ("compared to", "~와 비교했을 때", "phrase", "Compared to modern times, life was simpler then."),
    ("unaware", "모르는", "adj", "Many young people are unaware of traditional customs."),
    ("in remembrance of", "~를 기리며", "phrase", "The ceremony is held in remembrance of past heroes."),
    ("collapse", "무너지다", "verb", "The old building collapsed during the ceremony."),
]

words_sl = []
for (eng, kor, pos, ex) in words_sl_raw:
    words_sl.append({
        "id": gen_id("tw"),
        "unit": "SL",
        "lesson_title": LSL["title"],
        "lesson_subtitle": LSL["subtitle"],
        "topic": LSL["topic"],
        "english": eng,
        "korean": kor,
        "part_of_speech": pos,
        "example": ex,
        "source": "textbook",
        "created_at": now,
    })

# ──────────────────────────────────────────
# Grammar
# ──────────────────────────────────────────
grammar_raw = [
    # Unit 1
    (1, "to부정사의 명사적 용법", "To try new things is the best way to grow.", "to부정사가 문장의 주어나 목적어, 보어 역할을 한다.", "To + V (주어/목적어/보어)", "To try의 문법적 역할은?", "주어 (명사적 용법)", "A Journey into Yourself"),
    (1, "현재분사 vs 과거분사", "The satisfying experience made her more confident.", "현재분사(V-ing)는 능동/진행, 과거분사(p.p.)는 수동/완료를 나타낸다.", "N + V-ing / N + p.p.", "satisfying과 satisfied의 차이는?", "satisfying은 능동(주는), satisfied는 수동(받는)", "A Journey into Yourself"),
    (1, "접속사 when/while", "While she was nervous, she decided to give it a try.", "when은 특정 시점, while은 동시 진행을 나타낸다.", "When/While + S + V, S + V", "while의 의미는?", "~하는 동안 (동시 진행)", "A Journey into Yourself"),
    (1, "조동사 should", "You should try new activities to discover your talents.", "should는 충고나 권고를 나타낸다.", "S + should + V", "should의 의미는?", "~해야 한다 (권고/충고)", "A Journey into Yourself"),
    # Unit 2
    (2, "관계대명사 who/which/that", "She met a counselor who had overcome depression herself.", "who는 사람, which는 사물, that은 사람/사물 모두 가능하다.", "N(사람) + who + V / N(사물) + which + V", "who가 이끄는 절의 역할은?", "선행사 a counselor를 수식하는 관계사절", "Health Matters"),
    (2, "수동태의 다양한 형태", "The program was founded by a psychiatrist in 2005.", "수동태는 be + p.p.로 구성되며 행위의 대상이 주어가 된다.", "be + p.p. (by + 행위자)", "was founded의 주어는?", "The program (행위의 대상)", "Health Matters"),
    (2, "접속사 because/since/as", "Because transportation was limited, patients couldn't get help.", "because/since/as 모두 이유를 나타내지만 강조도가 다르다.", "Because/Since/As + S + V, S + V", "because와 since의 차이는?", "because가 더 강한 인과관계를 표현", "Health Matters"),
    (2, "비교급 표현", "Online therapy is more accessible than in-person visits.", "비교급은 형용사/부사에 -er이나 more를 붙여 만든다.", "more + adj + than / adj-er + than", "more accessible than의 의미는?", "~보다 더 접근하기 쉬운", "Health Matters"),
    # Unit 3
    (3, "현재완료 진행형 have been V-ing", "Scientists have been monitoring climate change for decades.", "현재완료 진행형은 과거에 시작해 현재까지 진행 중인 동작을 강조한다.", "have/has been + V-ing", "have been monitoring의 의미는?", "과거부터 현재까지 계속 모니터링해오고 있다", "Nature"),
    (3, "부사절 접속사 while/whereas", "While cities expand, natural habitats are shrinking.", "while/whereas는 대조를 나타내는 접속사로 쓰인다.", "While/Whereas + S + V, S + V", "while의 대조 용법의 의미는?", "~하는 반면에", "Nature"),
    (3, "수동태 be p.p.", "Many species are threatened by habitat destruction.", "수동태는 주어가 행위의 대상일 때 쓰인다.", "be + p.p.", "are threatened의 의미는?", "위협을 받고 있다 (수동)", "Nature"),
    (3, "관계부사 where", "There are regions where deforestation is rapidly occurring.", "관계부사 where는 장소를 나타내는 선행사 뒤에 쓰인다.", "place + where + S + V", "where의 선행사는?", "regions (장소)", "Nature"),
    # Unit 4 + SL
    (4, "동명사 vs to부정사", "She enjoyed capturing the struggles of ordinary people.", "enjoy, finish 등의 동사는 동명사를 목적어로 취한다.", "enjoy/finish/avoid + V-ing", "capturing의 역할은?", "enjoyed의 목적어 (동명사)", "The Winds of Change"),
    (4, "강조구문 It is ~ that", "It was her photographs that changed labor laws.", "강조구문 It is ~ that은 특정 어구를 강조한다.", "It is/was + [강조 어구] + that + S + V", "강조되는 부분은?", "her photographs (주어 강조)", "The Winds of Change"),
    (4, "조동사 과거형 would/could", "Children would work 16 hours a day in factories.", "would와 could의 과거형은 과거의 습관이나 가능성을 나타낸다.", "would/could + V (과거 습관/가능성)", "would work의 의미는?", "과거의 반복적 행동 (~하곤 했다)", "The Winds of Change"),
    (4, "접속사 although/even though", "Although the work was dangerous, children had no choice.", "although/even though는 양보를 나타내는 접속사이다.", "Although/Even though + S + V, S + V", "although의 의미는?", "비록 ~일지라도", "The Winds of Change"),
]

textbook_grammar = []
for (unit, gp, sentence, explanation, key_pattern, question, answer, lesson_title) in grammar_raw:
    textbook_grammar.append({
        "id": gen_id("tg"),
        "unit": unit,
        "grammar_point": gp,
        "sentence": sentence,
        "explanation": explanation,
        "key_pattern": key_pattern,
        "question": question,
        "answer": answer,
        "lesson_title": lesson_title,
        "source": "textbook",
        "created_at": now,
    })

# ──────────────────────────────────────────
# 조합 및 출력
# ──────────────────────────────────────────
textbook_words = words_l1 + words_l2 + words_l3 + words_l4 + words_sl

words_per_unit = {}
for w in textbook_words:
    u = str(w["unit"])
    words_per_unit[u] = words_per_unit.get(u, 0) + 1

output = {
    "textbook_info": {
        "id": "neungyul_oh_c1",
        "title": "공통영어1",
        "publisher": "NE능률",
        "author": "오선영",
        "year": 2026,
        "grade": 1,
        "semester": 1,
        "total_units": 4,
    },
    "lesson_info": lesson_info,
    "textbook_words": textbook_words,
    "textbook_grammar": textbook_grammar,
    "stats": {
        "total_words": len(textbook_words),
        "total_grammar": len(textbook_grammar),
        "words_per_unit": words_per_unit,
    },
}

out_path = "/mnt/g/mathesis/[Word list] Word_gacha/textbook_pdf/textbooks/neungyul_oh_c1.json"
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print(f"[NE능률 오선영 공통영어1] 저장 완료: {out_path}")
print(f"  총 단어 수: {output['stats']['total_words']}")
print(f"  총 문법 수: {output['stats']['total_grammar']}")
print(f"  단원별 단어 수: {output['stats']['words_per_unit']}")
