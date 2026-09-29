import { BUILTIN_ICONS, getIcon, iconSvgMarkup } from './icons.js';

const STORAGE_KEY = 'daycraft.planner.v2';
const LEGACY_KEY = 'summerVacationSchedules';
const MAX_HISTORY = 60;
const DAYS = [
  ['all','매일'], ['mon','월'], ['tue','화'], ['wed','수'], ['thu','목'],
  ['fri','금'], ['sat','토'], ['sun','일']
];
const DAY_NAME = Object.fromEntries(DAYS);
const DAY_ORDER = DAYS.map(([id]) => id);

const CANVAS_SIZES = {
  square: {w: 1200, h: 1200, label:'정사각 1:1'},
  portrait: {w: 1200, h: 1500, label:'세로 4:5'},
  story: {w: 1080, h: 1920, label:'세로 9:16'},
  a4: {w: 1240, h: 1754, label:'A4 인쇄'},
  wide: {w: 1600, h: 900, label:'가로 16:9'}
};

const PRESETS = {
  playful: {name:'컬러 팝', desc:'통통 튀는 키즈 포스터', bg:'#fff8ea', surface:'#ffffff', text:'#27304a', muted:'#69708a', accent:'#5b67f1', line:'#e8dccb', palette:['#ff6f91','#5b9df9','#ffc857','#44c7b6','#9b7cf6','#ff8a5b'], pattern:'playful', font:"system-ui,'Noto Sans KR',sans-serif", titleFont:"'Arial Rounded MT Bold','Noto Sans KR',system-ui,sans-serif", header:'center', card:'soft', radius:20, border:1.5, shadow:'soft', ringCap:'butt', paletteMode:'schedule'},
  kawaii: {name:'젤리 파스텔', desc:'말랑한 구름과 캔디', bg:'#fff4fb', surface:'#fffaff', text:'#4d3652', muted:'#8c708f', accent:'#ff78b5', line:'#f1d8e7', palette:['#ff8fbd','#90d7ff','#a9e7b3','#ffd86b','#c3a6ff','#ffad8f'], pattern:'kawaii', font:"'Trebuchet MS','Noto Sans KR',sans-serif", titleFont:"'Arial Rounded MT Bold','Noto Sans KR',sans-serif", header:'bubble', card:'jelly', radius:30, border:1.2, shadow:'soft', ringCap:'round', paletteMode:'preset'},
  notebook: {name:'공책', desc:'줄노트와 손필기 감성', bg:'#fffdf6', surface:'#fffefa', text:'#334155', muted:'#7c8797', accent:'#3b82f6', line:'#dbe4ee', palette:['#60a5fa','#34d399','#fbbf24','#fb7185','#a78bfa','#38bdf8'], pattern:'notebook', font:"'Segoe Print','Noto Sans KR',cursive", titleFont:"'Segoe Print','Noto Sans KR',cursive", header:'left', card:'paper', radius:8, border:1.4, shadow:'paper', ringCap:'round', paletteMode:'schedule'},
  scrapbook: {name:'스크랩북', desc:'종이·테이프·콜라주', bg:'#f5ead7', surface:'#fffaf0', text:'#40362d', muted:'#75685b', accent:'#ef7f65', line:'#d8c7ad', palette:['#ef7f65','#78a6a3','#e0b24f','#8f78a8','#d47f9d','#6e91bd'], pattern:'scrapbook', font:"'Trebuchet MS','Noto Sans KR',sans-serif", titleFont:"Georgia,'Noto Serif KR',serif", header:'scrap', card:'paper', radius:4, border:1.8, shadow:'paper', ringCap:'butt', paletteMode:'preset'},
  comic: {name:'코믹북', desc:'굵은 선과 하프톤', bg:'#fff24a', surface:'#fffef2', text:'#111111', muted:'#4d4d3d', accent:'#ff3b30', line:'#111111', palette:['#ff3b30','#2867ff','#00a66b','#ff9f0a','#af52de','#111111'], pattern:'comic', font:"'Arial Black','Noto Sans KR',sans-serif", titleFont:"Impact,'Arial Black','Noto Sans KR',sans-serif", header:'comic', card:'comic', radius:0, border:4, shadow:'hard', ringCap:'butt', paletteMode:'preset'},
  arcade: {name:'네온 아케이드', desc:'사이버 그리드와 글로우', bg:'#09061a', surface:'#15102d', text:'#f8f5ff', muted:'#b5a8d4', accent:'#00f5ff', line:'#392c5c', palette:['#00f5ff','#ff45d4','#8d5bff','#00ff85','#ffe45e','#ff6b6b'], pattern:'arcade', font:"ui-monospace,'Noto Sans KR',monospace", titleFont:"'Arial Black','Noto Sans KR',sans-serif", header:'neon', card:'neon', radius:10, border:2, shadow:'glow', ringCap:'round', paletteMode:'preset'},
  blueprint: {name:'블루프린트', desc:'도면 격자와 기술 문서', bg:'#0d4f86', surface:'#155f99', text:'#f2fbff', muted:'#b8d9ee', accent:'#7ee7ff', line:'#74b4da', palette:['#f2fbff','#7ee7ff','#ffdc73','#a8ffcf','#ff9bc8','#d7c5ff'], pattern:'blueprint', font:"ui-monospace,'Noto Sans KR',monospace", titleFont:"ui-monospace,'Noto Sans KR',monospace", header:'technical', card:'outline', radius:0, border:2, shadow:'none', ringCap:'butt', paletteMode:'preset'},
  chalk: {name:'칠판', desc:'분필 낙서와 교실 감성', bg:'#173b32', surface:'#214c41', text:'#fff9e8', muted:'#c7d5c5', accent:'#ffd769', line:'#6f9186', palette:['#fff9e8','#ffd769','#8fe3c3','#ff9ca8','#9ec7ff','#d7b2ff'], pattern:'chalk', font:"'Segoe Print','Noto Sans KR',cursive", titleFont:"'Segoe Print','Noto Sans KR',cursive", header:'chalk', card:'chalk', radius:12, border:2, shadow:'none', ringCap:'round', paletteMode:'preset'},
  editorial: {name:'에디토리얼', desc:'잡지처럼 절제된 타이포', bg:'#f7f3eb', surface:'#fbf8f1', text:'#171717', muted:'#6e6a63', accent:'#b33a2f', line:'#c9c2b5', palette:['#171717','#b33a2f','#486a63','#b58a3e','#5b587a','#777777'], pattern:'editorial', font:"Georgia,'Noto Serif KR',serif", titleFont:"Georgia,'Noto Serif KR',serif", header:'editorial', card:'editorial', radius:0, border:1.2, shadow:'none', ringCap:'butt', paletteMode:'preset'},
  brutal: {name:'브루탈', desc:'강한 대비와 블록 구조', bg:'#f3ff4b', surface:'#ffffff', text:'#0a0a0a', muted:'#3e3e31', accent:'#ff4d00', line:'#0a0a0a', palette:['#ff4d00','#006bff','#00a86b','#0a0a0a','#ff00a8','#7b2cff'], pattern:'brutal', font:"'Arial Black','Noto Sans KR',sans-serif", titleFont:"'Arial Black','Noto Sans KR',sans-serif", header:'brutal', card:'brutal', radius:0, border:5, shadow:'hard', ringCap:'butt', paletteMode:'preset'},
  retro: {name:'70s 레트로', desc:'따뜻한 곡선과 빈티지', bg:'#f6d88b', surface:'#fff1c9', text:'#4b2e23', muted:'#7c5a4c', accent:'#d95d39', line:'#c79d64', palette:['#d95d39','#2f7e78','#d09a2d','#6e5596','#b84f6d','#4d79a6'], pattern:'retro', font:"'Trebuchet MS','Noto Sans KR',sans-serif", titleFont:"Georgia,'Noto Serif KR',serif", header:'retro', card:'retro', radius:24, border:2, shadow:'paper', ringCap:'round', paletteMode:'preset'},
  pixel: {name:'픽셀 게임', desc:'8비트 HUD와 타일', bg:'#20163b', surface:'#2e2050', text:'#fff6d8', muted:'#c7b7e7', accent:'#f6e05e', line:'#735aa5', palette:['#f6e05e','#5eead4','#fb7185','#60a5fa','#c084fc','#f97316'], pattern:'pixel', font:"ui-monospace,'Noto Sans KR',monospace", titleFont:"ui-monospace,'Noto Sans KR',monospace", header:'pixel', card:'pixel', radius:0, border:4, shadow:'hard', ringCap:'butt', paletteMode:'preset'},
  glass: {name:'오로라 글래스', desc:'빛 번짐과 투명 레이어', bg:'#dbeafe', surface:'#f8fbff', text:'#18304d', muted:'#60758f', accent:'#3b82f6', line:'#bdd5ea', palette:['#3b82f6','#06b6d4','#22c55e','#a855f7','#f59e0b','#ef4444'], pattern:'glass', font:"system-ui,'Noto Sans KR',sans-serif", titleFont:"system-ui,'Noto Sans KR',sans-serif", header:'glass', card:'glass', radius:28, border:1, shadow:'soft', ringCap:'round', paletteMode:'preset'},
  forest: {name:'보태니컬', desc:'잎사귀와 자연의 리듬', bg:'#eaf5e6', surface:'#f9fff6', text:'#254133', muted:'#667c6d', accent:'#3d8a5e', line:'#c5dbc0', palette:['#3d8a5e','#7bbd72','#d9a441','#5f8bb6','#b6789d','#8d7458'], pattern:'forest', font:"Georgia,'Noto Serif KR',serif", titleFont:"Georgia,'Noto Serif KR',serif", header:'botanical', card:'soft', radius:24, border:1.2, shadow:'soft', ringCap:'round', paletteMode:'preset'},
  minimal: {name:'스위스 미니멀', desc:'정렬·여백·선 중심', bg:'#f7f7f5', surface:'#ffffff', text:'#111111', muted:'#6b7280', accent:'#e62b1e', line:'#cfcfca', palette:['#111111','#e62b1e','#4b5563','#9ca3af','#1f2937','#6b7280'], pattern:'minimal', font:"Arial,'Noto Sans KR',sans-serif", titleFont:"Arial,'Noto Sans KR',sans-serif", header:'swiss', card:'editorial', radius:0, border:1.5, shadow:'none', ringCap:'butt', paletteMode:'preset'},
  night: {name:'별자리 밤', desc:'별빛과 깊은 남색', bg:'#11162f', surface:'#1d2546', text:'#f7f8ff', muted:'#b8c0dc', accent:'#9ea7ff', line:'#36405f', palette:['#9ea7ff','#ff88b7','#65d7c4','#ffd36a','#8ed1fc','#c99cff'], pattern:'night', font:"system-ui,'Noto Sans KR',sans-serif", titleFont:"Georgia,'Noto Serif KR',serif", header:'night', card:'night', radius:18, border:1.2, shadow:'soft', ringCap:'round', paletteMode:'preset'}
};
const QUICK_ACTIVITIES = [
  {title:'기상 & 준비', icon:'sun', color:'#ffb84d'},
  {title:'아침 식사', icon:'meal', color:'#ff8f70'},
  {title:'공부 시간', icon:'book', color:'#5b9df9'},
  {title:'독서', icon:'book', color:'#8b7bf0'},
  {title:'운동', icon:'ball', color:'#4fc19b'},
  {title:'점심 식사', icon:'meal', color:'#ff9d5c'},
  {title:'놀이 시간', icon:'game', color:'#e477c8'},
  {title:'가족 시간', icon:'family', color:'#ef6a86'},
  {title:'자유 시간', icon:'smile', color:'#65b6d9'},
  {title:'취침', icon:'moon', color:'#6473bb'}
];

const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];
const deepClone = value => JSON.parse(JSON.stringify(value));
const uid = (prefix='id') => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;
const clamp = (n,min,max) => Math.min(max, Math.max(min,n));
const escapeXml = (s='') => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const safeColor = (v, fallback='#5b67f1') => /^#[0-9a-f]{6}$/i.test(v || '') ? v : fallback;
const timeToMin = t => { const [h,m] = String(t || '00:00').split(':').map(Number); return (h||0)*60+(m||0); };
const durationMin = (start,end) => { const s=timeToMin(start), e=timeToMin(end); return e>s ? e-s : 1440-s+e; };
const durationText = mins => mins >= 60 ? `${Math.floor(mins/60)}시간${mins%60 ? ` ${mins%60}분` : ''}` : `${mins}분`;
const formatTime = t => t || '00:00';
const sanitizeFilename = s => (s || '나의-생활계획표').replace(/[\\/:*?"<>|]+/g,'-').trim() || '나의-생활계획표';

function defaultState() {
  return {
    version: 2,
    document: {title:'나의 하루 생활계획표', subtitle:'내가 만든 멋진 하루, 하나씩 실천해요!'},
    schedules: [
      {id:uid('s'), days:['all'], start:'07:00', end:'08:00', title:'기상 & 아침 준비', detail:'세수하고 아침 먹기', icon:'sun', color:'#ffb84d'},
      {id:uid('s'), days:['all'], start:'09:00', end:'10:30', title:'공부 시간', detail:'오늘 할 공부를 차근차근', icon:'book', color:'#5b9df9'},
      {id:uid('s'), days:['all'], start:'12:00', end:'13:00', title:'점심 식사', detail:'맛있게 먹고 잠깐 쉬기', icon:'meal', color:'#ff8f70'},
      {id:uid('s'), days:['all'], start:'14:00', end:'15:30', title:'신나는 놀이', detail:'게임·만들기·친구와 놀기', icon:'game', color:'#e477c8'},
      {id:uid('s'), days:['all'], start:'17:00', end:'18:00', title:'운동 & 산책', detail:'몸을 쭉쭉 움직여요', icon:'ball', color:'#4fc19b'},
      {id:uid('s'), days:['all'], start:'20:00', end:'21:00', title:'가족 & 독서', detail:'오늘 있었던 일을 이야기해요', icon:'family', color:'#ef6a86'},
      {id:uid('s'), days:['all'], start:'22:00', end:'07:00', title:'꿈나라', detail:'푹 자고 내일도 힘차게', icon:'moon', color:'#6473bb'}
    ],
    stickers: [],
    customIcons: [],
    design: {preset:'playful', layout:'clock', size:'square', accent:'#5b67f1', showHours:true, showDetails:true, showLegend:true, legendPosition:'auto', clockScale:100, clockHole:58, clockOffsetY:0, clockGap:1.2, clockShowLabels:true, clockLabelMinMinutes:45, clockLabelSize:18, clockLabelContent:'titleTime', clockLabelOrientation:'auto', clockShowTrack:true, clockCenterMode:'summary'},
    ui: {selectedDay:'all', theme:'system'}
  };
}

function normalizeState(raw) {
  const base = defaultState();
  const r = raw && typeof raw === 'object' ? raw : {};
  const result = {
    version:2,
    document:{
      title:String(r.document?.title ?? base.document.title).slice(0,80),
      subtitle:String(r.document?.subtitle ?? base.document.subtitle).slice(0,160)
    },
    schedules:Array.isArray(r.schedules) ? r.schedules.map(s => ({
      id:String(s.id || uid('s')),
      days:Array.isArray(s.days) && s.days.some(d=>DAY_ORDER.includes(d)) ? [...new Set(s.days.filter(d=>DAY_ORDER.includes(d)))] : ['all'],
      start:/^\d{2}:\d{2}$/.test(s.start || '') ? s.start : '09:00',
      end:/^\d{2}:\d{2}$/.test(s.end || '') ? s.end : '10:00',
      title:String(s.title || '새 일정').slice(0,60),
      detail:String(s.detail || '').slice(0,200),
      icon:String(s.icon || 'star'),
      color:safeColor(s.color, '#5b67f1'),
      hideClockLabel:s.hideClockLabel === true
    })) : base.schedules,
    stickers:Array.isArray(r.stickers) ? r.stickers.slice(0,60).map(st => ({
      id:String(st.id || uid('st')),
      icon:String(st.icon || 'star'), x:clamp(Number(st.x)||.5,0,1), y:clamp(Number(st.y)||.5,0,1),
      size:clamp(Number(st.size)||90,24,360), rotation:clamp(Number(st.rotation)||0,-360,360), color:safeColor(st.color,'#5b67f1')
    })) : [],
    customIcons:Array.isArray(r.customIcons) ? r.customIcons.slice(0,30).map(ci=>({
      id:String(ci.id || uid('custom')), name:String(ci.name || '내 아이콘').slice(0,40), keywords:String(ci.keywords || '내 아이콘').slice(0,100),
      viewBox:String(ci.viewBox || '0 0 24 24'), body:String(ci.body || '').slice(0,60000), custom:true
    })).filter(ci=>ci.body) : [],
    design:{
      preset:PRESETS[r.design?.preset] ? r.design.preset : base.design.preset,
      layout:['clock','timeline','cards'].includes(r.design?.layout) ? r.design.layout : base.design.layout,
      size:CANVAS_SIZES[r.design?.size] ? r.design.size : base.design.size,
      accent:safeColor(r.design?.accent, base.design.accent),
      showHours:r.design?.showHours !== false,
      showDetails:r.design?.showDetails !== false,
      showLegend:r.design?.showLegend !== false,
      legendPosition:['auto','bottom','right'].includes(r.design?.legendPosition) ? r.design.legendPosition : base.design.legendPosition,
      clockScale:clamp(Number(r.design?.clockScale ?? base.design.clockScale),70,108),
      clockHole:clamp(Number(r.design?.clockHole ?? base.design.clockHole),28,76),
      clockOffsetY:clamp(Number(r.design?.clockOffsetY ?? base.design.clockOffsetY),-18,18),
      clockGap:clamp(Number(r.design?.clockGap ?? base.design.clockGap),0,5),
      clockShowLabels:r.design?.clockShowLabels !== false,
      clockLabelMinMinutes:clamp(Number(r.design?.clockLabelMinMinutes ?? base.design.clockLabelMinMinutes),0,180),
      clockLabelSize:clamp(Number(r.design?.clockLabelSize ?? base.design.clockLabelSize),12,26),
      clockLabelContent:['title','titleTime','iconTitle'].includes(r.design?.clockLabelContent) ? r.design.clockLabelContent : base.design.clockLabelContent,
      clockLabelOrientation:['auto','horizontal'].includes(r.design?.clockLabelOrientation) ? r.design.clockLabelOrientation : base.design.clockLabelOrientation,
      clockShowTrack:r.design?.clockShowTrack !== false,
      clockCenterMode:['summary','count','none'].includes(r.design?.clockCenterMode) ? r.design.clockCenterMode : base.design.clockCenterMode
    },
    ui:{
      selectedDay:DAY_ORDER.includes(r.ui?.selectedDay) ? r.ui.selectedDay : 'all',
      theme:['system','light','dark'].includes(r.ui?.theme) ? r.ui.theme : 'system'
    }
  };
  return result;
}

function migrateLegacy() {
  try {
    const old = JSON.parse(localStorage.getItem(LEGACY_KEY) || 'null');
    if (!Array.isArray(old) || !old.length) return null;
    const mapDay = {'공통':'all','월':'mon','화':'tue','수':'wed','목':'thu','금':'fri','토':'sat','일':'sun'};
    const st = defaultState();
    st.schedules = old.map(s => ({
      id:String(s.id || uid('s')),
      days:(s.days || ['공통']).map(d=>mapDay[d]).filter(Boolean),
      start:s.startTime || '09:00', end:s.endTime || '10:00', title:s.title || '일정', detail:s.details || '',
      icon:s.isSleep ? 'moon' : inferIcon(s.title || ''), color:s.isSleep ? '#6473bb' : '#5b9df9'
    }));
    st.document.title = '나의 생활계획표';
    return normalizeState(st);
  } catch { return null; }
}

function inferIcon(text='') {
  const t = text.toLowerCase();
  if (/수면|잠|취침/.test(t)) return 'moon';
  if (/식사|아침|점심|저녁|간식/.test(t)) return 'meal';
  if (/공부|학습|숙제|독서|책/.test(t)) return 'book';
  if (/운동|축구|체육/.test(t)) return 'ball';
  if (/음악|악기|피아노/.test(t)) return 'music';
  if (/미술|만들기|그림/.test(t)) return 'palette';
  if (/게임|놀이/.test(t)) return 'game';
  if (/가족/.test(t)) return 'family';
  if (/친구/.test(t)) return 'friends';
  if (/외출|체험|버스/.test(t)) return 'bus';
  return 'star';
}

let state = defaultState();
let historyPast = [];
let historyFuture = [];
let editingScheduleId = null;
let scheduleIconId = 'sun';
let selectedStickerId = null;
let currentZoom = 1;
let fitWidth = 760;
let saveTimer = null;
let fieldSnapshot = null;
let dragInfo = null;

const refs = {};

async function init() {
  cacheRefs();
  buildStaticUi();
  const shared = await loadSharedStateFromUrl();
  if (shared) {
    state = normalizeState(shared);
    toast('공유된 계획표를 열었습니다. 수정 내용은 이 기기에 자동 저장됩니다.');
    history.replaceState(null, '', location.pathname + location.search);
  } else {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try { state = normalizeState(JSON.parse(stored)); }
      catch { state = defaultState(); }
    } else {
      state = migrateLegacy() || defaultState();
      if (localStorage.getItem(LEGACY_KEY)) toast('기존 생활계획표 데이터를 새 편집기로 가져왔습니다.');
    }
  }
  bindEvents();
  applyUiTheme();
  renderAll();
  persistNow();
  registerServiceWorker();
}

function cacheRefs() {
  const ids = [
    'undoBtn','redoBtn','saveStatus','themeBtn','shareBtn','exportBtn','mobileExportBtn','previewCanvas','previewStage',
    'scheduleList','scheduleSummary','dayPicker','addScheduleBtn','presetGrid','layoutPicker','docTitle','docSubtitle','canvasSize',
    'accentColor','accentColorText','showHours','showDetails','showLegend','shuffleStyleBtn','clockOptions','clockSmartHint','clockProfilePicker','clockScale','clockScaleValue','clockHole','clockHoleValue','clockOffsetY','clockOffsetYValue','clockGap','clockGapValue','clockShowLabels','clockLabelMin','clockLabelMinValue','clockLabelSize','clockLabelSizeValue','clockLabelContent','clockLabelOrientation','clockShowTrack','clockCenterMode','legendPosition','iconGrid','iconSearch','svgFileInput','svgPaste','addPastedSvgBtn',
    'stickerInspector','stickerSize','stickerSizeValue','stickerRotation','stickerRotationValue','stickerColor','stickerActions','deleteStickerBtn','exportJsonBtn','importJsonInput','exportCsvBtn','importCsvInput','resetBtn',
    'zoomOutBtn','zoomInBtn','fitBtn','zoomLabel','scheduleDialog','scheduleForm','scheduleDialogTitle','quickActivity','formDayChecks','startTime','endTime',
    'scheduleTitle','scheduleDetail','scheduleColor','scheduleIconButton','scheduleIconPreview','scheduleIconName','scheduleHideClockLabel','scheduleError','saveScheduleBtn','cancelScheduleBtn',
    'iconChoiceDialog','scheduleIconSearch','scheduleIconGrid','closeIconChoice','shareDialog','shareLink','shareWarning','copyShareBtn','nativeShareBtn','closeShareBtn',
    'exportDialog','closeExportBtn','exportScale','exportName','toastRegion'
  ];
  ids.forEach(id => refs[id] = document.getElementById(id));
}

function buildStaticUi() {
  refs.quickActivity.innerHTML = QUICK_ACTIVITIES.map(a => `<button type="button" class="quick-chip" data-quick="${escapeXml(a.title)}" data-icon="${a.icon}" data-color="${a.color}">${iconSvgMarkup(getIcon(a.icon),{size:15})}<span>${escapeXml(a.title)}</span></button>`).join('');
  refs.formDayChecks.innerHTML = DAYS.map(([id,label]) => `<label class="day-check"><input type="checkbox" value="${id}"><span>${label}</span></label>`).join('');
  refs.presetGrid.innerHTML = Object.entries(PRESETS).map(([id,p]) => `<button type="button" class="preset-card" data-preset="${id}"><span class="preset-mini" data-pattern="${p.pattern}" style="--p-bg:${p.bg};--p-surface:${p.surface};--p-text:${p.text};--p-accent:${p.accent};--p-line:${p.line};--p-radius:${Math.min(18,p.radius||12)}px"><i class="mini-title"></i><i class="mini-ring"></i><i class="mini-card a"></i><i class="mini-card b"></i></span><span class="preset-copy"><strong>${p.name}</strong><small>${p.desc}</small></span></button>`).join('');
  renderIconGrid();
  renderScheduleIconGrid();
}

function bindEvents() {
  $$('.panel-tab').forEach(btn => btn.addEventListener('click', () => openPanel(btn.dataset.panel)));
  $$('.mobile-quickbar [data-open-panel]').forEach(btn => btn.addEventListener('click', () => openPanel(btn.dataset.openPanel, true)));
  refs.previewStage.addEventListener('pointerdown', e => { if (window.innerWidth <= 760 && !e.target.closest('[data-sticker-id]')) $('.tool-panel').classList.remove('is-mobile-open'); });

  refs.undoBtn.addEventListener('click', undo);
  refs.redoBtn.addEventListener('click', redo);
  refs.themeBtn.addEventListener('click', cycleTheme);
  refs.addScheduleBtn.addEventListener('click', () => openScheduleDialog());
  refs.shareBtn.addEventListener('click', openShareDialog);
  refs.exportBtn.addEventListener('click', openExportDialog);
  refs.mobileExportBtn.addEventListener('click', openExportDialog);
  refs.closeShareBtn.addEventListener('click', () => refs.shareDialog.close());
  refs.closeExportBtn.addEventListener('click', () => refs.exportDialog.close());
  refs.closeIconChoice.addEventListener('click', () => refs.iconChoiceDialog.close());

  refs.dayPicker.addEventListener('click', e => {
    const b=e.target.closest('button[data-day]'); if(!b) return;
    mutate(s => { s.ui.selectedDay=b.dataset.day; }, {history:false});
  });
  refs.scheduleList.addEventListener('click', onScheduleListClick);

  refs.layoutPicker.addEventListener('click', e => { const b=e.target.closest('button[data-layout]'); if(b) mutate(s=>s.design.layout=b.dataset.layout); });
  refs.presetGrid.addEventListener('click', e => { const b=e.target.closest('[data-preset]'); if(b) mutate(s=>{ s.design.preset=b.dataset.preset; s.design.accent=PRESETS[b.dataset.preset].accent; }); });
  refs.shuffleStyleBtn.addEventListener('click', shuffleStylePreset);
  refs.canvasSize.addEventListener('change', () => mutate(s=>s.design.size=refs.canvasSize.value));
  refs.showHours.addEventListener('change', () => mutate(s=>s.design.showHours=refs.showHours.checked));
  refs.showDetails.addEventListener('change', () => mutate(s=>s.design.showDetails=refs.showDetails.checked));
  refs.showLegend.addEventListener('change', () => mutate(s=>s.design.showLegend=refs.showLegend.checked));
  refs.clockShowLabels.addEventListener('change', () => mutate(s=>s.design.clockShowLabels=refs.clockShowLabels.checked));
  refs.clockShowTrack.addEventListener('change', () => mutate(s=>s.design.clockShowTrack=refs.clockShowTrack.checked));
  refs.clockLabelContent.addEventListener('change', () => mutate(s=>s.design.clockLabelContent=refs.clockLabelContent.value));
  refs.clockLabelOrientation.addEventListener('change', () => mutate(s=>s.design.clockLabelOrientation=refs.clockLabelOrientation.value));
  refs.clockCenterMode.addEventListener('change', () => mutate(s=>s.design.clockCenterMode=refs.clockCenterMode.value));
  refs.legendPosition.addEventListener('change', () => mutate(s=>s.design.legendPosition=refs.legendPosition.value));
  refs.clockProfilePicker.addEventListener('click', e => { const b=e.target.closest('[data-clock-profile]'); if(b) applyClockProfile(b.dataset.clockProfile); });
  bindDesignRange(refs.clockScale,'clockScale');
  bindDesignRange(refs.clockHole,'clockHole');
  bindDesignRange(refs.clockOffsetY,'clockOffsetY');
  bindDesignRange(refs.clockGap,'clockGap');
  bindDesignRange(refs.clockLabelMin,'clockLabelMinMinutes');
  bindDesignRange(refs.clockLabelSize,'clockLabelSize');
  bindLiveField(refs.docTitle, (s,v)=>s.document.title=v, () => state.document.title);
  bindLiveField(refs.docSubtitle, (s,v)=>s.document.subtitle=v, () => state.document.subtitle);
  bindLiveField(refs.accentColor, (s,v)=>s.design.accent=safeColor(v,s.design.accent), () => state.design.accent);

  refs.iconSearch.addEventListener('input', renderIconGrid);
  refs.iconGrid.addEventListener('click', e => { const b=e.target.closest('[data-icon-id]'); if(b) addSticker(b.dataset.iconId); });
  refs.svgFileInput.addEventListener('change', importSvgFile);
  refs.addPastedSvgBtn.addEventListener('click', () => addCustomSvg(refs.svgPaste.value, '붙여넣은 SVG'));
  refs.deleteStickerBtn.addEventListener('click', deleteSelectedSticker);
  refs.stickerActions.addEventListener('click', onStickerAction);
  refs.stickerSize.addEventListener('input', () => updateStickerLive('size', Number(refs.stickerSize.value)));
  refs.stickerRotation.addEventListener('input', () => updateStickerLive('rotation', Number(refs.stickerRotation.value)));
  refs.stickerColor.addEventListener('input', () => updateStickerLive('color', refs.stickerColor.value));
  [refs.stickerSize,refs.stickerRotation,refs.stickerColor].forEach(el=>{
    el.addEventListener('pointerdown', startStickerFieldHistory);
    el.addEventListener('change', finishStickerFieldHistory);
  });

  refs.exportJsonBtn.addEventListener('click', exportJson);
  refs.importJsonInput.addEventListener('change', importJson);
  refs.exportCsvBtn.addEventListener('click', exportCsv);
  refs.importCsvInput.addEventListener('change', importCsv);
  refs.resetBtn.addEventListener('click', resetProject);

  refs.zoomOutBtn.addEventListener('click', () => setZoom(currentZoom-.1));
  refs.zoomInBtn.addEventListener('click', () => setZoom(currentZoom+.1));
  refs.fitBtn.addEventListener('click', fitPreview);
  window.addEventListener('resize', fitPreview);

  refs.quickActivity.addEventListener('click', e => {
    const b=e.target.closest('[data-quick]'); if(!b) return;
    refs.scheduleTitle.value=b.dataset.quick; refs.scheduleColor.value=b.dataset.color; scheduleIconId=b.dataset.icon; updateScheduleIconButton();
  });
  refs.scheduleForm.addEventListener('submit', saveScheduleFromDialog);
  refs.cancelScheduleBtn.addEventListener('click', () => refs.scheduleDialog.close());
  refs.scheduleIconButton.addEventListener('click', () => { renderScheduleIconGrid(); refs.iconChoiceDialog.showModal(); refs.scheduleIconSearch.focus(); });
  refs.scheduleIconSearch.addEventListener('input', renderScheduleIconGrid);
  refs.scheduleIconGrid.addEventListener('click', e => { const b=e.target.closest('[data-icon-id]'); if(!b) return; scheduleIconId=b.dataset.iconId; updateScheduleIconButton(); refs.iconChoiceDialog.close(); });
  refs.formDayChecks.addEventListener('change', enforceDayCheckLogic);

  refs.copyShareBtn.addEventListener('click', copyShareLink);
  refs.nativeShareBtn.addEventListener('click', nativeShare);
  refs.exportDialog.addEventListener('click', e => { const b=e.target.closest('[data-export]'); if(b) handleExport(b.dataset.export); });

  refs.previewCanvas.addEventListener('pointerdown', startStickerDrag);
  document.addEventListener('pointermove', moveStickerDrag);
  document.addEventListener('pointerup', endStickerDrag);

  document.addEventListener('keydown', e => {
    const mod=e.ctrlKey||e.metaKey;
    if(mod && e.key.toLowerCase()==='z') { e.preventDefault(); e.shiftKey ? redo() : undo(); }
    else if(mod && e.key.toLowerCase()==='y') { e.preventDefault(); redo(); }
    else if(e.key==='Escape' && window.innerWidth<=760) $('.tool-panel').classList.remove('is-mobile-open');
    else if((e.key==='Delete'||e.key==='Backspace') && selectedStickerId && !['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)) { e.preventDefault(); deleteSelectedSticker(); }
  });
}

function syncActivePanel() {
  $$('.panel-tab').forEach(b => { const active=b.dataset.panel===activePanelId; b.classList.toggle('is-active',active); b.setAttribute('aria-selected',String(active)); });
  $$('.panel-content').forEach(p => { const active=p.id===activePanelId; p.hidden=!active; p.classList.toggle('is-active',active); });
}
function openPanel(id, mobileOpen=false) {
  activePanelId=id;
  syncActivePanel();
  if (mobileOpen || window.innerWidth<=760) $('.tool-panel').classList.add('is-mobile-open');
}

function mutate(mutator, {history=true, render=true}={}) {
  if(history) {
    historyPast.push(JSON.stringify(state));
    if(historyPast.length>MAX_HISTORY) historyPast.shift();
    historyFuture=[];
  }
  mutator(state);
  state=normalizeState(state);
  if(render) renderAll();
  schedulePersist();
}

function bindLiveField(el, setter, getter) {
  el.addEventListener('focus', () => { fieldSnapshot=JSON.stringify(state); });
  el.addEventListener('input', () => { setter(state, el.value); state=normalizeState(state); renderPreview(); syncDesignControls(); schedulePersist(); });
  el.addEventListener('change', () => { if(fieldSnapshot && fieldSnapshot!==JSON.stringify(state)) { historyPast.push(fieldSnapshot); if(historyPast.length>MAX_HISTORY) historyPast.shift(); historyFuture=[]; updateHistoryButtons(); } fieldSnapshot=null; });
}

function bindDesignRange(el,key) {
  el.addEventListener('pointerdown', () => { fieldSnapshot=JSON.stringify(state); });
  el.addEventListener('input', () => { state.design[key]=Number(el.value); state=normalizeState(state); renderPreview(); syncDesignControls(); schedulePersist(); });
  el.addEventListener('change', () => {
    if(fieldSnapshot && fieldSnapshot!==JSON.stringify(state)) { historyPast.push(fieldSnapshot); if(historyPast.length>MAX_HISTORY) historyPast.shift(); historyFuture=[]; updateHistoryButtons(); }
    fieldSnapshot=null;
  });
}

function undo() {
  if(!historyPast.length) return;
  historyFuture.push(JSON.stringify(state));
  state=normalizeState(JSON.parse(historyPast.pop()));
  selectedStickerId=null; renderAll(); schedulePersist();
}
function redo() {
  if(!historyFuture.length) return;
  historyPast.push(JSON.stringify(state));
  state=normalizeState(JSON.parse(historyFuture.pop()));
  selectedStickerId=null; renderAll(); schedulePersist();
}
function updateHistoryButtons() { refs.undoBtn.disabled=!historyPast.length; refs.redoBtn.disabled=!historyFuture.length; }

function schedulePersist() {
  refs.saveStatus.classList.add('is-saving'); refs.saveStatus.lastChild.textContent='저장 중';
  clearTimeout(saveTimer); saveTimer=setTimeout(persistNow,220);
}
function persistNow() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  catch { toast('브라우저 저장 공간이 부족합니다. JSON 백업을 권장해요.', true); }
  refs.saveStatus?.classList.remove('is-saving'); if(refs.saveStatus) refs.saveStatus.lastChild.textContent='저장됨';
}

function renderAll() {
  syncActivePanel(); applyUiTheme(); renderScheduleList(); syncDesignControls(); renderIconGrid(); renderPreview(); updateStickerInspector(); updateHistoryButtons();
  requestAnimationFrame(fitPreview);
}

function applyUiTheme() {
  let theme=state.ui.theme;
  if(theme==='system') theme=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';
  document.documentElement.dataset.theme=theme;
}
function cycleTheme() {
  const next={system:'light',light:'dark',dark:'system'}[state.ui.theme] || 'system';
  mutate(s=>s.ui.theme=next,{history:false});
  toast(`화면 테마: ${next==='system'?'시스템 설정':next==='dark'?'다크':'라이트'}`);
}

function getVisibleSchedules(day=state.ui.selectedDay) {
  return state.schedules.filter(s => day==='all' ? s.days.includes('all') : (s.days.includes('all') || s.days.includes(day))).sort(compareSchedule);
}
function compareSchedule(a,b) { return timeToMin(a.start)-timeToMin(b.start); }

function renderScheduleList() {
  $$('#dayPicker button').forEach(b=>b.classList.toggle('is-active',b.dataset.day===state.ui.selectedDay));
  const items=getVisibleSchedules();
  const total=items.reduce((sum,s)=>sum+durationMin(s.start,s.end),0);
  refs.scheduleSummary.innerHTML=`<strong>${DAY_NAME[state.ui.selectedDay]} 일정 ${items.length}개</strong><span>·</span><span>계획 ${durationText(total)}</span>`;
  if(!items.length) {
    refs.scheduleList.innerHTML=`<div class="empty-state"><strong>${DAY_NAME[state.ui.selectedDay]} 일정이 아직 없어요</strong><p>시간과 활동을 넣으면 포스터에 바로 나타납니다.</p><button class="small-primary" type="button" data-empty-add>+ 첫 일정 추가</button></div>`;
    return;
  }
  refs.scheduleList.innerHTML=items.map(s=>{
    const icon=getIcon(s.icon,state.customIcons);
    const days=s.days.includes('all')?'매일':s.days.map(d=>DAY_NAME[d]).join('·');
    return `<article class="schedule-card" style="--card-color:${s.color}">
      <div class="schedule-icon">${iconSvgMarkup(icon,{size:23})}</div>
      <div class="schedule-main" data-edit="${s.id}" tabindex="0" role="button" aria-label="${escapeXml(s.title)} 수정">
        <div class="schedule-time"><span>${formatTime(s.start)}–${formatTime(s.end)}</span><span class="day-chip">${days}</span></div>
        <strong>${escapeXml(s.title)}</strong>${s.detail?`<small>${escapeXml(s.detail)}</small>`:''}
      </div>
      <div class="card-menu"><button type="button" data-duplicate="${s.id}" aria-label="복제" title="복제"><svg viewBox="0 0 24 24"><rect x="8" y="8" width="11" height="11" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/></svg></button><button type="button" data-delete="${s.id}" aria-label="삭제" title="삭제"><svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14M10 11v6M14 11v6"/></svg></button></div>
    </article>`;
  }).join('');
}

function onScheduleListClick(e) {
  if(e.target.closest('[data-empty-add]')) return openScheduleDialog();
  const del=e.target.closest('[data-delete]');
  if(del) { if(confirm('이 일정을 삭제할까요?')) mutate(s=>s.schedules=s.schedules.filter(x=>x.id!==del.dataset.delete)); return; }
  const dup=e.target.closest('[data-duplicate]');
  if(dup) { const src=state.schedules.find(x=>x.id===dup.dataset.duplicate); if(src) mutate(s=>s.schedules.push({...deepClone(src),id:uid('s'),title:`${src.title} 복사본`})); return; }
  const edit=e.target.closest('[data-edit]'); if(edit) openScheduleDialog(edit.dataset.edit);
}

function openScheduleDialog(id=null) {
  editingScheduleId=id;
  refs.scheduleError.hidden=true;
  const s=id ? state.schedules.find(x=>x.id===id) : null;
  refs.scheduleDialogTitle.textContent=s?'일정 수정':'일정 추가';
  refs.saveScheduleBtn.textContent=s?'수정하기':'추가하기';
  const dayDefault=state.ui.selectedDay==='all'?['all']:[state.ui.selectedDay];
  const selected=s?.days || dayDefault;
  $$('#formDayChecks input').forEach(cb=>{cb.checked=selected.includes(cb.value); cb.disabled=false;});
  if(selected.includes('all')) $$('#formDayChecks input').filter(cb=>cb.value!=='all').forEach(cb=>cb.disabled=true);
  refs.startTime.value=s?.start || suggestStartTime(); refs.endTime.value=s?.end || suggestEndTime(refs.startTime.value);
  refs.scheduleTitle.value=s?.title || '';
  refs.scheduleDetail.value=s?.detail || '';
  refs.scheduleColor.value=s?.color || '#5b9df9';
  refs.scheduleHideClockLabel.checked=s?.hideClockLabel === true;
  scheduleIconId=s?.icon || 'sun'; updateScheduleIconButton();
  refs.scheduleDialog.showModal();
  setTimeout(()=>refs.scheduleTitle.focus(),30);
}
function suggestStartTime() { const items=getVisibleSchedules(); return items.length ? items[items.length-1].end : '09:00'; }
function suggestEndTime(start) { const m=(timeToMin(start)+60)%1440; return `${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`; }
function enforceDayCheckLogic(e) {
  const changed=e.target; if(!(changed instanceof HTMLInputElement)) return;
  const all=$('#formDayChecks input[value="all"]'); const others=$$('#formDayChecks input').filter(cb=>cb.value!=='all');
  if(changed.value==='all' && changed.checked) { others.forEach(cb=>{cb.checked=false;cb.disabled=true;}); }
  else if(changed.value==='all' && !changed.checked) others.forEach(cb=>cb.disabled=false);
  else if(changed.checked) { all.checked=false; others.forEach(cb=>cb.disabled=false); }
}
function saveScheduleFromDialog(e) {
  e.preventDefault();
  const days=$$('#formDayChecks input:checked').map(cb=>cb.value);
  const start=refs.startTime.value, end=refs.endTime.value, title=refs.scheduleTitle.value.trim(), detail=refs.scheduleDetail.value.trim();
  if(!days.length || !start || !end || !title) return showScheduleError('요일, 시작/종료 시간, 활동 이름을 모두 입력해주세요.');
  if(start===end) return showScheduleError('시작 시간과 종료 시간은 달라야 해요.');
  const candidate={id:editingScheduleId||uid('s'),days,start,end,title,detail,icon:scheduleIconId,color:refs.scheduleColor.value,hideClockLabel:refs.scheduleHideClockLabel.checked};
  const conflict=findConflict(candidate,editingScheduleId);
  if(conflict) return showScheduleError(`“${conflict.title}” 일정과 시간이 겹쳐요. 시간을 조금 바꿔주세요.`);
  mutate(s=>{
    if(editingScheduleId) s.schedules=s.schedules.map(x=>x.id===editingScheduleId?candidate:x);
    else s.schedules.push(candidate);
  });
  refs.scheduleDialog.close(); toast(editingScheduleId?'일정을 수정했습니다.':'일정을 추가했습니다.');
}
function showScheduleError(msg) { refs.scheduleError.hidden=false; refs.scheduleError.textContent=msg; }
function daySet(days) { return days.includes('all') ? new Set(DAY_ORDER.slice(1)) : new Set(days); }
function daysIntersect(a,b) { const A=daySet(a),B=daySet(b); return [...A].some(d=>B.has(d)); }
function splitIntervals(start,end) { const s=timeToMin(start),e=timeToMin(end); return e>s ? [[s,e]] : [[s,1440],[0,e]]; }
function intervalsOverlap(a,b) { return a[0]<b[1] && b[0]<a[1]; }
function findConflict(candidate, excludeId=null) {
  const ci=splitIntervals(candidate.start,candidate.end);
  return state.schedules.find(s=>s.id!==excludeId && daysIntersect(candidate.days,s.days) && ci.some(a=>splitIntervals(s.start,s.end).some(b=>intervalsOverlap(a,b))));
}
function updateScheduleIconButton() { const icon=getIcon(scheduleIconId,state.customIcons); refs.scheduleIconPreview.innerHTML=iconSvgMarkup(icon,{size:22}); refs.scheduleIconName.textContent=icon?.name || '아이콘'; }

function applyClockProfile(profile) {
  const profiles={
    balanced:{clockScale:100,clockHole:58,clockOffsetY:0,clockGap:1.2,clockShowLabels:true,clockLabelMinMinutes:45,clockLabelSize:18,clockLabelContent:'titleTime',clockLabelOrientation:'auto',clockShowTrack:true,clockCenterMode:'summary',showLegend:true,legendPosition:'auto'},
    inside:{clockScale:100,clockHole:38,clockOffsetY:0,clockGap:1.4,clockShowLabels:true,clockLabelMinMinutes:60,clockLabelSize:18,clockLabelContent:'titleTime',clockLabelOrientation:'horizontal',clockShowTrack:true,clockCenterMode:'summary',showLegend:false,legendPosition:'auto'},
    minimal:{clockScale:94,clockHole:72,clockOffsetY:0,clockGap:1,clockShowLabels:false,clockLabelMinMinutes:60,clockLabelSize:16,clockLabelContent:'title',clockLabelOrientation:'auto',clockShowTrack:true,clockCenterMode:'count',showLegend:true,legendPosition:'auto'},
    poster:{clockScale:108,clockHole:52,clockOffsetY:0,clockGap:2,clockShowLabels:true,clockLabelMinMinutes:75,clockLabelSize:19,clockLabelContent:'title',clockLabelOrientation:'auto',clockShowTrack:true,clockCenterMode:'summary',showLegend:false,legendPosition:'auto'}
  };
  const next=profiles[profile]; if(!next)return;
  mutate(s=>Object.assign(s.design,next));
  toast({balanced:'균형형 원형 구성',inside:'원 안 텍스트 구성',minimal:'미니멀 원형 구성',poster:'원형 강조 구성'}[profile]+'을 적용했습니다.');
}

function syncDesignControls() {
  refs.docTitle.value=state.document.title; refs.docSubtitle.value=state.document.subtitle;
  refs.canvasSize.value=state.design.size; refs.accentColor.value=state.design.accent; refs.accentColorText.textContent=state.design.accent.toUpperCase();
  refs.showHours.checked=state.design.showHours; refs.showDetails.checked=state.design.showDetails; refs.showLegend.checked=state.design.showLegend;
  refs.clockOptions.hidden=state.design.layout!=='clock';
  refs.clockScale.value=state.design.clockScale; refs.clockScaleValue.textContent=`${Math.round(state.design.clockScale)}%`;
  refs.clockHole.value=state.design.clockHole; refs.clockHoleValue.textContent=`${Math.round(state.design.clockHole)}%`;
  refs.clockOffsetY.value=state.design.clockOffsetY; refs.clockOffsetYValue.textContent=`${state.design.clockOffsetY>0?'+':''}${Math.round(state.design.clockOffsetY)}%`;
  refs.clockGap.value=state.design.clockGap; refs.clockGapValue.textContent=`${Number(state.design.clockGap).toFixed(1)}°`;
  refs.clockShowLabels.checked=state.design.clockShowLabels;
  refs.clockShowTrack.checked=state.design.clockShowTrack;
  refs.clockLabelMin.value=state.design.clockLabelMinMinutes; refs.clockLabelMinValue.textContent=state.design.clockLabelMinMinutes===0?'모두 표시':`${Math.round(state.design.clockLabelMinMinutes)}분 미만`;
  refs.clockLabelSize.value=state.design.clockLabelSize; refs.clockLabelSizeValue.textContent=`${Math.round(state.design.clockLabelSize)}px`; 
  refs.clockLabelContent.value=state.design.clockLabelContent; refs.clockLabelOrientation.value=state.design.clockLabelOrientation;
  refs.clockCenterMode.value=state.design.clockCenterMode; refs.legendPosition.value=state.design.legendPosition;
  if(refs.clockSmartHint) {
    const visible=getVisibleSchedules();
    const shortCount=visible.filter(s=>durationMin(s.start,s.end)<state.design.clockLabelMinMinutes || s.hideClockLabel).length;
    const sizeName=CANVAS_SIZES[state.design.size]?.label || '현재 비율';
    let note=`${sizeName}: 24시간을 360°로 나눠 각 일정이 자기 시간 각도 안에서만 표시됩니다. 바깥 원은 고정되고 내측 원만 조절됩니다.`;
    if(state.design.clockShowLabels && state.design.clockHole>68) note+=' 내측 원이 커지면 띠가 얇아져 라벨은 자동 축소·생략될 수 있어요.';
    if(state.design.clockShowLabels && shortCount) note+=` 현재 ${shortCount}개 일정 라벨은 짧은 시간/개별 설정으로 숨겨집니다.`;
    refs.clockSmartHint.textContent=note;
  }
  $$('#layoutPicker [data-layout]').forEach(b=>b.classList.toggle('is-active',b.dataset.layout===state.design.layout));
  $$('#presetGrid [data-preset]').forEach(b=>b.classList.toggle('is-active',b.dataset.preset===state.design.preset));
}

function allIcons() { return [...BUILTIN_ICONS, ...state.customIcons]; }
function renderIconGrid() {
  if(!refs.iconGrid) return;
  const q=(refs.iconSearch?.value || '').trim().toLowerCase();
  const icons=allIcons().filter(i=>!q || `${i.name} ${i.keywords||''}`.toLowerCase().includes(q));
  refs.iconGrid.innerHTML=icons.length ? icons.map(i=>`<button type="button" class="icon-tile" data-icon-id="${escapeXml(i.id)}" title="${escapeXml(i.name)}">${iconSvgMarkup(i,{size:25})}<span>${escapeXml(i.name)}</span></button>`).join('') : `<div class="empty-state" style="grid-column:1/-1"><strong>아이콘을 찾지 못했어요</strong><p>다른 검색어를 입력해보세요.</p></div>`;
}
function renderScheduleIconGrid() {
  if(!refs.scheduleIconGrid) return;
  const q=(refs.scheduleIconSearch?.value || '').trim().toLowerCase();
  const icons=allIcons().filter(i=>!q || `${i.name} ${i.keywords||''}`.toLowerCase().includes(q));
  refs.scheduleIconGrid.innerHTML=icons.map(i=>`<button type="button" class="icon-tile" data-icon-id="${escapeXml(i.id)}" title="${escapeXml(i.name)}">${iconSvgMarkup(i,{size:25})}</button>`).join('');
}
function addSticker(iconId) {
  const p=PRESETS[state.design.preset];
  mutate(s=>s.stickers.push({id:uid('st'),icon:iconId,x:.82,y:.18,size:90,rotation:-8,color:s.design.accent||p.accent}));
  selectedStickerId=state.stickers[state.stickers.length-1]?.id || null;
  renderPreview(); updateStickerInspector(); toast('스티커를 추가했습니다. 미리보기에서 드래그해 옮겨보세요.');
}
function updateStickerInspector() {
  const st=state.stickers.find(x=>x.id===selectedStickerId);
  refs.stickerInspector.hidden=!st;
  if(st) {
    refs.stickerSize.value=st.size; refs.stickerRotation.value=st.rotation; refs.stickerColor.value=st.color;
    refs.stickerSizeValue.textContent=`${Math.round(st.size)} px`;
    refs.stickerRotationValue.textContent=`${Math.round(st.rotation)}°`;
  }
}
function startStickerFieldHistory(){ if(selectedStickerId) fieldSnapshot=JSON.stringify(state); }
function finishStickerFieldHistory(){ if(fieldSnapshot&&fieldSnapshot!==JSON.stringify(state)){historyPast.push(fieldSnapshot);historyFuture=[];updateHistoryButtons();schedulePersist();} fieldSnapshot=null; }
function updateStickerLive(key,value) {
  const st=state.stickers.find(x=>x.id===selectedStickerId); if(!st)return;
  if(key==='size') value=clamp(Number(value)||90,24,360);
  if(key==='rotation') value=clamp(Number(value)||0,-180,180);
  st[key]=key==='color'?safeColor(value,st.color):value;
  updateStickerInspector(); renderPreview(); schedulePersist();
}
function deleteSelectedSticker() { if(!selectedStickerId)return; mutate(s=>s.stickers=s.stickers.filter(x=>x.id!==selectedStickerId)); selectedStickerId=null; updateStickerInspector(); }
function onStickerAction(e) {
  const btn=e.target.closest('[data-sticker-action]'); if(!btn || !selectedStickerId)return;
  const action=btn.dataset.stickerAction;
  if(action==='duplicate') {
    mutate(s=>{ const idx=s.stickers.findIndex(x=>x.id===selectedStickerId); if(idx<0)return; const src=s.stickers[idx]; const copy={...src,id:uid('st'),x:clamp(src.x+.035,.04,.96),y:clamp(src.y+.035,.04,.96)}; s.stickers.splice(idx+1,0,copy); selectedStickerId=copy.id; });
    toast('스티커를 복제했습니다.'); return;
  }
  mutate(s=>{
    const idx=s.stickers.findIndex(x=>x.id===selectedStickerId); if(idx<0)return;
    const st=s.stickers[idx];
    if(action==='reset'){ st.size=90; st.rotation=0; }
    if(action==='front'){ s.stickers.splice(idx,1); s.stickers.push(st); }
    if(action==='back'){ s.stickers.splice(idx,1); s.stickers.unshift(st); }
  });
}
function shuffleStylePreset() {
  const ids=Object.keys(PRESETS).filter(id=>id!==state.design.preset);
  const next=ids[Math.floor(Math.random()*ids.length)] || 'playful';
  mutate(s=>{ s.design.preset=next; s.design.accent=PRESETS[next].accent; });
  toast(`“${PRESETS[next].name}” 스타일로 바꿨습니다.`);
}

function startStickerDrag(e) {
  const g=e.target.closest?.('[data-sticker-id]'); if(!g)return;
  const id=g.dataset.stickerId; const st=state.stickers.find(x=>x.id===id); if(!st)return;
  const svg=refs.previewCanvas.querySelector('svg'); if(!svg)return;
  const pt=pointInSvg(e); if(!pt)return;
  const vb=svg.viewBox.baseVal; const cx=st.x*vb.width, cy=st.y*vb.height;
  const handle=e.target.closest?.('[data-sticker-handle]')?.dataset.stickerHandle || 'move';
  e.preventDefault(); selectedStickerId=id; updateStickerInspector(); renderPreview();
  const startAngle=Math.atan2(pt.y-cy,pt.x-cx)*180/Math.PI;
  const startDistance=Math.max(1,Math.hypot(pt.x-cx,pt.y-cy));
  dragInfo={id,mode:handle,startSnapshot:JSON.stringify(state),moved:false,pointerId:e.pointerId,cx,cy,startAngle,startDistance,startSize:st.size,startRotation:st.rotation};
}
function pointInSvg(e) {
  const svg=refs.previewCanvas.querySelector('svg'); if(!svg)return null;
  const pt=svg.createSVGPoint(); pt.x=e.clientX; pt.y=e.clientY; const ctm=svg.getScreenCTM(); if(!ctm)return null; return pt.matrixTransform(ctm.inverse());
}
function moveStickerDrag(e) {
  if(!dragInfo || e.pointerId!==dragInfo.pointerId)return;
  const pt=pointInSvg(e); const svg=refs.previewCanvas.querySelector('svg'); if(!pt||!svg)return;
  const vb=svg.viewBox.baseVal; const st=state.stickers.find(x=>x.id===dragInfo.id); if(!st)return;
  if(dragInfo.mode==='resize') {
    const dist=Math.max(1,Math.hypot(pt.x-dragInfo.cx,pt.y-dragInfo.cy));
    st.size=clamp(dragInfo.startSize*(dist/dragInfo.startDistance),24,360);
  } else if(dragInfo.mode==='rotate') {
    const angle=Math.atan2(pt.y-dragInfo.cy,pt.x-dragInfo.cx)*180/Math.PI;
    let rotation=dragInfo.startRotation+(angle-dragInfo.startAngle);
    if(e.shiftKey) rotation=Math.round(rotation/15)*15;
    st.rotation=((rotation+180)%360+360)%360-180;
  } else {
    st.x=clamp(pt.x/vb.width,.02,.98); st.y=clamp(pt.y/vb.height,.02,.98);
  }
  dragInfo.moved=true; updateStickerInspector(); renderPreview();
}
function endStickerDrag(e) {
  if(!dragInfo || e.pointerId!==dragInfo.pointerId)return;
  if(dragInfo.moved) { historyPast.push(dragInfo.startSnapshot); if(historyPast.length>MAX_HISTORY)historyPast.shift(); historyFuture=[]; schedulePersist(); updateHistoryButtons(); }
  dragInfo=null; renderPreview();
}
function stickerRenderSize(st,w,h) { return st.size*clamp(Math.min(w,h)/1200,.78,1.25); }
function stickerTransform(st,w,h,s=stickerRenderSize(st,w,h)) { const x=st.x*w,y=st.y*h; return `translate(${x} ${y}) rotate(${st.rotation}) translate(${-s/2} ${-s/2})`; }

async function importSvgFile(e) {
  const file=e.target.files?.[0]; e.target.value=''; if(!file)return;
  if(file.size>200_000) return toast('SVG 파일은 200KB 이하를 권장합니다.',true);
  const text=await file.text(); addCustomSvg(text,file.name.replace(/\.svg$/i,''));
}
function addCustomSvg(svgText,name='내 SVG') {
  try {
    const clean=sanitizeSvg(svgText); if(!clean) throw new Error('지원할 수 없는 SVG입니다.');
    const icon={id:uid('custom'),name:String(name).slice(0,40),keywords:'내 아이콘 custom',viewBox:clean.viewBox,body:clean.body,custom:true};
    mutate(s=>s.customIcons.push(icon)); refs.svgPaste.value=''; renderScheduleIconGrid(); toast('내 SVG 아이콘을 추가했습니다.');
  } catch(err) { toast(err.message || 'SVG를 가져오지 못했습니다.',true); }
}
function sanitizeSvg(text) {
  const doc=new DOMParser().parseFromString(String(text),'image/svg+xml'); const root=doc.documentElement;
  if(root.nodeName.toLowerCase()!=='svg' || doc.querySelector('parsererror')) return null;
  const allowedTags=new Set(['g','path','circle','rect','line','polyline','polygon','ellipse']);
  const allowedAttrs=new Set(['d','cx','cy','r','rx','ry','x','y','x1','x2','y1','y2','width','height','points','transform','fill','stroke','stroke-width','stroke-linecap','stroke-linejoin','fill-rule','clip-rule','opacity']);
  function cleanNode(node){
    if(node.nodeType!==1 || !allowedTags.has(node.nodeName.toLowerCase())) return '';
    const attrs=[...node.attributes].filter(a=>allowedAttrs.has(a.name)).filter(a=>!/(url\s*\(|javascript:|data:)/i.test(a.value)).map(a=>`${a.name}="${escapeXml(a.value)}"`).join(' ');
    const children=[...node.children].map(cleanNode).join('');
    return `<${node.nodeName.toLowerCase()}${attrs?' '+attrs:''}>${children}</${node.nodeName.toLowerCase()}>`;
  }
  const body=[...root.children].map(cleanNode).join(''); if(!body)return null;
  let viewBox=root.getAttribute('viewBox') || '0 0 24 24'; if(!/^\s*-?[\d.]+\s+-?[\d.]+\s+[\d.]+\s+[\d.]+\s*$/.test(viewBox)) viewBox='0 0 24 24';
  return {viewBox,body};
}

function renderPreview() {
  refs.previewCanvas.innerHTML=buildPosterSvg({editor:true});
}

function posterFont(p) { return p.font || "system-ui,'Noto Sans KR',sans-serif"; }
function posterTitleFont(p) { return p.titleFont || posterFont(p); }
function scheduleColor(s,i,p) { return p.paletteMode==='preset' ? p.palette[i%p.palette.length] : s.color; }
function posterFilter(p) {
  if(p.shadow==='hard') return 'url(#hardShadow)';
  if(p.shadow==='glow') return 'url(#glow)';
  if(p.shadow==='paper') return 'url(#paperShadow)';
  if(p.shadow==='none') return '';
  return 'url(#shadow)';
}
function cardShell(x,y,w,h,p,color,extra='') {
  const rx=Math.max(0,Math.min(p.radius ?? 16, h*.42));
  const filter=posterFilter(p); const f=filter?` filter="${filter}"`:'';
  if(p.card==='brutal') return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${p.surface}" stroke="${p.text}" stroke-width="${p.border||5}"${f}/><rect x="${x}" y="${y}" width="${Math.max(10,w*.035)}" height="${h}" fill="${color}"/>`;
  if(p.card==='comic') return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${p.surface}" stroke="${p.text}" stroke-width="${p.border||4}"${f}/><path d="M${x+w*.76} ${y}h${w*.24}v${h*.28}" fill="${color}" stroke="${p.text}" stroke-width="3"/>`;
  if(p.card==='pixel') return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${p.surface}" stroke="${color}" stroke-width="${p.border||4}"${f}/><path d="M${x+8} ${y+8}h${w-16}M${x+8} ${y+h-8}h${w-16}" stroke="${p.line}" stroke-width="2"/>`;
  if(p.card==='neon') return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${p.surface}" stroke="${color}" stroke-width="${p.border||2}"${f}/><rect x="${x+5}" y="${y+5}" width="${w-10}" height="${h-10}" rx="${Math.max(0,rx-5)}" fill="none" stroke="${color}" stroke-opacity=".24"/>`;
  if(p.card==='glass') return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${p.surface}" fill-opacity=".72" stroke="#fff" stroke-opacity=".66" stroke-width="2"${f}/><path d="M${x+rx} ${y+2}h${Math.max(0,w-rx*2)}" stroke="#fff" stroke-opacity=".55" stroke-width="3"/>`;
  if(p.card==='chalk') return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${p.surface}" fill-opacity=".38" stroke="${color}" stroke-width="2" stroke-dasharray="9 7"/>`;
  if(p.card==='outline') return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${p.surface}" fill-opacity=".18" stroke="${p.text}" stroke-opacity=".76" stroke-width="${p.border||2}"/><path d="M${x} ${y+Math.min(18,h*.2)}h${w}" stroke="${color}" stroke-width="3"/>`;
  if(p.card==='editorial') return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${p.surface}" fill-opacity=".36"/><line x1="${x}" y1="${y+h}" x2="${x+w}" y2="${y+h}" stroke="${p.text}" stroke-width="${p.border||1.2}"/><rect x="${x}" y="${y}" width="${Math.max(5,w*.012)}" height="${h}" fill="${color}"/>`;
  if(p.card==='paper') return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${p.surface}" stroke="${p.line}" stroke-width="${p.border||1.5}"${f}/><rect x="${x+w*.39}" y="${y-5}" width="${w*.22}" height="10" rx="2" fill="${p.accent}" fill-opacity=".20"/>`;
  if(p.card==='jelly') return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${Math.min(h/2,rx)}" fill="${p.surface}" stroke="${color}" stroke-opacity=".28" stroke-width="2"${f}/><ellipse cx="${x+w*.75}" cy="${y+h*.22}" rx="${w*.12}" ry="${h*.10}" fill="#fff" opacity=".45"/>`;
  if(p.card==='retro') return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${p.surface}" stroke="${p.text}" stroke-opacity=".38" stroke-width="2"${f}/><path d="M${x+16} ${y+12}h${Math.max(0,w-32)}" stroke="${color}" stroke-width="7" stroke-linecap="round"/>`;
  if(p.card==='night') return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${p.surface}" stroke="${color}" stroke-opacity=".42" stroke-width="1.5"${f}/>`;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${p.surface}" stroke="${p.line}" stroke-width="${p.border||1.2}"${f}/>${extra}`;
}

function buildPosterSvg({editor=false}={}) {
  const {w,h}=CANVAS_SIZES[state.design.size]; const p={...PRESETS[state.design.preset],accent:state.design.accent};
  const schedules=getVisibleSchedules();
  const defs=`<defs>
    <filter id="shadow" x="-25%" y="-25%" width="150%" height="150%"><feDropShadow dx="0" dy="12" stdDeviation="18" flood-color="#000" flood-opacity=".11"/></filter>
    <filter id="paperShadow" x="-20%" y="-20%" width="150%" height="150%"><feDropShadow dx="5" dy="7" stdDeviation="4" flood-color="#513d2f" flood-opacity=".17"/></filter>
    <filter id="hardShadow" x="-25%" y="-25%" width="155%" height="155%"><feDropShadow dx="9" dy="9" stdDeviation="0" flood-color="#000" flood-opacity=".92"/></filter>
    <filter id="glow" x="-40%" y="-40%" width="180%" height="180%"><feDropShadow dx="0" dy="0" stdDeviation="9" flood-color="${p.accent}" flood-opacity=".45"/><feDropShadow dx="0" dy="0" stdDeviation="2" flood-color="${p.accent}" flood-opacity=".9"/></filter>
    <filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="35"/></filter>
  </defs>`;
  const bg=renderPosterBackground(w,h,p); const frame=renderPosterFrame(w,h,p);
  let content='';
  if(state.design.layout==='timeline') content=renderTimelineLayout(w,h,p,schedules);
  else if(state.design.layout==='cards') content=renderCardsLayout(w,h,p,schedules);
  else content=renderClockLayout(w,h,p,schedules);
  const stickers=state.stickers.map(st=>renderSticker(st,w,h,editor)).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${escapeXml(state.document.title)}"><rect width="${w}" height="${h}" fill="${p.bg}"/>${defs}${bg}${frame}${content}<g id="stickers">${stickers}</g></svg>`;
}

function renderPosterFrame(w,h,p) {
  if(p.pattern==='brutal') return `<rect x="18" y="18" width="${w-36}" height="${h-36}" fill="none" stroke="${p.text}" stroke-width="14"/><rect x="18" y="18" width="${w*.18}" height="28" fill="${p.accent}"/><rect x="${w-18-w*.12}" y="${h-46}" width="${w*.12}" height="28" fill="${p.accent}"/>`;
  if(p.pattern==='comic') return `<rect x="15" y="15" width="${w-30}" height="${h-30}" fill="none" stroke="${p.text}" stroke-width="10"/>`;
  if(p.pattern==='blueprint') return `<rect x="30" y="30" width="${w-60}" height="${h-60}" fill="none" stroke="${p.text}" stroke-opacity=".55" stroke-width="2"/><rect x="43" y="43" width="${w-86}" height="${h-86}" fill="none" stroke="${p.text}" stroke-opacity=".18" stroke-width="1"/>`;
  if(p.pattern==='pixel') return `<path d="M24 60V24h36M${w-60} 24h36v36M24 ${h-60}v36h36M${w-60} ${h-24}h36v-36" fill="none" stroke="${p.accent}" stroke-width="10"/>`;
  if(p.pattern==='editorial'||p.pattern==='minimal') return `<line x1="${w*.065}" y1="${h*.055}" x2="${w*.935}" y2="${h*.055}" stroke="${p.text}" stroke-width="2"/><line x1="${w*.065}" y1="${h*.945}" x2="${w*.935}" y2="${h*.945}" stroke="${p.text}" stroke-width="2"/>`;
  if(p.pattern==='scrapbook') return `<rect x="20" y="20" width="${w-40}" height="${h-40}" fill="none" stroke="#8e7256" stroke-opacity=".18" stroke-width="3" stroke-dasharray="11 13"/>`;
  if(p.pattern==='chalk') return `<rect x="24" y="24" width="${w-48}" height="${h-48}" rx="14" fill="none" stroke="${p.text}" stroke-opacity=".22" stroke-width="3" stroke-dasharray="18 12"/>`;
  return '';
}

function renderPosterBackground(w,h,p) {
  const m=Math.min(w,h);
  if(p.pattern==='playful') return `<circle cx="${w*.08}" cy="${h*.10}" r="${m*.09}" fill="#ffcf5d" opacity=".30"/><circle cx="${w*.92}" cy="${h*.12}" r="${m*.11}" fill="#7ad8d2" opacity=".25"/><path d="M0 ${h*.88}Q${w*.18} ${h*.81} ${w*.36} ${h*.89}T${w*.72} ${h*.87}T${w} ${h*.84}V${h}H0Z" fill="${p.accent}" opacity=".07"/>`;
  if(p.pattern==='kawaii') return `<circle cx="${w*.12}" cy="${h*.16}" r="${m*.12}" fill="#ffd8ec"/><circle cx="${w*.88}" cy="${h*.15}" r="${m*.08}" fill="#cdeeff"/><circle cx="${w*.86}" cy="${h*.86}" r="${m*.15}" fill="#e1d7ff"/><path d="M0 ${h*.88}Q${w*.08} ${h*.82} ${w*.16} ${h*.88}T${w*.32} ${h*.88}T${w*.48} ${h*.88}T${w*.64} ${h*.88}T${w*.80} ${h*.88}T${w} ${h*.88}V${h}H0Z" fill="#ffe0a8" opacity=".65"/>`;
  if(p.pattern==='notebook') { let lines=''; for(let y=118;y<h;y+=46) lines+=`<line x1="0" y1="${y}" x2="${w}" y2="${y}" stroke="#9cc7e7" stroke-opacity=".32" stroke-width="2"/>`; return `${lines}<line x1="${Math.round(w*.12)}" y1="0" x2="${Math.round(w*.12)}" y2="${h}" stroke="#ec8f91" stroke-opacity=".52" stroke-width="3"/><circle cx="${w*.055}" cy="${h*.16}" r="8" fill="none" stroke="#b7b0a5" stroke-width="3"/><circle cx="${w*.055}" cy="${h*.31}" r="8" fill="none" stroke="#b7b0a5" stroke-width="3"/>`; }
  if(p.pattern==='scrapbook') return `<path d="M${w*.03} ${h*.14}l${w*.21} -${h*.06}" stroke="#d04e49" stroke-opacity=".20" stroke-width="24"/><path d="M${w*.74} ${h*.84}l${w*.20} ${h*.04}" stroke="#5e8ac6" stroke-opacity=".19" stroke-width="22"/><circle cx="${w*.86}" cy="${h*.13}" r="${m*.07}" fill="#d8b760" opacity=".18"/><path d="M0 ${h*.98}L${w*.08} ${h*.94} ${w*.16} ${h*.99} ${w*.24} ${h*.95} ${w*.32} ${h*.99} ${w*.40} ${h*.96} ${w*.48} ${h*.99} ${w*.56} ${h*.95} ${w*.64} ${h*.99} ${w*.72} ${h*.96} ${w*.80} ${h*.99} ${w*.88} ${h*.95} ${w} ${h*.99}" fill="none" stroke="#8e7256" stroke-opacity=".24" stroke-width="3"/>`;
  if(p.pattern==='comic') { let dots=''; for(let y=44;y<h;y+=34) for(let x=44;x<w;x+=34) if((x+y)%68===0) dots+=`<circle cx="${x}" cy="${y}" r="3" fill="${p.text}" opacity=".08"/>`; return `${dots}<path d="M${w*.86} 0L${w*.72} ${h*.18}L${w} ${h*.10}Z" fill="${p.accent}" opacity=".92"/><path d="M0 ${h*.82}L${w*.15} ${h*.72}L${w*.10} ${h}Z" fill="#2867ff" opacity=".86"/>`; }
  if(p.pattern==='arcade') { let grid=''; for(let i=0;i<=12;i++){const x=w*i/12;grid+=`<line x1="${x}" y1="${h*.55}" x2="${w/2+(x-w/2)*2.1}" y2="${h}" stroke="#7b4cff" stroke-opacity=".18" stroke-width="2"/>`; } for(let i=0;i<8;i++){const y=h*.58+i*i*h*.008;grid+=`<line x1="0" y1="${y}" x2="${w}" y2="${y}" stroke="#00f5ff" stroke-opacity=".16" stroke-width="2"/>`; } return `<circle cx="${w*.18}" cy="${h*.17}" r="${m*.24}" fill="#7b2cff" opacity=".22" filter="url(#soft)"/><circle cx="${w*.83}" cy="${h*.28}" r="${m*.18}" fill="#00f5ff" opacity=".12" filter="url(#soft)"/>${grid}`; }
  if(p.pattern==='blueprint') { let grid=''; for(let x=0;x<w;x+=48) grid+=`<line x1="${x}" y1="0" x2="${x}" y2="${h}" stroke="#dff6ff" stroke-opacity=".08"/>`; for(let y=0;y<h;y+=48) grid+=`<line x1="0" y1="${y}" x2="${w}" y2="${y}" stroke="#dff6ff" stroke-opacity=".08"/>`; return `${grid}<circle cx="${w*.83}" cy="${h*.18}" r="${m*.10}" fill="none" stroke="#dff6ff" stroke-opacity=".16" stroke-width="2"/><path d="M${w*.72} ${h*.18}h${w*.22}M${w*.83} ${h*.08}v${h*.20}" stroke="#dff6ff" stroke-opacity=".13" stroke-width="2"/>`; }
  if(p.pattern==='chalk') { let marks=''; for(let i=0;i<26;i++){const x=(i*193)%w,y=(i*137)%h;marks+=`<path d="M${x} ${y}l${8+(i%4)*4} ${-5+(i%3)*5}" stroke="#fff" stroke-opacity=".045" stroke-width="3" stroke-linecap="round"/>`; } return `${marks}<path d="M${w*.07} ${h*.84}q${w*.12} -${h*.08} ${w*.23} 0t${w*.23} 0t${w*.23} 0" fill="none" stroke="#ffd769" stroke-opacity=".16" stroke-width="5" stroke-dasharray="14 12"/>`; }
  if(p.pattern==='editorial') return `<rect x="0" y="0" width="${w*.20}" height="${h}" fill="#d8d0c3" opacity=".22"/><line x1="${w*.20}" y1="0" x2="${w*.20}" y2="${h}" stroke="${p.text}" stroke-opacity=".12"/><circle cx="${w*.90}" cy="${h*.10}" r="${m*.055}" fill="${p.accent}" opacity=".9"/>`;
  if(p.pattern==='brutal') return `<rect x="${w*.72}" y="${h*.06}" width="${w*.22}" height="${h*.13}" fill="${p.accent}"/><circle cx="${w*.10}" cy="${h*.84}" r="${m*.085}" fill="#006bff"/><path d="M${w*.69} ${h*.78}l${w*.22} ${h*.12}" stroke="${p.text}" stroke-width="24"/>`;
  if(p.pattern==='retro') return `<path d="M-${w*.03} ${h*.22}Q${w*.18} ${h*.08} ${w*.38} ${h*.22}T${w*.78} ${h*.22}T${w*1.08} ${h*.19}" fill="none" stroke="#d95d39" stroke-opacity=".18" stroke-width="44"/><path d="M-${w*.03} ${h*.27}Q${w*.18} ${h*.13} ${w*.38} ${h*.27}T${w*.78} ${h*.27}T${w*1.08} ${h*.24}" fill="none" stroke="#2f7e78" stroke-opacity=".16" stroke-width="28"/><circle cx="${w*.9}" cy="${h*.1}" r="${m*.08}" fill="#d09a2d" opacity=".22"/>`;
  if(p.pattern==='pixel') { let px=''; for(let i=0;i<26;i++){const x=((i*73)%20)*w/20,y=((i*47)%24)*h/24;px+=`<rect x="${x}" y="${y}" width="${Math.max(8,w*.008)}" height="${Math.max(8,w*.008)}" fill="${i%2?p.accent:'#5eead4'}" opacity=".14"/>`; } return `${px}<path d="M0 ${h*.78}h${w*.12}v-${h*.05}h${w*.09}v${h*.09}h${w*.14}v-${h*.04}h${w*.12}v${h*.08}h${w*.15}v-${h*.06}h${w*.18}v${h*.09}H0Z" fill="#5eead4" opacity=".08"/>`; }
  if(p.pattern==='glass') return `<circle cx="${w*.15}" cy="${h*.2}" r="${m*.28}" fill="#75b9ff" opacity=".24" filter="url(#soft)"/><circle cx="${w*.88}" cy="${h*.78}" r="${m*.30}" fill="#9b7cf6" opacity=".22" filter="url(#soft)"/><circle cx="${w*.72}" cy="${h*.14}" r="${m*.12}" fill="#7ef0d1" opacity=".18" filter="url(#soft)"/>`;
  if(p.pattern==='forest') return `<path d="M0 ${h*.82}Q${w*.18} ${h*.75} ${w*.34} ${h*.86}T${w*.70} ${h*.84}T${w} ${h*.80}V${h}H0Z" fill="#3d8a5e" opacity=".09"/><g fill="none" stroke="#3d8a5e" stroke-opacity=".18" stroke-width="4"><path d="M${w*.08} ${h*.20}q${w*.03} -${h*.09} ${w*.09} -${h*.11}q-${w*.01} ${h*.08}-${w*.09} ${h*.11}Z"/><path d="M${w*.90} ${h*.18}q-${w*.03} -${h*.08}-${w*.09} -${h*.10}q${w*.01} ${h*.08} ${w*.09} ${h*.10}Z"/></g>`;
  if(p.pattern==='minimal') return `<line x1="${w*.08}" y1="${h*.14}" x2="${w*.92}" y2="${h*.14}" stroke="${p.text}" stroke-width="1" opacity=".16"/><rect x="${w*.07}" y="${h*.78}" width="${w*.02}" height="${h*.11}" fill="${p.accent}"/>`;
  if(p.pattern==='night') { let stars=''; for(let i=0;i<44;i++){ const x=(i*137)%w,y=(i*223)%h,r=(i%3)+1; stars+=`<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" opacity="${.16+(i%4)*.08}"/>`; } return `${stars}<path d="M${w*.82} ${h*.13}a${m*.065} ${m*.065} 0 1 0 ${m*.07} ${m*.10}a${m*.055} ${m*.055} 0 1 1-${m*.07}-${m*.10}Z" fill="#ffd36a" opacity=".18"/>`; }
  return '';
}

function renderHeader(w,h,p,{compact=false}={}) {
  const font=posterFont(p), titleFont=posterTitleFont(p); const title=escapeXml(state.document.title), subText=escapeXml(state.document.subtitle), day=DAY_NAME[state.ui.selectedDay];
  const fs=clamp(w*.052,42,74), sub=clamp(w*.018,17,26); const y=compact?70:Math.max(78,h*.065);
  if(p.header==='left') return `<g font-family="${font}"><text x="${w*.16}" y="${y}" font-family="${titleFont}" font-size="${fs*.88}" font-weight="800" fill="${p.text}">${title}</text><text x="${w*.16}" y="${y+sub*1.65}" font-size="${sub}" fill="${p.muted}">${subText}</text><path d="M${w*.16} ${y+sub*2.45}h${w*.28}" stroke="${p.accent}" stroke-width="5" stroke-linecap="round"/><text x="${w*.46}" y="${y+sub*2.58}" font-size="14" font-weight="800" fill="${p.accent}">${day}</text></g>`;
  if(p.header==='scrap') return `<g transform="translate(${w*.50} ${y}) rotate(-1.5) translate(${-w*.34} -${fs*.72})" font-family="${font}">${cardShell(0,0,w*.68,fs*1.55,p,p.accent)}<text x="${w*.34}" y="${fs*.72}" text-anchor="middle" font-family="${titleFont}" font-size="${fs*.78}" font-weight="800" fill="${p.text}">${title}</text><text x="${w*.34}" y="${fs*1.16}" text-anchor="middle" font-size="${sub*.88}" fill="${p.muted}">${subText}</text></g><text x="${w*.84}" y="${y+sub*1.8}" font-family="${font}" font-size="14" font-weight="800" fill="${p.accent}" transform="rotate(5 ${w*.84} ${y+sub*1.8})">${day}</text>`;
  if(p.header==='comic') return `<g font-family="${font}"><path d="M${w*.09} ${y-fs*.74}H${w*.91}V${y+fs*.28}H${w*.61}l-${w*.035} ${fs*.34}l-${w*.02}-${fs*.34}H${w*.09}Z" fill="${p.surface}" stroke="${p.text}" stroke-width="5" filter="url(#hardShadow)"/><text x="${w*.50}" y="${y}" text-anchor="middle" font-family="${titleFont}" font-size="${fs*.74}" font-weight="900" fill="${p.text}">${title}</text><text x="${w*.50}" y="${y+sub*1.55}" text-anchor="middle" font-size="${sub*.84}" font-weight="800" fill="${p.text}">${subText}</text><circle cx="${w*.86}" cy="${y+sub*1.45}" r="24" fill="${p.accent}" stroke="${p.text}" stroke-width="4"/><text x="${w*.86}" y="${y+sub*1.65}" text-anchor="middle" font-size="12" font-weight="900" fill="#fff">${day}</text></g>`;
  if(p.header==='brutal') return `<g font-family="${font}"><rect x="${w*.07}" y="${y-fs*.73}" width="${w*.70}" height="${fs*1.02}" fill="${p.text}"/><text x="${w*.09}" y="${y}" font-family="${titleFont}" font-size="${fs*.74}" font-weight="900" fill="${p.bg}">${title}</text><rect x="${w*.77}" y="${y-fs*.73}" width="${w*.16}" height="${fs*1.02}" fill="${p.accent}" stroke="${p.text}" stroke-width="5"/><text x="${w*.85}" y="${y-fs*.05}" text-anchor="middle" font-size="16" font-weight="900" fill="#fff">${day}</text><text x="${w*.08}" y="${y+sub*1.5}" font-size="${sub*.85}" font-weight="800" fill="${p.text}">${subText}</text></g>`;
  if(p.header==='technical') return `<g font-family="${font}"><text x="${w*.075}" y="${y-fs*.12}" font-family="${titleFont}" font-size="${fs*.68}" font-weight="800" fill="${p.text}">${title}</text><line x1="${w*.075}" y1="${y+10}" x2="${w*.925}" y2="${y+10}" stroke="${p.text}" stroke-opacity=".55" stroke-width="2"/><text x="${w*.075}" y="${y+sub*1.75}" font-size="${sub*.75}" fill="${p.muted}">${subText}</text><text x="${w*.925}" y="${y+sub*1.75}" text-anchor="end" font-size="${sub*.72}" font-weight="800" fill="${p.accent}">DAY / ${day}</text></g>`;
  if(p.header==='editorial'||p.header==='swiss') return `<g font-family="${font}"><text x="${w*.25}" y="${y}" font-family="${titleFont}" font-size="${fs*.82}" font-weight="${p.header==='swiss'?800:700}" fill="${p.text}">${title}</text><text x="${w*.25}" y="${y+sub*1.65}" font-size="${sub*.82}" fill="${p.muted}">${subText}</text><line x1="${w*.25}" y1="${y+sub*2.28}" x2="${w*.91}" y2="${y+sub*2.28}" stroke="${p.text}" stroke-width="2"/><text x="${w*.91}" y="${y+sub*2.05}" text-anchor="end" font-size="15" font-weight="800" fill="${p.accent}">${day}</text></g>`;
  if(p.header==='neon'||p.header==='pixel') return `<g font-family="${font}" text-anchor="middle" filter="${p.header==='neon'?'url(#glow)':''}"><text x="${w/2}" y="${y}" font-family="${titleFont}" font-size="${fs*.80}" font-weight="900" fill="${p.text}" letter-spacing="${p.header==='pixel'?2:1}">${title}</text><text x="${w/2}" y="${y+sub*1.6}" font-size="${sub*.82}" font-weight="700" fill="${p.muted}">${subText}</text><rect x="${w/2-44}" y="${y+sub*2.05}" width="88" height="32" rx="${p.header==='pixel'?0:16}" fill="none" stroke="${p.accent}" stroke-width="2"/><text x="${w/2}" y="${y+sub*2.05+22}" font-size="13" font-weight="900" fill="${p.accent}">${day}</text></g>`;
  if(p.header==='chalk') return `<g font-family="${font}" text-anchor="middle"><text x="${w/2}" y="${y}" font-family="${titleFont}" font-size="${fs*.82}" font-weight="800" fill="${p.text}" transform="rotate(-1 ${w/2} ${y})">${title}</text><path d="M${w*.30} ${y+15}q${w*.20} 18 ${w*.40} 0" fill="none" stroke="${p.accent}" stroke-width="4" stroke-linecap="round" stroke-dasharray="12 8"/><text x="${w/2}" y="${y+sub*2.0}" font-size="${sub*.86}" fill="${p.muted}">${subText} · ${day}</text></g>`;
  if(p.header==='retro') return `<g font-family="${font}" text-anchor="middle"><text x="${w/2+5}" y="${y+5}" font-family="${titleFont}" font-size="${fs*.82}" font-weight="800" fill="#fff2c6" opacity=".7">${title}</text><text x="${w/2}" y="${y}" font-family="${titleFont}" font-size="${fs*.82}" font-weight="800" fill="${p.text}">${title}</text><text x="${w/2}" y="${y+sub*1.72}" font-size="${sub*.88}" font-weight="700" fill="${p.muted}">${subText}</text><path d="M${w*.42} ${y+sub*2.25}h${w*.16}" stroke="${p.accent}" stroke-width="8" stroke-linecap="round"/><text x="${w/2}" y="${y+sub*3.0}" font-size="14" font-weight="900" fill="${p.text}">${day}</text></g>`;
  if(p.header==='botanical'||p.header==='night') return `<g font-family="${font}" text-anchor="middle"><text x="${w/2}" y="${y}" font-family="${titleFont}" font-size="${fs*.84}" font-weight="700" fill="${p.text}">${title}</text><text x="${w/2}" y="${y+sub*1.7}" font-size="${sub*.86}" fill="${p.muted}">${subText}</text><path d="M${w*.41} ${y+sub*2.30}q${w*.09} -12 ${w*.18} 0" fill="none" stroke="${p.accent}" stroke-width="3" stroke-linecap="round"/><text x="${w/2}" y="${y+sub*3.0}" font-size="14" font-weight="800" fill="${p.accent}">${day}</text></g>`;
  const bubble=p.header==='bubble';
  return `<g font-family="${font}" text-anchor="middle"><text x="${w/2}" y="${y}" font-family="${titleFont}" font-size="${fs}" font-weight="850" fill="${p.text}" letter-spacing="-1.5">${title}</text><text x="${w/2}" y="${y+sub*1.7}" font-size="${sub}" font-weight="560" fill="${p.muted}">${subText}</text><g transform="translate(${w/2-44} ${y+sub*2.5})"><rect width="88" height="34" rx="${bubble?17:10}" fill="${p.accent}" opacity="${bubble?.18:.12}"/><text x="44" y="23" font-size="15" font-weight="800" fill="${p.accent}">${day}</text></g></g>`;
}

function readableOn(hex) {
  const m=/^#([0-9a-f]{6})$/i.exec(hex || '');
  if(!m) return '#ffffff';
  const n=parseInt(m[1],16), r=(n>>16)&255, g=(n>>8)&255, b=n&255;
  const lum=(.2126*r+.7152*g+.0722*b)/255;
  return lum>.62 ? '#18202b' : '#ffffff';
}

function getClockLegendPlacement(w,h,p,schedules) {
  const d=state.design;
  if(!d.showLegend) return {position:'none',opt:null};
  const ratio=w/h;
  const position=d.legendPosition==='auto' ? (ratio>=1.34?'right':'bottom') : d.legendPosition;
  const margin=clamp(Math.min(w,h)*.05,42,82);
  const headerBottom=Math.max(190,h*.145);
  const rowH=['comic','brutal','pixel'].includes(p.pattern)?62:56;
  if(position==='right') {
    const width=clamp(w*.32,285,520);
    const x=w-margin-width;
    const y=headerBottom+18;
    const maxRows=clamp(Math.floor((h-y-margin)/rowH),4,12);
    return {position,opt:{x,y,width,maxRows},circleBounds:{left:margin,right:x-margin*.55,top:headerBottom,bottom:h-margin}};
  }
  const width=w-margin*2;
  const cols=width>w*.6?2:1;
  const maxItems=clamp(h/w>1.25?10:8,4,12);
  const shown=Math.min(schedules.length,maxItems);
  const rows=Math.max(1,Math.ceil(shown/cols));
  const extra=schedules.length>shown?22:0;
  const legendHeight=rows*rowH+extra;
  const y=h-margin-legendHeight;
  return {position:'bottom',opt:{x:margin,y,width,maxRows:maxItems},circleBounds:{left:margin,right:w-margin,top:headerBottom,bottom:y-margin*.45}};
}

function polarPoint(cx,cy,r,deg) {
  const a=deg*Math.PI/180;
  return {x:cx+Math.cos(a)*r,y:cy+Math.sin(a)*r};
}

function annularSectorPath(cx,cy,outerR,innerR,startDeg,endDeg) {
  let sweep=endDeg-startDeg;
  if(sweep<=0) return '';
  if(sweep>=359.999) return fullAnnulusPath(cx,cy,outerR,innerR);
  const large=sweep>180?1:0;
  const os=polarPoint(cx,cy,outerR,startDeg), oe=polarPoint(cx,cy,outerR,endDeg);
  const ie=polarPoint(cx,cy,innerR,endDeg), is=polarPoint(cx,cy,innerR,startDeg);
  return `M ${os.x} ${os.y} A ${outerR} ${outerR} 0 ${large} 1 ${oe.x} ${oe.y} L ${ie.x} ${ie.y} A ${innerR} ${innerR} 0 ${large} 0 ${is.x} ${is.y} Z`;
}

function fullAnnulusPath(cx,cy,outerR,innerR) {
  return `M ${cx-outerR} ${cy} A ${outerR} ${outerR} 0 1 0 ${cx+outerR} ${cy} A ${outerR} ${outerR} 0 1 0 ${cx-outerR} ${cy} Z M ${cx-innerR} ${cy} A ${innerR} ${innerR} 0 1 1 ${cx+innerR} ${cy} A ${innerR} ${innerR} 0 1 1 ${cx-innerR} ${cy} Z`;
}

function clockSegmentGeometry(s,gapDeg=0) {
  const startMin=timeToMin(s.start), dur=durationMin(s.start,s.end);
  const start=startMin/1440*360-90;
  const sweep=dur/1440*360;
  const safeGap=Math.min(Math.max(0,gapDeg),Math.max(0,sweep*.38));
  return {dur,start,end:start+sweep,drawStart:start+safeGap/2,drawEnd:start+sweep-safeGap/2,sweep};
}

function renderClockLabels(cx,cy,outerR,holeR,p,schedules,w,h) {
  const d=state.design;
  if(!d.clockShowLabels) return '';
  const band=outerR-holeR;
  const labelRadius=holeR+band*.52;
  const canvasScale=Math.min(w,h)/1200;
  const requested=clamp(d.clockLabelSize*canvasScale,10,26);
  let defs='', out='';
  schedules.forEach((s,i)=>{
    const geo=clockSegmentGeometry(s,d.clockGap);
    if(s.hideClockLabel || geo.dur<d.clockLabelMinMinutes) return;
    const mid=(geo.start+geo.end)/2;
    const a=mid*Math.PI/180;
    const x=cx+Math.cos(a)*labelRadius, y=cy+Math.sin(a)*labelRadius;
    const availableArc=Math.max(0,labelRadius*(geo.drawEnd-geo.drawStart)*Math.PI/180);
    const rawTitle=String(s.title||'');
    const lines=d.clockLabelContent==='titleTime'?2:1;
    const radialFit=band/(lines===2?2.55:1.55);
    const titleFit=availableArc/Math.max(3,Math.min(rawTitle.length,18)*.72);
    const font=Math.min(requested,radialFit,titleFit);
    if(font<9.5 || availableArc<28 || band<24) return;
    const maxChars=Math.max(3,Math.min(22,Math.floor(availableArc/Math.max(6.5,font*.72))));
    const title=escapeXml(truncate(s.title,maxChars));
    const c=scheduleColor(s,i,p), textColor=readableOn(c);
    let rot=0;
    if(d.clockLabelOrientation==='auto') {
      rot=mid+90;
      const nr=((rot%360)+360)%360;
      if(nr>90 && nr<270) rot+=180;
    }
    const clipId=`clockLabelClip${i}`;
    const clipPath=annularSectorPath(cx,cy,Math.max(holeR+2,outerR-4),Math.min(outerR-2,holeR+4),geo.drawStart,geo.drawEnd);
    defs+=`<clipPath id="${clipId}"><path d="${clipPath}" fill-rule="evenodd"/></clipPath>`;
    let body='';
    if(d.clockLabelContent==='iconTitle' && band>=font*2.4) {
      const icon=getIcon(s.icon,state.customIcons);
      const iconSize=Math.min(font*1.05,20*canvasScale+4);
      body=`<svg x="${-iconSize/2}" y="${-font*1.45}" width="${iconSize}" height="${iconSize}" viewBox="${escapeXml(icon.viewBox||'0 0 24 24')}" fill="none" stroke="${textColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${icon.body}</svg><text y="${font*.68}" text-anchor="middle" font-size="${font}" font-weight="850" fill="${textColor}">${title}</text>`;
    } else if(d.clockLabelContent==='titleTime' && band>=font*2.25 && availableArc>font*4.7) {
      body=`<text y="${-font*.15}" text-anchor="middle" font-size="${font}" font-weight="850" fill="${textColor}">${title}</text><text y="${font*.92}" text-anchor="middle" font-size="${Math.max(8.5,font*.64)}" font-weight="750" fill="${textColor}" opacity=".92">${s.start}–${s.end}</text>`;
    } else {
      body=`<text y="${font*.34}" text-anchor="middle" font-size="${font}" font-weight="850" fill="${textColor}">${title}</text>`;
    }
    out+=`<g clip-path="url(#${clipId})"><g transform="translate(${x} ${y}) rotate(${rot})" font-family="${posterFont(p)}" pointer-events="none">${body}</g></g>`;
  });
  return defs||out ? `<defs>${defs}</defs>${out}` : '';
}

function renderClockLayout(w,h,p,schedules) {
  const header=renderHeader(w,h,p);
  const d=state.design;
  const placement=getClockLegendPlacement(w,h,p,schedules);
  const margin=clamp(Math.min(w,h)*.045,36,72);
  const headerBottom=Math.max(190,h*.145);
  const bounds=placement.circleBounds || {left:margin,right:w-margin,top:headerBottom,bottom:h-margin};
  const bw=Math.max(180,bounds.right-bounds.left), bh=Math.max(180,bounds.bottom-bounds.top);
  const tickPad=d.showHours?clamp(Math.min(w,h)*.045,38,62):18;
  const maxOuter=Math.max(86,Math.min(bw/2,bh/2)-tickPad);
  const outerR=Math.max(72,Math.min(maxOuter*d.clockScale/100,maxOuter+tickPad*.35));
  // Geometry rule: changing the inner circle NEVER changes the outer radius or schedule angles.
  const holeR=clamp(outerR*d.clockHole/100,outerR*.24,outerR*.80);
  const band=outerR-holeR;
  let cx=(bounds.left+bounds.right)/2;
  const tallBottomLayout=(h/w>1.35 && placement.position==='bottom');
  const autoCy=tallBottomLayout ? bounds.top+outerR+tickPad*.55+Math.min(54,h*.025) : (bounds.top+bounds.bottom)/2;
  let cy=autoCy+(bounds.bottom-bounds.top)*(d.clockOffsetY/100);
  const minCy=bounds.top+outerR+tickPad*.45, maxCy=bounds.bottom-outerR-tickPad*.45;
  if(minCy<=maxCy) cy=clamp(cy,minCy,maxCy); else cy=(bounds.top+bounds.bottom)/2;

  const filter=(p.shadow==='glow')?' filter="url(#glow)"':'';
  const thin=['editorial','minimal','blueprint'].includes(p.pattern);
  let ring='';
  if(d.clockShowTrack) ring+=`<path d="${fullAnnulusPath(cx,cy,outerR,holeR)}" fill="${p.line}" fill-opacity="${thin?.40:.28}" fill-rule="evenodd"/>`;
  schedules.forEach((s,i)=>{
    const geo=clockSegmentGeometry(s,d.clockGap);
    if(geo.drawEnd<=geo.drawStart) return;
    const c=scheduleColor(s,i,p);
    ring+=`<path d="${annularSectorPath(cx,cy,outerR,holeR,geo.drawStart,geo.drawEnd)}" fill="${c}" fill-rule="evenodd"${filter}/>`;
  });
  if(['comic','brutal','pixel'].includes(p.pattern)) ring+=`<circle cx="${cx}" cy="${cy}" r="${outerR}" fill="none" stroke="${p.text}" stroke-width="${p.pattern==='pixel'?5:7}"/><circle cx="${cx}" cy="${cy}" r="${holeR}" fill="none" stroke="${p.text}" stroke-width="${p.pattern==='pixel'?5:7}"/>`;

  let ticks='';
  if(d.showHours){
    for(let hour=0;hour<24;hour++){
      const a=(hour/24*360-90)*Math.PI/180, major=hour%3===0;
      const r1=outerR+(major?10:7), r2=r1+(major?18:9);
      const x1=cx+Math.cos(a)*r1,y1=cy+Math.sin(a)*r1,x2=cx+Math.cos(a)*r2,y2=cy+Math.sin(a)*r2;
      ticks+=`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${p.text}" stroke-opacity="${major?.44:.20}" stroke-width="${major?3:2}"/>`;
      if(major && hour!==0){ const lr=r2+clamp(Math.min(w,h)*.018,18,28); ticks+=`<text x="${cx+Math.cos(a)*lr}" y="${cy+Math.sin(a)*lr+5}" text-anchor="middle" font-family="${posterFont(p)}" font-size="${clamp(Math.min(w,h)*.013,12,17)}" font-weight="700" fill="${p.muted}">${String(hour).padStart(2,'0')}</text>`; }
    }
  }

  const planned=schedules.reduce((sum,s)=>sum+durationMin(s.start,s.end),0);
  const centerFill=(p.pattern==='blueprint'||p.pattern==='chalk')?'transparent':p.surface;
  const centerFilter=['editorial','minimal','blueprint','chalk'].includes(p.pattern)?'':posterFilter(p);
  const centerRadius=Math.max(26,holeR-8);
  let centerShape=`<circle cx="${cx}" cy="${cy}" r="${centerRadius}" fill="${centerFill}" ${centerFilter?`filter="${centerFilter}"`:''} stroke="${['comic','brutal','pixel'].includes(p.pattern)?p.text:p.line}" stroke-opacity="${['comic','brutal','pixel'].includes(p.pattern)?1:.32}" stroke-width="${['comic','brutal','pixel'].includes(p.pattern)?4:1}"/>`;
  if(p.pattern==='brutal') centerShape=`<rect x="${cx-centerRadius*.69}" y="${cy-centerRadius*.45}" width="${centerRadius*1.38}" height="${centerRadius*.90}" fill="${p.surface}" stroke="${p.text}" stroke-width="5" filter="url(#hardShadow)"/>`;
  if(p.pattern==='pixel') centerShape=`<rect x="${cx-centerRadius*.70}" y="${cy-centerRadius*.47}" width="${centerRadius*1.40}" height="${centerRadius*.94}" fill="${p.surface}" stroke="${p.accent}" stroke-width="5"/>`;
  const minDim=Math.min(w,h);
  const centerTitleBase=clamp(minDim*.030,24,38), centerSubBase=clamp(minDim*.014,12,18);
  const centerTitleSize=Math.min(centerTitleBase,Math.max(14,holeR*.26));
  const centerSubSize=Math.min(centerSubBase,Math.max(9,holeR*.11));
  let centerText='';
  if(d.clockCenterMode==='summary') centerText=`<text x="${cx}" y="${cy-10}" font-family="${posterTitleFont(p)}" font-size="${centerTitleSize}" font-weight="850" fill="${p.text}">${DAY_NAME[state.ui.selectedDay]}</text><text x="${cx}" y="${cy+28}" font-size="${centerSubSize}" font-weight="650" fill="${p.muted}">계획 ${escapeXml(durationText(planned))}</text>`;
  else if(d.clockCenterMode==='count') centerText=`<text x="${cx}" y="${cy-10}" font-family="${posterTitleFont(p)}" font-size="${centerTitleSize}" font-weight="850" fill="${p.text}">${DAY_NAME[state.ui.selectedDay]}</text><text x="${cx}" y="${cy+28}" font-size="${centerSubSize}" font-weight="650" fill="${p.muted}">일정 ${schedules.length}개</text>`;
  const center=`<g font-family="${posterFont(p)}" text-anchor="middle">${centerShape}${centerText}</g>`;
  const labels=renderClockLabels(cx,cy,outerR,holeR,p,schedules,w,h);
  const legend=placement.opt?renderLegend(w,h,p,schedules,placement.opt):'';
  return `${header}<g font-family="${posterFont(p)}">${ring}${ticks}${labels}${center}${legend}</g>`;
}

function renderLegend(w,h,p,schedules,opt) {
  const items=schedules.slice(0,opt.maxRows); const cols=opt.width>w*.6?2:1, colW=opt.width/cols; const rowH=['comic','brutal','pixel'].includes(p.pattern)?62:56; let out='';
  items.forEach((s,i)=>{ const col=i%cols,row=Math.floor(i/cols),x=opt.x+col*colW,y=opt.y+row*rowH,c=scheduleColor(s,i,p),icon=getIcon(s.icon,state.customIcons),cw=colW-14,ch=rowH-10; out+=`<g font-family="${posterFont(p)}">${cardShell(x,y,cw,ch,p,c)}<circle cx="${x+25}" cy="${y+ch/2}" r="${p.card==='brutal'||p.card==='comic'||p.card==='pixel'?15:14}" fill="${c}" opacity="${(p.card==='brutal'||p.card==='comic') ? .95 : .16}"/>`; if(p.card==='brutal'||p.card==='comic') out+=`<svg x="${x+14}" y="${y+ch/2-11}" width="22" height="22" viewBox="${escapeXml(icon.viewBox||'0 0 24 24')}" fill="none" stroke="#fff" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">${icon.body}</svg>`; else out+=`<svg x="${x+14}" y="${y+ch/2-11}" width="22" height="22" viewBox="${escapeXml(icon.viewBox||'0 0 24 24')}" fill="none" stroke="${c}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${icon.body}</svg>`; out+=`<text x="${x+49}" y="${y+ch/2-2}" font-size="14" font-weight="800" fill="${p.text}">${escapeXml(truncate(s.title,16))}</text><text x="${x+49}" y="${y+ch/2+15}" font-size="11" font-weight="650" fill="${p.muted}">${s.start}–${s.end}</text></g>`; });
  if(schedules.length>items.length){ const rows=Math.ceil(items.length/cols); out+=`<text x="${opt.x}" y="${opt.y+rows*rowH+18}" font-family="${posterFont(p)}" font-size="12" font-weight="700" fill="${p.muted}">+ ${schedules.length-items.length}개 일정 더 있음</text>`; }
  return out;
}

function renderTimelineLayout(w,h,p,schedules) {
  const header=renderHeader(w,h,p); const top=Math.max(210,h*.18), bottom=70, avail=h-top-bottom, count=Math.max(1,schedules.length), rowH=clamp(avail/count,60,122), axisX=Math.max(100,w*.14); let out=`<line x1="${axisX}" y1="${top}" x2="${axisX}" y2="${Math.min(h-bottom,top+rowH*count)}" stroke="${p.pattern==='brutal'||p.pattern==='comic'?p.text:p.line}" stroke-width="${p.pattern==='brutal'?8:5}" stroke-linecap="${p.pattern==='pixel'?'square':'round'}"/>`;
  if(!schedules.length) return `${header}${renderEmptyPoster(w,h,p,'일정을 추가하면 타임라인이 만들어져요')}`;
  schedules.forEach((s,i)=>{ const y=top+i*rowH, icon=getIcon(s.icon,state.customIcons), c=scheduleColor(s,i,p), cardX=axisX+44, cardW=w-cardX-w*.075, cardH=rowH-12; out+=`<g font-family="${posterFont(p)}"><circle cx="${axisX}" cy="${y+cardH/2}" r="${p.pattern==='brutal'?12:9}" fill="${c}" stroke="${p.pattern==='brutal'||p.pattern==='comic'?p.text:'none'}" stroke-width="3"/><text x="${axisX-20}" y="${y+cardH/2-3}" text-anchor="end" font-size="${clamp(w*.014,14,20)}" font-weight="850" fill="${p.text}">${s.start}</text><text x="${axisX-20}" y="${y+cardH/2+16}" text-anchor="end" font-size="${clamp(w*.009,10,14)}" font-weight="650" fill="${p.muted}">${s.end}</text>${cardShell(cardX,y,cardW,cardH,p,c)}<circle cx="${cardX+43}" cy="${y+cardH/2}" r="24" fill="${c}" opacity="${(p.card==='brutal'||p.card==='comic') ? .95 : .14}"/><svg x="${cardX+29}" y="${y+cardH/2-14}" width="28" height="28" viewBox="${escapeXml(icon.viewBox||'0 0 24 24')}" fill="none" stroke="${p.card==='brutal'||p.card==='comic'?'#fff':c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${icon.body}</svg><text x="${cardX+80}" y="${y+cardH/2+(state.design.showDetails?-5:7)}" font-family="${posterTitleFont(p)}" font-size="${clamp(w*.018,18,28)}" font-weight="850" fill="${p.text}">${escapeXml(truncate(s.title,30))}</text>${state.design.showDetails&&s.detail?`<text x="${cardX+80}" y="${y+cardH/2+22}" font-size="${clamp(w*.011,11,16)}" font-weight="560" fill="${p.muted}">${escapeXml(truncate(s.detail,48))}</text>`:''}</g>`; });
  return `${header}${out}`;
}

function renderCardsLayout(w,h,p,schedules) {
  const header=renderHeader(w,h,p); const top=Math.max(220,h*.19), pad=(p.pattern==='editorial'||p.pattern==='minimal')?w*.08:w*.07, gap=Math.max(18,w*.018), cols=w/h>1.35?3:2, cardW=(w-pad*2-gap*(cols-1))/cols, rows=Math.ceil(Math.max(1,schedules.length)/cols), avail=h-top-60, cardH=clamp((avail-gap*Math.max(0,rows-1))/Math.max(1,rows),105,230);
  if(!schedules.length) return `${header}${renderEmptyPoster(w,h,p,'일정을 추가하면 카드가 차곡차곡 생겨요')}`;
  let out=''; schedules.forEach((s,i)=>{ const col=i%cols,row=Math.floor(i/cols),x=pad+col*(cardW+gap),y=top+row*(cardH+gap); if(y+cardH>h-30)return; const icon=getIcon(s.icon,state.customIcons), c=scheduleColor(s,i,p); out+=`<g font-family="${posterFont(p)}">${cardShell(x,y,cardW,cardH,p,c)}<circle cx="${x+45}" cy="${y+60}" r="25" fill="${c}" opacity="${(p.card==='brutal'||p.card==='comic') ? .95 : .15}"/><svg x="${x+31}" y="${y+46}" width="28" height="28" viewBox="${escapeXml(icon.viewBox||'0 0 24 24')}" fill="none" stroke="${p.card==='brutal'||p.card==='comic'?'#fff':c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${icon.body}</svg><text x="${x+80}" y="${y+58}" font-family="${posterTitleFont(p)}" font-size="${clamp(w*.014,16,23)}" font-weight="850" fill="${p.text}">${escapeXml(truncate(s.title,20))}</text><text x="${x+80}" y="${y+80}" font-size="${clamp(w*.009,10,14)}" font-weight="700" fill="${p.muted}">${s.start} – ${s.end}</text>${state.design.showDetails&&s.detail?`<text x="${x+22}" y="${y+cardH-25}" font-size="${clamp(w*.009,10,14)}" font-weight="560" fill="${p.muted}">${escapeXml(truncate(s.detail,34))}</text>`:''}</g>`; });
  return `${header}${out}`;
}
function renderEmptyPoster(w,h,p,msg) { return `<g font-family="${posterFont(p)}" text-anchor="middle"><circle cx="${w/2}" cy="${h*.5}" r="72" fill="${p.accent}" opacity=".12"/><text x="${w/2}" y="${h*.5+8}" font-size="54" fill="${p.accent}">+</text><text x="${w/2}" y="${h*.5+115}" font-size="22" font-weight="750" fill="${p.muted}">${escapeXml(msg)}</text></g>`; }
function truncate(s,n){ s=String(s||''); return s.length>n?s.slice(0,n-1)+'…':s; }

function renderSticker(st,w,h,editor=false) {
  const icon=getIcon(st.icon,state.customIcons); if(!icon)return '';
  const s=stickerRenderSize(st,w,h), selected=editor && st.id===selectedStickerId;
  const controls=selected?`<g class="sticker-controls"><rect class="sticker-selection" x="-12" y="-12" width="${s+24}" height="${s+24}" rx="14" fill="none" vector-effect="non-scaling-stroke"/><line class="sticker-rotate-line" x1="${s/2}" y1="-12" x2="${s/2}" y2="-48" vector-effect="non-scaling-stroke"/><circle data-sticker-handle="rotate" class="sticker-handle-hit" cx="${s/2}" cy="-50" r="24" fill="transparent"/><circle class="sticker-handle-visible rotate" cx="${s/2}" cy="-50" r="10" vector-effect="non-scaling-stroke"/><circle data-sticker-handle="resize" class="sticker-handle-hit" cx="${s+12}" cy="${s+12}" r="26" fill="transparent"/><circle class="sticker-handle-visible resize" cx="${s+12}" cy="${s+12}" r="11" vector-effect="non-scaling-stroke"/><path class="sticker-resize-glyph" d="M${s+7} ${s+12}h10M${s+12} ${s+7}v10" vector-effect="non-scaling-stroke"/></g>`:'';
  return `<g data-sticker-id="${escapeXml(st.id)}" transform="${stickerTransform(st,w,h,s)}"><rect class="sticker-hit" x="-10" y="-10" width="${s+20}" height="${s+20}" rx="18" fill="transparent" stroke="transparent"/><svg x="0" y="0" width="${s}" height="${s}" viewBox="${escapeXml(icon.viewBox||'0 0 24 24')}" fill="none" color="${st.color}" stroke="${st.color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${icon.body}</svg>${controls}</g>`;
}

function fitPreview() {
  const stage=refs.previewStage; if(!stage)return;
  const width=Math.max(240, stage.clientWidth-(window.innerWidth<=760?24:80));
  fitWidth=Math.min(width, window.innerWidth<=760?640:860); currentZoom=1; applyZoom();
}
function setZoom(z) { currentZoom=clamp(z,.45,1.8); applyZoom(); }
function applyZoom() { refs.previewCanvas.style.width=`${Math.round(fitWidth*currentZoom)}px`; refs.zoomLabel.textContent=currentZoom===1?'맞춤':`${Math.round(currentZoom*100)}%`; }

function exportJson() { downloadBlob(new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),`${sanitizeFilename(state.document.title)}.daycraft.json`); toast('프로젝트 백업 파일을 저장했습니다.'); }
async function importJson(e) { const file=e.target.files?.[0]; e.target.value=''; if(!file)return; try{ const obj=JSON.parse(await file.text()); const next=normalizeState(obj); historyPast.push(JSON.stringify(state)); state=next; historyFuture=[]; selectedStickerId=null; renderAll(); schedulePersist(); toast('프로젝트를 복원했습니다.'); }catch{toast('올바른 DayCraft JSON 파일이 아닙니다.',true);} }

function csvEscape(v){ const s=String(v??''); return /[",\n]/.test(s)?`"${s.replace(/"/g,'""')}"`:s; }
function exportCsv() {
  const rows=[['요일','시작시간','종료시간','제목','내용','색상','아이콘','원형라벨숨김'],...state.schedules.map(s=>[s.days.map(d=>DAY_NAME[d]).join('/'),s.start,s.end,s.title,s.detail,s.color,s.icon,s.hideClockLabel?'예':'아니오'])];
  const csv='\ufeff'+rows.map(r=>r.map(csvEscape).join(',')).join('\r\n'); downloadBlob(new Blob([csv],{type:'text/csv;charset=utf-8'}),`${sanitizeFilename(state.document.title)}.csv`); toast('CSV를 저장했습니다.');
}
async function importCsv(e) {
  const file=e.target.files?.[0]; e.target.value=''; if(!file)return;
  try { const rows=parseCsv(await file.text()); if(rows.length<2)throw new Error(); const head=rows[0]; const idx=n=>head.indexOf(n); const mapDay={'매일':'all','공통':'all','월':'mon','화':'tue','수':'wed','목':'thu','금':'fri','토':'sat','일':'sun','월요일':'mon','화요일':'tue','수요일':'wed','목요일':'thu','금요일':'fri','토요일':'sat','일요일':'sun'};
    const imported=rows.slice(1).filter(r=>r.some(Boolean)).map(r=>({id:uid('s'),days:String(r[idx('요일')]||'매일').split(/[\/·, ]+/).map(x=>mapDay[x]).filter(Boolean),start:r[idx('시작시간')]||'09:00',end:r[idx('종료시간')]||'10:00',title:r[idx('제목')]||'일정',detail:r[idx('내용')]||'',color:safeColor(r[idx('색상')],'#5b9df9'),icon:r[idx('아이콘')]||inferIcon(r[idx('제목')]||''),hideClockLabel:/^(예|yes|true|1)$/i.test(String(r[idx('원형라벨숨김')]||''))}));
    if(!imported.length)throw new Error(); mutate(s=>s.schedules=imported); toast(`${imported.length}개 일정을 불러왔습니다.`);
  } catch { toast('CSV 형식을 확인해주세요. DayCraft에서 내보낸 CSV가 가장 안전합니다.',true); }
}
function parseCsv(text) { const out=[]; let row=[],cell='',q=false; for(let i=0;i<text.length;i++){const c=text[i],n=text[i+1]; if(q){if(c==='"'&&n==='"'){cell+='"';i++;}else if(c==='"')q=false;else cell+=c;}else{if(c==='"')q=true;else if(c===','){row.push(cell);cell='';}else if(c==='\n'){row.push(cell.replace(/\r$/,''));out.push(row);row=[];cell='';}else cell+=c;}} row.push(cell.replace(/\r$/,'')); if(row.some(Boolean))out.push(row); if(out[0]?.[0]?.charCodeAt(0)===0xfeff)out[0][0]=out[0][0].slice(1); return out; }
function resetProject(){ if(!confirm('현재 편집 내용을 모두 지우고 처음 상태로 돌아갈까요?'))return; historyPast.push(JSON.stringify(state)); state=defaultState(); historyFuture=[]; selectedStickerId=null; renderAll(); schedulePersist(); toast('새 계획표로 초기화했습니다.'); }

async function openShareDialog() {
  const encoded=await encodeShareState(state); const url=`${location.origin}${location.pathname}${location.search}#share=${encoded}`; refs.shareLink.value=url; refs.shareWarning.hidden=url.length<7000; if(!refs.shareWarning.hidden) refs.shareWarning.textContent='아이콘이나 일정이 많아 링크가 길어요. 일부 메신저에서는 긴 링크가 잘릴 수 있으니 JSON 백업도 함께 권장합니다.'; refs.nativeShareBtn.hidden=!navigator.share; refs.shareDialog.showModal();
}
async function encodeShareState(data) {
  const text=JSON.stringify(data); const input=new TextEncoder().encode(text);
  if('CompressionStream' in window){ try{ const cs=new CompressionStream('gzip'); const buf=await new Response(new Blob([input]).stream().pipeThrough(cs)).arrayBuffer(); return 'g.'+bytesToBase64Url(new Uint8Array(buf)); }catch{} }
  return 'j.'+bytesToBase64Url(input);
}
async function decodeShareState(code) {
  const [kind,payload]=code.split('.',2); if(!payload)throw new Error('잘못된 공유 링크'); const bytes=base64UrlToBytes(payload);
  let raw=bytes;
  if(kind==='g'){ if(!('DecompressionStream' in window))throw new Error('이 브라우저는 압축 공유 링크를 지원하지 않습니다. 최신 브라우저에서 열어주세요.'); const ds=new DecompressionStream('gzip'); raw=new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(ds)).arrayBuffer()); }
  return JSON.parse(new TextDecoder().decode(raw));
}
function bytesToBase64Url(bytes){ let bin=''; const chunk=0x8000; for(let i=0;i<bytes.length;i+=chunk) bin+=String.fromCharCode(...bytes.subarray(i,i+chunk)); return btoa(bin).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''); }
function base64UrlToBytes(s){ s=s.replace(/-/g,'+').replace(/_/g,'/'); while(s.length%4)s+='='; const bin=atob(s); return Uint8Array.from(bin,c=>c.charCodeAt(0)); }
async function loadSharedStateFromUrl(){ const m=location.hash.match(/^#share=(.+)$/); if(!m)return null; try{return await decodeShareState(m[1]);}catch(err){setTimeout(()=>toast(err.message||'공유 링크를 읽지 못했습니다.',true),100);return null;} }
async function copyShareLink(){ try{await navigator.clipboard.writeText(refs.shareLink.value);toast('공유 링크를 복사했습니다.');}catch{refs.shareLink.select();document.execCommand('copy');toast('공유 링크를 복사했습니다.');} }
async function nativeShare(){ if(!navigator.share)return; try{await navigator.share({title:state.document.title,text:'이 생활계획표를 열어 수정해보세요.',url:refs.shareLink.value});}catch{} }

function openExportDialog(){ refs.exportName.value=sanitizeFilename(state.document.title); refs.exportDialog.showModal(); }
async function handleExport(type) {
  const name=sanitizeFilename(refs.exportName.value); const scale=Number(refs.exportScale.value)||2;
  try {
    if(type==='svg') downloadBlob(new Blob([`<?xml version="1.0" encoding="UTF-8"?>\n${buildPosterSvg()}`],{type:'image/svg+xml;charset=utf-8'}),`${name}.svg`);
    else if(type==='print') printPoster();
    else if(type==='pdf') await exportPdf(name,scale);
    else await exportRaster(type,name,scale);
    if(type!=='print') toast(`${type.toUpperCase()} 파일을 저장했습니다.`);
    refs.exportDialog.close();
  } catch(err){ console.error(err); toast('내보내기 중 문제가 발생했습니다. 다시 시도해주세요.',true); }
}
async function svgToCanvas(scale=2, format='png') {
  const {w,h}=CANVAS_SIZES[state.design.size]; const maxSide=6000; const actualScale=Math.min(scale,maxSide/Math.max(w,h));
  const svg=buildPosterSvg(); const blob=new Blob([svg],{type:'image/svg+xml;charset=utf-8'}); const url=URL.createObjectURL(blob); const img=new Image();
  await new Promise((res,rej)=>{img.onload=res;img.onerror=rej;img.src=url;});
  const canvas=document.createElement('canvas'); canvas.width=Math.round(w*actualScale); canvas.height=Math.round(h*actualScale); const ctx=canvas.getContext('2d');
  if(format==='jpg'){ ctx.fillStyle=PRESETS[state.design.preset].bg; ctx.fillRect(0,0,canvas.width,canvas.height); }
  ctx.drawImage(img,0,0,canvas.width,canvas.height); URL.revokeObjectURL(url); return canvas;
}
async function exportRaster(type,name,scale){ const canvas=await svgToCanvas(scale,type); const mime=type==='webp'?'image/webp':type==='jpg'?'image/jpeg':'image/png'; const quality=type==='png'?undefined:.94; const blob=await new Promise((res,rej)=>canvas.toBlob(b=>b?res(b):rej(new Error('blob')),mime,quality)); downloadBlob(blob,`${name}.${type==='jpg'?'jpg':type}`); }
async function exportPdf(name,scale){ const canvas=await svgToCanvas(Math.min(scale,2),'jpg'); const jpeg=await new Promise((res,rej)=>canvas.toBlob(b=>b?res(b):rej(new Error('jpeg')),'image/jpeg',.93)); const bytes=new Uint8Array(await jpeg.arrayBuffer()); const pdf=buildPdfWithJpeg(bytes,canvas.width,canvas.height); downloadBlob(pdf,`${name}.pdf`); }
function buildPdfWithJpeg(jpegBytes,pw,ph){
  const portrait=ph>=pw; let pageW,pageH; if(state.design.size==='a4'){pageW=595.28;pageH=841.89;} else if(portrait){pageH=841.89;pageW=pageH*pw/ph;} else {pageW=841.89;pageH=pageW*ph/pw;}
  const enc=new TextEncoder(); const parts=[]; const offsets=[0]; let length=0; const push=u=>{parts.push(u);length+=u.length;}; const pushText=s=>push(enc.encode(s));
  pushText('%PDF-1.4\n%DayCraft\n');
  function obj(n,bodyParts){offsets[n]=length;pushText(`${n} 0 obj\n`);for(const bp of bodyParts){typeof bp==='string'?pushText(bp):push(bp);}pushText('\nendobj\n');}
  obj(1,[`<< /Type /Catalog /Pages 2 0 R >>`]);
  obj(2,[`<< /Type /Pages /Kids [3 0 R] /Count 1 >>`]);
  obj(3,[`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW.toFixed(2)} ${pageH.toFixed(2)}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`]);
  obj(4,[`<< /Type /XObject /Subtype /Image /Width ${pw} /Height ${ph} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`,jpegBytes,'\nendstream']);
  const content=`q\n${pageW.toFixed(2)} 0 0 ${pageH.toFixed(2)} 0 0 cm\n/Im0 Do\nQ`;
  obj(5,[`<< /Length ${enc.encode(content).length} >>\nstream\n${content}\nendstream`]);
  const xref=length; pushText('xref\n0 6\n0000000000 65535 f \n'); for(let i=1;i<=5;i++)pushText(`${String(offsets[i]).padStart(10,'0')} 00000 n \n`); pushText(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);
  return new Blob(parts,{type:'application/pdf'});
}
function printPoster(){ const win=window.open('','_blank','noopener,noreferrer'); if(!win){toast('팝업이 차단되었습니다. 팝업을 허용한 뒤 다시 시도해주세요.',true);return;} const svg=buildPosterSvg(); win.document.write(`<!doctype html><html><head><title>${escapeXml(state.document.title)}</title><style>@page{margin:0}html,body{margin:0;min-height:100%;display:grid;place-items:center;background:white}svg{width:100vw;height:100vh;object-fit:contain}</style></head><body>${svg}<script>onload=()=>setTimeout(()=>print(),250)<\/script></body></html>`); win.document.close(); }
function downloadBlob(blob,name){ const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000); }

function toast(message,error=false){ if(!refs.toastRegion)return; const el=document.createElement('div'); el.className=`toast${error?' is-error':''}`; el.textContent=message; refs.toastRegion.appendChild(el); setTimeout(()=>el.remove(),3200); }

function registerServiceWorker(){ if('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('./sw.js').catch(()=>{}); }

init();
