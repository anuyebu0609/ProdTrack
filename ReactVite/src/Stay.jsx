const Stay = () => {
  return (
    <section className="w-full bg-white py-8 md:py-10">

      {/* ================= MAIN BANNER ================= */}

      <div
        className="
          w-[92%]
          md:w-[90%]
          max-w-[1250px]
          mx-auto

          bg-[#5B2EFF]

          rounded-xl
          md:rounded-2xl

          px-5
          sm:px-7
          md:px-10
          lg:px-12

          py-6
          sm:py-7
          md:py-8

          shadow-[0_8px_25px_rgba(91,46,255,0.20)]
        "
      >

        <div
          className="
            flex
            flex-col
            sm:flex-row
            items-center
            justify-between

            gap-6
            sm:gap-5
            md:gap-8
          "
        >

          {/* =================================================
              LEFT SECTION
          ================================================== */}

          <div
            className="
              flex
              items-center
              gap-4
              sm:gap-5
              w-full
              sm:w-auto
            "
          >

            {/* ================= TROPHY ICON ================= */}

            <div
              className="
                shrink-0

                w-[58px]
                h-[58px]

                sm:w-[64px]
                sm:h-[64px]

                md:w-[72px]
                md:h-[72px]

                rounded-full

                bg-white/10

                flex
                items-center
                justify-center

                border
                border-white/10
              "
            >

              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="34"
                height="34"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10 14.66V17a1 1 0 0 1-1 1 2 2 0 0 0-2 2v2" />
                <path d="M14 14.66V17a1 1 0 0 0 1 1 2 2 0 0 1 2 2v2" />
                <path d="M17.916 10H19.5A2.5 2.5 0 0 0 22 7.5V5a1 1 0 0 0-1-1h-3" />
                <path d="M4 22h16" />
                <path d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z" />
                <path d="M6.084 10H4.5A2.5 2.5 0 0 1 2 7.5V5a1 1 0 0 1 1-1h3" />
              </svg>

            </div>


            {/* ================= TEXT ================= */}

            <div className="text-left">

              <h2
                className="
                  text-white
                  text-[18px]
                  sm:text-[20px]
                  md:text-[22px]
                  lg:text-[24px]
                  font-bold
                  leading-tight
                "
              >
                Stay Consistent. Stay Excellent.
              </h2>


              <p
                className="
                  text-white/90
                  text-[13px]
                  sm:text-[14px]
                  md:text-[15px]
                  mt-1
                  leading-6
                "
              >
                Hit your targets. Maintain quality.
              </p>


              <p
                className="
                  text-white/90
                  text-[13px]
                  sm:text-[14px]
                  md:text-[15px]
                  leading-5
                "
              >
                Be the best every week!
              </p>

            </div>

          </div>


          {/* =================================================
              LOGIN BUTTON
          ================================================== */}

          <div className="shrink-0">

            <a
              href="/login"
              className="
                group

                min-w-[145px]
                sm:min-w-[150px]
                md:min-w-[155px]

                px-6
                sm:px-7
                md:px-8

                py-3
                sm:py-3.5

                bg-white

                text-[#5B2EFF]

                rounded-lg

                flex
                items-center
                justify-center
                gap-3

                text-[14px]
                sm:text-[15px]
                md:text-[16px]

                font-semibold

                shadow-sm

                transition-all
                duration-300

                hover:shadow-lg
                hover:-translate-y-1
              "
            >

              <span>
                Login Now
              </span>


              {/* ================= ARROW ================= */}

              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="21"
                height="21"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="
                  transition-transform
                  duration-300
                  group-hover:translate-x-1
                "
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>

            </a>

          </div>

        </div>

      </div>

    </section>
  );
};

export default Stay;