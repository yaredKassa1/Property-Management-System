'use client';

import React, { useState } from 'react';
import { Button } from './Button';

interface DateRangePickerProps {
  onApply: (startDate: string, endDate: string) => void;
  onReset: () => void;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({ onApply, onReset }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleApply = () => {
    if (startDate && endDate) {
      if (new Date(startDate) > new Date(endDate)) {
        alert('Start date cannot be after end date');
        return;
      }
      onApply(startDate, endDate);
      setIsOpen(false);
    }
  };

  const handleReset = () => {
    setStartDate('');
    setEndDate('');
    onReset();
    setIsOpen(false);
  };

  const setQuickRange = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  return (
    <div className="relative z-50">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        className="flex items-center gap-2"
      >
        📅 Date Range
        {(startDate || endDate) && (
          <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
            Filtered
          </span>
        )}
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-[999]"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed top-32 right-4 w-80 bg-white rounded-lg shadow-2xl border border-gray-200 z-[1000]">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900">Filter by Date Range</h3>
            </div>

            <div className="p-4 space-y-4">
              {/* Quick Range Buttons */}
              <div>
                <p className="text-xs font-medium text-gray-600 mb-2">Quick Select</p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setQuickRange(7)}
                    className="px-3 py-1.5 text-xs font-medium border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Last 7 days
                  </button>
                  <button
                    onClick={() => setQuickRange(30)}
                    className="px-3 py-1.5 text-xs font-medium border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Last 30 days
                  </button>
                  <button
                    onClick={() => setQuickRange(90)}
                    className="px-3 py-1.5 text-xs font-medium border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Last 90 days
                  </button>
                </div>
              </div>

              {/* Date Inputs */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleApply}
                  disabled={!startDate || !endDate}
                  className="flex-1"
                >
                  Apply
                </Button>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="flex-1"
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
