export default function RestaurantsList({ restaurants, selectedRestaurant, onSelectRestaurant }) {
  return (
    <div className="bg-white border border-gray-300 rounded-lg p-3 md:p-4 shadow-md mb-6">
      <h2 className="text-lg md:text-2xl font-bold mb-3 md:mb-4">🏪 Available Restaurants</h2>

      {restaurants.length === 0 ? (
        <p className="text-gray-600 text-center py-6 md:py-8 text-sm md:text-base">
          Select a station to see available restaurants
        </p>
      ) : (
        <div className="space-y-2 md:space-y-3">
          {restaurants.map((restaurant) => (
            <div
              key={restaurant._id}
              onClick={() => onSelectRestaurant(restaurant)}
              className={`border-2 rounded-lg p-3 md:p-4 cursor-pointer transition ${
                selectedRestaurant?._id === restaurant._id
                  ? "border-secondary bg-yellow-50 shadow-lg"
                  : "border-gray-300 bg-white hover:border-secondary"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                <div className="flex-1">
                  <h3 className="font-bold text-base md:text-lg">{restaurant.name}</h3>
                  <div className="flex flex-wrap gap-2 md:gap-4 mt-2 text-xs text-gray-600">
                    <span>⭐ {restaurant.rating?.toFixed(1) || "N/A"}</span>
                    <span>📍 {restaurant.distanceFromStation} km</span>
                    <span>⏱️ {restaurant.minPreparationTime} mins</span>
                  </div>
                  {restaurant.address && (
                    <p className="text-xs text-gray-700 mt-2">
                      📍 {restaurant.address}, {restaurant.city}
                    </p>
                  )}
                </div>
                {selectedRestaurant?._id === restaurant._id && (
                  <span className="text-secondary font-bold text-xl">✓</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
