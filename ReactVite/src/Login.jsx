import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  UserRound,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  Target,
  ShieldCheck,
  CalendarCheck,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";


// ============================================================
// ZOD VALIDATION
// ============================================================

const loginSchema = z.object({
  loginId: z
    .string()
    .min(1, "Login ID is required")
    .trim(),

  password: z
    .string()
    .min(1, "Password is required")
    .regex(
      /^[A-Za-z0-9]{7}$/,
      "Password must be exactly 7 alphanumeric characters"
    ),
});


// ============================================================
// LOGIN COMPONENT
// ============================================================

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(loginSchema),

    defaultValues: {
      loginId: "",
      password: "",
    },
  });


  // ============================================================
  // LOGIN SUBMIT
  // ============================================================

  const onSubmit = async (data) => {
    console.log("Login Data:", data);

    /*
      Later you can connect Firebase / backend here.

      Example:

      const response = await loginUser(data);

      if (response.success) {
        navigate("/dashboard");
      }
    */

    alert(`Login successful!\nLogin ID: ${data.loginId}`);

    // Remove this if you don't want to clear the form
    reset();
  };


  return (
    <div className="min-h-screen w-full bg-[#F5FAFF]">

      {/* ======================================================
          MAIN LOGIN CONTAINER
      ====================================================== */}

      <div className="w-[95%] md:w-[92%] lg:w-[90%] mx-auto min-h-screen flex items-center py-8 md:py-10">

        <div className="w-full grid lg:grid-cols-2 gap-6 xl:gap-10 items-stretch">


          {/* ==================================================
              LEFT SIDE - LOGIN FORM
          ================================================== */}

          <div className="bg-white rounded-[24px] shadow-[0_15px_50px_rgba(18,59,120,0.08)] border border-[#E5EEF8] flex items-center justify-center">

            <div className="w-full max-w-[520px] px-6 sm:px-10 md:px-14 py-10 md:py-12">

              {/* ================= LOGO ================= */}

              <div className="flex justify-center mb-8">

                <div className="flex items-center gap-2">

                  {/* Logo Icon */}
                  <div className="relative w-[42px] h-[42px] overflow-hidden rounded-[5px]">

                    {/* Blue background */}
                    <div className="absolute inset-0 bg-[#123B78]" />

                    {/* Orange section */}
                    <div
                      className="absolute bottom-0 right-0 w-[25px] h-[27px] bg-[#FF8500]"
                      style={{
                        clipPath:
                          "polygon(35% 0, 100% 0, 100% 100%, 0 100%)",
                      }}
                    />

                    {/* White curved line */}
                    <div
                      className="absolute left-[-3px] bottom-[5px] w-[43px] h-[20px] border-t-[3px] border-white"
                      style={{
                        transform: "rotate(-30deg)",
                      }}
                    />

                    <div
                      className="absolute left-[-2px] bottom-[10px] w-[43px] h-[18px] border-t-[2px] border-white"
                      style={{
                        transform: "rotate(-30deg)",
                      }}
                    />

                  </div>


                  {/* Logo Text */}
                  <div className="text-[29px] font-bold tracking-tight">

                    <span className="text-[#123B78]">
                      Prod
                    </span>

                    <span className="text-[#FF8500]">
                      Track
                    </span>

                  </div>

                </div>

              </div>


              {/* ================= HEADING ================= */}

              <div className="mb-8">

                <h1 className="text-[32px] sm:text-[36px] font-bold text-[#123B78]">

                  Welcome{" "}

                  <span className="text-[#FF8500]">
                    Back!
                  </span>

                </h1>

                <p className="text-[#7085A0] mt-2 text-[15px]">
                  Login to your account to continue
                </p>

              </div>


              {/* ==================================================
                  FORM
              ================================================== */}

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-5"
              >


                {/* ================= LOGIN ID ================= */}

                <div>

                  <label
                    htmlFor="loginId"
                    className="block text-[14px] font-semibold text-[#294C78] mb-2"
                  >
                    Login ID
                  </label>


                  <div
                    className={`relative flex items-center border rounded-xl transition-all ${
                      errors.loginId
                        ? "border-red-400 bg-red-50"
                        : "border-[#D4E1EF] bg-white focus-within:border-[#3473C5] focus-within:ring-4 focus-within:ring-[#3473C5]/10"
                    }`}
                  >

                    {/* Icon */}
                    <UserRound
                      size={19}
                      className={`absolute left-4 ${
                        errors.loginId
                          ? "text-red-500"
                          : "text-[#6B87A8]"
                      }`}
                    />


                    <input
                      id="loginId"
                      type="text"
                      placeholder="Enter your Login ID"
                      autoComplete="username"
                      {...register("loginId")}
                      className="w-full h-[54px] pl-12 pr-4 rounded-xl outline-none bg-transparent text-[#123B78] placeholder:text-[#91A4BB] text-[15px]"
                    />

                  </div>


                  {/* Error */}
                  {errors.loginId && (
                    <p className="text-red-500 text-xs mt-1.5">
                      {errors.loginId.message}
                    </p>
                  )}

                </div>


                {/* ================= PASSWORD ================= */}

                <div>

                  <label
                    htmlFor="password"
                    className="block text-[14px] font-semibold text-[#294C78] mb-2"
                  >
                    Password
                  </label>


                  <div
                    className={`relative flex items-center border rounded-xl transition-all ${
                      errors.password
                        ? "border-red-400 bg-red-50"
                        : "border-[#D4E1EF] bg-white focus-within:border-[#3473C5] focus-within:ring-4 focus-within:ring-[#3473C5]/10"
                    }`}
                  >

                    {/* Lock Icon */}
                    <LockKeyhole
                      size={19}
                      className={`absolute left-4 ${
                        errors.password
                          ? "text-red-500"
                          : "text-[#6B87A8]"
                      }`}
                    />


                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      maxLength={7}
                      {...register("password")}
                      className="w-full h-[54px] pl-12 pr-12 rounded-xl outline-none bg-transparent text-[#123B78] placeholder:text-[#91A4BB] text-[15px] tracking-wider"
                    />


                    {/* Show / Hide Password */}

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((prev) => !prev)
                      }
                      className="absolute right-4 text-[#6B87A8] hover:text-[#123B78] transition"
                    >

                      {showPassword ? (
                        <EyeOff size={19} />
                      ) : (
                        <Eye size={19} />
                      )}

                    </button>

                  </div>


                  {/* Password Helper */}

                  {!errors.password && (
                    <p className="text-[#8A9CB1] text-xs mt-1.5">
                      Password must contain exactly 7 letters or numbers.
                      Example: <b>SOS1196</b>
                    </p>
                  )}


                  {/* Error */}

                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1.5">
                      {errors.password.message}
                    </p>
                  )}

                </div>


                {/* ================= FORGOT PASSWORD ================= */}

                <div className="flex justify-end">

                  <button
                    type="button"
                    className="text-[#3473C5] text-sm font-medium hover:text-[#FF8500] transition"
                    onClick={() => {
                      alert("Please contact your team administrator.");
                    }}
                  >
                    Forgot password?
                  </button>

                </div>


                {/* ================= LOGIN BUTTON ================= */}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-[54px] bg-[#123B78] hover:bg-[#0D2F63] disabled:bg-[#8CA4C2] text-white rounded-xl font-semibold text-[16px] flex items-center justify-center gap-3 transition-all duration-200 shadow-[0_8px_20px_rgba(18,59,120,0.18)] hover:shadow-[0_10px_25px_rgba(18,59,120,0.25)]"
                >

                  {isSubmitting ? (
                    "Logging in..."
                  ) : (
                    <>
                      Login
                      <ArrowRight size={20} />
                    </>
                  )}

                </button>

              </form>


              {/* ================= SECURITY NOTE ================= */}

              <div className="flex items-center justify-center gap-2 mt-7">

                <ShieldCheck
                  size={16}
                  className="text-[#19A96B]"
                />

                <p className="text-[#7D90A7] text-xs">
                  Your account information is secure
                </p>

              </div>

            </div>

          </div>


          {/* ==================================================
              RIGHT SIDE - PRODUCTIVITY HERO
          ================================================== */}

          <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#EDF7FF] via-[#E7F3FF] to-[#DDEEFF] min-h-[620px] lg:min-h-[700px]">

            {/* Decorative Background */}

            <div className="absolute w-[300px] h-[300px] bg-white/30 rounded-full -right-[100px] -top-[100px]" />

            <div className="absolute w-[250px] h-[250px] bg-[#CFE6FF]/50 rounded-full -left-[100px] bottom-[50px]" />


            <div className="relative z-10 h-full flex flex-col justify-between p-7 sm:p-10 md:p-12">


              {/* ================= HERO TEXT ================= */}

              <div>

                <span className="inline-block bg-white/80 text-[#E96D00] font-semibold text-sm px-4 py-1.5 rounded-full mb-5">
                  ProdTrack
                </span>


                <h2 className="text-[36px] sm:text-[42px] xl:text-[48px] leading-[1.08] font-bold text-[#123B78]">

                  Track Progress.

                  <br />

                  <span className="text-[#FF8500]">
                    Build Success.
                  </span>

                </h2>


                <p className="text-[#5C7697] text-[16px] md:text-[18px] leading-7 mt-4 max-w-[500px]">

                  Better monitoring. Higher productivity.
                  <br />

                  Happier teams.

                </p>

              </div>


              {/* ================= STAT CARDS ================= */}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-3 mt-8">

                {/* Production */}

                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-sm">

                  <Target
                    size={21}
                    className="text-[#FF8500] mb-2"
                  />

                  <p className="text-[11px] text-[#607795]">
                    Production
                  </p>

                  <p className="font-bold text-[#123B78] text-sm">
                    300 / 300
                  </p>

                  <div className="h-1.5 bg-[#E7EDF4] rounded-full mt-2">
                    <div className="h-full w-full bg-[#19A96B] rounded-full" />
                  </div>

                </div>


                {/* Quality */}

                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-sm">

                  <ShieldCheck
                    size={21}
                    className="text-[#123B78] mb-2"
                  />

                  <p className="text-[11px] text-[#607795]">
                    Quality
                  </p>

                  <p className="font-bold text-[#123B78] text-sm">
                    98%
                  </p>

                  <div className="h-1.5 bg-[#E7EDF4] rounded-full mt-2">
                    <div className="h-full w-[98%] bg-[#19A96B] rounded-full" />
                  </div>

                </div>


                {/* Attendance */}

                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-sm">

                  <CalendarCheck
                    size={21}
                    className="text-[#7C3AED] mb-2"
                  />

                  <p className="text-[11px] text-[#607795]">
                    Attendance
                  </p>

                  <p className="font-bold text-[#123B78] text-sm">
                    6 / 6
                  </p>

                  <div className="h-1.5 bg-[#E7EDF4] rounded-full mt-2">
                    <div className="h-full w-full bg-[#19A96B] rounded-full" />
                  </div>

                </div>


                {/* Green Status */}

                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-sm flex flex-col justify-center items-center">

                  <CheckCircle2
                    size={25}
                    className="text-[#19A96B] mb-2"
                  />

                  <span className="bg-[#19A96B] text-white px-4 py-1 rounded-full text-xs font-semibold">
                    Green
                  </span>

                </div>

              </div>


              {/* ==================================================
                  EMPLOYEE ILLUSTRATION
              ================================================== */}

              <div className="relative mt-8 flex-1 flex items-end justify-center">

                {/* Factory Background */}

                <div className="absolute bottom-10 left-0 right-0 h-[180px]">

                  {/* Factory Building */}

                  <div className="absolute bottom-0 right-[5%] w-[55%] h-[150px] bg-[#C9DDF2]/70 rounded-t-[20px]">

                    <div className="absolute top-5 left-6 right-6 flex gap-3">

                      <div className="w-12 h-16 bg-[#EAF5FF] rounded-lg" />
                      <div className="w-12 h-16 bg-[#EAF5FF] rounded-lg" />
                      <div className="w-12 h-16 bg-[#EAF5FF] rounded-lg" />

                    </div>

                  </div>


                  {/* Conveyor */}

                  <div className="absolute bottom-0 left-[8%] right-[3%] h-[30px] bg-[#607795] rounded-full">

                    <div className="flex justify-around items-center h-full">

                      <span className="w-5 h-5 bg-white rounded-full" />
                      <span className="w-5 h-5 bg-white rounded-full" />
                      <span className="w-5 h-5 bg-white rounded-full" />
                      <span className="w-5 h-5 bg-white rounded-full" />
                      <span className="w-5 h-5 bg-white rounded-full" />

                    </div>

                  </div>


                  {/* Boxes */}

                  <div className="absolute bottom-[28px] right-[18%] w-16 h-12 bg-[#FFB45C] rounded-md" />

                  <div className="absolute bottom-[28px] right-[32%] w-16 h-12 bg-[#FFB45C] rounded-md" />

                </div>


                {/* ================= EMPLOYEE 1 ================= */}

                <div className="relative z-20 mr-[-15px]">

                  {/* Head */}

                  <div className="w-[62px] h-[62px] bg-[#F4B183] rounded-full mx-auto relative">

                    {/* Hair */}

                    <div className="absolute top-[-5px] left-[5px] w-[52px] h-[25px] bg-[#172B4D] rounded-t-full" />

                  </div>


                  {/* Body */}

                  <div className="w-[105px] h-[145px] bg-[#123B78] rounded-t-[35px] mt-[-5px] relative">

                    {/* Shirt */}

                    <div className="absolute top-12 left-5 right-5 h-[35px] border border-[#5279A8] rounded" />

                  </div>


                  {/* Arm */}

                  <div className="absolute -left-5 top-[65px] w-[25px] h-[80px] bg-[#123B78] rounded-full rotate-[25deg]" />

                </div>


                {/* ================= EMPLOYEE 2 ================= */}

                <div className="relative z-30 mx-[-5px]">

                  {/* Head */}

                  <div className="w-[65px] h-[65px] bg-[#F4B183] rounded-full mx-auto relative">

                    <div className="absolute top-[-7px] left-[4px] w-[57px] h-[30px] bg-[#202A3A] rounded-t-full" />

                  </div>


                  {/* Body */}

                  <div className="w-[115px] h-[155px] bg-[#1E5799] rounded-t-[38px] mt-[-4px]">

                    <div className="absolute top-[90px] left-[45px] w-[35px] h-[60px] bg-[#DDEEFF] rounded-lg rotate-[5deg]" />

                  </div>

                </div>


                {/* ================= EMPLOYEE 3 ================= */}

                <div className="relative z-20 ml-[-10px]">

                  {/* Head */}

                  <div className="w-[60px] h-[60px] bg-[#F4B183] rounded-full mx-auto relative">

                    <div className="absolute top-[-5px] left-[3px] w-[54px] h-[25px] bg-[#172B4D] rounded-t-full" />

                  </div>


                  {/* Body */}

                  <div className="w-[100px] h-[140px] bg-[#123B78] rounded-t-[35px] mt-[-4px]" />

                </div>


                {/* Success Icon */}

                <div className="absolute right-[7%] bottom-[130px] bg-white rounded-full p-4 shadow-lg">

                  <TrendingUp
                    size={30}
                    className="text-[#19A96B]"
                  />

                </div>

              </div>


              {/* ================= BOTTOM MESSAGE ================= */}

              <div className="text-center mt-3">

                <p className="text-[#123B78] font-semibold text-[18px] md:text-[20px]">
                  Together We Achieve More
                </p>

                <div className="w-[100px] h-[3px] bg-[#FF8500] rounded-full mx-auto mt-2" />

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Login;