import { useAuthStore } from '../../store/authStore';
import { User, Mail, Phone, MapPin, Shield, Calendar } from 'lucide-react';

export default function AdminProfile() {
  const { user } = useAuthStore();

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-6">
          <div className="bg-blue-100 rounded-full p-3 mr-4">
            <User className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
            <p className="text-gray-600">System Administrator</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center">
              <Mail className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>

            {user.phone && (
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{user.phone}</p>
                </div>
              </div>
            )}

            {user.location && (
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium">{user.location}</p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Role</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {user.role}
                </span>
              </div>
            </div>

            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">KYC Status</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {user.kycStatus}
                </span>
              </div>
            </div>

            {user.wallet && (
              <div className="flex items-center">
                <div className="h-5 w-5 text-gray-400 mr-3">₹</div>
                <div>
                  <p className="text-sm text-gray-500">Wallet Balance</p>
                  <p className="font-medium">₹{user.wallet.balance.toFixed(2)}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Service Information</h3>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Bicycle Rental Service</h4>
          <p className="text-blue-700 text-sm">
            Providing eco-friendly bicycle rental services at Chandigarh University campus. 
            Our service offers both standard and electric bikes for students and staff, 
            promoting sustainable transportation within the university premises.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-blue-900">Service Area:</p>
              <p className="text-blue-700">Chandigarh University Campus</p>
            </div>
            <div>
              <p className="font-medium text-blue-900">Operating Hours:</p>
              <p className="text-blue-700">24/7 Service</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}