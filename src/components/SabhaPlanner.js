"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Calendar, ArrowRight, Loader } from 'lucide-react';

export default function SabhaPlanner({ festivalDate, festivalName, onClose }) {
  const router = useRouter();
  const [sabhas, setSabhas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSabha, setSelectedSabha] = useState(null);
  const [suggestedDate, setSuggestedDate] = useState('');

  // Fetch Sabhas on mount
  useEffect(() => {
    const fetchSabhas = async () => {
      try {
        const res = await fetch('/api/sabhas');
        const data = await res.json();
        const parivaarSabhas = data.filter(s => s.type === 'PARIVAAR');
        setSabhas(parivaarSabhas);
      } catch (error) {
        console.error('Failed to fetch sabhas:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSabhas();
  }, []);

  // Calculate nearest Sunday when festivalDate changes
  useEffect(() => {
    if (festivalDate) {
      const parts = festivalDate.split('-');
      // Use Y-1 for month index
      const date = new Date(parts[0], parts[1] - 1, parts[2]);
      
      const day = date.getDay(); // 0 is Sunday
      
      let targetDate = new Date(date);
      if (day > 3) {
         // Closer to next Sunday
         targetDate.setDate(date.getDate() + (7 - day));
      } else {
         // Closer to previous Sunday (or is Sunday)
         targetDate.setDate(date.getDate() - day);
      }
      
      // Format back to YYYY-MM-DD local
      const year = targetDate.getFullYear();
      const month = String(targetDate.getMonth() + 1).padStart(2, '0');
      const d = String(targetDate.getDate()).padStart(2, '0');
      
      setSuggestedDate(`${year}-${month}-${d}`);
    }
  }, [festivalDate]);

  const handlePlan = () => {
    if (!selectedSabha || !suggestedDate) return;
    
    // Redirect to the sabha page with query params to trigger creation
    router.push(`/sabha/${selectedSabha._id}?action=plan&date=${suggestedDate}&festival=${encodeURIComponent(festivalName)}`);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden p-6 space-y-6 border border-white/20">
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-1">Plan Festival Sabha</h2>
          <p className="text-slate-500 text-sm">
            For <span className="font-semibold text-orange-600">{festivalName}</span>
          </p>
        </div>

        <div className="space-y-4">
          {/* Step 1: Select Sabha */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Select Parivaar Sabha</label>
            {loading ? (
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Loader className="animate-spin" size={16} /> Loading sabhas...
              </div>
            ) : sabhas.length > 0 ? (
              <div className="grid gap-2">
                {sabhas.map(sabha => (
                  <button
                    key={sabha._id}
                    onClick={() => setSelectedSabha(sabha)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                      selectedSabha?._id === sabha._id 
                        ? 'border-orange-500 bg-orange-50 text-orange-700' 
                        : 'border-slate-200 hover:border-orange-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="font-medium">{sabha.name}</span>
                    {selectedSabha?._id === sabha._id && <div className="w-2 h-2 rounded-full bg-orange-500"></div>}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-red-500">No Parivaar Sabhas found. Please create one starting with 'Parivaar' first.</p>
            )}
          </div>

          {/* Step 2: Confirm Date */}
          {selectedSabha && (
            <div className="animate-in slide-in-from-top-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Suggested Date (Nearest Sunday)</label>
              <input 
                type="date" 
                value={suggestedDate}
                onChange={(e) => setSuggestedDate(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-900"
              />
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button 
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handlePlan}
            disabled={!selectedSabha || !suggestedDate}
            className="flex-1 py-3 px-4 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            Plan Sabha <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
