import { Box, Center, Flex, Heading, Stack, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import useWalkinStore from "../store/walkin";
import BookingLogOptions from "../components/BookingLogOptions";
import WalkinBookSession from "../components/WalkinBookSession";
import WalkinARInput from "../components/WalkinARInput";
import WalkinReview from "../components/WalkinReview";
import WalkinTimeInOut from "../components/WalkinTimeInOut";
import { PiConfettiFill } from "react-icons/pi";

export default function BookingPage() {
  const {
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

  const renderActiveStep = () => {
    if (isBooked) {
      return (
        <Center w="full">
          <Box
            w="full"
            maxW="md"
            textAlign="center"
            bg="white"
            p={{ base: 6, md: 8 }}
            borderRadius="2xl"
            boxShadow="xl"
          >
            <Center mb={6}>
              <PiConfettiFill color="#FE7654" size={96} />
            </Center>
            <Stack spacing={4}>
              <Heading size="md">Your selected session has been queued!</Heading>
              <Text color="gray.600">We&apos;ll take you back in {countdown} seconds.</Text>
            </Stack>
          </Box>
        </Center>
      );
    }

    if (showTimeInOut) {
      return <WalkinTimeInOut />;
    }

    if (showBooking) {
      return <WalkinBookSession />;
    }

    if (showARInput) {
      return <WalkinARInput />;
    }

    if (showReview) {
      return <WalkinReview />;
    }

    return <BookingLogOptions />;
  };

  return (
    <Flex flex="1" justify="center">
      <Box w="full" maxW="6xl">
        {renderActiveStep()}
      </Box>
    </Flex>
  );
}