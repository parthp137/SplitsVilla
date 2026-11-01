import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import Property from "./models/Property.js";

dotenv.config();

if (process.env.NODE_ENV === "production" && process.env.ALLOW_SEED !== "true") {
  console.error("Seeding is blocked in production unless ALLOW_SEED=true is explicitly set.");
  process.exit(1);
}

if (process.env.NODE_ENV === "production") {
  console.error("Seeding with hardcoded demo credentials is not permitted in production.");
  process.exit(1);
}

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/splitsvilla";

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB for seeding...");

    // Check if properties already exist
    const count = await Property.countDocuments();
    if (count > 0) {
      console.log(`Database already has ${count} properties. Skipping seed.`);
      process.exit(0);
    }

    // Create a demo host user if none exists
    let host = await User.findOne({ email: "host@splitsvilla.com" });
    if (!host) {
      host = await User.create({
        name: "SplitsVilla Stays",
        email: "host@splitsvilla.com",
        password: "password123",
        role: "host",
        isVerified: true,
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      });
      console.log("Created demo host user: host@splitsvilla.com");
    }

    const sampleProperties = [
      {
        hostId: host._id,
        hostName: host.name,
        hostAvatar: host.avatar,
        title: "Sunset Serenade Luxury Villa",
        description: "Spectacular 5-bedroom cliffside villa overlooking the Arabian Sea with an infinity pool, private beach access, and a dedicated chef.",
        type: "villa",
        location: {
          address: "Vagator Cliff Road",
          city: "Goa",
          country: "India",
          lat: 15.602,
          lng: 73.743,
        },
        images: [
          "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80",
        ],
        pricePerNight: 28000,
        maxGuests: 12,
        bedrooms: 5,
        bathrooms: 6,
        beds: 6,
        amenities: ["WiFi", "Pool", "Air Conditioning", "Kitchen", "Chef", "Free Parking", "Sea View", "Barbecue"],
        rules: {
          checkInTime: "14:00",
          checkOutTime: "11:00",
          smokingAllowed: false,
          petsAllowed: true,
          partiesAllowed: true,
        },
        rating: 4.95,
        reviewCount: 38,
        isFeatured: true,
        isActive: true,
      },
      {
        hostId: host._id,
        hostName: host.name,
        hostAvatar: host.avatar,
        title: "Mountain Mist Chalet & Jacuzzi",
        description: "Cozy cedar-wood chalet nestled amidst pine forests with panoramic Himalayan views, a fireplace, and a heated outdoor jacuzzi.",
        type: "cottage",
        location: {
          address: "Old Manali Hills",
          city: "Manali",
          country: "India",
          lat: 32.243,
          lng: 77.189,
        },
        images: [
          "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80",
        ],
        pricePerNight: 16500,
        maxGuests: 8,
        bedrooms: 3,
        bathrooms: 3,
        beds: 4,
        amenities: ["WiFi", "Jacuzzi", "Fireplace", "Heating", "Mountain View", "Kitchen", "Free Parking"],
        rules: {
          checkInTime: "13:00",
          checkOutTime: "11:00",
          smokingAllowed: false,
          petsAllowed: true,
          partiesAllowed: false,
        },
        rating: 4.88,
        reviewCount: 24,
        isFeatured: true,
        isActive: true,
      },
      {
        hostId: host._id,
        hostName: host.name,
        hostAvatar: host.avatar,
        title: "Royal Rajputana Heritage Haveli",
        description: "Authentic 18th-century royal haveli featuring courtyards, hand-painted frescoes, rooftop swimming pool, and lake vistas.",
        type: "resort",
        location: {
          address: "Pichola Ghat Road",
          city: "Udaipur",
          country: "India",
          lat: 24.585,
          lng: 73.712,
        },
        images: [
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
        ],
        pricePerNight: 22000,
        maxGuests: 10,
        bedrooms: 4,
        bathrooms: 4,
        beds: 5,
        amenities: ["WiFi", "Pool", "Lake View", "Air Conditioning", "Breakfast Included", "Free Parking"],
        rules: {
          checkInTime: "14:00",
          checkOutTime: "11:00",
          smokingAllowed: false,
          petsAllowed: false,
          partiesAllowed: false,
        },
        rating: 4.92,
        reviewCount: 45,
        isFeatured: true,
        isActive: true,
      },
    ];

    await Property.insertMany(sampleProperties);
    console.log(`✓ Successfully seeded ${sampleProperties.length} properties!`);
    process.exit(0);
  } catch (error) {
    console.error("✗ Seed error:", error);
    process.exit(1);
  }
};

seedDatabase();
