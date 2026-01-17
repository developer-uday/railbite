export default function MenuItemCard({ item, onAddToCart }) {
  return (
    <div className="border border-gray-300 rounded-lg p-4 bg-white hover:shadow-lg transition">
      <div className="mb-3">
        <h4 className="font-bold text-lg">{item.name}</h4>
        <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded mt-1">
          {item.category}
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
      <div className="flex justify-between items-center">
        <p className="text-secondary font-bold text-lg">₹{item.price}</p>
        <button
          onClick={() => onAddToCart(item)}
          className="bg-secondary hover:bg-yellow-500 text-white px-4 py-2 rounded font-semibold transition shadow-md"
        >
          + Add
        </button>
      </div>
    </div>
  );
}
