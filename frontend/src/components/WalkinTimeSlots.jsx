import { useEffect, useState } from 'react';
import { Badge, Box, Button, Flex, Heading, HStack, SimpleGrid, Stack, Text, Tooltip, VStack } from "@chakra-ui/react";
import { QuestionIcon } from "@chakra-ui/icons";
import { FaCalendarTimes } from "react-icons/fa";
import useWalkinStore from '../store/walkin.js';

const statusStyles = {
    "available": {
        bg: "green.50",
        color: "green.600",
        borderColor: "green.200"
    },
    "fully booked": {
        bg: "red.50",
        color: "red.600",
        borderColor: "red.200"
    },
    "under maintenance": {
        bg: "orange.50",
        color: "orange.600",
        borderColor: "orange.200"
    },
    "reserved": {
        bg: "purple.50",
        color: "purple.600",
        borderColor: "purple.200"
    },
    "unavailable": {
        bg: "gray.100",
        color: "gray.600",
        borderColor: "gray.200"
    }
};

const getStatusStyle = (status) => {
    if (!status) {
        return {
            label: "Unavailable",
            ...statusStyles["unavailable"]
        };
    }

    const normalized = typeof status === "string" ? status.toLowerCase() : status;
    const style = statusStyles[normalized];

    if (style) {
        return {
            label: typeof status === "string" ? status : "Available",
            ...style
        };
    }

    return {
        label: typeof status === "string" ? status : "Status",
        bg: "gray.100",
        color: "gray.700",
        borderColor: "gray.200"
    };
};

const ScheduleTimeSlots = () => {
    const { setSelectedTimeSlot, selectedDay, scheduleData, setSelectedTime, fetchScheduleByDate } = useWalkinStore();
    const [selectedSlot, setSelectedSlot] = useState(null);

    useEffect(() => {
        const fetchSchedule = async () => {
            if (selectedDay instanceof Date && !isNaN(selectedDay)) {
                const formattedDate = selectedDay.toISOString().split('T')[0];
                await fetchScheduleByDate(formattedDate);
            }
        };
        fetchSchedule();
    }, [selectedDay, fetchScheduleByDate]);

    const handleTimeClick = (slot, isBookable) => {
        if (!isBookable) return;

        setSelectedSlot(slot); // Set the selected slot data
        setSelectedTime({
            startTime: slot.startTime || slot._startTime,
            endTime: slot.endTime || slot._endTime
        });
        setSelectedTimeSlot(slot); // Store the entire slot object
    };

    const timeSlots = scheduleData?.timeSlots ?? [];
    const hasSlots = timeSlots.length > 0;

    return (
        <Box width="100%" display="flex" flexDirection="column" bg="white" borderRadius="xl" boxShadow="lg">
            <Flex color="#071434" p={4} justify="space-between" align="center" borderBottom="1px solid" borderColor="gray.100">
                <Text fontSize="lg" fontWeight="semibold">Time Slots</Text>
                <Tooltip label="Help" aria-label="A tooltip">
                    <QuestionIcon />
                </Tooltip>
            </Flex>

            {!hasSlots && (
                <Box p={6} flex="1" display="flex" justifyContent="center" alignItems="center">
                    <VStack
                        spacing={6}
                        alignItems="center"
                        justifyContent="center"
                    >
                        <FaCalendarTimes size={80} color="#071434" />
                        <Text fontSize="lg" color="#071434">No time slots created yet</Text>
                    </VStack>
                </Box>
            )}

            {hasSlots && (
                <Box p={{ base: 4, md: 6 }} flex="1">
                    <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={{ base: 4, md: 5 }}>
                        {timeSlots.map((slot) => {
                            const startTime = slot._startTime || slot.startTime;
                            const endTime = slot._endTime || slot.endTime;
                            const activeStart = selectedSlot?._startTime || selectedSlot?.startTime;
                            const availableSlots = slot._availableSlots ?? slot.availableSlots ?? 0;
                            const statusInfo = getStatusStyle(slot._status || slot.status);
                            const normalizedStatus = (slot._status || slot.status || "").toLowerCase();
                            const isBookable = normalizedStatus === "available" && availableSlots > 0;
                            const isActive = isBookable && activeStart === startTime;

                            return (
                                <Button
                                    key={`${startTime}-${endTime}`}
                                    onClick={() => handleTimeClick(slot, isBookable)}
                                    bg="white"
                                    borderWidth="2px"
                                    borderColor={isActive ? "#FE7654" : "gray.200"}
                                    boxShadow={isActive ? "0 0 0 2px rgba(254, 118, 84, 0.3)" : "md"}
                                    h="auto"
                                    minH={{ base: "100px", md: "110px" }}
                                    py={{ base: 4, md: 5 }}
                                    px={{ base: 4, md: 5 }}
                                    borderRadius="xl"
                                    justifyContent="flex-start"
                                    textAlign="left"
                                    opacity={isBookable ? 1 : 0.6}
                                    cursor={isBookable ? "pointer" : "not-allowed"}
                                    _hover={isBookable ? { 
                                        borderColor: isActive ? "#e65c3b" : "#FE7654", 
                                        boxShadow: "lg",
                                        transform: "translateY(-2px)"
                                    } : {
                                        borderColor: "gray.200",
                                        boxShadow: "md",
                                        transform: "none"
                                    }}
                                    _focusVisible={{ boxShadow: "0 0 0 3px rgba(254, 118, 84, 0.4)" }}
                                    _active={isBookable ? { 
                                        transform: "scale(0.98)",
                                        borderColor: "#cc4a2d"
                                    } : {
                                        transform: "none",
                                        borderColor: "gray.200"
                                    }}
                                    transition="all 0.2s"
                                >
                                    <Stack spacing={3} align="flex-start" w="full">
                                        <Heading fontSize="md" fontWeight="semibold">
                                            {`${startTime} - ${endTime}`}
                                        </Heading>
                                        <HStack spacing={2} flexWrap="wrap">
                                            <Badge
                                                px={3}
                                                py={1}
                                                bg="gray.100"
                                                color="gray.700"
                                                borderRadius="full"
                                                fontWeight="medium"
                                            >
                                                Available: {slot._availableSlots ?? slot.availableSlots ?? 0}
                                            </Badge>
                                            <Badge
                                                px={3}
                                                py={1}
                                                bg={statusInfo.bg}
                                                color={statusInfo.color}
                                                borderRadius="full"
                                                borderWidth="1px"
                                                borderColor={statusInfo.borderColor}
                                                fontWeight="medium"
                                                textTransform="capitalize"
                                            >
                                                {statusInfo.label}
                                            </Badge>
                                        </HStack>
                                    </Stack>
                                </Button>
                            );
                        })}
                    </SimpleGrid>
                </Box>
            )}
        </Box>
    );
}

export default ScheduleTimeSlots;