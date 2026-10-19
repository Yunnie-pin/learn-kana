// The options of the sentence and grammar practices, chosen in the menu and
// kept in localStorage. Kept apart from the sentence data (sentences.js,
// bunpou.js) so the menu can show them without loading every sentence.

function storedOption(key, allowed) {
  let value = null;
  try {
    value = localStorage.getItem(key);
  } catch (error) { }
  return allowed.includes(value) ? value : allowed[0];
}

export const SENTENCE_LEVELS = ['all', 'easy', 'medium', 'hard'];
export const SENTENCE_JLPT_LEVELS = ['all', 'N5', 'N4'];
export const SENTENCE_PATTERNS = ['all', 'desu', 'verb', 'exist', 'question'];
// type: read and type the sentence; listen: type what is heard; particle:
// type the missing particle; arrange: put the shuffled words in order
export const SENTENCE_EXERCISES = ['type', 'listen', 'particle', 'arrange'];
// Topic of the sentences practice: the everyday sentences with no topic
// ("general"), the IT and workplace ones (topic "it": エンジニア, ミーティング...),
// or both
export const SENTENCE_TOPICS = ['all', 'general', 'it'];
export const SENTENCE_TOPIC_KEY = 'game-mode-sentence-topic';

export function getSentenceTopic() {
  let stored = null;
  try {
    stored = localStorage.getItem(SENTENCE_TOPIC_KEY);
  } catch (error) { }
  return SENTENCE_TOPICS.includes(stored) ? stored : 'all';
}

export function sentenceInTopic(sentence, topic = getSentenceTopic()) {
  if (topic === 'general') return sentence.topic !== 'it';
  return topic === 'all' || sentence.topic === topic;
}

export function getSentenceOptions() {
  return {
    level: storedOption('game-mode-sentence-level', SENTENCE_LEVELS),
    pattern: storedOption('game-mode-sentence-pattern', SENTENCE_PATTERNS),
    jlpt: storedOption('game-mode-sentence-jlpt', SENTENCE_JLPT_LEVELS),
    // The sentence topic of the menu: "general" (everyday sentences), "it"
    // (IT and workplace sentences) or "all"
    topic: getSentenceTopic(),
    exercise: storedOption('game-mode-sentence-exercise', SENTENCE_EXERCISES),
  };
}

// ---------- Grammar practice options ----------

export const BUNPOU_ANSWER_MODES = ['typing', 'choice'];
export const BUNPOU_JLPT_LEVELS = ['all', 'N5', 'N4'];
// The everyday sentences with no topic ("general"), the IT and workplace ones
// (topic "it"), or both
export const BUNPOU_TOPICS = ['all', 'general', 'it'];
export const BUNPOU_ANSWER_KEY = 'game-mode-bunpou-answer';
export const BUNPOU_JLPT_KEY = 'game-mode-bunpou-jlpt';
export const BUNPOU_TOPIC_KEY = 'game-mode-bunpou-topic';

export function getBunpouOptions() {
  return {
    answer: storedOption(BUNPOU_ANSWER_KEY, BUNPOU_ANSWER_MODES),
    jlpt: storedOption(BUNPOU_JLPT_KEY, BUNPOU_JLPT_LEVELS),
    topic: storedOption(BUNPOU_TOPIC_KEY, BUNPOU_TOPICS),
  };
}
