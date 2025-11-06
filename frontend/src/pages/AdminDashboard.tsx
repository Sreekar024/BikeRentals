import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { BarChart3, Users, Bike, MapPin, Settings, User } from 'lucide-react';
import AdminOverview from '../components/admin/AdminOverview';
import UserManagement from '../components/admin/UserManagement';
import BikeManagement from '../components/admin/BikeManagement';
import DockManagement from '../components/admin/DockManagement';
import PricingSettings from '../components/admin/PricingSettings';
import AdminProfile from '../components/admin/AdminProfile';

export default function AdminDashboard() {
  const location = useLocation();

  const navigation = [
    { name: 'Overview', href: '/admin', icon: BarChart3, exact: true },
    { name: 'Profile', href: '/admin/profile', icon: User },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Bikes', href: '/admin/bikes', icon: Bike },
    { name: 'Docks', href: '/admin/docks', icon: MapPin },
    { name: 'Pricing', href: '/admin/pricing', icon: Settings },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact 
              ? location.pathname === item.href
              : location.pathname.startsWith(item.href);

            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <Routes>
        <Route path="/" element={<AdminOverview />} />
        <Route path="/profile" element={<AdminProfile />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/bikes" element={<BikeManagement />} />
        <Route path="/docks" element={<DockManagement />} />
        <Route path="/pricing" element={<PricingSettings />} />
      </Routes>
    </div>
  );
}