import { Box, Flex } from "@chakra-ui/react";
import PropTypes from "prop-types";
import { useState } from "react";
import HeaderBar from "./HeaderBar";
import Navigation from "./Navigation";

const AppLayout = ({ children, showChrome = true, pageTitle = "", currentPath }) => {
  const [isNavVisible, setIsNavVisible] = useState(true);

  const toggleNav = () => {
    setIsNavVisible(!isNavVisible);
  };

  return (
    <Box minH="100vh" bg="#f5f6fa" position="relative">
      {showChrome && (
        <Box
          as="nav"
          position="fixed"
          top={0}
          left={0}
          bottom={0}
          w={isNavVisible ? { lg: 64, xl: 72 } : { lg: 0, xl: 0 }}
          opacity={isNavVisible ? 1 : 0}
          overflow="hidden"
          transition="all 0.3s ease-in-out"
          display={{ base: "none", lg: "block" }}
          zIndex={10}
        >
          <Navigation
            variant="desktop"
            currentPath={currentPath}
            w={{ lg: 64, xl: 72 }}
            h="100vh"
          />
        </Box>
      )}
      <Flex direction="column" minH="100vh" ml={showChrome && isNavVisible ? { lg: 64, xl: 72 } : 0} transition="margin-left 0.3s ease-in-out">
        {showChrome && <HeaderBar title={pageTitle} onToggleNav={toggleNav} isNavVisible={isNavVisible} />}
        <Box
          as="main"
          flex="1"
          display="flex"
          flexDirection="column"
          px={showChrome ? { base: 4, md: 6, lg: 8 } : { base: 4, md: 8 }}
          py={showChrome ? { base: 6, md: 8 } : { base: 10, md: 12 }}
          pb={showChrome ? { base: 28, md: 20, lg: 12 } : { base: 10, md: 12 }}
          overflowX="hidden"
        >
          {children}
        </Box>
        {showChrome && (
          <Navigation
            variant="mobile"
            currentPath={currentPath}
            display={{ base: "flex", lg: "none" }}
            position="fixed"
            bottom={0}
            left={0}
            right={0}
            zIndex={15}
          />
        )}
      </Flex>
    </Box>
  );
};

AppLayout.propTypes = {
  children: PropTypes.node.isRequired,
  showChrome: PropTypes.bool,
  pageTitle: PropTypes.string,
  currentPath: PropTypes.string.isRequired,
};

export default AppLayout;
