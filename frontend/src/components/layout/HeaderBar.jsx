import { Box, Container, Text, useBreakpointValue } from "@chakra-ui/react";
import PropTypes from "prop-types";

const HeaderBar = ({ title }) => {
  const paddingY = useBreakpointValue({ base: 3, md: 4 });
  const fontSize = useBreakpointValue({ base: "lg", md: "xl" });

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
        <Text fontWeight="bold" fontSize={fontSize}>
          {title}
        </Text>
      </Container>
    </Box>
  );
};

HeaderBar.propTypes = {
  title: PropTypes.string,
};

export default HeaderBar;
