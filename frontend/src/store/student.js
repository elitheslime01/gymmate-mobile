import { create } from 'zustand';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001"; // Falls back to local backend

const getStoredUser = () => {
    if (typeof window === "undefined") {
        return { user: null, isLoggedIn: false };
    }

    try {
        const storedUser = localStorage.getItem('userData');
        if (!storedUser) {
            return { user: null, isLoggedIn: false };
        }

        const parsedUser = JSON.parse(storedUser);
        return {
            user: parsedUser,
            isLoggedIn: Boolean(parsedUser?._id),
        };
    } catch (error) {
        console.error('Failed to parse stored user data:', error);
        localStorage.removeItem('userData');
        return { user: null, isLoggedIn: false };
    }
};

const { user: initialUser, isLoggedIn: initialIsLoggedIn } = getStoredUser();

export  const useStudentStore = create((set, get) => ({
    students: [],
    user: initialUser,
    isLoggedIn: initialIsLoggedIn,
    isLoading: false,
    verificationLoading: false,
    resendLoading: false,
    error: null,

    // Function to set students
    setStudents: (newStudents) => {
        console.log("Setting students in the store:", newStudents); 
        set({ students: newStudents });
    },

    // Function to create a new student
    createStudent: async (studentData) => {
        console.log("Attempting to create a new student:", studentData); 
        set({ isLoading: true, error: null }); 
        try {
            const response = await fetch(`${API_BASE_URL}/api/students`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(studentData),
            });

            const result = await response.json();

            console.log("Response from server:", result); 

            if (response.ok) {
                set({ isLoading: false });
                return { success: true, data: result.data, message: result.message };
            } else {
                console.error("Error creating student:", result.message);
                set({ error: result.message, isLoading: false }); 
                return { success: false, error: result.message }; 
            }
        } catch (error) {
            console.error("Error during student creation:", error); 
            set({ error: error.message, isLoading: false }); 
            return { success: false, error: error.message }; 
        }
    },

    verifyStudentCode: async (email, code) => {
        set({ verificationLoading: true, error: null });
        try {
            const response = await fetch(`${API_BASE_URL}/api/students/verify-code`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code }),
            });

            const result = await response.json();

            if (response.ok) {
                set({ verificationLoading: false });
                return { success: true, message: result.message };
            }

            set({ verificationLoading: false, error: result.message });
            return { success: false, error: result.message };
        } catch (error) {
            set({ verificationLoading: false, error: error.message });
            return { success: false, error: error.message };
        }
    },

    resendVerificationCode: async (email) => {
        set({ resendLoading: true, error: null });
        try {
            const response = await fetch(`${API_BASE_URL}/api/students/resend-code`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const result = await response.json();

            if (response.ok) {
                set({ resendLoading: false });
                return { success: true, message: result.message };
            }

            set({ resendLoading: false, error: result.message });
            return { success: false, error: result.message };
        } catch (error) {
            set({ resendLoading: false, error: error.message });
            return { success: false, error: error.message };
        }
    },
    
    loginStudent: async (email, password) => {
        if (!email || !password) {
            return { success: false, message: "Please fill in all fields." };
        }
    
        set({ isLoading: true, error: null });
        try {
            const response = await fetch(`${API_BASE_URL}/api/students/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
    
            const data = await response.json();
    
            if (response.ok) {
                // Store user data and userId in localStorage
                localStorage.setItem('userId', data.user._id);
                localStorage.setItem('userData', JSON.stringify(data.user));
                set({ user: data.user, isLoggedIn: true, isLoading: false }); 
                return { success: true, message: "Login successful." };
            } else {
                set({ error: data.message || 'Login failed', isLoading: false });
                return { success: false, message: data.message || 'Login failed' };
            }
        } catch (error) {
            console.error('Login error details:', error);
            const errorMsg = error.message || 'Unknown error';
            set({ error: 'An error occurred during login: ' + errorMsg, isLoading: false });
            return { success: false, message: 'Error: ' + errorMsg };
        }
    },
    
    logout: async () => {
        const { user } = get();
        if (!user?._id) {
            console.error("User ID not found.");
            return false;
        }
    
        try {
            const response = await fetch(`${API_BASE_URL}/api/students/logout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user._id }),
            });
    
            if (response.ok) {
                // Clear localStorage
                localStorage.removeItem('userId');
                localStorage.removeItem('userData');
                set({ user: null, isLoggedIn: false });
                return true;
            }
            return false;
        } catch (error) {
            console.error("Error during logout:", error);
            return false;
        }
    },
    
    clearError: () => {
        set({ error: null });
    },

    updateStudent: async (studentId, formData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await fetch(`${API_BASE_URL}/api/students/${studentId}`, {
                method: 'PUT',
                body: formData, // FormData handles multipart/form-data automatically
            });

            const data = await response.json();

            if (response.ok) {
                // Update localStorage with new user data
                localStorage.setItem('userData', JSON.stringify(data.data));
                set({ user: data.data, isLoading: false });
                return { success: true };
            } else {
                set({ error: data.message || 'Update failed', isLoading: false });
                return { success: false, error: data.message || 'Update failed' };
            }
        } catch (error) {
            set({ error: 'An error occurred during update: ' + error.message, isLoading: false });
            return { success: false, error: 'An error occurred during update.' };
        }
    },
}));