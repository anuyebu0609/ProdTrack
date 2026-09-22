import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Logo } from "../src/assets/HeaderImage/HeaderImage";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // ================================
  // MENU ITEMS
  // ================================

  const menuItems = [
    { name: "Home", href: "/" },
    { name: "Dashboard", href: "/Dashboard" },
    { name: "About Us", href: "/AboutUs" },
  ];

  // ================================
  // CHECK ACTIVE PAGE
  // ================================

  const isActive = (href) => {
    if (href === "/") {
      return location.pathname === "/";
    }

    return location.pathname.toLowerCase() === href.toLowerCase();
  };

  // ================================
  // CLOSE MENU
  // ================================

  const handleMenuClick = () => {
    setMenuOpen(false);
  };

  // ================================
  // LOGO CLICK
  // ================================

  const handleLogoClick = (e) => {
    e.preventDefault();
    setMenuOpen(false);
    navigate("/");
  };

  // ================================
  // LOGIN CLICK
  // ================================

  const handleLoginClick = () => {
    setMenuOpen(false);
    navigate("/login");
  };

  return (
    <header className="w-full bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">

      {/* ================= MAIN CONTAINER ================= */}

      <div className="w-[95%] md:w-[90%] max-w-[1400px] mx-auto">

        <div className="h-[75px] flex items-center justify-between">

          {/* ================= LOGO ================= */}

          <a
            href="/"
            onClick={handleLogoClick}
            className="flex items-center"
          >
            <img
              src={Logo}
              alt="ProdTrack Logo"
              className="w-[145px] sm:w-[160px] md:w-[175px] h-auto object-contain"
            />
          </a>


          {/* ================= DESKTOP MENU ================= */}

          <nav className="hidden lg:flex items-center gap-8 xl:gap-10">

            {menuItems.map((item) => {
              const active = isActive(item.href);

              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => {
                    navigate(item.href);
                    handleMenuClick();
                  }}
                  className={`
                    relative
                    text-[15px]
                    xl:text-[16px]
                    font-medium
                    transition-colors
                    duration-300
                    bg-transparent
                    border-none
                    cursor-pointer

                    ${
                      active
                        ? "text-[#FF8500]"
                        : "text-[#111111] hover:text-[#FF8500]"
                    }

                    after:absolute
                    after:left-0
                    after:-bottom-2
                    after:h-[2px]
                    after:bg-[#FF8500]
                    after:transition-all
                    after:duration-300

                    ${
                      active
                        ? "after:w-full"
                        : "after:w-0 hover:after:w-full"
                    }
                  `}
                >
                  {item.name}
                </button>
              );
            })}


            {/* ================= LOGIN BUTTON ================= */}

            <button
              type="button"
              onClick={handleLoginClick}
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                px-6
                py-2.5
                rounded-full
                bg-[#FF8500]
                text-white
                text-[15px]
                font-semibold
                border-2
                border-[#FF8500]
                transition-all
                duration-300
                hover:bg-white
                hover:text-[#FF8500]
                hover:shadow-lg
                cursor-pointer
              "
            >

              {/* User Icon */}

              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
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

            </button>

          </nav>


          {/* ================= MOBILE MENU BUTTON ================= */}

          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
            className="
              lg:hidden
              flex
              items-center
              justify-center
              w-10
              h-10
              rounded-lg
              text-[#FF8500]
              hover:bg-[#FF8500]/10
              transition
              cursor-pointer
            "
          >

            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </svg>

          </button>

        </div>


        {/* =====================================================
            MOBILE OVERLAY
        ====================================================== */}

        {menuOpen && (
          <div
            className="
              lg:hidden
              fixed
              inset-0
              bg-black/40
              z-40
            "
            onClick={() => setMenuOpen(false)}
          />
        )}


        {/* =====================================================
            MOBILE DRAWER
        ====================================================== */}

        <div
          className={`
            lg:hidden
            fixed
            top-0
            right-0
            z-50
            w-[280px]
            sm:w-[320px]
            h-screen
            bg-white
            shadow-2xl
            transition-transform
            duration-300
            ease-in-out

            ${
              menuOpen
                ? "translate-x-0"
                : "translate-x-full"
            }
          `}
        >

          {/* ================= MOBILE HEADER ================= */}

          <div
            className="
              h-[75px]
              px-5
              flex
              items-center
              justify-between
              border-b
              border-gray-100
            "
          >

            <a
              href="/"
              onClick={handleLogoClick}
            >
              <img
                src={Logo}
                alt="ProdTrack Logo"
                className="w-[145px] h-auto"
              />
            </a>


            {/* ================= CLOSE BUTTON ================= */}

            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
              className="
                w-9
                h-9
                flex
                items-center
                justify-center
                rounded-full
                text-[#111111]
                hover:bg-[#FF8500]/10
                hover:text-[#FF8500]
                transition
                cursor-pointer
              "
            >

              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="25"
                height="25"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>

            </button>

          </div>


          {/* ================= MOBILE MENU ================= */}

          <nav className="px-6 pt-8">

            <div className="flex flex-col gap-2">

              {menuItems.map((item) => {
                const active = isActive(item.href);

                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => {
                      navigate(item.href);
                      handleMenuClick();
                    }}
                    className={`
                      block
                      w-full
                      text-left
                      px-4
                      py-3
                      rounded-lg
                      text-[17px]
                      font-medium
                      transition-all
                      duration-300
                      bg-transparent
                      border-none
                      cursor-pointer

                      ${
                        active
                          ? "bg-[#FF8500]/10 text-[#FF8500]"
                          : "text-[#111111] hover:bg-[#FF8500]/10 hover:text-[#FF8500]"
                      }
                    `}
                  >
                    {item.name}
                  </button>
                );
              })}

            </div>


            {/* ================= MOBILE LOGIN ================= */}

            <button
              type="button"
              onClick={handleLoginClick}
              className="
                mt-8
                w-full
                flex
                items-center
                justify-center
                gap-2
                px-6
                py-3
                rounded-full
                bg-[#FF8500]
                text-white
                font-semibold
                border-2
                border-[#FF8500]
                transition-all
                duration-300
                hover:bg-white
                hover:text-[#FF8500]
                cursor-pointer
              "
            >

              {/* User Icon */}

              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="19"
                height="19"
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

            </button>

          </nav>

        </div>

      </div>

    </header>
  );
};

export default Header;