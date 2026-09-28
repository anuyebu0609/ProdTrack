import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

const Dashboard = () => {
  /* =========================================================
     CONSTANTS
  ========================================================= */

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const DAILY_TARGET = 60;
  const WEEKLY_TARGET = 300;
  const QUALITY_TARGET = 98;

  /* =========================================================
     EMPTY WEEK DATA
  ========================================================= */

  const emptyProduction = {
    Mon: "",
    Tue: "",
    Wed: "",
    Thu: "",
    Fri: "",
    Sat: "",
  };

  const emptyQuality = {
    Mon: { audited: "", errors: "" },
    Tue: { audited: "", errors: "" },
    Wed: { audited: "", errors: "" },
    Thu: { audited: "", errors: "" },
    Fri: { audited: "", errors: "" },
    Sat: { audited: "", errors: "" },
  };

  const emptyAttendance = {
    Mon: "",
    Tue: "",
    Wed: "",
    Thu: "",
    Fri: "",
    Sat: "",
  };

  /* =========================================================
     DATE HELPERS
     ========================================================= */

  const cloneDate = (date) => new Date(date.getTime());

  const addDays = (date, amount) => {
    const result = cloneDate(date);
    result.setDate(result.getDate() + amount);
    return result;
  };

  // Monday is the first day of the ProdTrack week.
  const getMonday = (date) => {
    const result = cloneDate(date);
    const day = result.getDay();
    const difference = day === 0 ? -6 : 1 - day;
    result.setDate(result.getDate() + difference);
    result.setHours(0, 0, 0, 0);
    return result;
  };

  const dateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatDayDate = (date) =>
    date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    });

  const formatWeekRange = (start, end) => {
    const sameYear =
      start.getFullYear() === end.getFullYear();

    if (sameYear) {
      return `${formatDayDate(start)} – ${formatDayDate(
        end
      )}, ${end.getFullYear()}`;
    }

    return `${formatDayDate(start)}, ${start.getFullYear()} – ${formatDayDate(
      end
    )}, ${end.getFullYear()}`;
  };

  const getCalendarDays = (monthDate) => {
    const firstDay = new Date(
      monthDate.getFullYear(),
      monthDate.getMonth(),
      1
    );

    const firstCalendarDay = new Date(firstDay);
    const firstWeekday = firstDay.getDay();
    firstCalendarDay.setDate(
      firstDay.getDate() - firstWeekday
    );

    return Array.from({ length: 42 }, (_, index) =>
      addDays(firstCalendarDay, index)
    );
  };

  /* =========================================================
     STATE
  ========================================================= */

  const defaultWeekStart = getMonday(new Date());

  const [activeSection, setActiveSection] =
    useState("dashboard");

  const [weekStart, setWeekStart] =
    useState(defaultWeekStart);

  const [weekEnd, setWeekEnd] =
    useState(addDays(defaultWeekStart, 5));

  const [calendarOpen, setCalendarOpen] =
    useState(false);

  const [calendarMonth, setCalendarMonth] =
    useState(
      new Date(
        defaultWeekStart.getFullYear(),
        defaultWeekStart.getMonth(),
        1
      )
    );

  const [production, setProduction] =
    useState(emptyProduction);

  const [quality, setQuality] =
    useState(emptyQuality);

  const [attendance, setAttendance] =
    useState(emptyAttendance);


  const [userEmail, setUserEmail] =
    useState("");

  const [isAdmin, setIsAdmin] =
    useState(false);


  /* =========================================================
     SUPABASE WEEK DATA HELPERS
  ========================================================= */

  const getEmptyWeek = () => ({
    production: { ...emptyProduction },
    quality: {
      Mon: { ...emptyQuality.Mon },
      Tue: { ...emptyQuality.Tue },
      Wed: { ...emptyQuality.Wed },
      Thu: { ...emptyQuality.Thu },
      Fri: { ...emptyQuality.Fri },
      Sat: { ...emptyQuality.Sat },
    },
    attendance: { ...emptyAttendance },
  });

  const applyWeekData = (data) => {
    const next = data || getEmptyWeek();

    const nextProduction = {
      ...emptyProduction,
      ...(next.production || {}),
    };

    const nextQuality = {
      Mon: { ...emptyQuality.Mon },
      Tue: { ...emptyQuality.Tue },
      Wed: { ...emptyQuality.Wed },
      Thu: { ...emptyQuality.Thu },
      Fri: { ...emptyQuality.Fri },
      Sat: { ...emptyQuality.Sat },
      ...(next.quality || {}),
    };

    const nextAttendance = {
      ...emptyAttendance,
      ...(next.attendance || {}),
    };

    setProduction(nextProduction);
    setQuality(nextQuality);
    setAttendance(nextAttendance);
  };

  /* =========================================================
     LOAD CURRENT USER + WEEK DATA FROM SUPABASE
  ========================================================= */

  const loadWeekData = async (startDate) => {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        window.location.href = "/login";
        return;
      }

      setUserEmail(user.email || "Team Member");

      const weekKey = dateKey(startDate);

      const [productionResult, qualityResult, attendanceResult] =
        await Promise.all([
          supabase
            .from("production")
            .select("*")
            .eq("user_id", user.id)
            .eq("week_start", weekKey)
            .maybeSingle(),

          supabase
            .from("quality")
            .select("*")
            .eq("user_id", user.id)
            .eq("week_start", weekKey)
            .maybeSingle(),

          supabase
            .from("attendance")
            .select("*")
            .eq("user_id", user.id)
            .eq("week_start", weekKey)
            .maybeSingle(),
        ]);

      if (productionResult.error) {
        throw productionResult.error;
      }

      if (qualityResult.error) {
        throw qualityResult.error;
      }

      if (attendanceResult.error) {
        throw attendanceResult.error;
      }

      const productionRow = productionResult.data;
      const qualityRow = qualityResult.data;
      const attendanceRow = attendanceResult.data;

      const weekData = {
        production: productionRow
          ? {
              Mon: productionRow.monday ?? "",
              Tue: productionRow.tuesday ?? "",
              Wed: productionRow.wednesday ?? "",
              Thu: productionRow.thursday ?? "",
              Fri: productionRow.friday ?? "",
              Sat: productionRow.saturday ?? "",
            }
          : emptyProduction,

        quality: qualityRow
          ? {
              Mon: {
                audited: qualityRow.monday_audited ?? "",
                errors: qualityRow.monday_errors ?? "",
              },
              Tue: {
                audited: qualityRow.tuesday_audited ?? "",
                errors: qualityRow.tuesday_errors ?? "",
              },
              Wed: {
                audited: qualityRow.wednesday_audited ?? "",
                errors: qualityRow.wednesday_errors ?? "",
              },
              Thu: {
                audited: qualityRow.thursday_audited ?? "",
                errors: qualityRow.thursday_errors ?? "",
              },
              Fri: {
                audited: qualityRow.friday_audited ?? "",
                errors: qualityRow.friday_errors ?? "",
              },
              Sat: {
                audited: qualityRow.saturday_audited ?? "",
                errors: qualityRow.saturday_errors ?? "",
              },
            }
          : emptyQuality,

        attendance: attendanceRow
          ? {
              Mon: attendanceRow.monday ?? "",
              Tue: attendanceRow.tuesday ?? "",
              Wed: attendanceRow.wednesday ?? "",
              Thu: attendanceRow.thursday ?? "",
              Fri: attendanceRow.friday ?? "",
              Sat: attendanceRow.saturday ?? "",
            }
          : emptyAttendance,
      };

      applyWeekData(weekData);
    } catch (error) {
      console.error("Unable to load Supabase week data:", error);
      applyWeekData(null);
    }
  };

  /* =========================================================
     LOAD CURRENT WEEK
  ========================================================= */

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          setIsAdmin(false);
          return;
        }

        const { data, error } = await supabase
          .from("admin_users")
          .select("id")
          .eq("id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Admin check error:", error);
          setIsAdmin(false);
          return;
        }

        setIsAdmin(Boolean(data));
      } catch (error) {
        console.error("Unable to check admin status:", error);
        setIsAdmin(false);
      }
    };

    checkAdmin();
    loadWeekData(defaultWeekStart);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* =========================================================
     SELECT A MONDAY-SATURDAY WEEK
  ========================================================= */

  const selectWeek = (selectedDate) => {
    const selectedMonday = getMonday(selectedDate);
    const selectedSaturday = addDays(selectedMonday, 5);

    setWeekStart(selectedMonday);
    setWeekEnd(selectedSaturday);

    setCalendarMonth(
      new Date(
        selectedMonday.getFullYear(),
        selectedMonday.getMonth(),
        1
      )
    );

    setCalendarOpen(false);

    loadWeekData(selectedMonday);
  };

  const previousMonth = () => {
    setCalendarMonth(
      new Date(
        calendarMonth.getFullYear(),
        calendarMonth.getMonth() - 1,
        1
      )
    );
  };

  const nextMonth = () => {
    setCalendarMonth(
      new Date(
        calendarMonth.getFullYear(),
        calendarMonth.getMonth() + 1,
        1
      )
    );
  };

  const isSameDate = (first, second) =>
    dateKey(first) === dateKey(second);

  const isInSelectedWeek = (date) =>
    date >= weekStart && date <= weekEnd;

  const getDayDate = (day) =>
    addDays(weekStart, days.indexOf(day));

  const getDayDateLabel = (day) =>
    formatDayDate(getDayDate(day));

  /* =========================================================
     PRODUCTION CALCULATION
  ========================================================= */

  const productionValues = days.map((day) => {
    return Number(production[day]) || 0;
  });

  const weeklyProduction =
    productionValues.reduce(
      (total, value) => total + value,
      0
    );

  const productionRemaining = Math.max(
    WEEKLY_TARGET - weeklyProduction,
    0
  );

  const productionPercentage = Math.min(
    (weeklyProduction / WEEKLY_TARGET) * 100,
    100
  );

  /* =========================================================
     QUALITY CALCULATION
  ========================================================= */

  let totalAudited = 0;
  let totalErrors = 0;

  days.forEach((day) => {
    totalAudited +=
      Number(quality[day]?.audited) || 0;

    totalErrors +=
      Number(quality[day]?.errors) || 0;
  });

  const qualityPercentage =
    totalAudited > 0
      ? ((totalAudited - totalErrors) /
          totalAudited) *
        100
      : 0;

  const qualityPassed =
    totalAudited > 0 &&
    qualityPercentage >= QUALITY_TARGET;

  const maxAllowedErrors = Math.floor(
    totalAudited * 0.02
  );

  const errorsRemaining = Math.max(
    maxAllowedErrors - totalErrors,
    0
  );

  /* =========================================================
     ATTENDANCE CALCULATION
  ========================================================= */

  const presentDays = days.filter(
    (day) => attendance[day] === "Present"
  ).length;

  const absentDays = days.filter(
    (day) => attendance[day] === "Absent"
  ).length;

  const attendancePercentage =
    (presentDays / days.length) * 100;

  /* =========================================================
     OVERALL STATUS
  ========================================================= */

  const overallOnTrack =
    weeklyProduction >= WEEKLY_TARGET &&
    qualityPassed;

  /* =========================================================
     NAVIGATION
  ========================================================= */

  const scrollToSection = (section) => {
    setActiveSection(section);

    const element =
      document.getElementById(section);

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  /* =========================================================
     ICON
  ========================================================= */

  const Icon = ({ type, size = 22 }) => {
    const props = {
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
    };

    if (type === "home") {
      return (
        <svg {...props}>
          <path d="m3 10 9-7 9 7" />
          <path d="M5 9v11h14V9" />
          <path d="M9 20v-6h6v6" />
        </svg>
      );
    }

    if (type === "production") {
      return (
        <svg {...props}>
          <path d="M4 19V5" />
          <path d="M4 19h17" />
          <rect
            x="7"
            y="11"
            width="3"
            height="5"
          />
          <rect
            x="12"
            y="7"
            width="3"
            height="9"
          />
          <rect
            x="17"
            y="4"
            width="3"
            height="12"
          />
        </svg>
      );
    }

    if (type === "quality") {
      return (
        <svg {...props}>
          <path d="M12 3 20 6v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
    }

    if (type === "attendance") {
      return (
        <svg {...props}>
          <rect
            x="3"
            y="4"
            width="18"
            height="17"
            rx="2"
          />
          <path d="M16 2v4" />
          <path d="M8 2v4" />
          <path d="M3 9h18" />
          <path d="m8 14 2 2 4-4" />
        </svg>
      );
    }

    if (type === "team") {
      return (
        <svg {...props}>
          <circle cx="9" cy="8" r="3" />
          <circle cx="17" cy="9" r="2.5" />
          <path d="M3 20c0-3.5 2.5-6 6-6s6 3 6 6" />
          <path d="M15 14c3 0 5 2 5 5" />
        </svg>
      );
    }

    if (type === "calendar") {
      return (
        <svg {...props}>
          <rect
            x="3"
            y="4"
            width="18"
            height="17"
            rx="2"
          />
          <path d="M16 2v4" />
          <path d="M8 2v4" />
          <path d="M3 9h18" />
        </svg>
      );
    }

    if (type === "target") {
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="5" />
          <circle cx="12" cy="12" r="1" />
        </svg>
      );
    }

    if (type === "user") {
      return (
        <svg {...props}>
          <circle cx="12" cy="7" r="4" />
          <path d="M4 21c0-4 3.5-7 8-7s8 3 8 7" />
        </svg>
      );
    }

    if (type === "check") {
      return (
        <svg {...props}>
          <path d="m5 12 4 4L19 6" />
        </svg>
      );
    }

    if (type === "alert") {
      return (
        <svg {...props}>
          <path d="M12 3 2.5 20h19L12 3Z" />
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
        </svg>
      );
    }


    return null;
  };

  /* =========================================================
     STATUS BADGE
  ========================================================= */

  const StatusBadge = ({
    good,
    children,
  }) => {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
          good
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-600"
        }`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            good
              ? "bg-green-500"
              : "bg-red-500"
          }`}
        ></span>

        {children}
      </span>
    );
  };

  /* =========================================================
     SIDEBAR
  ========================================================= */

  const sidebarItems = [
    {
      name: "Dashboard",
      id: "dashboard",
      icon: "home",
    },
    {
      name: "Production",
      id: "production",
      icon: "production",
    },
    {
      name: "Quality",
      id: "quality",
      icon: "quality",
    },
    {
      name: "Attendance",
      id: "attendance",
      icon: "attendance",
    },
  ];

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#123B7A]">

      {/* =====================================================
          IMPORTANT LAYOUT
          Sidebar is now STICKY instead of FIXED.
          This prevents it from covering the Footer.
      ====================================================== */}

      <div className="flex items-start w-full">

        {/* =====================================================
            SIDEBAR
        ====================================================== */}

        <aside
          className="
            hidden
            lg:flex
            sticky
            top-[75px]
            self-start
            flex-shrink-0
            w-[255px]
            h-[calc(100vh-75px)]
            bg-[#123B7A]
            text-white
            flex-col
            z-30
          "
        >

          {/* SIDEBAR LOGO */}

          <div className="h-[88px] px-7 flex items-center border-b border-white/10">

            <div className="flex items-center gap-3">

              <div className="w-11 h-11 rounded-lg bg-[#FF8500] flex items-center justify-center">

                <Icon
                  type="target"
                  size={28}
                />

              </div>

              <div className="text-2xl font-bold">

                <span>Prod</span>

                <span className="text-[#FF8500]">
                  Track
                </span>

              </div>

            </div>

          </div>


          {/* SIDEBAR MENU */}

          <div className="px-4 pt-6 flex-1">

            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() =>
                  scrollToSection(item.id)
                }
                className={`w-full flex items-center gap-4 px-4 py-3.5 mb-2 rounded-xl transition-all text-left ${
                  activeSection === item.id
                    ? "bg-[#FF8500] text-white shadow-lg"
                    : "text-white/90 hover:bg-white/10"
                }`}
              >

                <Icon
                  type={item.icon}
                  size={22}
                />

                <span className="text-[15px] font-medium">
                  {item.name}
                </span>

              </button>
            ))}

          </div>


          {/* SIDEBAR USER */}

          <div className="p-6 border-t border-white/10">

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-full bg-[#FF8500] flex items-center justify-center">

                <Icon
                  type="user"
                  size={20}
                />

              </div>

              <div>

                <p className="text-sm font-semibold">
                  {userEmail || "Team Member"}
                </p>

                <p className="text-xs text-white/60">
                  ProdTrack
                </p>

              </div>

            </div>

          </div>

        </aside>


        {/* =====================================================
            MAIN DASHBOARD
        ====================================================== */}

        <div className="flex-1 min-w-0">

          {/* ===================================================
              DASHBOARD INTERNAL HEADER
          ==================================================== */}

          <header className="h-[75px] bg-white border-b border-gray-100">

            <div className="h-full px-5 md:px-8 flex items-center justify-between">

              {/* MOBILE LOGO */}

              <div className="lg:hidden flex items-center gap-2">

                <div className="w-9 h-9 rounded-lg bg-[#FF8500] text-white flex items-center justify-center">

                  <Icon
                    type="target"
                    size={21}
                  />

                </div>

                <div className="text-xl font-bold">

                  <span className="text-[#123B7A]">
                    Prod
                  </span>

                  <span className="text-[#FF8500]">
                    Track
                  </span>

                </div>

              </div>


              {/* WEEK CALENDAR */}

              <div className="hidden md:block relative">
                <button
                  type="button"
                  onClick={() =>
                    setCalendarOpen((open) => !open)
                  }
                  className="flex items-center gap-3 px-4 py-2.5 rounded-lg border border-[#E2EAF4] bg-[#F8FAFC] hover:border-[#FF8500] hover:bg-[#FFF7ED] transition text-left"
                >
                  <Icon
                    type="calendar"
                    size={18}
                  />

                  <div>
                    <p className="text-xs text-gray-500">
                      Selected Week
                    </p>

                    <p className="text-sm font-semibold text-[#123B7A]">
                      {formatWeekRange(weekStart, weekEnd)}
                    </p>
                  </div>

                  <span
                    className={`ml-1 text-xs transition-transform ${
                      calendarOpen ? "rotate-180" : ""
                    }`}
                  >
                    ▼
                  </span>
                </button>

                {calendarOpen && (
                  <div className="absolute left-0 top-full mt-2 z-[100] w-[350px] max-w-[calc(100vw-24px)] bg-white border border-gray-200 rounded-2xl shadow-2xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <button
                        type="button"
                        onClick={previousMonth}
                        className="w-9 h-9 rounded-lg hover:bg-[#FFF7ED] text-[#123B7A] font-bold"
                        aria-label="Previous month"
                      >
                        ‹
                      </button>

                      <div className="text-sm font-bold text-[#123B7A]">
                        {calendarMonth.toLocaleDateString(
                          "en-IN",
                          {
                            month: "long",
                            year: "numeric",
                          }
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={nextMonth}
                        className="w-9 h-9 rounded-lg hover:bg-[#FFF7ED] text-[#123B7A] font-bold"
                        aria-label="Next month"
                      >
                        ›
                      </button>
                    </div>

                    <div className="mb-3 rounded-xl bg-[#F8FAFC] border border-[#E2EAF4] px-3 py-2">
                      <p className="text-[11px] text-gray-500">
                        Selected Monday – Saturday
                      </p>

                      <p className="text-sm font-bold text-[#123B7A]">
                        {formatWeekRange(weekStart, weekEnd)}
                      </p>
                    </div>

                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                        (dayName) => (
                          <div
                            key={dayName}
                            className={`text-center text-[11px] font-bold py-1 ${
                              dayName === "Sun"
                                ? "text-gray-300"
                                : "text-gray-500"
                            }`}
                          >
                            {dayName}
                          </div>
                        )
                      )}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                      {getCalendarDays(calendarMonth).map(
                        (date) => {
                          const isSunday =
                            date.getDay() === 0;

                          const isCurrentMonth =
                            date.getMonth() ===
                              calendarMonth.getMonth() &&
                            date.getFullYear() ===
                              calendarMonth.getFullYear();

                          const selected =
                            isInSelectedWeek(date);

                          const isWeekStart =
                            isSameDate(date, weekStart);

                          const isWeekEnd =
                            isSameDate(date, weekEnd);

                          return (
                            <button
                              type="button"
                              key={dateKey(date)}
                              disabled={isSunday}
                              onClick={() =>
                                !isSunday &&
                                selectWeek(date)
                              }
                              className={`h-9 rounded-lg text-xs font-semibold transition ${
                                isSunday
                                  ? "text-gray-200 cursor-not-allowed"
                                  : selected
                                  ? "bg-[#FF8500] text-white shadow-sm"
                                  : isCurrentMonth
                                  ? "text-[#123B7A] hover:bg-[#FFF0DE]"
                                  : "text-gray-300 hover:bg-gray-50"
                              } ${
                                isWeekStart || isWeekEnd
                                  ? "ring-2 ring-[#FF8500]/30"
                                  : ""
                              }`}
                              title={
                                isSunday
                                  ? "Sunday is not part of the ProdTrack week"
                                  : `Select week starting ${formatDayDate(
                                      getMonday(date)
                                    )}`
                              }
                            >
                              {date.getDate()}
                            </button>
                          );
                        }
                      )}
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-[11px] text-gray-500">
                        Click any Monday–Saturday date to select its
                        complete Monday–Saturday week.
                      </p>
                    </div>
                  </div>
                )}
              </div>


              {/* TOP RIGHT USER + ADMIN BUTTON */}

              <div className="flex items-center gap-3 ml-auto">

                <div className="flex items-center gap-3">

                  <div className="w-10 h-10 rounded-full bg-[#123B7A] text-white flex items-center justify-center">

                    <Icon
                      type="user"
                      size={19}
                    />

                  </div>

                  <div className="hidden sm:block">

                    <p className="text-sm font-semibold">
                      {userEmail || "Team Member"}
                    </p>

                    <p className="text-xs text-gray-500">
                      Weekly Performance
                    </p>

                  </div>

                </div>

                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      window.location.href = "/AdminDashboard";
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FF8500] text-white font-semibold text-sm hover:bg-[#e87500] transition-all duration-200 shadow-md hover:shadow-lg whitespace-nowrap"
                  >
                    <Icon
                      type="team"
                      size={18}
                    />
                    <span>Admin Dashboard</span>
                  </button>
                )}

              </div>

            </div>

          </header>


          {/* ===================================================
              PAGE CONTENT
          ==================================================== */}

          <div className="p-5 md:p-8 space-y-7">

            {/* =================================================
                DASHBOARD
            ================================================== */}

            <section
              id="dashboard"
              className="scroll-mt-24"
            >

              <div className="mb-6">

                <h1 className="text-2xl md:text-3xl font-bold">
                  Welcome Back
                </h1>

                <p className="text-gray-500 mt-1">
                  Here's your weekly performance at a glance. Your data is updated by your team lead.
                </p>

              </div>


              {/* KPI CARDS */}

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

                {/* PRODUCTION */}

                <div
                  onClick={() =>
                    scrollToSection("production")
                  }
                  className="bg-white rounded-2xl border border-[#FFE0C2] p-5 shadow-sm cursor-pointer hover:shadow-md transition"
                >

                  <div className="flex items-center gap-3">

                    <div className="w-11 h-11 rounded-full bg-[#FFF0DE] text-[#FF8500] flex items-center justify-center">

                      <Icon
                        type="production"
                        size={22}
                      />

                    </div>

                    <h3 className="font-semibold">
                      Production
                    </h3>

                  </div>


                  <div className="mt-4">

                    <div className="text-3xl font-bold">

                      {weeklyProduction}

                      <span className="text-lg text-gray-400">
                        {" "}
                        / {WEEKLY_TARGET}
                      </span>

                    </div>

                    <p className="text-sm text-gray-500">
                      weekly accounts
                    </p>

                  </div>


                  <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">

                    <div
                      className="h-full bg-[#FF8500] rounded-full transition-all"
                      style={{
                        width: `${productionPercentage}%`,
                      }}
                    ></div>

                  </div>


                  <p className="text-sm mt-2 text-gray-500">

                    Balance:{" "}

                    <strong className="text-[#123B7A]">
                      {productionRemaining}
                    </strong>

                  </p>

                </div>


                {/* QUALITY */}

                <div
                  onClick={() =>
                    scrollToSection("quality")
                  }
                  className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm cursor-pointer hover:shadow-md transition"
                >

                  <div className="flex items-center gap-3">

                    <div className="w-11 h-11 rounded-full bg-blue-50 text-[#123B7A] flex items-center justify-center">

                      <Icon
                        type="quality"
                        size={22}
                      />

                    </div>

                    <h3 className="font-semibold">
                      Quality
                    </h3>

                  </div>


                  <div className="mt-4">

                    <div className="text-3xl font-bold">

                      {totalAudited > 0
                        ? qualityPercentage.toFixed(1)
                        : "0.0"}
                      %

                    </div>

                    <p className="text-sm text-gray-500">
                      Target: 98%
                    </p>

                  </div>


                  <div className="mt-4">

                    {totalAudited === 0 ? (
                      <StatusBadge good={false}>
                        No Data
                      </StatusBadge>
                    ) : (
                      <StatusBadge good={qualityPassed}>
                        {qualityPassed
                          ? "On Track"
                          : "Needs Attention"}
                      </StatusBadge>
                    )}

                  </div>

                </div>


                {/* ATTENDANCE */}

                <div
                  onClick={() =>
                    scrollToSection("attendance")
                  }
                  className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm cursor-pointer hover:shadow-md transition"
                >

                  <div className="flex items-center gap-3">

                    <div className="w-11 h-11 rounded-full bg-blue-50 text-[#123B7A] flex items-center justify-center">

                      <Icon
                        type="attendance"
                        size={22}
                      />

                    </div>

                    <h3 className="font-semibold">
                      Attendance
                    </h3>

                  </div>


                  <div className="mt-4">

                    <div className="text-3xl font-bold">

                      {presentDays}

                      <span className="text-lg text-gray-400">
                        {" "}
                        / 6
                      </span>

                    </div>

                    <p className="text-sm text-gray-500">
                      days present
                    </p>

                  </div>


                  <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">

                    <div
                      className="h-full bg-[#FF8500] rounded-full"
                      style={{
                        width: `${attendancePercentage}%`,
                      }}
                    ></div>

                  </div>

                </div>


                {/* OVERALL */}

                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">

                  <div className="flex items-center gap-3">

                    <div className="w-11 h-11 rounded-full bg-[#FFF0DE] text-[#FF8500] flex items-center justify-center">

                      <Icon
                        type="target"
                        size={22}
                      />

                    </div>

                    <h3 className="font-semibold">
                      Overall Status
                    </h3>

                  </div>


                  <div
                    className={`mt-4 rounded-xl p-4 ${
                      overallOnTrack
                        ? "bg-green-50"
                        : "bg-red-50"
                    }`}
                  >

                    <p
                      className={`font-bold ${
                        overallOnTrack
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {overallOnTrack
                        ? "On Track"
                        : "Needs Attention"}
                    </p>

                    <p className="text-xs text-gray-500 mt-1">

                      {overallOnTrack
                        ? "Great job! Keep going."
                        : "Check your remaining targets."}

                    </p>

                  </div>

                </div>

              </div>


              {/* ALERTS */}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">

                {productionRemaining > 0 && (
                  <div className="bg-[#FFF7ED] border border-[#FFD9AD] rounded-2xl p-5">

                    <div className="flex items-start gap-4">

                      <div className="w-11 h-11 rounded-full bg-[#FF8500] text-white flex items-center justify-center shrink-0">

                        <Icon
                          type="alert"
                          size={21}
                        />

                      </div>

                      <div>

                        <h3 className="font-bold">
                          Production Reminder
                        </h3>

                        <p className="text-sm text-gray-600 mt-1">

                          You need to achieve{" "}

                          <strong className="text-[#FF8500]">
                            {productionRemaining}
                          </strong>{" "}

                          more accounts to reach your
                          weekly target of{" "}
                          <strong>
                            {WEEKLY_TARGET}
                          </strong>.

                        </p>

                      </div>

                    </div>

                  </div>
                )}


                {totalAudited > 0 && !qualityPassed && (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-5">

                    <div className="flex items-start gap-4">

                      <div className="w-11 h-11 rounded-full bg-red-500 text-white flex items-center justify-center shrink-0">

                        <Icon
                          type="alert"
                          size={21}
                        />

                      </div>

                      <div>

                        <h3 className="font-bold text-red-700">
                          Quality Reminder
                        </h3>

                        <p className="text-sm text-gray-600 mt-1">

                          Your current quality is{" "}

                          <strong>
                            {qualityPercentage.toFixed(1)}%
                          </strong>.

                          Keep future errors as low as
                          possible to maintain the{" "}
                          <strong>
                            98%
                          </strong>{" "}
                          target.

                        </p>

                      </div>

                    </div>

                  </div>
                )}

              </div>

            </section>


            {/* =================================================
                PRODUCTION
            ================================================== */}

            <section
              id="production"
              className="scroll-mt-24"
            >

              <div className="mb-5">

                <h2 className="text-xl md:text-2xl font-bold">
                  Production
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Your saved production performance.
                </p>

              </div>


              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-7">

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-7">

                  <div className="bg-[#F8FAFC] rounded-xl p-5">

                    <p className="text-xs text-gray-500">
                      Weekly Production
                    </p>

                    <p className="text-3xl font-bold mt-1">
                      {weeklyProduction}
                    </p>

                  </div>


                  <div className="bg-[#F8FAFC] rounded-xl p-5">

                    <p className="text-xs text-gray-500">
                      Weekly Target
                    </p>

                    <p className="text-3xl font-bold mt-1">
                      {WEEKLY_TARGET}
                    </p>

                  </div>


                  <div className="bg-[#FFF7ED] rounded-xl p-5">

                    <p className="text-xs text-gray-500">
                      Balance
                    </p>

                    <p className="text-3xl font-bold text-[#FF8500] mt-1">
                      {productionRemaining}
                    </p>

                  </div>

                </div>


                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">

                  {days.map((day) => {

                    const value =
                      Number(
                        production[day]
                      ) || 0;

                    const reached =
                      value >= DAILY_TARGET;

                    return (
                      <div
                        key={day}
                        className="text-center"
                      >

                        <div className="mb-3">
                          <p className="text-sm font-bold text-[#123B7A]">
                            {day}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {getDayDateLabel(day)}
                          </p>
                        </div>

                        <div className="h-[160px] bg-[#F8FAFC] rounded-xl flex items-end justify-center p-3">

                          <div
                            className={`w-full max-w-[45px] rounded-t-lg ${
                              reached
                                ? "bg-[#123B7A]"
                                : value > 0
                                ? "bg-[#FF8500]"
                                : "bg-gray-200"
                            }`}
                            style={{
                              height: `${Math.max(
                                Math.min(
                                  (value /
                                    DAILY_TARGET) *
                                    130,
                                  130
                                ),
                                value > 0
                                  ? 8
                                  : 4
                              )}px`,
                            }}
                          ></div>

                        </div>

                        <p className="font-bold text-lg mt-2">
                          {value}
                        </p>

                      </div>
                    );
                  })}

                </div>


                {productionRemaining > 0 && (
                  <div className="mt-7 bg-[#FFF7ED] border border-[#FFD9AD] rounded-xl p-5">

                    <div className="flex gap-3">

                      <div className="text-[#FF8500]">

                        <Icon
                          type="alert"
                          size={21}
                        />

                      </div>

                      <div>

                        <p className="font-semibold">
                          Production Reminder
                        </p>

                        <p className="text-sm text-gray-600 mt-1">

                          You need to achieve{" "}

                          <strong className="text-[#FF8500]">
                            {productionRemaining}
                          </strong>{" "}

                          more accounts to complete your
                          weekly target.

                        </p>

                      </div>

                    </div>

                  </div>
                )}

              </div>

            </section>


            {/* =================================================
                QUALITY
            ================================================== */}

            <section
              id="quality"
              className="scroll-mt-24"
            >

              <div className="mb-5">

                <h2 className="text-xl md:text-2xl font-bold">
                  Quality
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Your saved audit performance.
                </p>

              </div>


              <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

                <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-7">

                  <div className="overflow-x-auto">

                    <table className="w-full min-w-[600px]">

                      <thead>

                        <tr className="bg-[#F8FAFC] text-left text-sm">

                          <th className="px-4 py-3">
                            Day
                          </th>

                          <th className="px-4 py-3">
                            Audited
                          </th>

                          <th className="px-4 py-3">
                            Errors
                          </th>

                          <th className="px-4 py-3">
                            Quality
                          </th>

                          <th className="px-4 py-3">
                            Status
                          </th>

                        </tr>

                      </thead>

                      <tbody>

                        {days.map((day) => {

                          const audited =
                            Number(
                              quality[day]?.audited
                            ) || 0;

                          const errors =
                            Number(
                              quality[day]?.errors
                            ) || 0;

                          const percentage =
                            audited > 0
                              ? ((audited -
                                  errors) /
                                  audited) *
                                100
                              : 0;

                          return (
                            <tr
                              key={day}
                              className="border-b border-gray-100"
                            >

                              <td className="px-4 py-4">
                                <p className="font-semibold">
                                  {day}
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                  {getDayDateLabel(day)}
                                </p>
                              </td>

                              <td className="px-4 py-4">
                                {audited}
                              </td>

                              <td className="px-4 py-4">
                                {errors}
                              </td>

                              <td className="px-4 py-4 font-semibold">

                                {audited > 0
                                  ? `${percentage.toFixed(
                                      1
                                    )}%`
                                  : "--"}

                              </td>

                              <td className="px-4 py-4">

                                {audited > 0 ? (
                                  <StatusBadge
                                    good={
                                      percentage >=
                                      QUALITY_TARGET
                                    }
                                  >
                                    {percentage >=
                                    QUALITY_TARGET
                                      ? "Green"
                                      : "Red"}
                                  </StatusBadge>
                                ) : (
                                  <span className="text-xs text-gray-400">
                                    No data
                                  </span>
                                )}

                              </td>

                            </tr>
                          );
                        })}

                      </tbody>

                    </table>

                  </div>

                </div>


                {/* QUALITY SUMMARY */}

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-7">

                  <div className="flex items-center gap-3">

                    <div className="w-11 h-11 rounded-full bg-blue-50 text-[#123B7A] flex items-center justify-center">

                      <Icon
                        type="quality"
                        size={22}
                      />

                    </div>

                    <h3 className="font-bold">
                      Weekly Quality
                    </h3>

                  </div>


                  <div className="mt-6">

                    <p className="text-sm text-gray-500">
                      Current Average
                    </p>

                    <p
                      className={`text-4xl font-bold mt-1 ${
                        qualityPassed
                          ? "text-green-600"
                          : totalAudited > 0
                          ? "text-red-600"
                          : "text-[#123B7A]"
                      }`}
                    >

                      {qualityPercentage.toFixed(
                        1
                      )}
                      %

                    </p>

                  </div>


                  <div className="mt-5 h-3 bg-gray-100 rounded-full overflow-hidden">

                    <div
                      className={`h-full rounded-full ${
                        qualityPassed
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                      style={{
                        width: `${Math.min(
                          qualityPercentage,
                          100
                        )}%`,
                      }}
                    ></div>

                  </div>


                  <div className="mt-5 space-y-3">

                    <div className="flex justify-between text-sm">

                      <span className="text-gray-500">
                        Audited
                      </span>

                      <strong>
                        {totalAudited}
                      </strong>

                    </div>


                    <div className="flex justify-between text-sm">

                      <span className="text-gray-500">
                        Total Errors
                      </span>

                      <strong>
                        {totalErrors}
                      </strong>

                    </div>


                    <div className="flex justify-between text-sm">

                      <span className="text-gray-500">
                        Target
                      </span>

                      <strong>
                        98%
                      </strong>

                    </div>

                  </div>


                  {totalAudited > 0 && (
                    <div className="mt-5 bg-[#FFF7ED] border border-[#FFD9AD] rounded-xl p-4">

                      <p className="text-sm font-semibold">
                        Error Reminder
                      </p>

                      <p className="text-sm text-gray-600 mt-1">

                        {errorsRemaining > 0
                          ? `You can avoid ${
                              errorsRemaining
                            } more error${
                              errorsRemaining !==
                              1
                                ? "s"
                                : ""
                            } to stay at or above 98%.`
                          : "Avoid further errors to protect your 98% target."}

                      </p>

                    </div>
                  )}

                </div>

              </div>

            </section>


            {/* =================================================
                ATTENDANCE
            ================================================== */}

            <section
              id="attendance"
              className="scroll-mt-24"
            >

              <div className="mb-5">

                <h2 className="text-xl md:text-2xl font-bold">
                  Attendance
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Your saved attendance from Monday to Saturday.
                </p>

              </div>


              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-7">

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">

                  {days.map((day) => {

                    const status =
                      attendance[day];

                    const present =
                      status === "Present";

                    const absent =
                      status === "Absent";

                    return (
                      <div
                        key={day}
                        className={`rounded-xl p-5 border ${
                          present
                            ? "bg-green-50 border-green-200"
                            : absent
                            ? "bg-red-50 border-red-200"
                            : "bg-gray-50 border-gray-200"
                        }`}
                      >

                        <p className="font-bold">
                          {day}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {getDayDateLabel(day)}
                        </p>

                        <div
                          className={`mt-4 text-sm font-semibold ${
                            present
                              ? "text-green-600"
                              : absent
                              ? "text-red-600"
                              : "text-gray-400"
                          }`}
                        >

                          {status || "Not Updated"}

                        </div>

                      </div>
                    );
                  })}

                </div>


                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">

                  <div className="bg-green-50 rounded-xl p-5">

                    <p className="text-xs text-gray-500">
                      Present
                    </p>

                    <p className="text-2xl font-bold text-green-600 mt-1">
                      {presentDays}
                    </p>

                  </div>


                  <div className="bg-red-50 rounded-xl p-5">

                    <p className="text-xs text-gray-500">
                      Absent
                    </p>

                    <p className="text-2xl font-bold text-red-600 mt-1">
                      {absentDays}
                    </p>

                  </div>


                  <div className="bg-[#F8FAFC] rounded-xl p-5">

                    <p className="text-xs text-gray-500">
                      Attendance
                    </p>

                    <p className="text-2xl font-bold mt-1">

                      {attendancePercentage.toFixed(
                        0
                      )}
                      %

                    </p>

                  </div>

                </div>

              </div>

            </section>


          </div>

        </div>

      </div>

    </div>
  );
};

export default Dashboard;