export default function CartSidebar({ cart, onRemoveItem, onCheckout }) {
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-md sticky top-6">
      <h2 className="text-2xl font-bold mb-4 flex items-center justify-between">
        🛒 Cart
        {itemCount > 0 && (
          <span className="bg-secondary text-white rounded-full px-3 py-1 text-sm">
            {itemCount}
          </span>
        )}
      </h2>

      {cart.length === 0 ? (
        <p className="text-gray-600 text-center py-8">Cart is empty</p>
      ) : (
        <>
          <div className="space-y-3 mb-4 max-h-[400px] overflow-y-auto">
            {cart.map((item, idx) => (
              <div key={idx} className="border-b border-gray-200 pb-3">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-semibold text-sm">{item.name}</span>
                  <span className="text-secondary font-bold">₹{item.price * item.quantity}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">{item.category}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      x{item.quantity}
                    </span>
                    <button
                      onClick={() => onRemoveItem(idx)}
                      className="text-accent hover:text-red-700 text-xs font-semibold transition"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-3 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-bold">Subtotal:</span>
              <span className="font-bold">₹{total}</span>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>Delivery Fee:</span>
              <span>₹20</span>
            </div>
            <div className="border-t pt-2 flex justify-between items-center text-lg">
              <span className="font-bold">Total:</span>
              <span className="font-bold text-secondary">₹{total + 20}</span>
            </div>
          </div>

          <button
            onClick={onCheckout}
            className="w-full mt-4 bg-secondary hover:bg-yellow-500 text-white py-3 rounded-lg font-bold transition shadow-md"
          >
            Proceed to Checkout
          </button>
        </>
      )}
    </div>
  );
}
