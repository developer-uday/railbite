import MenuItemCard from "./MenuItemCard";

export default function MenuManagement({
  menu,
  showAddMenuItem,
  onToggleAddItem,
  newMenuItem,
  onMenuItemChange,
  onAddMenuItem,
  editingMenuId,
  onEdit,
  onDelete,
  onToggleAvailability,
}) {
  return (
    <div className="col-span-1">
      <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">🍽️ Menu</h2>
          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-semibold">
            {menu.length}
          </span>
        </div>

        <button
          onClick={onToggleAddItem}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded font-semibold transition mb-4 shadow-md"
        >
          {showAddMenuItem ? "✕ Cancel" : "+ Add Item"}
        </button>

        {showAddMenuItem && (
          <form
            onSubmit={onAddMenuItem}
            className="bg-gray-50 border border-gray-300 rounded-lg p-4 mb-4 space-y-3"
          >
            <input
              type="text"
              placeholder="Item Name"
              value={newMenuItem.name}
              onChange={(e) =>
                onMenuItemChange({ ...newMenuItem, name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-secondary outline-none"
              required
            />
            <input
              type="number"
              placeholder="Price"
              value={newMenuItem.price}
              onChange={(e) =>
                onMenuItemChange({ ...newMenuItem, price: e.target.value })
              }
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-secondary outline-none"
              required
            />
            <select
              value={newMenuItem.category}
              onChange={(e) =>
                onMenuItemChange({
                  ...newMenuItem,
                  category: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-secondary outline-none"
            >
              <option value="Veg">Veg</option>
              <option value="Non-Veg">Non-Veg</option>
              <option value="Snacks">Snacks</option>
              <option value="Beverages">Beverages</option>
            </select>
            <textarea
              placeholder="Description"
              value={newMenuItem.description}
              onChange={(e) =>
                onMenuItemChange({
                  ...newMenuItem,
                  description: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-secondary outline-none"
              rows="2"
            />
            <button
              type="submit"
              className="w-full bg-gray-700 hover:bg-gray-800 text-white py-2 rounded font-semibold transition shadow-md"
            >
              {editingMenuId ? "Update" : "Add"}
            </button>
          </form>
        )}

        <div className="space-y-3 max-h-[800px] overflow-y-auto">
          {menu.length === 0 ? (
            <p className="text-gray-600 text-sm text-center py-4">No items yet</p>
          ) : (
            menu.map((item) => (
              <MenuItemCard
                key={item._id}
                item={item}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleAvailability={onToggleAvailability}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
