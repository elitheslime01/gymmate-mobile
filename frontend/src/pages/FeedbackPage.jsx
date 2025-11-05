import { useRef, useState } from "react";
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
  useDisclosure,
  useToast,
} from "@chakra-ui/react";

const FEEDBACK_CATEGORIES = [
  "General Inquiry",
  "Bug Report",
  "Feature Request",
  "Account Assistance",
  "Other",
];

const FeedbackPage = () => {
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef(null);

  const resetForm = () => {
    setCategory("");
    setTitle("");
    setMessage("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onOpen();
  };

  const handleConfirmSubmit = () => {
    onClose();
    toast({
      title: "Feedback submitted",
      description: "Thank you for sharing your feedback with us!",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    resetForm();
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
                onChange={(event) => setCategory(event.target.value)}
                bg="gray.50"
              >
                {FEEDBACK_CATEGORIES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel color="#0a2342">Title</FormLabel>
              <Input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Provide a concise summary"
                bg="gray.50"
              />
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

            <Button
              type="submit"
              bg="#FE7654"
              color="white"
              _hover={{ bg: "#e65c3b" }}
              _active={{ bg: "#cc4a2d" }}
              alignSelf="flex-start"
              isDisabled={!category || !title.trim() || !message.trim()}
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
              <Button ref={cancelRef} onClick={onClose} variant="outline">
                Cancel
              </Button>
              <Button
                bg="#FE7654"
                color="white"
                _hover={{ bg: "#e65c3b" }}
                _active={{ bg: "#cc4a2d" }}
                onClick={handleConfirmSubmit}
                ml={3}
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
