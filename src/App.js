import { useState, useEffect, useCallback } from "react";
import { supabase } from './supabaseClient';

// ─── Icons ────────────────────────────────────────────────────────────────────
const IceBlade = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 20 L20 4" /><path d="M4 20 L8 20" /><path d="M20 4 L20 8" />
    <path d="M4 20 Q12 12 20 4" strokeDasharray="2 2" opacity="0.4"/>
  </svg>
);
const FenceIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <rect x="2" y="6" width="4" height="12" rx="1"/>
    <rect x="10" y="6" width="4" height="12" rx="1"/>
    <rect x="18" y="6" width="4" height="12" rx="1"/>
    <line x1="2" y1="10" x2="22" y2="10"/><line x1="2" y1="14" x2="22" y2="14"/>
  </svg>
);
const WalkIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
       style={{ transform:"rotate(180deg)" }}>
    <rect x="2" y="6" width="4" height="12" rx="1"/>
    <rect x="10" y="6" width="4" height="12" rx="1"/>
    <rect x="18" y="6" width="4" height="12" rx="1"/>
    <line x1="2" y1="10" x2="22" y2="10"/><line x1="2" y1="14" x2="22" y2="14"/>
  </svg>
);
const SubwayIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="5" y="2" width="14" height="16" rx="3"/>
    <line x1="9" y1="22" x2="9" y2="18"/><line x1="15" y1="22" x2="15" y2="18"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
    <circle cx="9" cy="8" r="1.5" fill="currentColor"/><circle cx="15" cy="8" r="1.5" fill="currentColor"/>
  </svg>
);
const RestIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
    <path d="M8 12h8M12 8v8" opacity="0.4"/>
    <line x1="8" y1="11" x2="16" y2="11"/><line x1="8" y1="14" x2="13" y2="14"/>
  </svg>
);
const ChevronLeft = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);
const ChevronRight = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);
const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const DownloadIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────
const DAYS_KO = ["일", "월", "화", "수", "목", "금", "토"];
const MONTHS_KO = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];

function daysInMonth(year, month) { return new Date(year, month + 1, 0).getDate(); }
function firstDayOfMonth(year, month) { return new Date(year, month, 1).getDay(); }
function makeStorageKey(year, month) { return `skating_${year}_${month}`; }

// ─── Default entry ─────────────────────────────────────────────────────────
const defaultEntry = () => ({
  amStart: "", amEnd: "", amFenceSet: false, amFenceRemove: false,
  pmGround: "", pmSkating: "", pmFenceSet: false, pmFenceRemove: false,
  isRest: false, subway: false, note: ""
});

// ─── Storage ───────────────────────────────────────────────────────────────
function loadMonthData(year, month) {
  try {
    const raw = localStorage.getItem(makeStorageKey(year, month));
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}
function saveMonthData(year, month, data) {
  try { localStorage.setItem(makeStorageKey(year, month), JSON.stringify(data)); } catch {}
}

// ─── Supabase helpers ──────────────────────────────────────────────────────
async function fetchMonthFromSupabase(year, month) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('schedules').select('*')
      .eq('year', year).eq('month', month + 1);
    if (error) { console.error('[SB fetch]', error); return null; }
    const result = {};
    for (const row of data) {
      result[row.day] = {
        amStart:       row.am_start       ?? '',
        amEnd:         row.am_end         ?? '',
        amFenceSet:    row.am_fence_set   ?? row.fence_set   ?? false,
        amFenceRemove: row.am_fence_remove ?? row.fence_remove ?? false,
        pmGround:      row.pm_ground      ?? '',
        pmSkating:     row.pm_skating     ?? '',
        pmFenceSet:    row.pm_fence_set   ?? false,
        pmFenceRemove: row.pm_fence_remove ?? false,
        isRest:        row.is_rest        ?? false,
        subway:        row.subway         ?? false,
        note:          row.note           ?? '',
      };
    }
    return result;
  } catch(e) { console.error('[SB fetch exception]', e); return null; }
}

async function upsertDayToSupabase(year, month, day, entry) {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('schedules').upsert(
      {
        year, month: month + 1, day,
        am_start:        entry.amStart,
        am_end:          entry.amEnd,
        am_fence_set:    entry.amFenceSet,
        am_fence_remove: entry.amFenceRemove,
        pm_ground:       entry.pmGround,
        pm_skating:      entry.pmSkating,
        pm_fence_set:    entry.pmFenceSet,
        pm_fence_remove: entry.pmFenceRemove,
        is_rest:         entry.isRest,
        subway:          !!entry.subway,
        note:            entry.note,
      },
      { onConflict: 'year,month,day' }
    );
    return !error;
  } catch { return false; }
}

// ─── Pill component ────────────────────────────────────────────────────────
function Pill({ color, children }) {
  const colors = {
    blue:   "bg-sky-100 text-sky-700 border-sky-200",
    green:  "bg-emerald-100 text-emerald-700 border-emerald-200",
    amber:  "bg-amber-100 text-amber-700 border-amber-200",
    red:    "bg-red-100 text-red-600 border-red-200",
    purple: "bg-purple-100 text-purple-700 border-purple-200",
    slate:  "bg-slate-100 text-slate-600 border-slate-200",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${colors[color]}`}>
      {children}
    </span>
  );
}

// ─── Sync badge ────────────────────────────────────────────────────────────
function SyncBadge({ status }) {
  const cfg = {
    syncing: { cls: "text-sky-500",     label: "동기화 중…", spin: true },
    synced:  { cls: "text-emerald-600", label: "클라우드 저장됨 ✓" },
    error:   { cls: "text-red-500",     label: "클라우드 오류 (로컬 저장)" },
    offline: { cls: "text-slate-400",   label: "오프라인 모드" },
  }[status];
  if (!cfg) return null;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-medium ${cfg.cls}`}>
      {cfg.spin && (
        <span className="inline-block w-2.5 h-2.5 rounded-full border border-current border-t-transparent"
              style={{ animation: "spin 0.8s linear infinite" }}/>
      )}
      {cfg.label}
    </span>
  );
}

// ─── Edit Modal ────────────────────────────────────────────────────────────
function EditModal({ year, month, day, entry, onSave, onClose }) {
  const [form, setForm] = useState({ ...defaultEntry(), ...entry });
  const date = new Date(year, month, day);
  const dayName = DAYS_KO[date.getDay()];
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(6px)" }}>
      <div className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
           style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}>
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between"
             style={{ borderBottom: "1px solid #f1f5f9", background: "linear-gradient(90deg,#eff6ff,#f5f3ff)" }}>
          <div>
            <div className="text-xs text-slate-400 font-medium tracking-widest uppercase">{year}.{String(month+1).padStart(2,"0")}</div>
            <div className="text-xl font-bold text-slate-800">{day}일 <span className="text-sky-500">({dayName})</span></div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all">
            <CloseIcon/>
          </button>
        </div>

        <div className="px-6 py-5 space-y-4" style={{ maxHeight: "70vh", overflowY: "auto" }}>
          {/* Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">특이사항 / 메모</label>
            <input value={form.note} onChange={e => set("note", e.target.value)}
              placeholder="예: 현충일, 지방선거…"
              className="w-full px-3 py-2 rounded-lg text-sm text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-sky-400"
              style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}/>
          </div>

          {/* Rest toggle */}
          <label className="flex items-center justify-between p-3 rounded-xl cursor-pointer select-none"
                 style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.18)" }}>
            <div className="flex items-center gap-2 text-red-500 text-sm font-medium">
              <RestIcon/> 휴무일
            </div>
            <div className={`relative w-11 h-6 rounded-full transition-colors ${form.isRest ? "bg-red-400" : "bg-slate-200"}`}
                 onClick={() => set("isRest", !form.isRest)}>
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.isRest ? "translate-x-6" : "translate-x-1"}`}/>
            </div>
          </label>

          {!form.isRest && <>
            {/* AM */}
            <div className="p-4 rounded-xl space-y-3" style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}>
              <div className="text-xs font-bold text-sky-600 uppercase tracking-widest flex items-center gap-2">
                <IceBlade/> AM 스케이팅
              </div>
              <div className="grid grid-cols-2 gap-3">
                {["amStart","amEnd"].map((k,i) => (
                  <div key={k}>
                    <label className="block text-xs text-slate-500 mb-1">{i===0?"시작":"종료"}</label>
                    <input value={form[k]} onChange={e => set(k, e.target.value)}
                      placeholder="예: 7 또는 7:30"
                      className="w-full px-3 py-2 rounded-lg text-sm text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-sky-400"
                      style={{ background: "#ffffff", border: "1px solid #bfdbfe" }}/>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                {[{key:"amFenceSet",label:"팬스 치기",Icon:FenceIcon},{key:"amFenceRemove",label:"팬스 걷기",Icon:WalkIcon}].map(({key,label,Icon})=>(
                  <label key={key} className="flex items-center gap-2 flex-1 p-2 rounded-lg cursor-pointer select-none"
                         style={{ background:"#ffffff", border:"1px solid #dbeafe" }}>
                    <input type="checkbox" checked={!!form[key]} onChange={e=>set(key,e.target.checked)} className="hidden"/>
                    <div className={`w-4 h-4 rounded flex items-center justify-center transition-all ${form[key]?"bg-sky-500":"border-2 border-slate-300"}`}>
                      {form[key]&&<svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5"><polyline points="2,6 5,9 10,3"/></svg>}
                    </div>
                    <span className={`flex items-center gap-1 text-xs font-medium ${form[key]?"text-sky-700":"text-slate-500"}`}><Icon/>{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* PM */}
            <div className="p-4 rounded-xl space-y-3" style={{ background: "#ecfdf5", border: "1px solid #a7f3d0" }}>
              <div className="text-xs font-bold text-emerald-700 uppercase tracking-widest">🏃 PM 훈련</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">그라운드</label>
                  <input value={form.pmGround} onChange={e => set("pmGround", e.target.value)}
                    placeholder="예: 5-7"
                    className="w-full px-3 py-2 rounded-lg text-sm text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-emerald-400"
                    style={{ background: "#ffffff", border: "1px solid #a7f3d0" }}/>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">스케이팅</label>
                  <input value={form.pmSkating} onChange={e => set("pmSkating", e.target.value)}
                    placeholder="예: 7-9"
                    className="w-full px-3 py-2 rounded-lg text-sm text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-emerald-400"
                    style={{ background: "#ffffff", border: "1px solid #a7f3d0" }}/>
                </div>
              </div>
              <div className="flex gap-2">
                {[{key:"pmFenceSet",label:"팬스 치기",Icon:FenceIcon},{key:"pmFenceRemove",label:"팬스 걷기",Icon:WalkIcon}].map(({key,label,Icon})=>(
                  <label key={key} className="flex items-center gap-2 flex-1 p-2 rounded-lg cursor-pointer select-none"
                         style={{ background:"#ffffff", border:"1px solid #d1fae5" }}>
                    <input type="checkbox" checked={!!form[key]} onChange={e=>set(key,e.target.checked)} className="hidden"/>
                    <div className={`w-4 h-4 rounded flex items-center justify-center transition-all ${form[key]?"bg-emerald-500":"border-2 border-slate-300"}`}>
                      {form[key]&&<svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5"><polyline points="2,6 5,9 10,3"/></svg>}
                    </div>
                    <span className={`flex items-center gap-1 text-xs font-medium ${form[key]?"text-emerald-700":"text-slate-500"}`}><Icon/>{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Subway */}
            <label className="flex items-center gap-2 p-3 rounded-xl cursor-pointer select-none"
                   style={{ background:"#f8fafc", border:"1px solid #e2e8f0" }}>
              <input type="checkbox" checked={!!form.subway} onChange={e=>set("subway",e.target.checked)} className="hidden"/>
              <div className={`w-4 h-4 rounded flex items-center justify-center transition-all ${form.subway?"bg-slate-600":"border-2 border-slate-300"}`}>
                {form.subway&&<svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5"><polyline points="2,6 5,9 10,3"/></svg>}
              </div>
              <span className={`flex items-center gap-1 text-xs font-medium ${form.subway?"text-slate-700":"text-slate-500"}`}><SubwayIcon/>지하 (B1↓)</span>
            </label>
          </>}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex gap-3" style={{ borderTop: "1px solid #f1f5f9" }}>
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
            style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
            취소
          </button>
          <button onClick={() => { onSave(form); onClose(); }}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg,#38bdf8,#818cf8)" }}>
            저장
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Detail Modal ──────────────────────────────────────────────────────────
function DetailModal({ year, month, day, entry, onEdit, onClose }) {
  if (!entry) return null;
  const date = new Date(year, month, day);
  const dayName = DAYS_KO[date.getDay()];
  const hasAM = entry.amStart || entry.amEnd;
  const hasPM = entry.pmGround || entry.pmSkating;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(6px)" }}>
      <div className="relative w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl"
           style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}>
        {/* Header */}
        <div className="px-6 py-5 relative overflow-hidden"
             style={{ background: "linear-gradient(135deg,#eff6ff,#f5f3ff)", borderBottom: "1px solid #e2e8f0" }}>
          <div className="relative">
            <div className="text-xs text-slate-400 tracking-widest uppercase">{year}년 {MONTHS_KO[month]}</div>
            <div className="text-3xl font-black text-slate-800">{day}<span className="text-lg font-normal text-sky-500 ml-1">일 ({dayName})</span></div>
            {entry.note && <div className="mt-1 text-sm text-amber-600 font-medium">{entry.note}</div>}
          </div>
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all">
            <CloseIcon/>
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {entry.isRest ? (
            <div className="flex items-center justify-center gap-3 py-6 rounded-xl" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.18)" }}>
              <span className="text-3xl">🏖️</span>
              <span className="text-red-500 font-bold text-lg">휴무일</span>
            </div>
          ) : (
            <>
              {hasAM && (
                <div className="p-4 rounded-xl" style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}>
                  <div className="text-xs font-bold text-sky-600 uppercase tracking-widest mb-3 flex items-center gap-1.5"><IceBlade/>AM 스케이팅</div>
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <div className="text-xs text-slate-400">워밍업 시작</div>
                      <div className="text-2xl font-black text-slate-800">{entry.amStart || "—"}</div>
                    </div>
                    <div className="flex-1 h-px bg-gradient-to-r from-sky-300 to-transparent"/>
                    <div className="text-center">
                      <div className="text-xs text-slate-400">종료</div>
                      <div className="text-2xl font-black text-sky-600">{entry.amEnd || "—"}</div>
                    </div>
                  </div>
                  {(entry.amFenceSet || entry.amFenceRemove) && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {entry.amFenceSet    && <Pill color="amber"><FenceIcon/>팬스 치기</Pill>}
                      {entry.amFenceRemove && <Pill color="purple"><WalkIcon/>팬스 걷기</Pill>}
                    </div>
                  )}
                </div>
              )}

              {hasPM && (
                <div className="p-4 rounded-xl" style={{ background: "#ecfdf5", border: "1px solid #a7f3d0" }}>
                  <div className="text-xs font-bold text-emerald-700 uppercase tracking-widest mb-3">🏃 PM 훈련</div>
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div>
                      <div className="text-xs text-slate-400 mb-1">그라운드</div>
                      <div className="text-lg font-bold text-slate-800">{entry.pmGround || "—"}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 mb-1">스케이팅</div>
                      <div className="text-lg font-bold text-emerald-700">{entry.pmSkating || "—"}</div>
                    </div>
                  </div>
                  {(entry.pmFenceSet || entry.pmFenceRemove) && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {entry.pmFenceSet    && <Pill color="amber"><FenceIcon/>팬스 치기</Pill>}
                      {entry.pmFenceRemove && <Pill color="purple"><WalkIcon/>팬스 걷기</Pill>}
                    </div>
                  )}
                </div>
              )}

              {entry.subway && (
                <div className="flex flex-wrap gap-2">
                  <Pill color="slate"><SubwayIcon/>지하 (B1↓)</Pill>
                </div>
              )}
            </>
          )}
        </div>

        <div className="px-6 pb-5">
          <button onClick={onEdit}
            className="w-full py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            style={{ background: "linear-gradient(135deg,#38bdf8,#818cf8)" }}>
            <EditIcon/>수정하기
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Calendar Cell ─────────────────────────────────────────────────────────
function CalendarCell({ day, year, month, entry, isToday, onClick, bulkMode, isSelected }) {
  if (!day) return <div className="min-h-[90px]"/>;

  const date = new Date(year, month, day);
  const dow = date.getDay();
  const isSun = dow === 0;
  const isSat = dow === 6;
  const isEmpty = !entry;
  const isRest = entry?.isRest;
  const hasAM = entry?.amStart || entry?.amEnd;
  const hasPM = entry?.pmGround || entry?.pmSkating;

  return (
    <div onClick={() => onClick(day)}
         className="min-h-[90px] p-2 rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:z-10 relative select-none"
         style={{
           background: isSelected ? "#dbeafe" : isRest ? "#fef2f2" : isEmpty ? "#f8fafc" : "#ffffff",
           border: isSelected ? "1.5px solid #60a5fa" : isToday ? "1.5px solid #38bdf8" : "1px solid #e2e8f0",
           boxShadow: isSelected ? "0 0 0 3px rgba(96,165,250,0.2)" : isToday ? "0 0 0 3px rgba(56,189,248,0.15)" : "0 1px 3px rgba(0,0,0,0.04)",
         }}>
      {bulkMode && (
        <div className={`absolute top-1.5 right-1.5 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? "bg-sky-500 border-sky-500" : "border-slate-300 bg-white"}`}>
          {isSelected && <svg width="8" height="8" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5"><polyline points="2,6 5,9 10,3"/></svg>}
        </div>
      )}
      {/* Day number */}
      <div className={`text-sm font-bold mb-1.5 ${isSun ? "text-red-500" : isSat ? "text-sky-500" : "text-slate-700"}`}>
        {isToday ? <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs text-white" style={{ background: "linear-gradient(135deg,#38bdf8,#818cf8)" }}>{day}</span> : day}
      </div>
      {entry?.note && <div className="text-[9px] text-amber-600 font-semibold mb-1 truncate">{entry.note}</div>}

      {isRest && (
        <div className="flex items-center gap-1">
          <span className="text-sm">🏖️</span>
          <span className="text-[9px] text-red-500 font-bold">휴무</span>
        </div>
      )}

      {!isRest && hasAM && (
        <div className="flex items-center gap-1 mb-0.5">
          <div className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0"/>
          <span className="text-[9px] text-sky-600 font-medium truncate">{entry.amStart}~{entry.amEnd}</span>
        </div>
      )}

      {!isRest && hasPM && (
        <div className="flex items-center gap-1 mb-0.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"/>
          <span className="text-[9px] text-emerald-700 truncate">PM {entry.pmGround}/{entry.pmSkating}</span>
        </div>
      )}

      {/* badges */}
      <div className="flex flex-wrap gap-0.5 mt-1">
        {entry?.amFenceSet    && <span className="text-[8px] px-1 py-0.5 rounded text-amber-700 font-bold" style={{ background: "rgba(245,158,11,0.15)" }}>AM↑</span>}
        {entry?.amFenceRemove && <span className="text-[8px] px-1 py-0.5 rounded text-purple-700 font-bold" style={{ background: "rgba(139,92,246,0.12)" }}>AM↓</span>}
        {entry?.pmFenceSet    && <span className="text-[8px] px-1 py-0.5 rounded text-amber-700 font-bold" style={{ background: "rgba(245,158,11,0.20)" }}>PM↑</span>}
        {entry?.pmFenceRemove && <span className="text-[8px] px-1 py-0.5 rounded text-purple-700 font-bold" style={{ background: "rgba(139,92,246,0.18)" }}>PM↓</span>}
        {entry?.subway        && <span className="text-[8px] px-1 py-0.5 rounded text-slate-600 font-bold" style={{ background: "rgba(100,116,139,0.12)" }}>지하</span>}
      </div>

      {!entry && (
        <div className="absolute inset-0 flex items-end justify-end p-2 opacity-0 hover:opacity-100 transition-opacity">
          <div className="w-5 h-5 rounded-full flex items-center justify-center text-slate-400" style={{ background: "#e2e8f0" }}>
            <PlusIcon/>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Canvas 유틸 ────────────────────────────────────────────────────────────
function drawRR(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r);
  ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r);
  ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y);
  ctx.closePath();
}

function buildCalendarCanvas(year, month, data) {
  const SC=2, W=1200, PAD=44;
  const COL_W=(W-PAD*2)/7;
  const HDR_H=130, STATS_H=68, LEG_H=38, DAYH_H=34, CELL_H=128;
  const totalDays=new Date(year,month+1,0).getDate();
  const firstDay=new Date(year,month,1).getDay();
  const cells=[...Array(firstDay).fill(null),...Array.from({length:totalDays},(_,i)=>i+1)];
  while(cells.length%7) cells.push(null);
  const ROWS=cells.length/7;
  const GRID_TOP=PAD+HDR_H+STATS_H+LEG_H+DAYH_H;
  const H=GRID_TOP+ROWS*CELL_H+PAD+28;

  const cvs=document.createElement("canvas");
  cvs.width=W*SC; cvs.height=H*SC;
  const ctx=cvs.getContext("2d");
  ctx.scale(SC,SC);

  // bg — light
  ctx.fillStyle="#f0f6ff"; ctx.fillRect(0,0,W,H);
  ctx.strokeStyle="rgba(99,179,237,0.08)"; ctx.lineWidth=1;

  const FONT=`'Apple SD Gothic Neo','Malgun Gothic','Noto Sans KR',sans-serif`;

  // logo box
  const lg=ctx.createLinearGradient(PAD,PAD,PAD+42,PAD+42);
  lg.addColorStop(0,"#38bdf8"); lg.addColorStop(1,"#818cf8");
  drawRR(ctx,PAD,PAD,42,42,10); ctx.fillStyle=lg; ctx.fill();
  ctx.strokeStyle="#fff"; ctx.lineWidth=2.2;
  ctx.beginPath(); ctx.moveTo(PAD+10,PAD+32); ctx.lineTo(PAD+32,PAD+10); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(PAD+10,PAD+32); ctx.lineTo(PAD+18,PAD+32); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(PAD+32,PAD+10); ctx.lineTo(PAD+32,PAD+18); ctx.stroke();

  // team name
  ctx.textAlign="left"; ctx.fillStyle="#0f172a";
  ctx.font=`800 24px ${FONT}`; ctx.fillText("장호성 쇼트트랙팀",PAD+54,PAD+28);
  ctx.fillStyle="#64748b"; ctx.font=`400 12px ${FONT}`;
  ctx.fillText("훈련 일정 관리 시스템",PAD+55,PAD+46);

  // year/month center
  const MOS=["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];
  ctx.font=`900 50px ${FONT}`;
  const yearStr=`${year}`;
  const yearW=ctx.measureText(yearStr).width;
  const nenW=ctx.measureText("년").width;
  const totalW=yearW+8+nenW;
  const startX=(W-totalW)/2;
  ctx.textAlign="left";
  ctx.fillStyle="#0f172a"; ctx.fillText(yearStr, startX, PAD+64);
  ctx.fillStyle="#0284c7"; ctx.fillText("년", startX+yearW+8, PAD+64);
  ctx.textAlign="center";
  ctx.fillStyle="#0369a1"; ctx.font=`700 28px ${FONT}`; ctx.fillText(MOS[month],W/2,PAD+96);

  // date label
  ctx.textAlign="right"; ctx.fillStyle="#94a3b8"; ctx.font=`400 11px ${FONT}`;
  ctx.fillText(`생성: ${new Date().toLocaleDateString("ko-KR")}`,W-PAD,PAD+28);

  // divider
  const dv=ctx.createLinearGradient(PAD,0,W-PAD,0);
  dv.addColorStop(0,"transparent"); dv.addColorStop(.2,"rgba(56,189,248,.4)");
  dv.addColorStop(.8,"rgba(139,92,246,.4)"); dv.addColorStop(1,"transparent");
  ctx.strokeStyle=dv; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(PAD,PAD+HDR_H-8); ctx.lineTo(W-PAD,PAD+HDR_H-8); ctx.stroke();

  // stats
  const SY=PAD+HDR_H, SW=(W-PAD*2-20)/3;
  const STATS=[
    {label:"팬스 치기",count:Object.values(data).filter(v=>!v?.isRest&&(v?.amFenceSet||v?.pmFenceSet)).length,c1:"rgba(245,158,11,.14)",c2:"rgba(245,158,11,.04)",bc:"rgba(245,158,11,.3)",tc:"#d97706"},
    {label:"팬스 걷기",count:Object.values(data).filter(v=>!v?.isRest&&(v?.amFenceRemove||v?.pmFenceRemove)).length,c1:"rgba(124,58,237,.12)",c2:"rgba(124,58,237,.04)",bc:"rgba(124,58,237,.25)",tc:"#7c3aed"},
    {label:"휴무일",count:Object.values(data).filter(v=>v?.isRest).length,c1:"rgba(239,68,68,.12)",c2:"rgba(239,68,68,.04)",bc:"rgba(239,68,68,.25)",tc:"#dc2626"},
  ];
  STATS.forEach(({label,count,c1,c2,bc,tc},i)=>{
    const sx=PAD+i*(SW+10);
    const sg=ctx.createLinearGradient(sx,SY,sx+SW,SY+STATS_H-10);
    sg.addColorStop(0,c1); sg.addColorStop(1,c2);
    drawRR(ctx,sx,SY,SW,STATS_H-10,12); ctx.fillStyle=sg; ctx.fill();
    ctx.strokeStyle=bc; ctx.lineWidth=1; drawRR(ctx,sx,SY,SW,STATS_H-10,12); ctx.stroke();
    ctx.textAlign="center";
    ctx.fillStyle=tc; ctx.font=`900 26px ${FONT}`; ctx.fillText(String(count),sx+SW/2,SY+34);
    ctx.fillStyle="#64748b"; ctx.font=`600 11px ${FONT}`; ctx.fillText(label,sx+SW/2,SY+52);
  });

  // legend
  const LY=SY+STATS_H+4;
  let lx=PAD;
  const LEGS=[{dot:"#0ea5e9",label:"AM 스케이팅"},{dot:"#10b981",label:"PM 훈련"},
    {badge:"#d97706",label:"팬스 치기"},{badge:"#7c3aed",label:"팬스 걷기"},{badge:"#64748b",label:"지하(B1↓)"},{badge:"#dc2626",label:"휴무일"}];
  ctx.textAlign="left"; ctx.font=`400 11px ${FONT}`;
  LEGS.forEach(({dot,badge,label})=>{
    if(dot){ctx.beginPath();ctx.arc(lx+5,LY+12,4.5,0,Math.PI*2);ctx.fillStyle=dot;ctx.fill();}
    else{drawRR(ctx,lx,LY+5,13,13,3);ctx.fillStyle=badge+"18";ctx.fill();ctx.strokeStyle=badge+"50";ctx.lineWidth=.8;ctx.stroke();}
    ctx.fillStyle="#475569"; ctx.fillText(label,lx+16,LY+15);
    lx+=ctx.measureText(label).width+34;
  });

  // day headers
  const DHY=LY+LEG_H;
  const DC=["#ef4444","#64748b","#64748b","#64748b","#64748b","#64748b","#0284c7"];
  const DK=["일","월","화","수","목","금","토"];
  DK.forEach((d,i)=>{
    const cx=PAD+i*COL_W+COL_W/2;
    ctx.fillStyle=i===0?"rgba(239,68,68,.06)":i===6?"rgba(2,132,199,.06)":"rgba(0,0,0,.02)";
    ctx.fillRect(PAD+i*COL_W,DHY,COL_W,DAYH_H);
    ctx.textAlign="center"; ctx.fillStyle=DC[i]; ctx.font=`700 12px ${FONT}`; ctx.fillText(d,cx,DHY+20);
  });
  ctx.strokeStyle="rgba(0,0,0,.07)"; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(PAD,DHY+DAYH_H); ctx.lineTo(W-PAD,DHY+DAYH_H); ctx.stroke();

  // cells
  cells.forEach((day,idx)=>{
    const col=idx%7, row=Math.floor(idx/7);
    const cx=PAD+col*COL_W, cy=GRID_TOP+row*CELL_H;
    const cw=COL_W, ch=CELL_H;
    const e=day?data[day]:null;
    const dow=day?new Date(year,month,day).getDay():-1;
    const isSun=dow===0, isSat=dow===6, isRest=e?.isRest;
    if(day){
      let cb;
      if(isRest){cb="#fff5f5";}
      else if(e){cb="#ffffff";}
      else{cb="#f8fafc";}
      ctx.fillStyle=cb; ctx.fillRect(cx,cy,cw,ch);
    }
    ctx.strokeStyle="rgba(0,0,0,0.06)"; ctx.lineWidth=.5; ctx.strokeRect(cx,cy,cw,ch);
    if(!day) return;

    // day number
    ctx.textAlign="left"; ctx.fillStyle=isSun?"#ef4444":isSat?"#0284c7":"#1e293b";
    ctx.font=`800 14px ${FONT}`; ctx.fillText(String(day),cx+9,cy+20);
    if(e?.note){ctx.fillStyle="#d97706";ctx.font=`600 9px ${FONT}`;ctx.fillText(e.note,cx+28,cy+19);}
    if(isRest){ctx.fillStyle="#ef4444";ctx.font=`700 12px ${FONT}`;ctx.textAlign="center";ctx.fillText("🏖 휴무일",cx+cw/2,cy+ch/2+4);ctx.textAlign="left";return;}

    let ty=cy+34;
    if(e?.amStart||e?.amEnd){
      const ag=ctx.createLinearGradient(cx+8,ty,cx+cw-8,ty);
      ag.addColorStop(0,"rgba(14,165,233,.14)"); ag.addColorStop(1,"rgba(14,165,233,.05)");
      drawRR(ctx,cx+8,ty,cw-16,26,6); ctx.fillStyle=ag; ctx.fill();
      ctx.strokeStyle="rgba(14,165,233,.3)"; ctx.lineWidth=.7; drawRR(ctx,cx+8,ty,cw-16,26,6); ctx.stroke();
      ctx.beginPath();ctx.arc(cx+16,ty+13,3,0,Math.PI*2);ctx.fillStyle="#0ea5e9";ctx.fill();
      ctx.fillStyle="#0284c7";ctx.font=`700 9px ${FONT}`;ctx.fillText("AM",cx+22,ty+9);
      ctx.fillStyle="#0f172a";ctx.font=`800 10px ${FONT}`;ctx.fillText(`${e.amStart||""}~${e.amEnd||""}`,cx+22,ty+21);
      ty+=31;
    }
    if(e?.pmGround||e?.pmSkating){
      const pg=ctx.createLinearGradient(cx+8,ty,cx+cw-8,ty);
      pg.addColorStop(0,"rgba(16,185,129,.14)"); pg.addColorStop(1,"rgba(16,185,129,.05)");
      drawRR(ctx,cx+8,ty,cw-16,26,6); ctx.fillStyle=pg; ctx.fill();
      ctx.strokeStyle="rgba(16,185,129,.3)"; ctx.lineWidth=.7; drawRR(ctx,cx+8,ty,cw-16,26,6); ctx.stroke();
      ctx.beginPath();ctx.arc(cx+16,ty+13,3,0,Math.PI*2);ctx.fillStyle="#10b981";ctx.fill();
      ctx.fillStyle="#059669";ctx.font=`700 9px ${FONT}`;ctx.fillText("PM",cx+22,ty+9);
      ctx.fillStyle="#0f172a";ctx.font=`800 10px ${FONT}`;
      ctx.fillText([e.pmGround?`G:${e.pmGround}`:"",e.pmSkating?`S:${e.pmSkating}`:""].filter(Boolean).join("  "),cx+22,ty+21);
      ty+=31;
    }
    const tags=[];
    if(e?.amFenceSet)    tags.push({label:"AM↑",color:"#d97706"});
    if(e?.amFenceRemove) tags.push({label:"AM↓",color:"#7c3aed"});
    if(e?.pmFenceSet)    tags.push({label:"PM↑",color:"#d97706"});
    if(e?.pmFenceRemove) tags.push({label:"PM↓",color:"#7c3aed"});
    if(e?.subway) tags.push({label:"지하",color:"#475569"});
    if(tags.length){
      let tx=cx+8;
      tags.forEach(({label,color})=>{
        ctx.font=`700 8px ${FONT}`;
        const tw=ctx.measureText(label).width+8;
        drawRR(ctx,tx,ty,tw,15,3);ctx.fillStyle=color+"18";ctx.fill();
        ctx.strokeStyle=color+"50";ctx.lineWidth=.7;ctx.stroke();
        ctx.fillStyle=color;ctx.fillText(label,tx+4,ty+10);
        tx+=tw+3;
      });
    }
  });

  // footer line
  const FY=GRID_TOP+ROWS*CELL_H+14;
  ctx.textAlign="center";ctx.fillStyle="#94a3b8";ctx.font=`400 10px ${FONT}`;
  ctx.fillText("장호성 쇼트트랙팀 · 훈련 일정 관리 시스템",W/2,FY+12);
  return cvs;
}

// ─── Download Modal ─────────────────────────────────────────────────────────
function DownloadModal({ year, month, data, onClose }) {
  const [imgUrl, setImgUrl] = useState(null);
  const [busy, setBusy] = useState(true);
  const fname = `장호성쇼트트랙팀_${year}년${MONTHS_KO[month]}_훈련일정.jpg`;

  useEffect(() => {
    setBusy(true);
    const t = setTimeout(() => {
      try { setImgUrl(buildCalendarCanvas(year, month, data).toDataURL("image/jpeg", 0.95)); }
      catch(e) { console.error(e); }
      setBusy(false);
    }, 120);
    return () => clearTimeout(t);
  }, [year, month, data]);

  const handleSave = useCallback(() => {
    if (!imgUrl) return;
    try {
      const arr = Uint8Array.from(atob(imgUrl.split(",")[1]), c => c.charCodeAt(0));
      const url = URL.createObjectURL(new Blob([arr], { type:"image/jpeg" }));
      const a = Object.assign(document.createElement("a"), { href:url, download:fname });
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1500);
    } catch {
      const w = window.open("","_blank");
      if (w) { w.document.write(`<html><body style="margin:0;background:#f0f6ff"><img src="${imgUrl}" style="width:100%"></body></html>`); w.document.close(); }
    }
  }, [imgUrl, fname]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         style={{ background:"rgba(15,23,42,0.55)", backdropFilter:"blur(6px)" }}
         onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-xl rounded-2xl overflow-hidden flex flex-col shadow-2xl"
           style={{ maxHeight:"88vh", background:"#ffffff", border:"1px solid #e2e8f0" }}>

        <div className="flex items-center justify-between px-5 py-4 flex-shrink-0"
             style={{ background:"#f8fafc", borderBottom:"1px solid #e2e8f0" }}>
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-widest">이미지 저장</div>
            <div className="text-base font-bold text-slate-800 mt-0.5">{year}년 {MONTHS_KO[month]} 훈련 일정표</div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleSave} disabled={busy||!imgUrl}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-opacity"
                    style={{ background: busy||!imgUrl ? "rgba(56,189,248,0.4)" : "linear-gradient(135deg,#38bdf8,#818cf8)",
                      border:"none", opacity: busy||!imgUrl ? 0.6 : 1, cursor: busy||!imgUrl ? "not-allowed":"pointer" }}>
              <DownloadIcon/>저장하기
            </button>
            <button onClick={onClose}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all">
              <CloseIcon/>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4" style={{ background:"#f0f6ff" }}>
          {busy ? (
            <div className="flex flex-col items-center justify-center gap-4 py-16 text-slate-400">
              <div className="w-10 h-10 rounded-full border-2 border-sky-300 border-t-sky-500"
                   style={{ animation:"spin 0.8s linear infinite" }}/>
              <span className="text-sm font-medium">이미지 생성 중…</span>
            </div>
          ) : imgUrl ? (
            <a href={imgUrl} download={fname}
               className="block rounded-xl overflow-hidden"
               style={{ border:"2px solid #bfdbfe", boxShadow:"0 4px 20px rgba(0,0,0,0.1)" }}>
              <img src={imgUrl} alt={fname} className="w-full block"
                   style={{ WebkitTouchCallout:"default", userSelect:"none", WebkitUserSelect:"none" }}/>
            </a>
          ) : (
            <p className="text-center text-red-500 text-sm py-10">이미지 생성 실패</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main App ──────────────────────────────────────────────────────────────
export default function SkatingScheduleApp() {
  const today = new Date();
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(5);
  const [data, setData] = useState(() => loadMonthData(2026, 5));
  const [selectedDay, setSelectedDay] = useState(null);
  const [editDay, setEditDay] = useState(null);
  const [isNewEdit, setIsNewEdit] = useState(false);
  const [syncStatus, setSyncStatus] = useState(supabase ? 'idle' : 'offline');
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkSelected, setBulkSelected] = useState(new Set());
  const [bulkEditOpen, setBulkEditOpen] = useState(false);
  const [showDownload, setShowDownload] = useState(false);

  useEffect(() => {
    const local = loadMonthData(year, month);
    setData(local);
    if (!supabase) return;
    setSyncStatus('syncing');
    fetchMonthFromSupabase(year, month).then(remote => {
      if (remote !== null) {
        if (Object.keys(remote).length > 0) { setData(remote); saveMonthData(year, month, remote); }
        setSyncStatus('synced');
      } else { setSyncStatus('error'); }
    });
  }, [year, month]);

  const saveBulkEntries = (entry) => {
    const next = { ...data };
    [...bulkSelected].forEach(day => { next[day] = { ...entry }; });
    setData(next); saveMonthData(year, month, next);
    if (supabase) {
      setSyncStatus('syncing');
      Promise.all([...bulkSelected].map(day => upsertDayToSupabase(year, month, day, entry)))
        .then(results => setSyncStatus(results.every(Boolean) ? 'synced' : 'error'));
    }
    setBulkMode(false); setBulkSelected(new Set()); setBulkEditOpen(false);
  };

  const saveEntry = (day, entry) => {
    const next = { ...data, [day]: entry };
    setData(next); saveMonthData(year, month, next);
    if (!supabase) return;
    setSyncStatus('syncing');
    upsertDayToSupabase(year, month, day, entry).then(ok => setSyncStatus(ok ? 'synced' : 'error'));
  };

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); } else setMonth(m => m - 1);
    setSelectedDay(null);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); } else setMonth(m => m + 1);
    setSelectedDay(null);
  };

  const totalDays = daysInMonth(year, month);
  const firstDay = firstDayOfMonth(year, month);
  const cells = Array(firstDay).fill(null).concat(Array.from({ length: totalDays }, (_, i) => i + 1));
  while (cells.length % 7 !== 0) cells.push(null);

  const isToday = (d) => today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;

  return (
    <div className="min-h-screen" style={{ background: "#f0f6ff", fontFamily: "'Noto Sans KR', 'Pretendard', sans-serif" }}>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>

      {/* top header bar */}
      <div style={{ background: "#ffffff", borderBottom: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ background: "linear-gradient(135deg,#38bdf8,#818cf8)" }}>
              <IceBlade/>
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight text-slate-800">장호성 쇼트트랙팀</h1>
              <p className="text-[10px] text-slate-400 flex items-center gap-1.5">
                훈련 일정 관리 시스템
                <SyncBadge status={syncStatus}/>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowDownload(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all hover:opacity-90"
              style={{ background:"linear-gradient(135deg,#eff6ff,#f5f3ff)", border:"1px solid #bfdbfe", color:"#0284c7" }}>
              <DownloadIcon/>이미지 저장
            </button>
            <button onClick={() => { setBulkMode(b => !b); setBulkSelected(new Set()); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all hover:opacity-90"
              style={bulkMode
                ? { background:"linear-gradient(135deg,#38bdf8,#818cf8)", border:"1px solid #38bdf8", color:"#fff" }
                : { background:"#f8fafc", border:"1px solid #e2e8f0", color:"#64748b" }}>
              <PlusIcon/>{bulkMode ? "선택 취소" : "다중 선택"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-5">
        {/* Month nav */}
        <div className="flex items-center justify-between mb-5 bg-white rounded-2xl px-4 py-3" style={{ border:"1px solid #e2e8f0", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
          <button onClick={prevMonth} className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all">
            <ChevronLeft/>
          </button>
          <div className="text-center">
            <div className="text-2xl font-black text-slate-800">{year}<span className="text-sky-500">년</span></div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm font-semibold text-slate-500">{MONTHS_KO[month]}</span>
              {(year !== today.getFullYear() || month !== today.getMonth()) && (
                <button
                  onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth()); setSelectedDay(null); }}
                  className="px-2 py-0.5 rounded-md text-[11px] font-bold transition-all hover:opacity-80"
                  style={{ background: "#eff6ff", border: "1px solid #bfdbfe", color: "#0284c7" }}>
                  오늘
                </button>
              )}
            </div>
          </div>
          <button onClick={nextMonth} className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all">
            <ChevronRight/>
          </button>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mb-4 text-[10px]">
          {[
            { dot:"bg-sky-400",     label:"AM 스케이팅" },
            { dot:"bg-emerald-400", label:"PM 훈련" },
            { badge:"amber",        label:"팬스 치기" },
            { badge:"purple",       label:"팬스 걷기" },
            { badge:"slate",        label:"지하(B1↓)" },
          ].map(({ dot, badge, label }) => (
            <div key={label} className="flex items-center gap-1.5 text-slate-500">
              {dot && <div className={`w-2 h-2 rounded-full ${dot}`}/>}
              {badge && <span className={`px-1 py-0.5 rounded text-[8px] font-bold ${badge==="amber"?"text-amber-700 bg-amber-100":badge==="purple"?"text-purple-700 bg-purple-100":"text-slate-600 bg-slate-100"}`}>■</span>}
              {label}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="rounded-2xl overflow-hidden bg-white" style={{ border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          {/* Day headers */}
          <div className="grid grid-cols-7" style={{ borderBottom: "1px solid #f1f5f9" }}>
            {DAYS_KO.map((d, i) => (
              <div key={d} className="py-2.5 text-center text-xs font-bold tracking-widest"
                   style={{ color: i===0 ? "#ef4444" : i===6 ? "#0284c7" : "#94a3b8", background: i===0 ? "#fff5f5" : i===6 ? "#eff6ff" : "transparent" }}>
                {d}
              </div>
            ))}
          </div>
          {/* Cells */}
          <div className="grid grid-cols-7 gap-1 p-2" style={{ background: "#f8fafc" }}>
            {cells.map((day, idx) => (
              <CalendarCell key={idx} day={day} year={year} month={month}
                entry={day ? data[day] : null}
                isToday={day ? isToday(day) : false}
                bulkMode={bulkMode}
                isSelected={day ? bulkSelected.has(day) : false}
                onClick={(d) => {
                  if (bulkMode) {
                    setBulkSelected(prev => {
                      const next = new Set(prev);
                      if (next.has(d)) next.delete(d); else next.add(d);
                      return next;
                    });
                  } else {
                    if (data[d]) setSelectedDay(d);
                    else { setEditDay(d); setIsNewEdit(true); }
                  }
                }}/>
            ))}
          </div>
        </div>

        <div className="mt-4 text-center text-xs text-slate-400">
          {bulkMode ? "날짜를 탭해서 선택 · 다시 탭하면 해제" : "날짜를 탭하면 상세보기 · 빈 날짜를 탭하면 바로 입력"}
        </div>
      </div>

      {/* Bulk mode bottom bar */}
      {bulkMode && (
        <div className="fixed bottom-0 left-0 right-0 z-40 px-4 py-4"
             style={{ background:"#ffffff", backdropFilter:"blur(10px)", borderTop:"1px solid #e2e8f0", boxShadow:"0 -4px 20px rgba(0,0,0,0.08)" }}>
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
            <span className="text-sm text-slate-500">
              <span className="text-sky-600 font-bold text-base">{bulkSelected.size}</span>개 날짜 선택됨
            </span>
            <div className="flex gap-2">
              <button onClick={() => setBulkSelected(new Set())}
                className="px-4 py-2 rounded-xl text-sm text-slate-500 hover:text-slate-700 transition-colors"
                style={{ background:"#f8fafc", border:"1px solid #e2e8f0" }}>
                선택 해제
              </button>
              <button onClick={() => { if (bulkSelected.size > 0) setBulkEditOpen(true); }}
                disabled={bulkSelected.size === 0}
                className="px-5 py-2 rounded-xl text-sm font-bold text-white transition-all"
                style={{ background: bulkSelected.size > 0 ? "linear-gradient(135deg,#38bdf8,#818cf8)" : "rgba(56,189,248,0.3)", opacity: bulkSelected.size > 0 ? 1 : 0.5 }}>
                {bulkSelected.size}개 날짜에 일정 등록
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Download Modal */}
      {showDownload && <DownloadModal year={year} month={month} data={data} onClose={() => setShowDownload(false)}/>}

      {/* Detail Modal */}
      {selectedDay && !editDay && (
        <DetailModal year={year} month={month} day={selectedDay} entry={data[selectedDay]}
          onEdit={() => { setEditDay(selectedDay); setIsNewEdit(false); }}
          onClose={() => setSelectedDay(null)}/>
      )}

      {/* Edit Modal */}
      {editDay && (
        <EditModal year={year} month={month} day={editDay}
          entry={data[editDay] || defaultEntry()}
          onSave={(form) => saveEntry(editDay, form)}
          onClose={() => { setEditDay(null); if (isNewEdit) setSelectedDay(null); else setSelectedDay(editDay); }}/>
      )}

      {/* Bulk Edit Modal */}
      {bulkEditOpen && (
        <EditModal year={year} month={month} day={[...bulkSelected].sort((a,b)=>a-b)[0]}
          entry={defaultEntry()}
          onSave={(form) => saveBulkEntries(form)}
          onClose={() => setBulkEditOpen(false)}/>
      )}
    </div>
  );
}
