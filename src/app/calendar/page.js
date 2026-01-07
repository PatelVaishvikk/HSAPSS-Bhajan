"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import calendarEvents from '../../data/calendarEvents.json';
import SabhaPlanner from '../../components/SabhaPlanner';

export default function CalendarPage() {
  const [eventsByMonth, setEventsByMonth] = useState({});
  const [selectedYear, setSelectedYear] = useState(2026);
  const [plannerOpen, setPlannerOpen] = useState(false);
  const [selectedFestival, setSelectedFestival] = useState(null);

  useEffect(() => {
    const grouped = calendarEvents.reduce((acc, event) => {
      const parts = event.date.split('-');
      const date = new Date(parts[0], parts[1] - 1, parts[2]);

      if (date.getFullYear() !== selectedYear) return acc;
      
      const monthKey = date.toLocaleString('default', { month: 'long' });
      if (!acc[monthKey]) {
        acc[monthKey] = [];
      }
      acc[monthKey].push(event);
      return acc;
    }, {});

    setEventsByMonth(grouped);
  }, [selectedYear]);

  const openPlanner = (event) => {
    setSelectedFestival(event);
    setPlannerOpen(true);
  };

  const monthsOrder = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 pb-24 md:p-8">
      {/* Header */}
      <header className="max-w-4xl mx-auto mb-10 flex flex-col md:flex-row justify-between items-center gap-4">
        <Link 
          href="/"
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors self-start md:self-auto"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Home
        </Link>
        
        <h1 className="text-3xl md:text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200">
          Swaminarayan Calendar {selectedYear}
        </h1>
        
        <div className="w-24"></div> {/* Spacer for centering */}
      </header>

      <main className="max-w-4xl mx-auto space-y-8">
        {monthsOrder.map(month => {
          const events = eventsByMonth[month];
          if (!events || events.length === 0) return null;

          return (
            <div key={month} className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
              <div className="bg-white/10 px-6 py-3 border-b border-white/10">
                <h2 className="text-xl font-bold text-yellow-300">{month}</h2>
              </div>
              <div className="divide-y divide-white/5">
                {events.map((event, idx) => {
                  // Fix: Manual date parsing
                  const parts = event.date.split('-');
                  const date = new Date(parts[0], parts[1] - 1, parts[2]);
                  
                  const isToday = new Date().toDateString() === date.toDateString();
                  
                  return (
                    <div 
                      key={idx} 
                      className={`p-4 flex flex-col md:flex-row gap-4 md:gap-8 items-start md:items-center hover:bg-white/5 transition-colors ${isToday ? 'bg-yellow-500/10' : ''}`}
                    >
                      <div className={`flex-shrink-0 w-16 h-16 rounded-xl flex flex-col items-center justify-center border ${isToday ? 'bg-yellow-500 border-yellow-400 text-black' : 'bg-white/5 border-white/10 text-white'}`}>
                        <span className="text-xs uppercase font-bold opacity-80">
                          {date.toLocaleString('default', { weekday: 'short' })}
                        </span>
                        <span className="text-2xl font-bold">
                          {date.getDate()}
                        </span>
                      </div>
                      
                      <div className="flex-grow pt-1">
                        <h3 className={`text-lg font-semibold ${isToday ? 'text-yellow-300' : 'text-white'}`}>
                          {event.title}
                        </h3>
                        {event.description && (
                          <p className="text-white/60 mt-1 text-sm md:text-base">
                            {event.description}
                          </p>
                        )}
                        {isToday && (
                          <span className="inline-block mt-2 px-2 py-0.5 bg-yellow-500 text-black text-xs font-bold rounded-full">
                            TODAY
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => openPlanner(event)}
                        className="flex-shrink-0 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 border border-white/5 whitespace-nowrap"
                      >
                        <Plus size={16} /> <span className="hidden md:inline">Plan Sabha</span><span className="md:hidden">Plan</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </main>

      {/* Sabha Planner Modal */}
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
