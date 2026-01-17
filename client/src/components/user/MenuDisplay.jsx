import MenuItemCard from "./MenuItemCard";

export default function MenuDisplay({ restaurant, menu, onAddToCart }) {
  if (!restaurant) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-3 md:p-4 shadow-md">
      <div className="mb-4 md:mb-6">
        <h3 className="text-lg md:text-2xl font-bold mb-2">🍽️ Menu</h3>
        <p className="text-gray-600 text-sm md:text-base">{restaurant.name}</p>
      </div>

      {menu.length === 0 ? (
        <p className="text-gray-600 text-center py-6 md:py-8 text-sm md:text-base">
          No items available from this restaurant
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          {menu.map((item) => (
            <MenuItemCard
              key={item._id}
              item={item}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      )}
    </div>
  );
}
