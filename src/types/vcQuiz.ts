export interface VoiceActor {
  id: string;
  name: string;
  gender: 'male' | 'female';
  office: string;
  debut_year: number;
  wiki_url: string;
}

export interface Character {
  char_name: string;
  va_id: string;
}

export interface Title {
  id: string;
  title: string;
  broadcast_year: number;
  characters: Character[];
}

export interface VcQuestion {
  type: 'forward' | 'reverse';
  questionText: string;
  choices: string[];
  correctAnswer: string;
  correctVa: VoiceActor;
}

export interface VcResultItem {
  question: VcQuestion;
  userAnswer: string;
  correct: boolean;
}
