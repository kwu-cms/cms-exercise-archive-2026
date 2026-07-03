import diariesJson from './diaries.json';

export interface MizunoDiary {
  id: string;
  author: string;
  title: string;
  text: string;
}

export const MIZUNO_DIARIES: MizunoDiary[] = diariesJson as MizunoDiary[];
