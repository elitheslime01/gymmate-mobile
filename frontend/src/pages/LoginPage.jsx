import { Box, Button, Flex, Heading, Image, Input, InputGroup, InputLeftElement, InputRightElement, Spinner, Stack, Text, useToast } from "@chakra-ui/react";
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
    <Flex flex="1" align="center" justify="center">
      <Box
        w="full"
        maxW={{ base: "sm", md: "md" }}
        bg="white"
        borderRadius="2xl"
        boxShadow="xl"
        p={{ base: 6, md: 8 }}
      >
        <Stack spacing={{ base: 6, md: 8 }}>
          <Stack spacing={3} align="center" textAlign="center">
            <Image
              src="/gymmate_logo.png"
              alt="GymMate Logo"
              maxW={{ base: "180px", md: "220px" }}
              objectFit="contain"
            />
            <Heading size="lg" color="#071434">
              Welcome back
            </Heading>
            <Text fontSize="sm" color="gray.500">
              Log in to manage your sessions from any device.
            </Text>
          </Stack>

          <Stack spacing={5}>
            <Box>
              <Text fontWeight="semibold" color="#071434" mb={2}>
                Email
              </Text>
              <InputGroup>
                <InputLeftElement pointerEvents="none" color="gray.400">
                  <MdEmail />
                </InputLeftElement>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  bg="white"
                  color="#071434"
                  _placeholder={{ color: "gray.400" }}
                />
              </InputGroup>
            </Box>

            <Box>
              <Text fontWeight="semibold" color="#071434" mb={2}>
                Password
              </Text>
              <InputGroup>
                <InputLeftElement pointerEvents="none" color="gray.400">
                  <RiLockPasswordFill />
                </InputLeftElement>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  bg="white"
                  color="#071434"
                  _placeholder={{ color: "gray.400" }}
                />
                <InputRightElement>
                  <Box as="button" onClick={() => setShowPassword((v) => !v)} color="gray.400">
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </Box>
                </InputRightElement>
              </InputGroup>
              <Button
                variant="link"
                colorScheme="blue"
                fontSize="sm"
                mt={2}
                alignSelf="flex-start"
              >
                Forgot password?
              </Button>
            </Box>
          </Stack>

          <Stack spacing={4}>
            <Button
              w="full"
              h="48px"
              bg="#FE7654"
              color="white"
              fontWeight="bold"
              fontSize="md"
              borderRadius="lg"
              boxShadow="md"
              _hover={{ bg: "#e65c3b" }}
              _active={{ bg: "#cc4a2d" }}
              onClick={handleLogin}
              isDisabled={isLoading}
            >
              {isLoading ? <Spinner size="sm" color="white" /> : "Log In"}
            </Button>
            <Text fontSize="sm" color="gray.600" textAlign="center">
              Don&apos;t have an account yet?{" "}
              <Button variant="link" color="#FE7654" fontWeight="bold" px={1}>
                Register now
              </Button>
            </Text>
          </Stack>

          {loginError && (
            <Box
              p={3}
              borderRadius="lg"
              bg="red.50"
              color="red.600"
              textAlign="center"
              fontSize="sm"
            >
              {loginError}
            </Box>
          )}
        </Stack>
      </Box>
    </Flex>
  );
}