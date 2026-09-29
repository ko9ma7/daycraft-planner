export const BUILTIN_ICONS = [
  {id:'sun', name:'해 / 기상', keywords:'아침 해 기상 햇빛', body:'<circle cx="12" cy="12" r="3.4"/><path d="M12 2v2.1M12 19.9V22M4.93 4.93l1.49 1.49M17.58 17.58l1.49 1.49M2 12h2.1M19.9 12H22M4.93 19.07l1.49-1.49M17.58 6.42l1.49-1.49"/>'},
  {id:'moon', name:'달 / 수면', keywords:'잠 수면 밤 달', body:'<path d="M20.2 14.6A8.2 8.2 0 0 1 9.4 3.8a8.3 8.3 0 1 0 10.8 10.8Z"/>'},
  {id:'bed', name:'침대', keywords:'수면 잠 침대', body:'<path d="M3 18v-8M21 18v-5.5a2.5 2.5 0 0 0-2.5-2.5H10v8M3 14h18M6 10V7.8A1.8 1.8 0 0 1 7.8 6h1.4A1.8 1.8 0 0 1 11 7.8V10"/>'},
  {id:'book', name:'책 / 공부', keywords:'공부 학습 책 독서', body:'<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5v-16ZM20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5A2.5 2.5 0 0 1 20 21.5v-16Z"/>'},
  {id:'pencil', name:'연필 / 숙제', keywords:'연필 숙제 쓰기 공부', body:'<path d="m4 20 4.2-1 10-10-3.2-3.2-10 10L4 20ZM13.8 7l3.2 3.2M14.8 4.8l1-1a1.4 1.4 0 0 1 2 0l2.4 2.4a1.4 1.4 0 0 1 0 2l-1 1"/>'},
  {id:'meal', name:'식사', keywords:'밥 식사 음식 아침 점심 저녁', body:'<path d="M7 3v7M4.5 3v4.2A2.8 2.8 0 0 0 7.3 10H9.5V3M7.3 10v11M15.5 3v18M15.5 3c3.8 1.5 4.6 6.2 1.7 9h-1.7"/>'},
  {id:'apple', name:'간식 / 과일', keywords:'간식 과일 사과 음식', body:'<path d="M12 7c-2.5-2-6-1-6.7 2.4C4.4 14 7.4 20 10.3 20c.8 0 1.2-.4 1.7-.4s.9.4 1.7.4c2.9 0 5.9-6 5-10.6C18 6 14.5 5 12 7Z"/><path d="M12 7c0-2.1 1.1-3.7 3.4-4M12 5c-1.6 0-2.8-.8-3.4-2"/>'},
  {id:'ball', name:'운동 / 공', keywords:'운동 축구 공 체육', body:'<circle cx="12" cy="12" r="9"/><path d="m12 7 3 2.2-1.1 3.5h-3.8L9 9.2 12 7ZM5.2 9.2 9 9.1M15 9.2l3.8.1M10.1 12.7l-2.4 3M13.9 12.7l2.4 3M7.7 15.7l.3 3.1M16.3 15.7l-.3 3.1"/>'},
  {id:'walk', name:'산책', keywords:'걷기 산책 외출', body:'<circle cx="13" cy="4.5" r="1.8"/><path d="m11 8 3 2 2.5 4M12.5 10.5l-2 4L7 17M10.5 14.5 13 20M14 10l3-2"/>'},
  {id:'bike', name:'자전거', keywords:'자전거 운동 라이딩', body:'<circle cx="6" cy="17" r="4"/><circle cx="18" cy="17" r="4"/><path d="m8 7 4 10 3-7H9l-3 7M12 17h6l-3-7 1.5-3H19M7 7h3"/>'},
  {id:'music', name:'음악', keywords:'음악 노래 악기 피아노', body:'<path d="M9 18V6l10-2v12M9 9l10-2"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/>'},
  {id:'palette', name:'미술', keywords:'그림 미술 만들기 예술', body:'<path d="M12 3a9 9 0 1 0 0 18h1.2a2.2 2.2 0 0 0 1.8-3.5 1.7 1.7 0 0 1 1.4-2.7H18A3 3 0 0 0 21 12a9 9 0 0 0-9-9Z"/><circle cx="7.5" cy="10" r="1"/><circle cx="10" cy="6.8" r="1"/><circle cx="14" cy="6.8" r="1"/><circle cx="16.5" cy="10" r="1"/>'},
  {id:'game', name:'게임', keywords:'게임 놀이 콘솔', body:'<path d="M8 8h8a5 5 0 0 1 4.6 7l-1.1 2.5a2 2 0 0 1-3.1.8L14.5 17h-5l-1.9 1.3a2 2 0 0 1-3.1-.8L3.4 15A5 5 0 0 1 8 8Z"/><path d="M8 11v4M6 13h4M16.5 12.3h.01M18.5 14.3h.01"/>'},
  {id:'tv', name:'TV / 영상', keywords:'TV 영상 유튜브 화면', body:'<rect x="3" y="5" width="18" height="13" rx="2"/><path d="m8 21 4-3 4 3M9 2l3 3 3-3"/>'},
  {id:'laptop', name:'컴퓨터', keywords:'컴퓨터 온라인 학습 노트북', body:'<rect x="5" y="4" width="14" height="11" rx="1.5"/><path d="M2.5 18h19l-1 2h-17l-1-2Z"/>'},
  {id:'family', name:'가족', keywords:'가족 부모 집', body:'<circle cx="12" cy="7" r="3"/><circle cx="5.5" cy="10" r="2"/><circle cx="18.5" cy="10" r="2"/><path d="M7 21v-3a5 5 0 0 1 10 0v3M2.5 20v-2a3.5 3.5 0 0 1 4.5-3.4M21.5 20v-2a3.5 3.5 0 0 0-4.5-3.4"/>'},
  {id:'friends', name:'친구', keywords:'친구 약속 사람', body:'<circle cx="8" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M2.5 20v-2a5.5 5.5 0 0 1 11 0v2M13.5 15.2A4.5 4.5 0 0 1 21 18.5V20"/>'},
  {id:'home', name:'집', keywords:'집 집안일 휴식', body:'<path d="m3 11 9-8 9 8"/><path d="M5 10v11h14V10M9 21v-7h6v7"/>'},
  {id:'bus', name:'외출 / 버스', keywords:'외출 버스 이동 체험학습', body:'<rect x="4" y="3" width="16" height="16" rx="3"/><path d="M4 10h16M7 6h10M7 19v2M17 19v2"/><circle cx="8" cy="15" r="1"/><circle cx="16" cy="15" r="1"/>'},
  {id:'heart', name:'하트 / 봉사', keywords:'하트 봉사 사랑 건강', body:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>'},
  {id:'sparkle', name:'반짝이', keywords:'반짝이 꾸미기 별', body:'<path d="m12 2 1.4 4.6L18 8l-4.6 1.4L12 14l-1.4-4.6L6 8l4.6-1.4L12 2ZM19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14ZM5 13l.8 2.2L8 16l-2.2.8L5 19l-.8-2.2L2 16l2.2-.8L5 13Z"/>'},
  {id:'star', name:'별', keywords:'별 꾸미기 목표', body:'<path d="m12 2.7 2.8 5.7 6.2.9-4.5 4.4 1 6.2-5.5-2.9-5.5 2.9 1-6.2L3 9.3l6.2-.9L12 2.7Z"/>'},
  {id:'clock', name:'시계', keywords:'시간 시계 일정', body:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>'},
  {id:'school', name:'학교', keywords:'학교 공부 학원', body:'<path d="M3 9 12 3l9 6-9 6-9-6Z"/><path d="M6 11.5V17c3 2.7 9 2.7 12 0v-5.5M21 9v7"/>'},
  {id:'leaf', name:'나뭇잎', keywords:'자연 산책 휴식', body:'<path d="M20 4C10 4 5 9 5 15c0 3 2 5 5 5 6 0 10-6 10-16Z"/><path d="M5 20c3-6 7-9 13-13"/>'},
  {id:'cloud', name:'구름', keywords:'구름 휴식 날씨', body:'<path d="M7 18h10a4 4 0 0 0 .6-8A6 6 0 0 0 6.2 8.2 4.8 4.8 0 0 0 7 18Z"/>'},
  {id:'smile', name:'웃는 얼굴', keywords:'웃음 기분 자유시간 행복', body:'<circle cx="12" cy="12" r="9"/><path d="M8.5 10h.01M15.5 10h.01M8 14c1 2 2.3 3 4 3s3-1 4-3"/>'},
  {id:'camera', name:'카메라', keywords:'사진 체험 기록', body:'<path d="M4 7h4l1.5-2h5L16 7h4a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z"/><circle cx="12" cy="13" r="4"/>'},
  {id:'gift', name:'선물', keywords:'선물 생일 이벤트', body:'<rect x="3" y="9" width="18" height="12" rx="1"/><path d="M12 9v12M3 13h18M12 9H7.8A2.8 2.8 0 1 1 12 5.3V9ZM12 9h4.2A2.8 2.8 0 1 0 12 5.3V9Z"/>'},
  {id:'check', name:'완료 / 체크', keywords:'완료 체크 할일', body:'<circle cx="12" cy="12" r="9"/><path d="m7.8 12.2 2.8 2.8 5.8-6"/>'},
  {id:'rocket', name:'로켓', keywords:'목표 시작 도전 로켓', body:'<path d="M14 4c2.5-2.5 5.5-2 7-2-0 1.5.5 4.5-2 7l-5 5-4-4 5-5Z"/><path d="M13 6 7 7l-3 3 6 1M18 11l-1 6-3 3-1-6M8 16l-3 3M6 14l-3 3"/>'}
];

export function getIcon(id, customIcons = []) {
  return BUILTIN_ICONS.find(i => i.id === id) || customIcons.find(i => i.id === id) || BUILTIN_ICONS[0];
}

export function iconSvgMarkup(icon, {size=24, color='currentColor', strokeWidth=1.8, className=''} = {}) {
  const body = icon?.body || BUILTIN_ICONS[0].body;
  return `<svg class="${className}" width="${size}" height="${size}" viewBox="${icon?.viewBox || '0 0 24 24'}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
}
