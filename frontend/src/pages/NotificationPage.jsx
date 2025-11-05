import { Box, Heading, Text, VStack } from "@chakra-ui/react";

const NotificationPage = () => {
  return (
    <Box as="section" maxW="4xl" mx="auto" w="full">
      <VStack spacing={6} align="stretch" bg="white" borderRadius="2xl" boxShadow="xl" p={{ base: 6, md: 10 }}>
        <Heading size="lg" color="#0a2342">
          Notifications
        </Heading>
        <Text color="gray.600">
          You do not have any notifications yet. We will let you know when there is something that needs your attention.
        </Text>
      </VStack>
    </Box>
  );
};

export default NotificationPage;
