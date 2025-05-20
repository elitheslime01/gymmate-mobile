import { Box, Flex, Icon, Text } from "@chakra-ui/react";
import { MdHome, MdCalendarToday, MdNotifications, MdPerson } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import useWalkinStore from "../store/walkin";
import BookingLogOptions from "../components/BookingLogOptions";
import WalkinBookSession from "../components/WalkinBookSession";
import WalkinARInput from "../components/WalkinARInput";
import WalkinReview from "../components/WalkinReview";
import WalkinTimeInOut from "../components/WalkinTimeInOut";
import { PiConfettiFill } from "react-icons/pi";
import { Center, Heading } from "@chakra-ui/react";

export default function BookingPage() {
  const navigate = useNavigate();
  const {
    showLogOptions,
    showBooking,
    showARInput,
    showReview,
    showTimeInOut,
    isBooked,
    setIsBooked,
    setShowReview,
    setShowLogOptions
  } = useWalkinStore();

  // Countdown for success screens
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    let timer;
    if (isBooked && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setIsBooked(false);
      setShowReview(false);
      setCountdown(5);
    }
    return () => clearInterval(timer);
  }, [isBooked, countdown, setIsBooked, setShowReview]);

  useEffect(() => {
    setShowLogOptions(true);
    // Optionally reset other states here if needed
  }, [setShowLogOptions]);

  // Header height (px)
  const HEADER_HEIGHT = 64; // adjust if needed (py={4} ≈ 64px)
  const FOOTER_HEIGHT = 64; // adjust if needed

  return (
    <Flex minH="100vh" direction="column" bg="#f5f6fa">
      {/* Fixed Header */}
      <Box
        w="100vw"
        bg="#0a2342"
        py={4}
        boxShadow="sm"
        position="fixed"
        top={0}
        left={0}
        zIndex={100}
      >
        <Text color="white" fontWeight="bold" fontSize="xl" textAlign="center">
          Booking
        </Text>
      </Box>

      {/* Main Content (scrollable) */}
      <Flex
        flex="1"
        direction="column"
        align="center"
        justify="flex-start"
        mt={`${HEADER_HEIGHT}px`}
        mb={`${FOOTER_HEIGHT}px`}
        overflowY="auto"
        w="100vw"
        minH={`calc(100vh - ${HEADER_HEIGHT + FOOTER_HEIGHT}px)`}
      >
        <Box w="100%" maxW="4xl">
          {/* Booking process flow */}
          {!showBooking && !showARInput && !showReview && !isBooked && !showTimeInOut && (
            <Flex align="center" justify="center">
              <BookingLogOptions />
            </Flex>
          )}

          {showBooking && (
            <Flex justify="center" align="center">
              <WalkinBookSession />
            </Flex>
          )}

          {showARInput && (
            <Flex justify="center" align="center">
              <WalkinARInput />
            </Flex>
          )}

          {showReview && (
            <Flex justify="center" align="center">
              <WalkinReview />
            </Flex>
          )}

          {showTimeInOut && (
            <Flex justify="center" align="center">
              <WalkinTimeInOut />
            </Flex>
          )}

          {isBooked && (
            <Flex
              justify="center"
              align="center"
              minH={`calc(100vh - ${HEADER_HEIGHT + FOOTER_HEIGHT}px)`}
              w="100vw"
            >
              <Box
                p={4}
                w="100%"
                maxW="xs"
                mx="auto"
                display={isBooked ? 'block' : 'none'}
                textAlign="center"
              >
                <Center mb={4}>
                  <PiConfettiFill color='#FE7654' size={80} />
                </Center>
                <Heading as="h1" size="md" mb={4}>
                  Your selected session has been successfully queued!
                </Heading>
                <Center mt={10}>
                  <Text>Returning in... {countdown}</Text>
                </Center>
              </Box>
            </Flex>
          )}
        </Box>
      </Flex>

      {/* Fixed Footer / Bottom Navigation */}
      <Flex
        as="nav"
        w="100vw"
        bg="white"
        borderTop="1px solid #e2e8f0"
        py={2}
        px={2}
        justify="space-around"
        align="center"
        position="fixed"
        bottom={0}
        left={0}
        zIndex={100}
        h={`${FOOTER_HEIGHT}px`}
      >
        <Flex
          direction="column"
          align="center"
          flex="1"
          as="button"
          bg="transparent"
          border="none"
          onClick={() => navigate("/home")}
        >
          <Icon as={MdHome} boxSize={6} color="#0a2342" />
          <Text fontSize="xs" color="#0a2342" mt={1}>
            Home
          </Text>
        </Flex>
        <Flex
          direction="column"
          align="center"
          flex="1"
          as="button"
          bg="transparent"
          border="none"
          onClick={() => navigate("/booking")}
        >
          <Icon as={MdCalendarToday} boxSize={6} color="#0a2342" />
          <Text fontSize="xs" color="#0a2342" mt={1}>
            Booking
          </Text>
        </Flex>
        <Flex
          direction="column"
          align="center"
          flex="1"
          as="button"
          bg="transparent"
          border="none"
          onClick={() => navigate("/notification")}
        >
          <Icon as={MdNotifications} boxSize={6} color="#0a2342" />
          <Text fontSize="xs" color="#0a2342" mt={1}>
            Notification
          </Text>
        </Flex>
        <Flex
          direction="column"
          align="center"
          flex="1"
          as="button"
          bg="transparent"
          border="none"
          onClick={() => navigate("/account")}
        >
          <Icon as={MdPerson} boxSize={6} color="#0a2342" />
          <Text fontSize="xs" color="#0a2342" mt={1}>
            Account
          </Text>
        </Flex>
      </Flex>
    </Flex>
  );
}