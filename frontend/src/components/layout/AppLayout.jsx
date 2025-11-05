import { Box, Flex } from "@chakra-ui/react";
import PropTypes from "prop-types";
import HeaderBar from "./HeaderBar";
import Navigation from "./Navigation";

const AppLayout = ({ children, showChrome = true, pageTitle = "", currentPath }) => {
  return (
    <Flex minH="100vh" bg="#f5f6fa">
      {showChrome && (
        <Navigation
          variant="desktop"
          currentPath={currentPath}
          display={{ base: "none", lg: "flex" }}
          w={{ lg: 64, xl: 72 }}
        />
      )}
      <Flex direction="column" flex="1" minH="100vh">
        {showChrome && <HeaderBar title={pageTitle} />}
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
    </Flex>
  );
};

AppLayout.propTypes = {
  children: PropTypes.node.isRequired,
  showChrome: PropTypes.bool,
  pageTitle: PropTypes.string,
  currentPath: PropTypes.string.isRequired,
};

export default AppLayout;
