import PropTypes from "prop-types";
import { Box, Flex, HStack, Text, Badge, Icon, Button, VStack } from "@chakra-ui/react";
import { MdCheckCircle, MdSchedule, MdInfo } from "react-icons/md";

const typeMeta = {
  QUEUE_SUCCESS: { label: "Slot secured", color: "green" },
  QUEUE_FAIL: { label: "No slot", color: "red" },
  QUEUE_WAIT: { label: "In queue", color: "blue" },
  BOOKING_CONFIRMED: { label: "Booking confirmed", color: "green" },
  BOOKING_REMINDER_1D: { label: "1 day reminder", color: "blue" },
  BOOKING_REMINDER_1H: { label: "1 hour reminder", color: "blue" },
  BOOKING_START: { label: "Starting", color: "purple" },
  BOOKING_END: { label: "Ending", color: "orange" },
  BOOKING_MISSED: { label: "Missed", color: "red" },
  BOOKING_COMPLETED: { label: "Completed", color: "green" },
  BOOKING_CANCELLED: { label: "Cancelled", color: "gray" },
};

const iconForType = (type) => {
  if (["QUEUE_SUCCESS", "BOOKING_COMPLETED"].includes(type)) return MdCheckCircle;
  if (["BOOKING_START", "BOOKING_END", "BOOKING_REMINDER_1H", "BOOKING_REMINDER_1D"].includes(type)) return MdSchedule;
  return MdInfo;
};

const formatTime = (value) => {
  const date = new Date(value);
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const NotificationCard = ({ notification, onOpenLink, onMarkRead }) => {
  const meta = typeMeta[notification.type] || { label: "Update", color: "gray" };
  const IconComp = iconForType(notification.type);

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      p={4}
      bg={notification.read ? "gray.50" : "white"}
      boxShadow="sm"
    >
      <Flex justify="space-between" align="flex-start" gap={4}>
        <HStack align="flex-start" spacing={3}>
          <Icon as={IconComp} boxSize={6} color={`${meta.color}.500`} />
          <VStack align="flex-start" spacing={1}>
            <HStack spacing={2}>
              <Badge colorScheme={meta.color} textTransform="none">{meta.label}</Badge>
              {!notification.read && <Badge colorScheme="purple">New</Badge>}
            </HStack>
            <Text fontWeight="semibold" color="#0a2342">
              {notification.message}
            </Text>
            <Text fontSize="sm" color="gray.500">
              {formatTime(notification.createdAt)}
            </Text>
          </VStack>
        </HStack>
        <VStack spacing={2} align="flex-end">
          {notification.link && (
            <Button size="md" variant="outline" colorScheme="orange" w="100px" onClick={onOpenLink}>
              Open
            </Button>
          )}
          {!notification.read && (
            <Button size="md" variant="outline" colorScheme="orange" w="100px" onClick={onMarkRead}>
              Mark read
            </Button>
          )}
        </VStack>
      </Flex>
    </Box>
  );
};

NotificationCard.propTypes = {
  notification: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    createdAt: PropTypes.string,
    read: PropTypes.bool,
    link: PropTypes.string,
  }).isRequired,
  onOpenLink: PropTypes.func,
  onMarkRead: PropTypes.func,
};

export default NotificationCard;
