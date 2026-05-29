export interface VerbConjugation {
  verb: string;
  meaning: string;
  tense: string;
  conjugations: { [subject: string]: string };
  examples: { spanish: string; armenian: string }[];
}

export interface IrregularParticiple {
  latin: string;
  participle: string;
  meaning: string;
  example: { spanish: string; armenian: string };
}

export interface PrefixVerb {
  verb: string;
  participle: string;
  meaning?: string;
  example?: { spanish: string; armenian: string };
}

export interface Player {
  id: 'gor' | 'gayane';
  name: string;
  score: number;
}

export interface BilliardsBall {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  word: string;
  meaning: string;
  isCorrect: boolean;
  pocketed: boolean;
}

export interface BowlingPin {
  id: number;
  x: number;
  y: number;
  radius: number;
  originalX: number;
  originalY: number;
  word: string;
  isCorrect: boolean;
  isFallen: boolean;
}

export interface GameScoreState {
  gor: number;
  gayane: number;
}
