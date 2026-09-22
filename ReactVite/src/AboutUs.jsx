import React from "react";
import {
  Target,
  ShieldCheck,
  BarChart3,
  CircleCheck,
  AlertTriangle,
  FileText,
  CalendarDays,
  ClipboardCheck,
} from "lucide-react";

const AboutUs = () => {
  const weeklyReport = [
    {
      date: "Mon, 12 May",
      auditor: "Ravi Kumar",
      audited: 10,
      errors: 0,
      quality: "100%",
      status: "Green",
    },
    {
      date: "Tue, 13 May",
      auditor: "Priya Sharma",
      audited: 10,
      errors: 1,
      quality: "90%",
      status: "Red",
    },
    {
      date: "Wed, 14 May",
      auditor: "Arun Singh",
      audited: 10,
      errors: 0,
      quality: "100%",
      status: "Green",
    },
    {
      date: "Thu, 15 May",
      auditor: "Sneha R",
      audited: 10,
      errors: 0,
      quality: "100%",
      status: "Green",
    },
    {
      date: "Fri, 16 May",
      auditor: "Vikram",
      audited: 10,
      errors: 1,
      quality: "90%",
      status: "Red",
    },
    {
      date: "Sat, 17 May",
      auditor: "Neha",
      audited: 10,
      errors: 0,
      quality: "100%",
      status: "Green",
    },
  ];

  return (
    <div className="w-full min-h-screen bg-white text-[#123B78] overflow-hidden">

      {/* =====================================================
          HERO SECTION
      ===================================================== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#F4FAFF] via-[#EDF7FF] to-[#E7F3FF]">

        {/* Decorative Orange Shapes */}
        <div className="absolute -left-[90px] -top-[100px] w-[200px] h-[210px] bg-[#FFB45C] rounded-full opacity-90" />

        <div className="absolute -right-[90px] bottom-[-100px] w-[250px] h-[200px] bg-[#FFB45C] rounded-full" />

        {/* Hero Container */}
        <div className="w-[95%] md:w-[90%] mx-auto py-10 md:py-12 relative z-10">

          <div className="grid lg:grid-cols-2 gap-10 xl:gap-16 items-center">

            {/* ================= LEFT CONTENT ================= */}
            <div>

              {/* Label */}
              <span className="inline-block bg-[#FFE3C2] text-[#E96900] text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
                About Us
              </span>

              {/* Heading */}
              <h1 className="text-[38px] sm:text-[44px] md:text-[48px] xl:text-[52px] leading-[1.1] font-bold mb-5">
                Track Today.
                <br />
                Build a{" "}
                <span className="text-[#FF8500]">
                  Better Tomorrow.
                </span>
              </h1>

              {/* Description */}
              <p className="text-[#5B7090] text-[16px] md:text-[17px] leading-7 max-w-[620px]">
                ProdTrack is designed to help you stay on track with your
                weekly goals — by making production, quality and attendance
                simple, clear and transparent for everyone.
              </p>

              {/* Features */}
              <div className="flex flex-wrap items-center gap-4 md:gap-5 mt-7">

                {/* Be Aware */}
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center">
                    <Target
                      size={20}
                      className="text-[#FF8500]"
                    />
                  </div>

                  <span className="text-[#244A7D] text-sm">
                    Be Aware
                  </span>
                </div>

                <div className="hidden sm:block h-7 w-px bg-[#AEBFD4]" />

                {/* Avoid Errors */}
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center">
                    <ShieldCheck
                      size={20}
                      className="text-[#123B78]"
                    />
                  </div>

                  <span className="text-[#244A7D] text-sm">
                    Avoid Errors
                  </span>
                </div>

                <div className="hidden sm:block h-7 w-px bg-[#AEBFD4]" />

                {/* Get Green */}
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center">
                    <BarChart3
                      size={20}
                      className="text-[#123B78]"
                    />
                  </div>

                  <span className="text-[#244A7D] text-sm">
                    Get Green
                  </span>
                </div>

              </div>

            </div>


            {/* ================= RIGHT HERO CARD ================= */}
            <div className="relative flex justify-center lg:justify-end">

              <div className="relative w-full max-w-[600px] h-[300px] md:h-[330px]">

                {/* Background Cloud */}
                <div className="absolute inset-5 md:inset-0 rounded-[100px] bg-[#E0F0FF]" />

                {/* Dashboard Card */}
                <div className="absolute top-2 right-0 w-[90%] sm:w-[390px] bg-white rounded-[22px] shadow-xl border border-[#DCEBFA] p-5 md:p-6">

                  {/* Card Header */}
                  <div className="flex justify-between items-center mb-5">

                    <h3 className="text-[18px] md:text-[20px] font-bold">
                      Stay on Track
                    </h3>

                    <span className="bg-[#18A66B] text-white px-5 py-2 rounded-full text-sm font-semibold">
                      Green
                    </span>

                  </div>


                  {/* Dashboard Stats */}
                  <div className="grid grid-cols-3 gap-2 md:gap-3">

                    {/* Production */}
                    <div className="border border-[#E2ECF6] rounded-2xl p-3 text-center">

                      <Target
                        size={21}
                        className="mx-auto text-[#123B78] mb-2"
                      />

                      <p className="text-[11px] md:text-xs text-[#526987]">
                        Production
                      </p>

                      <p className="font-bold text-sm md:text-base mt-1">
                        300 / 300
                      </p>

                      <div className="w-full h-2 bg-gray-100 rounded-full mt-2">
                        <div className="w-full h-full bg-[#FF8A00] rounded-full" />
                      </div>

                    </div>


                    {/* Quality */}
                    <div className="border border-[#E2ECF6] rounded-2xl p-3 text-center">

                      <ShieldCheck
                        size={21}
                        className="mx-auto text-[#123B78] mb-2"
                      />

                      <p className="text-[11px] md:text-xs text-[#526987]">
                        Quality
                      </p>

                      <p className="font-bold text-sm md:text-base mt-1">
                        98%
                      </p>

                      <div className="w-full h-2 bg-gray-100 rounded-full mt-2">
                        <div className="w-[98%] h-full bg-[#18A66B] rounded-full" />
                      </div>

                    </div>


                    {/* Errors */}
                    <div className="border border-[#E2ECF6] rounded-2xl p-3 text-center">

                      <AlertTriangle
                        size={21}
                        className="mx-auto text-[#123B78] mb-2"
                      />

                      <p className="text-[11px] md:text-xs text-[#526987]">
                        Errors
                      </p>

                      <p className="font-bold text-sm md:text-base mt-1">
                        0
                      </p>

                      <div className="w-full h-2 bg-gray-100 rounded-full mt-2">
                        <div className="w-full h-full bg-[#18A66B] rounded-full" />
                      </div>

                    </div>

                  </div>

                </div>


                {/* Small Steps Text */}
                <div className="absolute bottom-2 left-[8%] md:left-[12%] rotate-[-5deg]">

                  <p className="font-semibold text-[#123B78] text-[17px] md:text-[19px]">
                    Small steps
                  </p>

                  <p className="font-semibold text-[#123B78] text-[17px] md:text-[19px] ml-4">
                    Big results
                  </p>

                  <div className="w-[90px] h-[3px] bg-[#FF8A00] rounded-full rotate-[-5deg] mt-1 ml-4" />

                </div>

              </div>

            </div>

          </div>

        </div>
      </section>


      {/* =====================================================
          WHY PRODTRACK SECTION
      ===================================================== */}
      <section className="w-[95%] md:w-[90%] mx-auto py-10 md:py-12">

        <div className="grid lg:grid-cols-[0.8fr_2fr] gap-8 xl:gap-12 items-center">

          {/* Left Content */}
          <div>

            <span className="inline-block bg-[#FFE3C2] text-[#E96900] text-sm font-semibold px-4 py-1.5 rounded-full mb-3">
              Our Purpose
            </span>

            <h2 className="text-[28px] md:text-[32px] font-bold mb-3">
              Why ProdTrack?
            </h2>

            <p className="text-[#607795] leading-7 text-[15px] md:text-base">
              We make sure every team member knows exactly what to achieve,
              what to avoid, and how to perform — with real-time tracking
              and weekly insights.
            </p>

          </div>


          {/* Cards */}
          <div className="grid md:grid-cols-3 gap-5">

            {/* Target Card */}
            <div className="bg-[#FFF7EC] rounded-2xl p-6 border border-[#FFEBD0]">

              <div className="w-12 h-12 rounded-full bg-[#FF8A00] flex items-center justify-center text-white mb-4">
                <Target size={25} />
              </div>

              <h3 className="text-[18px] font-bold mb-3">
                Know Your Targets
              </h3>

              <p className="text-[#607795] leading-6 text-sm">
                See how many accounts you need to achieve each week and stay
                focused on your goals.
              </p>

            </div>


            {/* Errors Card */}
            <div className="bg-[#FFF1F3] rounded-2xl p-6 border border-[#FFE0E5]">

              <div className="w-12 h-12 rounded-full bg-[#EF4E57] flex items-center justify-center text-white mb-4">
                <AlertTriangle size={25} />
              </div>

              <h3 className="text-[18px] font-bold mb-3">
                Avoid Errors
              </h3>

              <p className="text-[#607795] leading-6 text-sm">
                Understand how many errors you need to avoid to get a green
                status and maintain your quality.
              </p>

            </div>


            {/* Report Card */}
            <div className="bg-[#EFF8FF] rounded-2xl p-6 border border-[#D9ECFC]">

              <div className="w-12 h-12 rounded-full bg-[#2684D9] flex items-center justify-center text-white mb-4">
                <FileText size={25} />
              </div>

              <h3 className="text-[18px] font-bold mb-3">
                Weekly Auditor Report
              </h3>

              <p className="text-[#607795] leading-6 text-sm">
                Check your weekly audit report before every week to be
                prepared and improve continuously.
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          WEEKLY DASHBOARD SECTION
      ===================================================== */}
      <section className="w-[95%] md:w-[90%] mx-auto pb-12">

        <div className="bg-gradient-to-br from-[#F0F8FF] to-[#F8FCFF] border border-[#CFE4FA] rounded-2xl p-5 md:p-7">

          {/* Section Heading */}
          <div className="mb-6">

            <span className="inline-block bg-[#FFE3C2] text-[#E96900] text-sm font-semibold px-4 py-1.5 rounded-full mb-3">
              What You Can See
            </span>

            <h2 className="text-[28px] md:text-[32px] font-bold mb-2">
              Your Weekly Dashboard
            </h2>

            <p className="text-[#607795] text-sm md:text-base">
              Everything you need, in one place — production, quality,
              attendance and auditor reports.
            </p>

          </div>


          {/* Dashboard Layout */}
          <div className="grid lg:grid-cols-[0.7fr_2fr] gap-6">

            {/* ================= LEFT FEATURES ================= */}
            <div className="pt-2">

              <div className="space-y-4">

                {[
                  "Daily & Weekly Production Count",
                  "Quality with Error Tracking",
                  "Attendance Overview",
                  "Upcoming Auditor Report",
                  "Simple, Clear & Easy to Understand",
                ].map((item, index) => (

                  <div
                    key={index}
                    className="flex items-center gap-3"
                  >

                    <div className="flex-shrink-0 w-[22px] h-[22px] rounded-full bg-[#35C487] flex items-center justify-center">
                      <CircleCheck
                        size={14}
                        color="white"
                      />
                    </div>

                    <span className="text-[#526B8D] text-[14px] md:text-[15px]">
                      {item}
                    </span>

                  </div>

                ))}

              </div>

            </div>


            {/* ================= DASHBOARD ================= */}
            <div className="bg-white rounded-2xl border border-[#DFEAF5] shadow-sm p-4 md:p-5">

              <h3 className="font-bold text-[15px] mb-4">
                Weekly Overview
              </h3>


              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">

                {/* Production */}
                <div className="border border-[#E1EAF3] rounded-xl p-3">

                  <div className="flex items-center gap-2 mb-2">

                    <div className="w-8 h-8 rounded-lg bg-[#FFF0DD] flex items-center justify-center">
                      <Target
                        size={16}
                        className="text-[#FF8A00]"
                      />
                    </div>

                    <span className="text-[11px] font-medium">
                      Production
                    </span>

                  </div>

                  <p className="font-bold text-sm">
                    300{" "}
                    <span className="text-gray-400 font-normal">
                      / 300
                    </span>
                  </p>

                  <div className="h-1.5 bg-gray-100 rounded-full mt-2">
                    <div className="h-full w-full bg-[#FF8A00] rounded-full" />
                  </div>

                </div>


                {/* Quality */}
                <div className="border border-[#E1EAF3] rounded-xl p-3">

                  <div className="flex items-center gap-2 mb-2">

                    <div className="w-8 h-8 rounded-lg bg-[#E7F5FF] flex items-center justify-center">
                      <ShieldCheck
                        size={16}
                        className="text-[#2583D6]"
                      />
                    </div>

                    <span className="text-[11px] font-medium">
                      Quality
                    </span>

                  </div>

                  <p className="font-bold text-sm">
                    98%
                  </p>

                  <div className="h-1.5 bg-gray-100 rounded-full mt-2">
                    <div className="h-full w-[98%] bg-[#19A96B] rounded-full" />
                  </div>

                </div>


                {/* Attendance */}
                <div className="border border-[#E1EAF3] rounded-xl p-3">

                  <div className="flex items-center gap-2 mb-2">

                    <div className="w-8 h-8 rounded-lg bg-[#F1E9FF] flex items-center justify-center">
                      <CalendarDays
                        size={16}
                        className="text-[#7C3AED]"
                      />
                    </div>

                    <span className="text-[11px] font-medium">
                      Attendance
                    </span>

                  </div>

                  <p className="font-bold text-sm">
                    6{" "}
                    <span className="text-gray-400 font-normal">
                      / 6
                    </span>
                  </p>

                  <div className="h-1.5 bg-gray-100 rounded-full mt-2">
                    <div className="h-full w-full bg-[#19A96B] rounded-full" />
                  </div>

                </div>


                {/* Status */}
                <div className="border border-[#E1EAF3] rounded-xl p-3">

                  <div className="flex items-center gap-2 mb-2">

                    <div className="w-8 h-8 rounded-lg bg-[#E7F8F0] flex items-center justify-center">
                      <CircleCheck
                        size={16}
                        className="text-[#19A96B]"
                      />
                    </div>

                    <span className="text-[11px] font-medium">
                      Status
                    </span>

                  </div>

                  <span className="inline-block bg-[#19A96B] text-white text-xs font-semibold px-5 py-1 rounded-full">
                    Green
                  </span>

                </div>

              </div>


              {/* Report Area */}
              <div className="grid xl:grid-cols-[1fr_230px] gap-4">

                {/* ================= TABLE ================= */}
                <div className="border border-[#E1EAF3] rounded-xl overflow-hidden">

                  <div className="px-3 py-3 font-bold text-sm border-b bg-white">
                    Weekly Report
                  </div>

                  <div className="overflow-x-auto">

                    <table className="w-full text-xs min-w-[650px]">

                      <thead className="bg-[#F4F8FC]">

                        <tr>

                          <th className="text-left px-3 py-2.5 font-semibold">
                            Date
                          </th>

                          <th className="text-left px-2 py-2.5 font-semibold">
                            Auditor
                          </th>

                          <th className="text-left px-2 py-2.5 font-semibold">
                            Audited
                          </th>

                          <th className="text-left px-2 py-2.5 font-semibold">
                            Errors
                          </th>

                          <th className="text-left px-2 py-2.5 font-semibold">
                            Quality %
                          </th>

                          <th className="text-left px-2 py-2.5 font-semibold">
                            Status
                          </th>

                        </tr>

                      </thead>


                      <tbody>

                        {weeklyReport.map((row, index) => (

                          <tr
                            key={index}
                            className="border-t border-[#EDF2F7]"
                          >

                            <td className="px-3 py-2.5 whitespace-nowrap">
                              {row.date}
                            </td>

                            <td className="px-2 py-2.5 whitespace-nowrap">
                              {row.auditor}
                            </td>

                            <td className="px-2 py-2.5">
                              {row.audited}
                            </td>

                            <td className="px-2 py-2.5">
                              {row.errors}
                            </td>

                            <td className="px-2 py-2.5">
                              {row.quality}
                            </td>

                            <td className="px-2 py-2.5">

                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                                  row.status === "Green"
                                    ? "bg-[#DDF7EA] text-[#15935C]"
                                    : "bg-[#FFE0E2] text-[#E5444C]"
                                }`}
                              >
                                {row.status}
                              </span>

                            </td>

                          </tr>

                        ))}

                      </tbody>

                    </table>

                  </div>

                </div>


                {/* ================= NEXT REPORT ================= */}
                <div className="bg-[#F7FAFE] rounded-xl p-4">

                  <div className="flex items-center gap-2 mb-3">

                    <CalendarDays
                      size={18}
                      className="text-[#123B78]"
                    />

                    <h4 className="font-bold text-xs">
                      Next Week Auditor Report
                    </h4>

                  </div>


                  <p className="font-bold text-sm mb-4">
                    May 19 - May 24
                  </p>


                  <div className="space-y-4 text-xs">

                    {/* Accounts */}
                    <div className="flex gap-2">

                      <ClipboardCheck
                        size={17}
                        className="text-[#123B78] flex-shrink-0"
                      />

                      <div>

                        <p className="text-gray-500">
                          Total Accounts to Audit
                        </p>

                        <p className="font-bold">
                          60
                        </p>

                      </div>

                    </div>


                    {/* Errors */}
                    <div className="flex gap-2">

                      <AlertTriangle
                        size={17}
                        className="text-[#123B78] flex-shrink-0"
                      />

                      <div>

                        <p className="text-gray-500">
                          Errors to Avoid
                        </p>

                        <p className="font-bold">
                          ≤ 1 (per day)
                        </p>

                      </div>

                    </div>


                    {/* Quality */}
                    <div className="flex gap-2">

                      <ShieldCheck
                        size={17}
                        className="text-[#123B78] flex-shrink-0"
                      />

                      <div>

                        <p className="text-gray-500">
                          Target Quality
                        </p>

                        <p className="font-bold">
                          98%
                        </p>

                      </div>

                    </div>

                  </div>


                  {/* Button */}
                  <button className="w-full border border-[#1475E8] text-[#1475E8] rounded-lg py-2.5 mt-5 text-xs font-semibold hover:bg-[#1475E8] hover:text-white transition">
                    📄 &nbsp; View Full Report
                  </button>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

    </div>
  );
};

export default AboutUs;