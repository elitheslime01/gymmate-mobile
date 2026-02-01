import { useEffect } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import BookingPage from "./pages/BookingPage";
import NotificationPage from "./pages/NotificationPage";
import AccountPage from "./pages/AccountPage";
import MyAccountPage from "./pages/MyAccountPage";
import FeedbackPage from "./pages/FeedbackPage";
import AppLayout from "./components/layout/AppLayout";
import PushNotificationManager from "./components/PushNotificationManager";
import { useStudentStore } from "./store/student";

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const segments = location.pathname.split("/").filter(Boolean);
  const primaryPath = segments.length ? `/${segments[0]}` : "/";
  const showChrome = primaryPath !== "/" && primaryPath !== "/register";
  const isLoggedIn = useStudentStore((state) => state.isLoggedIn);

  const ROUTE_TITLES = {
    "/home": "Welcome to GymMate",
    "/booking": "Booking",
    "/notification": "Notifications",
    "/account": "Account",
    "/my-account": "My Account",
    "/feedback": "Feedback",
    "/register": "Register",
  };

  const pageTitle = ROUTE_TITLES[primaryPath] || "";
  const protectedRoutes = [
    "/home",
    "/booking",
    "/notification",
    "/account",
    "/my-account",
    "/feedback",
  ];

  // If a user is already logged in (restored from localStorage), keep them on the home page.
  useEffect(() => {
    const isAuthRoute = primaryPath === "/" || primaryPath === "/register";
    if (isLoggedIn && isAuthRoute) {
      navigate("/home", { replace: true });
    }
  }, [isLoggedIn, primaryPath, navigate]);

  // Force unauthenticated users back to login when they land on or navigate back to protected routes.
  useEffect(() => {
    if (!isLoggedIn && protectedRoutes.includes(primaryPath)) {
      navigate("/", { replace: true });
    }
  }, [isLoggedIn, primaryPath, navigate]);

  return (
    <AppLayout showChrome={showChrome} currentPath={primaryPath} pageTitle={pageTitle}>
      <PushNotificationManager />
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/notification" element={<NotificationPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/my-account" element={<MyAccountPage />} />
        <Route path="/feedback" element={<FeedbackPage />} />
      </Routes>
    </AppLayout>
  );
}

export default App;
