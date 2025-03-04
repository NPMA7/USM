"use client";
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SessionExpiredModal from './SessionExpiredModal';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const hamburgerRef = useRef(null);
  const router = useRouter();
  const [showSessionExpiredModal, setShowSessionExpiredModal] = useState(false);
  
  useEffect(() => {
    const checkLoginStatus = () => {
      const userData = localStorage.getItem('user');
      const loginTime = localStorage.getItem('loginTime');

      if (!userData) {
        setIsLoggedIn(false);
        setUser(null);
        return;
      }

      const currentTime = new Date().getTime();
      const oneHour = 60 * 60 * 1000; // 1 jam dalam milidetik

      if (loginTime && currentTime - parseInt(loginTime) > oneHour) {
        // Logout otomatis jika sudah lebih dari 1 jam
        localStorage.removeItem('user');
        localStorage.removeItem('loginTime');
        setShowSessionExpiredModal(true);
        setIsLoggedIn(false);
        setUser(null);
        return;
      }

      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
    };

    checkLoginStatus();

    const handleStorageChange = () => {
      checkLoginStatus();
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [router]);
  
  const handleChatCS = () => {
    window.open(`https://wa.me/6288222810681`, '_blank');
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('loginTime');
    // Trigger event storage
    window.dispatchEvent(new Event('storage'));
    router.push('/');
  };

  const smoothScroll = (targetId) => {
    // Cek apakah kita berada di halaman beranda
    const isHomePage = window.location.pathname === '/' || window.location.pathname === '';
    
    if (isHomePage) {
      // Jika di beranda, lakukan smooth scroll ke elemen
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Jika bukan di beranda, arahkan ke beranda dengan anchor
      window.location.href = `/#${targetId}`;
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(prev => !prev);
  };

  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  // Event listener untuk klik di luar dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        closeDropdown();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleHamburger = () => {
    setIsHamburgerOpen(!isHamburgerOpen);
    setIsOpen(false); // Tutup dropdown saat hamburger dibuka
  };

  const handleCloseSessionModal = () => {
    setShowSessionExpiredModal(false);
    router.push('/auth/login');
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-blue-900 text-white py-2 shadow-lg' 
          : 'bg-blue-900 text-white py-4'
      }`}>
        <div className="container mx-auto px-4 flex items-center justify-between">
          <h1 className="text-xl font-bold max-md:hidden">
            <a href="/">
            <span className="text-yellow-400">USM</span>
            </a>
          </h1>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/"
              className="hover:text-yellow-400 transition-colors"
            >
              Home
            </Link>
           
            <Link 
              href="#info" 
              onClick={(e) => {
                e.preventDefault();
                smoothScroll('info');
              }}
              className="hover:text-yellow-400 transition-colors"
            >
              Info
            </Link>
            <Link 
              href="#tournaments" 
              onClick={(e) => {
                e.preventDefault();
                smoothScroll('tournaments');
              }}
              className="hover:text-yellow-400 transition-colors"
            >
              Turnamen
            </Link>
            <Link 
              href="#faq" 
              onClick={(e) => {
                e.preventDefault();
                smoothScroll('faq');
              }}
              className="hover:text-yellow-400 transition-colors"
            >
              FAQ
            </Link>
          </div>
          
          <div className="md:hidden">
            <button onClick={toggleHamburger} className="focus:outline-none">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18h12M6 12h12M6 6h12" />
              </svg>
            </button>
          </div>

          {isHamburgerOpen && (
            <div className={`absolute border-t-2 border-double left-0 text-center right-0 bg-blue-900 text-white ${
              scrolled 
                ? 'top-11' 
                : 'top-16'
            }`}> 
              <Link
                href="/"
                onClick={(e) => {
                  e.preventDefault();
                  smoothScroll('home');
                  setIsHamburgerOpen(false);
                }}
                className="block px-4 py-2 hover:bg-blue-700 transition-colors"
              >
                Home
              </Link>
            
              <Link 
                href="#info" 
                onClick={(e) => {
                  e.preventDefault();
                  smoothScroll('info');
                  setIsHamburgerOpen(false);
                }}
                className="block px-4 py-2 border-y-1 border-gray-500 border-dashed hover:bg-blue-700 transition-colors"
              >
                Info
              </Link>
              <Link 
                href="#tournaments" 
                onClick={(e) => {
                  e.preventDefault();
                  smoothScroll('tournaments');
                  setIsHamburgerOpen(false);
                }}
                className="block px-4 py-2 border-b-1 border-gray-500 border-dashed hover:bg-blue-700 transition-colors"
              >
                Turnamen
              </Link>
              <Link 
                href="#faq" 
                onClick={(e) => {
                  e.preventDefault();
                  smoothScroll('faq');
                  setIsHamburgerOpen(false);
                }}
                className="block px-4 py-2 border-b-1 border-gray-300 border-dashed hover:bg-blue-700 transition-colors"
              >
                FAQ
              </Link>
            
            </div>
          )}
         
          {/* Gambar Profil dan Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <img
              src={isLoggedIn && user?.avatar ? user.avatar : "/images/avatar2.png"}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover cursor-pointer border-2 border-gray-300 hover:border-yellow-400 transition duration-300"
              onClick={toggleDropdown}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/images/avatar2.png';
              }}
            />
            {isDropdownOpen && (
              <div className="absolute transform -translate-x-1/2 -left-14 mt-4 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-10 text-lg">
                {isLoggedIn ? (
                  // Menu untuk pengguna yang sudah login
                  <>
                    <Link href="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100" onClick={closeDropdown}>
                      Profil Saya
                    </Link>
                    
                    {/* Tambahkan link Admin Panel untuk admin dan owner */}
                    {user && (user.role === 'admin' || user.role === 'owner') && (
                      <Link href="/admin" className="block px-4 py-2 text-gray-700 hover:bg-gray-100" onClick={closeDropdown}>
                        Panel Admin
                      </Link>
                    )}
                    
                    <button
                      onClick={() => { handleLogout(); closeDropdown(); }}
                      className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  // Menu untuk pengguna yang belum login
                  <>
                    <Link 
                      href="/auth/login" 
                      className="block px-4 py-2 text-gray-800 hover:bg-gray-200 transition duration-200"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Login
                    </Link>
                    
                    <Link 
                      href="/auth/register" 
                      className="block px-4 py-2 text-gray-800 hover:bg-gray-200 transition duration-200"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Register
                    </Link>
                    
                    <button 
                      onClick={handleChatCS}
                      className="flex items-center w-full px-4 py-2 text-gray-800 hover:bg-gray-200 transition duration-200"
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill="currentColor" 
                        className="w-4 h-4 mr-2"
                      >
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                      </svg>
                      Hubungi Kami
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>
      
      {showSessionExpiredModal && (
        <SessionExpiredModal onClose={handleCloseSessionModal} />
      )}
    </>
  );
}