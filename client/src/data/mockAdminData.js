// src/data/mockAdminData.js
//
// ADMIN MODULE — mock data source.
//
// The admin pages (pages/admin/*) shipped with this project but their
// data layer (adminService.js) and this mock data file were missing from
// the repo/branch history. This file was reconstructed to match the exact
// field names the existing admin pages already expect — nothing in the
// page components was changed to fit this data; it was written to fit them.
//
// Swap this out for real API responses once backend endpoints exist —
// adminService.js is the only file that needs to change.

export const mockDashboardStats = {
  totalUsers: 4820,
  activeUsers: 3125,
  totalDonations: 1860,
  pendingDonations: 74,
  completedDonations: 1622,
  foodSaved: 18240,
  activeNGOs: 96,
  successfulPickups: 1548,
};

export const mockRecentActivity = [
  { id: "A-1001", type: "DONATION", message: "Ravi Kumar listed 12kg of cooked rice for donation", time: "5 minutes ago" },
  { id: "A-1002", type: "PICKUP", message: "Pickup #PK-3391 marked as completed by Hope Foundation", time: "18 minutes ago" },
  { id: "A-1003", type: "NGO", message: "Anna Trust submitted verification documents", time: "42 minutes ago" },
  { id: "A-1004", type: "USER", message: "New donor account created: priya.s@example.com", time: "1 hour ago" },
  { id: "A-1005", type: "DONATION", message: "Bakery surplus donation from Sunrise Bakers accepted by Seva Bharati", time: "2 hours ago" },
  { id: "A-1006", type: "PICKUP", message: "Pickup #PK-3388 scheduled for 4:30 PM", time: "3 hours ago" },
  { id: "A-1007", type: "NGO", message: "Green Plate NGO rejected — incomplete registration", time: "5 hours ago" },
  { id: "A-1008", type: "DONATION", message: "Vegetable surplus donation marked completed", time: "6 hours ago" },
];

export const mockAnalytics = {
  donationsOverTime: [
    { label: "Mar", value: 210 },
    { label: "Apr", value: 260 },
    { label: "May", value: 340 },
    { label: "Jun", value: 410 },
    { label: "Jul", value: 560 },
    { label: "Aug", value: 788 },
  ],
  foodSavedOverTime: [
    { label: "Mar", value: 1800 },
    { label: "Apr", value: 2400 },
    { label: "May", value: 3100 },
    { label: "Jun", value: 4200 },
    { label: "Jul", value: 5600 },
    { label: "Aug", value: 8140 },
  ],
  donationCategories: [
    { label: "Cooked Food", value: 38 },
    { label: "Vegetables", value: 22 },
    { label: "Bakery", value: 16 },
    { label: "Rice", value: 12 },
    { label: "Fruits", value: 8 },
    { label: "Other", value: 4 },
  ],
  donationStatus: [
    { label: "Completed", value: 1622 },
    { label: "Pickup Scheduled", value: 96 },
    { label: "Accepted", value: 68 },
    { label: "Available", value: 74 },
  ],
  pickupCompletion: {
    rate: 92,
    completed: 1548,
    scheduled: 1682,
  },
  ngoActivity: [
    { label: "Hope Fdn", value: 312 },
    { label: "Seva Bharati", value: 274 },
    { label: "Anna Trust", value: 198 },
    { label: "Akshaya Patra", value: 402 },
    { label: "CareNGO", value: 156 },
  ],
  userGrowth: [
    { label: "Mar", value: 2100 },
    { label: "Apr", value: 2540 },
    { label: "May", value: 3020 },
    { label: "Jun", value: 3610 },
    { label: "Jul", value: 4180 },
    { label: "Aug", value: 4820 },
  ],
  monthlyImpact: {
    foodSaved: 8140,
    successfulPickups: 612,
    activeNGOs: 96,
    users: 4820,
    mealsSupported: 27100,
    co2Impact: 14650,
  },
};

export const mockUsers = [
  { id: "U-2001", name: "Ravi Kumar", email: "ravi.kumar@example.com", role: "DONOR", location: "Hyderabad", status: "ACTIVE", joinedDate: "2026-01-14" },
  { id: "U-2002", name: "Priya Sharma", email: "priya.s@example.com", role: "DONOR", location: "Bengaluru", status: "ACTIVE", joinedDate: "2026-02-02" },
  { id: "U-2003", name: "Hope Foundation", email: "contact@hopefoundation.org", role: "NGO", location: "Hyderabad", status: "ACTIVE", joinedDate: "2025-11-20" },
  { id: "U-2004", name: "Anna Trust", email: "info@annatrust.org", role: "NGO", location: "Chennai", status: "PENDING", joinedDate: "2026-03-05" },
  { id: "U-2005", name: "Admin User", email: "admin@foodsaver.ai", role: "ADMIN", location: "Hyderabad", status: "ACTIVE", joinedDate: "2025-09-01" },
  { id: "U-2006", name: "Karthik Reddy", email: "karthik.r@example.com", role: "DONOR", location: "Vijayawada", status: "BLOCKED", joinedDate: "2026-01-30" },
  { id: "U-2007", name: "Seva Bharati", email: "contact@sevabharati.org", role: "NGO", location: "Pune", status: "ACTIVE", joinedDate: "2025-12-11" },
  { id: "U-2008", name: "Meera Nair", email: "meera.nair@example.com", role: "DONOR", location: "Kochi", status: "ACTIVE", joinedDate: "2026-02-18" },
  { id: "U-2009", name: "Green Plate NGO", email: "hello@greenplate.org", role: "NGO", location: "Mumbai", status: "BLOCKED", joinedDate: "2026-01-05" },
  { id: "U-2010", name: "Arjun Verma", email: "arjun.verma@example.com", role: "DONOR", location: "Delhi", status: "ACTIVE", joinedDate: "2026-03-11" },
  { id: "U-2011", name: "Akshaya Patra", email: "connect@akshayapatra.org", role: "NGO", location: "Bengaluru", status: "ACTIVE", joinedDate: "2025-10-08" },
  { id: "U-2012", name: "Sneha Iyer", email: "sneha.iyer@example.com", role: "DONOR", location: "Hyderabad", status: "PENDING", joinedDate: "2026-03-20" },
];

export const mockNGOs = [
  { id: "N-3001", name: "Hope Foundation", location: "Hyderabad", contact: "+91 90000 11111", verification: "VERIFIED", donationsReceived: 312, pickups: 298, status: "ACTIVE" },
  { id: "N-3002", name: "Anna Trust", location: "Chennai", contact: "+91 90000 22222", verification: "PENDING", donationsReceived: 198, pickups: 180, status: "ACTIVE" },
  { id: "N-3003", name: "Seva Bharati", location: "Pune", contact: "+91 90000 33333", verification: "VERIFIED", donationsReceived: 274, pickups: 260, status: "ACTIVE" },
  { id: "N-3004", name: "Green Plate NGO", location: "Mumbai", contact: "+91 90000 44444", verification: "REJECTED", donationsReceived: 12, pickups: 9, status: "INACTIVE" },
  { id: "N-3005", name: "Akshaya Patra", location: "Bengaluru", contact: "+91 90000 55555", verification: "VERIFIED", donationsReceived: 402, pickups: 388, status: "ACTIVE" },
  { id: "N-3006", name: "CareNGO", location: "Hyderabad", contact: "+91 90000 66666", verification: "PENDING", donationsReceived: 156, pickups: 140, status: "ACTIVE" },
  { id: "N-3007", name: "Feeding Hands", location: "Delhi", contact: "+91 90000 77777", verification: "VERIFIED", donationsReceived: 88, pickups: 80, status: "ACTIVE" },
  { id: "N-3008", name: "Sunrise Relief", location: "Kochi", contact: "+91 90000 88888", verification: "PENDING", donationsReceived: 34, pickups: 28, status: "ACTIVE" },
];

export const mockAdminDonations = [
  { id: "D-4001", food: "Cooked Rice & Curry", donor: "Ravi Kumar", quantity: "12 kg", category: "Cooked Food", status: "COMPLETED", date: "2026-08-10", ngo: "Hope Foundation", pickup: "PK-3391" },
  { id: "D-4002", food: "Mixed Vegetables", donor: "Priya Sharma", quantity: "8 kg", category: "Vegetables", status: "PICKUP_SCHEDULED", date: "2026-08-14", ngo: "Anna Trust", pickup: "PK-3402" },
  { id: "D-4003", food: "Assorted Bakery Items", donor: "Sunrise Bakers", quantity: "20 units", category: "Bakery", status: "ACCEPTED", date: "2026-08-15", ngo: "Seva Bharati", pickup: "—" },
  { id: "D-4004", food: "Packaged Snacks", donor: "Karthik Reddy", quantity: "15 units", category: "Packaged Food", status: "AVAILABLE", date: "2026-08-16", ngo: "—", pickup: "—" },
  { id: "D-4005", food: "Fresh Fruits", donor: "Meera Nair", quantity: "10 kg", category: "Fruits", status: "PICKED_UP", date: "2026-08-13", ngo: "Akshaya Patra", pickup: "PK-3395" },
  { id: "D-4006", food: "Basmati Rice", donor: "Arjun Verma", quantity: "25 kg", category: "Rice", status: "COMPLETED", date: "2026-08-09", ngo: "CareNGO", pickup: "PK-3380" },
  { id: "D-4007", food: "Leftover Catering Food", donor: "Sneha Iyer", quantity: "18 kg", category: "Cooked Food", status: "CANCELLED", date: "2026-08-08", ngo: "—", pickup: "—" },
  { id: "D-4008", food: "Bread & Buns", donor: "Local Bakery Co-op", quantity: "40 units", category: "Bakery", status: "COMPLETED", date: "2026-08-07", ngo: "Feeding Hands", pickup: "PK-3372" },
  { id: "D-4009", food: "Seasonal Vegetables", donor: "Ravi Kumar", quantity: "14 kg", category: "Vegetables", status: "PICKUP_SCHEDULED", date: "2026-08-16", ngo: "Sunrise Relief", pickup: "PK-3410" },
  { id: "D-4010", food: "Canned Goods", donor: "Priya Sharma", quantity: "30 units", category: "Packaged Food", status: "AVAILABLE", date: "2026-08-16", ngo: "—", pickup: "—" },
];

export const mockReports = {
  donationReport: {
    totalDonations: 1860,
    completedDonations: 1622,
    cancelledDonations: 64,
    foodSaved: 18240,
    successfulPickups: 1548,
    activeNGOs: 96,
  },
  userReport: {
    totalUsers: 4820,
    activeUsers: 3125,
    ngoUsers: 96,
    donors: 4644,
  },
};
