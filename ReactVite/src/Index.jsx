import React from "react";
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

import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
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
  // These routes will have Header + Footer
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

      // Dashboard
      {
        path: "Dashboard",
        element: <Dashboard />,
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
  // NO HEADER
  // NO FOOTER
  // ===================================================

  {
    path: "/Login",
    element: <Login />,
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