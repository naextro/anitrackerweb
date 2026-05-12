'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import Sidebar from './Sidebar'
import AnimeCard from './AnimeCard'

const PAGE_SIZE = 40

export default function List() {
    const router = useRouter()
    const [user, setUser] = useState(null)
    const [anime, setAnime] = useState([])
    const [cat, setCat] = useState('all')
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(0)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            if (!data.user) { router.push('/'); return }
            setUser(data.user)
            fetchAnime(data.user.id)
        })
    }, [])

    const fetchAnime = async (uid) => {
        const { data } = await supabase
            .from('anime')
            .select('*')
            .eq('user_id', uid)
            .order('last_updated', { ascending: false })
        setAnime(data || [])
        setLoading(false)
    }

    const filtered = anime.filter(e => {
        const matchCat = cat === 'all' || e.category === cat
        const matchSearch = e.title.toLowerCase().includes(search.toLowerCase())
        return matchCat && matchSearch
    })

    const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
    const pageCount = Math.ceil(filtered.length / PAGE_SIZE)

    const counts = {}
    anime.forEach(e => { counts[e.category] = (counts[e.category] || 0) + 1 })
    counts['all'] = anime.length

    const updateEntry = async (entry, changes) => {
        const updated = { ...changes, last_updated: new Date().toISOString() }
        setAnime(prev => prev.map(e => e.id === entry.id ? { ...e, ...updated } : e))
        await supabase.from('anime').update(updated).eq('id', entry.id)
    }

    const onStatusChange = (entry, status) => {
        const catMap = { Completed: 'completed', Watching: 'currently_watching', On_Hold: 'on_hold' }
        const newCat = entry.category === 'high_priority' ? entry.category : (catMap[status] || entry.category)
        updateEntry(entry, { status, category: newCat })
    }

    const epsTimeout = {}
    const onEpsChange = (entry, delta) => {
        const episodes_watched = Math.min(9999, Math.max(0, entry.episodes_watched + delta))
        const status = delta > 0 && entry.status === 'Not_started' ? 'Watching' : entry.status

        // update UI instantly
        setAnime(prev => prev.map(e => e.id === entry.id ? { ...e, episodes_watched, status } : e))

        // debounce DB call — only saves after 800ms of no clicking
        clearTimeout(epsTimeout[entry.id])
        epsTimeout[entry.id] = setTimeout(() => {
            supabase.from('anime').update({ episodes_watched, status, last_updated: new Date().toISOString() }).eq('id', entry.id)
        }, 800)
    }
    const onDelete = async (entry) => {
        if (!confirm(`Remove "${entry.title}" from your list?`)) return
        setAnime(prev => prev.filter(e => e.id !== entry.id))
        await supabase.from('anime').delete().eq('id', entry.id)
        }
    const onAdd = async () => {
        const title = prompt('Anime title:')
        if (!title || !title.trim()) return
        const clean = title.replace(/[<>]/g, '').trim().slice(0, 200)
        if (!clean) return
        
        const newEntry = {
            user_id: user.id,
            title: clean,
            status: 'Not_started',
            episodes_watched: 0,
            category: cat === 'all' ? 'watch_list' : cat,
            last_updated: new Date().toISOString()
        }
        
        const { data } = await supabase.from('anime').insert(newEntry).select().single()
        if (data) setAnime(prev => [data, ...prev])
    }
    if (loading) return (
        <div className="min-h-screen bg-[#0d0d1a] flex items-center justify-center text-[#7a7a9a]">
            loading...
        </div>
    )

    return (
        <div className="flex h-screen bg-[#0d0d1a] text-white overflow-hidden">
            <Sidebar current={cat} onSelect={(c) => { setCat(c); setPage(0) }} counts={counts} />
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* topbar */}
                <div className="flex items-center gap-3 px-4 py-3 bg-[#0a0a1f] border-b border-[#23234a]">
                    <h1 className="text-[#e94560] font-bold text-lg">AniTracker</h1>
                    <div className="flex-1" />
                    <input
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(0) }}
                        placeholder="Search..."
                        className="bg-[#181830] text-white text-sm px-3 py-1.5 rounded border border-[#23234a] outline-none w-56"
                    />
                    <button onClick={onAdd}
                        className="bg-[#e94560] text-white text-sm px-3 py-1.5 rounded hover:opacity-80 transition">
                        + Add
                    </button>
                    <button onClick={() => router.push('/import')}
                        className="bg-[#181830] text-white text-sm px-3 py-1.5 rounded border border-[#23234a] hover:opacity-80 transition">
                        Import
                    </button>
                    <button onClick={() => supabase.auth.signOut().then(() => router.push('/'))}
                        className="bg-[#181830] text-[#7a7a9a] text-sm px-3 py-1.5 rounded border border-[#23234a] hover:text-white transition">
                        Sign out
                    </button>
                </div>
                {/* list */}
                <div className="flex-1 overflow-y-auto px-4 py-3">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[#7a7a9a] text-sm">{filtered.length} entries</span>
                        {pageCount > 1 && (
                            <div className="flex gap-2 items-center text-sm">
                                <button disabled={page === 0}
                                    onClick={() => setPage(p => p - 1)}
                                    className="px-2 py-1 bg-[#13132b] rounded disabled:opacity-30 hover:bg-[#1e1e3a]">
                                    &lt;
                                </button>
                                <span className="text-[#7a7a9a]">{page + 1} / {pageCount}</span>
                                <button disabled={page >= pageCount - 1}
                                    onClick={() => setPage(p => p + 1)}
                                    className="px-2 py-1 bg-[#13132b] rounded disabled:opacity-30 hover:bg-[#1e1e3a]">
                                    &gt;
                                </button>
                            </div>
                        )}
                    </div>
                    {paginated.map(entry => (
                        <AnimeCard key={entry.id} entry={entry}
                            onStatusChange={onStatusChange}
                            onEpsChange={onEpsChange}
                             onDelete={onDelete} />
                    ))}
                    {paginated.length === 0 && (
                        <p className="text-[#40405a] text-center mt-20">nothing here</p>
                    )}
                </div>
            </div>
        </div>
    )
}