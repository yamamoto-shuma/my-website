import type { VoiceActor, Title, VcQuestion } from '../types/vcQuiz';

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
  charName: string,
  correctVa: VoiceActor,
  allVas: VoiceActor[]
): VcQuestion | null {
  const wrongVas = pickWrongVas(correctVa, allVas, 3);
  if (wrongVas.length < 3) return null;
  const choices = shuffle([correctVa.name, ...wrongVas.map((va) => va.name)]);
  return {
    type: 'forward',
    questionText: `「${titleName}」に登場する${charName}を演じているのは？`,
    choices,
    correctAnswer: correctVa.name,
    correctVa,
  };
}

function buildReverseQuestion(
  charName: string,
  titleName: string,
  correctVa: VoiceActor,
  selectedTitles: Title[]
): VcQuestion | null {
  const wrongChars = selectedTitles
    .flatMap((t) => t.characters.map((c) => ({ charName: c.char_name, vaId: c.va_id })))
    .filter((c) => c.vaId !== correctVa.id && c.charName !== charName);

  if (wrongChars.length < 3) return null;
  const sampled = shuffle(wrongChars).slice(0, 3).map((c) => c.charName);
  const choices = shuffle([charName, ...sampled]);
  return {
    type: 'reverse',
    questionText: `以下のうち${correctVa.name}が演じているのは？（${titleName}）`,
    choices,
    correctAnswer: charName,
    correctVa,
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

      const fwd = buildForwardQuestion(title.title, char.char_name, va, voiceActors);
      if (fwd) candidates.push(fwd);

      const rev = buildReverseQuestion(char.char_name, title.title, va, selectedTitles);
      if (rev) candidates.push(rev);
    }
  }

  return shuffle(candidates).slice(0, count);
}
