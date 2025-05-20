import { Flex } from "@chakra-ui/react";
import { Route, Routes, useLocation } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import BookingPage from "./pages/BookingPage";

function App() {
  const location = useLocation();

  return (
    <Flex>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/booking" element={<BookingPage />} />
      </Routes>
    </Flex>
  );
}

export default App;
