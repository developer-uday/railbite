export default function VendorHeader({ restaurantName, rating, onLogout }) {
  return (
    <header className="bg-gray-500 text-white p-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">🚂 RAILBITE - Vendor</h1>
          <p className="text-sm text-gray-200">{restaurantName}</p>
        </div>
        <div className="flex gap-4 items-center">
          <span className="text-sm">⭐ {rating || "N/A"}</span>
          <button
            onClick={onLogout}
            className="bg-accent hover:bg-red-600 px-4 py-2 rounded text-sm font-semibold transition shadow-md"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
