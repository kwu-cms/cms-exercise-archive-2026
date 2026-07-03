export interface CampusLabel {
  id: string;
  number?: number;
  name: string;
  lat: number;
  lng: number;
  visible?: boolean;
}

export const CAMPUS_LABELS: CampusLabel[] = [
  { id: 'bld-1', number: 1, name: '1号館', lat: 34.734508, lng: 135.286602 },
  { id: 'bld-2', number: 2, name: '2号館', lat: 34.734687, lng: 135.286491 },
  { id: 'bld-3', number: 3, name: '3号館', lat: 34.735109, lng: 135.287286 },
  { id: 'bld-4', number: 4, name: '4号館', lat: 34.73491, lng: 135.287775 },
  { id: 'bld-5', number: 5, name: '5号館', lat: 34.735475, lng: 135.288111 },
  { id: 'bld-6', number: 6, name: '6号館', lat: 34.734318, lng: 135.28628 },
  { id: 'bld-7', number: 7, name: '7号館', lat: 34.733937, lng: 135.286181 },
  { id: 'bld-8', number: 8, name: '8号館', lat: 34.735223, lng: 135.288264 },
  { id: 'bld-9', number: 9, name: '9号館', lat: 34.734684, lng: 135.287208 },
  { id: 'stu-1', number: 10, name: '第1学生会館', lat: 34.734088, lng: 135.287367 },
  { id: 'area-konan-hill', name: '甲南の丘', lat: 34.734415, lng: 135.287878 },
  { id: 'area-other', name: 'その他（大学構内）', lat: 34.734328, lng: 135.288118 },
  { id: 'stu-4', number: 13, name: '第4学生会館', lat: 34.734826, lng: 135.289245 },
  { id: 'auditorium', number: 14, name: '芦原講堂', lat: 34.734555, lng: 135.288639 },
  { id: 'admin', number: 15, name: '管理棟', lat: 34.734553, lng: 135.28765 },
  { id: 'gym', number: 16, name: '体育館', lat: 34.733992, lng: 135.286946 },
  { id: 'library', number: 17, name: '図書館', lat: 34.734974, lng: 135.288383 },
  { id: 'forest', number: 18, name: 'ふれあいの森', lat: 34.735426, lng: 135.287073 },
  { id: 'bld-10', number: 19, name: '10号館', lat: 34.734149, lng: 135.286649 },
  { id: 'clubhouse', number: 20, name: 'クラブハウス', lat: 34.735699, lng: 135.287858 },
];

export function getVisibleCampusLabels(): CampusLabel[] {
  return CAMPUS_LABELS.filter((l) => l.visible !== false);
}
