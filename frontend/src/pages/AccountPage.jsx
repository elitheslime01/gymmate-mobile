import { Avatar, Box, Button, Heading, Stack, Text, VStack, useToast } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useStudentStore } from "../store/student";
import useWalkinStore from "../store/walkin";

const AccountPage = () => {
  const { user, isLoggedIn, logout } = useStudentStore();
  const { resetBookingInputs, resetNavigation } = useWalkinStore();
  const toast = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const success = await logout();
    if (success) {
      resetBookingInputs();
      resetNavigation();
      toast({
        title: "Logged out",
        description: "You have been signed out successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      navigate("/");
    } else {
      toast({
        title: "Logout failed",
        description: "We couldn't log you out. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box as="section" maxW="4xl" mx="auto" w="full">
      <VStack spacing={6} align="stretch" bg="white" borderRadius="2xl" boxShadow="xl" p={{ base: 6, md: 10 }}>
        <Heading size="lg" color="#0a2342">
          Account
        </Heading>
        {isLoggedIn && user ? (
          <Stack spacing={6} direction={{ base: "column", md: "row" }} align={{ base: "flex-start", md: "center" }}>
            <Avatar name={`${user._fName} ${user._lName}`} size="xl" bg="#FE7654" color="white" />
            <VStack align="flex-start" spacing={2} flex="1">
              <Text fontWeight="semibold">Full Name: {user._fName} {user._lName}</Text>
              <Text fontWeight="semibold">Student ID: {user._umakID}</Text>
              <Text fontWeight="semibold">Email: {user._umakEmail}</Text>
            </VStack>
          </Stack>
        ) : (
          <Text color="gray.600">Log in to see your account information.</Text>
        )}
        {isLoggedIn && (
          <Button alignSelf="flex-start" bg="#FE7654" color="white" _hover={{ bg: "#e65c3b" }} _active={{ bg: "#cc4a2d" }} onClick={handleLogout}>
            Log out
          </Button>
        )}
      </VStack>
    </Box>
  );
};

export default AccountPage;
