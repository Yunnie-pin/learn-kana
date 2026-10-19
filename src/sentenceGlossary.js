import { kanaCharacters } from './kanaCharacters.js';
import { alignWords } from './sentenceMatching.js';
import { generatedGlossary } from './generatedGlossary.js';
import { kanjiWords } from './kanjiWords.js';

/* Word meanings for the breakdown shown after a sentence is typed correctly
 * in the "sentences" practice mode.
 *
 * Most words already have a meaning in kanaCharacters.js (the words list and
 * the kanji with their usage words). The words below are the ones the
 * sentences use that are not there: grammar words, verb forms, numbers with
 * counters... Each entry is [English, Indonesian].
 */
const sentenceWords = {
  // grammar words
  'です': ['is / am / are', 'adalah'],
  'でした': ['was / were', 'adalah (lampau)'],
  'あります': ['there is (things)', 'ada (benda)'],
  'います': ['there is (people, animals)', 'ada (orang, hewan)'],
  'します': ['do', 'melakukan'],
  'しました': ['did', 'melakukan (lampau)'],
  'から': ['from', 'dari'],
  'まで': ['until', 'sampai'],
  // の between two nouns (男の人). A particle-marked の is explained by the
  // particleRoles above instead
  'の': ['"of": connects two nouns', '"milik": menghubungkan dua kata benda'],
  // pointing and question words
  'あれ': ['that (over there)', 'itu (di sana)'],
  'なん': ['what', 'apa'],
  'なんじ': ['what time', 'jam berapa'],
  'どちら': ['where / which (polite)', 'di mana / yang mana (sopan)'],
  // people
  'わたし': ['I', 'saya'],
  '友だち': ['friend', 'teman'],
  '子ども': ['child', 'anak'],
  '男の子': ['boy', 'anak laki-laki'],
  '女の子': ['girl', 'anak perempuan'],
  'お国': ['(your) country', 'negara (Anda)'],
  // places and things
  'うち': ['home', 'rumah'],
  'ざっし': ['magazine', 'majalah'],
  'あさごはん': ['breakfast', 'sarapan'],
  'カレー': ['curry', 'kari'],
  'ライス': ['rice', 'nasi'],
  'かいもの': ['shopping', 'belanja'],
  // the sentences use these in another sense than kanaCharacters.js
  'はな': ['flower', 'bunga'],
  'よかった': ['was good', 'bagus (lampau)'],
  'いっしょに': ['together', 'bersama'],
  'バスてい': ['bus stop', 'halte bus'],
  'ちゅうごくご': ['Chinese (language)', 'bahasa Tionghoa'],
  // time
  '毎週': ['every week', 'setiap minggu'],
  '先週': ['last week', 'minggu lalu'],
  'まいあさ': ['every morning', 'setiap pagi'],
  'ごぜん': ['a.m.', 'pagi (a.m.)'],
  'ごご': ['p.m.', 'siang / sore (p.m.)'],
  '一時': ["one o'clock", 'jam satu'],
  '二時': ["two o'clock", 'jam dua'],
  '三時': ["three o'clock", 'jam tiga'],
  '四時': ["four o'clock", 'jam empat'],
  '五時': ["five o'clock", 'jam lima'],
  '六時': ["six o'clock", 'jam enam'],
  '七時': ["seven o'clock", 'jam tujuh'],
  '八時': ["eight o'clock", 'jam delapan'],
  '九時': ["nine o'clock", 'jam sembilan'],
  '十時': ["ten o'clock", 'jam sepuluh'],
  // numbers and people
  '二百': ['two hundred', 'dua ratus'],
  '三百': ['three hundred', 'tiga ratus'],
  '五百': ['five hundred', 'lima ratus'],
  '一人': ['one person', 'satu orang'],
  '四人': ['four people', 'empat orang'],
  '五人': ['five people', 'lima orang'],
  '六人': ['six people', 'enam orang'],
  '七人': ['seven people', 'tujuh orang'],
  '八人': ['eight people', 'delapan orang'],
  '九人': ['nine people', 'sembilan orang'],
  '十人': ['ten people', 'sepuluh orang'],
  // adjectives
  '新しい': ['new', 'baru'],
  '古い': ['old', 'lama'],
  '高い': ['expensive / high', 'mahal / tinggi'],
  '大きい': ['big', 'besar'],
  '小さい': ['small', 'kecil'],
  '白い': ['white', 'putih'],
  '黒い': ['black', 'hitam'],
  '青い': ['blue', 'biru'],
  '少ない': ['few', 'sedikit'],
  'さむかった': ['was cold', 'dingin (lampau)'],
  'あつかった': ['was hot', 'panas (lampau)'],
  // verbs (polite present / past)
  '飲みます': ['drink', 'minum'],
  '飲みました': ['drank', 'minum (lampau)'],
  '食べます': ['eat', 'makan'],
  '食べました': ['ate', 'makan (lampau)'],
  '読みます': ['read', 'membaca'],
  '読みました': ['read (past)', 'membaca (lampau)'],
  '書きます': ['write', 'menulis'],
  '書きました': ['wrote', 'menulis (lampau)'],
  '見ます': ['see / watch', 'melihat / menonton'],
  '見ました': ['saw / watched', 'melihat / menonton (lampau)'],
  '買います': ['buy', 'membeli'],
  '買いました': ['bought', 'membeli (lampau)'],
  '聞きます': ['listen / hear', 'mendengarkan'],
  '聞きました': ['listened / heard', 'mendengarkan (lampau)'],
  '話します': ['speak', 'berbicara'],
  '会います': ['meet', 'bertemu'],
  '会いました': ['met', 'bertemu (lampau)'],
  '行きます': ['go', 'pergi'],
  '行きました': ['went', 'pergi (lampau)'],
  '行きません': ["don't / won't go", 'tidak / maukah ... pergi'],
  '来ます': ['come', 'datang'],
  '来ました': ['came', 'datang (lampau)'],
  '帰ります': ['go home', 'pulang'],
  '帰りました': ['went home', 'pulang (lampau)'],
  '休みます': ['rest', 'beristirahat'],
  'ねます': ['sleep', 'tidur'],
  'おきます': ['wake up', 'bangun'],
  'あらいます': ['wash', 'mencuci'],
  'つくります': ['make', 'membuat'],
};

// What each particle does in the sentence, [English, Indonesian]
export const particleRoles = {
  'は': ['topic: "as for ..."', 'topik: "kalau ..."'],
  'が': ['subject', 'subjek'],
  'を': ['object of the verb', 'objek kata kerja'],
  'に': ['time, destination or place of being', 'waktu, tujuan, atau tempat keberadaan'],
  'へ': ['direction: "to ..."', 'arah: "ke ..."'],
  'で': ['place of an action, or "by / with"', 'tempat kegiatan, atau "dengan"'],
  'の': ['possession: "\'s / of"', 'kepemilikan: "milik / dari"'],
  'と': ['"and" / "with", or quoting (〜と思います)', '"dan" / "bersama", atau kutipan (〜と思います)'],
  'より': ['"than" (comparison)', '"daripada" (perbandingan)'],
  'も': ['"also / too"', '"juga"'],
  'か': ['question marker', 'penanda pertanyaan'],
  'ね': ['"right?", seeks agreement', '"ya?", meminta persetujuan'],
  'から': ['"from"', '"dari"'],
  'まで': ['"until / to"', '"sampai"'],
};

// jp word -> [English, Indonesian]: the list above first, then the words and
// kanji usage words of kanaCharacters.js, then single kanji
const glossary = {};
for (const group of Object.values(kanaCharacters.kanji)) {
  for (const character of Object.values(group.characters)) {
    if (character.meaning && !(character.jp_character in glossary)) {
      glossary[character.jp_character] = [character.meaning, character.meaning_id || character.meaning];
    }
  }
}
for (const group of Object.values(kanaCharacters.kanji)) {
  for (const character of Object.values(group.characters)) {
    const usage = character.usage;
    if (usage && usage.meaning) {
      glossary[usage.word] = [usage.meaning, usage.meaning_id || usage.meaning];
    }
  }
}
for (const [word, , meaning, meaningId] of kanjiWords) {
  if (!(word in glossary)) glossary[word] = [meaning, meaningId || meaning];
}
for (const word of Object.values(kanaCharacters.words)) {
  if (word.meaning) glossary[word.jp_character] = [word.meaning, word.meaning_id || word.meaning];
}
// Conjugated words of the generated sentences (飲みません, 食べています...),
// then the list above, which wins when both have a word
Object.assign(glossary, generatedGlossary, sentenceWords);

// Meaning of a word of a sentence in the given language ('en' / 'id'), or ''
export function glossOf(word, language = 'en') {
  const entry = glossary[word];
  if (!entry) return '';
  return language === 'id' ? entry[1] : entry[0];
}

// Role of a particle in the given language ('en' / 'id'), or ''
export function particleRoleOf(particle, language = 'en') {
  const entry = particleRoles[particle];
  if (!entry) return '';
  return language === 'id' ? entry[1] : entry[0];
}

// The words of a sentence for the breakdown shown after a correct answer:
// [{ text, romaji, particle, meaning }], or [] when the romaji can't be lined
// up with the sentence
export function sentenceBreakdown(sentence, language = 'en') {
  const romaji = Array.isArray(sentence.romanji) ? sentence.romanji[0] : sentence.romanji;
  const words = String(romaji || '').split(' ').filter(Boolean);
  const segments = alignWords(sentence, words);
  if (!segments) return [];
  const characters = [...sentence.jp_character];
  const particles = sentence.particles || [];
  const parts = segments.map(({ start, end }, index) => {
    const text = characters.slice(start, end).join('').replace(/[、。]/g, '');
    return { text, romaji: words[index], particle: particles.includes(start) && Boolean(particleRoles[text]) };
  });
  // Words written with spaces in romaji but known as one word: いっしょ + に,
  // 食べて + います, べんきょう + して + ください (the longest known one wins)
  const merged = [];
  for (let index = 0; index < parts.length;) {
    let end = index + 1;
    if (!parts[index].particle) {
      let text = parts[index].text;
      for (let next = index + 1; next < parts.length && !parts[next].particle; next++) {
        text += parts[next].text;
        if (glossary[text]) end = next + 1;
      }
    }
    const group = parts.slice(index, end);
    merged.push({
      text: group.map(part => part.text).join(''),
      romaji: group.map(part => part.romaji).join(' '),
      particle: parts[index].particle,
    });
    index = end;
  }
  return merged.map(part => ({
    ...part,
    meaning: part.particle ? particleRoleOf(part.text, language) : glossOf(part.text, language),
  }));
}
