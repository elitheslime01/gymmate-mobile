import { useToast, Box, Button, Divider, Flex, Heading, HStack, PinInput, PinInputField, VStack, Text } from "@chakra-ui/react";
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
        <Flex
            minH="calc(100vh - 128px)" // Adjust for header and footer height
            align="center"
            justify="center"
            w="100%"
            bg="transparent"
        >
            <Box p={4} w="100%" maxW="sm" mx="auto">
                <Heading as="h1" size="md" textAlign="center" mb={6}>
                    Input Acknowledgement Receipt Number
                </Heading>
                <VStack w="100%" spacing={8} align="center" mb={6}>
                    <HStack spacing={2} justify="center" w="100%">
                        <PinInput size="lg" onChange={setArCode} value={arCode}>
                            <PinInputField borderWidth="0" bg="white" boxShadow="lg" />
                            <PinInputField borderWidth="0" bg="white" boxShadow="lg" />
                            <PinInputField borderWidth="0" bg="white" boxShadow="lg" />
                            <PinInputField borderWidth="0" bg="white" boxShadow="lg" />
                            <PinInputField borderWidth="0" bg="white" boxShadow="lg" />
                            <PinInputField borderWidth="0" bg="white" boxShadow="lg" />
                        </PinInput>
                    </HStack>
                    <Divider orientation="horizontal" borderColor="gray.300" />
                    <Button
                        as="label"
                        htmlFor="file-input"
                        bg="white"
                        boxShadow="lg"
                        px={4}
                        py={4}
                        rounded="md"
                        w="100%"
                        fontWeight="bold"
                        leftIcon={<FaUpload />}
                        justifyContent="center"
                    >
                        Upload Acknowledgement Receipt
                        <input
                            id="file-input"
                            type="file"
                            accept=".jpg, .jpeg, .png"
                            onChange={handleImageChange}
                            style={{ display: "none" }}
                        />
                        {arImage && (
                            <Text fontSize="sm" color="gray.500" ml={2} noOfLines={1}>
                                {arImage.name.length > 18
                                    ? arImage.name.slice(0, 10) + '...' + arImage.name.slice(arImage.name.lastIndexOf('.'))
                                    : arImage.name}
                            </Text>
                        )}
                    </Button>
                </VStack>
                <Flex w="100%" mt={8} gap={4} justify="center">
                    <Button
                        bgColor="white"
                        color="#FE7654"
                        border="2px"
                        borderColor="#FE7654"
                        _hover={{ bg: '#FE7654', color: 'white' }}
                        _active={{ bg: '#cc4a2d' }}
                        w="50%"
                        onClick={handleARCancel}
                    >
                        Cancel
                    </Button>
                    <Button
                        bgColor="#FE7654"
                        color="white"
                        _hover={{ bg: '#e65c3b' }}
                        _active={{ bg: '#cc4a2d' }}
                        w="50%"
                        onClick={handleARProceed}
                    >
                        Proceed
                    </Button>
                </Flex>
            </Box>
        </Flex>
    );
};

export default WalkinARInput;