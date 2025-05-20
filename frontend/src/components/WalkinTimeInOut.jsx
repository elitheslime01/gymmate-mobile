import {
  Box,
  Card,
  CardBody,
  Heading,
  Text,
  VStack,
  HStack,
  Divider,
  Button,
  useToast
} from "@chakra-ui/react";
import { useEffect } from "react";
import { useStudentStore } from "../store/student";
import useWalkinStore from "../store/walkin";
import { format } from 'date-fns';

const WalkinTimeInOut = () => {
  const { user, logout } = useStudentStore();
  const {
    currentBooking,
    upcomingBookings,
    fetchCurrentBooking,
    fetchUpcomingBookings,
    clearCurrentBooking,
    resetState, 
    setShowTimeInOut, 
    setShowLogOptions 
  } = useWalkinStore();
  const toast = useToast();

  useEffect(() => {
    if (user?._id) {
      fetchUpcomingBookings(user._id);
    }
  }, [user?._id, fetchUpcomingBookings]);

  // Find the logged-in student's booking information
  const currentStudent = currentBooking?.students?.find(
    student => student?._studentId?._id === user?._id
  );

  const isMissed = (booking, student) => {
    const bookingTime = new Date(booking._date);
    const [hours, minutes] = booking._timeSlot.startTime
      .match(/(\d+):(\d+) (AM|PM)/)
      .slice(1);

    let bookingHour = parseInt(hours);
    const bookingMinutes = parseInt(minutes);
    const isPM = booking._timeSlot.startTime.includes('PM');

    if (isPM && bookingHour !== 12) bookingHour += 12;
    else if (!isPM && bookingHour === 12) bookingHour = 0;

    bookingTime.setHours(bookingHour, bookingMinutes + 15, 0); // Add 15 minutes grace period

    return new Date() > bookingTime && !student._timedIn && !student._timedOut;
  };

  useEffect(() => {
    const checkMissedBookings = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/bookings/check-missed', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          await fetchCurrentBooking(user._id);
          await fetchUpcomingBookings(user._id);
        }
      } catch (error) {
        console.error("Error checking missed bookings:", error);
      }
    };
    checkMissedBookings();
  }, [user?._id, fetchCurrentBooking, fetchUpcomingBookings]);

  useEffect(() => {
    const checkMissedSchedule = async () => {
      if (currentBooking && currentStudent && user?._id && isMissed(currentBooking, currentStudent)) {
        try {
          const response = await fetch('http://localhost:5000/api/bookings/check-missed', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            }
          });

          if (response.ok) {
            await fetchCurrentBooking(user._id);
          }
        } catch (error) {
          console.error("Error checking missed bookings:", error);
        }
      }
    };

    checkMissedSchedule();
  }, [currentBooking, currentStudent, user?._id, fetchCurrentBooking]);

  useEffect(() => {
    const fetchBooking = async () => {
      if (!user?._id) return;

      try {
        await fetchCurrentBooking(user._id);
      } catch (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch booking information",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };

    fetchBooking();
  }, [user?._id, fetchCurrentBooking, toast]);

  const isToday = (date) => {
    const today = new Date();
    const bookingDate = new Date(date);
    return (
      bookingDate.getDate() === today.getDate() &&
      bookingDate.getMonth() === today.getMonth() &&
      bookingDate.getFullYear() === today.getFullYear()
    );
  };

  const handleTimeIn = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/bookings/${currentBooking._id}/timeIn`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: user._id,
          timeIn: new Date(),
        }),
      });

      if (response.ok) {
        await fetchCurrentBooking(user._id);
        toast({
          title: "Time In Recorded",
          description: "Your time in has been successfully recorded.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record time in.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleTimeOut = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/bookings/${currentBooking._id}/timeOut`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: user._id,
          timeOut: new Date(),
        }),
      });

      if (response.ok) {
        await fetchCurrentBooking(user._id);
        toast({
          title: "Time Out Recorded",
          description: "Your time out has been successfully recorded.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record time out.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleLogOptCancel = () => {
    setShowTimeInOut(false);
    setShowLogOptions(true);
  };

  useEffect(() => {
    // Cleanup function to clear booking data when component unmounts
    return () => {
      clearCurrentBooking();
    };
  }, [clearCurrentBooking]);

  const isTimeInAllowed = () => {
    if (!currentBooking?._timeSlot?.startTime || !currentBooking?._timeSlot?.endTime) return false;

    const now = new Date();

    // Parse start time
    const [startHours, startMinutes] = currentBooking._timeSlot.startTime
      .match(/(\d+):(\d+) (AM|PM)/)
      .slice(1);

    let startHour = parseInt(startHours);
    const startMinute = parseInt(startMinutes);
    const isStartPM = currentBooking._timeSlot.startTime.includes('PM');

    if (isStartPM && startHour !== 12) startHour += 12;
    else if (!isStartPM && startHour === 12) startHour = 0;

    // Parse end time
    const [endHours, endMinutes] = currentBooking._timeSlot.endTime
      .match(/(\d+):(\d+) (AM|PM)/)
      .slice(1);

    let endHour = parseInt(endHours);
    const endMinute = parseInt(endMinutes);
    const isEndPM = currentBooking._timeSlot.endTime.includes('PM');

    if (isEndPM && endHour !== 12) endHour += 12;
    else if (!isEndPM && endHour === 12) endHour = 0;

    // Create Date objects for comparison
    const startTime = new Date();
    startTime.setHours(startHour, startMinute, 0, 0);

    const endTime = new Date();
    endTime.setHours(endHour, endMinute, 0, 0);

    // Allow time in from start time until end time
    return now >= startTime && now < endTime;
  };

  if (!currentBooking) {
    return (
      <Box p={4} w="100%" maxW="sm" mx="auto">
        <HStack spacing={4} justify="flex-start">
          <Button
            bgColor="white"
            color="#FE7654"
            border="2px"
            borderColor="#FE7654"
            _hover={{ bg: '#FE7654', color: 'white' }}
            _active={{ bg: '#cc4a2d' }}
            onClick={handleLogOptCancel}
            mb={4}
          >
            Back
          </Button>
        </HStack>
        <Card bg="white" boxShadow="lg">
          <CardBody>
            <Text textAlign="center">No active bookings found</Text>
          </CardBody>
        </Card>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box p={4} w="100%" maxW="sm" mx="auto">
        <Card bg="white" boxShadow="lg">
          <CardBody>
            <Text textAlign="center">Please log in to view bookings</Text>
          </CardBody>
        </Card>
      </Box>
    );
  }

  return (
    <Box
      p={2}
      w="100%"
      h="calc(100vh - 128px)" // Adjust for header/footer
      overflowY="auto"
      bg="#f5f6fa"
    >
      {/* Back Button */}
      <Box w="100%" mb={2}>
        <Button
          bgColor="white"
          color="#FE7654"
          border="2px"
          borderColor="#FE7654"
          _hover={{ bg: '#FE7654', color: 'white' }}
          _active={{ bg: '#cc4a2d' }}
          onClick={handleLogOptCancel}
          mb={2}
          size="md"
          px={6}
          py={2}
          rounded="md"
          fontWeight="bold"
        >
          Back
        </Button>
      </Box>

      {/* Booking Card */}
      <Card bg="white" boxShadow="lg" mb={4} w="100%" maxW="sm" mx="auto">
        <CardBody>
          <VStack spacing={4} align="center" w="100%">
            <Heading size="md" textAlign="center">
              {`${currentBooking._timeSlot.startTime} - ${currentBooking._timeSlot.endTime}`}
            </Heading>
            <Text fontSize="sm" color="gray.600" textAlign="center">
              {format(new Date(currentBooking._date), 'EEEE - MMMM d')}
            </Text>
            <Divider />
            <Text fontWeight="semibold" color="gray.700" textAlign="center">
              Booking Status: {currentStudent?._bookingStatus || "N/A"}
            </Text>
            {currentStudent?._timedIn && (
              <Text fontSize="sm" color="gray.500">
                Timed In: {new Date(currentStudent._timedIn).toLocaleTimeString()}
              </Text>
            )}
            {currentStudent?._timedOut && (
              <Text fontSize="sm" color="gray.500">
                Timed Out: {new Date(currentStudent._timedOut).toLocaleTimeString()}
              </Text>
            )}
            <HStack spacing={4} justify="center" w="100%">
              <Button
                bgColor="#FE7654"
                color="white"
                _hover={{ bg: '#e65c3b' }}
                _active={{ bg: '#cc4a2d' }}
                isDisabled={!!currentStudent?._timedIn || !isTimeInAllowed()}
                onClick={handleTimeIn}
                w="50%"
              >
                Time In
              </Button>
              <Button
                bgColor="#FE7654"
                color="white"
                _hover={{ bg: '#e65c3b' }}
                _active={{ bg: '#cc4a2d' }}
                isDisabled={!currentStudent?._timedIn || !!currentStudent?._timedOut}
                onClick={handleTimeOut}
                w="50%"
              >
                Time Out
              </Button>
            </HStack>
            {/* Helper Messages */}
            {((!isToday(currentBooking._date) ||
              (!currentStudent?._timedIn && !isTimeInAllowed()) ||
              currentStudent?._bookingStatus === "Not Attended") && (
              <Box borderRadius="md" bg="gray.50" p={2} fontSize="sm" w="100%">
                {!isToday(currentBooking._date) && (
                  <Text color="orange.500" mb={2} textAlign="center">
                    Note: This is your next scheduled booking.
                  </Text>
                )}
                {!currentStudent?._timedIn && !isTimeInAllowed() && (
                  <Text color="orange.500" mb={2} textAlign="center">
                    Time in available between {currentBooking._timeSlot.startTime} and {currentBooking._timeSlot.endTime}
                  </Text>
                )}
                {currentStudent?._bookingStatus === "Not Attended" && (
                  <Text color="red.500" textAlign="center">
                    Missed booking - affects priority score and no-shows.
                  </Text>
                )}
              </Box>
            ))}
          </VStack>
        </CardBody>
      </Card>

      {/* Upcoming Bookings */}
      {upcomingBookings.length > 0 && (
        <Box maxW="sm" mx="auto">
          <Text fontSize="lg" fontWeight="semibold" mb={4}>
            Upcoming Bookings
          </Text>
          <Box
            maxH="300px"
            overflowY="auto"
            css={{
              '&::-webkit-scrollbar': {
                width: '4px',
              },
              '&::-webkit-scrollbar-track': {
                width: '6px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#FE7654',
                borderRadius: '24px',
              },
            }}
          >
            <VStack spacing={4}>
              {upcomingBookings.map((booking) => {
                const student = booking.students.find(
                  s => s._studentId._id === user._id
                );

                return (
                  <Card
                    key={booking._id}
                    bg="white"
                    boxShadow="md"
                    w="100%"
                  >
                    <CardBody>
                      <HStack justifyContent="center">
                        <VStack align="start" spacing={1} pr={4}>
                          <Heading size="md">
                            {`${booking._timeSlot.startTime} - ${booking._timeSlot.endTime}`}
                          </Heading>
                          <Text fontSize="sm" color="gray.600">
                            {format(new Date(booking._date), 'EEEE - MMMM d')}
                          </Text>
                        </VStack>
                        <Text
                          fontSize="lg"
                          fontWeight="bold"
                          color="gray.700"
                          borderLeft="2px solid"
                          borderColor="gray.200"
                          pl={4}
                        >
                          #{student?._arID?._code || "000000"}
                        </Text>
                      </HStack>
                    </CardBody>
                  </Card>
                );
              })}
            </VStack>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default WalkinTimeInOut;