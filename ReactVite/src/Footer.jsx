import { Logo } from "./assets/HeaderImage/HeaderImage";

const Footer = () => {
  return (
    <footer className="w-full bg-[#123B7A] text-white">

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
          lg:grid-cols-3

          gap-8
          md:gap-10
          lg:gap-12
        "
      >

        {/* =================================================
            COMPANY INFO
        ================================================== */}

        <div>

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

            {/* HOME */}

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


            {/* DASHBOARD */}

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


            {/* ABOUT US */}

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