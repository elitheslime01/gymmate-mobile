import { useState, useRef } from "react";
import {
  Avatar,
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Select,
  Stack,
  VStack,
  useToast,
  IconButton,
  HStack,
} from "@chakra-ui/react";
import { ArrowBackIcon, EditIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import { useStudentStore } from "../store/student";

const MyAccountPage = () => {
  const { user, updateStudent } = useStudentStore();
  const toast = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    _fName: user?._fName || "",
    _lName: user?._lName || "",
    _sex: user?._sex || "",
    _college: user?._college || "",
    _course: user?._course || "",
    _year: user?._year || "",
    _section: user?._section || "",
    _umakEmail: user?._umakEmail || "",
    _umakID: user?._umakID || "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });
    if (profileImage) {
      data.append("profileImage", profileImage);
    }

    const result = await updateStudent(user._id, data);
    if (result.success) {
      toast({
        title: "Profile updated",
        description: "Your account information has been updated successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setIsEditing(false);
      setProfileImage(null);
    } else {
      toast({
        title: "Update failed",
        description: result.error || "Failed to update your profile.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleCancel = () => {
    setFormData({
      _fName: user?._fName || "",
      _lName: user?._lName || "",
      _sex: user?._sex || "",
      _college: user?._college || "",
      _course: user?._course || "",
      _year: user?._year || "",
      _section: user?._section || "",
      _umakEmail: user?._umakEmail || "",
      _umakID: user?._umakID || "",
    });
    setIsEditing(false);
    setProfileImage(null);
    setImagePreview(null);
  };

  return (
    <Box as="section" maxW="4xl" mx="auto" w="full">
      <VStack spacing={6} align="stretch" bg="white" borderRadius="2xl" boxShadow="xl" p={{ base: 6, md: 10 }}>
        <HStack justify="space-between">
          <IconButton
            icon={<ArrowBackIcon />}
            onClick={() => navigate("/account")}
            variant="ghost"
            aria-label="Go back"
          />
          <Heading size="lg" color="#0a2342">
            My Account
          </Heading>
          {!isEditing && (
            <IconButton
              icon={<EditIcon />}
              onClick={() => setIsEditing(true)}
              colorScheme="orange"
              aria-label="Edit profile"
            />
          )}
        </HStack>

        <Stack spacing={6} align="center">
          <Box position="relative">
            <Avatar
              name={`${formData._fName} ${formData._lName}`}
              size="2xl"
              bg="#FE7654"
              color="white"
              src={imagePreview || (user?._profileImage ? `data:image/jpeg;base64,${user._profileImage}` : null)}
            />
            {isEditing && (
              <IconButton
                icon={<EditIcon />}
                onClick={() => fileInputRef.current?.click()}
                position="absolute"
                bottom={0}
                right={0}
                colorScheme="orange"
                borderRadius="full"
                size="sm"
                aria-label="Change profile picture"
              />
            )}
          </Box>
          <Input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageChange}
            display="none"
          />
        </Stack>

        <form onSubmit={handleSubmit}>
          <VStack spacing={4} align="stretch">
            <Stack direction={{ base: "column", md: "row" }} spacing={4}>
              <FormControl isRequired>
                <FormLabel>First Name</FormLabel>
                <Input
                  name="_fName"
                  value={formData._fName}
                  onChange={handleInputChange}
                  isReadOnly={!isEditing}
                  bg={isEditing ? "white" : "gray.50"}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Last Name</FormLabel>
                <Input
                  name="_lName"
                  value={formData._lName}
                  onChange={handleInputChange}
                  isReadOnly={!isEditing}
                  bg={isEditing ? "white" : "gray.50"}
                />
              </FormControl>
            </Stack>

            <Stack direction={{ base: "column", md: "row" }} spacing={4}>
              <FormControl isRequired>
                <FormLabel>Student ID</FormLabel>
                <Input
                  name="_umakID"
                  value={formData._umakID}
                  isReadOnly
                  bg="gray.50"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  name="_umakEmail"
                  type="email"
                  value={formData._umakEmail}
                  onChange={handleInputChange}
                  isReadOnly={!isEditing}
                  bg={isEditing ? "white" : "gray.50"}
                />
              </FormControl>
            </Stack>

            <FormControl isRequired>
              <FormLabel>Sex</FormLabel>
              <Select
                name="_sex"
                value={formData._sex}
                onChange={handleInputChange}
                isDisabled={!isEditing}
                bg={isEditing ? "white" : "gray.50"}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>College</FormLabel>
              <Input
                name="_college"
                value={formData._college}
                onChange={handleInputChange}
                isReadOnly={!isEditing}
                bg={isEditing ? "white" : "gray.50"}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Course</FormLabel>
              <Input
                name="_course"
                value={formData._course}
                onChange={handleInputChange}
                isReadOnly={!isEditing}
                bg={isEditing ? "white" : "gray.50"}
              />
            </FormControl>

            <Stack direction={{ base: "column", md: "row" }} spacing={4}>
              <FormControl isRequired>
                <FormLabel>Year</FormLabel>
                <Select
                  name="_year"
                  value={formData._year}
                  onChange={handleInputChange}
                  isDisabled={!isEditing}
                  bg={isEditing ? "white" : "gray.50"}
                >
                  <option value="1st">1st</option>
                  <option value="2nd">2nd</option>
                  <option value="3rd">3rd</option>
                  <option value="4th">4th</option>
                </Select>
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Section</FormLabel>
                <Input
                  name="_section"
                  value={formData._section}
                  onChange={handleInputChange}
                  isReadOnly={!isEditing}
                  bg={isEditing ? "white" : "gray.50"}
                />
              </FormControl>
            </Stack>

            {isEditing && (
              <Stack direction="row" spacing={4} pt={4}>
                <Button
                  type="button"
                  onClick={handleCancel}
                  bg="white"
                  border="2px"
                  borderColor="#FE7654"
                  color="#FE7654"
                  _hover={{ bg: "#FE7654", color: "white" }}
                  _active={{ bg: "#cc4a2d", color: "white" }}
                  flex="1"
                  h="60px"
                  fontSize={{ base: "xl", md: "lg" }}
                  fontWeight="bold"
                  borderRadius="xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  bg="#FE7654"
                  color="white"
                  _hover={{ bg: "#e65c3b" }}
                  _active={{ bg: "#cc4a2d" }}
                  flex="1"
                  h="60px"
                  fontSize={{ base: "xl", md: "lg" }}
                  fontWeight="bold"
                  borderRadius="xl"
                >
                  Save Changes
                </Button>
              </Stack>
            )}
          </VStack>
        </form>
      </VStack>
    </Box>
  );
};

export default MyAccountPage;
