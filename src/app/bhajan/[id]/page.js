'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Copy, Check, Heart, Share2, Music } from 'lucide-react';
import Link from 'next/link';

export default function BhajanDetails({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [bhajan, setBhajan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const fetchBhajan = async () => {
      try {
        const res = await fetch(`/api/bhajans/${id}`);
        if (!res.ok) throw new Error('Not found');
        const data = await res.json();
        setBhajan(data);
      } catch (error) {
        console.error('Failed to fetch bhajan:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    fetchBhajan();
  }, [id, router]);

  const handleCopy = () => {
    const text = document.querySelector('.lyrics-content')?.innerText;
    if (text) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!bhajan) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="fixed w-full z-50 glass">
        <div className="container-custom h-16 flex items-center justify-between">
          <Link 
            href="/"
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors font-medium"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </Link>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setLiked(!liked)}
              className={`p-2 rounded-full transition-all ${liked ? 'bg-red-50 text-red-500' : 'hover:bg-slate-100 text-slate-500'}`}
            >
              <Heart size={20} fill={liked ? 'currentColor' : 'none'} />
            </button>
            <button 
              onClick={handleCopy}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-all"
            >
              {copied ? <Check size={20} className="text-green-600" /> : <Copy size={20} />}
            </button>
            <button className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-all">
              <Share2 size={20} />
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-16 container-custom max-w-4xl">
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
          {/* Header */}
          <div className="bg-slate-50/50 p-8 md:p-12 border-b border-slate-100">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-sm font-semibold uppercase tracking-wide">
                {bhajan.catId}
              </span>
              {bhajan.isAudio && (
                <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm font-semibold uppercase tracking-wide flex items-center gap-1">
                  <Music size={14} /> Audio
                </span>
              )}
            </div>
            
            <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4 leading-tight">
              {bhajan.title}
            </h1>
            <p className="text-2xl md:text-4xl font-bold text-slate-500 font-gujarati">
              {bhajan.title_guj}
            </p>
          </div>

          {/* Lyrics */}
          <div className="p-8 md:p-12">
            <div className="lyrics-content font-medium whitespace-pre-wrap leading-loose text-lg text-slate-600 font-serif">
              {bhajan.lyrics}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
