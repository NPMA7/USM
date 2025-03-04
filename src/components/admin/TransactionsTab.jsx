import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function TransactionsTab() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tournamentFilter, setTournamentFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [tournaments, setTournaments] = useState([]);
  const [transactionCount, setTransactionCount] = useState(0);

  useEffect(() => {
    fetchTransactions();
    fetchTournaments();
    checkTransactionCount();
    const intervalId = setInterval(() => {
      checkTransactionCount();
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTournaments = async () => {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('name, game');

      if (error) throw error;
      setTournaments(data || []);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    }
  };

  const checkTransactionCount = async () => {
    try {
      const { count, error } = await supabase
        .from('transactions')
        .select('*', { count: 'exact' });

      if (error) throw error;

      setTransactionCount(prevCount => {
        if (count !== prevCount) {
          fetchTransactions();
          return count;
        }
        return prevCount;
      });
    } catch (error) {
      console.error('Error checking transaction count:', error);
    }
  };

  const viewTransactionDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setShowModal(true);
  };

  // Filter transactions based on search term, status, and tournament
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.team_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.order_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.tournament_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || transaction.transaction_status === statusFilter;
    const matchesTournament = tournamentFilter === 'all' || transaction.tournament === tournamentFilter;
    
    return matchesSearch && matchesStatus && matchesTournament;
  });

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-xl font-semibold">Manajemen Transaksi</h2>
        <div className="flex flex-col md:flex-row gap-2">
          <select
            value={tournamentFilter}
            onChange={(e) => setTournamentFilter(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="all">Semua Turnamen</option>
            {tournaments.map((tournament, index) => (
              <option key={index} value={tournament.name}>
                {tournament.name}
              </option>
            ))}
          </select>
          
          <div className="relative">
            <input
              type="text"
              placeholder="Cari transaksi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="p-2 pl-8 border rounded w-full md:w-64"
            />
            <svg
              className="w-4 h-4 absolute left-2 top-3 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tim
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Turnamen
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{transaction.order_id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{transaction.team_name}</div>
                    <div className="text-sm text-gray-500">{transaction.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{transaction.tournament_name}</div>
                    <div className="text-sm text-gray-500">{transaction.tournament}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {transaction.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      transaction.transaction_status === 'settlement' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                    }`}>
                      {transaction.transaction_status === 'settlement' ? 'Sukses' :
                      transaction.transaction_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(transaction.created_at).toLocaleDateString('id-ID')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => viewTransactionDetails(transaction)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Detail Transaksi */}
      {showModal && selectedTransaction && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-xl flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Detail Transaksi</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-3 mb-6">
              <div>
                <p className="text-sm text-gray-500">Order ID</p>
                <p className="font-medium">{selectedTransaction.order_id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Turnamen</p>
                <p className="font-medium">{selectedTransaction.tournament_name}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Nama Tim</p>
                <p className="font-medium">{selectedTransaction.team_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Divisi Game</p>
                <p className="font-medium">{selectedTransaction.tournament}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Info Pendaftar</p>
                <p className="font-medium">{selectedTransaction.name}</p>
                <p className="font-medium">{selectedTransaction.email}</p>
                <p className="font-medium">{selectedTransaction.whatsapp}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Info Pembayaran</p>
                <p className="font-medium">Rp {parseInt(selectedTransaction.gross_amount).toLocaleString('id-ID')}</p>
                <p className="font-medium">{selectedTransaction.payment_type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full mr-2 ${
                  selectedTransaction.transaction_status === 'settlement' ? 'bg-green-100 text-green-800' :
                  selectedTransaction.transaction_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {selectedTransaction.transaction_status === 'settlement' ? 'Sukses' :
                   selectedTransaction.transaction_status === 'pending' ? 'Pending' :
                   selectedTransaction.transaction_status === 'cancel' ? 'Dibatalkan' :
                   selectedTransaction.transaction_status === 'expire' ? 'Kadaluarsa' :
                   selectedTransaction.transaction_status}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tanggal Transaksi</p>
                <p className="font-medium">
                  {new Date(selectedTransaction.created_at).toLocaleString('id-ID')}
                </p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 