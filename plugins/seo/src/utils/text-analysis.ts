import type { TextStats, KeywordItem } from '../types';

// Basic list of stop words (can be extended)
const STOP_WORDS = new Set([
  // EN
  'the',
  'be',
  'to',
  'of',
  'and',
  'a',
  'in',
  'that',
  'have',
  'i',
  'it',
  'for',
  'not',
  'on',
  'with',
  'he',
  'as',
  'you',
  'do',
  'at',
  'this',
  'but',
  'his',
  'by',
  'from',
  'they',
  'we',
  'say',
  'her',
  'she',
  'or',
  'an',
  'will',
  'my',
  'one',
  'all',
  'would',
  'there',
  'their',
  'what',
  'so',
  'up',
  'out',
  'if',
  'about',
  'who',
  'get',
  'which',
  'go',
  'me',
  // RU
  'и',
  'в',
  'во',
  'не',
  'что',
  'он',
  'на',
  'я',
  'с',
  'со',
  'как',
  'а',
  'то',
  'все',
  'она',
  'так',
  'его',
  'но',
  'да',
  'ты',
  'к',
  'у',
  'же',
  'вы',
  'за',
  'бы',
  'по',
  'только',
  'ее',
  'мне',
  'было',
  'вот',
  'от',
  'меня',
  'еще',
  'нет',
  'о',
  'из',
  'ему',
  'теперь',
  'когда',
  'даже',
  'ну',
  'вдруг',
  'ли',
  'если',
  'уже',
  'или',
  'ни',
  'быть',
  'был',
  'него',
  'до',
  'вас',
  'нибудь',
  'опять',
  'уж',
  'вам',
  'ведь',
  'там',
  'потом',
  'себя',
  'ничего',
  'ей',
  'может',
  'они',
  'тут',
  'где',
  'есть',
  'надо',
  'ней',
  'для',
  'мы',
  'тебя',
  'их',
  'чем',
  'была',
  'сам',
  'чтоб',
  'без',
  'будто',
  'чего',
  'раз',
  'тоже',
  'себе',
  'под',
  'будет',
  'ж',
  'тогда',
  'кто',
  'этот',
  'того',
  'потому',
  'этого',
  'какой',
  'совсем',
  'ним',
  'здесь',
  'этом',
  'один',
  'почти',
  'мой',
  'тем',
  'чтобы',
  'нее',
  'сейчас',
  'были',
  'куда',
  'зачем',
  'всех',
  'никогда',
  'можно',
  'при',
  'наконец',
  'два',
  'об',
  'другой',
  'хоть',
  'после',
  'над',
  'больше',
  'тот',
  'через',
  'эти',
  'нас',
  'про',
  'всего',
  'них',
  'какая',
  'много',
  'разве',
  'три',
  'эту',
  'моя',
  'впрочем',
  'хорошо',
  'свою',
  'этой',
  'перед',
  'иногда',
  'лучше',
  'чуть',
  'том',
  'нельзя',
  'такой',
  'им',
  'более',
  'всегда',
  'конечно',
  'всю',
  'между',
]);

export function analyzeText(text: string): TextStats {
  if (!text || text.trim().length === 0) {
    return {
      wordCount: 0,
      charCount: 0,
      sentenceCount: 0,
      paragraphCount: 0,
      readingTimeMinutes: 0,
      keywords: [],
    };
  }

  // 1. Basic Stats
  const charCount = text.length;

  // Count paragraphs by double line breaks
  const paragraphCount = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length || 1;

  // Count sentences by periods, exclamation and question marks
  const sentenceCount = text.split(/[.!?]+/).filter((s) => s.trim().length > 0).length || 1;

  // Clean text for word counting
  // Remove everything except letters and spaces
  const cleanText = text
    .toLowerCase()
    .replace(/[^\w\sа-яёa-z]/g, ' ')
    .replace(/\s+/g, ' ');
  const words = cleanText.split(' ').filter((w) => w.length > 0);
  const wordCount = words.length;

  // 2. Reading Time (Average 225 words per minute)
  const readingTimeMinutes = Math.ceil(wordCount / 225) || 1;

  // 3. Keyword Density
  const frequency: Record<string, number> = {};

  for (const word of words) {
    // Filter stop words and short words (less than 3 letters)
    if (!STOP_WORDS.has(word) && word.length > 2 && !/^\d+$/.test(word)) {
      frequency[word] = (frequency[word] || 0) + 1;
    }
  }

  // Sort and top-10
  const keywords: KeywordItem[] = Object.entries(frequency)
    .sort((a, b) => b[1] - a[1]) // Sort by descending frequency
    .slice(0, 10) // Top 10
    .map(([word, count]) => ({
      word,
      count,
      density: ((count / wordCount) * 100).toFixed(2) + '%',
    }));

  return {
    wordCount,
    charCount,
    sentenceCount,
    paragraphCount,
    readingTimeMinutes,
    keywords,
  };
}
