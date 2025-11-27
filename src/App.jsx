import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import DashboardRouting from "./Components/DashboardRouting";
import AuthForm from "./Components/Auth/AuthForm";
import LoadingModal from "./LoadingModal";

const RequireAuth = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/authentication" replace />;
};

const App = () => {
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
      />
      <Suspense fallback={<LoadingModal />}>
        <Routes>
          {/* ✅ Auth Page - Public */}
          <Route path="/authentication" element={<AuthForm />} />

          {/* ✅ Dashboard - Protected */}
          <Route
            path="/*"
            element={
              <RequireAuth>
                <DashboardRouting />
              </RequireAuth>
            }
          />
        </Routes>
      </Suspense>
    </>
  );
};

export default App;
