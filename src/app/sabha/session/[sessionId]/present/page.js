'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ChevronLeft, ChevronRight, Menu, X } from 'lucide-react';

export default function SessionPresentation({ params }) {
  const { sessionId } = use(params);
  const router = useRouter();
  const [viewMode, setViewMode] = useState('slides'); // 'slides' or 'scroll'
  const [session, setSession] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch(`/api/sessions/${sessionId}`);
        if (!res.ok) throw new Error('Session not found');
        const data = await res.json();
        setSession(data);
      } catch (error) {
        console.error('Error fetching session:', error);
        router.push('/sabha');
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [sessionId]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
      <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!session || session.bhajans.length === 0) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white gap-4">
      <p className="text-xl text-slate-400">No bhajans in this session.</p>
      <Link href={`/sabha/session/${sessionId}`} className="text-orange-400 hover:underline">
        Go back to add bhajans
      </Link>
    </div>
  );

  const currentBhajan = session.bhajans[currentIndex].bhajanId;

  const nextBhajan = () => {
    if (currentIndex < session.bhajans.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevBhajan = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Top Bar */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-900/95 backdrop-blur z-20">
        <div className="flex items-center gap-4">
          <Link 
            href={`/sabha/session/${sessionId}`}
            className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={24} />
          </Link>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors lg:hidden"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-lg font-bold truncate hidden sm:block">
            {new Date(session.date).toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' })}
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('slides')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                viewMode === 'slides' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Slides
            </button>
            <button
              onClick={() => setViewMode('scroll')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                viewMode === 'scroll' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              List
            </button>
          </div>
          {viewMode === 'slides' && (
            <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
              <span>{currentIndex + 1}</span>
              <span className="text-slate-600">/</span>
              <span>{session.bhajans.length}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar (Desktop) */}
        <div className="hidden lg:flex w-80 border-r border-slate-800 flex-col bg-slate-900/50">
          <div className="p-4 border-b border-slate-800 font-bold text-slate-400 uppercase text-xs tracking-wider">
            Bhajan List
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {session.bhajans.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentIndex(idx);
                  if (viewMode === 'scroll') {
                    document.getElementById(`bhajan-${idx}`)?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className={`w-full text-left p-3 rounded-lg transition-all ${
                  idx === currentIndex && viewMode === 'slides'
                    ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <div className="font-medium truncate">{item.bhajanId.title}</div>
                <div className="text-xs opacity-60 truncate font-gujarati">{item.bhajanId.title_guj}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Sidebar */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
            <div className="absolute left-0 top-0 bottom-0 w-80 bg-slate-900 border-r border-slate-800 flex flex-col">
              <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
                <span className="font-bold">Bhajan List</span>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-slate-400">
                  <X size={24} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {session.bhajans.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setIsSidebarOpen(false);
                      if (viewMode === 'scroll') {
                        document.getElementById(`bhajan-${idx}`)?.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      idx === currentIndex && viewMode === 'slides'
                        ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' 
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <div className="font-medium truncate">{item.bhajanId.title}</div>
                    <div className="text-xs opacity-60 truncate font-gujarati">{item.bhajanId.title_guj}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto relative flex flex-col scroll-smooth">
          {viewMode === 'slides' ? (
            <>
              <div className="flex-1 container-custom max-w-4xl py-12 px-6 flex flex-col justify-center min-h-full">
                <div className="text-center mb-12">
                  <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                    {currentBhajan.title}
                  </h2>
                  <h3 className="text-2xl md:text-3xl text-orange-400 font-gujarati font-medium">
                    {currentBhajan.title_guj}
                  </h3>
                </div>

                <div className="prose prose-invert prose-lg md:prose-xl max-w-none text-center whitespace-pre-wrap font-serif leading-loose text-slate-300">
                  {currentBhajan.lyrics}
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="sticky bottom-0 p-6 flex items-center justify-between bg-gradient-to-t from-slate-900 via-slate-900/90 to-transparent pointer-events-none">
                <button
                  onClick={prevBhajan}
                  disabled={currentIndex === 0}
                  className="pointer-events-auto p-4 rounded-full bg-slate-800 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-700 transition-all shadow-lg"
                >
                  <ChevronLeft size={32} />
                </button>

                <button
                  onClick={nextBhajan}
                  disabled={currentIndex === session.bhajans.length - 1}
                  className="pointer-events-auto p-4 rounded-full bg-orange-600 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-orange-700 transition-all shadow-lg shadow-orange-900/20"
                >
                  <ChevronRight size={32} />
                </button>
              </div>
            </>
          ) : (
            <div className="container-custom max-w-4xl py-12 px-6 space-y-24">
              {session.bhajans.map((item, idx) => (
                <div key={idx} id={`bhajan-${idx}`} className="scroll-mt-24 border-b border-slate-800 pb-24 last:border-0 last:pb-0">
                  <div className="text-center mb-12">
                    <div className="inline-block px-3 py-1 bg-slate-800 rounded-full text-slate-400 text-sm font-bold mb-4">
                      #{idx + 1}
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                      {item.bhajanId.title}
                    </h2>
                    <h3 className="text-2xl md:text-3xl text-orange-400 font-gujarati font-medium">
                      {item.bhajanId.title_guj}
                    </h3>
                  </div>

                  <div className="prose prose-invert prose-lg md:prose-xl max-w-none text-center whitespace-pre-wrap font-serif leading-loose text-slate-300">
                    {item.bhajanId.lyrics}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
