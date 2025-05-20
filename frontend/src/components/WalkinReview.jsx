import { useToast, Box, Button, Flex, Heading, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, useDisclosure, VStack, Stack } from "@chakra-ui/react";
import useWalkinStore from "../store/walkin";
import { useStudentStore } from "../store/student";

const WalkinReview = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();

    const {
        isBooked,
        setShowARInput,
        showReview,
        setShowReview,
        setIsRegistered,
        setIsBooked,
        formattedDate,
        selectedTimeSlot,
        arCode,
        showRegister,
        addARCode,
        addToQueue,
        scheduleData
    } = useWalkinStore();

    const { user, isLoggedIn } = useStudentStore();
    const toast = useToast();

    const handleRevCancel = () => {
        setShowARInput(true);
        setShowReview(false);
    }

    const handleRevProceed = () => {
        onOpen();
    }

    const handleConfirm = async () => {
        if (!arCode || arCode.trim() === "") {
            toast({
                title: "Error",
                description: "AR code is required.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }
    
        const arResult = await addARCode(arCode, user._id);
        if (!arResult.success) {
            toast({
                title: "Error",
                description: arResult.message,
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }
    
        const arId = arResult.arId;
        if (!arId) {
            toast({
                title: "Error",
                description: "Failed to retrieve AR ID.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        const result = await addToQueue(
            user._id, 
            formattedDate, 
            {
                startTime: selectedTimeSlot._startTime,
                endTime: selectedTimeSlot._endTime,
            },
            scheduleData._id,
            selectedTimeSlot._id, 
            arId
        );
    
        if (result.success) {
            if (showRegister) setIsRegistered(true);
            else if (showReview) {
                setIsBooked(true);
                setShowReview(false); // <-- Add this line
            }
            onClose();
        } else {
            toast({
                title: "Error",
                description: result.message,
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    return (
        <Flex
            minH="calc(100vh - 128px)" // Adjust for header and footer height
            align="center"
            justify="center"
            w="100%"
            bg="transparent"
        >
            <Box p={4} w="100%" maxW="sm" mx="auto" >
                <Heading as="h1" size="md" mb={8} textAlign="center">
                    Please review your booking details
                </Heading>
                <VStack spacing={6} align="stretch" mb={8}>
                    <Stack direction={{ base: "column", md: "row" }} spacing={4}>
                        <VStack align="start" spacing={2} flex="1">
                            <Text fontWeight="semibold">Full Name: {isLoggedIn ? `${user._fName} ${user._lName}` : 'N/A'}</Text>
                            <Text fontWeight="semibold">Student ID: {isLoggedIn ? user._umakID : 'N/A'}</Text>
                            <Text fontWeight="semibold">UMak Email Address: {isLoggedIn ? user._umakEmail : 'N/A'}</Text>
                        </VStack>
                        <VStack align="start" spacing={2} flex="1">
                            <Text fontWeight="semibold">Selected Date: {formattedDate}</Text>
                            <Text fontWeight="semibold">Selected Time Slot: {selectedTimeSlot ? `${selectedTimeSlot._startTime} - ${selectedTimeSlot._endTime}` : 'N/A'}</Text>
                            <Text fontWeight="semibold">AR Number: {arCode}</Text>
                        </VStack>
                    </Stack>
                </VStack>
                <Flex  w="100%" mt={8} gap={4} justify="center">
                    <Button
                        bgColor="white"
                        color="#FE7654"
                        border="2px"
                        borderColor="#FE7654"
                        _hover={{ bg: '#FE7654', color: 'white' }}
                        _active={{ bg: '#cc4a2d' }}
                        w="100%"
                        onClick={handleRevCancel}
                    >
                        Cancel
                    </Button>
                    <Button
                        bgColor='#FE7654'
                        color='white'
                        _hover={{ bg: '#e65c3b' }}
                        _active={{ bg: '#cc4a2d' }}
                        w="100%"
                        onClick={handleRevProceed}
                    >
                        Confirm Slot
                    </Button>
                </Flex>

                <Modal isOpen={isOpen} onClose={onClose} isCentered>
                    <ModalOverlay />
                    <Flex justifyContent="center" alignItems="center" mt={8} gap={4}>
                        <ModalContent maxW="sm" w="100%">
                            <ModalHeader>Are you sure your information is correct?</ModalHeader>
                            <ModalBody>
                                <Text as="ul" listStyleType="disc" ml={4}>
                                    <li>If any of the information is incorrect, please go back and update it accordingly.</li>
                                    <li>Once confirmed, AR Number cannot be used again.</li>
                                </Text>
                            </ModalBody>
                            <ModalFooter gap={4} justifyContent="space-between">
                                <Button 
                                    onClick={onClose} 
                                    bgColor="white"
                                    color="#FE7654"
                                    border="2px"
                                    borderColor="#FE7654"
                                    _hover={{ bg: '#FE7654', color: 'white' }}
                                    _active={{ bg: '#cc4a2d' }}
                                     w="100%"
                                    >Cancel
                                </Button>
                                <Button 
                                    bgColor='#FE7654'
                                    color='white'
                                    _hover={{ bg: '#e65c3b' }}
                                    _active={{ bg: '#cc4a2d' }} 
                                     w="100%"
                                    onClick={handleConfirm}
                                    >Confirm
                                </Button>
                            </ModalFooter>
                        </ModalContent>
                    </Flex>
                </Modal>
            </Box>
        </Flex>
    );
};

export default WalkinReview;