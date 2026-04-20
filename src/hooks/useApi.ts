import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Property, Booking, Trip, Expense, Review, Notification } from "@/types";

// Properties hooks
export function useSearchProperties(filters?: any) {
  return useQuery({
    queryKey: ["properties", filters],
    queryFn: () => api.searchProperties(filters),
    enabled: true,
  });
}

export function useProperty(id: string | undefined) {
  return useQuery({
    queryKey: ["property", id],
    queryFn: () => (id ? api.getProperty(id) : null),
    enabled: !!id,
  });
}

export function useWishlist() {
  return useQuery({
    queryKey: ["wishlist"],
    queryFn: () => api.getWishlist(),
  });
}

export function useAddToWishlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (propertyId: string) => api.addToWishlist(propertyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
}

export function useRemoveFromWishlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (propertyId: string) => api.removeFromWishlist(propertyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
}

// Bookings hooks
export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.createBooking(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}

export function useBookings() {
  return useQuery({
    queryKey: ["bookings"],
    queryFn: () => api.getBookings(),
  });
}

export function useBooking(id: string | undefined) {
  return useQuery({
    queryKey: ["booking", id],
    queryFn: () => (id ? api.getBooking(id) : null),
    enabled: !!id,
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.cancelBooking(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}

// Trips hooks
export function useCreateTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.createTrip(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
    },
  });
}

export function useTrips() {
  return useQuery({
    queryKey: ["trips"],
    queryFn: () => api.getTrips(),
  });
}

export function useTrip(id: string | undefined) {
  return useQuery({
    queryKey: ["trip", id],
    queryFn: () => (id ? api.getTrip(id) : null),
    enabled: !!id,
  });
}

export function useJoinTripWithCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => api.joinTripWithCode(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
    },
  });
}

// Expenses hooks
export function useAddExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tripId, ...data }: any) => api.addExpense(tripId, data),
    onSuccess: (_, { tripId }) => {
      queryClient.invalidateQueries({ queryKey: ["expenses", tripId] });
    },
  });
}

export function useTripExpenses(tripId: string | undefined) {
  return useQuery({
    queryKey: ["expenses", tripId],
    queryFn: () => (tripId ? api.getTripExpenses(tripId) : []),
    enabled: !!tripId,
  });
}

export function useSettleExpenses() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tripId: string) => api.settleExpenses(tripId),
    onSuccess: (_, tripId) => {
      queryClient.invalidateQueries({ queryKey: ["expenses", tripId] });
    },
  });
}

// Reviews hooks
export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ propertyId, ...data }: any) => api.createReview(propertyId, data),
    onSuccess: (_, { propertyId }) => {
      queryClient.invalidateQueries({ queryKey: ["reviews", propertyId] });
    },
  });
}

export function usePropertyReviews(propertyId: string | undefined) {
  return useQuery({
    queryKey: ["reviews", propertyId],
    queryFn: () => (propertyId ? api.getPropertyReviews(propertyId) : []),
    enabled: !!propertyId,
  });
}

// Notifications hooks
export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: () => api.getNotifications(),
    refetchInterval: 30000, // Poll every 30s
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.markNotificationAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.markAllNotificationsAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

// Currency hooks
export function useCurrencyConversion() {
  return useMutation({
    mutationFn: ({ amount, from, to }: any) => api.convertCurrency(amount, from, to),
  });
}

export function useCurrencyRates(base: string = "INR") {
  return useQuery({
    queryKey: ["rates", base],
    queryFn: () => api.getCurrencyRates(base),
  });
}

// Votes hooks
export function useCastVote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tripId, propertyId, voteType }: any) => api.castVote(tripId, propertyId, voteType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
}

// AI hooks
export function useAIBudgetEstimate() {
  return useMutation({
    mutationFn: (tripData: any) => api.getAIBudgetEstimate(tripData),
  });
}

// Host hooks
export function useHostProperties() {
  return useQuery({
    queryKey: ["host-properties"],
    queryFn: () => api.getHostProperties(),
  });
}

export function useCreateProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.createProperty(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["host-properties"] });
      queryClient.invalidateQueries({ queryKey: ["host-stats"] });
    },
  });
}

export function useHostStats() {
  return useQuery({
    queryKey: ["host-stats"],
    queryFn: () => api.getHostStats(),
  });
}
