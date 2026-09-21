export const ROLE_HOME = {
  donor: "/donor/dashboard",
  ngo: "/ngo/dashboard",
  admin: "/admin/dashboard",
};

export function roleHomePath(role) {
  return ROLE_HOME[role] || "/login";
}

export const ROLE_LOGIN_LANDING = {
  donor: "/donor/donate",
  ngo: "/ngos",
  admin: "/admin/dashboard",
};

export function roleLoginLandingPath(role) {
  return ROLE_LOGIN_LANDING[role] || "/login";
}

export function rolePrefix(role) {
  if (role === "donor") return "/donor";
  if (role === "ngo") return "/ngo";
  if (role === "admin") return "/admin";
  return "";
}
