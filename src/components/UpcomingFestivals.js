import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, X, Plus } from 'lucide-react';
import calendarEvents from '../data/calendarEvents.json';
import SabhaPlanner from './SabhaPlanner';

export default function UpcomingFestivals() {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [plannerOpen, setPlannerOpen] = useState(false);
  const [selectedFestival, setSelectedFestival] = useState(null);

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const futureEvents = calendarEvents
      .filter(event => {
        // Appending time to force local timezone parsing or avoid UTC shift
        const eventDate = new Date(event.date + 'T12:00:00'); 
        return eventDate >= today;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 3);

    setUpcomingEvents(futureEvents);
  }, []);

  const openPlanner = (event) => {
    setSelectedFestival(event);
    setPlannerOpen(true);
  };

  if (upcomingEvents.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-md mx-auto transition-all">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-center gap-2 w-full bg-white hover:bg-slate-50 text-slate-700 font-medium py-3 px-4 rounded-xl border border-slate-200 shadow-sm transition-all ${isOpen ? 'ring-2 ring-orange-500/20 border-orange-200' : 'hover:shadow-md'}`}
      >
        <Calendar size={18} className={isOpen ? "text-orange-600" : "text-slate-400"} />
        <span className={isOpen ? "text-slate-900" : "text-slate-600"}>
          {isOpen ? 'Hide Upcoming Festivals' : 'View Upcoming Festivals'}
        </span>
        {isOpen ? <X size={16} className="ml-auto text-slate-400" /> : <Plus size={16} className="ml-auto text-slate-400 rotate-45" />} 
      </button>

      {/* Inline Flexible List */}
      {isOpen && (
        <div className="mt-3 bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden animate-in slide-in-from-top-2 fade-in duration-300">
            <div className="divide-y divide-slate-100">
              {upcomingEvents.map((event, index) => {
                // Fix: Parse date securely
                const parts = event.date.split('-');
                const eventDate = new Date(parts[0], parts[1] - 1, parts[2]); // Years, Month(0-idx), Day
                
                const month = eventDate.toLocaleString('default', { month: 'short' });
                const day = eventDate.getDate();
                const weekday = eventDate.toLocaleString('default', { weekday: 'short' });
                
                return (
                  <div key={index} className="px-5 py-4 hover:bg-slate-50 transition-colors flex items-center gap-4 group">
                    <div className="flex-shrink-0 w-12 text-center">
                      <div className="text-xs font-bold text-orange-600 uppercase tracking-wide">{month}</div>
                      <div className="text-2xl font-bold text-slate-900 leading-none">{day}</div>
                    </div>
                    
                    <div className="flex-grow min-w-0">
                      <div className="text-xs font-medium text-slate-400 mb-0.5">{weekday}</div>
                      <h3 className="font-semibold text-slate-900 line-clamp-1">{event.title}</h3>
                      <p className="text-sm text-slate-500 line-clamp-1">{event.description}</p>
                    </div>

                    <button 
                      onClick={() => openPlanner(event)}
                      className="flex-shrink-0 p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors border border-transparent hover:border-orange-100"
                      title="Plan Sabha"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-center">
              <Link 
                href="/calendar" 
                className="text-xs font-bold text-orange-600 hover:text-orange-700 uppercase tracking-wider py-2 px-4 hover:bg-orange-50 rounded-lg transition-colors"
              >
                View Full Calendar
              </Link>
            </div>
        </div>
      )}

      {/* Sabha Planner Modal (Still kept as modal for complex interaction) */}
      {plannerOpen && selectedFestival && (
        <SabhaPlanner 
          festivalDate={selectedFestival.date}
          festivalName={selectedFestival.title}
          onClose={() => setPlannerOpen(false)}
        />
      )}
    </div>
  );
}
