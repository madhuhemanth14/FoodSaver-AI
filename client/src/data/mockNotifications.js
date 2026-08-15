const mockNotifications = [
  {
    id: 1,
    type: "pickup",
    title: "Pickup Scheduled",
    message:
      "Your food donation is scheduled for pickup today.",
    time: "10 minutes ago",
    read: false,
  },
  {
    id: 2,
    type: "donation",
    title: "Donation Accepted",
    message:
      "Your food donation has been accepted by the NGO.",
    time: "1 hour ago",
    read: false,
  },
  {
    id: 3,
    type: "ai",
    title: "Food Analysis Completed",
    message:
      "Your AI food analysis has been completed successfully.",
    time: "2 hours ago",
    read: false,
  },
  {
    id: 4,
    type: "ngo",
    title: "NGO Pickup Confirmed",
    message:
      "The NGO has confirmed your donation pickup.",
    time: "3 hours ago",
    read: true,
  },
  {
    id: 5,
    type: "expiry",
    title: "Expiry Alert",
    message:
      "One of your listed food items is nearing expiry.",
    time: "5 hours ago",
    read: true,
  },
  {
    id: 6,
    type: "donation",
    title: "Donation Delivered",
    message:
      "Your food donation was successfully delivered.",
    time: "Yesterday",
    read: true,
  },
  {
    id: 7,
    type: "system",
    title: "Welcome to FoodSaver AI",
    message:
      "Thank you for helping reduce food waste.",
    time: "Yesterday",
    read: true,
  },
];

export default mockNotifications;