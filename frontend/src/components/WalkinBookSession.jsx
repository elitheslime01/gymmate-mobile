import { Box, Button, Flex, Heading, Stack, useToast } from "@chakra-ui/react";
import useWalkinStore from "../store/walkin";
import WalkinCalendar from "../components/WalkinCalendar";
import WalkinTimeSlots from "../components/WalkinTimeSlots";

const WalkinBookSession = () => {
    const {
        selectedDay,
        selectedTime,
        setShowARInput,
        setShowBooking,
        checkExistingBooking,
        currentDate,
    } = useWalkinStore();

    const toast = useToast();

    const handleBkCancel = () => {
        setShowBooking(false);
    };

    const handleBkProceed = async () => {
        const userId = localStorage.getItem('userId');
        
        if (!userId) {
            toast({
                title: "Authentication Error",
                description: "Please log in to proceed with booking.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }
    
        if (!selectedDay || !selectedTime) {
            toast({
                title: "Selection Required",
                description: "Please select a date and time slot before proceeding.",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });
            return; 
        }
    
        const selectedDate = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            selectedDay + 1
        );
        const formattedDate = selectedDate.toISOString().split('T')[0];
    
        try {
            // Use the selectedTime object directly since it contains the full time slot data
            const timeSlotData = {
                startTime: selectedTime.startTime || selectedTime._startTime,
                endTime: selectedTime.endTime || selectedTime._endTime
            };
    
            const checkResult = await checkExistingBooking(
                userId,
                formattedDate,
                timeSlotData
            );
    
            if (checkResult.exists) {
                toast({
                    title: "Booking Conflict",
                    description: "You already have a booking for this time slot.",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
                return;
            }
    
            setShowARInput(true);
            setShowBooking(false);
            
        } catch (error) {
            console.error("Error checking booking:", error);
            toast({
                title: "Error",
                description: "Failed to check existing booking.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    
    return (
        <Box
            w="100%"
            bg="white"
            borderRadius="2xl"
            boxShadow="xl"
            p={{ base: 4, md: 6, xl: 8 }}
        >
            <Stack spacing={{ base: 6, md: 8 }}>
                <Heading as="h1" size="lg">Book a session</Heading>

                <Flex
                    direction={{ base: "column", xl: "row" }}
                    gap={{ base: 6, md: 8 }}
                    align="stretch"
                >
                    <Box flex="1" minW={0}>
                        <WalkinCalendar />
                    </Box>
                    <Box flex="1" minW={0}>
                        <WalkinTimeSlots />
                    </Box>
                </Flex>

                <Stack
                    direction={{ base: "column", sm: "row" }}
                    spacing={4}
                    pt={{ base: 2, md: 4 }}
                    borderTop="1px solid"
                    borderColor="gray.200"
                >
                    <Button
                        bgColor="white"
                        color="#FE7654"
                        border="2px"
                        borderColor="#FE7654"
                        _hover={{ bg: "#FE7654", color: "white" }}
                        _active={{ bg: "#cc4a2d" }}
                        flex="1"
                        onClick={handleBkCancel}
                    >
                        Cancel
                    </Button>
                    <Button
                        bgColor="#FE7654"
                        color="white"
                        _hover={{ bg: "#e65c3b" }}
                        _active={{ bg: "#cc4a2d" }}
                        flex="1"
                        onClick={handleBkProceed}
                    >
                        Proceed
                    </Button>
                </Stack>
            </Stack>
        </Box>
    );
};

export default WalkinBookSession;