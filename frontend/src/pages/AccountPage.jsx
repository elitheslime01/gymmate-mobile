import { Avatar, Box, Button, Heading, Stack, Text, VStack, useToast } from "@chakra-ui/react";
import { ChevronRightIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import { useStudentStore } from "../store/student";
import useWalkinStore from "../store/walkin";

const AccountPage = () => {
  const { user, isLoggedIn, logout } = useStudentStore();
  const { resetBookingInputs, resetNavigation } = useWalkinStore();
  const toast = useToast();
  const navigate = useNavigate();

  const quickActions = [
    { label: "My Account", path: "/my-account" },
    { label: "Booking Transactions" },
    { label: "Feedback", path: "/feedback" },
    { label: "Terms and Conditions" },
  ];

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

  const handleQuickAction = (action) => {
    if (action?.path) {
      navigate(action.path);
      return;
    }

    toast({
      title: action?.label || "Coming soon",
      description: "This section will be available soon.",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Box as="section" maxW="4xl" mx="auto" w="full">
      <VStack spacing={6} align="stretch" bg="white" borderRadius="2xl" boxShadow="xl" p={{ base: 6, md: 10 }}>
        <Heading size="lg" color="#0a2342">
          Account
        </Heading>
        {isLoggedIn && user ? (
          <Stack spacing={6} direction={{ base: "column", md: "row" }} align={{ base: "flex-start", md: "center" }}>
            <Avatar name={`${user._fName} ${user._lName}`} size="xl" bg="#FE7654" color="white" src={user._profileImage ? `data:image/jpeg;base64,${user._profileImage}` : undefined} />
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
          <Stack spacing={2}>
            {quickActions.map((action) => (
              <Button
                key={action.label}
                variant="ghost"
                justifyContent="space-between"
                alignItems="center"
                bg="gray.50"
                color="#0a2342"
                _hover={{ bg: "#FE7654", color: "white" }}
                _active={{ bg: "#cc4a2d", color: "white" }}
                onClick={() => handleQuickAction(action)}
                borderRadius="lg"
                px={5}
                py={6}
                w="full"
                rightIcon={<ChevronRightIcon />}
              >
                {action.label}
              </Button>
            ))}
          </Stack>
        )}
        {isLoggedIn && (
          <Button 
            alignSelf="flex-start" 
            bg="#FE7654" 
            color="white" 
            _hover={{ bg: "#e65c3b" }} 
            _active={{ bg: "#cc4a2d" }} 
            onClick={handleLogout}
            h={{ base: "50px", md: "40px" }}
            fontSize={{ base: "lg", md: "md" }}
            fontWeight="bold"
            borderRadius="xl"
            px={8}
          >
            Log out
          </Button>
        )}
      </VStack>
    </Box>
  );
};

export default AccountPage;
