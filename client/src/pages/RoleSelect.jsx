import { useNavigate } from "react-router-dom";
import { HandHeart, Building2, ShieldCheck } from "lucide-react";
import { getAuthUser, setAuthRole } from "../utils/authStorage";
import "./RoleSelect.css";

const ROLES = [
  {
    id: "Food Donor",
    icon: HandHeart,
    title: "Food Donor",
    description: "Donate surplus food and track it reaching people who need it.",
    destination: "/dashboard",
  },
  {
    id: "NGO",
    icon: Building2,
    title: "NGO",
    description: "Receive donations and coordinate pickups with donors.",
    // No NGO-specific dashboard exists in this project yet — falls back to
    // the same dashboard as Food Donor until one is built.
    destination: "/dashboard",
  },
  {
    id: "Admin",
    icon: ShieldCheck,
    title: "Admin",
    description: "Manage users, NGOs, donations, and platform analytics.",
    destination: "/admin",
  },
];

const RoleSelect = () => {
  const navigate = useNavigate();
  const user = getAuthUser();

  const handleSelect = (role) => {
    setAuthRole(role.id);
    navigate(role.destination);
  };

  return (
    <div className="role-select-page">
      <div className="role-select-card">
        <h1>How will you use FoodSaver AI{user?.name ? `, ${user.name}` : ""}?</h1>
        <p>Choose how you'd like to continue this session.</p>

        <div className="role-select-grid">
          {ROLES.map((role) => {
            const Icon = role.icon;
            return (
              <button
                key={role.id}
                type="button"
                className="role-select-option"
                onClick={() => handleSelect(role)}
              >
                <span className="role-select-icon">
                  <Icon size={26} />
                </span>
                <strong>{role.title}</strong>
                <span className="role-select-description">{role.description}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RoleSelect;
