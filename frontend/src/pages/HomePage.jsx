import { Box, Flex, Icon, Text } from "@chakra-ui/react";
import { MdHome, MdCalendarToday, MdNotifications, MdPerson } from "react-icons/md";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <Flex minH="100vh" direction="column" bg="#f5f6fa">
      {/* Header */}
      <Box w="100vw" bg="#0a2342" py={4} boxShadow="sm">
        <Text color="white" fontWeight="bold" fontSize="xl" textAlign="center">
          Welcome to GymMate!
        </Text>
      </Box>

      {/* Main Content */}
      <Flex flex="1" />

      {/* Footer / Bottom Navigation */}
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
        zIndex={10}
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