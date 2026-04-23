import { z } from "zod";

// Auth Schemas
export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});

export const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain uppercase letter")
    .regex(/[a-z]/, "Password must contain lowercase letter")
    .regex(/[0-9]/, "Password must contain number"),
  confirmPassword: z.string(),
  agreeToTerms: z.boolean().refine(val => val === true, "You must agree to terms"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Property Schemas
export const PropertySearchSchema = z.object({
  location: z.string().optional(),
  checkIn: z.date().optional(),
  checkOut: z.date().optional(),
  guests: z.number().min(1).max(20).optional(),
  priceMin: z.number().min(0).optional(),
  priceMax: z.number().min(0).optional(),
  amenities: z.array(z.string()).optional(),
  propertyType: z.string().optional(),
  sortBy: z.enum(["rating", "price-low", "price-high", "newest"]).optional(),
});

export const BecomeHostSchema = z.object({
  hostName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(8, "Phone number must be at least 8 characters"),
  propertyTitle: z.string().min(4, "Property title must be at least 4 characters"),
  propertyType: z.enum(["villa", "apartment", "hotel", "hostel", "resort", "cottage"]),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City is required"),
  country: z.string().min(2, "Country is required"),
  nightlyPrice: z.coerce.number().min(1, "Nightly price must be greater than 0"),
  maxGuests: z.coerce.number().int().min(1).max(20),
  bedrooms: z.coerce.number().int().min(0).max(20),
  bathrooms: z.coerce.number().int().min(0).max(20),
  description: z.string().min(20, "Description must be at least 20 characters"),
  amenities: z.string().optional(),
  imageUrls: z.string().optional(),
  checkInTime: z.string().min(1, "Check-in time required"),
  checkOutTime: z.string().min(1, "Check-out time required"),
  allowSmoking: z.boolean().default(false),
  allowPets: z.boolean().default(true),
  allowParties: z.boolean().default(false),
  termsAccepted: z.boolean().refine((value) => value === true, "You must agree to host terms"),
});

// Trip Schemas
export const CreateTripSchema = z.object({
  title: z.string().min(3, "Trip title must be at least 3 characters"),
  destination: z.string().min(2, "Destination required"),
  startDate: z.date().min(new Date(), "Start date must be in future"),
  endDate: z.date(),
  budget: z.number().min(1000, "Budget must be at least 1000"),
  description: z.string().optional(),
  maxMembers: z.number().min(2).max(20),
}).refine((data) => data.endDate > data.startDate, {
  message: "End date must be after start date",
  path: ["endDate"],
});

// Booking Schemas
export const BookingSchema = z.object({
  propertyId: z.string().min(1, "Property required"),
  checkIn: z.date(),
  checkOut: z.date(),
  guests: z.number().min(1).max(20),
  specialRequests: z.string().optional(),
}).refine((data) => data.checkOut > data.checkIn, {
  message: "Checkout must be after checkin",
  path: ["checkOut"],
});

// Expense Schemas
export const ExpenseSchema = z.object({
  tripId: z.string().min(1, "Trip required"),
  description: z.string().min(3, "Description required"),
  amount: z.number().min(0.01, "Amount must be positive"),
  currency: z.string().default("INR"),
  category: z.enum(["accommodation", "food", "transport", "activity", "other"]),
  paidBy: z.string().min(1, "Payer required"),
  splitBetween: z.array(z.string()).min(1, "Must split with at least one person"),
});

// Review Schemas
export const ReviewSchema = z.object({
  propertyId: z.string().min(1, "Property required"),
  rating: z.number().min(1).max(5),
  title: z.string().min(5, "Title must be at least 5 characters"),
  comment: z.string().min(20, "Review must be at least 20 characters"),
});

export type LoginFormData = z.infer<typeof LoginSchema>;
export type RegisterFormData = z.infer<typeof RegisterSchema>;
export type PropertySearch = z.infer<typeof PropertySearchSchema>;
export type BecomeHostFormData = z.infer<typeof BecomeHostSchema>;
export type CreateTripData = z.infer<typeof CreateTripSchema>;
export type BookingData = z.infer<typeof BookingSchema>;
export type ExpenseData = z.infer<typeof ExpenseSchema>;
export type ReviewData = z.infer<typeof ReviewSchema>;
