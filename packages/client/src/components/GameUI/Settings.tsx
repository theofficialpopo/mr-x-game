import { useState } from 'react';

interface SettingsProps {
  viewMode: 'svg' | 'mapbox';
  onViewModeChange: (mode: 'svg' | 'mapbox') => void;
  showLegend: boolean;
  onToggleLegend: () => void;
}

export function Settings({ viewMode, onViewModeChange, showLegend, onToggleLegend }: SettingsProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="absolute top-4 right-4 z-20">
      {/* Settings Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 bg-black bg-opacity-80 backdrop-blur-sm rounded-lg border border-gray-700 hover:border-cyan-500 transition-all flex items-center justify-center group"
        title="Settings"
      >
        <svg
          className={`w-6 h-6 text-gray-400 group-hover:text-cyan-500 transition-all ${
            isOpen ? 'rotate-90' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>

      {/* Settings Dropdown */}
      {isOpen && (
        <div className="absolute top-14 right-0 w-64 bg-black bg-opacity-90 backdrop-blur-sm rounded-lg border border-gray-700 p-4 shadow-xl">
          <h3 className="font-bold text-white mb-3 text-sm">Map View</h3>
          <div className="space-y-2">
            <button
              onClick={() => {
                onViewModeChange('mapbox');
                setIsOpen(false);
              }}
              className={`w-full py-3 px-4 rounded-lg text-sm font-semibold transition flex items-center gap-3 ${
                viewMode === 'mapbox'
                  ? 'bg-cyan-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <span className="text-xl">🗺️</span>
              <div className="flex-1 text-left">
                <div className="font-semibold">Mapbox</div>
                <div className="text-xs opacity-75">Real London map</div>
              </div>
              {viewMode === 'mapbox' && (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
            <button
              onClick={() => {
                onViewModeChange('svg');
                setIsOpen(false);
              }}
              className={`w-full py-3 px-4 rounded-lg text-sm font-semibold transition flex items-center gap-3 ${
                viewMode === 'svg'
                  ? 'bg-cyan-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <span className="text-xl">📊</span>
              <div className="flex-1 text-left">
                <div className="font-semibold">SVG</div>
                <div className="text-xs opacity-75">Classic board view</div>
              </div>
              {viewMode === 'svg' && (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Transport Legend Toggle */}
          <div className="mt-4 pt-4 border-t border-gray-700">
            <button
              onClick={() => {
                onToggleLegend();
              }}
              className="w-full py-3 px-4 rounded-lg text-sm font-semibold transition flex items-center gap-3 bg-gray-800 text-gray-300 hover:bg-gray-700"
            >
              <span className="text-xl">🎨</span>
              <div className="flex-1 text-left">
                <div className="font-semibold">Transport Legend</div>
                <div className="text-xs opacity-75">{showLegend ? 'Hide' : 'Show'} legend</div>
              </div>
              <div
                className={`w-10 h-5 rounded-full transition ${
                  showLegend ? 'bg-cyan-500' : 'bg-gray-600'
                } relative`}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                    showLegend ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
