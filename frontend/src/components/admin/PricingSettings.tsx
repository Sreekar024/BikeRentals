import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { DollarSign } from 'lucide-react';

interface PricingRule {
  id: string;
  perMinute: number;
  perKm: number;
  unlockFee: number;
  minBalanceRequired: number;
  latePenaltyPerMin: number;
  offDockPenalty: number;
}

interface PricingForm {
  perMinute: number;
  perKm: number;
  unlockFee: number;
  minBalanceRequired: number;
}

export default function PricingSettings() {
  const [pricing, setPricing] = useState<PricingRule | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const { register, handleSubmit, reset } = useForm<PricingForm>();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  useEffect(() => {
    fetchPricing();
  }, []);

  const fetchPricing = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/pricing`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch pricing');
      }

      const data = await response.json();
      setPricing(data.pricing);
      
      if (data.pricing) {
        reset({
          perMinute: data.pricing.perMinute,
          perKm: data.pricing.perKm,
          unlockFee: data.pricing.unlockFee,
          minBalanceRequired: data.pricing.minBalanceRequired
        });
      }
    } catch (error) {
      toast.error('Failed to fetch pricing');
    } finally {
      setIsLoading(false);
    }
  };

  const updatePricing = async (data: PricingForm) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/pricing`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Failed to update pricing');
      }

      toast.success('Pricing updated successfully');
      fetchPricing();
    } catch (error) {
      toast.error('Failed to update pricing');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-6">
          <DollarSign className="h-6 w-6 text-green-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Pricing Configuration</h3>
        </div>

        <form onSubmit={handleSubmit(updatePricing)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Per Minute Rate (₹)
              </label>
              <input
                {...register('perMinute', { required: true, min: 0 })}
                type="number"
                step="0.1"
                min="0"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Amount charged per minute of ride
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Per Kilometer Rate (₹)
              </label>
              <input
                {...register('perKm', { required: true, min: 0 })}
                type="number"
                step="0.1"
                min="0"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Amount charged per kilometer traveled
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unlock Fee (₹)
              </label>
              <input
                {...register('unlockFee', { required: true, min: 0 })}
                type="number"
                step="0.1"
                min="0"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                One-time fee for unlocking a bike
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Balance Required (₹)
              </label>
              <input
                {...register('minBalanceRequired', { required: true, min: 0 })}
                type="number"
                step="0.1"
                min="0"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum wallet balance to reserve a bike
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isUpdating}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isUpdating ? 'Updating...' : 'Update Pricing'}
            </button>
          </div>
        </form>
      </div>

      {pricing && (
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Current Penalties</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <h5 className="font-medium text-red-900">Late Return Penalty</h5>
              <p className="text-2xl font-bold text-red-600">
                ₹{pricing.latePenaltyPerMin}/min
              </p>
              <p className="text-sm text-red-700">
                Applied when bike is returned late
              </p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <h5 className="font-medium text-red-900">Off-Dock Penalty</h5>
              <p className="text-2xl font-bold text-red-600">
                ₹{pricing.offDockPenalty}
              </p>
              <p className="text-sm text-red-700">
                Applied when bike is not returned to a dock
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}