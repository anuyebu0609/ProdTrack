import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

import Header from "./Header";
import HeroSection from "./HeroSection";
import WhyChoose from "./WhyChoose";
import Stay from "./Stay";
import Footer from "./Footer";
import Dashboard from "./Dashboard";
import AboutUs from "./AboutUs";
import Login from "./Login";

import { supabase } from "./supabaseClient";

import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Navigate,
} from "react-router-dom";


// =====================================================
// HOME PAGE
// =====================================================

const Home = () => {
  return (
    <div>
      <HeroSection />
      <WhyChoose />
      <Stay />
    </div>
  );
};


// =====================================================
// PROTECTED ROUTE
// Login இல்லாமல் Dashboard open ஆகாது
// =====================================================

const ProtectedRoute = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    // Current login session check
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setSession(session);
      setLoading(false);
    };

    getSession();


    // Login / Logout changes monitor
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setLoading(false);
      }
    );


    return () => {
      subscription.unsubscribe();
    };

  }, []);


  // Session check ஆகும் வரை
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">

          <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>

          <p className="text-gray-600 font-medium">
            Checking login...
          </p>

        </div>
      </div>
    );
  }


  // Login இல்லையென்றால் Login page
  if (!session) {
    return <Navigate to="/Login" replace />;
  }


  // Login இருந்தால் Dashboard
  return <Dashboard />;
};


// =====================================================
// LOGIN PAGE PROTECTION
// Already login இருந்தால் Dashboard
// =====================================================

const LoginRoute = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setSession(session);
      setLoading(false);
    };

    checkSession();


    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setLoading(false);
      }
    );


    return () => {
      subscription.unsubscribe();
    };

  }, []);


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">

          <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>

          <p className="text-gray-600 font-medium">
            Loading...
          </p>

        </div>
      </div>
    );
  }


  // Already logged in
  if (session) {
    return <Navigate to="/Dashboard" replace />;
  }


  // Not logged in
  return <Login />;
};


// =====================================================
// MAIN WEBSITE LAYOUT
// Header + Page Content + Footer
// =====================================================

const AppLayout = () => {
  return (
    <div className="min-h-screen">

      {/* Header */}
      <Header />

      {/* Child pages */}
      <Outlet />

      {/* Footer */}
      <Footer />

    </div>
  );
};


// =====================================================
// ROUTER
// =====================================================

const Router = createBrowserRouter([

  // ===================================================
  // MAIN WEBSITE ROUTES
  // ===================================================

  {
    path: "/",
    element: <AppLayout />,

    children: [

      // Home
      {
        index: true,
        element: <Home />,
      },


      // =================================================
      // DASHBOARD
      // Login இல்லாமல் open ஆகாது
      // =================================================

      {
        path: "Dashboard",
        element: <ProtectedRoute />,
      },


      // About Us
      {
        path: "AboutUs",
        element: <AboutUs />,
      },

    ],
  },


  // ===================================================
  // LOGIN ROUTE
  // ===================================================

  {
    path: "/Login",
    element: <LoginRoute />,
  },

]);


// =====================================================
// ROOT
// =====================================================

const Root = ReactDOM.createRoot(
  document.getElementById("root")
);

Root.render(
  <RouterProvider router={Router} />
);