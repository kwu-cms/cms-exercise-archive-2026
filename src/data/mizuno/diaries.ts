import { MIZUNO_INTRODUCED_STUDENTS, toHeroDiaries } from '../../lib/mizuno/students';

export interface MizunoDiary {
  id: string;
  author: string;
  title: string;
  text: string;
}

export const MIZUNO_DIARIES: MizunoDiary[] = toHeroDiaries(MIZUNO_INTRODUCED_STUDENTS);

export { MIZUNO_INTRODUCED_STUDENTS };
