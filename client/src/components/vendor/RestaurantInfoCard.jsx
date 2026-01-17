export default function RestaurantInfoCard({ restaurant, onEdit }) {
  return (
    <div className="mb-6 bg-white border border-gray-300 rounded-lg p-4 shadow-md">
      <div className="flex justify-between items-start gap-6">
        <div className="flex-1">
          <h2 className="text-lg font-bold mb-2">{restaurant?.name}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
            <div>
              <p className="text-gray-600">📍 Distance</p>
              <p className="font-bold">{restaurant?.distanceFromStation} km</p>
            </div>
            <div>
              <p className="text-gray-600">⏱️ Prep Time</p>
              <p className="font-bold">{restaurant?.minPreparationTime} mins</p>
            </div>
            <div>
              <p className="text-gray-600">💳 Payment</p>
              <p className="font-bold">{restaurant?.paymentMode}</p>
            </div>
            <div>
              <p className="text-gray-600">🕐 Hours</p>
              <p className="font-bold text-xs">
                {restaurant?.operatingHours?.open} - {restaurant?.operatingHours?.close}
              </p>
            </div>
            <div>
              <p className="text-gray-600">🍽️ Break</p>
              <p className="font-bold text-xs">
                {restaurant?.breakTime?.from} - {restaurant?.breakTime?.to}
              </p>
            </div>
            <div>
              <p className="text-gray-600">⭐ Rating</p>
              <p className="font-bold">{restaurant?.rating || "N/A"}</p>
            </div>
          </div>
          <p className="text-xs text-gray-700 mt-2">
            📍 {restaurant?.address}, {restaurant?.city} | 📞 {restaurant?.phone}
          </p>
        </div>
        <button
          onClick={onEdit}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded font-semibold transition flex-shrink-0 shadow-md"
        >
          Edit
        </button>
      </div>
    </div>
  );
}
