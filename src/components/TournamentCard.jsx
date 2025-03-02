import ProgressBar from "@/components/ProgressBar";
import { useTeams } from "@/context/TeamContext";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function TournamentCard({ title, price, image, onSelect, type, description, isLoading }) {
  const { registeredTeams } = useTeams();
  const maxTeams = 128; // Maksimal tim yang bisa mendaftar
  const [isUserRegistered, setIsUserRegistered] = useState(false);
  const [checkingRegistration, setCheckingRegistration] = useState(true);

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

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="h-48 relative overflow-hidden">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-70"></div>
        <div className="absolute bottom-0 left-0 p-4 text-white">
          <h3 className="text-2xl font-bold drop-shadow-md">{title}</h3>
          <p className="text-yellow-300 font-semibold drop-shadow-md text-3xl">Rp {price.toLocaleString()} <span>/ Tim</span></p>
        </div>
      </div>
      
      <div className="p-6">
        <p className="text-gray-600 mb-4">{description}</p>
        
        <p className="text-gray-500 mb-4 text-base flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2H3V4zm0 4h18v12a1 1 0 01-1 1H4a1 1 0 01-1-1V8z" />
            <path d="M3 8h18v2H3V8z" />
            <path d="M3 12h18v2H3v-2z" />
            <path d="M3 16h18v2H3v-2z" />
            <path d="M3 20h18v2H3v-2z" />
          </svg>
          11 Maret 2025
        </p>
        {isLoading ? (
          <div className="w-full bg-gray-200 rounded-full h-4 mb-6">
            <div className="flex items-center justify-center h-full">
              <div className="animate-pulse flex space-x-1">
                <div className="h-2 w-2 bg-blue-400 rounded-full"></div>
                <div className="h-2 w-2 bg-blue-400 rounded-full"></div>
                <div className="h-2 w-2 bg-blue-400 rounded-full"></div>
              </div>
            </div>
          </div>
        ) : (
          <ProgressBar current={registeredTeams[type]} total={maxTeams} />
        )}

       

        <button
          onClick={() => onSelect(type)}
          disabled={isLoading || registeredTeams[type] >= maxTeams || isUserRegistered || checkingRegistration}
          className={`w-full mt-6 ${
            isLoading || checkingRegistration
              ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
              : isUserRegistered
                ? "bg-green-600 text-white cursor-not-allowed"
                : registeredTeams[type] < maxTeams 
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
          ) : registeredTeams[type] >= maxTeams ? (
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
