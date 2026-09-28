import { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabaseClient";

const DAYS = [
  {
    key: "monday",
    short: "Mon",
    production: "monday",
    audited: "monday_audited",
    errors: "monday_errors",
  },
  {
    key: "tuesday",
    short: "Tue",
    production: "tuesday",
    audited: "tuesday_audited",
    errors: "tuesday_errors",
  },
  {
    key: "wednesday",
    short: "Wed",
    production: "wednesday",
    audited: "wednesday_audited",
    errors: "wednesday_errors",
  },
  {
    key: "thursday",
    short: "Thu",
    production: "thursday",
    audited: "thursday_audited",
    errors: "thursday_errors",
  },
  {
    key: "friday",
    short: "Fri",
    production: "friday",
    audited: "friday_audited",
    errors: "friday_errors",
  },
  {
    key: "saturday",
    short: "Sat",
    production: "saturday",
    audited: "saturday_audited",
    errors: "saturday_errors",
  },
];

const WEEKLY_TARGET = 300;
const DAILY_TARGET = 60;
const QUALITY_TARGET = 98;

const getMonday = (date) => {
  const d = new Date(date);
  const day = d.getDay();

  const diff = day === 0 ? -6 : 1 - day;

  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);

  return d;
};

const formatDate = (date) => {
  const d = new Date(date);

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatDisplayDate = (date) => {
  if (!date) return "";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getSaturday = (weekStart) => {
  const d = new Date(`${weekStart}T00:00:00`);
  d.setDate(d.getDate() + 5);

  return formatDate(d);
};

const getMonthStart = (month) => {
  return `${month}-01`;
};

const getMonthEnd = (month) => {
  const [year, monthNumber] = month.split("-").map(Number);

  const d = new Date(year, monthNumber, 0);

  return formatDate(d);
};

const isDateInsideMonth = (dateString, month) => {
  return dateString.startsWith(month);
};

const getDayDate = (weekStart, index) => {
  const d = new Date(`${weekStart}T00:00:00`);
  d.setDate(d.getDate() + index);

  return formatDate(d);
};

const getInitialMonth = () => {
  const now = new Date();

  return `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}`;
};

const getInitialWeek = () => {
  return formatDate(getMonday(new Date()));
};

const getStatus = (production, quality, attendance) => {
  if (
    production >= 100 &&
    quality >= QUALITY_TARGET &&
    attendance >= 100
  ) {
    return {
      label: "On Track",
      className: "bg-green-50 text-green-700 border-green-200",
    };
  }

  if (production >= 80 && quality >= 95 && attendance >= 80) {
    return {
      label: "Needs Attention",
      className: "bg-orange-50 text-orange-700 border-orange-200",
    };
  }

  return {
    label: "Below Target",
    className: "bg-red-50 text-red-700 border-red-200",
  };
};

const calculateMetrics = ({
  productionRows,
  qualityRows,
  attendanceRows,
  weekStart,
  month,
}) => {
  let production = 0;
  let audited = 0;
  let errors = 0;
  let present = 0;
  let attendanceTotal = 0;

  const relevantProductionRows = productionRows.filter(
    (row) => row.week_start === weekStart
  );

  const relevantQualityRows = qualityRows.filter(
    (row) => row.week_start === weekStart
  );

  const relevantAttendanceRows = attendanceRows.filter(
    (row) => row.week_start === weekStart
  );

  DAYS.forEach((day) => {
    const productionRow = relevantProductionRows[0];
    const qualityRow = relevantQualityRows[0];
    const attendanceRow = relevantAttendanceRows[0];

    if (productionRow) {
      production += Number(productionRow[day.production]) || 0;
    }

    if (qualityRow) {
      audited += Number(qualityRow[day.audited]) || 0;
      errors += Number(qualityRow[day.errors]) || 0;
    }

    if (attendanceRow) {
      attendanceTotal += 1;

      if (attendanceRow[day.key] === "Present") {
        present += 1;
      }
    }
  });

  const productionPercentage = Math.min(
    (production / WEEKLY_TARGET) * 100,
    100
  );

  const qualityPercentage =
    audited > 0
      ? ((audited - errors) / audited) * 100
      : 0;

  const attendancePercentage =
    attendanceTotal > 0
      ? (present / attendanceTotal) * 100
      : 0;

  return {
    production,
    productionPercentage,
    audited,
    errors,
    qualityPercentage,
    present,
    attendanceTotal,
    attendancePercentage,
  };
};

const AdminDashboard = () => {
  const [profiles, setProfiles] = useState([]);

  const [productionRows, setProductionRows] = useState([]);
  const [qualityRows, setQualityRows] = useState([]);
  const [attendanceRows, setAttendanceRows] = useState([]);

  const [selectedWeek, setSelectedWeek] =
    useState(getInitialWeek());

  const [selectedMonth, setSelectedMonth] =
    useState(getInitialMonth());

  const [selectedUser, setSelectedUser] = useState(null);

  const [activeView, setActiveView] = useState("weekly");

  const [loading, setLoading] = useState(true);

  const [errorMessage, setErrorMessage] = useState("");

  const loadAdminData = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const {
        data: {
          user,
        },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Admin session not found.");
      }

      const { data: adminRecord, error: adminError } =
        await supabase
          .from("admin_users")
          .select("id")
          .eq("id", user.id)
          .maybeSingle();

      if (adminError) {
        throw adminError;
      }

      if (!adminRecord) {
        throw new Error(
          "You are not authorized to access the Admin Dashboard."
        );
      }

      const [
        profilesResult,
        productionResult,
        qualityResult,
        attendanceResult,
      ] = await Promise.all([
        supabase
          .from("profiles")
          .select("id,email,full_name")
          .order("email"),

        supabase
          .from("production")
          .select("*"),

        supabase
          .from("quality")
          .select("*"),

        supabase
          .from("attendance")
          .select("*"),
      ]);

      if (profilesResult.error) {
        throw profilesResult.error;
      }

      if (productionResult.error) {
        throw productionResult.error;
      }

      if (qualityResult.error) {
        throw qualityResult.error;
      }

      if (attendanceResult.error) {
        throw attendanceResult.error;
      }

      // Exclude the currently logged-in admin from team data
      const teamProfiles = (profilesResult.data || []).filter(
        (profile) => profile.id !== user.id
      );

      setProfiles(teamProfiles);
      setProductionRows(productionResult.data || []);
      setQualityRows(qualityResult.data || []);
      setAttendanceRows(attendanceResult.data || []);
    } catch (error) {
      console.error("Admin dashboard error:", error);

      setErrorMessage(
        error?.message ||
          "Unable to load Admin Dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const weeklyData = useMemo(() => {
    return profiles.map((profile) => {
      const userProduction = productionRows.filter(
        (row) =>
          row.user_id === profile.id &&
          row.week_start === selectedWeek
      );

      const userQuality = qualityRows.filter(
        (row) =>
          row.user_id === profile.id &&
          row.week_start === selectedWeek
      );

      const userAttendance = attendanceRows.filter(
        (row) =>
          row.user_id === profile.id &&
          row.week_start === selectedWeek
      );

      const metrics = calculateMetrics({
        productionRows: userProduction,
        qualityRows: userQuality,
        attendanceRows: userAttendance,
        weekStart: selectedWeek,
        month: selectedMonth,
      });

      return {
        ...profile,
        ...metrics,
      };
    });
  }, [
    profiles,
    productionRows,
    qualityRows,
    attendanceRows,
    selectedWeek,
    selectedMonth,
  ]);

  const monthDates = useMemo(() => {
    const start = new Date(`${selectedMonth}-01T00:00:00`);

    const year = start.getFullYear();
    const month = start.getMonth();

    const dates = [];

    const current = new Date(year, month, 1);

    while (current.getMonth() === month) {
      const day = current.getDay();

      // Monday-Saturday only
      if (day !== 0) {
        dates.push(formatDate(current));
      }

      current.setDate(current.getDate() + 1);
    }

    return dates;
  }, [selectedMonth]);

  const monthlyData = useMemo(() => {
    return profiles.map((profile) => {
      let production = 0;

      let audited = 0;
      let errors = 0;

      let present = 0;
      let attendanceTotal = 0;

      const userProduction = productionRows.filter(
        (row) => row.user_id === profile.id
      );

      const userQuality = qualityRows.filter(
        (row) => row.user_id === profile.id
      );

      const userAttendance = attendanceRows.filter(
        (row) => row.user_id === profile.id
      );

      userProduction.forEach((row) => {
        DAYS.forEach((day, index) => {
          const date = getDayDate(
            row.week_start,
            index
          );

          if (
            isDateInsideMonth(
              date,
              selectedMonth
            )
          ) {
            production +=
              Number(row[day.production]) || 0;
          }
        });
      });

      userQuality.forEach((row) => {
        DAYS.forEach((day, index) => {
          const date = getDayDate(
            row.week_start,
            index
          );

          if (
            isDateInsideMonth(
              date,
              selectedMonth
            )
          ) {
            audited +=
              Number(row[day.audited]) || 0;

            errors +=
              Number(row[day.errors]) || 0;
          }
        });
      });

      userAttendance.forEach((row) => {
        DAYS.forEach((day, index) => {
          const date = getDayDate(
            row.week_start,
            index
          );

          if (
            isDateInsideMonth(
              date,
              selectedMonth
            )
          ) {
            attendanceTotal += 1;

            if (row[day.key] === "Present") {
              present += 1;
            }
          }
        });
      });

      const monthlyTarget =
        monthDates.length * DAILY_TARGET;

      const productionPercentage =
        monthlyTarget > 0
          ? Math.min(
              (production / monthlyTarget) * 100,
              100
            )
          : 0;

      const qualityPercentage =
        audited > 0
          ? ((audited - errors) / audited) * 100
          : 0;

      const attendancePercentage =
        attendanceTotal > 0
          ? (present / attendanceTotal) * 100
          : 0;

      return {
        ...profile,
        production,
        productionPercentage,
        audited,
        errors,
        qualityPercentage,
        present,
        attendanceTotal,
        attendancePercentage,
        monthlyTarget,
      };
    });
  }, [
    profiles,
    productionRows,
    qualityRows,
    attendanceRows,
    selectedMonth,
    monthDates,
  ]);

  const selectedUserWeekly = useMemo(() => {
    if (!selectedUser) return null;

    return weeklyData.find(
      (user) => user.id === selectedUser.id
    );
  }, [weeklyData, selectedUser]);

  const selectedUserMonthly = useMemo(() => {
    if (!selectedUser) return null;

    return monthlyData.find(
      (user) => user.id === selectedUser.id
    );
  }, [monthlyData, selectedUser]);

  const totalTeamMembers = profiles.length;

  const weeklyAverageProduction = useMemo(() => {
    if (!weeklyData.length) return 0;

    return (
      weeklyData.reduce(
        (sum, user) =>
          sum + user.productionPercentage,
        0
      ) / weeklyData.length
    );
  }, [weeklyData]);

  const weeklyAverageQuality = useMemo(() => {
    if (!weeklyData.length) return 0;

    const usersWithAudit = weeklyData.filter(
      (user) => user.audited > 0
    );

    if (!usersWithAudit.length) return 0;

    return (
      usersWithAudit.reduce(
        (sum, user) =>
          sum + user.qualityPercentage,
        0
      ) / usersWithAudit.length
    );
  }, [weeklyData]);

  const weeklyAverageAttendance = useMemo(() => {
    if (!weeklyData.length) return 0;

    return (
      weeklyData.reduce(
        (sum, user) =>
          sum + user.attendancePercentage,
        0
      ) / weeklyData.length
    );
  }, [weeklyData]);

  const monthlyAverageProduction = useMemo(() => {
    if (!monthlyData.length) return 0;

    return (
      monthlyData.reduce(
        (sum, user) =>
          sum + user.productionPercentage,
        0
      ) / monthlyData.length
    );
  }, [monthlyData]);

  const monthlyAverageQuality = useMemo(() => {
    const usersWithAudit = monthlyData.filter(
      (user) => user.audited > 0
    );

    if (!usersWithAudit.length) return 0;

    return (
      usersWithAudit.reduce(
        (sum, user) =>
          sum + user.qualityPercentage,
        0
      ) / usersWithAudit.length
    );
  }, [monthlyData]);

  const monthlyAverageAttendance = useMemo(() => {
    if (!monthlyData.length) return 0;

    return (
      monthlyData.reduce(
        (sum, user) =>
          sum + user.attendancePercentage,
        0
      ) / monthlyData.length
    );
  }, [monthlyData]);

  const renderPercentage = (value) => {
    return `${value.toFixed(1)}%`;
  };

  const renderStatus = (
    production,
    quality,
    attendance
  ) => {
    const status = getStatus(
      production,
      quality,
      attendance
    );

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${status.className}`}
      >
        {status.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#5B2EFF] border-t-transparent rounded-full animate-spin mx-auto"></div>

          <p className="mt-4 text-gray-600 font-medium">
            Loading Admin Dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-5">
        <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-8 max-w-lg w-full text-center">
          <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto text-2xl">
            !
          </div>

          <h2 className="text-xl font-bold mt-5">
            Admin Access Required
          </h2>

          <p className="text-gray-500 mt-2">
            {errorMessage}
          </p>

          <button
            onClick={() => {
              window.location.href = "/Login";
            }}
            className="mt-6 px-6 py-3 rounded-xl bg-[#5B2EFF] text-white font-semibold hover:opacity-90 transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-gray-800">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-[1500px] mx-auto px-4 md:px-6 lg:px-8">
          <div className="min-h-[75px] flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-4">
            <div>
              <p className="text-xs font-semibold text-[#5B2EFF] uppercase tracking-wider">
                ProdTrack
              </p>

              <h1 className="text-2xl md:text-3xl font-bold">
                Admin Dashboard
              </h1>

              <p className="text-sm text-gray-500 mt-1">
                Team performance overview
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-purple-50 border border-purple-100 rounded-xl px-4 py-3">
                <p className="text-xs text-gray-500">
                  Team Members
                </p>

                <p className="text-xl font-bold text-[#5B2EFF]">
                  {totalTeamMembers}
                </p>
              </div>

              <button
                onClick={loadAdminData}
                className="px-4 py-3 rounded-xl bg-[#5B2EFF] text-white text-sm font-semibold hover:opacity-90 transition"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* =====================================================
          MAIN
      ====================================================== */}

      <main className="max-w-[1500px] mx-auto px-4 md:px-6 lg:px-8 py-7">
        {/* ===================================================
            FILTERS
        ==================================================== */}

        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* WEEK */}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Week
              </label>

              <input
                type="date"
                value={selectedWeek}
                onChange={(e) => {
                  const date = e.target.value;

                  if (!date) return;

                  setSelectedWeek(
                    formatDate(
                      getMonday(
                        new Date(`${date}T00:00:00`)
                      )
                    )
                  );
                }}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#5B2EFF] focus:ring-2 focus:ring-purple-100"
              />

              <p className="text-xs text-gray-500 mt-2">
                Week:{" "}
                <strong>
                  {formatDisplayDate(selectedWeek)}
                </strong>{" "}
                to{" "}
                <strong>
                  {formatDisplayDate(
                    getSaturday(selectedWeek)
                  )}
                </strong>
              </p>
            </div>

            {/* MONTH */}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Month
              </label>

              <input
                type="month"
                value={selectedMonth}
                onChange={(e) =>
                  setSelectedMonth(e.target.value)
                }
                className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#5B2EFF] focus:ring-2 focus:ring-purple-100"
              />

              <p className="text-xs text-gray-500 mt-2">
                Viewing monthly performance for{" "}
                <strong>
                  {new Date(
                    `${selectedMonth}-01T00:00:00`
                  ).toLocaleDateString("en-IN", {
                    month: "long",
                    year: "numeric",
                  })}
                </strong>
              </p>
            </div>
          </div>
        </section>

        {/* ===================================================
            VIEW SWITCH
        ==================================================== */}

        <div className="flex gap-2 mt-7 bg-white p-2 rounded-xl border border-gray-100 shadow-sm w-fit">
          <button
            onClick={() => setActiveView("weekly")}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition ${
              activeView === "weekly"
                ? "bg-[#5B2EFF] text-white"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            Weekly View
          </button>

          <button
            onClick={() => setActiveView("monthly")}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition ${
              activeView === "monthly"
                ? "bg-[#5B2EFF] text-white"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            Monthly View
          </button>
        </div>

        {/* ===================================================
            SUMMARY CARDS
        ==================================================== */}

        {activeView === "weekly" ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-7">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <p className="text-sm text-gray-500">
                  Team Members
                </p>

                <p className="text-3xl font-bold mt-2">
                  {totalTeamMembers}
                </p>

                <p className="text-xs text-gray-400 mt-2">
                  Registered team profiles
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <p className="text-sm text-gray-500">
                  Avg Production
                </p>

                <p className="text-3xl font-bold mt-2 text-[#5B2EFF]">
                  {renderPercentage(
                    weeklyAverageProduction
                  )}
                </p>

                <p className="text-xs text-gray-400 mt-2">
                  Weekly target: 300 accounts
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <p className="text-sm text-gray-500">
                  Avg Quality
                </p>

                <p
                  className={`text-3xl font-bold mt-2 ${
                    weeklyAverageQuality >=
                    QUALITY_TARGET
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {renderPercentage(
                    weeklyAverageQuality
                  )}
                </p>

                <p className="text-xs text-gray-400 mt-2">
                  Target: 98%
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <p className="text-sm text-gray-500">
                  Avg Attendance
                </p>

                <p className="text-3xl font-bold mt-2 text-blue-600">
                  {renderPercentage(
                    weeklyAverageAttendance
                  )}
                </p>

                <p className="text-xs text-gray-400 mt-2">
                  Monday - Saturday
                </p>
              </div>
            </div>

            {/* =================================================
                WEEKLY TABLE
            ================================================== */}

            <section className="mt-7 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-5 md:p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold">
                  Team Overview
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Weekly performance for{" "}
                  {formatDisplayDate(
                    selectedWeek
                  )}{" "}
                  -{" "}
                  {formatDisplayDate(
                    getSaturday(selectedWeek)
                  )}
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-5 py-4 text-xs font-bold uppercase text-gray-500">
                        User
                      </th>

                      <th className="text-left px-5 py-4 text-xs font-bold uppercase text-gray-500">
                        Production
                      </th>

                      <th className="text-left px-5 py-4 text-xs font-bold uppercase text-gray-500">
                        Quality
                      </th>

                      <th className="text-left px-5 py-4 text-xs font-bold uppercase text-gray-500">
                        Attendance
                      </th>

                      <th className="text-left px-5 py-4 text-xs font-bold uppercase text-gray-500">
                        Status
                      </th>

                      <th className="text-right px-5 py-4 text-xs font-bold uppercase text-gray-500">
                        Details
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {weeklyData.map((user) => (
                      <tr
                        key={user.id}
                        className="border-t border-gray-100 hover:bg-gray-50 transition"
                      >
                        <td className="px-5 py-5">
                          <div>
                            <p className="font-semibold">
                              {user.full_name ||
                                user.email
                                  ?.split("@")[0] ||
                                "Team Member"}
                            </p>

                            <p className="text-xs text-gray-400 mt-1">
                              {user.email}
                            </p>
                          </div>
                        </td>

                        <td className="px-5 py-5">
                          <p className="font-bold">
                            {user.production}
                          </p>

                          <p className="text-xs text-gray-500 mt-1">
                            {renderPercentage(
                              user.productionPercentage
                            )}
                          </p>
                        </td>

                        <td className="px-5 py-5">
                          <p
                            className={`font-bold ${
                              user.qualityPercentage >=
                              QUALITY_TARGET
                                ? "text-green-600"
                                : user.audited > 0
                                ? "text-red-600"
                                : "text-gray-500"
                            }`}
                          >
                            {user.audited > 0
                              ? renderPercentage(
                                  user.qualityPercentage
                                )
                              : "No audit"}
                          </p>

                          <p className="text-xs text-gray-500 mt-1">
                            {user.errors} errors
                          </p>
                        </td>

                        <td className="px-5 py-5">
                          <p className="font-bold">
                            {renderPercentage(
                              user.attendancePercentage
                            )}
                          </p>

                          <p className="text-xs text-gray-500 mt-1">
                            {user.present}/
                            {user.attendanceTotal || 0}{" "}
                            present
                          </p>
                        </td>

                        <td className="px-5 py-5">
                          {renderStatus(
                            user.productionPercentage,
                            user.qualityPercentage,
                            user.attendancePercentage
                          )}
                        </td>

                        <td className="px-5 py-5 text-right">
                          <button
                            onClick={() =>
                              setSelectedUser(user)
                            }
                            className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold hover:border-[#5B2EFF] hover:text-[#5B2EFF] transition"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {!weeklyData.length && (
                <div className="p-10 text-center text-gray-500">
                  No team members found.
                </div>
              )}
            </section>
          </>
        ) : (
          <>
            {/* =================================================
                MONTHLY SUMMARY
            ================================================== */}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-7">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <p className="text-sm text-gray-500">
                  Team Members
                </p>

                <p className="text-3xl font-bold mt-2">
                  {totalTeamMembers}
                </p>

                <p className="text-xs text-gray-400 mt-2">
                  Registered team profiles
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <p className="text-sm text-gray-500">
                  Avg Production
                </p>

                <p className="text-3xl font-bold mt-2 text-[#5B2EFF]">
                  {renderPercentage(
                    monthlyAverageProduction
                  )}
                </p>

                <p className="text-xs text-gray-400 mt-2">
                  60 accounts per working day
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <p className="text-sm text-gray-500">
                  Avg Quality
                </p>

                <p
                  className={`text-3xl font-bold mt-2 ${
                    monthlyAverageQuality >=
                    QUALITY_TARGET
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {renderPercentage(
                    monthlyAverageQuality
                  )}
                </p>

                <p className="text-xs text-gray-400 mt-2">
                  Target: 98%
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <p className="text-sm text-gray-500">
                  Avg Attendance
                </p>

                <p className="text-3xl font-bold mt-2 text-blue-600">
                  {renderPercentage(
                    monthlyAverageAttendance
                  )}
                </p>

                <p className="text-xs text-gray-400 mt-2">
                  Monday - Saturday
                </p>
              </div>
            </div>

            {/* =================================================
                MONTHLY TABLE
            ================================================== */}

            <section className="mt-7 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-5 md:p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold">
                  Monthly Team Overview
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Performance for{" "}
                  {new Date(
                    `${selectedMonth}-01T00:00:00`
                  ).toLocaleDateString("en-IN", {
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-5 py-4 text-xs font-bold uppercase text-gray-500">
                        User
                      </th>

                      <th className="text-left px-5 py-4 text-xs font-bold uppercase text-gray-500">
                        Production
                      </th>

                      <th className="text-left px-5 py-4 text-xs font-bold uppercase text-gray-500">
                        Quality
                      </th>

                      <th className="text-left px-5 py-4 text-xs font-bold uppercase text-gray-500">
                        Attendance
                      </th>

                      <th className="text-left px-5 py-4 text-xs font-bold uppercase text-gray-500">
                        Status
                      </th>

                      <th className="text-right px-5 py-4 text-xs font-bold uppercase text-gray-500">
                        Details
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {monthlyData.map((user) => (
                      <tr
                        key={user.id}
                        className="border-t border-gray-100 hover:bg-gray-50 transition"
                      >
                        <td className="px-5 py-5">
                          <p className="font-semibold">
                            {user.full_name ||
                              user.email
                                ?.split("@")[0] ||
                              "Team Member"}
                          </p>

                          <p className="text-xs text-gray-400 mt-1">
                            {user.email}
                          </p>
                        </td>

                        <td className="px-5 py-5">
                          <p className="font-bold">
                            {user.production}
                          </p>

                          <p className="text-xs text-gray-500 mt-1">
                            {renderPercentage(
                              user.productionPercentage
                            )}
                          </p>
                        </td>

                        <td className="px-5 py-5">
                          <p
                            className={`font-bold ${
                              user.qualityPercentage >=
                              QUALITY_TARGET
                                ? "text-green-600"
                                : user.audited > 0
                                ? "text-red-600"
                                : "text-gray-500"
                            }`}
                          >
                            {user.audited > 0
                              ? renderPercentage(
                                  user.qualityPercentage
                                )
                              : "No audit"}
                          </p>

                          <p className="text-xs text-gray-500 mt-1">
                            {user.errors} errors
                          </p>
                        </td>

                        <td className="px-5 py-5">
                          <p className="font-bold">
                            {renderPercentage(
                              user.attendancePercentage
                            )}
                          </p>

                          <p className="text-xs text-gray-500 mt-1">
                            {user.present}/
                            {user.attendanceTotal || 0}{" "}
                            present
                          </p>
                        </td>

                        <td className="px-5 py-5">
                          {renderStatus(
                            user.productionPercentage,
                            user.qualityPercentage,
                            user.attendancePercentage
                          )}
                        </td>

                        <td className="px-5 py-5 text-right">
                          <button
                            onClick={() =>
                              setSelectedUser(user)
                            }
                            className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold hover:border-[#5B2EFF] hover:text-[#5B2EFF] transition"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>

      {/* =====================================================
          USER DETAILS MODAL
      ====================================================== */}

      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* MODAL HEADER */}

            <div className="p-5 md:p-6 border-b border-gray-100 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-[#5B2EFF] uppercase tracking-wider">
                  Team Member
                </p>

                <h2 className="text-xl md:text-2xl font-bold mt-1">
                  {selectedUser.full_name ||
                    selectedUser.email}
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  {selectedUser.email}
                </p>
              </div>

              <button
                onClick={() =>
                  setSelectedUser(null)
                }
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600"
              >
                ×
              </button>
            </div>

            {/* MODAL BODY */}

            <div className="p-5 md:p-6">
              {/* WEEKLY */}

              <div>
                <h3 className="text-lg font-bold">
                  Weekly Performance
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  {formatDisplayDate(
                    selectedWeek
                  )}{" "}
                  -{" "}
                  {formatDisplayDate(
                    getSaturday(selectedWeek)
                  )}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
                <div className="bg-purple-50 rounded-xl p-5">
                  <p className="text-xs text-gray-500">
                    Production
                  </p>

                  <p className="text-2xl font-bold text-[#5B2EFF] mt-1">
                    {selectedUserWeekly?.production || 0}
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    {renderPercentage(
                      selectedUserWeekly
                        ?.productionPercentage || 0
                    )}
                  </p>
                </div>

                <div className="bg-blue-50 rounded-xl p-5">
                  <p className="text-xs text-gray-500">
                    Quality
                  </p>

                  <p
                    className={`text-2xl font-bold mt-1 ${
                      (selectedUserWeekly
                        ?.qualityPercentage || 0) >=
                      QUALITY_TARGET
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {selectedUserWeekly?.audited > 0
                      ? renderPercentage(
                          selectedUserWeekly
                            ?.qualityPercentage || 0
                        )
                      : "No audit"}
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    {selectedUserWeekly?.errors || 0}{" "}
                    errors
                  </p>
                </div>

                <div className="bg-green-50 rounded-xl p-5">
                  <p className="text-xs text-gray-500">
                    Attendance
                  </p>

                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {renderPercentage(
                      selectedUserWeekly
                        ?.attendancePercentage || 0
                    )}
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    {selectedUserWeekly?.present || 0}/
                    {selectedUserWeekly
                      ?.attendanceTotal || 0}{" "}
                    present
                  </p>
                </div>
              </div>

              {/* MONTHLY */}

              <div className="mt-8 pt-7 border-t border-gray-100">
                <h3 className="text-lg font-bold">
                  Monthly Performance
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  {new Date(
                    `${selectedMonth}-01T00:00:00`
                  ).toLocaleDateString("en-IN", {
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
                <div className="bg-purple-50 rounded-xl p-5">
                  <p className="text-xs text-gray-500">
                    Production
                  </p>

                  <p className="text-2xl font-bold text-[#5B2EFF] mt-1">
                    {selectedUserMonthly?.production ||
                      0}
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    {renderPercentage(
                      selectedUserMonthly
                        ?.productionPercentage || 0
                    )}
                  </p>
                </div>

                <div className="bg-blue-50 rounded-xl p-5">
                  <p className="text-xs text-gray-500">
                    Quality
                  </p>

                  <p
                    className={`text-2xl font-bold mt-1 ${
                      (selectedUserMonthly
                        ?.qualityPercentage || 0) >=
                      QUALITY_TARGET
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {selectedUserMonthly?.audited > 0
                      ? renderPercentage(
                          selectedUserMonthly
                            ?.qualityPercentage || 0
                        )
                      : "No audit"}
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    {selectedUserMonthly?.errors || 0}{" "}
                    errors
                  </p>
                </div>

                <div className="bg-green-50 rounded-xl p-5">
                  <p className="text-xs text-gray-500">
                    Attendance
                  </p>

                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {renderPercentage(
                      selectedUserMonthly
                        ?.attendancePercentage || 0
                    )}
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    {selectedUserMonthly?.present || 0}/
                    {selectedUserMonthly
                      ?.attendanceTotal || 0}{" "}
                    present
                  </p>
                </div>
              </div>

              {/* STATUS */}

              <div className="mt-6 bg-gray-50 rounded-xl p-5">
                <p className="text-sm text-gray-500">
                  Current Status
                </p>

                <div className="mt-2">
                  {selectedUserWeekly &&
                    renderStatus(
                      selectedUserWeekly.productionPercentage,
                      selectedUserWeekly.qualityPercentage,
                      selectedUserWeekly.attendancePercentage
                    )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;