import {
  Box,
  Button,
  Flex,
  Heading,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Select,
  Spinner,
  Stack,
  Text,
  useToast,
  VStack,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import { MdEmail } from "react-icons/md";
import { RiLockPasswordFill } from "react-icons/ri";
import { FaEye, FaEyeSlash, FaUser, FaGraduationCap, FaIdCard } from "react-icons/fa";
import { useEffect, useState } from "react";
import { useStudentStore } from "../store/student";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    sex: "Male",
    college: "",
    course: "",
    year: "1st",
    section: "",
    email: "",
    studentId: "",
    password: "",
    confirmPassword: "",
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  
  const { createStudent, verifyStudentCode, resendVerificationCode, isLoading, verificationLoading, resendLoading } = useStudentStore();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isVerifying || resendTimer <= 0) return;
    const timer = setInterval(() => {
      setResendTimer((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isVerifying, resendTimer]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.college.trim()) newErrors.college = "College is required";
    if (!formData.course.trim()) newErrors.course = "Course is required";
    if (!formData.section.trim()) newErrors.section = "Section is required";
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!formData.email.includes("@umak.edu.ph")) {
      newErrors.email = "Please use your UMak email (@umak.edu.ph)";
    }
    
    if (!formData.studentId.trim()) {
      newErrors.studentId = "Student ID is required";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields correctly.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const studentData = {
      _fName: formData.firstName,
      _lName: formData.lastName,
      _sex: formData.sex,
      _college: formData.college,
      _course: formData.course,
      _year: formData.year,
      _section: formData.section,
      _umakEmail: formData.email,
      _umakID: formData.studentId,
      _password: formData.password,
      _lastLogin: new Date(),
      _activeStat: false,
    };

    const result = await createStudent(studentData);

    if (result.success) {
      setVerificationEmail(formData.email);
      setIsVerifying(true);
      setVerificationCode("");
      setResendTimer(60);
      toast({
        title: "Verify your email",
        description: "We sent a 6-digit code to your email. Enter it below to finish creating your account.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } else {
      toast({
        title: "Registration Failed",
        description: result.error || "Unable to create account. Please try again.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: "Invalid code",
        description: "Please enter the 6-digit verification code sent to your email.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const result = await verifyStudentCode(verificationEmail, verificationCode);

    if (result.success) {
      toast({
        title: "Email verified",
        description: "Your account is now active. You can log in.",
        status: "success",
        duration: 4000,
        isClosable: true,
      });
      navigate("/");
    } else {
      toast({
        title: "Verification failed",
        description: result.error || "The code is incorrect or expired.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const handleResendCode = async () => {
    if (!verificationEmail) return;

    const result = await resendVerificationCode(verificationEmail);

    if (result.success) {
      setResendTimer(60);
      toast({
        title: "Code resent",
        description: "Check your email for a new verification code.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: "Unable to resend",
        description: result.error || "Please try again later.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  return (
    <Flex flex="1" align="center" justify="center" py={{ base: 6, md: 8 }}>
      <Box
        w="full"
        maxW={{ base: "full", md: "2xl" }}
        bg="white"
        borderRadius="2xl"
        boxShadow="xl"
        p={{ base: 6, md: 8 }}
      >
        <VStack spacing={{ base: 6, md: 8 }} align="stretch">
          <Stack spacing={3} align="center" textAlign="center">
            <Image
              src="/gymmate_logo.png"
              alt="GymMate Logo"
              maxW={{ base: "150px", md: "180px" }}
              objectFit="contain"
            />
            <Heading size="lg" color="#071434">
              Create Account
            </Heading>
            <Text fontSize="sm" color="gray.500">
              Register to start booking your gym sessions
            </Text>
          </Stack>

          {!isVerifying && (
            <>
              <Stack spacing={4}>
                {/* Name Fields */}
                <Stack direction={{ base: "column", md: "row" }} spacing={4}>
                  <FormControl isRequired isInvalid={errors.firstName}>
                    <FormLabel color="#071434" fontWeight="semibold">
                      First Name
                    </FormLabel>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none" color="gray.400">
                        <FaUser />
                      </InputLeftElement>
                      <Input
                        name="firstName"
                        placeholder="Juan"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        bg="white"
                      />
                    </InputGroup>
                    {errors.firstName && (
                      <Text fontSize="xs" color="red.500" mt={1}>
                        {errors.firstName}
                      </Text>
                    )}
                  </FormControl>

                  <FormControl isRequired isInvalid={errors.lastName}>
                    <FormLabel color="#071434" fontWeight="semibold">
                      Last Name
                    </FormLabel>
                    <Input
                      name="lastName"
                      placeholder="Dela Cruz"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      bg="white"
                    />
                    {errors.lastName && (
                      <Text fontSize="xs" color="red.500" mt={1}>
                        {errors.lastName}
                      </Text>
                    )}
                  </FormControl>
                </Stack>

                {/* Sex */}
                <FormControl isRequired>
                  <FormLabel color="#071434" fontWeight="semibold">
                    Sex
                  </FormLabel>
                  <Select
                    name="sex"
                    value={formData.sex}
                    onChange={handleInputChange}
                    bg="white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </Select>
                </FormControl>

                {/* College & Course */}
                <Stack direction={{ base: "column", md: "row" }} spacing={4}>
                  <FormControl isRequired isInvalid={errors.college}>
                    <FormLabel color="#071434" fontWeight="semibold">
                      College
                    </FormLabel>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none" color="gray.400">
                        <FaGraduationCap />
                      </InputLeftElement>
                      <Input
                        name="college"
                        placeholder="CCIS"
                        value={formData.college}
                        onChange={handleInputChange}
                        bg="white"
                      />
                    </InputGroup>
                    {errors.college && (
                      <Text fontSize="xs" color="red.500" mt={1}>
                        {errors.college}
                      </Text>
                    )}
                  </FormControl>

                  <FormControl isRequired isInvalid={errors.course}>
                    <FormLabel color="#071434" fontWeight="semibold">
                      Course
                    </FormLabel>
                    <Input
                      name="course"
                      placeholder="Social Computing"
                      value={formData.course}
                      onChange={handleInputChange}
                      bg="white"
                    />
                    {errors.course && (
                      <Text fontSize="xs" color="red.500" mt={1}>
                        {errors.course}
                      </Text>
                    )}
                  </FormControl>
                </Stack>

                {/* Year & Section */}
                <Stack direction={{ base: "column", md: "row" }} spacing={4}>
                  <FormControl isRequired>
                    <FormLabel color="#071434" fontWeight="semibold">
                      Year
                    </FormLabel>
                    <Select
                      name="year"
                      value={formData.year}
                      onChange={handleInputChange}
                      bg="white"
                    >
                      <option value="1st">1st</option>
                      <option value="2nd">2nd</option>
                      <option value="3rd">3rd</option>
                      <option value="4th">4th</option>
                    </Select>
                  </FormControl>

                  <FormControl isRequired isInvalid={errors.section}>
                    <FormLabel color="#071434" fontWeight="semibold">
                      Section
                    </FormLabel>
                    <Input
                      name="section"
                      placeholder="ACSSC"
                      value={formData.section}
                      onChange={handleInputChange}
                      bg="white"
                    />
                    {errors.section && (
                      <Text fontSize="xs" color="red.500" mt={1}>
                        {errors.section}
                      </Text>
                    )}
                  </FormControl>
                </Stack>

                {/* Email */}
                <FormControl isRequired isInvalid={errors.email}>
                  <FormLabel color="#071434" fontWeight="semibold">
                    UMak Email Address
                  </FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none" color="gray.400">
                      <MdEmail />
                    </InputLeftElement>
                    <Input
                      name="email"
                      type="email"
                      placeholder="juan.delacruz@umak.edu.ph"
                      value={formData.email}
                      onChange={handleInputChange}
                      bg="white"
                    />
                  </InputGroup>
                  {errors.email && (
                    <Text fontSize="xs" color="red.500" mt={1}>
                      {errors.email}
                    </Text>
                  )}
                </FormControl>

                {/* Student ID */}
                <FormControl isRequired isInvalid={errors.studentId}>
                  <FormLabel color="#071434" fontWeight="semibold">
                    UMak Student ID
                  </FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none" color="gray.400">
                      <FaIdCard />
                    </InputLeftElement>
                    <Input
                      name="studentId"
                      placeholder="a12345678"
                      value={formData.studentId}
                      onChange={handleInputChange}
                      bg="white"
                    />
                  </InputGroup>
                  {errors.studentId && (
                    <Text fontSize="xs" color="red.500" mt={1}>
                      {errors.studentId}
                    </Text>
                  )}
                </FormControl>

                {/* Password */}
                <FormControl isRequired isInvalid={errors.password}>
                  <FormLabel color="#071434" fontWeight="semibold">
                    Password
                  </FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none" color="gray.400">
                      <RiLockPasswordFill />
                    </InputLeftElement>
                    <Input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleInputChange}
                      bg="white"
                    />
                    <InputRightElement>
                      <Box
                        as="button"
                        onClick={() => setShowPassword((v) => !v)}
                        color="gray.400"
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </Box>
                    </InputRightElement>
                  </InputGroup>
                  {errors.password && (
                    <Text fontSize="xs" color="red.500" mt={1}>
                      {errors.password}
                    </Text>
                  )}
                </FormControl>

                {/* Confirm Password */}
                <FormControl isRequired isInvalid={errors.confirmPassword}>
                  <FormLabel color="#071434" fontWeight="semibold">
                    Confirm Password
                  </FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none" color="gray.400">
                      <RiLockPasswordFill />
                    </InputLeftElement>
                    <Input
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      bg="white"
                    />
                    <InputRightElement>
                      <Box
                        as="button"
                        onClick={() => setShowConfirmPassword((v) => !v)}
                        color="gray.400"
                      >
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </Box>
                    </InputRightElement>
                  </InputGroup>
                  {errors.confirmPassword && (
                    <Text fontSize="xs" color="red.500" mt={1}>
                      {errors.confirmPassword}
                    </Text>
                  )}
                </FormControl>
              </Stack>

              <Stack spacing={4}>
                <Button
                  w="full"
                  h={{ base: "60px", md: "50px" }}
                  bg="#FE7654"
                  color="white"
                  fontWeight="bold"
                  fontSize={{ base: "xl", md: "md" }}
                  borderRadius="xl"
                  boxShadow="md"
                  _hover={{ bg: "#e65c3b" }}
                  _active={{ bg: "#cc4a2d" }}
                  onClick={handleRegister}
                  isDisabled={isLoading || isVerifying}
                >
                  {isLoading ? <Spinner size="sm" color="white" /> : "Create Account"}
                </Button>

                <Text fontSize="sm" color="gray.600" textAlign="center">
                  Already have an account?{" "}
                  <Button
                    variant="link"
                    color="#FE7654"
                    fontWeight="bold"
                    px={1}
                    onClick={() => navigate("/")}
                  >
                    Log in
                  </Button>
                </Text>
              </Stack>
            </>
          )}

          {isVerifying && (
            <Box bg="gray.50" border="1px" borderColor="gray.200" borderRadius="xl" p={4} boxShadow="sm">
              <VStack align="stretch" spacing={3}>
                <Heading size="sm" color="#071434">Verify your email</Heading>
                <Text fontSize="sm" color="gray.600">
                  We sent a 6-digit code to <strong>{verificationEmail}</strong>. Enter it below to activate your account.
                </Text>
                <Input
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="Enter verification code"
                  bg="white"
                  letterSpacing="4px"
                  fontWeight="bold"
                  textAlign="center"
                />
                <Button
                  colorScheme="orange"
                  bg="#FE7654"
                  _hover={{ bg: "#e65c3b" }}
                  onClick={handleVerifyCode}
                  isLoading={verificationLoading}
                  isDisabled={verificationCode.length !== 6}
                >
                  Verify and activate
                </Button>
                <Button
                  variant="link"
                  color="#FE7654"
                  onClick={handleResendCode}
                  isDisabled={resendLoading || resendTimer > 0}
                  isLoading={resendLoading}
                  alignSelf="flex-start"
                >
                  {resendTimer > 0 ? `Resend code in ${resendTimer}s` : "Resend code"}
                </Button>
              </VStack>
            </Box>
          )}
        </VStack>
      </Box>
    </Flex>
  );
}
