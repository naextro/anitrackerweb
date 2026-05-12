'use client'

const CATEGORIES = [
  ["all", "All Anime"],
  ["high_priority", "High Priority"],
  ["currently_watching", "Currently Watching"],
  ["on_hold", "On Hold"],
  ["fb_feed_finds", "FB Finds"],
  ["watch_list", "Watch List"],
  ["planning_from_mal", "MAL Planning"],
  ["completed", "Completed"],
]

export default function Sidebar({ current, onSelect, counts }) {
  return (
    <div className="w-52 shrink-0 bg-[#0a0a1f] h-full flex flex-col py-4">
      <p className="text-[#40405a] text-xs font-bold px-4 mb-2">BROWSE</p>
      {CATEGORIES.map(([id, label]) => (
        <button
          key={id}
          onClick={() => onSelect(id)}
          className={`flex justify-between items-center px-4 py-2 text-sm text-left transition
            ${current === id
              ? 'bg-[#0f3460] text-white'
              : 'text-[#eaeaea] hover:bg-[#1e1e3a]'}`}
        >
          <span>{label}</span>
          <span className="text-[#40405a] text-xs">{counts[id] || ''}</span>
        </button>
      ))}
    </div>
  )
}