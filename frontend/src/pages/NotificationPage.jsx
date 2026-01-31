import { useEffect } from "react";
import { Box, Heading, Text, VStack, HStack, Button, Spinner, Divider } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import NotificationCard from "../components/NotificationCard";
import useNotificationStore from "../store/notification";
import { useStudentStore } from "../store/student";

const NotificationPage = () => {
  const navigate = useNavigate();
  const { user } = useStudentStore();
  const {
    notifications,
    isLoading,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotificationStore();

  useEffect(() => {
    fetchNotifications(user?._id);
    const interval = setInterval(() => fetchNotifications(user?._id), 60000);
    return () => clearInterval(interval);
  }, [user?._id]);

  const handleOpen = (notification) => {
    if (notification.link) {
      navigate(notification.link);
    }
    if (!notification.read) {
      markAsRead(notification._id);
    }
  };

  if (!user) {
    return (
      <Box as="section" maxW="4xl" mx="auto" w="full">
        <VStack spacing={4} align="stretch" bg="white" borderRadius="2xl" boxShadow="xl" p={{ base: 6, md: 10 }}>
          <Heading size="lg" color="#0a2342">Notifications</Heading>
          <Text color="gray.600">Log in to view your notifications.</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box as="section" maxW="4xl" mx="auto" w="full">
      <VStack spacing={4} align="stretch" bg="white" borderRadius="2xl" boxShadow="xl" p={{ base: 6, md: 10 }}>
        <HStack justify="space-between" align="center">
          <VStack align="flex-start" spacing={1}>
            <Heading size="lg" color="#0a2342">Notifications</Heading>
            <Text color="gray.600">Stay on top of your bookings and queue updates.</Text>
          </VStack>
          {unreadCount > 0 && (
            <Button size="md" variant="outline" colorScheme="orange" onClick={() => markAllAsRead(user._id)}>
              Mark all read
            </Button>
          )}
        </HStack>

        <Divider />

        {isLoading ? (
          <HStack spacing={3} color="gray.600">
            <Spinner size="sm" />
            <Text>Loading notifications...</Text>
          </HStack>
        ) : notifications.length === 0 ? (
          <Text color="gray.600">You do not have any notifications yet.</Text>
        ) : (
          <VStack spacing={3} align="stretch">
            {notifications.map((notification) => (
              <NotificationCard
                key={notification._id}
                notification={notification}
                onOpenLink={() => handleOpen(notification)}
                onMarkRead={() => markAsRead(notification._id)}
              />
            ))}
          </VStack>
        )}
      </VStack>
    </Box>
  );
};

export default NotificationPage;
