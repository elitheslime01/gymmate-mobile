import { Box, Button, Flex, Heading, useToast } from "@chakra-ui/react";
import useWalkinStore from "../store/walkin";
import { useStudentStore } from "../store/student";

const BookingLogOptions = () => {
    const { user } = useStudentStore();
    const toast = useToast();

    const {
        setShowBooking,
        setShowLogOptions,
        setShowTimeInOut,
        setShowLogin
    } = useWalkinStore();
    const { logout } = useStudentStore();

    const handleOptLogin = () => {
        setShowTimeInOut(true);
        setShowLogOptions(false);
    };

    const handleLogOptBook = () => {
        setShowBooking(true);
        setShowLogOptions(false);
    };

    const handleLogOptCancel = async () => {
        try {
            await logout();
            setShowLogOptions(false);
            setShowLogin(true);
            toast({
                title: "Logged out",
                description: "You have successfully logged out.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch {
            toast({
                title: "Error",
                description: "Failed to log out.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    return (
        <Flex minH="calc(100vh - 128px)" // Adjust for header and footer height
            align="center"
            justify="center"
            w="100%"
            bg="transparent"
        >
            <Box p={8} minW="full" maxW="4xl">
                <Flex align="center" mb={6} justify="center">
                    <Heading as="h1" size="md" color="gray.800" textAlign="center" flex="1">
                        Hello {user?._fName ? user._fName : "Guest"}, what do you want to do today?
                    </Heading>
                </Flex>
                <Flex direction="column" gap={6} align="center" mb={6}>
                    <Button
                        bgColor='#FE7654'
                        color='white'
                        _hover={{ bg: '#e65c3b' }}
                        _active={{ bg: '#cc4a2d' }}
                        size="xl"
                        w="100%"
                        h="120px"
                        fontSize="xl"
                        whiteSpace="wrap"
                        onClick={handleLogOptBook}
                    >
                        I want to book a session.
                    </Button>
                    <Button
                        bgColor='#FE7654'
                        color='white'
                        _hover={{ bg: '#e65c3b' }}
                        _active={{ bg: '#cc4a2d' }}
                        size="xl"
                        w="100%"
                        h="120px"
                        fontSize="xl"
                        whiteSpace="wrap"
                        onClick={handleOptLogin}
                    >
                        I want to time in or time out of my session.
                    </Button>
                </Flex>
            </Box>
        </Flex>
    );
};

export default BookingLogOptions;