export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  bio?: string;
  currencyPreference: string;
  role: "guest" | "host" | "both";
  isVerified: boolean;
  wishlist: string[];
  createdAt: string;
}

export interface Property {
  id: string;
  hostId: string;
  hostName: string;
  hostAvatar?: string;
  title: string;
  description: string;
  type: "villa" | "apartment" | "hotel" | "hostel" | "resort" | "cottage";
  location: { address: string; city: string; country: string; lat: number; lng: number };
  images: string[];
  pricePerNight: number;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  beds: number;
  amenities: string[];
  rules: { checkInTime: string; checkOutTime: string; smokingAllowed: boolean; petsAllowed: boolean; partiesAllowed: boolean };
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface Booking {
  id: string;
  propertyId: string;
  property?: Property;
  guestId: string;
  tripId?: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  totalPrice: number;
  pricePerNight: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  paymentStatus: "unpaid" | "paid";
  specialRequests?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  propertyId: string;
  bookingId: string;
  guestId: string;
  guestName: string;
  guestAvatar?: string;
  hostId: string;
  rating: number;
  comment: string;
  categories: { cleanliness: number; accuracy: number; communication: number; location: number; checkin: number; value: number };
  hostReply?: string;
  createdAt: string;
}

export interface Trip {
  id: string;
  title: string;
  destination: string;
  country: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  groupSize: number;
  budgetPerPerson: number;
  currency: string;
  createdBy: string;
  members: TripMember[];
  status: "planning" | "active" | "archived" | "completed";
  finalizedProperty?: Property;
  inviteCode: string;
  totalExpenses: number;
  createdAt: string;
}

export interface TripMember {
  userId: string;
  name: string;
  avatar?: string;
  email: string;
  role: "organizer" | "member";
  joinedAt: string;
  totalContributed: number;
}

export interface UserSearchResult {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface TripInvite {
  id: string;
  tripId: string;
  inviterId: string;
  inviteeUserId?: string;
  inviteeEmail: string;
  status: "pending" | "accepted" | "declined" | "revoked" | "expired";
  token?: string;
  expiresAt: string;
  createdAt: string;
}

export interface Vote {
  id: string;
  tripId: string;
  propertyId: string;
  userId: string;
  vote: "up" | "down";
}

export interface Expense {
  id: string;
  tripId: string;
  description: string;
  amount: number;
  currency: string;
  category: "food" | "transport" | "activity" | "accommodation" | "other" | "shopping";
  paidBy: string;
  paidByName: string;
  splitAmong: string[];
  receipt?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  tripId?: string;
  type: "vote" | "expense" | "booking" | "review" | "member" | "finalize" | "system";
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface ItineraryDay {
  id: string;
  dayNumber: number;
  date: string;
  activities: Activity[];
}

export interface Activity {
  id: string;
  time: string;
  title: string;
  location?: string;
  category: "food" | "transport" | "sightseeing" | "leisure" | "adventure" | "shopping";
  notes?: string;
  estimatedCost?: number;
}

export type PropertyType = Property["type"];
export type TripStatus = Trip["status"];
export type BookingStatus = Booking["status"];
export type ExpenseCategory = Expense["category"];
