import { useState } from 'react';

export default function TrainSearch({ pnrOrTrain, onPnrChange, onSearch, train, stations, onSelectStation, currentStation }) {
  const [journeyDate, setJourneyDate] = useState('');

  const handleSearch = () => {
    onSearch(journeyDate);
  };

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-3 md:p-5 shadow-md mb-6">
      {/* Search Bar */}
      <div className="space-y-2 md:space-y-3 mb-4 md:mb-6">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={pnrOrTrain}
            onChange={onPnrChange}
            placeholder="Enter train number"
            className="flex-1 px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary outline-none text-sm"
          />
          <input
            type="date"
            value={journeyDate}
            onChange={(e) => setJourneyDate(e.target.value)}
            className="px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary outline-none text-sm"
          />
          <button
            onClick={handleSearch}
            className="bg-secondary hover:bg-yellow-500 text-white px-4 md:px-6 py-2 md:py-2.5 rounded-lg font-semibold transition shadow-md w-full sm:w-auto"
          >
            Search
          </button>
        </div>
        <p className="text-xs text-gray-600">Enter train number and date to see all stations on this route</p>
      </div>

      {train && (
        <div className="border-2 border-secondary rounded-lg bg-gradient-to-b from-yellow-50 to-white p-3 md:p-5">
          {/* Train Header */}
          <div className="mb-4 md:mb-5">
            <h3 className="text-base md:text-lg font-bold text-gray-800">
              🚂 {train.trainName}
            </h3>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-xs md:text-sm text-gray-700">
              <span className="font-semibold">
                <span className="block sm:inline">{train.source}</span>
                <span className="hidden sm:inline"> → </span>
                <span className="block sm:inline mt-1 sm:mt-0">{train.destination}</span>
              </span>
              {journeyDate && (
                <span className="text-gray-600">
                  📅 {new Date(journeyDate).toLocaleDateString('en-IN', { 
                    weekday: 'short', 
                    day: '2-digit', 
                    month: 'short' 
                  })}
                </span>
              )}
            </div>
            {currentStation && (
              <p className="text-xs md:text-sm text-green-700 font-semibold mt-3 bg-green-50 px-2 md:px-3 py-2 rounded-lg inline-block max-w-full">
                📍 Currently at: <span className="text-green-800 break-words">{currentStation}</span>
              </p>
            )}
          </div>
          
          {/* Stations List */}
          <div className="border-t border-gray-300 pt-3 md:pt-4">
            <p className="text-xs font-bold text-gray-700 mb-2 md:mb-3 uppercase tracking-wide">Select your boarding station</p>
            <div className="space-y-2 max-h-[400px] md:max-h-[500px] overflow-y-auto pr-1 md:pr-2">
              {stations.map((station, idx) => {
                const isDeparted = station.isDeparted;
                const isCurrent = station.isCurrentStation;
                
                return (
                  <button
                    key={idx}
                    onClick={() => !isDeparted && onSelectStation(station)}
                    disabled={isDeparted}
                    className={`w-full p-2 md:p-3 rounded-lg border-2 text-left transition duration-200 ${
                      isDeparted
                        ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                        : isCurrent
                        ? 'bg-green-100 border-green-500 shadow-md hover:bg-green-150'
                        : 'bg-white border-gray-300 hover:bg-yellow-50 hover:border-secondary'
                    }`}
                    title={isDeparted ? '⛔ Train has already departed' : '✓ Available for boarding'}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-3">
                      {/* Station Name & Time */}
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold text-xs md:text-sm truncate ${
                          isDeparted ? 'text-gray-400' : isCurrent ? 'text-green-800' : 'text-gray-800'
                        }`}>
                          {station.name}
                          {isCurrent && ' 🟢'}
                          {isDeparted && ' ✓'}
                        </p>
                        <p className={`text-xs mt-1 ${isDeparted ? 'text-gray-400' : 'text-gray-600'}`}>
                          ⏰ {station.timing}
                        </p>
                      </div>

                      {/* Halt & Distance */}
                      <div className="flex items-center justify-between sm:flex-col sm:text-right sm:whitespace-nowrap gap-2 sm:gap-0 text-xs md:text-sm">
                        <span className={`font-semibold ${isDeparted ? 'text-gray-400' : 'text-secondary'}`}>
                          {station.halt}
                        </span>
                        {station.distance !== '-' && (
                          <span className="text-gray-500">
                            {station.distance}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



