import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Flex,
  Heading,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useMemo } from "react";
import { format, isSameDay } from "date-fns";
import { useStudentStore } from "../store/student";
import useWalkinStore from "../store/walkin";

const WalkinTimeInOut = () => {
  const { user } = useStudentStore();
  const {
    currentBooking,
    upcomingBookings,
    pastBookings,
    queueSessions,
    fetchCurrentBooking,
    fetchUpcomingBookings,
    fetchQueueSessions,
    clearCurrentBooking,
    setShowTimeInOut,
    setShowLogOptions,
    timeIn,
    timeOut,
    checkMissedBookings,
  } = useWalkinStore();
  const toast = useToast();

  useEffect(() => {
    if (user?._id) {
      fetchUpcomingBookings(user._id);
      fetchQueueSessions(user._id);
    }
  }, [user?._id, fetchUpcomingBookings, fetchQueueSessions]);

  useEffect(() => {
    if (!user?._id) {
      return;
    }

    const fetchBooking = async () => {
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

  useEffect(() => {
    if (user?._id) {
      checkMissedBookings(user._id);
    }
  }, [user?._id, checkMissedBookings]);

  // Find the logged-in student's booking information
  const currentStudent = useMemo(() => {
    return currentBooking?.students?.find(
      (student) => student?._studentId?._id === user?._id
    );
  }, [currentBooking, user?._id]);

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
    if (currentBooking && currentStudent && user?._id && isMissed(currentBooking, currentStudent)) {
      checkMissedBookings(user._id);
    }
  }, [currentBooking, currentStudent, user?._id, checkMissedBookings]);

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

  const isBookingToday = (booking) => {
    if (!booking?._date) {
      return false;
    }

    const bookingDate = new Date(booking._date);
    if (Number.isNaN(bookingDate.getTime())) {
      return false;
    }

    return isSameDay(bookingDate, new Date());
  };

  const isCurrentBookingToday = useMemo(() => {
    if (!currentBooking) {
      return false;
    }

    return isBookingToday(currentBooking);
  }, [currentBooking]);

  const upcomingSource = useMemo(() => {
    if (!isCurrentBookingToday && currentBooking?._id) {
      const exists = upcomingBookings.some((booking) => booking._id === currentBooking._id);
      if (!exists) {
        return [...upcomingBookings, currentBooking];
      }
    }
    return upcomingBookings;
  }, [upcomingBookings, currentBooking, isCurrentBookingToday]);

  const filteredUpcoming = useMemo(() => {
    if (!currentBooking?._id || !isCurrentBookingToday) {
      return upcomingSource;
    }
    return upcomingSource.filter((booking) => booking._id !== currentBooking._id);
  }, [upcomingSource, currentBooking?._id, isCurrentBookingToday]);

  const filteredPast = useMemo(() => {
    if (!currentBooking?._id) {
      return pastBookings;
    }
    return pastBookings.filter((booking) => booking._id !== currentBooking._id);
  }, [pastBookings, currentBooking?._id]);

  const getBookingDateTime = (booking) => {
    if (!booking?._date) {
      return null;
    }

    const date = new Date(booking._date);
    if (Number.isNaN(date.getTime())) {
      return null;
    }

    const timeString = booking?._timeSlot?.startTime;
    if (!timeString) {
      return date;
    }

    const match = timeString.match(/(\d+):(\d+) (AM|PM)/);
    if (!match) {
      return date;
    }

    let hour = parseInt(match[1], 10);
    const minute = parseInt(match[2], 10) || 0;
    const meridiem = match[3].toUpperCase();

    if (meridiem === "PM" && hour !== 12) hour += 12;
    if (meridiem === "AM" && hour === 12) hour = 0;

    date.setHours(hour, minute, 0, 0);
    return date;
  };

  const displayUpcoming = useMemo(() => {
    const baseUpcoming = Array.isArray(filteredUpcoming) ? filteredUpcoming : [];
    const queues = Array.isArray(queueSessions) ? queueSessions : [];

    const combined = [...baseUpcoming, ...queues];

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const filtered = combined.filter((booking) => {
      const bookingDateTime = getBookingDateTime(booking);
      if (!bookingDateTime) {
        return true;
      }
      return bookingDateTime.getTime() >= todayStart.getTime();
    });

    filtered.sort((a, b) => {
      const aDate = getBookingDateTime(a);
      const bDate = getBookingDateTime(b);
      const aTime = aDate ? aDate.getTime() : Number.POSITIVE_INFINITY;
      const bTime = bDate ? bDate.getTime() : Number.POSITIVE_INFINITY;
      return aTime - bTime;
    });

    return filtered;
  }, [filteredUpcoming, queueSessions]);

  const queueCount = Array.isArray(queueSessions) ? queueSessions.length : 0;

  const isTimeInAllowed = (booking) => {
    if (!booking?._timeSlot?.startTime || !booking?._timeSlot?.endTime) return false;

    const now = new Date();

    const parseTime = (value) => {
      const match = value.match(/(\d+):(\d+) (AM|PM)/);
      if (!match) return null;
      let hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const meridiem = match[3].toUpperCase();
      if (meridiem === "PM" && hours !== 12) hours += 12;
      if (meridiem === "AM" && hours === 12) hours = 0;
      return { hours, minutes };
    };

    const start = parseTime(booking._timeSlot.startTime);
    const end = parseTime(booking._timeSlot.endTime);

    if (!start || !end) return false;

    const startTime = new Date();
    startTime.setHours(start.hours, start.minutes, 0, 0);

    const endTime = new Date();
    endTime.setHours(end.hours, end.minutes, 0, 0);

    return now >= startTime && now < endTime;
  };

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

  const getStatusMeta = (status, { isQueueEntry } = {}) => {
    const normalized = (status || "").toLowerCase();

    if (isQueueEntry) {
      if (normalized.includes("not allocated")) {
        return { label: "Not Allocated", bg: "yellow.100", color: "yellow.700" };
      }
      return { label: "In Queue", bg: "orange.100", color: "orange.700" };
    }

    if (normalized.includes("book")) {
      return { label: "Booked", bg: "green.100", color: "green.700" };
    }

    if (normalized.includes("miss") || normalized.includes("not attended")) {
      return { label: "Missed", bg: "red.100", color: "red.700" };
    }

    if (normalized.includes("complete") || normalized.includes("attend")) {
      return { label: "Completed", bg: "teal.100", color: "teal.700" };
    }

    return { label: status || "Unknown", bg: "gray.100", color: "gray.700" };
  };

  const formatDate = (date) => {
    if (!date) return "Date unavailable";
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return "Date unavailable";
    return format(parsed, "EEEE, MMM d");
  };

  const formatTime = (value) => {
    if (!value) return "—";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "—";
    return format(parsed, "hh:mm a");
  };

  const renderInfoCard = (title, message) => (
    <Card bg="white" boxShadow="md">
      <CardBody>
        <Stack spacing={3} align="center" textAlign="center">
          <Heading size="sm" color="gray.700">
            {title}
          </Heading>
          <Text color="gray.500">{message}</Text>
        </Stack>
      </CardBody>
    </Card>
  );

  const renderBookingCard = (booking, variant) => {
    const student = booking?.students?.find((s) => s?._studentId?._id === user._id);
    const isQueueEntry = booking?._source === "queue";
    const statusMeta = getStatusMeta(student?._bookingStatus, { isQueueEntry });
    const arNumber = student?._arID?._code || "N/A";
    const hasTimedIn = Boolean(student?._timedIn);
    const hasTimedOut = Boolean(student?._timedOut);
    const allowTimeActions = variant === "current" && !isQueueEntry;

    return (
      <Card key={booking._id} bg="white" boxShadow="lg">
        <CardBody>
          <Stack spacing={3}>
            <Flex justify="space-between" align="center">
              <Heading size="sm">
                {booking?._timeSlot
                  ? `${booking._timeSlot.startTime} - ${booking._timeSlot.endTime}`
                  : "Time to be announced"}
              </Heading>
              <Badge bg={statusMeta.bg} color={statusMeta.color} px={3} py={1} borderRadius="full">
                {statusMeta.label}
              </Badge>
            </Flex>
            <Text color="gray.600">{formatDate(booking._date)}</Text>
            <Text fontSize="sm" color="gray.600">AR Number: #{arNumber}</Text>

            {variant === "future" && (
              <Text fontSize="sm" color="gray.500">
                {isQueueEntry
                  ? statusMeta.label === "Not Allocated"
                    ? "No slot was allocated for this request."
                    : "You are currently in queue for this session."
                  : statusMeta.label === "Not Allocated"
                    ? "No slot was allocated for this request."
                    : "Your slot has been booked."}
              </Text>
            )}

            {isQueueEntry && (
              <Text fontSize="sm" color="gray.500">
                Queue Status: {student?._queueStatus || "Waiting for allocation"}
              </Text>
            )}

            {variant === "past" && (
              <Stack fontSize="sm" color="gray.600" spacing={1}>
                <Text>Time In: {formatTime(student?._timedIn)}</Text>
                <Text>Time Out: {formatTime(student?._timedOut)}</Text>
              </Stack>
            )}

            {allowTimeActions && (
              <Stack spacing={3}>
                <Stack direction={{ base: "column", sm: "row" }} spacing={3}>
                  <Button
                    bg="#FE7654"
                    color="white"
                    _hover={{ bg: "#e65c3b" }}
                    _active={{ bg: "#cc4a2d" }}
                    isDisabled={hasTimedIn || !isTimeInAllowed(booking)}
                    onClick={async () => {
                      const success = await timeIn(booking._id, user._id);
                      if (success) {
                        await fetchCurrentBooking(user._id);
                        await fetchUpcomingBookings(user._id);
                        await fetchQueueSessions(user._id);
                        toast({
                          title: "Time In Recorded",
                          description: "Your time in has been successfully recorded.",
                          status: "success",
                          duration: 3000,
                          isClosable: true,
                        });
                      } else {
                        toast({
                          title: "Error",
                          description: "Failed to record time in.",
                          status: "error",
                          duration: 3000,
                          isClosable: true,
                        });
                      }
                    }}
                    flex="1"
                  >
                    Time In
                  </Button>
                  <Button
                    bg="#FE7654"
                    color="white"
                    _hover={{ bg: "#e65c3b" }}
                    _active={{ bg: "#cc4a2d" }}
                    isDisabled={!hasTimedIn || hasTimedOut}
                    onClick={async () => {
                      const success = await timeOut(booking._id, user._id);
                      if (success) {
                        await fetchCurrentBooking(user._id);
                        await fetchUpcomingBookings(user._id);
                        await fetchQueueSessions(user._id);
                        toast({
                          title: "Time Out Recorded",
                          description: "Your time out has been successfully recorded.",
                          status: "success",
                          duration: 3000,
                          isClosable: true,
                        });
                      } else {
                        toast({
                          title: "Error",
                          description: "Failed to record time out.",
                          status: "error",
                          duration: 3000,
                          isClosable: true,
                        });
                      }
                    }}
                    flex="1"
                  >
                    Time Out
                  </Button>
                </Stack>

                <Stack fontSize="sm" color="gray.600">
                  {hasTimedIn && <Text>Timed In: {formatTime(student?._timedIn)}</Text>}
                  {hasTimedOut && <Text>Timed Out: {formatTime(student?._timedOut)}</Text>}
                </Stack>
              </Stack>
            )}
          </Stack>
        </CardBody>
      </Card>
    );
  };

  return (
    <Flex justify="center" w="full">
      <Box w="full" maxW="6xl" px={{ base: 4, md: 6 }} py={{ base: 4, md: 8 }}>
        <Button
          bgColor="white"
          color="#FE7654"
          border="2px"
          borderColor="#FE7654"
          _hover={{ bg: "#FE7654", color: "white" }}
          _active={{ bg: "#cc4a2d" }}
          onClick={handleLogOptCancel}
          mb={{ base: 6, md: 8 }}
        >
          Back
        </Button>

        <Stack spacing={{ base: 6, md: 8 }}>
          <Card bg="white" boxShadow="lg">
            <CardBody>
              <Stack spacing={1}>
                <Heading size="sm" color="#0a2342">
                  Logged Student
                </Heading>
                <Text fontWeight="semibold" color="gray.800">
                  {`${user?._fName || ""} ${user?._lName || ""}`.trim() || "Unknown Student"}
                </Text>
                {user?._umakEmail && (
                  <Text fontSize="sm" color="gray.600">
                    Email: {user._umakEmail}
                  </Text>
                )}
                {user?._umakID && (
                  <Text fontSize="sm" color="gray.600">
                    Student ID: {user._umakID}
                  </Text>
                )}
              </Stack>
            </CardBody>
          </Card>

          <Tabs variant="enclosed" colorScheme="orange" isFitted>
            <TabList bg="white" borderRadius="md" boxShadow="sm" border="1px" borderColor="gray.100">
              <Tab fontWeight="semibold">Current Session</Tab>
              <Tab fontWeight="semibold">
                Upcoming Sessions
                {queueCount > 0 && (
                  <Badge ml={2} colorScheme="orange" borderRadius="full">
                    {queueCount} in queue
                  </Badge>
                )}
              </Tab>
              <Tab fontWeight="semibold">Past Sessions</Tab>
            </TabList>
            <TabPanels mt={4}>
              <TabPanel px={0}>
                {currentBooking && currentStudent && isCurrentBookingToday
                  ? renderBookingCard(currentBooking, "current")
                  : renderInfoCard("No active session", "You don't have an active session right now.")}
              </TabPanel>
              <TabPanel px={0}>
                {displayUpcoming.length > 0
                  ? (
                    <Stack spacing={4}>
                      {displayUpcoming.map((booking) => renderBookingCard(booking, "future"))}
                    </Stack>
                  )
                  : renderInfoCard("No upcoming sessions", "You have no upcoming sessions yet.")}
              </TabPanel>
              <TabPanel px={0}>
                {filteredPast.length > 0
                  ? (
                    <Stack spacing={4}>
                      {filteredPast.map((booking) => renderBookingCard(booking, "past"))}
                    </Stack>
                  )
                  : renderInfoCard("No past sessions", "You have no past sessions recorded yet.")}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Stack>
      </Box>
    </Flex>
  );
};

export default WalkinTimeInOut;