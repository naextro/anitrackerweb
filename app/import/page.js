'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function Import() {
    const router = useRouter()
    const [status, setStatus] = useState('')

    const handleFile = async (e) => {
        const file = e.target.files[0]
        if (!file) return
        setStatus('reading file...')

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/'); return }

        const json = JSON.parse(await file.text())
        const rows = []

        const sanitize = (str) => str.replace(/[<>]/g, '').trim().slice(0, 200)

        const validStatuses = ['Watching', 'Completed', 'Not_started', 'On_Hold', 'SUS', 'WATCHING']
        const validCategories = ['high_priority', 'currently_watching', 'on_hold', 'fb_feed_finds', 'watch_list', 'planning_from_mal', 'completed']

        for (const [category, items] of Object.entries(json)) {
            if (!Array.isArray(items)) continue
            if (!validCategories.includes(category)) continue
            for (const item of items) {
                if (!item.title) continue
                if (rows.length >= 2000) break
                rows.push({
                    user_id: user.id,
                    title: sanitize(item.title),
                    status: validStatuses.includes(item.status) ? item.status : 'Not_started',
                    episodes_watched: Math.min(Math.max(0, parseInt(item.episodes_watched) || 0), 9999),
                    category: validCategories.includes(category) ? category : 'watch_list',
                    last_updated: item.last_updated || null,
                })
            }
        }

        setStatus(`importing ${rows.length} entries...`)
        const { error } = await supabase.from('anime').insert(rows)
        if (error) { setStatus('error: ' + error.message); return }
        setStatus(`done! imported ${rows.length} entries.`)
        setTimeout(() => router.push('/list'), 1500)
    }

    return (
        <div className="min-h-screen bg-[#0d0d1a] flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-[#e94560] mb-2">Import Watchlist</h1>
                <p className="text-[#7a7a9a] mb-6">select your Watchlist_merged.json</p>
                <input type="file" accept=".json" onChange={handleFile}
                    className="text-white" />
                {status && <p className="text-[#7a7a9a] mt-4">{status}</p>}
            </div>
        </div>
    )
}