export default function MenuItemCard({
  item,
  onEdit,
  onDelete,
  onToggleAvailability,
}) {
  return (
    <div
      className={`border rounded-lg p-3 transition ${
        item.isAvailable ? "bg-white" : "bg-gray-100 opacity-60"
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <p className="font-bold text-sm">{item.name}</p>
          <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded mt-1">
            {item.category}
          </span>
          <p className="text-secondary font-bold mt-1">₹{item.price}</p>
        </div>
        <button
          onClick={() => onToggleAvailability(item._id, item.isAvailable)}
          className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap transition shadow-md ${
            item.isAvailable
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-gray-500 text-white hover:bg-gray-600"
          }`}
        >
          {item.isAvailable ? "✓" : "✗"}
        </button>
      </div>
      <p className="text-xs text-gray-600 mb-2 line-clamp-2">{item.description}</p>
      <div className="flex gap-2">
        <button
          onClick={() => onEdit(item)}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs font-semibold transition shadow-md"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(item._id)}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs font-semibold transition shadow-md"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
