export interface Choice {
  text: string;
  correct: boolean;
}

export interface Question {
  id: string;
  phase: number;
  service: string;
  question: string;
  choices: Choice[];
  explanation: string;
  reference?: string;
}

export interface ResultItem {
  question: Question;
  correct: boolean;
}
