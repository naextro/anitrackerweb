'use client'
import { supabase } from '../lib/supabase'

export default function Home() {
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/list`
      }
    })
  }

  return (
    <div className="min-h-screen bg-[#0d0d1a] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-[#e94560] mb-2">AniTracker</h1>
        <p className="text-[#7a7a9a] mb-8">your personal anime list</p>
        <button
          onClick={handleLogin}
          className="bg-[#e94560] text-white px-8 py-3 rounded font-semibold hover:opacity-80 transition"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  )
}