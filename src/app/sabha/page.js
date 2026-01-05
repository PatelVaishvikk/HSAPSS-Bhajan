'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Users, Home, MapPin, Calendar, Plus, Star } from 'lucide-react';

export default function SabhaList() {
  const [sabhas, setSabhas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSabhas = async () => {
      try {
        const res = await fetch('/api/sabhas');
        const data = await res.json();
        setSabhas(data);
      } catch (error) {
        console.error('Failed to fetch sabhas:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSabhas();
  }, []);

  const handleCreateEvent = async () => {
    const name = prompt('Enter event name (e.g., "My Wedding", "Special Pooja"):');
    if (!name) return;

    try {
      const res = await fetch('/api/sabhas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      
      if (res.ok) {
        const newSabha = await res.json();
        setSabhas([...sabhas, newSabha]);
      } else {
        alert('Failed to create event');
      }
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  const handleDeleteEvent = async (e, id) => {
    e.preventDefault(); // Prevent navigation
    if (!confirm('Are you sure you want to delete this event? All sessions and plans will be lost.')) return;

    try {
      const res = await fetch(`/api/sabhas/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSabhas(sabhas.filter(s => s._id !== id));
      } else {
        alert('Failed to delete event');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const handleEditEvent = async (e, sabha) => {
    e.preventDefault(); // Prevent navigation
    const newName = prompt('Enter new name:', sabha.name);
    if (!newName || newName === sabha.name) return;

    try {
      const res = await fetch(`/api/sabhas/${sabha._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      });
      
      if (res.ok) {
        const updatedSabha = await res.json();
        setSabhas(sabhas.map(s => s._id === sabha._id ? updatedSabha : s));
      } else {
        alert('Failed to update event');
      }
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  const youthSabhas = sabhas.filter(s => s.type === 'YOUTH');
  const parivaarSabhas = sabhas.filter(s => s.type === 'PARIVAAR');
  const userEvents = sabhas.filter(s => s.type === 'USER_EVENT');

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="fixed w-full z-50 glass">
        <div className="container-custom h-16 flex items-center justify-between">
          <Link 
            href="/"
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors font-medium"
          >
            <ArrowLeft size={20} />
            <span>Back to Bhajans</span>
          </Link>
          <button
            onClick={handleCreateEvent}
            className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            <span>Create Custom Event</span>
          </button>
        </div>
      </nav>

      <main className="pt-24 pb-16 container-custom max-w-5xl">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Select Your Sabha</h1>
          <p className="text-lg text-slate-600">Choose a sabha or create your own event to manage bhajans</p>
        </div>

        {loading ? (
          <div className="space-y-8">
             <div className="h-40 bg-white rounded-2xl animate-pulse border border-slate-100"></div>
             <div className="h-40 bg-white rounded-2xl animate-pulse border border-slate-100"></div>
          </div>
        ) : (
          <div className="space-y-12">
            
            {/* Parivaar Sabha */}
            {parivaarSabhas.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <Home className="text-green-600" />
                  <h2 className="text-2xl font-bold text-slate-900">Sunday Parivaar Sabha</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {parivaarSabhas.map((sabha) => (
                    <Link
                      key={sabha._id}
                      href={`/sabha/${sabha._id}`}
                      className="card-hover p-8 flex items-center gap-6 group"
                    >
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-green-100 text-green-600">
                        <Home size={32} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-green-600 transition-colors">
                          {sabha.name}
                        </h3>
                        <p className="text-slate-500 font-medium mt-1">Global Community</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Youth Sabhas */}
            {youthSabhas.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <Users className="text-blue-600" />
                  <h2 className="text-2xl font-bold text-slate-900">Youth Sabhas</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {youthSabhas.map((sabha) => (
                    <Link
                      key={sabha._id}
                      href={`/sabha/${sabha._id}`}
                      className="card-hover p-6 flex items-center gap-4 group"
                    >
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-100 text-blue-600">
                        <MapPin size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {sabha.location}
                        </h3>
                        <p className="text-slate-500 text-sm">Youth Sabha</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* User Events */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Star className="text-purple-600" />
                <h2 className="text-2xl font-bold text-slate-900">My Custom Events</h2>
              </div>
              
              {userEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userEvents.map((sabha) => (
                    <Link
                      key={sabha._id}
                      href={`/sabha/${sabha._id}`}
                      className="card-hover p-6 flex items-center justify-between group relative"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-purple-100 text-purple-600">
                          <Calendar size={24} />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
                            {sabha.name}
                          </h3>
                          <p className="text-slate-500 text-sm">Custom Event</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity absolute top-4 right-4 bg-white p-1 rounded-lg shadow-sm border border-slate-100">
                        <button
                          onClick={(e) => handleEditEvent(e, sabha)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="Edit Name"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                        </button>
                        <button
                          onClick={(e) => handleDeleteEvent(e, sabha._id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete Event"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                        </button>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
                  <p className="text-slate-500 mb-4">No custom events created yet</p>
                  <button
                    onClick={handleCreateEvent}
                    className="text-purple-600 font-bold hover:underline"
                  >
                    Create your first event
                  </button>
                </div>
              )}
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
