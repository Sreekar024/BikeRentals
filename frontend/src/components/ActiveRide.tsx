import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useBikeStore } from '../store/bikeStore';
import { Ride } from '../types';
import { Clock, DollarSign, MapPin, Square } from 'lucide-react';

interface ActiveRideProps {
  ride: Ride;
}

export default function ActiveRide({ ride }: ActiveRideProps) {
  const [duration, setDuration] = useState(0);
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const { sendHeartbeat, endRide } = useBikeStore();

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const start = new Date(ride.startedAt).getTime();
      const minutes = Math.floor((now - start) / 60000);
      setDuration(minutes);

      // Get current location and send heartbeat
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            setCurrentLocation({ lat: latitude, lng: longitude });
            
            try {
              const result = await sendHeartbeat(ride.id, latitude, longitude);
              setEstimatedCost(result.estimatedCost);
            } catch (error) {
              console.error('Heartbeat failed:', error);
            }
          },
          (error) => console.error('Location error:', error)
        );
      }
    }, 10000); // Every 10 seconds

    return () => clearInterval(interval);
  }, [ride.id, ride.startedAt, sendHeartbeat]);

  const handleEndRide = async () => {
    if (!currentLocation) {
      toast.error('Unable to get current location');
      return;
    }

    try {
      await endRide(ride.id, undefined, currentLocation.lat, currentLocation.lng);
      toast.success('Ride ended successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to end ride');
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Active Ride</h2>
          <p className="text-gray-600">Bike ID: {ride.bike.id.slice(-8)}</p>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-blue-600 mr-2" />
                <span className="font-medium">Duration</span>
              </div>
              <span className="text-xl font-bold text-blue-600">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                <span className="font-medium">Estimated Cost</span>
              </div>
              <span className="text-xl font-bold text-green-600">
                ₹{estimatedCost.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <MapPin className="h-5 w-5 text-gray-600 mr-2" />
              <span className="font-medium">Start Location</span>
            </div>
            <p className="text-gray-600 ml-7">
              {ride.startDock?.name || 'Unknown'}
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Remember:</strong> Return the bike to a designated dock to avoid 
              the ₹100 off-dock penalty.
            </p>
          </div>

          <button
            onClick={handleEndRide}
            className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 flex items-center justify-center"
          >
            <Square className="h-5 w-5 mr-2" />
            End Ride
          </button>
        </div>
      </div>
    </div>
  );
}