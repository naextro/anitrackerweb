'use client'

const STATUS_COLOR = {
  Watching: '#00b4d8',
  Completed: '#06d6a0',
  Not_started: '#555577',
  On_Hold: '#ffd166',
  SUS: '#ef476f',
}

const STATUS_LABEL = {
  Watching: 'WATCHING',
  Completed: 'DONE',
  Not_started: 'PLAN TO WATCH',
  On_Hold: 'ON HOLD',
  SUS: 'SUS',
}

export default function AnimeCard({ entry, onStatusChange, onEpsChange,onDelete }) {
  const { title, status, episodes_watched, category, last_updated } = entry
  const color = STATUS_COLOR[status] || '#555577'

  const fmt = (ts) => {
    if (!ts) return ''
    try { return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }
    catch { return '' }
  }

  return (
    <div className="flex bg-[#13132b] border border-[#23234a] hover:border-[#e94560] transition mb-2 rounded">
      <div className="w-1 rounded-l shrink-0" style={{ backgroundColor: color }} />
      <div className="flex-1 px-4 py-3">
        {/* Row 1 */}
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-sm text-white">{title}</span>
          <div className="flex items-center gap-2">
            {last_updated && <span className="text-[#40405a] text-xs">{fmt(last_updated)}</span>}
            <span className="text-xs font-bold text-white px-2 py-0.5 rounded"
              style={{ backgroundColor: color }}>
              {STATUS_LABEL[status] || status}
            </span>
          </div>
        </div>
        {/* Row 2 */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[#40405a] text-xs">{category}</span>
          <div className="w-px h-3 bg-[#23234a]" />
          <button onClick={() => onEpsChange(entry, -1)}
            className="text-[#7a7a9a] hover:text-white w-5 text-center">−</button>
          <span className="text-[#7a7a9a] text-xs">{episodes_watched} eps</span>
          <button onClick={() => onEpsChange(entry, 1)}
            className="text-[#7a7a9a] hover:text-white w-5 text-center">+</button>
          <div className="flex-1" />
          {status !== 'Watching' &&
            <button onClick={() => onStatusChange(entry, 'Watching')}
              className="text-xs px-2 py-1 rounded bg-[#0d2a35] text-[#00b4d8] hover:opacity-80">Watch</button>}
          {status !== 'Completed' &&
            <button onClick={() => onStatusChange(entry, 'Completed')}
              className="text-xs px-2 py-1 rounded bg-[#0a2a1e] text-[#06d6a0] hover:opacity-80">Done</button>}
{status !== 'On_Hold' &&
            <button onClick={() => onStatusChange(entry, 'On_Hold')}
              className="text-xs px-2 py-1 rounded bg-[#2a280a] text-[#ffd166] hover:opacity-80">Hold</button>}
          <button onClick={() => onDelete(entry)}
            className="text-xs px-2 py-1 rounded bg-[#2a0a0a] text-[#ef476f] hover:opacity-80">Del</button>
            
        </div>
      </div>
    </div>
  )
}