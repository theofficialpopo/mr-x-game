import { TRANSPORT_INFO } from '@shared';
import { Card } from '../../design-system';
import type { TransportType } from '@shared/types/board';

interface TransportLegendProps {
  visible: boolean;
}

export function TransportLegend({ visible }: TransportLegendProps) {
  if (!visible) return null;

  // Transport-specific background colors
  const transportIconBackgrounds: Record<TransportType, string> = {
    taxi: 'bg-[#FFD700] bg-opacity-30',
    bus: 'bg-[#32CD32] bg-opacity-30',
    underground: 'bg-[#FF1493] bg-opacity-30',
    water: 'bg-[#00CED1] bg-opacity-30',
  };

  const transportLineColors: Record<TransportType, string> = {
    taxi: 'bg-[#FFD700]',
    bus: 'bg-[#32CD32]',
    underground: 'bg-[#FF1493]',
    water: 'bg-[#00CED1]',
  };

  return (
    <Card
      variant="default"
      padding="sm"
      className="absolute bottom-4 right-4 z-10"
    >
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
        Transport Types
      </h3>
      <div className="space-y-1.5">
        {(Object.entries(TRANSPORT_INFO) as [TransportType, typeof TRANSPORT_INFO[TransportType]][]).map(
          ([key, info]) => (
            <div key={key} className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded flex items-center justify-center text-sm ${transportIconBackgrounds[key]}`}
              >
                {info.icon}
              </div>
              <div className="flex items-center gap-2 flex-1">
                <span className="text-white text-sm font-medium">{info.name}</span>
                <div
                  className={`h-1 flex-1 rounded-full ${transportLineColors[key]}`}
                />
              </div>
            </div>
          )
        )}
      </div>
    </Card>
  );
}
