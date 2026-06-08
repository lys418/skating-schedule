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
const DAYS_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS_KO = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function firstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}
function makeStorageKey(year, month) {
  return `skating_${year}_${month}`;
}


// ─── Default entry ─────────────────────────────────────────────────────────
const defaultEntry = () => ({
  amStart: "", amEnd: "", fenceSet: false, fenceRemove: false,
  pmGround: "", pmSkating: "", isRest: false, subway: false, note: ""
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
  try {
    localStorage.setItem(makeStorageKey(year, month), JSON.stringify(data));
  } catch {}
}

// ─── Supabase helpers ──────────────────────────────────────────────────────
async function fetchMonthFromSupabase(year, month) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('schedules')
      .select('*')
      .eq('year', year)
      .eq('month', month + 1);
    if (error) { console.error('[SB fetch]', error); return null; }
    const result = {};
    for (const row of data) {
      result[row.day] = {
        amStart:     row.am_start     ?? '',
        amEnd:       row.am_end       ?? '',
        fenceSet:    row.fence_set    ?? false,
        fenceRemove: row.fence_remove ?? false,
        pmGround:    row.pm_ground    ?? '',
        pmSkating:   row.pm_skating   ?? '',
        isRest:      row.is_rest      ?? false,
        subway:      row.subway       ?? false,
        note:        row.note         ?? '',
      };
    }
    return result;
  } catch(e) {
    console.error('[SB fetch exception]', e);
    return null;
  }
}

async function upsertDayToSupabase(year, month, day, entry) {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('schedules').upsert(
      {
        year, month: month + 1, day,
        am_start:     entry.amStart,
        am_end:       entry.amEnd,
        fence_set:    entry.fenceSet,
        fence_remove: entry.fenceRemove,
        pm_ground:    entry.pmGround,
        pm_skating:   entry.pmSkating,
        is_rest:      entry.isRest,
        subway:       !!entry.subway,
        note:         entry.note,
      },
      { onConflict: 'year,month,day' }
    );
    return !error;
  } catch {
    return false;
  }
}

// ─── Pill component ────────────────────────────────────────────────────────
function Pill({ color, children }) {
  const colors = {
    blue:   "bg-blue-500/20 text-blue-300 border-blue-500/30",
    green:  "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    amber:  "bg-amber-500/20 text-amber-300 border-amber-500/30",
    red:    "bg-red-500/20 text-red-300 border-red-500/30",
    purple: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    slate:  "bg-slate-500/20 text-slate-400 border-slate-500/30",
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
    syncing: { cls: "text-sky-400",     label: "동기화 중…", spin: true },
    synced:  { cls: "text-emerald-400", label: "클라우드 저장됨 ✓" },
    error:   { cls: "text-red-400",     label: "클라우드 오류 (로컬 저장)" },
    offline: { cls: "text-slate-600",   label: "오프라인 모드" },
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
         style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}>
      <div className="relative w-full max-w-md rounded-2xl overflow-hidden"
           style={{ background: "linear-gradient(135deg,#1e293b 0%,#0f172a 100%)", border: "1px solid rgba(99,179,237,0.2)", boxShadow: "0 25px 60px rgba(0,0,0,0.6)" }}>
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between"
             style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", background: "linear-gradient(90deg,rgba(56,189,248,0.12),rgba(139,92,246,0.08))" }}>
          <div>
            <div className="text-xs text-slate-400 font-medium tracking-widest uppercase">{year}.{String(month+1).padStart(2,"0")}</div>
            <div className="text-xl font-bold text-white">{day}일 <span className="text-sky-400">({dayName})</span></div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all">
            <CloseIcon/>
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">특이사항 / 메모</label>
            <input value={form.note} onChange={e => set("note", e.target.value)}
              placeholder="예: 현충일, 지방선거…"
              className="w-full px-3 py-2 rounded-lg text-sm text-white placeholder-slate-500 outline-none focus:ring-1 focus:ring-sky-500"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}/>
          </div>

          {/* Rest toggle */}
          <label className="flex items-center justify-between p-3 rounded-xl cursor-pointer select-none"
                 style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
            <div className="flex items-center gap-2 text-red-300 text-sm font-medium">
              <RestIcon/> 휴무일
            </div>
            <div className={`relative w-11 h-6 rounded-full transition-colors ${form.isRest ? "bg-red-500" : "bg-slate-700"}`}
                 onClick={() => set("isRest", !form.isRest)}>
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.isRest ? "translate-x-6" : "translate-x-1"}`}/>
            </div>
          </label>

          {!form.isRest && <>
            {/* AM */}
            <div className="p-4 rounded-xl space-y-3" style={{ background: "rgba(56,189,248,0.06)", border: "1px solid rgba(56,189,248,0.15)" }}>
              <div className="text-xs font-bold text-sky-400 uppercase tracking-widest flex items-center gap-2">
                <IceBlade/> AM 스케이팅
              </div>
              <div className="grid grid-cols-2 gap-3">
                {["amStart","amEnd"].map((k,i) => (
                  <div key={k}>
                    <label className="block text-xs text-slate-500 mb-1">{i===0?"시작":"종료"}</label>
                    <input value={form[k]} onChange={e => set(k, e.target.value)}
                      placeholder="예: 7:00"
                      className="w-full px-3 py-2 rounded-lg text-sm text-white placeholder-slate-600 outline-none focus:ring-1 focus:ring-sky-500"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}/>
                  </div>
                ))}
              </div>
            </div>

            {/* PM */}
            <div className="p-4 rounded-xl space-y-3" style={{ background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.15)" }}>
              <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest">🏃 PM 훈련</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">그라운드</label>
                  <input value={form.pmGround} onChange={e => set("pmGround", e.target.value)}
                    placeholder="예: 5-7"
                    className="w-full px-3 py-2 rounded-lg text-sm text-white placeholder-slate-600 outline-none focus:ring-1 focus:ring-emerald-500"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}/>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">스케이팅</label>
                  <input value={form.pmSkating} onChange={e => set("pmSkating", e.target.value)}
                    placeholder="예: 7-9"
                    className="w-full px-3 py-2 rounded-lg text-sm text-white placeholder-slate-600 outline-none focus:ring-1 focus:ring-emerald-500"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}/>
                </div>
              </div>
            </div>

            {/* Fence & Subway */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { key:"fenceSet",    label:"팬스 치기",  color:"amber",  Icon:FenceIcon },
                { key:"fenceRemove", label:"팬스 걷기",  color:"purple", Icon:WalkIcon },
                { key:"subway",      label:"지하 (B1↓)", color:"slate",  Icon:SubwayIcon },
              ].map(({ key, label, color, Icon }) => (
                <label key={key} className="flex items-center gap-2 p-3 rounded-xl cursor-pointer select-none"
                       style={{ background: `rgba(255,255,255,0.04)`, border: "1px solid rgba(255,255,255,0.08)" }}>
                  <input type="checkbox" checked={!!form[key]} onChange={e => set(key, e.target.checked)} className="hidden"/>
                  <div className={`w-4 h-4 rounded flex items-center justify-center transition-all ${form[key] ? "bg-sky-500" : "border border-slate-600"}`}>
                    {form[key] && <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5"><polyline points="2,6 5,9 10,3"/></svg>}
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-medium ${form[key] ? "text-white" : "text-slate-500"}`}>
                    <Icon/>{label}
                  </div>
                </label>
              ))}
            </div>
          </>}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex gap-3" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white transition-colors"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
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
         style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}>
      <div className="relative w-full max-w-sm rounded-2xl overflow-hidden"
           style={{ background: "linear-gradient(135deg,#1e293b 0%,#0f172a 100%)", border: "1px solid rgba(99,179,237,0.2)", boxShadow: "0 25px 60px rgba(0,0,0,0.6)" }}>
        {/* Header */}
        <div className="px-6 py-5 relative overflow-hidden"
             style={{ background: "linear-gradient(135deg,rgba(56,189,248,0.15),rgba(139,92,246,0.1))", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="absolute inset-0 opacity-5"
               style={{ backgroundImage: "repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)", backgroundSize: "8px 8px" }}/>
          <div className="relative">
            <div className="text-xs text-slate-400 tracking-widest uppercase">{year}년 {MONTHS_KO[month]}</div>
            <div className="text-3xl font-black text-white">{day}<span className="text-lg font-normal text-sky-400 ml-1">일 ({dayName})</span></div>
            {entry.note && <div className="mt-1 text-sm text-amber-300 font-medium">{entry.note}</div>}
          </div>
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all">
            <CloseIcon/>
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {entry.isRest ? (
            <div className="flex items-center justify-center gap-3 py-6 rounded-xl" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <span className="text-3xl">🏖️</span>
              <span className="text-red-300 font-bold text-lg">휴무일</span>
            </div>
          ) : (
            <>
              {hasAM && (
                <div className="p-4 rounded-xl" style={{ background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.2)" }}>
                  <div className="text-xs font-bold text-sky-400 uppercase tracking-widest mb-3 flex items-center gap-1.5"><IceBlade/>AM 스케이팅</div>
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <div className="text-xs text-slate-500">워밍업 시작</div>
                      <div className="text-2xl font-black text-white">{entry.amStart || "—"}</div>
                    </div>
                    <div className="flex-1 h-px bg-gradient-to-r from-sky-500/50 to-transparent"/>
                    <div className="text-center">
                      <div className="text-xs text-slate-500">종료</div>
                      <div className="text-2xl font-black text-sky-300">{entry.amEnd || "—"}</div>
                    </div>
                  </div>
                </div>
              )}

              {hasPM && (
                <div className="p-4 rounded-xl" style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)" }}>
                  <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-3">🏃 PM 훈련</div>
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div>
                      <div className="text-xs text-slate-500 mb-1">그라운드</div>
                      <div className="text-lg font-bold text-white">{entry.pmGround || "—"}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">스케이팅</div>
                      <div className="text-lg font-bold text-emerald-300">{entry.pmSkating || "—"}</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {entry.fenceSet    && <Pill color="amber"><FenceIcon/>팬스 치기</Pill>}
                {entry.fenceRemove && <Pill color="purple"><WalkIcon/>팬스 걷기</Pill>}
                {entry.subway      && <Pill color="slate"><SubwayIcon/>지하 (B1↓)</Pill>}
                {!entry.fenceSet && !entry.fenceRemove && !entry.subway && (
                  <span className="text-xs text-slate-600">팬스/지하 정보 없음</span>
                )}
              </div>
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
function CalendarCell({ day, year, month, entry, isToday, onClick }) {
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
           background: isRest ? "rgba(239,68,68,0.07)" : isEmpty ? "rgba(255,255,255,0.02)" : "rgba(56,189,248,0.04)",
           border: isToday ? "1.5px solid rgba(56,189,248,0.6)" : "1px solid rgba(255,255,255,0.06)",
           boxShadow: isToday ? "0 0 12px rgba(56,189,248,0.2)" : "none",
         }}>
      {/* Day number */}
      <div className={`text-sm font-bold mb-1.5 ${isSun ? "text-red-400" : isSat ? "text-sky-400" : "text-slate-200"}`}>
        {isToday ? <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs text-white" style={{ background: "linear-gradient(135deg,#38bdf8,#818cf8)" }}>{day}</span> : day}
      </div>
      {entry?.note && <div className="text-[9px] text-amber-400 font-semibold mb-1 truncate">{entry.note}</div>}

      {isRest && (
        <div className="flex items-center gap-1">
          <span className="text-sm">🏖️</span>
          <span className="text-[9px] text-red-400 font-bold">휴무</span>
        </div>
      )}

      {!isRest && hasAM && (
        <div className="flex items-center gap-1 mb-0.5">
          <div className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0"/>
          <span className="text-[9px] text-sky-300 font-medium truncate">{entry.amStart}~{entry.amEnd}</span>
        </div>
      )}

      {!isRest && hasPM && (
        <div className="flex items-center gap-1 mb-0.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"/>
          <span className="text-[9px] text-emerald-300 truncate">PM {entry.pmGround}/{entry.pmSkating}</span>
        </div>
      )}

      {/* badges */}
      <div className="flex flex-wrap gap-0.5 mt-1">
        {entry?.fenceSet    && <span className="text-[8px] px-1 py-0.5 rounded text-amber-300 font-bold" style={{ background: "rgba(245,158,11,0.15)" }}>팬스↑</span>}
        {entry?.fenceRemove && <span className="text-[8px] px-1 py-0.5 rounded text-purple-300 font-bold" style={{ background: "rgba(139,92,246,0.15)" }}>팬스↓</span>}
        {entry?.subway      && <span className="text-[8px] px-1 py-0.5 rounded text-slate-300 font-bold" style={{ background: "rgba(148,163,184,0.15)" }}>지하</span>}
      </div>

      {!entry && (
        <div className="absolute inset-0 flex items-end justify-end p-2 opacity-0 hover:opacity-100 transition-opacity">
          <div className="w-5 h-5 rounded-full flex items-center justify-center text-slate-500" style={{ background: "rgba(255,255,255,0.06)" }}>
            <PlusIcon/>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main App ──────────────────────────────────────────────────────────────

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

  // bg
  const bg=ctx.createLinearGradient(0,0,W,H);
  bg.addColorStop(0,"#020c1f"); bg.addColorStop(.5,"#071428"); bg.addColorStop(1,"#020c1f");
  ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);
  ctx.strokeStyle="rgba(255,255,255,0.022)"; ctx.lineWidth=1;
  for(let x=0;x<W;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
  for(let y=0;y<H;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}

  // glow
  const g1=ctx.createRadialGradient(W,0,0,W,0,380);
  g1.addColorStop(0,"rgba(56,189,248,0.11)"); g1.addColorStop(1,"transparent");
  ctx.fillStyle=g1; ctx.fillRect(0,0,W,H);
  const g2=ctx.createRadialGradient(0,H,0,0,H,380);
  g2.addColorStop(0,"rgba(139,92,246,0.09)"); g2.addColorStop(1,"transparent");
  ctx.fillStyle=g2; ctx.fillRect(0,0,W,H);

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
  ctx.textAlign="left"; ctx.fillStyle="#f1f5f9";
  ctx.font=`800 24px ${FONT}`; ctx.fillText("장호성 쇼트트랙팀",PAD+54,PAD+28);
  ctx.fillStyle="#475569"; ctx.font=`400 12px ${FONT}`;
  ctx.fillText("훈련 일정 관리 시스템",PAD+55,PAD+46);

  // year/month center — measureText로 정확히 배치
  const MOS=["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];
  ctx.font=`900 50px ${FONT}`;
  const yearStr=`${year}`;
  const yearW=ctx.measureText(yearStr).width;
  const nenW=ctx.measureText("년").width;
  const totalW=yearW+8+nenW;          // 8px 간격
  const startX=(W-totalW)/2;
  ctx.textAlign="left";
  ctx.fillStyle="#f1f5f9"; ctx.fillText(yearStr, startX, PAD+64);
  ctx.fillStyle="#38bdf8"; ctx.fillText("년", startX+yearW+8, PAD+64);
  // 월 — 더 크고 선명하게
  ctx.textAlign="center";
  ctx.fillStyle="#7dd3fc"; ctx.font=`700 28px ${FONT}`; ctx.fillText(MOS[month],W/2,PAD+96);

  // date label
  ctx.textAlign="right"; ctx.fillStyle="#334155"; ctx.font=`400 11px ${FONT}`;
  ctx.fillText(`생성: ${new Date().toLocaleDateString("ko-KR")}`,W-PAD,PAD+28);

  // divider
  const dv=ctx.createLinearGradient(PAD,0,W-PAD,0);
  dv.addColorStop(0,"transparent"); dv.addColorStop(.2,"rgba(56,189,248,.35)");
  dv.addColorStop(.8,"rgba(139,92,246,.35)"); dv.addColorStop(1,"transparent");
  ctx.strokeStyle=dv; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(PAD,PAD+HDR_H-8); ctx.lineTo(W-PAD,PAD+HDR_H-8); ctx.stroke();

  // stats
  const SY=PAD+HDR_H, SW=(W-PAD*2-20)/3;
  const STATS=[
    {label:"팬스 치기",count:Object.values(data).filter(v=>v?.fenceSet&&!v?.isRest).length,c1:"rgba(245,158,11,.22)",c2:"rgba(245,158,11,.05)",bc:"rgba(245,158,11,.3)",tc:"#fbbf24"},
    {label:"팬스 걷기",count:Object.values(data).filter(v=>v?.fenceRemove&&!v?.isRest).length,c1:"rgba(167,139,250,.22)",c2:"rgba(167,139,250,.05)",bc:"rgba(167,139,250,.3)",tc:"#c4b5fd"},
    {label:"휴무일",count:Object.values(data).filter(v=>v?.isRest).length,c1:"rgba(239,68,68,.22)",c2:"rgba(239,68,68,.05)",bc:"rgba(239,68,68,.3)",tc:"#fca5a5"},
  ];
  STATS.forEach(({label,count,c1,c2,bc,tc},i)=>{
    const sx=PAD+i*(SW+10);
    const sg=ctx.createLinearGradient(sx,SY,sx+SW,SY+STATS_H-10);
    sg.addColorStop(0,c1); sg.addColorStop(1,c2);
    drawRR(ctx,sx,SY,SW,STATS_H-10,12); ctx.fillStyle=sg; ctx.fill();
    ctx.strokeStyle=bc; ctx.lineWidth=1; drawRR(ctx,sx,SY,SW,STATS_H-10,12); ctx.stroke();
    ctx.textAlign="center";
    ctx.fillStyle=tc; ctx.font=`900 26px ${FONT}`; ctx.fillText(String(count),sx+SW/2,SY+34);
    ctx.font=`600 11px ${FONT}`; ctx.fillText(label,sx+SW/2,SY+52);
  });

  // legend
  const LY=SY+STATS_H+4;
  let lx=PAD;
  const LEGS=[{dot:"#38bdf8",label:"AM 스케이팅"},{dot:"#34d399",label:"PM 훈련"},
    {badge:"#f59e0b",label:"팬스 치기"},{badge:"#a78bfa",label:"팬스 걷기"},{badge:"#94a3b8",label:"지하(B1↓)"},{badge:"#ef4444",label:"휴무일"}];
  ctx.textAlign="left"; ctx.font=`400 11px ${FONT}`;
  LEGS.forEach(({dot,badge,label})=>{
    if(dot){ctx.beginPath();ctx.arc(lx+5,LY+12,4.5,0,Math.PI*2);ctx.fillStyle=dot;ctx.fill();}
    else{drawRR(ctx,lx,LY+5,13,13,3);ctx.fillStyle=badge+"28";ctx.fill();ctx.strokeStyle=badge+"70";ctx.lineWidth=.8;ctx.stroke();}
    ctx.fillStyle="#64748b"; ctx.fillText(label,lx+16,LY+15);
    lx+=ctx.measureText(label).width+34;
  });

  // day headers
  const DHY=LY+LEG_H;
  const DC=["#f87171","#94a3b8","#94a3b8","#94a3b8","#94a3b8","#94a3b8","#38bdf8"];
  const DK=["일","월","화","수","목","금","토"];
  DK.forEach((d,i)=>{
    const cx=PAD+i*COL_W+COL_W/2;
    ctx.fillStyle=i===0?"rgba(248,113,113,.06)":i===6?"rgba(56,189,248,.06)":"rgba(255,255,255,.02)";
    ctx.fillRect(PAD+i*COL_W,DHY,COL_W,DAYH_H);
    ctx.textAlign="center"; ctx.fillStyle=DC[i]; ctx.font=`700 12px ${FONT}`; ctx.fillText(d,cx,DHY+20);
  });
  ctx.strokeStyle="rgba(255,255,255,.07)"; ctx.lineWidth=1;
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
      if(isRest){cb=ctx.createLinearGradient(cx,cy,cx+cw,cy+ch);cb.addColorStop(0,"rgba(239,68,68,.1)");cb.addColorStop(1,"rgba(239,68,68,.03)");}
      else if(e){cb=ctx.createLinearGradient(cx,cy,cx+cw,cy+ch);cb.addColorStop(0,"rgba(56,189,248,.06)");cb.addColorStop(1,"rgba(56,189,248,.01)");}
      else{cb="rgba(255,255,255,.015)";}
      ctx.fillStyle=cb; ctx.fillRect(cx,cy,cw,ch);
    }
    ctx.strokeStyle="rgba(255,255,255,.055)"; ctx.lineWidth=.5; ctx.strokeRect(cx,cy,cw,ch);
    if(!day) return;

    // day number
    ctx.textAlign="left"; ctx.fillStyle=isSun?"#f87171":isSat?"#38bdf8":"#e2e8f0";
    ctx.font=`800 14px ${FONT}`; ctx.fillText(String(day),cx+9,cy+20);
    if(e?.note){ctx.fillStyle="#fbbf24";ctx.font=`600 9px ${FONT}`;ctx.fillText(e.note,cx+28,cy+19);}
    if(isRest){ctx.fillStyle="#fca5a5";ctx.font=`700 12px ${FONT}`;ctx.textAlign="center";ctx.fillText("🏖 휴무일",cx+cw/2,cy+ch/2+4);ctx.textAlign="left";return;}

    let ty=cy+34;
    if(e?.amStart||e?.amEnd){
      const ag=ctx.createLinearGradient(cx+8,ty,cx+cw-8,ty);
      ag.addColorStop(0,"rgba(56,189,248,.18)"); ag.addColorStop(1,"rgba(56,189,248,.06)");
      drawRR(ctx,cx+8,ty,cw-16,26,6); ctx.fillStyle=ag; ctx.fill();
      ctx.strokeStyle="rgba(56,189,248,.28)"; ctx.lineWidth=.7; drawRR(ctx,cx+8,ty,cw-16,26,6); ctx.stroke();
      ctx.beginPath();ctx.arc(cx+16,ty+13,3,0,Math.PI*2);ctx.fillStyle="#38bdf8";ctx.fill();
      ctx.fillStyle="#7dd3fc";ctx.font=`700 9px ${FONT}`;ctx.fillText("AM",cx+22,ty+9);
      ctx.fillStyle="#f1f5f9";ctx.font=`800 10px ${FONT}`;ctx.fillText(`${e.amStart||""}~${e.amEnd||""}`,cx+22,ty+21);
      ty+=31;
    }
    if(e?.pmGround||e?.pmSkating){
      const pg=ctx.createLinearGradient(cx+8,ty,cx+cw-8,ty);
      pg.addColorStop(0,"rgba(52,211,153,.18)"); pg.addColorStop(1,"rgba(52,211,153,.06)");
      drawRR(ctx,cx+8,ty,cw-16,26,6); ctx.fillStyle=pg; ctx.fill();
      ctx.strokeStyle="rgba(52,211,153,.28)"; ctx.lineWidth=.7; drawRR(ctx,cx+8,ty,cw-16,26,6); ctx.stroke();
      ctx.beginPath();ctx.arc(cx+16,ty+13,3,0,Math.PI*2);ctx.fillStyle="#34d399";ctx.fill();
      ctx.fillStyle="#6ee7b7";ctx.font=`700 9px ${FONT}`;ctx.fillText("PM",cx+22,ty+9);
      ctx.fillStyle="#f1f5f9";ctx.font=`800 10px ${FONT}`;
      ctx.fillText([e.pmGround?`G:${e.pmGround}`:"",e.pmSkating?`S:${e.pmSkating}`:""].filter(Boolean).join("  "),cx+22,ty+21);
      ty+=31;
    }
    const tags=[];
    if(e?.fenceSet) tags.push({label:"팬스↑",color:"#f59e0b"});
    if(e?.fenceRemove) tags.push({label:"팬스↓",color:"#a78bfa"});
    if(e?.subway) tags.push({label:"지하",color:"#94a3b8"});
    if(tags.length){
      let tx=cx+8;
      tags.forEach(({label,color})=>{
        ctx.font=`700 8px ${FONT}`;
        const tw=ctx.measureText(label).width+8;
        drawRR(ctx,tx,ty,tw,15,3);ctx.fillStyle=color+"22";ctx.fill();
        ctx.strokeStyle=color+"55";ctx.lineWidth=.7;ctx.stroke();
        ctx.fillStyle=color;ctx.fillText(label,tx+4,ty+10);
        tx+=tw+3;
      });
    }
  });

  // footer line
  const FY=GRID_TOP+ROWS*CELL_H+14;
  ctx.textAlign="center";ctx.fillStyle="#1e293b";ctx.font=`400 10px ${FONT}`;
  ctx.fillText("장호성 쇼트트랙팀 · 훈련 일정 관리 시스템",W/2,FY+12);
  return cvs;
}

// ─── Download Modal ─────────────────────────────────────────────────────────
function DownloadModal({ year, month, data, onClose }) {
  const [imgUrl, setImgUrl] = useState(null);
  const [busy, setBusy] = useState(true);
  const fname = `장호성쇼트트랙팀_${year}년${["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"][month]}_훈련일정.jpg`;

  useEffect(() => {
    setBusy(true);
    const t = setTimeout(() => {
      try { setImgUrl(buildCalendarCanvas(year, month, data).toDataURL("image/jpeg", 0.95)); }
      catch(e) { console.error(e); }
      setBusy(false);
    }, 120);
    return () => clearTimeout(t);
  }, [year, month, data]);

  // Blob URL 방식 → 실패 시 새탭 fallback
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
      if (w) { w.document.write(`<html><body style="margin:0;background:#000"><img src="${imgUrl}" style="width:100%"></body></html>`); w.document.close(); }
    }
  }, [imgUrl, fname]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         style={{ background:"rgba(0,0,0,0.85)" }}
         onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-xl rounded-2xl overflow-hidden flex flex-col"
           style={{ maxHeight:"88vh", background:"linear-gradient(160deg,#1e293b,#0f172a)",
             border:"1px solid rgba(99,179,237,0.2)", boxShadow:"0 32px 80px rgba(0,0,0,0.8)" }}>

        {/* header: 타이틀 + 저장하기 버튼 + 닫기 */}
        <div className="flex items-center justify-between px-5 py-4 flex-shrink-0"
             style={{ background:"linear-gradient(90deg,rgba(56,189,248,.1),rgba(139,92,246,.07))",
               borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
          <div>
            <div className="text-[10px] text-slate-500 uppercase tracking-widest">이미지 저장</div>
            <div className="text-base font-bold text-white mt-0.5">{year}년 {["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"][month]} 훈련 일정표</div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleSave} disabled={busy||!imgUrl}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-opacity"
                    style={{ background: busy||!imgUrl ? "rgba(56,189,248,0.25)" : "linear-gradient(135deg,#38bdf8,#818cf8)",
                      border:"none", opacity: busy||!imgUrl ? 0.5 : 1, cursor: busy||!imgUrl ? "not-allowed":"pointer" }}>
              <DownloadIcon/>저장하기
            </button>
            <button onClick={onClose}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all">
              <CloseIcon/>
            </button>
          </div>
        </div>

        {/* 이미지 */}
        <div className="flex-1 overflow-y-auto p-4">
          {busy ? (
            <div className="flex flex-col items-center justify-center gap-4 py-16 text-slate-500">
              <div className="w-10 h-10 rounded-full border-2 border-sky-500/30 border-t-sky-400"
                   style={{ animation:"spin 0.8s linear infinite" }}/>
              <span className="text-sm font-medium">이미지 생성 중…</span>
            </div>
          ) : imgUrl ? (
            <a href={imgUrl} download={fname}
               className="block rounded-xl overflow-hidden"
               style={{ border:"2px solid rgba(56,189,248,0.2)", boxShadow:"0 6px 30px rgba(0,0,0,0.6)" }}>
              <img src={imgUrl} alt={fname} className="w-full block"
                   style={{ WebkitTouchCallout:"default", userSelect:"none", WebkitUserSelect:"none" }}/>
            </a>
          ) : (
            <p className="text-center text-red-400 text-sm py-10">이미지 생성 실패</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SkatingScheduleApp() {
  const today = new Date();
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(5); // June = 5
  const [data, setData] = useState(() => loadMonthData(2026, 5));
  const [selectedDay, setSelectedDay] = useState(null);
  const [editDay, setEditDay] = useState(null);
  const [isNewEdit, setIsNewEdit] = useState(false);
  const [syncStatus, setSyncStatus] = useState(supabase ? 'idle' : 'offline');

  useEffect(() => {
    const local = loadMonthData(year, month);
    setData(local);
    if (!supabase) return;
    setSyncStatus('syncing');
    fetchMonthFromSupabase(year, month).then(remote => {
      if (remote !== null) {
        if (Object.keys(remote).length > 0) {
          setData(remote);
          saveMonthData(year, month, remote);
        }
        setSyncStatus('synced');
      } else {
        setSyncStatus('error');
      }
    });
  }, [year, month]);

  const saveEntry = (day, entry) => {
    const next = { ...data, [day]: entry };
    setData(next);
    saveMonthData(year, month, next);
    if (!supabase) return;
    setSyncStatus('syncing');
    upsertDayToSupabase(year, month, day, entry).then(ok => {
      setSyncStatus(ok ? 'synced' : 'error');
    });
  };

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
    setSelectedDay(null);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
    setSelectedDay(null);
  };

  const totalDays = daysInMonth(year, month);
  const firstDay = firstDayOfMonth(year, month);
  const cells = Array(firstDay).fill(null).concat(Array.from({ length: totalDays }, (_, i) => i + 1));
  while (cells.length % 7 !== 0) cells.push(null);

  const fenceSetDays = Object.entries(data).filter(([,v]) => v?.fenceSet && !v?.isRest).map(([k]) => Number(k));
  const fenceRemoveDays = Object.entries(data).filter(([,v]) => v?.fenceRemove && !v?.isRest).map(([k]) => Number(k));
  const restDays = Object.entries(data).filter(([,v]) => v?.isRest).map(([k]) => Number(k));

  const isToday = (d) => today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;

  return (
    <div className="min-h-screen text-white" style={{ background: "linear-gradient(135deg,#020817 0%,#0a1628 50%,#020817 100%)", fontFamily: "'Noto Sans KR', 'Pretendard', sans-serif" }}>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      {/* BG decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10" style={{ background: "radial-gradient(circle,#38bdf8,transparent 70%)" }}/>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-10" style={{ background: "radial-gradient(circle,#818cf8,transparent 70%)" }}/>
      </div>

      <div className="relative max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg,#38bdf8,#818cf8)" }}>
                <IceBlade/>
              </div>
              <h1 className="text-lg font-black tracking-tight text-white">장호성 쇼트트랙팀</h1>
            </div>
            <p className="text-xs text-slate-500 ml-11 flex items-center gap-2">
              훈련 일정 관리 시스템
              <SyncBadge status={syncStatus}/>
            </p>
          </div>
          <button onClick={() => {
              const canvas = buildCalendarCanvas(year, month, data);
              const imgUrl = canvas.toDataURL("image/jpeg", 0.95);
              const fname = `장호성쇼트트랙팀_${year}년${MONTHS_KO[month]}_훈련일정.jpg`;
              const w = window.open("", "_blank");
              if (w) {
                w.document.write(`<!DOCTYPE html>
<html><head>
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${fname}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{background:#020817;display:flex;flex-direction:column;align-items:center;min-height:100vh;padding:16px}p{color:#64748b;font-size:13px;text-align:center;margin-bottom:12px;font-family:sans-serif;line-height:1.8}img{width:100%;max-width:1200px;display:block;border-radius:12px}</style>
</head><body>
<p>📱 이미지를 <b style="color:#fbbf24">길게 누르세요</b> → 사진에 저장<br>💻 이미지 <b style="color:#fbbf24">우클릭</b> → 이미지를 다른 이름으로 저장</p>
<img src="${imgUrl}" alt="${fname}"/>
</body></html>`);
                w.document.close();
              }
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90"
            style={{ background:"linear-gradient(135deg,rgba(56,189,248,.2),rgba(139,92,246,.15))", border:"1px solid rgba(56,189,248,.3)" }}>
            <DownloadIcon/>이미지 저장
          </button>
        </div>

        {/* Month nav */}
        <div className="flex items-center justify-between mb-5">
          <button onClick={prevMonth} className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all">
            <ChevronLeft/>
          </button>
          <div className="text-center">
            <div className="text-2xl font-black text-white">{year}<span className="text-sky-400">년</span></div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm font-medium text-slate-400">{MONTHS_KO[month]}</span>
              {(year !== today.getFullYear() || month !== today.getMonth()) && (
                <button
                  onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth()); setSelectedDay(null); }}
                  className="px-2 py-0.5 rounded-md text-[11px] font-bold text-sky-300 hover:text-white transition-all"
                  style={{ background: "rgba(56,189,248,0.15)", border: "1px solid rgba(56,189,248,0.3)" }}>
                  오늘
                </button>
              )}
            </div>
          </div>
          <button onClick={nextMonth} className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all">
            <ChevronRight/>
          </button>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label:"팬스 치기", count:fenceSetDays.length, color:"amber" },
            { label:"팬스 걷기", count:fenceRemoveDays.length, color:"purple" },
            { label:"휴무일",    count:restDays.length,       color:"red" },
          ].map(({ label, count, color }) => {
            const cols = { amber:"from-amber-500/20 to-amber-500/5 border-amber-500/20 text-amber-300", purple:"from-purple-500/20 to-purple-500/5 border-purple-500/20 text-purple-300", red:"from-red-500/20 to-red-500/5 border-red-500/20 text-red-300" };
            return (
              <div key={label} className={`p-3 rounded-xl bg-gradient-to-br ${cols[color]} border text-center`}>
                <div className="text-xl font-black">{count}</div>
                <div className="text-[10px] font-medium opacity-80">{label}</div>
              </div>
            );
          })}
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
            <div key={label} className="flex items-center gap-1.5 text-slate-400">
              {dot && <div className={`w-2 h-2 rounded-full ${dot}`}/>}
              {badge && <span className={`px-1 py-0.5 rounded text-[8px] font-bold ${badge==="amber"?"text-amber-300 bg-amber-500/15":badge==="purple"?"text-purple-300 bg-purple-500/15":"text-slate-300 bg-slate-500/15"}`}>■</span>}
              {label}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)" }}>
          {/* Day headers */}
          <div className="grid grid-cols-7">
            {DAYS_KO.map((d, i) => (
              <div key={d} className="py-2 text-center text-xs font-bold tracking-widest"
                   style={{ color: i===0 ? "#f87171" : i===6 ? "#38bdf8" : "#64748b", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                {d}
              </div>
            ))}
          </div>
          {/* Cells */}
          <div className="grid grid-cols-7 gap-1 p-2">
            {cells.map((day, idx) => (
              <CalendarCell key={idx} day={day} year={year} month={month}
                entry={day ? data[day] : null}
                isToday={day ? isToday(day) : false}
                onClick={(d) => {
                  if (data[d]) setSelectedDay(d);
                  else { setEditDay(d); setIsNewEdit(true); }
                }}/>
            ))}
          </div>
        </div>

        {/* Add note */}
        <div className="mt-4 text-center text-xs text-slate-600">
          날짜를 탭하면 상세보기 · 빈 날짜를 탭하면 바로 입력
        </div>
      </div>

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

    </div>
  );
}
