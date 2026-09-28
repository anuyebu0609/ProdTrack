import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

import Header from "./Header";
import HeroSection from "./HeroSection";
import WhyChoose from "./WhyChoose";
import Stay from "./Stay";
import Footer from "./Footer";
import Dashboard from "./Dashboard";
import AdminDashboard from "./AdminDashboard";
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
// PROTECTED USER DASHBOARD ROUTE
// =====================================================

const ProtectedRoute = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    // Check current login session
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setSession(session);
      setLoading(false);
    };

    getSession();


    // Monitor login and logout changes
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


  // Show loading while checking session
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


  // Redirect to login if user is not authenticated
  if (!session) {
    return <Navigate to="/Login" replace />;
  }


  // Open normal user dashboard
  return <Dashboard />;
};


// =====================================================
// PROTECTED ADMIN DASHBOARD ROUTE
// =====================================================

const AdminRoute = () => {
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    let mounted = true;

    // Check admin authentication
    const checkAdminAccess = async () => {
      try {

        // Check current login session
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        setSession(session);


        // Stop if user is not logged in
        if (!session) {
          setLoading(false);
          return;
        }


        // Check whether logged-in user exists in admin_users
        const {
          data: adminRecord,
          error: adminError,
        } = await supabase
          .from("admin_users")
          .select("id")
          .eq("id", session.user.id)
          .maybeSingle();


        if (adminError) {
          console.error("Admin check error:", adminError);
          setIsAdmin(false);
        } else {
          setIsAdmin(!!adminRecord);
        }

      } catch (error) {

        console.error("Admin access error:", error);
        setIsAdmin(false);

      } finally {

        if (mounted) {
          setLoading(false);
        }

      }
    };


    checkAdminAccess();


    // Monitor login and logout changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {

        setSession(newSession);

        // Reset admin access after logout
        if (!newSession) {
          setIsAdmin(false);
          setLoading(false);
        }

      }
    );


    return () => {
      mounted = false;
      subscription.unsubscribe();
    };

  }, []);


  // Show loading while checking admin access
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">

          <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>

          <p className="text-gray-600 font-medium">
            Checking admin access...
          </p>

        </div>
      </div>
    );
  }


  // Redirect unauthenticated users to login
  if (!session) {
    return <Navigate to="/Login" replace />;
  }


  // Redirect normal users to their dashboard
  if (!isAdmin) {
    return <Navigate to="/Dashboard" replace />;
  }


  // Open admin dashboard
  return <AdminDashboard />;
};


// =====================================================
// LOGIN PAGE PROTECTION
// =====================================================

const LoginRoute = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    // Check current login session
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setSession(session);
      setLoading(false);
    };

    checkSession();


    // Monitor login and logout changes
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


  // Show loading while checking session
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


  // Redirect already logged-in users to dashboard
  if (session) {
    return <Navigate to="/Dashboard" replace />;
  }


  // Show login page
  return <Login />;
};


// =====================================================
// MAIN WEBSITE LAYOUT
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
      // USER DASHBOARD
      // =================================================

      {
        path: "Dashboard",
        element: <ProtectedRoute />,
      },


      // =================================================
      // ADMIN DASHBOARD
      // =================================================

      {
        path: "AdminDashboard",
        element: <AdminRoute />,
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