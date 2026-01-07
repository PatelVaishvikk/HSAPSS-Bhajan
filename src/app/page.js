'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Music, BookOpen, X, ChevronRight, Download, WifiOff } from 'lucide-react';
import Link from 'next/link';
import UpcomingFestivals from '../components/UpcomingFestivals';

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'mangalacharan', label: 'Mangalacharan' },
  { id: 'shri-hari-kirtan', label: 'Shri Hari' },
  { id: 'sant-kirtan', label: 'Sant Kirtan' },
  { id: 'user-added', label: 'Community' },
];

export default function Home() {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [bhajans, setBhajans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const fetchBhajans = async () => {
      setLoading(true);
      try {
        const url = `/api/bhajans?q=${query}${selectedCategory !== 'all' ? `&category=${selectedCategory}` : ''}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Network response was not ok');
        const data = await res.json();
        setBhajans(Array.isArray(data) ? data : []);
        setIsOffline(false);
      } catch (error) {
        console.log('Network failed, checking offline storage...');
        const offlineData = localStorage.getItem('offline_bhajans');
        if (offlineData) {
          let data = JSON.parse(offlineData);
          
          // Client-side filtering
          if (selectedCategory !== 'all') {
            data = data.filter(b => b.catId === selectedCategory);
          }
          if (query) {
            const q = query.toLowerCase();
            data = data.filter(b => 
              b.title.toLowerCase().includes(q) || 
              b.title_guj.includes(q) || 
              (b.lyrics && b.lyrics.toLowerCase().includes(q))
            );
          }
          
          setBhajans(data);
          setIsOffline(true);
        } else {
          setBhajans([]);
        }
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(() => {
      fetchBhajans();
    }, 300);

    return () => clearTimeout(debounce);
  }, [query, selectedCategory]);

  const downloadOffline = async () => {
    const confirmDownload = window.confirm('Download all bhajans for offline use? This might take a moment.');
    if (!confirmDownload) return;

    try {
      const res = await fetch('/api/bhajans?full=true');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      localStorage.setItem('offline_bhajans', JSON.stringify(data));
      alert(`Success! ${data.length} bhajans saved for offline use.`);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download bhajans. Please check your internet connection.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="fixed w-full z-50 glass">
        <div className="container-custom h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
              HSAPSS Bhajans
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={downloadOffline}
              className="p-2 text-slate-600 hover:text-orange-600 transition-colors"
              title="Download for Offline"
            >
              <Download size={20} />
            </button>
            <Link 
              href="/calendar"
              className="text-slate-600 hover:text-slate-900 font-medium text-sm transition-colors hidden md:inline"
            >
              Calendar
            </Link>
            <Link 
              href="/sabha"
              className="text-slate-600 hover:text-slate-900 font-medium text-sm transition-colors"
            >
              <span className="sm:hidden">Sabha</span>
              <span className="hidden sm:inline">Sabha Planning</span>
            </Link>
            <Link 
              href="/add" 
              className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors flex items-center gap-2"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Add Bhajan</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-32 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center mb-12 animate-fade-in-up">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 mb-2 tracking-tight">
            HSAPSS <span className="text-orange-600">Canada</span>
          </h1>
          <p className="text-2xl sm:text-3xl font-semibold text-slate-700 mb-8 max-w-2xl mx-auto">
            Bhaktisudha
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto group mb-10">
            <div className="absolute inset-0 bg-orange-500/20 rounded-2xl blur-xl group-hover:bg-orange-500/30 transition-all opacity-0 group-hover:opacity-100"></div>
            <div className="relative bg-white shadow-xl shadow-slate-200/50 rounded-2xl flex items-center p-2 border border-slate-100">
              <Search className="ml-4 text-slate-400 w-6 h-6" />
              <input
                type="text"
                placeholder="Search by title, lyrics..."
                className="w-full px-4 py-3 text-lg bg-transparent border-none focus:ring-0 focus:outline-none placeholder:text-slate-400 text-slate-900"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          </div>
          
          {/* Upcoming Festivals Widget */}
          <div className="max-w-md mx-auto">
            <UpcomingFestivals />
          </div>
        </div>

        {/* Categories */}
        <div className="max-w-7xl mx-auto mb-12 overflow-x-auto pb-4 scrollbar-hide">
          <div className="flex justify-center gap-2 min-w-max px-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCategory === cat.id
                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/30'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-orange-200 hover:bg-orange-50'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="container-custom">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
              {loading ? 'Loading...' : `${bhajans.length} Bhajans`}
              {isOffline && (
                <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-full flex items-center gap-1">
                  <WifiOff size={12} /> Offline Mode
                </span>
              )}
            </h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 bg-white rounded-2xl animate-pulse border border-slate-100"></div>
              ))}
            </div>
          ) : bhajans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bhajans.map((bhajan, index) => (
                <Link
                  key={bhajan._id}
                  href={`/bhajan/${bhajan._id}`}
                  className="card-hover group p-6 flex items-start justify-between"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold uppercase tracking-wide">
                        {bhajan.catId}
                      </span>
                      {bhajan.isAudio && (
                        <span className="p-1 rounded-full bg-orange-100 text-orange-600">
                          <Music size={12} />
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1 truncate group-hover:text-orange-600 transition-colors">
                      {bhajan.title}
                    </h3>
                    <p className="text-slate-500 font-gujarati text-base truncate">
                      {bhajan.title_guj}
                    </p>
                  </div>
                  <div className="mt-1 text-slate-300 group-hover:text-orange-500 transition-colors">
                    <ChevronRight size={24} />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="text-slate-400" size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No bhajans found</h3>
              <p className="text-slate-500">Try adjusting your search or category filter</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
