import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
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

const normalizeText = (value) =>
  String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();

const parseExcelDate = (value) => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return formatDate(value);
  }

  if (typeof value === "number") {
    const parsed = XLSX.SSF.parse_date_code(value);

    if (!parsed) return null;

    return `${parsed.y}-${String(parsed.m).padStart(2, "0")}-${String(
      parsed.d
    ).padStart(2, "0")}`;
  }

  const text = String(value ?? "").trim();

  if (!text) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return text;
  }

  const parts = text.split(/[\/.-]/).map((part) => part.trim());

  if (parts.length === 3) {
    let day;
    let month;
    let year;

    if (parts[0].length === 4) {
      year = Number(parts[0]);
      month = Number(parts[1]);
      day = Number(parts[2]);
    } else {
      day = Number(parts[0]);
      month = Number(parts[1]);
      year = Number(parts[2]);
    }

    if (
      Number.isInteger(day) &&
      Number.isInteger(month) &&
      Number.isInteger(year) &&
      year >= 2000 &&
      month >= 1 &&
      month <= 12 &&
      day >= 1 &&
      day <= 31
    ) {
      return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
        2,
        "0"
      )}`;
    }
  }

  return null;
};

const getDayIndexFromDate = (dateString) => {
  const date = new Date(`${dateString}T00:00:00`);
  const day = date.getDay();

  if (day === 0) return -1;

  return day - 1;
};

const isNonNegativeInteger = (value) => {
  if (value === "" || value === null || value === undefined) {
    return false;
  }

  const number = Number(value);

  return Number.isInteger(number) && number >= 0;
};

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

  // Treat YYYY-MM-DD as a calendar date so the displayed day does not
  // shift backward/forward because of the browser's timezone.
  const [year, month, day] = String(date)
    .slice(0, 10)
    .split("-")
    .map(Number);

  const localDate = new Date(year, month - 1, day);

  return localDate.toLocaleDateString("en-IN", {
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

  const [importingExcel, setImportingExcel] = useState(false);

  const [importMessage, setImportMessage] = useState("");

  const [importErrors, setImportErrors] = useState([]);

  const [showImportPanel, setShowImportPanel] = useState(false);

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


  const handleExcelImport = async (event) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) return;

    try {
      setImportingExcel(true);
      setImportMessage("");
      setImportErrors([]);

      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, {
        type: "array",
        cellDates: true,
      });

      const sheetName = workbook.SheetNames[0];

      if (!sheetName) {
        throw new Error("The Excel file does not contain a worksheet.");
      }

      const worksheet = workbook.Sheets[sheetName];

      const rows = XLSX.utils.sheet_to_json(worksheet, {
        defval: "",
        raw: true,
      });

      if (!rows.length) {
        throw new Error("The Excel sheet is empty.");
      }

      const requiredColumns = [
        "Date",
        "Employee Name",
        "Production",
        "Audited",
        "Errors",
        "Attendance",
      ];

      const actualColumns = Object.keys(rows[0] || {});

      const missingColumns = requiredColumns.filter(
        (column) => !actualColumns.includes(column)
      );

      if (missingColumns.length) {
        throw new Error(
          `Missing Excel column(s): ${missingColumns.join(", ")}`
        );
      }

      const profileMap = new Map(
        profiles.map((profile) => [
          normalizeText(profile.full_name),
          profile,
        ])
      );

      const importRows = [];
      const validationErrors = [];
      const duplicateKeys = new Set();

      rows.forEach((row, index) => {
        const excelRowNumber = index + 2;

        const isCompletelyBlank = requiredColumns.every(
          (column) =>
            row[column] === "" ||
            row[column] === null ||
            row[column] === undefined
        );

        if (isCompletelyBlank) return;

        const date = parseExcelDate(row["Date"]);
        const employeeName = String(
          row["Employee Name"] ?? ""
        ).trim();

        const production = Number(row["Production"]);
        const audited = Number(row["Audited"]);
        const errors = Number(row["Errors"]);

        const attendance = String(
          row["Attendance"] ?? ""
        )
          .trim()
          .toLowerCase();

        if (!date) {
          validationErrors.push(
            `Row ${excelRowNumber}: Invalid Date. Use DD-MM-YYYY.`
          );
          return;
        }

        const dayIndex = getDayIndexFromDate(date);

        if (dayIndex === -1) {
          validationErrors.push(
            `Row ${excelRowNumber}: Sunday is not allowed.`
          );
          return;
        }

        const profile = profileMap.get(
          normalizeText(employeeName)
        );

        if (!profile) {
          validationErrors.push(
            `Row ${excelRowNumber}: Employee "${employeeName}" was not found in profiles.`
          );
          return;
        }

        if (
          !isNonNegativeInteger(row["Production"]) ||
          !isNonNegativeInteger(row["Audited"]) ||
          !isNonNegativeInteger(row["Errors"])
        ) {
          validationErrors.push(
            `Row ${excelRowNumber}: Production, Audited and Errors must be whole numbers >= 0.`
          );
          return;
        }

        if (errors > audited) {
          validationErrors.push(
            `Row ${excelRowNumber}: Errors cannot be greater than Audited.`
          );
          return;
        }

        if (
          attendance !== "present" &&
          attendance !== "absent"
        ) {
          validationErrors.push(
            `Row ${excelRowNumber}: Attendance must be Present or Absent.`
          );
          return;
        }

        const duplicateKey = `${profile.id}|${date}`;

        if (duplicateKeys.has(duplicateKey)) {
          validationErrors.push(
            `Row ${excelRowNumber}: Duplicate entry for ${employeeName} on ${formatDisplayDate(
              date
            )}.`
          );
          return;
        }

        duplicateKeys.add(duplicateKey);

        const weekStart = formatDate(
          getMonday(new Date(`${date}T00:00:00`))
        );

        importRows.push({
          userId: profile.id,
          employeeName: profile.full_name,
          date,
          dayIndex,
          weekStart,
          production,
          audited,
          errors,
          attendance:
            attendance === "present"
              ? "Present"
              : "Absent",
        });
      });

      if (validationErrors.length) {
        setImportErrors(validationErrors);
        throw new Error(
          `Excel validation failed. ${validationErrors.length} issue(s) found. No data was saved.`
        );
      }

      if (!importRows.length) {
        throw new Error("No valid data rows were found.");
      }

      const userIds = [
        ...new Set(importRows.map((row) => row.userId)),
      ];

      const weekStarts = [
        ...new Set(importRows.map((row) => row.weekStart)),
      ];

      const [
        existingProductionResult,
        existingQualityResult,
        existingAttendanceResult,
      ] = await Promise.all([
        supabase
          .from("production")
          .select("*")
          .in("user_id", userIds)
          .in("week_start", weekStarts),

        supabase
          .from("quality")
          .select("*")
          .in("user_id", userIds)
          .in("week_start", weekStarts),

        supabase
          .from("attendance")
          .select("*")
          .in("user_id", userIds)
          .in("week_start", weekStarts),
      ]);

      if (existingProductionResult.error) {
        throw existingProductionResult.error;
      }

      if (existingQualityResult.error) {
        throw existingQualityResult.error;
      }

      if (existingAttendanceResult.error) {
        throw existingAttendanceResult.error;
      }

      const productionMap = new Map(
        (existingProductionResult.data || []).map(
          (row) => [
            `${row.user_id}|${row.week_start}`,
            { ...row },
          ]
        )
      );

      const qualityMap = new Map(
        (existingQualityResult.data || []).map(
          (row) => [
            `${row.user_id}|${row.week_start}`,
            { ...row },
          ]
        )
      );

      const attendanceMap = new Map(
        (existingAttendanceResult.data || []).map(
          (row) => [
            `${row.user_id}|${row.week_start}`,
            { ...row },
          ]
        )
      );

      importRows.forEach((row) => {
        const day = DAYS[row.dayIndex];

        const key = `${row.userId}|${row.weekStart}`;

        if (!productionMap.has(key)) {
          productionMap.set(key, {
            user_id: row.userId,
            week_start: row.weekStart,
          });
        }

        if (!qualityMap.has(key)) {
          qualityMap.set(key, {
            user_id: row.userId,
            week_start: row.weekStart,
          });
        }

        if (!attendanceMap.has(key)) {
          attendanceMap.set(key, {
            user_id: row.userId,
            week_start: row.weekStart,
          });
        }

        productionMap.get(key)[day.production] =
          row.production;

        qualityMap.get(key)[day.audited] =
          row.audited;

        qualityMap.get(key)[day.errors] =
          row.errors;

        attendanceMap.get(key)[day.key] =
          row.attendance;
      });

      const productionPayload = [
        ...productionMap.values(),
      ].map((row) => {
        const clean = {
          user_id: row.user_id,
          week_start: row.week_start,
        };

        DAYS.forEach((day) => {
          clean[day.production] =
            Number(row[day.production]) || 0;
        });

        return clean;
      });

      const qualityPayload = [
        ...qualityMap.values(),
      ].map((row) => {
        const clean = {
          user_id: row.user_id,
          week_start: row.week_start,
        };

        DAYS.forEach((day) => {
          clean[day.audited] =
            Number(row[day.audited]) || 0;

          clean[day.errors] =
            Number(row[day.errors]) || 0;
        });

        return clean;
      });

      const attendancePayload = [
        ...attendanceMap.values(),
      ].map((row) => {
        const clean = {
          user_id: row.user_id,
          week_start: row.week_start,
        };

        DAYS.forEach((day) => {
          clean[day.key] =
            row[day.key] || "Present";
        });

        return clean;
      });

      const [
        productionUpsert,
        qualityUpsert,
        attendanceUpsert,
      ] = await Promise.all([
        supabase
          .from("production")
          .upsert(productionPayload, {
            onConflict: "user_id,week_start",
          }),

        supabase
          .from("quality")
          .upsert(qualityPayload, {
            onConflict: "user_id,week_start",
          }),

        supabase
          .from("attendance")
          .upsert(attendancePayload, {
            onConflict: "user_id,week_start",
          }),
      ]);

      if (productionUpsert.error) {
        throw productionUpsert.error;
      }

      if (qualityUpsert.error) {
        throw qualityUpsert.error;
      }

      if (attendanceUpsert.error) {
        throw attendanceUpsert.error;
      }

      setImportMessage(
        `${importRows.length} Excel row(s) imported successfully. Production, quality and attendance are now saved in Supabase.`
      );

      await loadAdminData();
    } catch (error) {
      console.error("Excel import error:", error);

      if (!String(error?.message || "").startsWith("Excel validation failed.")) {
        setImportMessage(
          error?.message ||
            "Excel import failed. No data was saved."
        );
      }
    } finally {
      setImportingExcel(false);
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

  const selectedUserDailyDetails = useMemo(() => {
    if (!selectedUser) return null;

    const productionRow = productionRows.find(
      (row) =>
        row.user_id === selectedUser.id &&
        row.week_start === selectedWeek
    );

    const qualityRow = qualityRows.find(
      (row) =>
        row.user_id === selectedUser.id &&
        row.week_start === selectedWeek
    );

    const attendanceRow = attendanceRows.find(
      (row) =>
        row.user_id === selectedUser.id &&
        row.week_start === selectedWeek
    );

    return DAYS.map((day, index) => {
      const production = Number(
        productionRow?.[day.production]
      ) || 0;

      const audited = Number(
        qualityRow?.[day.audited]
      ) || 0;

      const errors = Number(
        qualityRow?.[day.errors]
      ) || 0;

      const quality =
        audited > 0
          ? ((audited - errors) / audited) * 100
          : null;

      const attendance =
        attendanceRow?.[day.key] || "-";

      return {
        ...day,
        date: getDayDate(selectedWeek, index),
        production,
        audited,
        errors,
        quality,
        attendance,
      };
    });
  }, [
    selectedUser,
    selectedWeek,
    productionRows,
    qualityRows,
    attendanceRows,
  ]);

  const selectedUserMonthlyWeeks = useMemo(() => {
    if (!selectedUser) return [];

    const monthStart = new Date(`${selectedMonth}-01T00:00:00`);
    const monthEnd = new Date(
      `${getMonthEnd(selectedMonth)}T00:00:00`
    );

    const firstMonday = getMonday(monthStart);
    const weeks = [];
    const currentWeek = new Date(firstMonday);

    while (currentWeek <= monthEnd) {
      const weekStart = formatDate(currentWeek);

      const productionRow = productionRows.find(
        (row) =>
          row.user_id === selectedUser.id &&
          row.week_start === weekStart
      );

      const qualityRow = qualityRows.find(
        (row) =>
          row.user_id === selectedUser.id &&
          row.week_start === weekStart
      );

      const attendanceRow = attendanceRows.find(
        (row) =>
          row.user_id === selectedUser.id &&
          row.week_start === weekStart
      );

      let production = 0;
      let audited = 0;
      let errors = 0;
      let present = 0;
      let attendanceTotal = 0;
      let workingDays = 0;

      DAYS.forEach((day, index) => {
        const date = getDayDate(weekStart, index);
        const dateObject = new Date(`${date}T00:00:00`);

        if (
          dateObject >= monthStart &&
          dateObject <= monthEnd
        ) {
          workingDays += 1;

          production +=
            Number(productionRow?.[day.production]) || 0;

          audited +=
            Number(qualityRow?.[day.audited]) || 0;

          errors +=
            Number(qualityRow?.[day.errors]) || 0;

          if (attendanceRow?.[day.key]) {
            attendanceTotal += 1;

            if (attendanceRow[day.key] === "Present") {
              present += 1;
            }
          }
        }
      });

      // Every week is always Monday-Saturday = 6 working days.
      // The weekly target must remain 300 even when the week crosses
      // a month boundary. Sunday is never included.
      const weeklyTarget = WEEKLY_TARGET;

      const productionPercentage =
        weeklyTarget > 0
          ? Math.min(
              (production / weeklyTarget) * 100,
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

      const status = getStatus(
        productionPercentage,
        qualityPercentage,
        attendancePercentage
      );

      weeks.push({
        weekStart,
        weekEnd: getSaturday(weekStart),
        workingDays,
        weeklyTarget,
        production,
        productionPercentage,
        audited,
        errors,
        qualityPercentage,
        present,
        attendanceTotal,
        attendancePercentage,
        status,
      });

      currentWeek.setDate(currentWeek.getDate() + 7);
    }

    return weeks;
  }, [
    selectedUser,
    selectedMonth,
    productionRows,
    qualityRows,
    attendanceRows,
  ]);

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
            EXCEL IMPORT
        ==================================================== */}

        <section className="mt-6 bg-white rounded-2xl border border-purple-100 shadow-sm p-5 md:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div>
              <p className="text-xs font-bold text-[#5B2EFF] uppercase tracking-wider">
                Admin Data Import
              </p>

              <h2 className="text-xl font-bold mt-1">
                Upload Daily Excel
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Upload one Excel file containing Date, Employee Name,
                Production, Audited, Errors and Attendance.
              </p>

              <p className="text-xs text-gray-400 mt-2">
                Monday-Saturday only · Sunday is rejected · Existing data
                for other days is preserved.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setShowImportPanel((value) => !value)}
                className="px-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold hover:border-[#5B2EFF] hover:text-[#5B2EFF] transition"
              >
                {showImportPanel
                  ? "Hide Upload"
                  : "Upload Excel"}
              </button>

              {showImportPanel && (
                <label className="cursor-pointer px-5 py-3 rounded-xl bg-[#5B2EFF] text-white text-sm font-semibold hover:opacity-90 transition">
                  {importingExcel
                    ? "Importing..."
                    : "Choose Excel File"}

                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleExcelImport}
                    disabled={importingExcel}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {showImportPanel && (
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                <p className="font-semibold text-gray-800">
                  Required columns
                </p>

                <p className="text-sm text-gray-600 mt-2">
                  Date · Employee Name · Production · Audited · Errors ·
                  Attendance
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                <p className="font-semibold text-gray-800">
                  Important
                </p>

                <p className="text-sm text-gray-600 mt-2">
                  Employee names must match the profiles table. Duplicate
                  employee/date rows and Sunday entries are rejected.
                </p>
              </div>
            </div>
          )}

          {importMessage && (
            <div className="mt-4 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
              {importMessage}
            </div>
          )}

          {importErrors.length > 0 && (
            <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-4">
              <p className="font-semibold text-red-700">
                Excel validation errors
              </p>

              <ul className="mt-2 space-y-1 text-sm text-red-600 max-h-48 overflow-y-auto list-disc pl-5">
                {importErrors.map((message, index) => (
                  <li key={`${message}-${index}`}>
                    {message}
                  </li>
                ))}
              </ul>
            </div>
          )}
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

              {/* DAILY BREAKDOWN */}

              <div className="mt-8 pt-7 border-t border-gray-100">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-bold">Daily Breakdown</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Production, quality and attendance for each day
                    </p>
                  </div>

                  <p className="text-xs text-gray-500">
                    Daily production target: {DAILY_TARGET} accounts
                  </p>
                </div>

                <div className="mt-5 overflow-x-auto rounded-xl border border-gray-100">
                  <table className="w-full min-w-[760px]">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs font-bold uppercase text-gray-500">
                          Day
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-bold uppercase text-gray-500">
                          Production
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-bold uppercase text-gray-500">
                          Audited
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-bold uppercase text-gray-500">
                          Errors
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-bold uppercase text-gray-500">
                          Quality
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-bold uppercase text-gray-500">
                          Attendance
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {selectedUserDailyDetails?.map((day) => (
                        <tr
                          key={day.key}
                          className="border-t border-gray-100"
                        >
                          <td className="px-4 py-4">
                            <p className="font-semibold">
                              {day.short}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {formatDisplayDate(day.date)}
                            </p>
                          </td>

                          <td className="px-4 py-4">
                            <span
                              className={`font-bold ${
                                day.production >= DAILY_TARGET
                                  ? "text-green-600"
                                  : day.production > 0
                                  ? "text-orange-600"
                                  : "text-gray-500"
                              }`}
                            >
                              {day.production}
                            </span>
                            <p className="text-xs text-gray-400 mt-1">
                              / {DAILY_TARGET}
                            </p>
                          </td>

                          <td className="px-4 py-4 font-semibold">
                            {day.audited}
                          </td>

                          <td className="px-4 py-4">
                            <span
                              className={`font-semibold ${
                                day.errors > 0
                                  ? "text-red-600"
                                  : "text-green-600"
                              }`}
                            >
                              {day.errors}
                            </span>
                          </td>

                          <td className="px-4 py-4">
                            {day.quality !== null ? (
                              <span
                                className={`font-bold ${
                                  day.quality >= QUALITY_TARGET
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {renderPercentage(day.quality)}
                              </span>
                            ) : (
                              <span className="text-gray-400">
                                No audit
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                                day.attendance === "Present"
                                  ? "bg-green-50 text-green-700"
                                  : day.attendance === "Absent"
                                  ? "bg-red-50 text-red-700"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {day.attendance}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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

              {/* MONTHLY WEEK-BY-WEEK */}

              <div className="mt-8 pt-7 border-t border-gray-100">
                <h3 className="text-lg font-bold">
                  Week-by-Week Performance
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  Monthly breakdown for the selected employee
                </p>
              </div>

              <div className="mt-5 overflow-x-auto border border-gray-100 rounded-xl">
                <table className="w-full min-w-[900px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-4 text-xs font-bold uppercase text-gray-500">
                        Week
                      </th>
                      <th className="text-left px-4 py-4 text-xs font-bold uppercase text-gray-500">
                        Production
                      </th>
                      <th className="text-left px-4 py-4 text-xs font-bold uppercase text-gray-500">
                        Quality
                      </th>
                      <th className="text-left px-4 py-4 text-xs font-bold uppercase text-gray-500">
                        Attendance
                      </th>
                      <th className="text-left px-4 py-4 text-xs font-bold uppercase text-gray-500">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {selectedUserMonthlyWeeks.length > 0 ? (
                      selectedUserMonthlyWeeks.map((week) => (
                        <tr
                          key={week.weekStart}
                          className="border-t border-gray-100"
                        >
                          <td className="px-4 py-4">
                            <p className="font-semibold">
                              {formatDisplayDate(week.weekStart)}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              to {formatDisplayDate(week.weekEnd)}
                            </p>
                          </td>

                          <td className="px-4 py-4">
                            <p className="font-bold text-[#5B2EFF]">
                              {week.production} / {week.weeklyTarget}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {renderPercentage(
                                week.productionPercentage
                              )}
                            </p>
                          </td>

                          <td className="px-4 py-4">
                            <p
                              className={`font-bold ${
                                week.audited > 0
                                  ? week.qualityPercentage >=
                                    QUALITY_TARGET
                                    ? "text-green-600"
                                    : "text-red-600"
                                  : "text-gray-500"
                              }`}
                            >
                              {week.audited > 0
                                ? renderPercentage(
                                    week.qualityPercentage
                                  )
                                : "No audit"}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {week.audited} audited · {week.errors} errors
                            </p>
                          </td>

                          <td className="px-4 py-4">
                            <p className="font-bold text-green-600">
                              {renderPercentage(
                                week.attendancePercentage
                              )}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {week.present}/{week.attendanceTotal} present
                            </p>
                          </td>

                          <td className="px-4 py-4">
                            {renderStatus(
                              week.productionPercentage,
                              week.qualityPercentage,
                              week.attendancePercentage
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="5"
                          className="px-4 py-8 text-center text-sm text-gray-500"
                        >
                          No weekly data available for this month.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
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