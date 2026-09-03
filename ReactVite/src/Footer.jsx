import { Logo } from "./assets/HeaderImage/HeaderImage";

const Footer = () => {
  return (
    <footer className="w-full bg-[#111214] text-white">

      {/* ================= MAIN FOOTER ================= */}

      <div
        className="
          w-[92%]
          md:w-[90%]
          max-w-[1200px]
          mx-auto

          py-10
          md:py-12

          grid
          grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-4

          gap-8
          md:gap-10
          lg:gap-12
        "
      >

        {/* =================================================
            COMPANY INFO
        ================================================== */}

        <div className="sm:col-span-2 lg:col-span-1">

          {/* LOGO */}

          <div className="flex items-center">
            <img
              src={Logo}
              alt="ProdTrack Logo"
              className="w-[150px] sm:w-[165px]"
            />
          </div>

          {/* DESCRIPTION */}

          <p
            className="
              mt-5
              text-[14px]
              leading-6
              text-white/70
              max-w-[280px]
            "
          >
            A simple dashboard to track weekly production,
            quality, and attendance. Built for performance.
            Designed for teams.
          </p>

        </div>


        {/* =================================================
            QUICK LINKS
        ================================================== */}

        <div>

          <h3
            className="
              text-[16px]
              md:text-[17px]
              font-semibold
              text-white
              mb-5
            "
          >
            Quick Links
          </h3>

          <ul className="space-y-4">

            <li>
              <a
                href="/"
                className="
                  flex
                  items-center
                  justify-between
                  text-[14px]
                  text-white/70
                  hover:text-white
                  transition-colors
                  duration-300
                  max-w-[130px]
                "
              >
                <span>Home</span>

                <span className="text-white/60">
                  ›
                </span>
              </a>
            </li>

            <li>
              <a
                href="/features"
                className="
                  flex
                  items-center
                  justify-between
                  text-[14px]
                  text-white/70
                  hover:text-white
                  transition-colors
                  duration-300
                  max-w-[130px]
                "
              >
                <span>Features</span>

                <span className="text-white/60">
                  ›
                </span>
              </a>
            </li>

            <li>
              <a
                href="/dashboard"
                className="
                  flex
                  items-center
                  justify-between
                  text-[14px]
                  text-white/70
                  hover:text-white
                  transition-colors
                  duration-300
                  max-w-[130px]
                "
              >
                <span>Dashboard</span>

                <span className="text-white/60">
                  ›
                </span>
              </a>
            </li>

            <li>
              <a
                href="/about"
                className="
                  flex
                  items-center
                  justify-between
                  text-[14px]
                  text-white/70
                  hover:text-white
                  transition-colors
                  duration-300
                  max-w-[130px]
                "
              >
                <span>About Us</span>

                <span className="text-white/60">
                  ›
                </span>
              </a>
            </li>

            <li>
              <a
                href="/contact"
                className="
                  flex
                  items-center
                  justify-between
                  text-[14px]
                  text-white/70
                  hover:text-white
                  transition-colors
                  duration-300
                  max-w-[130px]
                "
              >
                <span>Contact</span>

                <span className="text-white/60">
                  ›
                </span>
              </a>
            </li>

          </ul>

        </div>


        {/* =================================================
            SUPPORT
        ================================================== */}

        <div>

          <h3
            className="
              text-[16px]
              md:text-[17px]
              font-semibold
              text-white
              mb-5
            "
          >
            Support
          </h3>

          <ul className="space-y-4">

            <li>
              <a
                href="/help"
                className="
                  text-[14px]
                  text-white/70
                  hover:text-white
                  transition-colors
                  duration-300
                "
              >
                Help Center
              </a>
            </li>

            <li>
              <a
                href="/privacy"
                className="
                  text-[14px]
                  text-white/70
                  hover:text-white
                  transition-colors
                  duration-300
                "
              >
                Privacy Policy
              </a>
            </li>

            <li>
              <a
                href="/terms"
                className="
                  text-[14px]
                  text-white/70
                  hover:text-white
                  transition-colors
                  duration-300
                "
              >
                Terms & Conditions
              </a>
            </li>

          </ul>

        </div>


        {/* =================================================
            CONTACT US
        ================================================== */}

        <div>

          <h3
            className="
              text-[16px]
              md:text-[17px]
              font-semibold
              text-white
              mb-5
            "
          >
            Contact Us
          </h3>


          {/* PHONE */}

          <a
            href="tel:7397265693"
            className="
              flex
              items-center
              gap-3

              text-[14px]
              text-white/70

              hover:text-white

              transition-colors
              duration-300
            "
          >

            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 3.1 5.18 2 2 0 0 1 5.11 3h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L9.01 10.73a16 16 0 0 0 4.26 4.26l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92z" />
            </svg>

            <span>
              7397265693
            </span>

          </a>


          {/* LOCATION */}

          <div
            className="
              flex
              items-center
              gap-3
              mt-5

              text-[14px]
              text-white/70
            "
          >

            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0"
            >
              <path d="M20 10c0 4.993-5.5 10-8 12-2.5-2-8-7.007-8-12a8 8 0 1 1 16 0Z" />

              <circle
                cx="12"
                cy="10"
                r="3"
              />
            </svg>

            <span>
              Chennai, India
            </span>

          </div>

        </div>

      </div>


      {/* =================================================
          COPYRIGHT
      ================================================== */}

      <div
        className="
          border-t
          border-white/10
        "
      >

        <div
          className="
            w-[92%]
            md:w-[90%]
            max-w-[1200px]
            mx-auto

            py-5

            text-center
            text-[13px]
            sm:text-[14px]

            text-white/70
          "
        >
          © 2026 ProdTrack. All rights reserved.
        </div>

      </div>

    </footer>
  );
};

export default Footer;