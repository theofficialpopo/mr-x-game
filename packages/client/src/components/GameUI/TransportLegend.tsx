import { TRANSPORT_INFO } from '@shared';

interface TransportLegendProps {
  visible: boolean;
}

export function TransportLegend({ visible }: TransportLegendProps) {
  if (!visible) return null;

  return (
    <div className="absolute bottom-4 right-4 bg-black bg-opacity-60 backdrop-blur-sm rounded-lg border border-gray-700 p-3 z-10">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
        Transport Types
      </h3>
      <div className="space-y-1.5">
        {(Object.entries(TRANSPORT_INFO) as [keyof typeof TRANSPORT_INFO, typeof TRANSPORT_INFO[keyof typeof TRANSPORT_INFO]][]).map(
          ([key, info]) => (
            <div key={key} className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded flex items-center justify-center text-sm"
                style={{ backgroundColor: `${info.color}30` }}
              >
                {info.icon}
              </div>
              <div className="flex items-center gap-2 flex-1">
                <span className="text-white text-sm font-medium">{info.name}</span>
                <div
                  className="h-1 flex-1 rounded-full"
                  style={{ backgroundColor: info.color }}
                />
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
