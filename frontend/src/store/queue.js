import { create } from 'zustand';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

const useQueueStore = create((set) => ({
  queues: [],
  setQueues: (queues) => set({ queues }),
  date: "",
  setDate: (date) => set({ date }),
  timeSlot: { startTime: "", endTime: "" },
  setTimeSlot: (timeSlot) => set({ timeSlot }),
  
  clearQueues: () => set({ queues: [], date: "", timeSlot: { startTime: "", endTime: "" } }),


  // Add this to your useQueueStore
  fetchAllCurrentMonthQueues: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/queues/currentMonth`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data && Array.isArray(data)) {
        set({ queues: data });
      }
    } catch (error) {
      console.error("Error fetching current month queues:", error.message);
      set({ queues: [] });
    }
  },
    
  fetchQueues: async (date, timeSlot) => {
    try {
      // Clear existing queues before fetching
      set({ queues: [] });

      const response = await fetch(`${API_BASE_URL}/api/queues/get?date=${date}&startTime=${timeSlot.startTime}&endTime=${timeSlot.endTime}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      // Only set queues if we have valid data
      if (data && Array.isArray(data)) {
        // Filter queues by the selected date and time slot
        const filteredQueues = data.filter(queue => 
          new Date(queue._date).toISOString().split('T')[0] === date &&
          queue._timeSlot.startTime === timeSlot.startTime
        );
        set({ queues: filteredQueues });
      }
    } catch (error) {
      console.error("Error fetching queues:", error.message);
      set({ queues: [] }); // Clear queues on error
    }
  },
  
  allocateStudents: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/queues/allocate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      const data = await response.json();
  
      if (!data.success) {
        throw new Error(data.message);
      }
  
      return {
        success: true,
        data: data.data
      };
  
    } catch (error) {
      console.error("Error allocating students:", error.message);
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  // Add this new function
  fetchQueuesByDate: async (date) => {
    try {
      set({ queues: [] });

      const response = await fetch(`${API_BASE_URL}/api/queues/get?date=${date}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data && Array.isArray(data)) {
        // Filter queues by just the date
        const filteredQueues = data.filter(queue => 
          new Date(queue._date).toISOString().split('T')[0] === date
        );
        set({ queues: filteredQueues });
      }
    } catch (error) {
      console.error("Error fetching queues by date:", error.message);
      set({ queues: [] });
    }
  },

  // Modify the existing refreshQueueData function
  refreshQueueData: async () => {
    const state = useQueueStore.getState();
    if (state.date && state.timeSlot.startTime) {
      // If both date and timeslot are selected
      await state.fetchQueues(state.date, state.timeSlot);
    } else if (state.date) {
      // If only date is selected
      await state.fetchQueuesByDate(state.date);
    } else {
      // If nothing is selected, show current month
      await state.fetchAllCurrentMonthQueues();
    }
  }
}));

export default useQueueStore;