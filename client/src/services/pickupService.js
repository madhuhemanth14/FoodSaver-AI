export const createPickupRequest = async (pickupData) => {

  const pickup = {
    id: Date.now(),
    ...pickupData,
    status: "REQUESTED",
    createdAt: new Date().toISOString()
  };

  localStorage.setItem(
    "activePickup",
    JSON.stringify(pickup)
  );

  return pickup;
};

export const getActivePickup = async () => {

  const pickup =
    localStorage.getItem("activePickup");

  return pickup
    ? JSON.parse(pickup)
    : null;
};

export const updatePickupStatus = async (
  status
) => {

  const pickup =
    await getActivePickup();

  if (!pickup) {
    return null;
  }

  const updatedPickup = {
    ...pickup,
    status
  };

  localStorage.setItem(
    "activePickup",
    JSON.stringify(updatedPickup)
  );

  return updatedPickup;
};