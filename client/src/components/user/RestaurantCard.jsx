export default function RestaurantCard({ restaurant, isSelected, onSelect }) {
  return (
    <div
      onClick={onSelect}
      className={`border-2 rounded-lg p-4 cursor-pointer transition ${
        isSelected
          ? "border-secondary bg-yellow-50 shadow-lg"
          : "border-gray-300 bg-white hover:border-secondary hover:shadow-md"
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-bold text-lg">{restaurant.name}</h3>
          <div className="flex gap-3 mt-2 text-xs text-gray-600">
            <span>⭐ {restaurant.rating || "N/A"}</span>
            <span>📍 {restaurant.distanceFromStation || "N/A"} km</span>
            <span>⏱️ {restaurant.minPreparationTime || "N/A"} mins</span>
          </div>
          {restaurant.address && (
            <p className="text-xs text-gray-700 mt-2">{restaurant.address}</p>
          )}
        </div>
      </div>
    </div>
  );
}
