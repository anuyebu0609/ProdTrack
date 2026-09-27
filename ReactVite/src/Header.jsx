import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";
import { Logo } from "./assets/HeaderImage/HeaderImage";

const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
      setLoading(false);
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error);
      return;
    }

    navigate("/Login");
  };

  return (
    <header className="w-full bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto h-[75px] px-5 md:px-8 flex items-center">
        
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img
            src={Logo}
            alt="ProdTrack Logo"
            className="w-[145px] md:w-[160px] lg:w-[175px]"
          />
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8 ml-auto">
          <Link
            to="/"
            className="text-sm font-medium text-gray-800 hover:text-[#123B7A] transition"
          >
            Home
          </Link>

          <Link
            to="/AboutUs"
            className="text-sm font-medium text-gray-800 hover:text-[#123B7A] transition"
          >
            About Us
          </Link>

          {!loading && (
            <>
              {user ? (
                <button
                  onClick={handleLogout}
                  className="
                    flex items-center gap-2
                    bg-[#FF8500]
                    hover:bg-[#e87500]
                    text-white
                    px-6
                    py-2.5
                    rounded-full
                    text-sm
                    font-semibold
                    transition
                    duration-200
                  "
                >
                  {/* Logout Icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>

                  Logout
                </button>
              ) : (
                <Link
                  to="/Login"
                  className="
                    flex items-center gap-2
                    bg-[#FF8500]
                    hover:bg-[#e87500]
                    text-white
                    px-6
                    py-2.5
                    rounded-full
                    text-sm
                    font-semibold
                    transition
                    duration-200
                  "
                >
                  {/* User Icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 21a8 8 0 0 0-16 0" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>

                  Login
                </Link>
              )}
            </>
          )}
        </nav>

        {/* Mobile Login / Logout */}
        <div className="md:hidden ml-auto">
          {!loading && (
            <>
              {user ? (
                <button
                  onClick={handleLogout}
                  className="
                    bg-[#FF8500]
                    hover:bg-[#e87500]
                    text-white
                    px-5
                    py-2.5
                    rounded-full
                    text-sm
                    font-semibold
                    transition
                  "
                >
                  Logout
                </button>
              ) : (
                <Link
                  to="/Login"
                  className="
                    bg-[#FF8500]
                    hover:bg-[#e87500]
                    text-white
                    px-5
                    py-2.5
                    rounded-full
                    text-sm
                    font-semibold
                    transition
                  "
                >
                  Login
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;