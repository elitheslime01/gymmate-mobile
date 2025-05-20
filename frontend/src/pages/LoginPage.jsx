import { Box, Button, Flex, Input, InputGroup, InputLeftElement, InputRightElement, Text, VStack, Image, Spinner, useToast } from "@chakra-ui/react";
import { MdEmail } from "react-icons/md";
import { RiLockPasswordFill } from "react-icons/ri";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useState } from "react";
import { useStudentStore } from "../store/student";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const loginStudent = useStudentStore(state => state.loginStudent);
  const isLoading = useStudentStore(state => state.isLoading);
  const toast = useToast();
  const navigate = useNavigate();
  

  const handleLogin = async () => {
    setLoginError('');
    const result = await loginStudent(email, password);
    if (!result.success) {
      setLoginError(result.message);
      toast({
        title: "Login Failed",
        description: result.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: "Login Successful",
        description: "Welcome to GymMate!",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      navigate("/home");
    }
  };

  return (
    <Flex minH="100vh" bg="#f5f6fa" direction="column" align="center" justify="flex-start">
      {/* Header */}
      <Box w="100vw" bg="#0a2342" py={4} mb={6} boxShadow="sm">
        <Text color="white" fontWeight="bold" fontSize="xl" textAlign="center">
          Login
        </Text>
      </Box>

      {/* Main Content */}
      <Flex flex="1" w="100%" align="center" justify="center">
        <VStack spacing={8} w="90%" maxW="350px" mx="auto" mt={2}>
          {/* Logo */}
          <Image
            src="/gymmate_logo.png"
            alt="GymMate Logo"
            width="400px"
            height="110px"
            objectFit="fill"
            mb={2}
          />

          {/* Email Input */}
          <Box w="100%">
            <Text fontWeight="semibold" color="#071434" mb={1}>Email</Text>
            <InputGroup>
              <InputLeftElement pointerEvents="none" color="gray.400">
                <MdEmail />
              </InputLeftElement>
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                bg="white"
                color="#071434"
                mb={4}
                _placeholder={{ color: "gray.400" }}
              />
            </InputGroup>
          </Box>

          {/* Password Input */}
          <Box w="100%">
            <Text fontWeight="semibold" color="#071434" mb={1}>Password</Text>
            <InputGroup>
              <InputLeftElement pointerEvents="none" color="gray.400">
                <RiLockPasswordFill />
              </InputLeftElement>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                bg="white"
                color="#071434"
                _placeholder={{ color: "gray.400" }}
              />
              <InputRightElement>
                <Box as="button" onClick={() => setShowPassword(v => !v)} color="gray.400">
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </Box>
              </InputRightElement>
            </InputGroup>
            <Text fontSize="xs" color="#071434" mt={1} mb={2} textAlign="left" cursor="pointer">
              Forgot Password?
            </Text>
          </Box>

          {/* Login Button */}
          <Button
            w="100%"
            h="45px"
            bg="#FE7654"
            color="white"
            fontWeight="bold"
            fontSize="md"
            borderRadius="8px"
            boxShadow="md"
            _hover={{ bg: "#e65c3b" }}
            _active={{ bg: "#cc4a2d" }}
            onClick={handleLogin}
            isDisabled={isLoading}
          >
            {isLoading ? <Spinner size="sm" color="white" /> : "Log In"}
          </Button>

          {/* Register Link */}
          <Text fontSize="sm" color="#071434" textAlign="center" cursor="pointer" mt={-2}>
            Register an account
          </Text>
        </VStack>
      </Flex>
    </Flex>
  );
}