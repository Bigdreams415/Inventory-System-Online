import React, { useState } from 'react';

// Define types for Product and CartItem
interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
}

interface CartItem {
  product: Product;
  quantity: number;
}

const PointOfSale: React.FC = () => {
  // Sample products (hardcoded for now; replace with DB fetch later)
  const [products] = useState<Product[]>([
    { id: 1, name: 'Product A', price: 10.99, stock: 50 },
    { id: 2, name: 'Product B', price: 5.49, stock: 100 },
    { id: 3, name: 'Product C', price: 15.00, stock: 30 },
    { id: 4, name: 'Product D', price: 7.99, stock: 75 },
    { id: 5, name: 'Product E', price: 12.50, stock: 40 },
    // Add more products as needed
  ]);

  const [cart, setCart] = useState<CartItem[]>([]);

  // Function to add product to cart
  const addToCart = (product: Product) => {
    if (product.stock <= 0) return; // Prevent adding out-of-stock items

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.product.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });

    // Update stock (local for now; sync with DB later)
    // For demo, we're not actually reducing stock yet to keep it simple
  };

  // Function to remove item from cart
  const removeFromCart = (productId: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  };

  // Function to update quantity
  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity < 1) return removeFromCart(productId);

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  // Calculate total
  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // Function to process sale (placeholder; integrate with DB later)
  const processSale = () => {
    if (cart.length === 0) return;
    console.log('Processing sale:', { cart, total });
    alert(`Sale processed! Total: $${total.toFixed(2)}`);
    setCart([]); // Clear cart after sale
    // Here, you'd send to DB: reduce stock, record transaction, etc.
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Point of Sale</h2>
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Products</h3>
          <div className="grid grid-cols-3 gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-gray-50 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => addToCart(product)}
              >
                <p className="font-medium text-gray-800">{product.name}</p>
                <p className="text-sm text-gray-600">${product.price.toFixed(2)}</p>
                <p className="text-xs text-gray-500">Stock: {product.stock}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Cart</h3>
          <div className="space-y-4 mb-4">
            {cart.length === 0 ? (
              <p className="text-gray-500 text-center">Cart is empty</p>
            ) : (
              cart.map((item) => (
                <div key={item.product.id} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-gray-600">${item.product.price.toFixed(2)} x {item.quantity}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      className="text-gray-500 hover:text-gray-700"
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      className="text-gray-500 hover:text-gray-700"
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    >
                      +
                    </button>
                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={() => removeFromCart(item.product.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="mt-4 space-y-3">
            <div className="flex justify-between text-lg font-semibold">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <button
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              onClick={processSale}
              disabled={cart.length === 0}
            >
              Process Sale
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PointOfSale;