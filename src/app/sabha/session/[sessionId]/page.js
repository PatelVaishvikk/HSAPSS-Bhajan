'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Search, Trash2, GripVertical, X, Save, Play } from 'lucide-react';
import { Reorder } from 'framer-motion';

export default function SessionDetails({ params }) {
  const { sessionId } = use(params);
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Fetch session details
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

  useEffect(() => {
    fetchSession();
  }, [sessionId]);

  // Search bhajans
  useEffect(() => {
    const searchBhajans = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }
      setSearchLoading(true);
      try {
        const res = await fetch(`/api/bhajans?q=${searchQuery}`);
        const data = await res.json();
        setSearchResults(data);
      } catch (error) {
        console.error('Error searching bhajans:', error);
      } finally {
        setSearchLoading(false);
      }
    };

    const debounce = setTimeout(searchBhajans, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  // Add bhajan to session
  const addBhajanToSession = async (bhajan) => {
    if (!session) return;
    
    const newBhajans = [
      ...session.bhajans,
      {
        bhajanId: { _id: bhajan._id, title: bhajan.title, title_guj: bhajan.title_guj },
        order: session.bhajans.length + 1,
        note: ''
      }
    ];

    // Optimistic update
    setSession({ ...session, bhajans: newBhajans });
    setIsSearchOpen(false);
    setSearchQuery('');

    // Persist
    try {
      await fetch(`/api/sessions/${sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          bhajans: newBhajans.map(b => ({
            bhajanId: b.bhajanId._id,
            order: b.order,
            note: b.note
          }))
        }),
      });
      fetchSession(); // Refresh to get proper populated data
    } catch (error) {
      console.error('Error updating session:', error);
      fetchSession(); // Revert on error
    }
  };

  // Remove bhajan
  const removeBhajan = async (index) => {
    if (!session) return;
    
    const newBhajans = session.bhajans.filter((_, i) => i !== index);
    
    setSession({ ...session, bhajans: newBhajans });

    try {
      await fetch(`/api/sessions/${sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          bhajans: newBhajans.map((b, i) => ({
            bhajanId: b.bhajanId._id,
            order: i + 1,
            note: b.note
          }))
        }),
      });
    } catch (error) {
      console.error('Error removing bhajan:', error);
      fetchSession();
    }
  };

  const handleReorder = async (newBhajans) => {
    // Update local state immediately for smooth UI
    setSession({ ...session, bhajans: newBhajans });

    try {
      await fetch(`/api/sessions/${sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          bhajans: newBhajans.map((b, i) => ({
            bhajanId: b.bhajanId._id,
            order: i + 1,
            note: b.note
          }))
        }),
      });
    } catch (error) {
      console.error('Error reordering:', error);
      // fetchSession(); // Optional: revert on error
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!session) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="fixed w-full z-50 glass">
        <div className="container-custom h-16 flex items-center justify-between">
          <Link 
            href={`/sabha/${session.sabhaId}`}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors font-medium"
          >
            <ArrowLeft size={20} />
            <span>Back to Sessions</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href={`/sabha/session/${sessionId}/present`}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors flex items-center gap-2 shadow-lg shadow-orange-500/20"
            >
              <Play size={16} fill="currentColor" />
              <span>Start Singing</span>
            </Link>
            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-bold uppercase hidden sm:inline-block">
              {session.status}
            </span>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-32 container-custom max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
            {new Date(session.date).toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' })}
          </h1>
          <p className="text-slate-600">Plan the flow of bhajans for this sabha</p>
        </div>

        {/* Bhajan List */}
        <div className="space-y-4 mb-8">
          {session.bhajans.length > 0 ? (
            <Reorder.Group axis="y" values={session.bhajans} onReorder={handleReorder} className="space-y-4">
              {session.bhajans.map((item) => (
                <Reorder.Item key={item.bhajanId._id} value={item}>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 group cursor-grab active:cursor-grabbing">
                    <div className="text-slate-400">
                      <GripVertical size={20} />
                    </div>
                    <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold text-sm">
                      {session.bhajans.indexOf(item) + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 truncate">{item.bhajanId.title}</h3>
                      <p className="text-sm text-slate-500 font-gujarati truncate">{item.bhajanId.title_guj}</p>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent drag start
                        removeBhajan(session.bhajans.indexOf(item));
                      }}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
              <p className="text-slate-500 mb-4">No bhajans added yet</p>
              <button
                onClick={() => setIsSearchOpen(true)}
                className="text-orange-600 font-bold hover:underline"
              >
                Add your first bhajan
              </button>
            </div>
          )}
        </div>

        {/* Add Button */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Add Bhajan
        </button>
      </main>

      {/* Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 sm:p-6">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-100 flex items-center gap-3">
              <Search className="text-slate-400" />
              <input
                type="text"
                placeholder="Search bhajans..."
                className="flex-1 text-lg outline-none placeholder:text-slate-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <button 
                onClick={() => setIsSearchOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-500"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2">
              {searchLoading ? (
                <div className="p-8 text-center text-slate-500">Searching...</div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-2">
                  {searchResults.map((bhajan) => (
                    <button
                      key={bhajan._id}
                      onClick={() => addBhajanToSession(bhajan)}
                      className="w-full text-left p-4 hover:bg-orange-50 rounded-xl transition-colors flex items-center justify-between group"
                    >
                      <div>
                        <h4 className="font-bold text-slate-900">{bhajan.title}</h4>
                        <p className="text-sm text-slate-500 font-gujarati">{bhajan.title_guj}</p>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 text-orange-600 font-bold text-sm bg-orange-100 px-3 py-1 rounded-full">
                        Add
                      </div>
                    </button>
                  ))}
                </div>
              ) : searchQuery ? (
                <div className="p-8 text-center text-slate-500">No bhajans found</div>
              ) : (
                <div className="p-8 text-center text-slate-400">Type to search...</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
