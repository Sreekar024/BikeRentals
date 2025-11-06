import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Ride, Reservation } from '../types';
import { Clock, MapPin, DollarSign, Calendar, BookOpen } from 'lucide-react';

export default function RideHistoryPage() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  useEffect(() => {
    fetchRideHistory();
  }, []);

  const fetchRideHistory = async () => {
    try {
      const response = await fetch(`${API_URL}/api/rides/history`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch ride history');
      }

      const data = await response.json();
      setRides(data.rides);
      setReservations(data.reservations || []);
    } catch (error) {
      toast.error('Failed to fetch ride history');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (minutes: number | undefined) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Ride History</h1>

      {rides.length === 0 && reservations.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">No rides or reservations yet. Start your first ride!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Reservations */}
          {reservations.map((reservation) => (
            <div key={`res-${reservation.id}`} className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-400">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="bg-yellow-100 rounded-full p-2 mr-3">
                    <BookOpen className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Reservation</p>
                    <p className="text-sm text-gray-500">
                      {new Date(reservation.startAt).toLocaleDateString()} - {new Date(reservation.startAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-yellow-600">
                    {reservation.status}
                  </p>
                  <p className="text-sm text-gray-500">
                    {reservation.bike.type} Bike
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium">{reservation.bike.dock?.name || 'Unknown'}</p>
                </div>
              </div>
            </div>
          ))}
          
          {/* Rides */}
          {rides.map((ride) => (
            <div key={`ride-${ride.id}`} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="bg-blue-100 rounded-full p-2 mr-3">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Ride Completed</p>
                    <p className="text-sm text-gray-500">
                      {new Date(ride.startedAt).toLocaleDateString()} - {new Date(ride.startedAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-green-600">
                    ₹{ride.cost?.toFixed(2) || '0.00'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {ride.bike.type} Bike
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="font-medium">{formatDuration(ride.duration)}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Start Location</p>
                    <p className="font-medium">{ride.startDock?.name || 'Unknown'}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">End Location</p>
                    <p className="font-medium">{ride.endDock?.name || 'Off-dock'}</p>
                  </div>
                </div>
              </div>

              {ride.distance && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-500">
                      Distance: {ride.distance.toFixed(2)} km
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}