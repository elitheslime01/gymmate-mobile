import { Box, Button, Flex, Heading, Icon, SimpleGrid, Stack, Text } from "@chakra-ui/react";
import { MdCalendarToday, MdAccessTime, MdNotificationsActive } from "react-icons/md";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const quickActions = [
    {
      id: "book",
      title: "Book a Session",
      description: "Reserve your preferred time slot before heading to the gym.",
      icon: MdCalendarToday,
      action: () => navigate("/booking"),
      cta: "Book now",
    },
    {
      id: "attendance",
      title: "Manage Attendance",
      description: "Time in or out seamlessly with your acknowledgement receipt.",
      icon: MdAccessTime,
      action: () => navigate("/booking"),
      cta: "Open queue tools",
    },
  ];

  return (
    <Flex flex="1" justify="center">
      <Stack spacing={{ base: 8, md: 12 }} w="full" maxW="container.xl">
        <Box
          bgGradient="linear(to-r, #0a2342, #1c4472)"
          color="white"
          borderRadius="2xl"
          boxShadow="xl"
          p={{ base: 6, md: 10 }}
        >
          <Stack spacing={{ base: 4, md: 6 }}>
            <Heading size="lg">Welcome to GymMate!</Heading>
            <Text fontSize={{ base: "md", md: "lg" }} maxW="xl">
              Plan workouts, manage bookings, and stay updated with gym announcements all in one place, whether you&apos;re on mobile or desktop.
            </Text>
            <Button
              size="lg"
              alignSelf={{ base: "stretch", sm: "flex-start" }}
              bg="white"
              color="#0a2342"
              _hover={{ bg: "rgba(255,255,255,0.9)" }}
              _active={{ bg: "rgba(255,255,255,0.85)" }}
              onClick={() => navigate("/booking")}
            >
              Schedule a session
            </Button>
          </Stack>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 4, md: 6 }}>
          {quickActions.map((action) => (
            <Box
              key={action.id}
              bg="white"
              borderRadius="xl"
              boxShadow="md"
              p={{ base: 5, md: 6 }}
              display="flex"
              flexDirection="column"
              gap={4}
            >
              <Flex align="center" gap={4}>
                <Box
                  bg="rgba(10, 35, 66, 0.08)"
                  color="#0a2342"
                  borderRadius="lg"
                  p={3}
                  display="inline-flex"
                >
                  <Icon as={action.icon} boxSize={6} />
                </Box>
                <Heading size="md">{action.title}</Heading>
              </Flex>
              <Text color="gray.600" flex="1">
                {action.description}
              </Text>
              <Button
                alignSelf="flex-start"
                colorScheme="orange"
                bg="#FE7654"
                _hover={{ bg: "#e65c3b" }}
                _active={{ bg: "#cc4a2d" }}
                onClick={action.action}
              >
                {action.cta}
              </Button>
            </Box>
          ))}
        </SimpleGrid>

        <Box
          bg="white"
          borderRadius="xl"
          boxShadow="md"
          p={{ base: 5, md: 6 }}
          display="flex"
          flexDirection={{ base: "column", md: "row" }}
          gap={{ base: 4, md: 6 }}
          alignItems="center"
        >
          <Box
            bg="rgba(254, 118, 84, 0.15)"
            color="#FE7654"
            borderRadius="full"
            p={3}
            display="inline-flex"
          >
            <Icon as={MdNotificationsActive} boxSize={7} />
          </Box>
          <Stack spacing={2} flex="1">
            <Heading size="md">Stay in the loop</Heading>
            <Text color="gray.600">
              Enable notifications to get real-time updates on queue changes, new slots, and gym announcements. Seamless on phones, tablets, and desktops.
            </Text>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
}