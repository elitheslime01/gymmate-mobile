import { useMemo, useRef, useState } from "react";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Select,
  Textarea,
  Input,
  VStack,
  Wrap,
  WrapItem,
  Tag,
  TagLabel,
  TagCloseButton,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useStudentStore } from "../store/student";
import useFeedbackStore from "../store/feedback";

const FEEDBACK_CATEGORIES = [
  {
    label: "Walk-in Booking",
    subcategories: [
      "Cannot reserve a slot",
      "Scheduling conflict",
      "Booking confirmation issue",
      "Other booking concern",
    ],
  },
  {
    label: "Queue & Time In/Out",
    subcategories: [
      "Queue status incorrect",
      "Unable to time in",
      "Unable to time out",
      "Delayed updates",
      "Other queue concern",
    ],
  },
  {
    label: "Account & Login",
    subcategories: [
      "Login failed",
      "Password reset",
      "Profile information",
      "Logout issue",
      "Other account concern",
    ],
  },
  {
    label: "AR Image Upload",
    subcategories: [
      "Upload failed",
      "Unsupported file",
      "Image quality",
      "Other AR concern",
    ],
  },
  {
    label: "Mobile Experience",
    subcategories: [
      "Layout issue",
      "Performance",
      "Accessibility",
      "Other mobile concern",
    ],
  },
  {
    label: "Feature Suggestion",
    subcategories: [
      "New booking feature",
      "Queue improvements",
      "Analytics & reports",
      "Notifications",
      "Other suggestion",
    ],
  },
  {
    label: "Other",
    subcategories: [
      "General feedback",
      "Bug report",
      "Compliment",
      "Other topic",
    ],
  },
];

const FeedbackPage = () => {
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState([]);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef(null);
  const fileInputRef = useRef(null);
  const { user } = useStudentStore();
  const { submitFeedback, isSubmitting } = useFeedbackStore();

  const resetForm = () => {
    setCategory("");
    setSubcategory("");
    setMessage("");
    setAttachments([]);
  };

  const selectedCategory = useMemo(
    () => FEEDBACK_CATEGORIES.find((item) => item.label === category),
    [category]
  );

  const handleSubmit = (event) => {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }
    onOpen();
  };

  const handleAttachmentSelect = (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";

    if (!files.length) {
      return;
    }

    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    const combined = [...attachments, ...imageFiles];
    if (combined.length > 3) {
      toast({
        title: "Attachment limit reached",
        description: "You can attach up to 3 images only.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
    }

    setAttachments(combined.slice(0, 3));
  };

  const handleRemoveAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleConfirmSubmit = async () => {
    if (isSubmitting) {
      return;
    }

    const payload = {
      studentId: user?._id || null,
      category,
      subcategory,
      message,
      attachments,
    };

    const result = await submitFeedback(payload);

    if (result.success) {
      onClose();
      toast({
        title: "Feedback submitted",
        description: "Thank you for sharing your feedback with us!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      resetForm();
    } else {
      toast({
        title: "Submission failed",
        description: result.message || "We could not submit your feedback. Please try again.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  return (
    <Box as="section" maxW="2xl" mx="auto" w="full">
      <VStack
        align="stretch"
        spacing={6}
        bg="white"
        borderRadius="2xl"
        boxShadow="xl"
        p={{ base: 6, md: 8 }}
      >
        <Heading size="lg" color="#0a2342">
          Feedback
        </Heading>

        <Box as="form" onSubmit={handleSubmit}>
          <VStack spacing={5} align="stretch">
            <FormControl isRequired>
              <FormLabel color="#0a2342">Category</FormLabel>
              <Select
                placeholder="Select a category"
                value={category}
                onChange={(event) => {
                  setCategory(event.target.value);
                  setSubcategory("");
                }}
                bg="gray.50"
              >
                {FEEDBACK_CATEGORIES.map((option) => (
                  <option key={option.label} value={option.label}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel color="#0a2342">Subcategory</FormLabel>
              <Select
                placeholder={category ? "Select a subcategory" : "Select a category first"}
                value={subcategory}
                onChange={(event) => setSubcategory(event.target.value)}
                bg="gray.50"
                isDisabled={!selectedCategory}
              >
                {(selectedCategory?.subcategories || []).map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel color="#0a2342">Message</FormLabel>
              <Textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Share the details of your experience or suggestion"
                rows={6}
                bg="gray.50"
              />
            </FormControl>

            <FormControl>
              <FormLabel color="#0a2342">Attachments (optional, up to 3 images)</FormLabel>
              <Input
                type="file"
                accept="image/*"
                multiple
                ref={fileInputRef}
                display="none"
                onChange={handleAttachmentSelect}
              />
              <Button
                bg="white"
                border="2px"
                borderColor="#FE7654"
                color="#FE7654"
                _hover={{ bg: "#FE7654", color: "white" }}
                _active={{ bg: "#cc4a2d", color: "white" }}
                onClick={() => fileInputRef.current?.click()}
                isDisabled={attachments.length >= 3 || isSubmitting}
                alignSelf="flex-start"
                h={{ base: "50px", md: "40px" }}
                fontSize={{ base: "lg", md: "md" }}
                fontWeight="bold"
                borderRadius="xl"
              >
                Attach Images
              </Button>
              {attachments.length > 0 && (
                <Wrap mt={3} spacing={2}>
                  {attachments.map((file, index) => (
                    <WrapItem key={`${file.name}-${index}`}>
                      <Tag
                        size="md"
                        borderRadius="full"
                        colorScheme="orange"
                        display="flex"
                        alignItems="center"
                      >
                        <TagLabel maxW="200px" isTruncated title={file.name}>
                          {file.name}
                        </TagLabel>
                        <TagCloseButton onClick={() => handleRemoveAttachment(index)} />
                      </Tag>
                    </WrapItem>
                  ))}
                </Wrap>
              )}
            </FormControl>

            <Button
              type="submit"
              bg="#FE7654"
              color="white"
              _hover={{ bg: "#e65c3b" }}
              _active={{ bg: "#cc4a2d" }}
              alignSelf="flex-start"
              isDisabled={!category || !subcategory || !message.trim() || isSubmitting}
              isLoading={isSubmitting}
              h={{ base: "60px", md: "50px" }}
              fontSize={{ base: "xl", md: "lg" }}
              fontWeight="bold"
              borderRadius="xl"
              px={8}
            >
              Submit Feedback
            </Button>
          </VStack>
        </Box>
      </VStack>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Confirm Submission
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to submit this feedback?
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button 
                ref={cancelRef} 
                onClick={onClose} 
                bg="white"
                border="2px"
                borderColor="#FE7654"
                color="#FE7654"
                _hover={{ bg: "#FE7654", color: "white" }}
                _active={{ bg: "#cc4a2d", color: "white" }}
                h={{ base: "50px", md: "40px" }}
                fontSize={{ base: "lg", md: "md" }}
                fontWeight="bold"
                borderRadius="xl"
              >
                Cancel
              </Button>
              <Button
                bg="#FE7654"
                color="white"
                _hover={{ bg: "#e65c3b" }}
                _active={{ bg: "#cc4a2d" }}
                onClick={handleConfirmSubmit}
                isLoading={isSubmitting}
                ml={3}
                h={{ base: "50px", md: "40px" }}
                fontSize={{ base: "lg", md: "md" }}
                fontWeight="bold"
                borderRadius="xl"
              >
                Submit
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default FeedbackPage;
