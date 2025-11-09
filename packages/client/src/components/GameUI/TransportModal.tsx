import type { TransportType } from '@shared/types/board';
import { useGameStore } from '../../store/gameStore';
import { TRANSPORT_INFO } from '@shared';
import { Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter, Button, Icons } from '../../design-system';

interface TransportModalProps {
  stationId: number;
  availableTransports: TransportType[];
  onClose: () => void;
}

export function TransportModal({ stationId, availableTransports, onClose }: TransportModalProps) {
  const makeMove = useGameStore((state) => state.makeMove);
  const currentPlayer = useGameStore((state) => state.getCurrentPlayer());

  if (!currentPlayer) return null;

  const handleTransportSelect = (transport: TransportType) => {
    makeMove(stationId, transport);
    onClose();
  };

  // Transport-specific background colors using Tailwind arbitrary values
  const transportBackgrounds: Record<TransportType, string> = {
    taxi: 'bg-[#FFD700] bg-opacity-20',
    bus: 'bg-[#32CD32] bg-opacity-20',
    underground: 'bg-[#FF1493] bg-opacity-20',
    water: 'bg-[#00CED1] bg-opacity-20',
  };

  return (
    <Modal isOpen={true} onClose={onClose} size="md">
      <ModalHeader>
        <div className="flex items-center justify-between">
          <div>
            <ModalTitle>Select Transport</ModalTitle>
            <p className="text-sm text-gray-400 mt-1">
              Moving to Station {stationId}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <Icons.close size={24} />
          </button>
        </div>
      </ModalHeader>

      <ModalBody className="space-y-3">
        {availableTransports.map((transport) => {
          const info = TRANSPORT_INFO[transport];
          const ticketCount = currentPlayer.tickets[transport];

          return (
            <button
              key={transport}
              onClick={() => handleTransportSelect(transport)}
              className="w-full p-4 rounded-lg border border-gray-700 hover:border-gray-500 bg-gray-800 bg-opacity-50 hover:bg-opacity-70 transition flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-14 h-14 rounded-lg flex items-center justify-center text-3xl ${transportBackgrounds[transport]}`}
                >
                  {info.icon}
                </div>
                <div className="text-left">
                  <div className="font-bold text-white text-lg group-hover:scale-105 transition-transform">
                    {info.name}
                  </div>
                  <div className="text-sm text-gray-400">
                    {ticketCount > 99 ? 'Unlimited' : `${ticketCount} tickets remaining`}
                  </div>
                </div>
              </div>
              <Icons.chevronRight
                size={24}
                className="text-gray-500 group-hover:text-white transition"
              />
            </button>
          );
        })}
      </ModalBody>

      <ModalFooter>
        <Button
          onClick={onClose}
          variant="neutral"
          size="lg"
          fullWidth
        >
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
}
