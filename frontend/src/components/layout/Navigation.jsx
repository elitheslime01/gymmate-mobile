import { Flex, Text, Icon, Button, HStack, useBreakpointValue } from "@chakra-ui/react";
import PropTypes from "prop-types";
import { MdHome, MdCalendarToday, MdNotifications, MdPerson } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const NAV_ITEMS = [
  { label: "Home", path: "/home", icon: MdHome },
  { label: "Booking", path: "/booking", icon: MdCalendarToday },
  { label: "Notification", path: "/notification", icon: MdNotifications },
  { label: "Account", path: "/account", icon: MdPerson },
];

const NavigationButton = ({ item, isActive, onClick, variant }) => {
  const sharedProps = {
    onClick,
    "aria-current": isActive ? "page" : undefined,
    leftIcon: variant === "desktop" ? <Icon as={item.icon} boxSize={5} /> : undefined,
    justifyContent: variant === "desktop" ? "flex-start" : "center",
    fontWeight: isActive ? "semibold" : "medium",
    color: isActive ? "#0a2342" : "gray.600",
    bg: isActive ? "rgba(10, 35, 66, 0.12)" : "transparent",
    _hover: {
      bg: isActive ? "rgba(10, 35, 66, 0.16)" : "gray.100",
    },
    _active: {
      bg: "rgba(10, 35, 66, 0.2)",
    },
  };

  if (variant === "desktop") {
    return (
      <Button
        key={item.path}
        variant="ghost"
        w="100%"
        h={12}
        borderRadius="lg"
        px={4}
        {...sharedProps}
      >
        {item.label}
      </Button>
    );
  }

  return (
    <Button
      key={item.path}
      variant="ghost"
      flex="1"
      borderRadius="lg"
      py={3}
      display="flex"
      flexDirection="column"
      alignItems="center"
      gap={1}
      {...sharedProps}
    >
      <Icon as={item.icon} boxSize={6} />
      <Text fontSize="xs">{item.label}</Text>
    </Button>
  );
};

const Navigation = ({ variant, currentPath, ...flexProps }) => {
  const navigate = useNavigate();
  const spacing = useBreakpointValue({ base: 1, md: 2 });

  const isDesktop = variant === "desktop";

  return (
    <Flex
      as="nav"
      bg="white"
      borderTop={isDesktop ? "none" : "1px solid"}
      borderRight={isDesktop ? "1px solid" : "none"}
      borderColor="gray.200"
      boxShadow={isDesktop ? "md" : "0 -2px 8px rgba(15, 23, 42, 0.08)"}
      {...flexProps}
      direction={isDesktop ? "column" : "row"}
      align={isDesktop ? "stretch" : "center"}
      justify={isDesktop ? "space-between" : "space-around"}
      px={isDesktop ? 4 : 2}
      py={isDesktop ? 6 : 2}
      gap={isDesktop ? spacing : 0}
      minH={isDesktop ? "100vh" : undefined}
    >
      {isDesktop && (
        <Text fontWeight="bold" fontSize="lg" color="#0a2342" mb={6} px={2}>
          GymMate
        </Text>
      )}

      {NAV_ITEMS.map((item) => {
        const isActive = currentPath.startsWith(item.path);
        return (
          <NavigationButton
            key={item.path}
            item={item}
            isActive={isActive}
            variant={variant}
            onClick={() => navigate(item.path)}
          />
        );
      })}

      {isDesktop && <HStack h="40px" />}
    </Flex>
  );
};

NavigationButton.propTypes = {
  item: PropTypes.shape({
    label: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
    icon: PropTypes.elementType.isRequired,
  }).isRequired,
  isActive: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  variant: PropTypes.oneOf(["desktop", "mobile"]).isRequired,
};

Navigation.propTypes = {
  variant: PropTypes.oneOf(["desktop", "mobile"]).isRequired,
  currentPath: PropTypes.string.isRequired,
};

export default Navigation;
