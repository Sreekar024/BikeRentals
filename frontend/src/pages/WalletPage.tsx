import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Transaction } from '../types';
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface TopupForm {
  amount: number;
}

export default function WalletPage() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<TopupForm>();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      const [balanceRes, transactionsRes] = await Promise.all([
        fetch(`${API_URL}/api/wallet/balance`, { credentials: 'include' }),
        fetch(`${API_URL}/api/wallet/transactions`, { credentials: 'include' })
      ]);

      const balanceData = await balanceRes.json();
      const transactionsData = await transactionsRes.json();

      setBalance(balanceData.balance);
      setTransactions(transactionsData.transactions);
    } catch (error) {
      toast.error('Failed to fetch wallet data');
    }
  };

  const handleTopup = async (data: TopupForm) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/wallet/topup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ amount: Number(data.amount) })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      const result = await response.json();
      setBalance(result.newBalance);
      toast.success('Wallet topped up successfully!');
      reset();
      fetchWalletData(); // Refresh transactions
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Topup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'TOPUP':
      case 'REFUND':
        return <ArrowDownLeft className="h-4 w-4 text-green-600" />;
      case 'CHARGE':
      case 'HOLD':
      case 'PENALTY':
        return <ArrowUpRight className="h-4 w-4 text-red-600" />;
      default:
        return <Wallet className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'TOPUP':
      case 'REFUND':
        return 'text-green-600';
      case 'CHARGE':
      case 'HOLD':
      case 'PENALTY':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Wallet</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Balance Card */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Current Balance</p>
              <p className="text-3xl font-bold">₹{balance.toFixed(2)}</p>
            </div>
            <Wallet className="h-12 w-12 text-blue-200" />
          </div>
        </div>

        {/* Top-up Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top-up Wallet</h3>
          <form onSubmit={handleSubmit(handleTopup)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (₹)
              </label>
              <input
                {...register('amount', { 
                  required: 'Amount is required',
                  min: { value: 10, message: 'Minimum amount is ₹10' },
                  max: { value: 5000, message: 'Maximum amount is ₹5000' },
                  valueAsNumber: true
                })}
                type="number"
                min="10"
                max="5000"
                step="10"
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.amount ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter amount"
              />
              {errors.amount && (
                <p className="text-xs text-red-600 mt-1">{errors.amount.message}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Minimum: ₹10, Maximum: ₹5000
              </p>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              {isLoading ? 'Processing...' : 'Top-up'}
            </button>
          </form>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Transaction History</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {transactions.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              No transactions yet
            </div>
          ) : (
            transactions.map((transaction) => (
              <div key={transaction.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center">
                  {getTransactionIcon(transaction.type)}
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {transaction.type.charAt(0) + transaction.type.slice(1).toLowerCase()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(transaction.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${getTransactionColor(transaction.type)}`}>
                    {['TOPUP', 'REFUND'].includes(transaction.type) ? '+' : '-'}₹{transaction.amount.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {transaction.status.toLowerCase()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}