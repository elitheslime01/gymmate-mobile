import { Route, Routes, useLocation } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import BookingPage from "./pages/BookingPage";
import NotificationPage from "./pages/NotificationPage";
import AccountPage from "./pages/AccountPage";
import AppLayout from "./components/layout/AppLayout";

function App() {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);
  const primaryPath = segments.length ? `/${segments[0]}` : "/";
  const showChrome = primaryPath !== "/";

  const ROUTE_TITLES = {
    "/home": "Welcome to GymMate",
    "/booking": "Booking",
    "/notification": "Notifications",
    "/account": "Account",
  };

  const pageTitle = ROUTE_TITLES[primaryPath] || "";

  return (
    <AppLayout showChrome={showChrome} currentPath={primaryPath} pageTitle={pageTitle}>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/notification" element={<NotificationPage />} />
        <Route path="/account" element={<AccountPage />} />
      </Routes>
    </AppLayout>
  );
}

export default App;
