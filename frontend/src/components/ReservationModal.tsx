import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useBikeStore } from '../store/bikeStore';
import { X } from 'lucide-react';

interface ReservationModalProps {
  bikeId: string;
  onClose: () => void;
}

export default function ReservationModal({ bikeId, onClose }: ReservationModalProps) {
  const [duration, setDuration] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const { reserveBike } = useBikeStore();

  const handleReserve = async () => {
    setIsLoading(true);
    try {
      await reserveBike(bikeId, duration);
      toast.success('Bike reserved successfully!');
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Reservation failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Reserve Bike</h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reservation Duration
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
              <option value={120}>2 hours</option>
              <option value={240}>4 hours</option>
            </select>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <p className="text-sm text-yellow-800">
              ₹50 will be held from your wallet as security deposit. 
              Unused amount will be refunded after the ride.
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleReserve}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Reserving...' : 'Reserve'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}