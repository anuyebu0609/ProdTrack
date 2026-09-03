import { useState } from "react";
import { Logo } from "../src/assets/HeaderImage/HeaderImage";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const menuItems = [
    { name: "Home", href: "#home" },
    { name: "Features", href: "#features" },
    { name: "Dashboard", href: "#dashboard" },
    { name: "About Us", href: "#about" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <header className="w-full bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">

      {/* ================= MAIN CONTAINER ================= */}
      <div className="w-[95%] md:w-[90%] max-w-[1400px] mx-auto">

        <div className="h-[75px] flex items-center justify-between">

          {/* ================= LOGO ================= */}

          <a
            href="#home"
            onClick={() => setMenuOpen(false)}
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

            {menuItems.map((item, index) => (
              <a
                key={item.name}
                href={item.href}
                className={`
                  relative
                  text-[15px]
                  xl:text-[16px]
                  font-medium
                  text-[#111111]
                  transition-colors
                  duration-300
                  hover:text-[#5B2EFF]

                  after:absolute
                  after:left-0
                  after:-bottom-2
                  after:h-[2px]
                  after:bg-[#5B2EFF]
                  after:w-0
                  after:transition-all
                  after:duration-300
                  hover:after:w-full

                  ${index === 0 ? "text-[#5B2EFF] after:w-full" : ""}
                `}
              >
                {item.name}
              </a>
            ))}

            {/* ================= LOGIN BUTTON ================= */}

            <a
              href="/login"
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                px-6
                py-2.5
                rounded-full
                bg-[#5B2EFF]
                text-white
                text-[15px]
                font-semibold
                border-2
                border-[#5B2EFF]
                transition-all
                duration-300
                hover:bg-white
                hover:text-[#5B2EFF]
                hover:shadow-lg
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

            </a>

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
              text-[#5B2EFF]
              hover:bg-[#5B2EFF]/10
              transition
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
              href="#home"
              onClick={() => setMenuOpen(false)}
            >
              <img
                src={Logo}
                alt="ProdTrack Logo"
                className="w-[145px] h-auto"
              />
            </a>


            {/* CLOSE BUTTON */}

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
                hover:bg-[#5B2EFF]/10
                hover:text-[#5B2EFF]
                transition
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

              {menuItems.map((item, index) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`
                    block
                    px-4
                    py-3
                    rounded-lg
                    text-[17px]
                    font-medium
                    transition-all
                    duration-300

                    ${
                      index === 0
                        ? "bg-[#5B2EFF]/10 text-[#5B2EFF]"
                        : "text-[#111111] hover:bg-[#5B2EFF]/10 hover:text-[#5B2EFF]"
                    }
                  `}
                >
                  {item.name}
                </a>
              ))}

            </div>


            {/* ================= MOBILE LOGIN ================= */}

            <a
              href="/login"
              onClick={() => setMenuOpen(false)}
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
                bg-[#5B2EFF]
                text-white
                font-semibold
                border-2
                border-[#5B2EFF]
                transition-all
                duration-300
                hover:bg-white
                hover:text-[#5B2EFF]
              "
            >

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

            </a>

          </nav>

        </div>

      </div>

    </header>
  );
};

export default Header;