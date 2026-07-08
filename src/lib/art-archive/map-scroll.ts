const YAO_MAP_SECTION_ID = 'yao-art-map';

export function scrollToYaoMapSection(): void {
  if (typeof document === 'undefined') return;
  document.getElementById(YAO_MAP_SECTION_ID)?.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
  });
}

export { YAO_MAP_SECTION_ID };
