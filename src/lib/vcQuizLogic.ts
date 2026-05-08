import type { VoiceActor, Title, Character, VcQuestion } from '../types/vcQuiz';

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickWrongVas(
  correctVa: VoiceActor,
  allVas: VoiceActor[],
  count: number
): VoiceActor[] {
  const pool = allVas.filter((va) => va.id !== correctVa.id && va.gender === correctVa.gender);
  const near = pool
    .filter((va) => Math.abs(va.debut_year - correctVa.debut_year) <= 3)
    .sort(() => Math.random() - 0.5);
  const others = pool.filter((va) => !near.includes(va)).sort(() => Math.random() - 0.5);
  return [...near, ...others].slice(0, count);
}

function buildForwardQuestion(
  titleName: string,
  char: Character,
  correctVa: VoiceActor,
  allVas: VoiceActor[]
): VcQuestion | null {
  const wrongVas = pickWrongVas(correctVa, allVas, 3);
  if (wrongVas.length < 3) return null;
  const choices = shuffle([correctVa.name, ...wrongVas.map((va) => va.name)]);
  return {
    type: 'forward',
    questionText: `「${titleName}」に登場する${char.char_name}を演じているのは？`,
    choices,
    correctAnswer: correctVa.name,
    correctVa,
    charName: char.char_name,
  };
}

function buildReverseQuestion(
  char: Character,
  title: Title,
  correctVa: VoiceActor,
): VcQuestion | null {
  // 誤答: 同じ作品内の、正解キャラと同性 かつ 正解VAと異なるキャラ
  const wrongChars = title.characters.filter(
    (c) => c.va_id !== correctVa.id && c.char_name !== char.char_name && c.gender === char.gender
  );

  if (wrongChars.length < 3) return null;
  const sampled = shuffle(wrongChars).slice(0, 3).map((c) => c.char_name);
  const choices = shuffle([char.char_name, ...sampled]);
  return {
    type: 'reverse',
    questionText: `「${title.title}」に登場するキャラのうち、${correctVa.name}が演じているのは？`,
    choices,
    correctAnswer: char.char_name,
    correctVa,
    charName: char.char_name,
  };
}

export function generateQuestions(
  voiceActors: VoiceActor[],
  titles: Title[],
  selectedTitleIds: string[],
  count: number
): VcQuestion[] {
  const vaMap = new Map(voiceActors.map((va) => [va.id, va]));
  const selectedTitles = titles.filter((t) => selectedTitleIds.includes(t.id));

  const candidates: VcQuestion[] = [];

  for (const title of selectedTitles) {
    for (const char of title.characters) {
      const va = vaMap.get(char.va_id);
      if (!va) continue;

      const fwd = buildForwardQuestion(title.title, char, va, voiceActors);
      if (fwd) candidates.push(fwd);

      const rev = buildReverseQuestion(char, title, va);
      if (rev) candidates.push(rev);
    }
  }

  // 同一 (VA, キャラ) ペアの正引き・逆引きは片方のみ出題
  const usedPairKeys = new Set<string>();
  const result: VcQuestion[] = [];
  for (const q of shuffle(candidates)) {
    const key = `${q.correctVa.id}:${q.charName}`;
    if (usedPairKeys.has(key)) continue;
    usedPairKeys.add(key);
    result.push(q);
    if (result.length >= count) break;
  }

  return result;
}
