import NGOCard from "./NGOCard";

/**
 * NGOList
 *
 * Renders a responsive grid of NGOCard components.
 * Loading/empty states are handled by the parent page (NGOFinder), since
 * those states need page-level layout (skeletons, illustrations, etc.).
 *
 * Props:
 *  - ngos: NGO[]
 *  - selectedNGO: NGO | null
 *  - onViewDetails, onSchedulePickup, onSelect: (ngo) => void
 */
export default function NGOList({ ngos, selectedNGO, onViewDetails, onSchedulePickup, onSelect }) {
  return (
    <div className="ngo-finder-page__grid">
      {ngos.map((ngo) => (
        <NGOCard
          key={ngo.id}
          ngo={ngo}
          selected={selectedNGO?.id === ngo.id}
          onViewDetails={onViewDetails}
          onSchedulePickup={onSchedulePickup}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
