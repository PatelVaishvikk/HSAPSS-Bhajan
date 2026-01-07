'use client';

import { useState, useEffect, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Copy, Check, Heart, Share2, Music, Type, Minus, Plus, MoveVertical, X, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function BhajanDetails({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [bhajan, setBhajan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // Font Size State (Default 18px)
  const [fontSize, setFontSize] = useState(18);
  // Line Height State (Default 2.0)
  const [lineHeight, setLineHeight] = useState(2.0);
  
  // Appearance Menu State
  const [showAppearance, setShowAppearance] = useState(false);
  const appearanceRef = useRef(null);

  useEffect(() => {
    const fetchBhajan = async () => {
      try {
        const res = await fetch(`/api/bhajans/${id}`);
        if (!res.ok) throw new Error('Not found');
        const data = await res.json();
        setBhajan(data);
      } catch (error) {
        console.log('Network failed, checking offline storage...');
        const offlineData = localStorage.getItem('offline_bhajans');
        if (offlineData) {
          const allBhajans = JSON.parse(offlineData);
          const found = allBhajans.find(b => b._id === id);
          if (found) {
            setBhajan(found);
            return;
          }
        }
        console.error('Failed to fetch bhajan:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    fetchBhajan();
  }, [id, router]);

  // Click outside to close appearance menu
  useEffect(() => {
    function handleClickOutside(event) {
      if (appearanceRef.current && !appearanceRef.current.contains(event.target)) {
        setShowAppearance(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [appearanceRef]);

  const handleCopy = () => {
    const text = document.querySelector('.lyrics-content')?.innerText;
    if (text) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this bhajan? This action cannot be undone.')) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/bhajans/${id}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete bhajan');
      }
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Delete failed. Check your connection.');
    } finally {
      setDeleting(false);
    }
  };

  const adjustFontSize = (delta) => {
    setFontSize(prev => {
      const newSize = prev + delta;
      if (newSize < 14) return 14; // Min size
      if (newSize > 40) return 40; // Max size
      return newSize;
    });
  };

  const adjustLineHeight = (delta) => {
    setLineHeight(prev => {
      const newHeight = prev + delta;
      if (newHeight < 1.2) return 1.2; // Min
      if (newHeight > 3.5) return 3.5; // Max
      return parseFloat(newHeight.toFixed(1));
    });
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
        <div className="container-custom h-16 flex items-center justify-between relative">
          <Link 
            href="/"
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors font-medium"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </Link>
          <div className="flex items-center gap-2">

            {/* Edit/Delete for Community Bhajans */}
            {bhajan.catId === 'user-added' && (
              <>
                <Link
                  href={`/bhajan/${id}/edit`}
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-all"
                  title="Edit Bhajan"
                >
                  <Edit size={20} />
                </Link>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="p-2 rounded-full hover:bg-red-50 text-red-500 transition-all disabled:opacity-50"
                  title="Delete Bhajan"
                >
                  <Trash2 size={20} />
                </button>
                <div className="w-[1px] h-6 bg-slate-200 mx-1"></div>
              </>
            )}
            
            {/* Appearance Menu Button */}
            <div className="relative" ref={appearanceRef}>
              <button 
                onClick={() => setShowAppearance(!showAppearance)}
                className={`p-2 rounded-full transition-all flex items-center gap-1 ${showAppearance ? 'bg-slate-900 text-white' : 'hover:bg-slate-100 text-slate-600'}`}
                title="Appearance Settings"
              >
                <Type size={20} />
              </button>

              {/* Popover Menu */}
              {showAppearance && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 animate-in fade-in zoom-in-95 duration-200 z-50">
                  <div className="space-y-4">
                    {/* Font Size Row */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Font Size</span>
                        <span className="text-xs font-mono text-slate-400">{fontSize}px</span>
                      </div>
                      <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-2 border border-slate-100">
                        <button 
                          onClick={() => adjustFontSize(-2)}
                          className="p-2 rounded-lg hover:bg-white hover:shadow-sm text-slate-600 transition-all flex-1 flex justify-center"
                        >
                          <span className="text-sm font-bold">A</span>
                        </button>
                        <div className="h-4 w-[1px] bg-slate-200"></div>
                        <button 
                          onClick={() => adjustFontSize(2)}
                          className="p-2 rounded-lg hover:bg-white hover:shadow-sm text-slate-600 transition-all flex-1 flex justify-center"
                        >
                          <span className="text-lg font-bold">A</span>
                        </button>
                      </div>
                    </div>

                    {/* Line Height Row */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                         <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Spacing</span>
                         <span className="text-xs font-mono text-slate-400">{lineHeight}</span>
                      </div>
                      <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-2 border border-slate-100">
                        <button 
                          onClick={() => adjustLineHeight(-0.2)}
                          className="p-2 rounded-lg hover:bg-white hover:shadow-sm text-slate-600 transition-all flex-1 flex justify-center"
                        >
                          <MoveVertical size={16} className="scale-75" />
                        </button>
                        <div className="h-4 w-[1px] bg-slate-200"></div>
                         <button 
                          onClick={() => adjustLineHeight(0.2)}
                          className="p-2 rounded-lg hover:bg-white hover:shadow-sm text-slate-600 transition-all flex-1 flex justify-center"
                        >
                          <MoveVertical size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

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
            <div 
              className="lyrics-content font-medium whitespace-pre-wrap text-slate-600 font-serif transition-all duration-200"
              style={{ fontSize: `${fontSize}px`, lineHeight: lineHeight }}
            >
              {bhajan.lyrics}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
