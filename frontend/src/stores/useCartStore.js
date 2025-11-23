import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Shopping cart store with persistent localStorage
 * @typedef {object} CartItem
 * @property {object} vaccine - Vaccine object with id, name, price, etc.
 * @property {number} quantity - Quantity of this vaccine in cart
 */

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      /**
       * Add item to cart or increase quantity if already exists
       * @param {object} vaccine - Vaccine object to add
       * @param {number} quantity - Quantity to add (default: 1)
       */
      addItem: (vaccine, quantity = 1) => {
        const items = get().items;
        const exist = items.find((i) => i.vaccine.id === vaccine.id);

        if (exist) {
          // If exists, increase quantity
          set({
            items: items.map((i) =>
              i.vaccine.id === vaccine.id
                ? { ...i, quantity: i.quantity + quantity }
                : i
            ),
          });
        } else {
          // Add new item
          set({ items: [...items, { vaccine, quantity }] });
        }
      },

      // Backward compatibility with old addToCart
      addToCart: (product) => {
        get().addItem(product, 1);
      },

      removeItem: (id) =>
        set({
          items: get().items.filter((i) => i.vaccine.id !== id),
        }),

      // Backward compatibility with old removeFromCart
      removeFromCart: (vaccineId) => {
        get().removeItem(vaccineId);
      },

      /**
       * Increase item quantity by 1
       * @param {number|string} id - Vaccine ID
       */
      increase: (id) => {
        const items = get().items;

        set({
          items: items.map((i) =>
            i.vaccine.id === id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        });
      },

      /**
       * Decrease item quantity by 1, remove if quantity becomes 0
       * @param {number|string} id - Vaccine ID
       */
      decrease: (id) => {
        const items = get().items;
        const target = items.find((i) => i.vaccine.id === id);
        if (!target) return;

        if (target.quantity === 1) {
          set({
            items: items.filter((i) => i.vaccine.id !== id),
          });
        } else {
          set({
            items: items.map((i) =>
              i.vaccine.id === id ? { ...i, quantity: i.quantity - 1 } : i
            ),
          });
        }
      },

      // Backward compatibility with old updateQuantity
      updateQuantity: (vaccineId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(vaccineId);
          return;
        }

        const items = get().items;
        set({
          items: items.map((i) =>
            i.vaccine.id === vaccineId ? { ...i, quantity } : i
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      /**
       * Get total quantity of all items
       * @returns {number} Total quantity
       */
      totalQuantity: () =>
        get().items.reduce((acc, item) => acc + item.quantity, 0),

      /**
       * Get total price of all items
       * @returns {number} Total price
       */
      totalPrice: () =>
        get().items.reduce(
          (acc, item) => acc + item.vaccine.price * item.quantity,
          0
        ),

      // Computed properties for backward compatibility
      get itemCount() {
        return get().totalQuantity();
      },
      get total() {
        return get().totalPrice();
      },
    }),
    {
      name: 'cart-storage', // localStorage key
    }
  )
);

export { useCartStore };
export default useCartStore;
