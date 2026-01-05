'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Plus, ChevronRight, Clock, Trash2 } from 'lucide-react';

export default function SabhaSessions({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sabhaName, setSabhaName] = useState('');

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        // Fetch sabha details (we can optimize this later to be one call)
        const sabhaRes = await fetch(`/api/sabhas/${id}`);
        const sabha = await sabhaRes.json();
        if (sabha) setSabhaName(sabha.name);

        const res = await fetch(`/api/sabhas/${id}/sessions`);
        const data = await res.json();
        setSessions(data);
      } catch (error) {
        console.error('Failed to fetch sessions:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, [id]);

  const handleCreateSession = async () => {
    const date = prompt('Enter session date (YYYY-MM-DD):', new Date().toISOString().split('T')[0]);
    if (!date) return;

    try {
      const res = await fetch(`/api/sabhas/${id}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date }),
      });
      
      if (res.ok) {
        const newSession = await res.json();
        router.push(`/sabha/session/${newSession._id}`);
      } else {
        alert('Failed to create session');
      }
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const handleDeleteSession = async (e, sessionId) => {
    e.preventDefault(); // Prevent navigation
    if (!confirm('Are you sure you want to delete this session?')) return;

    try {
      const res = await fetch(`/api/sessions/${sessionId}`, { method: 'DELETE' });
      if (res.ok) {
        setSessions(sessions.filter(s => s._id !== sessionId));
      } else {
        alert('Failed to delete session');
      }
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="fixed w-full z-50 glass">
        <div className="container-custom h-16 flex items-center justify-between">
          <Link 
            href="/sabha"
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors font-medium"
          >
            <ArrowLeft size={20} />
            <span>Back to Sabhas</span>
          </Link>
          <button
            onClick={handleCreateSession}
            className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            <span>New Session</span>
          </button>
        </div>
      </nav>

      <main className="pt-24 pb-16 container-custom max-w-4xl">
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">{sabhaName}</h1>
          <p className="text-slate-600">Manage upcoming and past sessions</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-white rounded-2xl animate-pulse border border-slate-100"></div>
            ))}
          </div>
        ) : sessions.length > 0 ? (
          <div className="space-y-4">
            {sessions.map((session) => (
              <Link
                key={session._id}
                href={`/sabha/session/${session._id}`}
                className="card-hover p-6 flex items-center justify-between group relative"
              >
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-orange-50 rounded-2xl flex flex-col items-center justify-center text-orange-700 border border-orange-100">
                    <span className="text-xs font-bold uppercase">{new Date(session.date).toLocaleString('default', { month: 'short' })}</span>
                    <span className="text-2xl font-bold">{new Date(session.date).getDate()}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">
                      {new Date(session.date).toLocaleDateString('default', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {session.status}
                      </span>
                      <span>•</span>
                      <span>{session.bhajans.length} Bhajans</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <button
                    onClick={(e) => handleDeleteSession(e, session._id)}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors z-10"
                    title="Delete Session"
                  >
                    <Trash2 size={20} />
                  </button>
                  <div className="text-slate-300 group-hover:text-orange-500 transition-colors">
                    <ChevronRight size={24} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="text-slate-400" size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No sessions planned</h3>
            <p className="text-slate-500 mb-6">Create a new session to start planning bhajans</p>
            <button
              onClick={handleCreateSession}
              className="bg-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-700 transition-colors inline-flex items-center gap-2"
            >
              <Plus size={20} />
              Create First Session
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
