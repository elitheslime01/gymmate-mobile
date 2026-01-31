import { create } from 'zustand';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

const parseBookingDateTime = (booking) => {
    if (!booking?._date) {
        return null;
    }

    const date = new Date(booking._date);
    if (Number.isNaN(date.getTime())) {
        return null;
    }

    const timeString = booking?._timeSlot?.startTime;
    if (!timeString) {
        return date;
    }

    const match = timeString.match(/(\d+):(\d+) (AM|PM)/i);
    if (!match) {
        return date;
    }

    let hour = parseInt(match[1], 10);
    const minute = parseInt(match[2], 10) || 0;
    const meridiem = match[3].toUpperCase();

    if (meridiem === "PM" && hour !== 12) hour += 12;
    if (meridiem === "AM" && hour === 12) hour = 0;

    date.setHours(hour, minute, 0, 0);
    return date;
};

const useWalkinStore = create((set, get) => ({
    navigationStack: ['options'],
    currentView: 'options',
    currentDate: new Date(),
    selectedDay: new Date().getDate(), 
    selectedTime: null, 
    scheduleData: null, 
    scheduleId: null, 
    formattedDate: "",
    isRegistered: false,
    isBooked: false,
    showRegister: false,
    showLogin: false,
    showBooking: false,
    showARInput: false,
    showReview: false,
    showLogOptions: false,
    arCode: "",
    isARCodeValid: false,
    selectedTimeSlot: null,
    showTimeInOut: false,
    showPassword: { password: false, confirmPassword: false },
    currentBooking: null,
    upcomingBookings: [],
    pastBookings: [],
    queueSessions: [],
    arImage: null,
    uploadedARImage: null,

    setCurrentDate: (date) => set({ currentDate: date }),
    setSelectedDay: (day) => set({ selectedDay: day }),
    setSelectedTime: (time) => set({ selectedTime: time }),
    setScheduleData: (data) => set({ scheduleData: data, scheduleId: data ? data._id : null }),
    setFormattedDate: (date) => set({ formattedDate: date }),
    resetScheduleState: () => set({ selectedDay: null, selectedTime: null, scheduleData: null, scheduleId: null }),
    setIsRegistered: (value) => set({ isRegistered: value }),
    setIsBooked: (value) => set({ isBooked: value }),
    setShowRegister: (value) => set({ showRegister: value }),
    setShowLogin: (value) => set({ showLogin: value }),
    setShowBooking: (value) => set({ showBooking: value }),
    setShowARInput: (value) => set({ showARInput: value }),
    setShowReview: (value) => set({ showReview: value }),
    setShowLogOptions: (value) => set({ showLogOptions: value }),
    setShowTimeInOut: (value) => set({ showTimeInOut: value }),
    setArCode: (code) => set({ arCode: code }),
    setSelectedTimeSlot: (slot) => set({ selectedTimeSlot: slot }),
    setShowPassword: (value) => set((state) => ({ showPassword: { ...state.showPassword, ...value } })),
    clearCurrentBooking: () => set({ currentBooking: null }),

    setARImage: (arImage) => {
        console.log('arImage:', arImage);
        set({ arImage });
    },

    resetBookingInputs: (options = {}) => {
        const { resetBooked = true } = options;
        set((state) => ({
            selectedTimeSlot: null,
            selectedTime: null,
            selectedDay: null,
            formattedDate: "",
            scheduleData: null,
            scheduleId: null,
            arCode: "",
            arImage: null,
            uploadedARImage: null,
            currentView: 'options',
            showBooking: false,
            showARInput: false,
            showReview: false,
            showLogOptions: true,
            isBooked: resetBooked ? false : state.isBooked,
        }));
    },

    resetState: () => set({
        currentBooking: null,
        showTimeInOut: false,
        showLogin: true,
        // Reset other relevant state
    }),

    fetchUpcomingBookings: async (studentId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/bookings/get?studentId=${studentId}`);
            const data = await response.json();
    
            if (data && Array.isArray(data)) {
                const now = new Date();
                const future = [];
                const past = [];

                const getTimeValue = (booking) => {
                    const parsed = parseBookingDateTime(booking);
                    return parsed ? parsed.getTime() : 0;
                };

                data.forEach((booking) => {
                    const studentEntry = booking?.students?.find((s) => s?._studentId?._id === studentId);
                    if (!studentEntry) {
                        return;
                    }

                    const status = (studentEntry._bookingStatus || "").toLowerCase();
                    const bookingDateTime = parseBookingDateTime(booking);
                    const isCompleted = Boolean(studentEntry._timedOut) || status.includes("completed") || status.includes("attended") || status.includes("not attended") || status.includes("cancelled");

                    if (!bookingDateTime) {
                        if (isCompleted) {
                            past.push(booking);
                        } else {
                            future.push(booking);
                        }
                        return;
                    }

                    if (bookingDateTime >= now && !isCompleted) {
                        future.push(booking);
                    } else {
                        past.push(booking);
                    }
                });

                future.sort((a, b) => getTimeValue(a) - getTimeValue(b));
                past.sort((a, b) => getTimeValue(b) - getTimeValue(a));

                set({ upcomingBookings: future, pastBookings: past });
            }
        } catch (error) {
            console.error("Error fetching upcoming bookings:", error);
            set({ upcomingBookings: [], pastBookings: [] });
        }
    },

    fetchQueueSessions: async (studentId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/queues/get`);
            const data = await response.json();

            if (!Array.isArray(data)) {
                set({ queueSessions: [] });
                return;
            }

            const now = new Date();
            now.setHours(0, 0, 0, 0);

            const sessions = data.flatMap((queueDoc) => {
                if (!queueDoc?._date || !Array.isArray(queueDoc?.students)) {
                    return [];
                }

                return queueDoc.students
                    .filter((studentEntry) => {
                        const studentIdValue = typeof studentEntry?._studentId === "object"
                            ? studentEntry?._studentId?._id
                            : studentEntry?._studentId;
                        return studentIdValue === studentId;
                    })
                    .map((studentEntry) => {
                        const studentObject = typeof studentEntry._studentId === "object"
                            ? studentEntry._studentId
                            : { _id: studentEntry._studentId };

                        const arObject = typeof studentEntry._arID === "object"
                            ? studentEntry._arID
                            : studentEntry._arID
                                ? { _id: studentEntry._arID }
                                : null;

                        return {
                            _id: `queue-${queueDoc._id}-${studentObject?._id}`,
                            _queueId: queueDoc._id,
                            _source: "queue",
                            _date: queueDoc._date,
                            _timeSlot: queueDoc._timeSlot,
                            students: [
                                {
                                    ...studentEntry,
                                    _studentId: studentObject,
                                    _arID: arObject,
                                    _bookingStatus: studentEntry._queueStatus || "In Queue",
                                },
                            ],
                            _queuedAt: studentEntry._queuedAt,
                            _queueStatus: studentEntry._queueStatus,
                        };
                    })
                    .filter((session) => {
                        const sessionDateTime = parseBookingDateTime(session);
                        if (!sessionDateTime) {
                            return true;
                        }
                        return sessionDateTime.getTime() >= now.getTime();
                    });
            });

            sessions.sort((a, b) => {
                const aDate = parseBookingDateTime(a);
                const bDate = parseBookingDateTime(b);
                const aTime = aDate ? aDate.getTime() : Number.POSITIVE_INFINITY;
                const bTime = bDate ? bDate.getTime() : Number.POSITIVE_INFINITY;
                return aTime - bTime;
            });

            set({ queueSessions: sessions });
        } catch (error) {
            console.error("Error fetching queue sessions:", error);
            set({ queueSessions: [] });
        }
    },

    fetchCurrentBooking: async (studentId) => {
      try {
    const response = await fetch(`${API_BASE_URL}/api/bookings/current/${studentId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
  
        const data = await response.json();
        if (response.ok) {
          set({ currentBooking: data });
          console.log("Current booking fetched successfully:", data);
          return { success: true, data };
        }
        return { success: false, message: data.message };
      } catch (error) {
        console.error("Error fetching current booking:", error);
        return { success: false, message: "Failed to fetch booking information" };
      }
    },

    // Function to fetch schedule data by date
    fetchScheduleByDate: async (date) => {
        const parsedDate = new Date(date);
        if (isNaN(parsedDate)) {
            console.error("Invalid date:", date);
            return; // Exit if the date is invalid
        }
        
        const formattedDate = parsedDate.toISOString().split('T')[0]; // Format date as YYYY-MM-DD
    const response = await fetch(`${API_BASE_URL}/api/schedules/${formattedDate}`); 
        const data = await response.json();
    
        if (response.ok) {
            set({ scheduleData: data, scheduleId: data ? data._id : null }); 
            if (data && data._id) {
                console.log("Schedule exists with ID:", data._id); 
            } else {
                console.log("No schedule found for this date, but response was OK.");
            }
        } else {
            console.log("No schedule found for this date. Response not OK:", data.message); 
            set({ scheduleData: null, scheduleId: null }); 
        }
    },
    addARCode: async (arCode, studentID) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/ARCodes/uploadAR`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ _code: arCode, _studentID: studentID }),
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                console.error("Error adding AR code:", errorData.message);
                return { success: false, message: errorData.message };
            }
    
            const data = await response.json();
            console.log("AR code added successfully. AR ID:", data.arId); 
            return { success: true, message: "AR code added successfully.", arId: data.arId };
        } catch (error) {
            console.error("Error adding AR code:", error);
            return { success: false, message: "An error occurred while adding the AR code." };
        }
    },
    
    checkARCode: async (arCode) => {
        console.log("Sending AR Code for validation:", arCode); 
        try {
            const response = await fetch(`${API_BASE_URL}/api/ARCodes/checkAR`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ _code: arCode }), 
            });

            const data = await response.json(); 
            console.log("Response from AR Code check:", data); 
            if (response.ok) {
                console.log("AR Code Check Successful:", data);
                set({ isARCodeValid: true }); 
                return { success: true, message: "AR code is valid." };
            } else {
                console.error("AR Code Check Failed:", data.message);
                set({ isARCodeValid: false }); 
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error("Error checking AR code:", error);
            set({ isARCodeValid: false }); 
            return { success: false, message: "Server error." };
        }
    },

        // Update the existing addToQueue function
    addToQueue: async (studentId, date, timeSlot, scheduleId, timeSlotId, arId) => {
        try {
            // Check for existing booking first
            const checkResult = await get().checkExistingBooking(studentId, date, timeSlot);
            if (checkResult.exists) {
                return { 
                    success: false, 
                    message: "You already have a booking for this time slot" 
                };
            }
    
            // Continue with existing queue addition logic
            const response = await fetch(`${API_BASE_URL}/api/queues/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    _studentId: studentId, 
                    _date: date,
                    _timeSlot: {
                        startTime: timeSlot.startTime,
                        endTime: timeSlot.endTime,
                    },
                    _timeSlotId: timeSlotId,
                    _scheduleId: scheduleId,
                    _arId: arId,
                }),
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                console.error("Failed to add to queue:", errorData.message);
                return { success: false, message: errorData.message };
            }
    
            const data = await response.json();
            return { success: true, message: "Successfully added to queue.", data };
        } catch (error) {
            console.error("Error adding to queue:", error);
            return { success: false, message: "An error occurred while adding to the queue." };
        }
    },

        uploadARImage: async (arImage, studentId) => {
                try {
                        if (!arImage || typeof arImage !== 'object' || !arImage.size) {
                                const message = 'AR image file is missing or invalid.';
                                console.error(message);
                                return { success: false, message };
                        }

                        if (!studentId) {
                                const message = 'Student ID is required to upload AR image.';
                                console.error(message);
                                return { success: false, message };
                        }

                        const formData = new FormData();
                        formData.append('_arImage', arImage);
                        formData.append('_studentId', studentId);

                        const response = await fetch(`${API_BASE_URL}/api/arImage/upload`, {
                                method: 'POST',
                                body: formData,
                        });

                        const data = await response.json().catch(() => null);

                        if (response.ok) {
                                set({ uploadedARImage: data });
                                return { success: true, data };
                        }

                        const message = data?.message || response.statusText || 'Failed to upload AR image.';
                        console.error('Error uploading AR image:', message);
                        return { success: false, message };
                } catch (error) {
                        console.error('Error uploading AR image:', error);
                        return { success: false, message: error.message };
                }
        },
    
      getARImage: async (studentID) => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/arImage/${studentID}`);
    
          if (response.ok) {
            const data = await response.json();
            set({ arImage: data });
          } else {
            console.error('Error getting AR image:', response.statusText);
          }
        } catch (error) {
          console.error('Error getting AR image:', error.message);
        }
      },

    // Navigation functions
    navigateTo: (view) => {
        const currentStack = get().navigationStack;
        set({ 
            navigationStack: [...currentStack, view],
            currentView: view,
            // Reset all show states first
            showRegister: false,
            showLogin: false,
            showLogOptions: false,
            showBooking: false,
            showARInput: false,
            showReview: false,
            // Set the appropriate view state
            [`show${view.charAt(0).toUpperCase() + view.slice(1)}`]: true
        });
    },

    goBack: () => {
        const currentStack = get().navigationStack;
        if (currentStack.length > 1) {
            const newStack = currentStack.slice(0, -1);
            const previousView = newStack[newStack.length - 1];
            set({ 
                navigationStack: newStack,
                currentView: previousView,
                // Reset all show states
                showRegister: false,
                showLogin: false,
                showLogOptions: false,
                showBooking: false,
                showARInput: false,
                showReview: false,
                // Set the appropriate view state
                [`show${previousView.charAt(0).toUpperCase() + previousView.slice(1)}`]: true
            });
        }
    },

    // Reset navigation
    resetNavigation: () => {
        set({ 
            navigationStack: ['options'],
            currentView: 'options',
            showRegister: false,
            showLogin: false,
            showLogOptions: false,
            showBooking: false,
            showARInput: false,
            showReview: false,
            isRegistered: false,
            isBooked: false
        });
    },

    checkExistingBooking: async (studentId, date, timeSlot) => {
        try {
            // Validate inputs before making request
            if (!studentId || !date || !timeSlot || !timeSlot.startTime || !timeSlot.endTime) {
                console.error('Missing required parameters:', { studentId, date, timeSlot });
                return {
                    success: false,
                    exists: false,
                    message: "Invalid parameters for booking check"
                };
            }
    
            // Format date to YYYY-MM-DD
            const formattedDate = new Date(date).toISOString().split('T')[0];
    
            // Debug log
            console.log('Checking booking with:', { studentId, date: formattedDate, timeSlot });
                
            const encodedStartTime = encodeURIComponent(timeSlot.startTime);
            const encodedEndTime = encodeURIComponent(timeSlot.endTime);
                
            const response = await fetch(
                `${API_BASE_URL}/api/bookings/check-existing?` +
                `studentId=${studentId}&` +
                `date=${formattedDate}&` +
                `startTime=${encodedStartTime}&` +
                `endTime=${encodedEndTime}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
    
            const data = await response.json();
            console.log('Check Existing Booking Response:', data);
                
            return {
                success: response.ok,
                exists: data.exists,
                message: data.message
            };
        } catch (error) {
            console.error("Error checking existing booking:", error);
            return {
                success: false,
                exists: false,
                message: "Failed to check existing booking"
            };
        }
    },

    checkMissedBookings: async (studentId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/bookings/check-missed`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                if (studentId) {
                    await get().fetchCurrentBooking(studentId);
                    await get().fetchUpcomingBookings(studentId);
                }
                return true;
            }
            return false;
        } catch (error) {
            console.error("Error checking missed bookings:", error);
            return false;
        }
    },

    // Update existing timeIn function
    timeIn: async (bookingId, studentId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/timeIn`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    studentId,
                    timeIn: new Date(),
                }),
            });

            if (response.ok) {
                await get().fetchCurrentBooking(studentId);
                return true;
            }
            return false;
        } catch (error) {
            console.error("Error recording time in:", error);
            return false;
        }
    },

    // Update existing timeOut function
    timeOut: async (bookingId, studentId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/timeOut`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    studentId,
                    timeOut: new Date(),
                }),
            });

            if (response.ok) {
                await get().fetchCurrentBooking(studentId);
                return true;
            }
            return false;
        } catch (error) {
            console.error("Error recording time out:", error);
            return false;
        }
    }
}));

export default useWalkinStore;