import ProgressBar from "@/components/ProgressBar";
import { useTeams } from "@/context/TeamContext";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function TournamentCard({ 
  title, 
  price, 
  image, 
  onSelect, 
  type, 
  description, 
  registeredTeams, 
  maxTeams = 128, // Default value jika tidak diberikan
  isLoading,
  tournament
}) {
  const { updateRegisteredTeams } = useTeams();
  const [isUserRegistered, setIsUserRegistered] = useState(false);
  const [checkingRegistration, setCheckingRegistration] = useState(true);
  const [tournamentStatus, setTournamentStatus] = useState(tournament.status);

  useEffect(() => {
    const checkUserRegistration = async () => {
      setCheckingRegistration(true);
      try {
        // Ambil data pengguna dari localStorage
        const userData = localStorage.getItem('user');
        if (!userData) {
          setCheckingRegistration(false);
          return;
        }

        const user = JSON.parse(userData);
        
         const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('email', user.email)
          .eq('tournament', type);
        
        if (error) {
          console.error('Error memeriksa pendaftaran:', error.message || JSON.stringify(error));
        } else {
          setIsUserRegistered(data && data.length > 0);
        }
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : JSON.stringify(error));
      } finally {
        setCheckingRegistration(false);
      }
    };

    checkUserRegistration();
  }, [type]);

  useEffect(() => {
    const fetchTournamentStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('tournaments')
          .select('status')
          .eq('id', tournament.id)
          .single();

        if (error) {
          console.error('Error fetching tournament status:', error);
          return;
        }

        if (data) {
          setTournamentStatus(data.status); // Perbarui status turnamen
        }
      } catch (error) {
        console.error('Error fetching tournament status:', error);
      }
    };

    // Polling setiap 2 detik
    const intervalId = setInterval(fetchTournamentStatus, 2000);

    // Cleanup interval saat komponen unmount
    return () => clearInterval(intervalId);
  }, [tournament.id]);

  useEffect(() => {
    const fetchRegisteredTeams = async () => {
      try {
        const { count, error } = await supabase
          .from('transactions')
          .select('*', { count: 'exact' })
          .eq('tournament', type)
          .eq('transaction_status', 'settlement');

        if (error) {
          console.error('Error fetching registered teams:', error);
          return;
        }

        updateRegisteredTeams(type, count || 0);
      } catch (error) {
        console.error('Error fetching registered teams:', error);
      }
    };

    // Fetch registered teams every 5 seconds
    const intervalId = setInterval(fetchRegisteredTeams, 5000);
    
    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [type, updateRegisteredTeams]);

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="h-48 relative overflow-hidden">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/images/tournament-placeholder.jpg';
          }}
        />
        <div className="absolute top-2 left-2">
          <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
            tournamentStatus === 'open' ? 'bg-green-500 text-white' : 
            tournamentStatus === 'ongoing' ? 'bg-yellow-500 text-white' : 
            'bg-red-500 text-white'
          }`}>
            {tournamentStatus === 'open' ? 'Pendaftaran Dibuka' : 
             tournamentStatus === 'ongoing' ? 'Sedang Berlangsung' : 
             'Pendaftaran Ditutup'}
          </span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-70"></div>
        <div className="absolute bottom-0 left-0 p-4 text-white">
          <h3 className="text-2xl font-bold drop-shadow-md">{title}</h3>
          <p className="text-yellow-300 font-semibold drop-shadow-md text-3xl">Rp {price.toLocaleString()} <span>/ Tim</span></p>
        </div>
      </div>
      
      <div className="p-6">
        <p className="text-gray-600 mb-4">{description}</p>
        
        <p className="text-gray-500 mb-4 text-base flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {tournament?.start_date ? new Date(tournament.start_date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          }) : 'Tanggal belum ditentukan'}
        </p>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-6 mt-4">
            <div className="animate-pulse h-2 bg-gray-200 rounded w-full"></div>
          </div>
        ) : (
          <ProgressBar 
            current={registeredTeams} 
            total={maxTeams} 
            tournament={type}
          />
        )}

        <button
          onClick={() => onSelect(type, tournament.id)}
          disabled={isLoading || registeredTeams >= maxTeams || isUserRegistered || checkingRegistration || tournamentStatus !== 'open'}
          className={`w-full mt-6 ${
            isLoading || checkingRegistration
              ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
              : isUserRegistered
                ? "bg-green-600 text-white cursor-not-allowed"
                : tournamentStatus === 'ongoing'
                  ? "bg-yellow-500 text-white cursor-not-allowed"
                  : tournamentStatus === 'closed'
                    ? "bg-red-500 text-white cursor-not-allowed"
                    : registeredTeams < maxTeams 
                      ? "bg-blue-600 text-white hover:bg-blue-700" 
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
          } py-3 rounded-lg font-semibold transition duration-300 flex items-center justify-center`}
        >
          {isLoading || checkingRegistration ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Memuat...
            </span>
          ) : isUserRegistered ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Anda Sudah Mendaftar
            </>
          ) : tournamentStatus === 'ongoing' ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Turnamen Berlangsung
            </>
          ) : tournamentStatus === 'closed' ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Turnamen Selesai
            </>
          ) : registeredTeams >= maxTeams ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Slot Penuh
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Daftar Sekarang
            </>
          )}
        </button>
      </div>
    </div>
  );
}
