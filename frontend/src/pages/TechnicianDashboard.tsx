import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Wrench, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface MaintenanceTicket {
  id: string;
  title: string;
  notes?: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
  bike: {
    id: string;
    type: string;
  };
  creator: {
    name: string;
  };
}

export default function TechnicianDashboard() {
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await fetch(`${API_URL}/api/technician/tickets`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tickets');
      }

      const data = await response.json();
      setTickets(data.tickets);
    } catch (error) {
      toast.error('Failed to fetch maintenance tickets');
    } finally {
      setIsLoading(false);
    }
  };

  const updateTicketStatus = async (ticketId: string, status: string, notes?: string) => {
    try {
      const response = await fetch(`${API_URL}/api/technician/tickets/${ticketId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status, notes })
      });

      if (!response.ok) {
        throw new Error('Failed to update ticket');
      }

      toast.success('Ticket updated successfully');
      fetchTickets();
    } catch (error) {
      toast.error('Failed to update ticket');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'IN_PROGRESS':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'RESOLVED':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'CLOSED':
        return <CheckCircle className="h-5 w-5 text-gray-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-red-100 text-red-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'RESOLVED':
        return 'bg-green-100 text-green-800';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Maintenance Tickets</h1>
        <div className="flex items-center text-sm text-gray-600">
          <Wrench className="h-4 w-4 mr-2" />
          {tickets.filter(t => t.status !== 'CLOSED').length} Active Tickets
        </div>
      </div>

      {tickets.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No maintenance tickets assigned</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start">
                  {getStatusIcon(ticket.status)}
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-gray-900">
                      {ticket.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Bike: {ticket.bike.type} ({ticket.bike.id.slice(-8)})
                    </p>
                    <p className="text-sm text-gray-500">
                      Created by: {ticket.creator.name}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(ticket.status)}`}>
                  {ticket.status.replace('_', ' ')}
                </span>
              </div>

              {ticket.notes && (
                <div className="mb-4 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-700">{ticket.notes}</p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  Created: {new Date(ticket.createdAt).toLocaleString()}
                </p>

                <div className="flex space-x-2">
                  {ticket.status === 'OPEN' && (
                    <button
                      onClick={() => updateTicketStatus(ticket.id, 'IN_PROGRESS')}
                      className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
                    >
                      Start Work
                    </button>
                  )}
                  {ticket.status === 'IN_PROGRESS' && (
                    <button
                      onClick={() => updateTicketStatus(ticket.id, 'RESOLVED', 'Work completed')}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}