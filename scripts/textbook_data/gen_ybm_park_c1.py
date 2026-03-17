import json
import uuid
from datetime import datetime

def gen_id(prefix):
    return prefix + "_" + uuid.uuid4().hex[:12]

now = datetime.utcnow().isoformat() + "Z"

lesson_info = {
    "1": {"title": "Enrich Your Life", "subtitle": "The Magic of Morning Pages", "topic": "자기계발, 글쓰기, 아침 루틴"},
    "2": {"title": "Explore Wildlife Wonders", "subtitle": "The Mind of an Octopus", "topic": "동물, 지능, 자연"},
    "3": {"title": "Embrace Diversity, Broaden Your Horizons", "subtitle": "English or Englishes?", "topic": "다양성, 영어, 세계화"},
    "4": {"title": "When Art Meets Technology", "subtitle": "Artificial Intelligence and the Arts", "topic": "예술, AI, 저작권"},
}

# ──────────────────────────────────────────
# Lesson 1 단어
# ──────────────────────────────────────────
L1 = lesson_info["1"]
words_l1_raw = [
    ("enormously", "엄청나게", "adv", "Reading in the morning helps enormously."),
    ("episode", "에피소드, 한 편", "noun", "She watched every episode of the series."),
    ("subscriber", "구독자", "noun", "The channel gained a million subscribers."),
    ("ideally", "이상적으로", "adv", "Ideally, you should write every morning."),
    ("concept", "개념", "noun", "The concept of morning pages is simple."),
    ("cross one's mind", "마음속에 떠오르다", "phrase", "It never crossed my mind to quit."),
    ("technique", "기법, 기술", "noun", "She learned a new writing technique."),
    ("originally", "원래", "adv", "The idea was originally from Julia Cameron."),
    ("overcome", "극복하다", "verb", "Writing helps you overcome creative blocks."),
    ("loss", "상실, 손실", "noun", "He felt a great sense of loss."),
    ("creativity", "창의력", "noun", "Morning pages can boost your creativity."),
    ("cleanse", "정화하다", "verb", "Writing can cleanse your mind."),
    ("correctly", "올바르게", "adv", "Make sure you understand the task correctly."),
    ("completely", "완전히", "adv", "She was completely absorbed in her writing."),
    ("private", "개인적인", "adj", "Your journal entries are private."),
    ("complaint", "불평, 불만", "noun", "She wrote down every complaint she had."),
    ("recipe", "요리법, 비결", "noun", "Morning pages are the recipe for creativity."),
    ("productive", "생산적인", "adj", "Starting the day with writing feels productive."),
    ("random", "무작위의", "adj", "Write random thoughts without judgment."),
    ("slight", "약간의", "adj", "There was a slight improvement in her mood."),
    ("assignment", "과제", "noun", "The teacher gave an assignment on journaling."),
    ("normally", "보통", "adv", "She normally wakes up at six."),
    ("come up with", "~을 생각해내다", "phrase", "Can you come up with a new idea?"),
    ("relate to", "~와 관련되다", "phrase", "I can relate to what you're saying."),
    ("concentrate", "집중하다", "verb", "It's hard to concentrate early in the morning."),
    ("stick to", "~을 고수하다", "phrase", "Stick to your morning routine every day."),
    ("release", "해방하다, 방출하다", "verb", "Writing releases negative emotions."),
    ("relieve", "완화하다", "verb", "Exercise can relieve stress."),
    ("tension", "긴장", "noun", "Writing helps reduce tension."),
    ("inner", "내면의", "adj", "She discovered her inner voice through writing."),
    ("performance", "실력, 수행", "noun", "Her performance improved after journaling."),
    ("challenging", "도전적인", "adj", "Waking up early can be challenging."),
    ("value", "가치", "noun", "She found value in daily reflection."),
    ("passion", "열정", "noun", "His passion for writing grew over time."),
    ("host", "진행자", "noun", "The host introduced the concept of morning pages."),
    ("vague", "막연한", "adj", "He had a vague idea of what to write."),
    ("publish", "발표하다, 출판하다", "verb", "She plans to publish her journal someday."),
    ("drive", "추진력", "noun", "His drive to improve motivated him daily."),
    ("achieve", "달성하다", "verb", "You can achieve your goals with daily effort."),
    ("aim", "목표, 목적", "noun", "Her aim is to write three pages every day."),
    ("explore", "탐구하다", "verb", "Use morning pages to explore your thoughts."),
    ("ultimate", "궁극적인", "adj", "The ultimate goal is self-discovery."),
    ("specific", "구체적인", "adj", "Write down specific goals each morning."),
    ("meditate", "명상하다", "verb", "Some people meditate before writing."),
    ("combine A with B", "A를 B와 결합하다", "phrase", "She combines writing with meditation."),
    ("cue", "신호, 계기", "noun", "A morning alarm can be a cue to start writing."),
    ("attractive", "매력적인", "adj", "The idea of morning pages sounded attractive."),
    ("track", "기록하다, 동향", "verb", "Track your progress in your journal."),
    ("progress", "진전, 발전", "noun", "She noticed real progress after a month."),
    ("mark", "표시하다, 기록하다", "verb", "Mark each day you complete your morning pages."),
    ("flexible", "유연한", "adj", "Be flexible with your writing topics."),
    ("all the time", "항상", "phrase", "She writes in her journal all the time."),
    ("find out", "알아내다", "phrase", "Morning pages help you find out what you want."),
    ("be talented at", "~에 재능이 있다", "phrase", "He is talented at creative writing."),
    ("be interested in", "~에 흥미가 있다", "phrase", "She is interested in self-improvement."),
    ("choir", "합창단", "noun", "She joined the school choir after journaling about music."),
    ("incredible", "믿을 수 없는", "adj", "The results were incredible after just one week."),
    ("by the way", "그런데", "phrase", "By the way, have you tried morning pages?"),
    ("critically", "비판적으로", "adv", "Read your writing critically later."),
    ("attend", "참석하다", "verb", "She attended a writing workshop."),
    ("logical", "논리적인", "adj", "Her writing became more logical over time."),
    ("gathering", "모임", "noun", "A gathering of writers shared their experiences."),
    ("detailed", "세부적인", "adj", "She wrote detailed descriptions of her feelings."),
    ("approach", "접근법", "noun", "Morning pages are a creative approach to self-help."),
    ("conversation", "대화", "noun", "She had an honest conversation with herself."),
    ("intend", "의도하다", "verb", "She intended to write three pages daily."),
    ("emphasize", "강조하다", "verb", "The author emphasizes consistency in writing."),
    ("appropriate", "적절한", "adj", "Choose an appropriate time for your morning pages."),
    ("disability", "장애", "noun", "Morning pages help people with various disabilities."),
    ("constantly", "끊임없이", "adv", "She constantly reminded herself to write."),
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
    ("undergo", "겪다", "verb", "Octopuses undergo remarkable transformations."),
    ("pointed", "뾰족한", "adj", "The octopus has pointed tentacles."),
    ("rapid", "빠른", "adj", "Octopuses can make rapid color changes."),
    ("boneless", "뼈 없는", "adj", "An octopus is a boneless creature."),
    ("deny", "부정하다", "verb", "No one can deny the intelligence of octopuses."),
    ("alien", "이질적인", "adj", "Their behavior seems alien to humans."),
    ("acknowledge", "인정하다", "verb", "Scientists acknowledge the octopus's intelligence."),
    ("dislike", "싫어하다", "verb", "Some octopuses dislike certain researchers."),
    ("inside", "내부에", "adv", "There is complex activity inside an octopus's brain."),
    ("evil", "사악한", "adj", "Octopuses were once thought to be evil creatures."),
    ("consciousness", "의식", "noun", "Do octopuses have a form of consciousness?"),
    ("tale", "이야기", "noun", "She told a fascinating tale about octopuses."),
    ("subjective", "주관적인", "adj", "Pain is a subjective experience."),
    ("meaningful", "의미있는", "adj", "Octopus behavior is meaningful and complex."),
    ("affect", "영향을 미치다", "verb", "Environment can affect octopus behavior."),
    ("similarity", "유사성", "noun", "There are surprising similarities between octopuses and humans."),
    ("conclude", "결론짓다", "verb", "Scientists concluded that octopuses feel pain."),
    ("camouflage", "위장하다", "verb", "Octopuses can camouflage themselves instantly."),
    ("complex", "복잡한", "adj", "The octopus has a complex nervous system."),
    ("texture", "질감", "noun", "Octopuses can change their skin texture."),
    ("nervous system", "신경계", "noun", "Their nervous system is highly developed."),
    ("carry out", "수행하다", "phrase", "Octopuses carry out complex tasks."),
    ("assume", "추정하다", "verb", "We often assume animals don't feel emotions."),
    ("instantly", "즉시", "adv", "They can change color instantly."),
    ("treat", "다루다", "verb", "Scientists treat octopuses as highly intelligent."),
    ("diversity", "다양성", "noun", "The ocean is full of biological diversity."),
    ("respect", "존중", "noun", "We should show respect for all living things."),
    ("rival", "경쟁자", "noun", "The octopus has no rival in disguise ability."),
    ("experiment", "실험", "noun", "The experiment proved octopuses can solve puzzles."),
    ("utilize", "활용하다", "verb", "Octopuses utilize tools in their environment."),
    ("cucumber", "오이", "noun", "An octopus was given a cucumber to play with."),
    ("a handful of", "한 줌의", "phrase", "Only a handful of animals can use tools."),
    ("perform", "수행하다", "verb", "Octopuses perform complex behaviors."),
    ("detection", "감지", "noun", "Their detection of predators is rapid."),
    ("communication", "소통", "noun", "Color changes are a form of communication."),
    ("encounter", "마주치다", "verb", "The octopus encountered a crab and captured it."),
    ("registration", "등록", "noun", "The registration of pain signals in the brain."),
    ("sufficient", "충분한", "adj", "Sufficient evidence supports octopus intelligence."),
    ("habitat", "서식지", "noun", "Their natural habitat is the ocean floor."),
    ("apply", "적용하다", "verb", "We can apply this knowledge to animal welfare."),
    ("in advance", "미리", "phrase", "Plan your observations in advance."),
    ("acquire", "습득하다", "verb", "Octopuses can acquire new skills quickly."),
    ("presentation", "발표", "noun", "She gave a presentation on octopus intelligence."),
    ("particular", "특정한", "adj", "This particular octopus was very curious."),
    ("documentary", "다큐멘터리", "noun", "A documentary about octopuses won an award."),
    ("reward", "보상", "noun", "The octopus received a reward after solving the puzzle."),
    ("strategy", "전략", "noun", "Each octopus uses a different hunting strategy."),
    ("entrance", "입구", "noun", "The octopus blocked the entrance to its den."),
    ("maintain", "유지하다", "verb", "Octopuses maintain their camouflage skillfully."),
    ("impressive", "인상적인", "adj", "Their ability to change color is impressive."),
    ("temperature", "온도", "noun", "They can sense water temperature changes."),
    ("shell", "껍질", "noun", "An octopus sometimes hides inside a shell."),
    ("imagination", "상상력", "noun", "The octopus's behavior fires our imagination."),
    ("pile", "더미, 쌓다", "noun", "The octopus built a pile of rocks."),
    ("definitely", "분명히", "adv", "Octopuses are definitely intelligent creatures."),
    ("shelter", "피신처", "noun", "The octopus found shelter under a rock."),
    ("inspiring", "영감을 주는", "adj", "Their behavior is inspiring to scientists."),
    ("predator", "포식자", "noun", "The shark is a natural predator of the octopus."),
    ("surface", "표면", "noun", "The octopus can change its skin surface."),
    ("aquarium", "수족관", "noun", "The aquarium has an octopus exhibit."),
    ("memorable", "기억에 남는", "adj", "The octopus documentary was memorable."),
    ("break up", "분해되다", "phrase", "The group decided to break up the experiment."),
    ("clever", "영리한", "adj", "Octopuses are clever problem solvers."),
    ("limited", "제한된", "adj", "Our knowledge of octopuses is still limited."),
    ("extreme", "극단적인", "adj", "Octopuses live in extreme ocean conditions."),
    ("expand", "확장하다", "verb", "Research on animal intelligence continues to expand."),
    ("surround", "둘러싸다", "verb", "The octopus surrounded its prey."),
    ("be linked to", "~와 연결되다", "phrase", "Intelligence is be linked to complex behavior."),
    ("prey", "먹이", "noun", "The crab is the octopus's favorite prey."),
    ("relaxed", "여유로운", "adj", "The octopus looked relaxed in its tank."),
    ("intelligent", "지능이 있는", "adj", "Octopuses are surprisingly intelligent animals."),
    ("present", "현재의", "adj", "The present research suggests complex emotions."),
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
    ("react", "반응하다", "verb", "People react differently to different English accents."),
    ("probably", "아마도", "adv", "You've probably heard many varieties of English."),
    ("confused", "혼란스러운", "adj", "She was confused by the unfamiliar expressions."),
    ("momentarily", "잠깐", "adv", "She was momentarily confused by the accent."),
    ("term", "용어", "noun", "The term 'World Englishes' was coined in the 1980s."),
    ("unique", "독특한", "adj", "Each variety of English has unique features."),
    ("usage", "사용법", "noun", "The usage of English varies by region."),
    ("misunderstanding", "오해", "noun", "Misunderstandings can arise from different Englishes."),
    ("highlight", "강조하다", "verb", "This example highlights regional differences."),
    ("variety", "다양성", "noun", "English has a wide variety of regional forms."),
    ("due to", "~때문에", "phrase", "The change is due to cultural influences."),
    ("extensive", "광범위한", "adj", "English has extensive global influence."),
    ("adoption", "채택", "noun", "The adoption of English varies by country."),
    ("individual", "개인", "noun", "Each individual uses English differently."),
    ("demand", "수요", "noun", "The demand for English learning is growing."),
    ("critical", "비판적인", "adj", "Be critical when analyzing language varieties."),
    ("era", "시대", "noun", "We live in an era of global communication."),
    ("be exposed to", "~에 노출되다", "phrase", "Students are exposed to many varieties of English."),
    ("vast", "광대한", "adj", "English is spoken across a vast area."),
    ("consistently", "일관되게", "adv", "Use English consistently in class."),
    ("contribute", "기여하다", "verb", "Each culture contributes to English."),
    ("influence", "영향을 미치다", "verb", "Local languages influence regional English."),
    ("emerge", "나타나다", "verb", "New varieties of English continue to emerge."),
    ("standard", "표준", "noun", "There is no single standard English."),
    ("initially", "처음에", "adv", "Initially, only British English was taught."),
    ("variation", "변형", "noun", "Variation in English is natural and expected."),
    ("rather than", "~보다는", "phrase", "Embrace differences rather than avoid them."),
    ("refer to A as B", "A를 B라고 부르다", "phrase", "Linguists refer to these as World Englishes."),
    ("evolve", "발전하다", "verb", "Languages evolve over time."),
    ("local", "지역의", "adj", "Local expressions enrich English."),
    ("modification", "수정, 변형", "noun", "Modification of English is natural."),
    ("accurately", "정확하게", "adv", "Use words accurately to avoid confusion."),
    ("take place", "일어나다", "phrase", "Language changes take place gradually."),
    ("aspect", "측면", "noun", "Grammar is one aspect of language."),
    ("noticeable", "눈에 띄는", "adj", "The differences are noticeable but understandable."),
    ("coin", "만들다, 동전", "verb", "The term was coined in the 1980s."),
    ("opposite", "반대의", "adj", "Some people take the opposite view."),
    ("postpone", "미루다", "verb", "Don't postpone learning new vocabulary."),
    ("encouragement", "격려", "noun", "Teachers give encouragement to language learners."),
    ("direct", "직접적인", "adj", "Direct translation often leads to errors."),
    ("translation", "번역", "noun", "Translation helps bridge language gaps."),
    ("inject", "주입하다", "verb", "Local cultures inject new words into English."),
    ("avoid", "피하다", "verb", "Avoid judging others by their accent."),
    ("trap", "함정", "noun", "Don't fall into the trap of linguistic prejudice."),
    ("incorporate", "통합하다", "verb", "Many cultures incorporate English into daily life."),
    ("established", "확립된", "adj", "Established grammar rules may differ across regions."),
    ("gain currency", "통용되다", "phrase", "New expressions gain currency over time."),
    ("worldwide", "전 세계적으로", "adv", "English is used worldwide."),
    ("spread", "퍼지다", "verb", "English has spread to every continent."),
    ("deepen", "깊어지다", "verb", "Your understanding will deepen with exposure."),
    ("accordingly", "그에 따라", "adv", "Adjust your communication style accordingly."),
    ("opportunity", "기회", "noun", "Learning World Englishes offers great opportunities."),
    ("in this respect", "이런 점에서", "phrase", "In this respect, diversity is a strength."),
    ("embrace", "받아들이다", "verb", "We should embrace linguistic diversity."),
    ("prejudice", "편견", "noun", "Linguistic prejudice can harm communication."),
    ("stereotype", "고정관념", "noun", "Avoid stereotypes about non-native speakers."),
    ("solely", "오직", "adv", "English is not solely for native speakers."),
    ("dictate", "지배하다", "verb", "No one should dictate a single correct English."),
    ("document", "기록하다", "verb", "Linguists document language changes."),
    ("convention", "관습", "noun", "Language conventions differ across cultures."),
    ("seek", "추구하다", "verb", "Seek to understand different English varieties."),
    ("informal", "비공식적인", "adj", "Informal English varies greatly by region."),
    ("accuse A of B", "A를 B로 비난하다", "phrase", "Don't accuse speakers of speaking incorrectly."),
    ("capture", "포착하다", "verb", "Language captures cultural identity."),
    ("register", "등록하다", "verb", "New words are registered in dictionaries."),
    ("essential", "필수적인", "adj", "Understanding variety is essential."),
    ("recognize", "인정하다", "verb", "Recognize the value of all English varieties."),
    ("reflect", "반영하다", "verb", "Language reflects culture."),
    ("diverse", "다양한", "adj", "The English-speaking world is diverse."),
    ("advertise", "광고하다", "verb", "Companies advertise in local varieties of English."),
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
    ("artificial", "인공적인", "adj", "Artificial intelligence can create art."),
    ("incident", "사건", "noun", "The incident sparked debate about AI art."),
    ("contemporary", "현대의", "adj", "AI is changing contemporary art."),
    ("expert", "전문가", "noun", "Art experts disagree about AI-generated works."),
    ("portrait", "초상화", "noun", "An AI created a portrait that won an award."),
    ("thoroughly", "철저히", "adv", "The painting was thoroughly analyzed."),
    ("confirm", "확인하다", "verb", "Experts confirmed the painting was AI-generated."),
    ("genuine", "진품의, 진짜의", "adj", "The painting was mistaken for a genuine artwork."),
    ("extraordinary", "비범한", "adj", "The AI produced an extraordinary painting."),
    ("representative", "대표적인", "adj", "This work is representative of AI art."),
    ("announce", "발표하다", "verb", "The winner was announced at the competition."),
    ("protest", "항의하다", "verb", "Artists protested the AI art award."),
    ("process", "과정", "noun", "The process of creating AI art is complex."),
    ("imitate", "모방하다", "verb", "AI can imitate human artistic styles."),
    ("stunned", "충격을 받은", "adj", "The audience was stunned by the AI painting."),
    ("provoke", "유발하다", "verb", "AI art provokes debate about creativity."),
    ("unresolved", "해결되지 않은", "adj", "The copyright issue remains unresolved."),
    ("critic", "비평가", "noun", "Critics have mixed views on AI-generated art."),
    ("photography", "사진", "noun", "Photography also faced early resistance as art."),
    ("algorithm", "알고리즘", "noun", "The algorithm was trained on millions of images."),
    ("exhibit", "전시하다", "verb", "The museum will exhibit AI-generated works."),
    ("at best", "기껏해야", "phrase", "AI art is at best an imitation of human creativity."),
    ("insight", "통찰력", "noun", "Great art offers insight into the human condition."),
    ("oppose", "반대하다", "verb", "Many artists oppose AI in competitions."),
    ("copyright", "저작권", "noun", "The copyright of AI art is unclear."),
    ("in contrast", "대조적으로", "phrase", "In contrast, others welcome AI in art."),
    ("insist", "주장하다", "verb", "Artists insist that AI cannot replace human creativity."),
    ("neural", "신경의", "adj", "The neural network learned from human artworks."),
    ("distinguish", "구별하다", "verb", "It's hard to distinguish AI art from human art."),
    ("distinct", "독특한", "adj", "Each artist has a distinct style."),
    ("numerous", "수많은", "adj", "Numerous AI artworks have been created recently."),
    ("path", "경로", "noun", "Technology has opened new paths in art."),
    ("mimic", "흉내내다", "verb", "AI can mimic famous painting styles."),
    ("ethical", "윤리적인", "adj", "There are many ethical questions about AI art."),
    ("valid", "타당한", "adj", "Both sides make valid points."),
    ("source", "출처", "noun", "The source of AI's training data is debated."),
    ("inspiration", "영감", "noun", "Artists find inspiration in unexpected places."),
    ("authorship", "저작권", "noun", "The question of authorship in AI art is complex."),
    ("legal", "법적인", "adj", "The legal status of AI art is uncertain."),
    ("current", "현재의", "adj", "Current laws don't cover AI-generated works well."),
    ("arrange", "배열하다", "verb", "AI can arrange colors and shapes creatively."),
    ("undertake", "착수하다", "verb", "The museum undertook a study of AI art."),
    ("fund", "자금", "noun", "The project received funding from technology companies."),
    ("display", "전시하다", "verb", "The gallery will display AI artworks next month."),
    ("scene", "장면", "noun", "The art scene is rapidly changing with AI."),
    ("generate", "생성하다", "verb", "AI can generate images from text prompts."),
    ("community", "공동체", "noun", "The art community is divided over AI."),
    ("instead of", "~대신에", "phrase", "AI is used instead of traditional methods."),
    ("basically", "기본적으로", "adv", "AI basically learns patterns from data."),
    ("various", "다양한", "adj", "Various artists have experimented with AI."),
    ("arrangement", "배열", "noun", "The arrangement of colors was strikingly original."),
    ("mobility", "이동성", "noun", "Digital art offers greater mobility."),
    ("operation", "운영", "noun", "The operation of AI requires massive data."),
    ("release", "출시하다", "verb", "The company released a new AI art tool."),
    ("interactive", "상호작용의", "adj", "The interactive exhibit allowed visitors to create art."),
    ("exhibition", "전시회", "noun", "The exhibition featured only AI-generated art."),
    ("fascinating", "매혹적인", "adj", "AI art is fascinating to many people."),
    ("disappear", "사라지다", "verb", "Traditional techniques may not disappear entirely."),
    ("endless", "끝없는", "adj", "AI opens endless possibilities in art."),
    ("alive", "살아있는", "adj", "Art keeps cultural traditions alive."),
    ("flexibility", "유연성", "noun", "AI offers great flexibility in design."),
    ("respond to", "~에 반응하다", "phrase", "The artist responded to criticism positively."),
    ("informative", "유익한", "adj", "The documentary was very informative."),
    ("virtual", "가상의", "adj", "Virtual exhibitions are becoming more popular."),
    ("royal", "왕실의", "adj", "The Royal Academy exhibited an AI artwork."),
    ("hire", "고용하다", "verb", "Companies hire AI to create designs."),
    ("require", "필요로 하다", "verb", "Creating good art still requires human judgment."),
    ("allow", "허용하다", "verb", "Technology allows new forms of expression."),
    ("enable", "가능하게 하다", "verb", "AI enables artists to explore new styles."),
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
# Grammar
# ──────────────────────────────────────────
grammar_raw = [
    # Unit 1
    (1, "가주어-진주어 (It ~ to부정사)", "There is no age at which it is too late to start.", "It ~ to부정사 구조에서 가주어 it이 진주어 to부정사절을 대신한다.", "It is [adj] to do ~", "밑줄 친 it이 가리키는 것은?", "to start (진주어)", L1["title"]),
    (1, "관계대명사 which", "a way of starting the day that many people find enormously useful", "관계대명사 that/which은 선행사를 수식하는 절을 이끈다.", "N + that/which + S + V", "관계대명사 that의 선행사는?", "a way (선행사)", L1["title"]),
    (1, "조동사 be advised to / should", "You're even advised not to read your writing.", "be advised to는 수동태 형태로 권고를 나타낸다.", "be advised to + V", "be advised not to의 의미는?", "~하지 않도록 권고받다", L1["title"]),
    (1, "분사구문", "Including me, many people find morning pages enormously useful.", "분사구문은 부사절을 간결하게 표현한다.", "V-ing ~, S + V", "Including me에서 Including의 역할은?", "분사구문 (부가적 설명)", L1["title"]),
    (1, "현재완료", "I started eight years ago and have been writing ever since.", "현재완료(have p.p.)는 과거에 시작하여 현재까지 이어지는 상황을 표현한다.", "have/has + p.p.", "have been writing의 시제는?", "현재완료 진행", L1["title"]),
    # Unit 2
    (2, "관계대명사 that", "The octopus is an animal with a poison like a snake that paralyzes prey.", "관계대명사 that은 사람/사물 모두 선행사로 가질 수 있다.", "N + that + V", "that이 수식하는 선행사는?", "a snake (선행사)", L2["title"]),
    (2, "수동태", "Scientists have begun to find similarities between octopuses and humans.", "수동태 be p.p.는 행위의 대상이 주어일 때 쓰인다.", "be + p.p. (by ~)", "find의 수동형은?", "be found", L2["title"]),
    (2, "비교급 as ~ as", "An octopus can be as intelligent as an adult human in some ways.", "as ~ as 구문은 두 대상을 동등하게 비교한다.", "as + adj/adv + as", "as intelligent as의 의미는?", "~만큼 지능이 있는", L2["title"]),
    (2, "to부정사의 목적 용법", "Scientists have begun to study octopuses more carefully.", "to부정사는 동사 뒤에서 목적어 역할을 할 수 있다.", "begin/want/hope + to do", "to study의 역할은?", "목적어 (to부정사)", L2["title"]),
    # Unit 3
    (3, "due to vs because of", "The change is due to extensive contact with other languages.", "due to와 because of 모두 원인을 나타내지만 due to는 주로 명사구 앞에 쓰인다.", "due to + N / because of + N", "due to를 because of로 바꿀 수 있는가?", "가능하다 (의미 동일)", L3["title"]),
    (3, "수동태 be exposed to", "Speakers are exposed to many varieties of English today.", "be exposed to는 '~에 노출되다'라는 수동 표현이다.", "be exposed to + N", "be exposed to의 의미는?", "~에 노출되다", L3["title"]),
    (3, "관계부사 where/when", "There are regions where English has developed uniquely.", "관계부사 where는 장소를 나타내는 선행사를 수식한다.", "place + where + S + V", "where의 선행사는?", "regions (장소)", L3["title"]),
    (3, "현재완료 have p.p.", "English has spread to every part of the world.", "현재완료는 과거부터 현재까지의 결과나 경험을 나타낸다.", "have/has + p.p.", "has spread의 시제 의미는?", "과거부터 현재까지의 결과", L3["title"]),
    # Unit 4
    (4, "관계대명사 that vs which", "The painting that won the award was AI-generated.", "that은 선행사가 사람/사물 모두 가능하며 which는 사물만 가능하다.", "N + that/which + V", "that을 which로 바꿀 수 있는가?", "가능하다 (사물 선행사)", L4["title"]),
    (4, "조동사 could/would (가정법)", "If AI could feel emotions, would it create better art?", "가정법 과거는 현재 사실과 반대되는 가정을 나타낸다.", "If + S + 과거V, S + would/could + V", "could feel은 어떤 의미인가?", "현재 사실과 반대되는 가정", L4["title"]),
    (4, "to부정사의 다양한 쓰임", "AI continues to generate debate about creativity.", "to부정사는 명사, 형용사, 부사적 용법으로 쓰인다.", "to + V (명사/형용사/부사)", "to generate의 역할은?", "목적어 (명사적 용법)", L4["title"]),
    (4, "접속사 although/even though", "Although AI creates impressive art, many disagree on its creativity.", "although와 even though는 양보의 접속사로 '~에도 불구하고'를 뜻한다.", "Although/Even though + S + V, S + V", "although와 even though의 차이는?", "의미는 같고 even though가 더 강조적", L4["title"]),
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
textbook_words = words_l1 + words_l2 + words_l3 + words_l4

words_per_unit = {}
for w in textbook_words:
    u = str(w["unit"])
    words_per_unit[u] = words_per_unit.get(u, 0) + 1

output = {
    "textbook_info": {
        "id": "ybm_park_c1",
        "title": "공통영어1",
        "publisher": "YBM",
        "author": "박준언",
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

out_path = "/mnt/g/mathesis/[Word list] Word_gacha/textbook_pdf/textbooks/ybm_park_c1.json"
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print(f"[YBM 박준언 공통영어1] 저장 완료: {out_path}")
print(f"  총 단어 수: {output['stats']['total_words']}")
print(f"  총 문법 수: {output['stats']['total_grammar']}")
print(f"  단원별 단어 수: {output['stats']['words_per_unit']}")
