import { useToast, Box, Button, Flex, Heading, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Stack, Text, VStack, useDisclosure, Divider, HStack, Badge, Image } from "@chakra-ui/react";
import { AddIcon, MinusIcon, RepeatIcon } from "@chakra-ui/icons";
import PropTypes from "prop-types";
import { useEffect, useMemo, useState } from "react";
import useWalkinStore from "../store/walkin";
import { useStudentStore } from "../store/student";

const DetailRow = ({ label, value, accent }) => (
    <HStack justify="space-between" w="full" py={2}>
        <Text color="gray.600" fontSize="sm" textTransform="uppercase" letterSpacing="0.08em">{label}</Text>
        <Text fontWeight="semibold" color={accent ? "#FE7654" : "#071434"}>{value || "N/A"}</Text>
    </HStack>
);

DetailRow.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
    accent: PropTypes.bool,
};

const WalkinReview = () => {
    const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onClose: onConfirmClose } = useDisclosure();
    const { isOpen: isImageOpen, onOpen: onImageOpen, onClose: onImageClose } = useDisclosure();
    const [zoomLevel, setZoomLevel] = useState(1);

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

    const arImageUrl = useMemo(() => {
        if (!arImage) return null;

        // If backend returned a URL-ish string, use it directly
        if (typeof arImage === "string") return arImage;

        // If backend returned an object, try common url fields
        if (typeof arImage === "object" && !(arImage instanceof File) && !(arImage instanceof Blob)) {
            const possible = arImage.url || arImage._arImage || arImage.secure_url || arImage.path;
            if (possible) return possible;
        }

        // Fallback for File/Blob during same-session upload
        try {
            return URL.createObjectURL(arImage);
        } catch (e) {
            console.error("Failed to create preview URL for AR image", e);
            return null;
        }
    }, [arImage]);

    const arImageFormat = useMemo(() => {
        if (!arImage) return "image";
        if (arImage instanceof File || arImage instanceof Blob) return arImage.type || "image";
        if (typeof arImage === "object" && arImage?.mimeType) return arImage.mimeType;
        return "image";
    }, [arImage]);

    useEffect(() => {
        if (isImageOpen) {
            setZoomLevel(1);
        }
    }, [isImageOpen]);

    const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 0.25, 3));
    const handleZoomOut = () => setZoomLevel((z) => Math.max(z - 0.25, 0.5));
    const handleZoomReset = () => setZoomLevel(1);

    useEffect(() => {
        return () => {
            if (arImageUrl && typeof arImage !== "string") {
                URL.revokeObjectURL(arImageUrl);
            }
        };
    }, [arImageUrl, arImage]);

    const handleRevCancel = () => {
        setShowARInput(true);
        setShowReview(false);
    }

    const handleRevProceed = () => {
        onConfirmOpen();
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
            onConfirmClose();
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

    const handleViewImage = () => {
        if (!arImageUrl) {
            toast({
                title: "No image available",
                description: "Please upload an AR image first.",
                status: "info",
                duration: 3000,
                isClosable: true,
            });
            return;
        }
        onImageOpen();
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
                border="1px solid"
                borderColor="gray.100"
            >
                <Stack spacing={{ base: 6, md: 8 }}>
                    <VStack spacing={1}>
                        <Heading as="h1" size="lg" textAlign="center" color="#071434">
                            Booking Review
                        </Heading>
                        <Text color="gray.600" fontSize="sm">Please confirm all details before joining the queue.</Text>
                    </VStack>

                    <Box border="1px dashed" borderColor="gray.200" borderRadius="xl" p={{ base: 4, md: 5 }} bg="gray.50">
                        <VStack align="stretch" spacing={3}>
                            <HStack justify="space-between">
                                <Badge colorScheme="orange" borderRadius="md" px={3} py={1}>Walk-in Queue</Badge>
                                <Text fontSize="sm" color="gray.500">AR Code</Text>
                            </HStack>
                            <Text fontSize="2xl" fontWeight="bold" color="#071434" letterSpacing="0.08em">
                                {arCode || "—"}
                            </Text>
                            <Button
                                size="sm"
                                variant="outline"
                                colorScheme="orange"
                                alignSelf="flex-start"
                                onClick={handleViewImage}
                            >
                                View AR Image
                            </Button>
                            <Divider />
                            <Text fontWeight="semibold" color="#071434">Reservation Details</Text>
                            <DetailRow label="Date" value={formattedDate} />
                            <DetailRow label="Time" value={selectedTimeSlot ? `${selectedTimeSlot._startTime} - ${selectedTimeSlot._endTime}` : "N/A"} />
                            <DetailRow label="Schedule ID" value={scheduleData?._id} />
                            <Divider />
                            <Text fontWeight="semibold" color="#071434">Student Information</Text>
                            <DetailRow label="Name" value={isLoggedIn ? `${user._fName} ${user._lName}` : "N/A"} />
                            <DetailRow label="Student ID" value={isLoggedIn ? user._umakID : "N/A"} />
                            <DetailRow label="UMak Email" value={isLoggedIn ? user._umakEmail : "N/A"} />
                        </VStack>
                    </Box>

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
                            Confirm
                        </Button>
                    </Stack>
                </Stack>

                <Modal isOpen={isConfirmOpen} onClose={onConfirmClose} isCentered>
                    <ModalOverlay />
                    <ModalContent maxW="sm" w="100%">
                        <ModalHeader>Confirm your details</ModalHeader>
                        <ModalBody>
                            <Text as="ul" listStyleType="disc" ml={4} color="gray.600">
                                <li>Ensure your AR number, schedule, and student details are accurate.</li>
                                <li>Once confirmed, this AR number cannot be reused.</li>
                            </Text>
                        </ModalBody>
                        <ModalFooter gap={4}>
                            <Button 
                                onClick={onConfirmClose} 
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

                <Modal isOpen={isImageOpen} onClose={onImageClose} isCentered size="6xl">
                    <ModalOverlay />
                    <ModalContent bg="#0f1220" color="white" borderRadius="lg" overflow="hidden">
                        <ModalHeader borderBottom="1px solid" borderColor="gray.700">
                            {user?._fName || user?._lName ? `${user?._fName ?? ""} ${user?._lName ?? ""}`.trim() + " - Acknowledgement Receipt" : "Acknowledgement Receipt"}
                        </ModalHeader>
                        <ModalBody p={4} display="flex" flexDirection="column" gap={4}>
                            <HStack spacing={3} justify="center">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    leftIcon={<MinusIcon />}
                                    onClick={handleZoomOut}
                                    isDisabled={zoomLevel <= 0.5}
                                    colorScheme="orange"
                                    borderColor="orange.400"
                                    color="orange.300"
                                    _hover={{ borderColor: "orange.300", color: "orange.200", bg: "rgba(254,118,84,0.08)" }}
                                    _disabled={{ borderColor: "gray.600", color: "gray.500", opacity: 0.6, cursor: "not-allowed" }}
                                >
                                    Zoom Out
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    leftIcon={<RepeatIcon />}
                                    onClick={handleZoomReset}
                                    colorScheme="orange"
                                    borderColor="orange.400"
                                    color="orange.300"
                                    _hover={{ borderColor: "orange.300", color: "orange.200", bg: "rgba(254,118,84,0.08)" }}
                                >
                                    Reset
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    leftIcon={<AddIcon />}
                                    onClick={handleZoomIn}
                                    isDisabled={zoomLevel >= 3}
                                    colorScheme="orange"
                                    borderColor="orange.400"
                                    color="orange.300"
                                    _hover={{ borderColor: "orange.300", color: "orange.200", bg: "rgba(254,118,84,0.08)" }}
                                    _disabled={{ borderColor: "gray.600", color: "gray.500", opacity: 0.6, cursor: "not-allowed" }}
                                >
                                    Zoom In
                                </Button>
                            </HStack>
                            <Box
                                bg="black"
                                borderRadius="md"
                                p={2}
                                minH="50vh"
                                maxH="75vh"
                                overflow="auto"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                            >
                                {arImageUrl ? (
                                    <Image
                                        src={arImageUrl}
                                        alt="Acknowledgement Receipt"
                                        maxH="75vh"
                                        objectFit="contain"
                                        transform={`scale(${zoomLevel})`}
                                        transformOrigin="center"
                                        transition="transform 0.2s ease"
                                    />
                                ) : (
                                    <Text color="gray.400">No image to display.</Text>
                                )}
                            </Box>
                            <Text fontSize="sm" color="gray.300" textAlign="center">
                                Format: {arImageFormat}
                            </Text>
                        </ModalBody>
                        <ModalFooter borderTop="1px solid" borderColor="gray.700">
                            <Button onClick={onImageClose} w="full" colorScheme="orange">
                                Close
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </Box>
        </Flex>
    );
};

export default WalkinReview;