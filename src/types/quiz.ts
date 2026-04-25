export interface Question {
  id: string;
  phase: number;
  service: string;
  question: string;
  choices: string[];
  answer: number;
  explanation: string;
}
