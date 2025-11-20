import { useToast, Box, Button, Divider, Flex, Heading, HStack, PinInput, PinInputField, Stack, Text, VStack } from "@chakra-ui/react";
import { FaUpload } from "react-icons/fa";
import useWalkinStore from "../store/walkin";

const WalkinARInput = () => {
    const { setShowBooking, setShowARInput, setShowReview, arCode, setArCode, checkARCode, setARImage, arImage } = useWalkinStore();
    const toast = useToast();

    const handleARCancel = () => {
        setShowARInput(false);
        setShowBooking(true);
    };

    const handleARProceed = async () => {
        if (!arCode || !arImage) {
            toast({
                title: "Error",
                description: "Please enter AR code and upload image",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }
        try {
            const result = await checkARCode(arCode);
            if (result.success) {
                setShowARInput(false);
                setShowReview(true);
            } else {
                toast({
                    title: "Error",
                    description: result.message,
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (!file.type.match("image.*")) {
            toast({
                title: "Invalid File",
                description: "Only images are allowed",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }
        setARImage(file);
    };

    return (
        <Flex w="full" justify="center">
            <Box
                w="full"
                maxW="md"
                bg="white"
                borderRadius="2xl"
                boxShadow="xl"
                p={{ base: 5, md: 7 }}
            >
                <Stack spacing={{ base: 6, md: 8 }}>
                    <Heading as="h1" size="lg" textAlign="center">
                        Input Acknowledgement Receipt Number
                    </Heading>
                    <VStack w="100%" spacing={6} align="center">
                        <HStack spacing={2} justify="center" w="100%">
                            <PinInput size="lg" onChange={setArCode} value={arCode}>
                                <PinInputField borderWidth="0" bg="white" boxShadow="md" />
                                <PinInputField borderWidth="0" bg="white" boxShadow="md" />
                                <PinInputField borderWidth="0" bg="white" boxShadow="md" />
                                <PinInputField borderWidth="0" bg="white" boxShadow="md" />
                                <PinInputField borderWidth="0" bg="white" boxShadow="md" />
                                <PinInputField borderWidth="0" bg="white" boxShadow="md" />
                            </PinInput>
                        </HStack>
                        <Divider orientation="horizontal" borderColor="gray.200" />
                        <Button
                            as="label"
                            htmlFor="file-input"
                            bg="gray.50"
                            border="1px solid"
                            borderColor="gray.200"
                            px={4}
                            py={4}
                            rounded="lg"
                            w="100%"
                            fontWeight="semibold"
                            leftIcon={<FaUpload />}
                            justifyContent="center"
                            _hover={{ bg: "gray.100" }}
                            _active={{ bg: "gray.200" }}
                        >
                            Upload Acknowledgement Receipt
                            <input
                                id="file-input"
                                type="file"
                                accept=".jpg, .jpeg, .png"
                                onChange={handleImageChange}
                                style={{ display: "none" }}
                            />
                        </Button>
                        {arImage && (
                            <Text fontSize="sm" color="gray.500" noOfLines={1}>
                                {arImage.name.length > 24
                                    ? `${arImage.name.slice(0, 12)}...${arImage.name.slice(arImage.name.lastIndexOf('.'))}`
                                    : arImage.name}
                            </Text>
                        )}
                    </VStack>
                    <Stack direction="row" spacing={4}>
                        <Button
                            bg="white"
                            color="#FE7654"
                            border="2px"
                            borderColor="#FE7654"
                            _hover={{ bg: "#FE7654", color: "white" }}
                            _active={{ bg: "#cc4a2d", color: "white" }}
                            flex="1"
                            h="60px"
                            fontSize={{ base: "xl", md: "lg" }}
                            fontWeight="bold"
                            borderRadius="xl"
                            onClick={handleARCancel}
                        >
                            Cancel
                        </Button>
                        <Button
                            bg="#FE7654"
                            color="white"
                            _hover={{ bg: "#e65c3b" }}
                            _active={{ bg: "#cc4a2d" }}
                            flex="1"
                            h="60px"
                            fontSize={{ base: "xl", md: "lg" }}
                            fontWeight="bold"
                            borderRadius="xl"
                            onClick={handleARProceed}
                        >
                            Proceed
                        </Button>
                    </Stack>
                </Stack>
            </Box>
        </Flex>
    );
};

export default WalkinARInput;