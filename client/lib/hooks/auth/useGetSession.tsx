import { useQuery } from "@tanstack/react-query";

// api call
import { getSessionRequest } from "@/features/api/auth.api";

export const useSession = () => {
  return useQuery({
    queryKey: ["session"], // unique cache key
    queryFn: async () => {
      try {
        const data = await getSessionRequest();
        console.log("✅ Session fetched successfully:", data);
        return data;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        if (error.response) {
          console.error("❌ Server error:", {
            status: error.response.status,
            data: error.response.data,
          });
        } else if (error.request) {
          console.error("❌ Network error: No response from server");
        } else {
          console.error("❌ Unexpected error:", error.message);
        }
        throw error; // re-throw so React Query knows it failed
      }
    },
    refetchOnWindowFocus: false,
  });
};
