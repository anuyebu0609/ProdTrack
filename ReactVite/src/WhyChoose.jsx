import Reveal from "./Reveal";

const WhyChoose = () => {
  const items = [
    {
      title: "Production Tracking",
      description:
        "Set daily and weekly targets and track your progress with ease.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#5B2EFF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
          <path d="M16.24 7.76 19 5" />
          <path d="M19 5v4" />
          <path d="M19 5h-4" />
        </svg>
      ),
    },

    {
      title: "Quality Management",
      description:
        "Enter audited accounts and errors to get your real-time quality status.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#5B2EFF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      ),
    },

    {
      title: "Attendance Tracking",
      description:
        "Mark your attendance from Monday to Saturday and stay consistent.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#5B2EFF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M8 2v3" />
          <path d="M16 2v3" />

          <rect
            width="18"
            height="18"
            x="3"
            y="3"
            rx="2"
          />

          <path d="M3 9h18" />

          <path d="M8 13h.01" />
          <path d="M12 13h.01" />
          <path d="M16 13h.01" />

          <path d="M8 17h.01" />
          <path d="M12 17h.01" />
          <path d="M16 17h.01" />
        </svg>
      ),
    },

    {
      title: "Team Overview",
      description:
        "View all team members' performance in one place and stay informed.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#5B2EFF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />

          <circle
            cx="9"
            cy="7"
            r="4"
          />

          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />

          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
  ];

  return (
    <section className="w-full bg-white py-12 md:py-16 lg:py-20">

      {/* =====================================================
          HEADING
      ====================================================== */}

      <Reveal>
        <div className="w-[92%] sm:w-[90%] max-w-[1200px] mx-auto text-center">

          <h2
            className="
              text-[26px]
              sm:text-[28px]
              md:text-[32px]
              lg:text-[34px]
              font-bold
              text-[#111111]
            "
          >
            Why Choose ProdTrack?
          </h2>

          {/* PURPLE UNDERLINE */}

          <div
            className="
              w-[55px]
              h-[4px]
              bg-[#5B2EFF]
              rounded-full
              mx-auto
              mt-3
            "
          />

        </div>
      </Reveal>


      {/* =====================================================
          CARDS
      ====================================================== */}

      <div
        className="
          w-[92%]
          sm:w-[90%]
          max-w-[1200px]
          mx-auto

          grid
          grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-4

          gap-5
          md:gap-6

          mt-9
          md:mt-10

          items-stretch
        "
      >

        {items.map((item, index) => (
          <Reveal
            key={item.title}
            delay={0.1 * (index + 1)}
            className="h-full"
          >

            {/* =================================================
                CARD
            ================================================== */}

            <div
              className="
                group

                w-full
                h-full
                min-h-[270px]

                flex
                flex-col
                items-center
                justify-center

                px-5
                py-8
                md:px-6
                md:py-9

                bg-white

                border
                border-gray-100

                rounded-xl

                shadow-[0_4px_20px_rgba(0,0,0,0.06)]

                transition-all
                duration-300

                hover:-translate-y-2

                hover:border-[#5B2EFF]/20

                hover:shadow-[0_12px_30px_rgba(91,46,255,0.12)]
              "
            >

              {/* =================================================
                  ICON
              ================================================== */}

              <div
                className="
                  w-[76px]
                  h-[76px]

                  flex
                  items-center
                  justify-center

                  shrink-0

                  rounded-full

                  bg-[#E7E0FC]

                  transition-all
                  duration-300

                  group-hover:bg-[#5B2EFF]
                "
              >

                <div
                  className="
                    flex
                    items-center
                    justify-center

                    transition-all
                    duration-300

                    group-hover:[&_svg]:stroke-white
                  "
                >
                  {item.icon}
                </div>

              </div>


              {/* =================================================
                  CONTENT
              ================================================== */}

              <div
                className="
                  w-full
                  mt-6

                  flex
                  flex-col
                  items-center
                "
              >

                <h3
                  className="
                    text-[18px]
                    md:text-[19px]

                    font-semibold

                    text-[#111111]

                    text-center

                    min-h-[28px]

                    flex
                    items-center
                    justify-center
                  "
                >
                  {item.title}
                </h3>


                <p
                  className="
                    mt-3

                    text-[14px]
                    md:text-[15px]

                    leading-6

                    font-medium

                    text-[#111111]/75

                    text-center

                    max-w-[240px]

                    min-h-[72px]

                    flex
                    items-start
                    justify-center
                  "
                >
                  {item.description}
                </p>

              </div>

            </div>

          </Reveal>
        ))}

      </div>

    </section>
  );
};

export default WhyChoose;