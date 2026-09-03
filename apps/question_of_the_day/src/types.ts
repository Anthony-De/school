export type StudentGroup = 'girls' | 'boys';

export interface Student {
  id: string;
  name: string;
  group: StudentGroup;
}

export interface AnswerOption {
  id: string;
  text: string;
  image?: string | null;
}

export interface Question {
  id: string;
  question: string;
  title: string;
  category: string;
  answers: AnswerOption[];
  students: Student[];
  placements: Record<string, number>;
}

export interface BoardState {
  classStudents: Student[];
  questions: Question[];
  activeId: string | null;
}
