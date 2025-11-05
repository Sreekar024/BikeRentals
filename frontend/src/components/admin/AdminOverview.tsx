import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Users, Bike, DollarSign, TrendingUp } from 'lucide-react';

interface DashboardStats {
  totalRides: number;
  totalRevenue: number;
  activeUsers: number;
  availableBikes: number;
}

export default function AdminOverview() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRides: 0,
    totalRevenue: 0,
    activeUsers: 0,
    availableBikes: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/dashboard`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }

      const data = await response.json();
      setStats(data);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      name: 'Total Rides',
      value: stats.totalRides,
      icon: TrendingUp,
      color: 'bg-blue-500'
    },
    {
      name: 'Total Revenue',
      value: `₹${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-green-500'
    },
    {
      name: 'Active Users',
      value: stats.activeUsers,
      icon: Users,
      color: 'bg-purple-500'
    },
    {
      name: 'Available Bikes',
      value: stats.availableBikes,
      icon: Bike,
      color: 'bg-orange-500'
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`${stat.color} rounded-md p-3`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
            <h4 className="font-medium text-gray-900">Add New Bike</h4>
            <p className="text-sm text-gray-600">Register a new bike to the fleet</p>
          </button>
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
            <h4 className="font-medium text-gray-900">Create Dock</h4>
            <p className="text-sm text-gray-600">Add a new docking station</p>
          </button>
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
            <h4 className="font-medium text-gray-900">Update Pricing</h4>
            <p className="text-sm text-gray-600">Modify rental pricing rules</p>
          </button>
        </div>
      </div>
    </div>
  );
}