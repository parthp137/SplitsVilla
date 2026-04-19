import { User, Property, Booking, Review, Trip, Expense, Notification, TripInvite, UserSearchResult, VoteSummary } from "@/types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const REQUEST_TIMEOUT = 15000; // 15 seconds

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface ApiError {
  message: string;
  code: string;
}

class ApiClient {
  private baseURL: string;
  private token: string | null;

  constructor() {
    this.baseURL = API_BASE_URL;
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
    const headers = new Headers(options.headers || {});
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    if (this.token) {
      headers.set("Authorization", `Bearer ${this.token}`);
    }

    // Create timeout abort controller
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
        const error = await response.json().catch(() => ({}));
        throw {
          message: error.message || `HTTP ${response.status}`,
          code: response.status.toString(),
        };
      }

      const data = await response.json();
      return this.transformResponse<T>(data);
    } catch (err: any) {
      clearTimeout(timeoutId);
      
      // Handle timeout
      if (err.name === 'AbortError') {
        throw {
          message: `Request timeout (${REQUEST_TIMEOUT}ms). Server is slow or unreachable.`,
          code: "TIMEOUT",
        };
      }
      
      // Handle network errors
      if (err instanceof TypeError) {
        throw {
          message: `Network error: ${err.message}. Is the API running? (${this.baseURL})`,
          code: "NETWORK_ERROR",
        };
      }
      // Re-throw API errors
      throw err;
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

  async getTripInvites(tripId: string) {
    return this.request<TripInvite[]>(`/trips/${tripId}/invites`);
  }

  async shortlistProperty(tripId: string, propertyId: string) {
    return this.request<Trip>(`/trips/${tripId}/properties`, {
      method: "POST",
      body: JSON.stringify({ propertyId }),
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
    return this.request<Property[]>("/host/properties");
  }

  async createProperty(data: Partial<Property>) {
    return this.request<Property>("/host/properties", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getHostStats() {
    return this.request<{
      totalListings: number;
      totalBookings: number;
      totalRevenue: number;
      avgRating: number;
    }>("/host/stats");
  }
}

export const api = new ApiClient();
