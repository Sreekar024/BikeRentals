import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import { useBikeStore } from '../store/bikeStore';
import { useAuthStore } from '../store/authStore';
import { Bike, Battery, MapPin } from 'lucide-react';
import ReservationModal from '../components/ReservationModal';
import ActiveRide from '../components/ActiveRide';

const bikeIcon = new Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/2972/2972185.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { bikes, currentReservation, currentRide, fetchBikes, fetchCurrentReservation } = useBikeStore();
  const [selectedBike, setSelectedBike] = useState<string | null>(null);
  const [showReservationModal, setShowReservationModal] = useState(false);

  useEffect(() => {
    fetchBikes();
    fetchCurrentReservation();
  }, [fetchBikes, fetchCurrentReservation]);

  if (user?.kycStatus !== 'APPROVED') {
    return (
      <div className="text-center py-12">
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-6 max-w-md mx-auto">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">KYC Verification Pending</h3>
          <p className="text-yellow-700">
            Your account is pending verification. Please contact admin to approve your KYC.
          </p>
        </div>
      </div>
    );
  }

  if (currentRide) {
    return <ActiveRide ride={currentRide} />;
  }

  const handleReserveBike = (bikeId: string) => {
    setSelectedBike(bikeId);
    setShowReservationModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Available Bikes</h1>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            Available
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
            E-Bike
          </div>
        </div>
      </div>

      {currentReservation && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">Active Reservation</h3>
          <p className="text-blue-700">
            Bike reserved until {new Date(currentReservation.expiresAt).toLocaleTimeString()}
          </p>
          <p className="text-sm text-blue-600 mt-1">
            Location: {currentReservation.bike.dock?.name}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow h-96">
            <MapContainer
              center={[30.7687902, 76.5753719]}
              zoom={16}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {bikes.map((bike) => (
                bike.lat && bike.lng && (
                  <Marker
                    key={bike.id}
                    position={[bike.lat, bike.lng]}
                    icon={bikeIcon}
                  >
                    <Popup>
                      <div className="p-2">
                        <h4 className="font-medium">{bike.type} Bike</h4>
                        <p className="text-sm text-gray-600">
                          {bike.dock?.name}
                        </p>
                        {bike.type === 'E_BIKE' && (
                          <p className="text-sm">
                            Battery: {bike.batteryPct}%
                          </p>
                        )}
                        <button
                          onClick={() => handleReserveBike(bike.id)}
                          className="mt-2 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                        >
                          Reserve
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                )
              ))}
            </MapContainer>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-medium text-gray-900 mb-3">Nearby Bikes</h3>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {bikes.slice(0, 10).map((bike) => (
                <div key={bike.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Bike className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium">
                        {bike.type} Bike
                      </span>
                    </div>
                    {bike.type === 'E_BIKE' && (
                      <div className="flex items-center text-xs text-gray-500">
                        <Battery className="h-3 w-3 mr-1" />
                        {bike.batteryPct}%
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center text-xs text-gray-500 mb-2">
                    <MapPin className="h-3 w-3 mr-1" />
                    {bike.dock?.name}
                  </div>

                  <button
                    onClick={() => handleReserveBike(bike.id)}
                    className="w-full bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700"
                  >
                    Reserve Bike
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-medium text-gray-900 mb-3">Pricing</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Unlock Fee:</span>
                <span>₹10</span>
              </div>
              <div className="flex justify-between">
                <span>Per Minute:</span>
                <span>₹2</span>
              </div>
              <div className="flex justify-between">
                <span>Per KM:</span>
                <span>₹5</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>Off-dock Penalty:</span>
                <span>₹100</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showReservationModal && selectedBike && (
        <ReservationModal
          bikeId={selectedBike}
          onClose={() => {
            setShowReservationModal(false);
            setSelectedBike(null);
          }}
        />
      )}
    </div>
  );
}