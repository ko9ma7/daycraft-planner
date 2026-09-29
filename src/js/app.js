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
  playful: {name:'컬러 팝', desc:'밝고 신나는', bg:'#fff8ea', surface:'#ffffff', text:'#27304a', muted:'#69708a', accent:'#5b67f1', line:'#e8dccb', palette:['#ff7c95','#5b9df9','#ffc857','#5ad1c7','#9b7cf6','#ff9d5c'], pattern:'playful'},
  notebook: {name:'공책', desc:'손글씨 느낌', bg:'#fffdf6', surface:'#fffefa', text:'#334155', muted:'#7c8797', accent:'#3b82f6', line:'#dbe4ee', palette:['#60a5fa','#34d399','#fbbf24','#fb7185','#a78bfa','#38bdf8'], pattern:'notebook'},
  clay: {name:'클레이', desc:'말랑말랑한', bg:'#f7ecff', surface:'#fff9ff', text:'#4b3f59', muted:'#82738f', accent:'#d16ba5', line:'#ead8ee', palette:['#d16ba5','#86a8e7','#5ffbf1','#ffb199','#f8d86a','#8fd694'], pattern:'clay'},
  glass: {name:'글래스', desc:'투명하고 시원한', bg:'#dcecff', surface:'#f8fbff', text:'#19304f', muted:'#60758f', accent:'#2f80ed', line:'#c4d8ed', palette:['#2f80ed','#56ccf2','#6fcf97','#bb6bd9','#f2c94c','#eb5757'], pattern:'glass'},
  minimal: {name:'미니멀', desc:'깔끔하고 선명한', bg:'#f7f7f5', surface:'#ffffff', text:'#171717', muted:'#6b7280', accent:'#111827', line:'#d9d9d6', palette:['#111827','#4b5563','#6b7280','#9ca3af','#374151','#1f2937'], pattern:'minimal'},
  night: {name:'별밤', desc:'차분한 밤', bg:'#141a33', surface:'#202846', text:'#f7f8ff', muted:'#b8c0dc', accent:'#9ea7ff', line:'#36405f', palette:['#9ea7ff','#ff88b7','#65d7c4','#ffd36a','#8ed1fc','#c99cff'], pattern:'night'},
  retro: {name:'레트로', desc:'통통 튀는', bg:'#fff0bf', surface:'#fff9e8', text:'#4b3428', muted:'#806858', accent:'#e96b42', line:'#e8c98a', palette:['#e96b42','#3e8b89','#d9a441','#6b5ca5','#ca5277','#5e8ac6'], pattern:'retro'},
  forest: {name:'숲속', desc:'편안하고 자연스러운', bg:'#eaf5e6', surface:'#f9fff6', text:'#254133', muted:'#667c6d', accent:'#3d8a5e', line:'#cfe0ca', palette:['#3d8a5e','#7bbd72','#d9a441','#5f8bb6','#b6789d','#8d7458'], pattern:'forest'}
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
    design: {preset:'playful', layout:'clock', size:'square', accent:'#5b67f1', showHours:true, showDetails:true, showLegend:true},
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
      color:safeColor(s.color, '#5b67f1')
    })) : base.schedules,
    stickers:Array.isArray(r.stickers) ? r.stickers.slice(0,60).map(st => ({
      id:String(st.id || uid('st')),
      icon:String(st.icon || 'star'), x:clamp(Number(st.x)||.5,0,1), y:clamp(Number(st.y)||.5,0,1),
      size:clamp(Number(st.size)||90,20,260), rotation:clamp(Number(st.rotation)||0,-360,360), color:safeColor(st.color,'#5b67f1')
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
      showLegend:r.design?.showLegend !== false
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
    'accentColor','accentColorText','showHours','showDetails','showLegend','iconGrid','iconSearch','svgFileInput','svgPaste','addPastedSvgBtn',
    'stickerInspector','stickerSize','stickerRotation','stickerColor','deleteStickerBtn','exportJsonBtn','importJsonInput','exportCsvBtn','importCsvInput','resetBtn',
    'zoomOutBtn','zoomInBtn','fitBtn','zoomLabel','scheduleDialog','scheduleForm','scheduleDialogTitle','quickActivity','formDayChecks','startTime','endTime',
    'scheduleTitle','scheduleDetail','scheduleColor','scheduleIconButton','scheduleIconPreview','scheduleIconName','scheduleError','saveScheduleBtn','cancelScheduleBtn',
    'iconChoiceDialog','scheduleIconSearch','scheduleIconGrid','closeIconChoice','shareDialog','shareLink','shareWarning','copyShareBtn','nativeShareBtn','closeShareBtn',
    'exportDialog','closeExportBtn','exportScale','exportName','toastRegion'
  ];
  ids.forEach(id => refs[id] = document.getElementById(id));
}

function buildStaticUi() {
  refs.quickActivity.innerHTML = QUICK_ACTIVITIES.map(a => `<button type="button" class="quick-chip" data-quick="${escapeXml(a.title)}" data-icon="${a.icon}" data-color="${a.color}">${iconSvgMarkup(getIcon(a.icon),{size:15})}<span>${escapeXml(a.title)}</span></button>`).join('');
  refs.formDayChecks.innerHTML = DAYS.map(([id,label]) => `<label class="day-check"><input type="checkbox" value="${id}"><span>${label}</span></label>`).join('');
  refs.presetGrid.innerHTML = Object.entries(PRESETS).map(([id,p]) => `<button type="button" class="preset-card" data-preset="${id}"><span class="preset-swatch" style="background:linear-gradient(135deg,${p.bg},${p.accent});"></span><strong>${p.name}</strong><small>${p.desc}</small></button>`).join('');
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
  refs.canvasSize.addEventListener('change', () => mutate(s=>s.design.size=refs.canvasSize.value));
  refs.showHours.addEventListener('change', () => mutate(s=>s.design.showHours=refs.showHours.checked));
  refs.showDetails.addEventListener('change', () => mutate(s=>s.design.showDetails=refs.showDetails.checked));
  refs.showLegend.addEventListener('change', () => mutate(s=>s.design.showLegend=refs.showLegend.checked));
  bindLiveField(refs.docTitle, (s,v)=>s.document.title=v, () => state.document.title);
  bindLiveField(refs.docSubtitle, (s,v)=>s.document.subtitle=v, () => state.document.subtitle);
  bindLiveField(refs.accentColor, (s,v)=>s.design.accent=safeColor(v,s.design.accent), () => state.design.accent);

  refs.iconSearch.addEventListener('input', renderIconGrid);
  refs.iconGrid.addEventListener('click', e => { const b=e.target.closest('[data-icon-id]'); if(b) addSticker(b.dataset.iconId); });
  refs.svgFileInput.addEventListener('change', importSvgFile);
  refs.addPastedSvgBtn.addEventListener('click', () => addCustomSvg(refs.svgPaste.value, '붙여넣은 SVG'));
  refs.deleteStickerBtn.addEventListener('click', deleteSelectedSticker);
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

function openPanel(id, mobileOpen=false) {
  $$('.panel-tab').forEach(b => { const active=b.dataset.panel===id; b.classList.toggle('is-active',active); b.setAttribute('aria-selected',String(active)); });
  $$('.panel-content').forEach(p => { const active=p.id===id; p.hidden=!active; p.classList.toggle('is-active',active); });
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
  applyUiTheme(); renderScheduleList(); syncDesignControls(); renderIconGrid(); renderPreview(); updateStickerInspector(); updateHistoryButtons();
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
  const candidate={id:editingScheduleId||uid('s'),days,start,end,title,detail,icon:scheduleIconId,color:refs.scheduleColor.value};
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

function syncDesignControls() {
  refs.docTitle.value=state.document.title; refs.docSubtitle.value=state.document.subtitle;
  refs.canvasSize.value=state.design.size; refs.accentColor.value=state.design.accent; refs.accentColorText.textContent=state.design.accent.toUpperCase();
  refs.showHours.checked=state.design.showHours; refs.showDetails.checked=state.design.showDetails; refs.showLegend.checked=state.design.showLegend;
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
  if(st) { refs.stickerSize.value=st.size; refs.stickerRotation.value=st.rotation; refs.stickerColor.value=st.color; }
}
function startStickerFieldHistory(){ if(selectedStickerId) fieldSnapshot=JSON.stringify(state); }
function finishStickerFieldHistory(){ if(fieldSnapshot&&fieldSnapshot!==JSON.stringify(state)){historyPast.push(fieldSnapshot);historyFuture=[];updateHistoryButtons();schedulePersist();} fieldSnapshot=null; }
function updateStickerLive(key,value) { const st=state.stickers.find(x=>x.id===selectedStickerId); if(!st)return; st[key]=key==='color'?safeColor(value,st.color):value; renderPreview(); schedulePersist(); }
function deleteSelectedSticker() { if(!selectedStickerId)return; mutate(s=>s.stickers=s.stickers.filter(x=>x.id!==selectedStickerId)); selectedStickerId=null; updateStickerInspector(); }

function startStickerDrag(e) {
  const g=e.target.closest?.('[data-sticker-id]'); if(!g)return;
  const id=g.dataset.stickerId; const st=state.stickers.find(x=>x.id===id); if(!st)return;
  e.preventDefault(); selectedStickerId=id; updateStickerInspector();
  refs.previewCanvas.querySelectorAll('[data-sticker-id]').forEach(el=>el.classList.toggle('sticker-selected',el.dataset.stickerId===id));
  dragInfo={id,startSnapshot:JSON.stringify(state), moved:false, pointerId:e.pointerId};
}
function pointInSvg(e) {
  const svg=refs.previewCanvas.querySelector('svg'); if(!svg)return null;
  const pt=svg.createSVGPoint(); pt.x=e.clientX; pt.y=e.clientY; const ctm=svg.getScreenCTM(); if(!ctm)return null; return pt.matrixTransform(ctm.inverse());
}
function moveStickerDrag(e) {
  if(!dragInfo || e.pointerId!==dragInfo.pointerId)return;
  const pt=pointInSvg(e); const svg=refs.previewCanvas.querySelector('svg'); if(!pt||!svg)return;
  const vb=svg.viewBox.baseVal; const st=state.stickers.find(x=>x.id===dragInfo.id); if(!st)return;
  st.x=clamp(pt.x/vb.width,.02,.98); st.y=clamp(pt.y/vb.height,.02,.98); dragInfo.moved=true;
  const g=refs.previewCanvas.querySelector(`[data-sticker-id="${CSS.escape(st.id)}"]`); if(g) g.setAttribute('transform',stickerTransform(st,vb.width,vb.height));
}
function endStickerDrag(e) {
  if(!dragInfo || e.pointerId!==dragInfo.pointerId)return;
  if(dragInfo.moved) { historyPast.push(dragInfo.startSnapshot); if(historyPast.length>MAX_HISTORY)historyPast.shift(); historyFuture=[]; schedulePersist(); updateHistoryButtons(); }
  dragInfo=null; renderPreview();
}
function stickerTransform(st,w,h) { const x=st.x*w,y=st.y*h,s=st.size; return `translate(${x} ${y}) rotate(${st.rotation}) translate(${-s/2} ${-s/2})`; }

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
  refs.previewCanvas.innerHTML=buildPosterSvg();
  refs.previewCanvas.querySelectorAll('[data-sticker-id]').forEach(el=>el.classList.toggle('sticker-selected',el.dataset.stickerId===selectedStickerId));
}

function buildPosterSvg() {
  const {w,h}=CANVAS_SIZES[state.design.size]; const p={...PRESETS[state.design.preset],accent:state.design.accent};
  const schedules=getVisibleSchedules();
  const defs=`<defs><filter id="shadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="12" stdDeviation="18" flood-color="#000" flood-opacity=".10"/></filter><filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="35"/></filter></defs>`;
  const bg=renderPosterBackground(w,h,p);
  let content='';
  if(state.design.layout==='timeline') content=renderTimelineLayout(w,h,p,schedules);
  else if(state.design.layout==='cards') content=renderCardsLayout(w,h,p,schedules);
  else content=renderClockLayout(w,h,p,schedules);
  const stickers=state.stickers.map(st=>renderSticker(st,w,h)).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${escapeXml(state.document.title)}"><rect width="${w}" height="${h}" fill="${p.bg}"/>${defs}${bg}${content}<g id="stickers">${stickers}</g></svg>`;
}

function renderPosterBackground(w,h,p) {
  if(p.pattern==='notebook') {
    let lines=''; for(let y=120;y<h;y+=48) lines+=`<line x1="0" y1="${y}" x2="${w}" y2="${y}" stroke="#b8d5ef" stroke-opacity=".38" stroke-width="2"/>`;
    return `${lines}<line x1="${Math.round(w*.12)}" y1="0" x2="${Math.round(w*.12)}" y2="${h}" stroke="#f3a9a9" stroke-opacity=".52" stroke-width="3"/>`;
  }
  if(p.pattern==='night') {
    let stars=''; for(let i=0;i<38;i++){ const x=(i*137)%w,y=(i*223)%h,r=(i%3)+1; stars+=`<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" opacity="${.18+(i%4)*.08}"/>`; } return stars;
  }
  if(p.pattern==='glass') return `<circle cx="${w*.15}" cy="${h*.2}" r="${Math.min(w,h)*.28}" fill="#75b9ff" opacity=".24" filter="url(#soft)"/><circle cx="${w*.88}" cy="${h*.78}" r="${Math.min(w,h)*.3}" fill="#9b7cf6" opacity=".22" filter="url(#soft)"/>`;
  if(p.pattern==='clay') return `<circle cx="${w*.1}" cy="${h*.16}" r="${Math.min(w,h)*.17}" fill="#ffd9c8" opacity=".7"/><circle cx="${w*.9}" cy="${h*.2}" r="${Math.min(w,h)*.12}" fill="#c6f0e9" opacity=".8"/><circle cx="${w*.82}" cy="${h*.88}" r="${Math.min(w,h)*.2}" fill="#d9d1ff" opacity=".75"/>`;
  if(p.pattern==='retro') return `<path d="M0 ${h*.16} Q ${w*.25} ${h*.1} ${w*.5} ${h*.16} T ${w} ${h*.16}" fill="none" stroke="#e96b42" stroke-opacity=".16" stroke-width="24"/><circle cx="${w*.9}" cy="${h*.1}" r="${Math.min(w,h)*.08}" fill="#3e8b89" opacity=".12"/>`;
  if(p.pattern==='forest') return `<path d="M0 ${h*.82} Q ${w*.18} ${h*.75} ${w*.34} ${h*.86} T ${w*.7} ${h*.84} T ${w} ${h*.8}V${h}H0Z" fill="#3d8a5e" opacity=".08"/><circle cx="${w*.08}" cy="${h*.12}" r="${Math.min(w,h)*.08}" fill="#7bbd72" opacity=".12"/>`;
  if(p.pattern==='minimal') return `<line x1="${w*.08}" y1="${h*.11}" x2="${w*.92}" y2="${h*.11}" stroke="${p.text}" stroke-width="3" opacity=".16"/>`;
  return `<circle cx="${w*.08}" cy="${h*.1}" r="${Math.min(w,h)*.09}" fill="#ffcf5d" opacity=".28"/><circle cx="${w*.92}" cy="${h*.12}" r="${Math.min(w,h)*.11}" fill="#7ad8d2" opacity=".24"/><circle cx="${w*.9}" cy="${h*.88}" r="${Math.min(w,h)*.13}" fill="#cbb7ff" opacity=".25"/>`;
}

function renderHeader(w,h,p,{compact=false}={}) {
  const y=compact?70:Math.max(78,h*.06); const fs=clamp(w*.052,42,74); const sub=clamp(w*.018,17,26);
  return `<g font-family="system-ui,'Noto Sans KR',sans-serif" text-anchor="middle"><text x="${w/2}" y="${y}" font-size="${fs}" font-weight="850" fill="${p.text}" letter-spacing="-1.8">${escapeXml(state.document.title)}</text><text x="${w/2}" y="${y+sub*1.7}" font-size="${sub}" font-weight="560" fill="${p.muted}">${escapeXml(state.document.subtitle)}</text><g transform="translate(${w/2-44} ${y+sub*2.5})"><rect width="88" height="34" rx="17" fill="${p.accent}" opacity=".12"/><text x="44" y="23" font-size="15" font-weight="800" fill="${p.accent}">${DAY_NAME[state.ui.selectedDay]}</text></g></g>`;
}

function renderClockLayout(w,h,p,schedules) {
  const header=renderHeader(w,h,p);
  const wide=w/h>1.45;
  const cx=wide?w*.34:w*.5; const cy=wide?h*.56:clamp(h*.43,390,h*.48); const r=wide?Math.min(h*.30,w*.21):Math.min(w*.31,h*.245); const stroke=Math.max(56,r*.26); const innerR=r-stroke*.5;
  const circumference=2*Math.PI*r;
  let ring=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${p.line}" stroke-opacity=".52" stroke-width="${stroke}"/>`;
  schedules.forEach(s=>{ const dur=durationMin(s.start,s.end); const len=circumference*dur/1440; const rot=timeToMin(s.start)/1440*360-90; ring+=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${s.color}" stroke-width="${stroke}" stroke-dasharray="${len} ${circumference-len}" transform="rotate(${rot} ${cx} ${cy})"/>`; });
  let ticks=''; if(state.design.showHours){ for(let hour=0;hour<24;hour++){ const a=(hour/24*360-90)*Math.PI/180; const major=hour%3===0; const r1=r+stroke*.62, r2=r1+(major?18:9); const x1=cx+Math.cos(a)*r1,y1=cy+Math.sin(a)*r1,x2=cx+Math.cos(a)*r2,y2=cy+Math.sin(a)*r2; ticks+=`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${p.text}" stroke-opacity="${major?.42:.20}" stroke-width="${major?3:2}"/>`; if(major && hour!==0){ const lr=r2+26; ticks+=`<text x="${cx+Math.cos(a)*lr}" y="${cy+Math.sin(a)*lr+6}" text-anchor="middle" font-size="15" font-weight="700" fill="${p.muted}">${String(hour).padStart(2,'0')}</text>`; } } }
  const planned=schedules.reduce((sum,s)=>sum+durationMin(s.start,s.end),0);
  const center=`<g font-family="system-ui,'Noto Sans KR',sans-serif" text-anchor="middle"><circle cx="${cx}" cy="${cy}" r="${innerR-10}" fill="${p.surface}" filter="url(#shadow)"/><text x="${cx}" y="${cy-12}" font-size="${clamp(r*.16,26,44)}" font-weight="850" fill="${p.text}">${DAY_NAME[state.ui.selectedDay]}</text><text x="${cx}" y="${cy+28}" font-size="${clamp(r*.075,14,21)}" font-weight="650" fill="${p.muted}">계획 ${escapeXml(durationText(planned))}</text></g>`;
  const legend=state.design.showLegend?renderLegend(w,h,p,schedules,wide?{x:w*.61,y:h*.27,width:w*.33,maxRows:9}:{x:w*.11,y:cy+r+stroke*.75+55,width:w*.78,maxRows:8}):'';
  return `${header}<g font-family="system-ui,'Noto Sans KR',sans-serif">${ring}${ticks}${center}${legend}</g>`;
}

function renderLegend(w,h,p,schedules,opt) {
  const items=schedules.slice(0,opt.maxRows); const cols=opt.width>w*.6?2:1; const colW=opt.width/cols; const rowH=55; let out='';
  items.forEach((s,i)=>{ const col=i%cols,row=Math.floor(i/cols),x=opt.x+col*colW,y=opt.y+row*rowH; const icon=getIcon(s.icon,state.customIcons); out+=`<g transform="translate(${x} ${y})"><rect width="${colW-14}" height="46" rx="15" fill="${p.surface}" opacity="${p.pattern==='glass'?.78:1}" stroke="${p.line}" stroke-opacity=".75"/><circle cx="24" cy="23" r="14" fill="${s.color}" opacity=".14"/><svg x="13" y="12" width="22" height="22" viewBox="${escapeXml(icon.viewBox||'0 0 24 24')}" fill="none" stroke="${s.color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${icon.body}</svg><text x="48" y="19" font-size="14" font-weight="800" fill="${p.text}">${escapeXml(truncate(s.title,16))}</text><text x="48" y="35" font-size="11" font-weight="600" fill="${p.muted}">${s.start}–${s.end}</text></g>`; });
  if(schedules.length>items.length){ const rows=Math.ceil(items.length/cols); out+=`<text x="${opt.x}" y="${opt.y+rows*rowH+18}" font-size="12" font-weight="700" fill="${p.muted}">+ ${schedules.length-items.length}개 일정 더 있음</text>`; }
  return out;
}

function renderTimelineLayout(w,h,p,schedules) {
  const header=renderHeader(w,h,p); const top=Math.max(190,h*.16), bottom=70; const avail=h-top-bottom; const count=Math.max(1,schedules.length); const rowH=clamp(avail/count,58,120); const axisX=Math.max(100,w*.13); let out=`<line x1="${axisX}" y1="${top}" x2="${axisX}" y2="${Math.min(h-bottom,top+rowH*count)}" stroke="${p.line}" stroke-width="5" stroke-linecap="round"/>`;
  if(!schedules.length) return `${header}${renderEmptyPoster(w,h,p,'일정을 추가하면 타임라인이 만들어져요')}`;
  schedules.forEach((s,i)=>{ const y=top+i*rowH; const icon=getIcon(s.icon,state.customIcons); const cardX=axisX+42, cardW=w-cardX-w*.08, cardH=rowH-12; out+=`<g font-family="system-ui,'Noto Sans KR',sans-serif"><circle cx="${axisX}" cy="${y+cardH/2}" r="9" fill="${s.color}"/><text x="${axisX-20}" y="${y+cardH/2-2}" text-anchor="end" font-size="${clamp(w*.014,14,20)}" font-weight="850" fill="${p.text}">${s.start}</text><text x="${axisX-20}" y="${y+cardH/2+17}" text-anchor="end" font-size="${clamp(w*.009,10,14)}" font-weight="650" fill="${p.muted}">${s.end}</text><rect x="${cardX}" y="${y}" width="${cardW}" height="${cardH}" rx="${Math.min(26,cardH*.26)}" fill="${p.surface}" stroke="${p.line}" filter="url(#shadow)" opacity="${p.pattern==='glass'?.86:1}"/><rect x="${cardX}" y="${y}" width="9" height="${cardH}" rx="5" fill="${s.color}"/><circle cx="${cardX+42}" cy="${y+cardH/2}" r="24" fill="${s.color}" opacity=".12"/><svg x="${cardX+28}" y="${y+cardH/2-14}" width="28" height="28" viewBox="${escapeXml(icon.viewBox||'0 0 24 24')}" fill="none" stroke="${s.color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${icon.body}</svg><text x="${cardX+78}" y="${y+cardH/2+(state.design.showDetails?-5:7)}" font-size="${clamp(w*.018,18,28)}" font-weight="850" fill="${p.text}">${escapeXml(truncate(s.title,30))}</text>${state.design.showDetails&&s.detail?`<text x="${cardX+78}" y="${y+cardH/2+22}" font-size="${clamp(w*.011,11,16)}" font-weight="560" fill="${p.muted}">${escapeXml(truncate(s.detail,48))}</text>`:''}</g>`; });
  return `${header}${out}`;
}

function renderCardsLayout(w,h,p,schedules) {
  const header=renderHeader(w,h,p); const top=Math.max(190,h*.17), pad=w*.07, gap=Math.max(18,w*.018); const cols=w/h>1.35?3:2; const cardW=(w-pad*2-gap*(cols-1))/cols; const rows=Math.ceil(Math.max(1,schedules.length)/cols); const avail=h-top-60; const cardH=clamp((avail-gap*Math.max(0,rows-1))/Math.max(1,rows),100,220);
  if(!schedules.length) return `${header}${renderEmptyPoster(w,h,p,'일정을 추가하면 카드가 차곡차곡 생겨요')}`;
  let out=''; schedules.forEach((s,i)=>{ const col=i%cols,row=Math.floor(i/cols),x=pad+col*(cardW+gap),y=top+row*(cardH+gap); if(y+cardH>h-30)return; const icon=getIcon(s.icon,state.customIcons); out+=`<g font-family="system-ui,'Noto Sans KR',sans-serif"><rect x="${x}" y="${y}" width="${cardW}" height="${cardH}" rx="${Math.min(30,cardH*.18)}" fill="${p.surface}" stroke="${p.line}" filter="url(#shadow)" opacity="${p.pattern==='glass'?.84:1}"/><rect x="${x+18}" y="${y+18}" width="${cardW-36}" height="8" rx="4" fill="${s.color}" opacity=".82"/><circle cx="${x+45}" cy="${y+58}" r="23" fill="${s.color}" opacity=".14"/><svg x="${x+31}" y="${y+44}" width="28" height="28" viewBox="${escapeXml(icon.viewBox||'0 0 24 24')}" fill="none" stroke="${s.color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${icon.body}</svg><text x="${x+78}" y="${y+57}" font-size="${clamp(w*.014,16,23)}" font-weight="850" fill="${p.text}">${escapeXml(truncate(s.title,20))}</text><text x="${x+78}" y="${y+78}" font-size="${clamp(w*.009,10,14)}" font-weight="700" fill="${p.muted}">${s.start} – ${s.end}</text>${state.design.showDetails&&s.detail?`<text x="${x+22}" y="${y+cardH-25}" font-size="${clamp(w*.009,10,14)}" font-weight="560" fill="${p.muted}">${escapeXml(truncate(s.detail,34))}</text>`:''}</g>`; });
  return `${header}${out}`;
}
function renderEmptyPoster(w,h,p,msg) { return `<g font-family="system-ui,'Noto Sans KR',sans-serif" text-anchor="middle"><circle cx="${w/2}" cy="${h*.5}" r="72" fill="${p.accent}" opacity=".1"/><text x="${w/2}" y="${h*.5+8}" font-size="54" fill="${p.accent}">+</text><text x="${w/2}" y="${h*.5+115}" font-size="22" font-weight="750" fill="${p.muted}">${escapeXml(msg)}</text></g>`; }
function truncate(s,n){ s=String(s||''); return s.length>n?s.slice(0,n-1)+'…':s; }

function renderSticker(st,w,h) {
  const icon=getIcon(st.icon,state.customIcons); if(!icon)return '';
  const s=st.size; return `<g data-sticker-id="${escapeXml(st.id)}" transform="${stickerTransform(st,w,h)}"><rect class="sticker-hit" x="-8" y="-8" width="${s+16}" height="${s+16}" rx="18" fill="transparent" stroke="transparent"/><svg x="0" y="0" width="${s}" height="${s}" viewBox="${escapeXml(icon.viewBox||'0 0 24 24')}" fill="none" stroke="${st.color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${icon.body}</svg></g>`;
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
  const rows=[['요일','시작시간','종료시간','제목','내용','색상','아이콘'],...state.schedules.map(s=>[s.days.map(d=>DAY_NAME[d]).join('/'),s.start,s.end,s.title,s.detail,s.color,s.icon])];
  const csv='\ufeff'+rows.map(r=>r.map(csvEscape).join(',')).join('\r\n'); downloadBlob(new Blob([csv],{type:'text/csv;charset=utf-8'}),`${sanitizeFilename(state.document.title)}.csv`); toast('CSV를 저장했습니다.');
}
async function importCsv(e) {
  const file=e.target.files?.[0]; e.target.value=''; if(!file)return;
  try { const rows=parseCsv(await file.text()); if(rows.length<2)throw new Error(); const head=rows[0]; const idx=n=>head.indexOf(n); const mapDay={'매일':'all','공통':'all','월':'mon','화':'tue','수':'wed','목':'thu','금':'fri','토':'sat','일':'sun','월요일':'mon','화요일':'tue','수요일':'wed','목요일':'thu','금요일':'fri','토요일':'sat','일요일':'sun'};
    const imported=rows.slice(1).filter(r=>r.some(Boolean)).map(r=>({id:uid('s'),days:String(r[idx('요일')]||'매일').split(/[\/·, ]+/).map(x=>mapDay[x]).filter(Boolean),start:r[idx('시작시간')]||'09:00',end:r[idx('종료시간')]||'10:00',title:r[idx('제목')]||'일정',detail:r[idx('내용')]||'',color:safeColor(r[idx('색상')],'#5b9df9'),icon:r[idx('아이콘')]||inferIcon(r[idx('제목')]||'')}));
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
