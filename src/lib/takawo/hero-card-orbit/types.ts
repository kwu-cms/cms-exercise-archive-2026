export interface HeroOrbitCard {
  id: string;
  title: string;
  summary: string;
  category: string;
  cardCode: string;
  cardName: string;
  imageUrl: string;
}

export const OPEN_SUBMISSION_EVENT = 'takawo:open-submission';

export function dispatchOpenSubmission(id: string): void {
  window.dispatchEvent(
    new CustomEvent(OPEN_SUBMISSION_EVENT, {
      detail: { id },
    }),
  );
}
