import { User, Property, Booking, Review, Trip, Expense, Notification, TripInvite, UserSearchResult, VoteSummary } from "@/types";

export const API_BASE = import.meta.env.VITE_API_URL || "/api";
const REQUEST_TIMEOUT = 60000; // 15 seconds

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ApiError {
  message: string;
  code: string;
  status?: number;
}

class ApiClient {
  private baseURL: string;
  private token: string | null;
  private slowRequestTimers = new Map<number, ReturnType<typeof setTimeout>>();
  private slowRequestIds = new Set<number>();
  private nextRequestId = 1;

  constructor() {
    this.baseURL = API_BASE;
    this.token = localStorage.getItem("sv_token");
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem("sv_token", token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem("sv_token");
  }

  private emitWakingUpState() {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("sv:waking-up", {
          detail: { wakingUp: this.slowRequestIds.size > 0 },
        })
      );
    }
  }

  private startSlowTimer(requestId: number) {
    const timer = setTimeout(() => {
      this.slowRequestIds.add(requestId);
      this.emitWakingUpState();
    }, 5000);
    this.slowRequestTimers.set(requestId, timer);
  }

  private clearSlowTimer(requestId: number) {
    const timer = this.slowRequestTimers.get(requestId);
    if (timer) {
      clearTimeout(timer);
      this.slowRequestTimers.delete(requestId);
    }
    if (this.slowRequestIds.has(requestId)) {
      this.slowRequestIds.delete(requestId);
      this.emitWakingUpState();
    }
  }

  private transformResponse<T>(data: any): T {
    if (!data) return data;
    if (typeof data !== 'object') return data;
    
    // Convert MongoDB _id to id
    if (Array.isArray(data)) {
      return data.map(item => this.transformResponse(item)) as T;
    }
    
    const transformed = { ...data };
    if (transformed._id && !transformed.id) {
      transformed.id = transformed._id;
      delete transformed._id;
    }
    
    return transformed as T;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const method = (options.method || "GET").toUpperCase();
    const isIdempotentGet = method === "GET";
    const maxRetries = isIdempotentGet ? 2 : 0;
    let attempt = 0;

    const requestId = this.nextRequestId++;
    this.startSlowTimer(requestId);

    try {
      while (true) {
        attempt++;
        const headers = new Headers(options.headers || {});
        if (!headers.has("Content-Type")) {
          headers.set("Content-Type", "application/json");
        }

        if (this.token) {
          headers.set("Authorization", `Bearer ${this.token}`);
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

        try {
          const response = await fetch(`${this.baseURL}${endpoint}`, {
            ...options,
            headers,
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            const status = response.status;
            // Retry idempotent GETs on gateway / cold-start error codes (502, 503, 504)
            if (isIdempotentGet && attempt <= maxRetries && [502, 503, 504].includes(status)) {
              const backoffMs = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
              await new Promise((resolve) => setTimeout(resolve, backoffMs));
              continue;
            }

            const error = await response.json().catch(() => ({}));
            throw {
              message: error.message || `HTTP ${status}`,
              code: status.toString(),
              status,
            };
          }

          const data = await response.json();
          return this.transformResponse<T>(data);
        } catch (err: any) {
          clearTimeout(timeoutId);

          // If already a structured ApiError that is not retryable, rethrow
          if (err && typeof err.status === "number" && !([502, 503, 504].includes(err.status) && isIdempotentGet && attempt <= maxRetries)) {
            throw err;
          }

          const isTimeout = err?.name === "AbortError";
          const isNetwork = err instanceof TypeError;

          // Retry idempotent GETs on network errors or timeouts
          if (isIdempotentGet && attempt <= maxRetries && (isTimeout || isNetwork)) {
            const backoffMs = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
            await new Promise((resolve) => setTimeout(resolve, backoffMs));
            continue;
          }

          if (isTimeout) {
            throw {
              message: `Request timeout (${REQUEST_TIMEOUT}ms). Server is slow or unreachable.`,
              code: "TIMEOUT",
              status: 504,
            };
          }

          if (isNetwork) {
            throw {
              message: `Network error: ${err.message}. Is the API running? (${this.baseURL})`,
              code: "NETWORK_ERROR",
              status: 503,
            };
          }

          throw err;
        }
      }
    } finally {
      this.clearSlowTimer(requestId);
    }
  }

  // ===== Auth =====
  async login(email: string, password: string) {
    const response = await this.request<{ token: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  async register(data: { name: string; email: string; password: string; role: string }) {
    const response = await this.request<{ token: string; user: User }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  async logout() {
    this.clearToken();
  }

  async getProfile() {
    return this.request<User>("/auth/profile");
  }

  async updateProfile(data: Partial<User>) {
    return this.request<User>("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return this.request<{ message: string }>("/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  // ===== Properties =====
  async searchProperties(filters?: {
    city?: string;
    priceMin?: number;
    priceMax?: number;
    type?: string;
    amenities?: string[];
    rating?: number;
    sort?: string;
  }) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            params.append(key, value.join(","));
          } else {
            params.append(key, String(value));
          }
        }
      });
    }
    return this.request<Property[]>(`/properties?${params.toString()}`);
  }

  async getProperty(id: string) {
    return this.request<Property>(`/properties/${id}`);
  }

  async getPropertiesByIds(ids: string[]) {
    const sanitizedIds = ids.map((id) => id.trim()).filter(Boolean);
    if (!sanitizedIds.length) {
      return [] as Property[];
    }
    const params = new URLSearchParams({ ids: sanitizedIds.join(",") });
    return this.request<Property[]>(`/properties/batch?${params.toString()}`);
  }

  async addToWishlist(propertyId: string) {
    return this.request<User>("/properties/wishlist/add", {
      method: "POST",
      body: JSON.stringify({ propertyId }),
    });
  }

  async removeFromWishlist(propertyId: string) {
    return this.request<User>("/properties/wishlist/remove", {
      method: "POST",
      body: JSON.stringify({ propertyId }),
    });
  }

  async getWishlist() {
    return this.request<Property[]>("/properties/wishlist");
  }

  // ===== Bookings =====
  async createBooking(data: {
    propertyId: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    tripId?: string;
  }) {
    return this.request<Booking>("/bookings", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getBookings() {
    return this.request<Booking[]>("/bookings");
  }

  async getBooking(id: string) {
    return this.request<Booking>(`/bookings/${id}`);
  }

  async cancelBooking(id: string) {
    return this.request<Booking>(`/bookings/${id}`, {
      method: "DELETE",
    });
  }

  // ===== Trips =====
  async createTrip(data: {
    title: string;
    destination: string;
    country: string;
    checkIn: string;
    checkOut: string;
    groupSize: number;
    budgetPerPerson: number;
    currency: string;
  }) {
    return this.request<Trip>("/trips", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getTrips() {
    return this.request<Trip[]>("/trips");
  }

  async getTrip(id: string) {
    return this.request<Trip>(`/trips/${id}`);
  }

  async deleteTrip(id: string) {
    return this.request<{ message: string; tripId: string }>(`/trips/${id}`, {
      method: "DELETE",
    });
  }

  async getTripInvites(tripId: string) {
    return this.request<TripInvite[]>(`/trips/${tripId}/invites`);
  }

  async deleteTripInvite(tripId: string, inviteId: string) {
    return this.request<{ message: string; inviteId: string }>(`/trips/${tripId}/invites/${inviteId}`, {
      method: "DELETE",
    });
  }

  async shortlistProperty(tripId: string, propertyId: string) {
    return this.request<Trip>(`/trips/${tripId}/properties`, {
      method: "POST",
      body: JSON.stringify({ propertyId }),
    });
  }

  async removeShortlistedProperty(tripId: string, propertyId: string) {
    return this.request<Trip>(`/trips/${tripId}/properties/${encodeURIComponent(propertyId)}`, {
      method: "DELETE",
    });
  }

  async inviteTripMember(tripId: string, email: string) {
    return this.request<TripInvite>(`/trips/${tripId}/invites`, {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  async respondToTripInvite(inviteId: string, action: "accept" | "decline") {
    return this.request<{ invite: TripInvite; tripId: string }>(`/trips/invites/${inviteId}/respond`, {
      method: "POST",
      body: JSON.stringify({ action }),
    });
  }

  async updateTrip(id: string, data: Partial<Trip>) {
    return this.request<Trip>(`/trips/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async joinTripWithCode(code: string) {
    return this.request<Trip>("/trips/join-code", {
      method: "POST",
      body: JSON.stringify({ code }),
    });
  }

  // ===== Expenses =====
  async addExpense(tripId: string, data: {
    description: string;
    amount: number;
    category: string;
    currency: string;
    paidBy: string;
    splitWith: string[];
    receipt?: string;
  }) {
    return this.request<Expense>(`/trips/${tripId}/expenses`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getTripExpenses(tripId: string) {
    return this.request<Expense[]>(`/trips/${tripId}/expenses`);
  }

  async settleExpenses(tripId: string) {
    return this.request<{ settlements: any[] }>(`/trips/${tripId}/expenses/settle`, {
      method: "POST",
    });
  }

  // ===== Reviews =====
  async createReview(propertyId: string, data: {
    bookingId: string;
    rating: number;
    comment: string;
    categories: Record<string, number>;
  }) {
    return this.request<Review>(`/properties/${propertyId}/reviews`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getPropertyReviews(propertyId: string) {
    return this.request<Review[]>(`/properties/${propertyId}/reviews`);
  }

  // ===== Votes =====
  async castVote(tripId: string, propertyId: string, voteType: "up" | "down") {
    return this.request<{ voteCount: number }>(`/trips/${tripId}/votes`, {
      method: "POST",
      body: JSON.stringify({ propertyId, voteType }),
    });
  }

  async getTripVoteSummary(tripId: string) {
    return this.request<VoteSummary[]>(`/trips/${tripId}/votes/summary`);
  }

  // ===== Notifications =====
  async getNotifications() {
    return this.request<Notification[]>("/notifications");
  }

  async searchUsers(query: string) {
    const encoded = encodeURIComponent(query);
    return this.request<UserSearchResult[]>(`/users/search?q=${encoded}`);
  }

  async markNotificationAsRead(id: string) {
    return this.request<Notification>(`/notifications/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ isRead: true }),
    });
  }

  async markAllNotificationsAsRead() {
    return this.request<{ count: number }>("/notifications/mark-all-read", {
      method: "POST",
    });
  }

  async joinTripFromNotification(notificationId: string) {
    return this.request<{ tripId: string; joined: boolean; alreadyMember: boolean }>(`/notifications/${notificationId}/join-trip`, {
      method: "POST",
    });
  }

  async getNotificationTripPreview(notificationId: string) {
    return this.request<{
      trip: {
        id: string;
        title: string;
        destination: string;
        country: string;
        checkIn: string;
        checkOut: string;
        nights: number;
        groupSize: number;
        currentMembers: number;
        budgetPerPerson: number;
        currency: string;
        status: string;
      };
      alreadyMember: boolean;
      inviteExpiresAt: string | null;
    }>(`/notifications/${notificationId}/trip-preview`);
  }

  // ===== Currency =====
  async convertCurrency(amount: number, from: string, to: string) {
    return this.request<{ result: number; rate: number }>("/currency/convert", {
      method: "POST",
      body: JSON.stringify({ amount, from, to }),
    });
  }

  async getCurrencyRates(base: string = "INR") {
    return this.request<Record<string, number>>(`/currency/rates?base=${base}`);
  }

  // ===== AI Estimates =====
  async getAIBudgetEstimate(tripData: { destination: string; nights: number; groupSize: number; budgetPerPerson: number }) {
    return this.request<{ estimate: number; breakdown: any; tips: string[] }>("/ai/estimate", {
      method: "POST",
      body: JSON.stringify(tripData),
    });
  }

  // ===== Host Dashboard =====
  async getHostProperties() {
    return this.request<Property[]>("/properties/host/properties");
  }

  async createProperty(data: Partial<Property>) {
    return this.request<Property>("/properties/host/properties", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateHostProperty(id: string, data: Partial<Property>) {
    return this.request<Property>(`/properties/host/properties/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async archiveHostProperty(id: string) {
    return this.request<Property>(`/properties/host/properties/${id}/archive`, {
      method: "PATCH",
    });
  }

  async restoreHostProperty(id: string) {
    return this.request<Property>(`/properties/host/properties/${id}/restore`, {
      method: "PATCH",
    });
  }

  async getHostStats() {
    return this.request<{
      totalListings: number;
      totalBookings: number;
      totalRevenue: number;
      avgRating: number;
      activeListings: number;
      archivedListings: number;
    }>("/properties/host/stats");
  }
  // ===== System Health =====
  async getHealth() {
    return this.request<{ status: string }>("/health");
  }

  // ===== Password Reset =====
  async requestPasswordReset(email: string) {
    return this.request<{ message: string }>("/auth/request-password-reset", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, newPassword: string) {
    return this.request<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, newPassword }),
    });
  }

  // ===== Analytics =====
  async getAnalytics(range: string = "month") {
    return this.request<any>(`/analytics?range=${encodeURIComponent(range)}`);
  }
}

export const api = new ApiClient();
