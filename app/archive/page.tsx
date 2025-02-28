'use client';

import { getArchiveData } from '@/utils/archiveManager';
import { useArchiveRefresh } from '@/hooks/useArchiveRefresh';
import Link from 'next/link';
import { format } from 'date-fns';

export default function ArchivePage() {
  useArchiveRefresh();
  const archive = getArchiveData();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back link with left padding */}
      <div className="pl-4 py-6">
        <div className="max-w-md mx-auto">
          <Link 
            href="/" 
            className="text-gray-600 hover:text-gray-900 text-sm inline-flex items-center"
          >
            ← Back to Today's Challenge
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-md mx-auto px-4">
        <div className="space-y-4">
          {archive.map((entry) => (
            <div 
              key={entry.date}
              className="bg-white rounded-lg p-4 flex justify-between items-start"
            >
              <div>
                <p className="text-gray-600 text-sm mb-1">
                  {format(new Date(entry.date), 'MMMM d, yyyy')}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {entry.year}
                </p>
                {entry.date === format(new Date(), 'yyyy-MM-dd') && (
                  <span className="inline-block bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded mt-1">
                    Today
                  </span>
                )}
              </div>
              <Link
                href={`/play?date=${encodeURIComponent(entry.date)}&year=${entry.year}`}
                className="bg-[#2D0C0C] text-white py-2 px-4 rounded-full text-sm hover:bg-[#3D1C1C] transition-colors"
              >
                Play
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 