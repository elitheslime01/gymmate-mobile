import { Box, Container, Text, useBreakpointValue, IconButton, HStack } from "@chakra-ui/react";
import { HamburgerIcon, CloseIcon } from "@chakra-ui/icons";
import PropTypes from "prop-types";

const HeaderBar = ({ title, onToggleNav, isNavVisible }) => {
  const paddingY = useBreakpointValue({ base: 3, md: 4 });
  const fontSize = useBreakpointValue({ base: "lg", md: "xl" });
  const showToggleButton = useBreakpointValue({ base: false, lg: true });

  if (!title) {
    return null;
  }

  return (
    <Box
      as="header"
      bg="#0a2342"
      color="white"
      boxShadow="sm"
      position="sticky"
      top={0}
      zIndex={20}
    >
      <Container maxW="container.xl" px={{ base: 4, md: 6, lg: 8 }} py={paddingY}>
        <HStack justify="flex-start" align="center" spacing={4}>
          {showToggleButton && (
            <IconButton
              aria-label={isNavVisible ? "Hide navigation" : "Show navigation"}
              icon={isNavVisible ? <CloseIcon /> : <HamburgerIcon />}
              onClick={onToggleNav}
              variant="ghost"
              color="white"
              _hover={{ bg: "whiteAlpha.200" }}
              size="md"
            />
          )}
          <Text fontWeight="bold" fontSize={fontSize}>
            {title}
          </Text>
        </HStack>
      </Container>
    </Box>
  );
};

HeaderBar.propTypes = {
  title: PropTypes.string,
  onToggleNav: PropTypes.func,
  isNavVisible: PropTypes.bool,
};

export default HeaderBar;
