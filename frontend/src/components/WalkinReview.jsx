import { useToast, Box, Button, Flex, Heading, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Stack, Text, VStack, useDisclosure } from "@chakra-ui/react";
import useWalkinStore from "../store/walkin";
import { useStudentStore } from "../store/student";

const WalkinReview = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();

    const {
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
        scheduleData,
        resetBookingInputs,
        arImage,
        uploadARImage
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
        if (!user?._id) {
            toast({
                title: "Login required",
                description: "Please sign in before confirming a booking.",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        if (!selectedTimeSlot?._id || !scheduleData?._id) {
            toast({
                title: "Incomplete selection",
                description: "Please choose a schedule and time slot before confirming.",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

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

        if (!arImage) {
            toast({
                title: "Error",
                description: "AR image is required.",
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

        const uploadResult = await uploadARImage(arImage, user._id);
        if (!uploadResult?.success) {
            toast({
                title: "Error",
                description: uploadResult?.message || "Failed to upload AR image.",
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
                setShowReview(false);
            }
            resetBookingInputs({ resetBooked: false });
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
        <Flex w="full" justify="center">
            <Box
                w="full"
                maxW="2xl"
                bg="white"
                borderRadius="2xl"
                boxShadow="xl"
                p={{ base: 5, md: 8 }}
            >
                <Stack spacing={{ base: 6, md: 8 }}>
                    <Heading as="h1" size="lg" textAlign="center">
                        Please review your booking details
                    </Heading>
                    <Stack spacing={{ base: 4, md: 6 }}>
                        <Stack direction={{ base: "column", md: "row" }} spacing={{ base: 4, md: 6 }}>
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
                    </Stack>
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
                            onClick={handleRevCancel}
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
                            onClick={handleRevProceed}
                        >
                            Confirm Slot
                        </Button>
                    </Stack>
                </Stack>

                <Modal isOpen={isOpen} onClose={onClose} isCentered>
                    <ModalOverlay />
                    <ModalContent maxW="sm" w="100%">
                        <ModalHeader>Are you sure your information is correct?</ModalHeader>
                        <ModalBody>
                            <Text as="ul" listStyleType="disc" ml={4} color="gray.600">
                                <li>If any of the information is incorrect, please go back and update it accordingly.</li>
                                <li>Once confirmed, AR Number cannot be used again.</li>
                            </Text>
                        </ModalBody>
                        <ModalFooter gap={4}>
                            <Button 
                                onClick={onClose} 
                                bg="white"
                                color="#FE7654"
                                border="2px"
                                borderColor="#FE7654"
                                _hover={{ bg: "#FE7654", color: "white" }}
                                _active={{ bg: "#cc4a2d", color: "white" }}
                                flex="1"
                                h={{ base: "50px", md: "40px" }}
                                fontSize={{ base: "lg", md: "md" }}
                                fontWeight="bold"
                                borderRadius="xl"
                            >Cancel
                            </Button>
                            <Button 
                                bg="#FE7654"
                                color="white"
                                _hover={{ bg: "#e65c3b" }}
                                _active={{ bg: "#cc4a2d" }} 
                                flex="1"
                                h={{ base: "50px", md: "40px" }}
                                fontSize={{ base: "lg", md: "md" }}
                                fontWeight="bold"
                                borderRadius="xl"
                                onClick={handleConfirm}
                            >Confirm
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </Box>
        </Flex>
    );
};

export default WalkinReview;