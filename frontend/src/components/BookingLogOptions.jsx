import { Box, Button, Flex, Heading, Stack, Text } from "@chakra-ui/react";
import useWalkinStore from "../store/walkin";
import { useStudentStore } from "../store/student";

const BookingLogOptions = () => {
    const { user } = useStudentStore();

    const {
        setShowBooking,
        setShowLogOptions,
        setShowTimeInOut
    } = useWalkinStore();

    const handleOptLogin = () => {
        setShowTimeInOut(true);
        setShowLogOptions(false);
    };

    const handleLogOptBook = () => {
        setShowBooking(true);
        setShowLogOptions(false);
    };

    return (
        <Flex w="full" justify="center">
            <Box
                w="full"
                maxW="3xl"
                bg="white"
                borderRadius="2xl"
                boxShadow="xl"
                p={{ base: 6, md: 10 }}
            >
                <Stack spacing={{ base: 6, md: 8 }} textAlign="center">
                    <Heading size="md" color="gray.800">
                        Hello {user?._fName ? user._fName : "there"}, what would you like to do today?
                    </Heading>
                    <Text color="gray.600" fontSize="sm">
                        Choose an option below to jump straight into booking or quickly log your session attendance.
                    </Text>
                    <Stack spacing={{ base: 4, md: 6 }}>
                        <Button
                            bgColor="#FE7654"
                            color="white"
                            _hover={{ bg: "#e65c3b" }}
                            _active={{ bg: "#cc4a2d" }}
                            size="lg"
                            minH="80px"
                            whiteSpace="normal"
                            fontWeight="semibold"
                            onClick={handleLogOptBook}
                        >
                            I want to book a session.
                        </Button>
                        <Button
                            bgColor="#FE7654"
                            color="white"
                            _hover={{ bg: "#e65c3b" }}
                            _active={{ bg: "#cc4a2d" }}
                            size="lg"
                            minH="80px"
                            whiteSpace="normal"
                            fontWeight="semibold"
                            onClick={handleOptLogin}
                        >
                            I want to time in or time out of my session.
                        </Button>
                    </Stack>
                </Stack>
            </Box>
        </Flex>
    );
};

export default BookingLogOptions;