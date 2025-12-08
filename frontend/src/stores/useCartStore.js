import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (vaccine, quantity = 1) => {
        const items = get().items;
        const exist = items.find((i) => i.vaccine.id === vaccine.id);

        if (exist) {
          set({
            items: items.map((i) =>
              i.vaccine.id === vaccine.id ? { ...i, quantity: i.quantity + quantity } : i
            ),
          });
        } else {
          set({ items: [...items, { vaccine, quantity }] });
        }
      },

      addToCart: (product) => {
        get().addItem(product, 1);
      },

      removeItem: (id) =>
        set({
          items: get().items.filter((i) => i.vaccine.id !== id),
        }),

      removeFromCart: (vaccineId) => {
        get().removeItem(vaccineId);
      },

      increase: (id) => {
        const items = get().items;

        set({
          items: items.map((i) => (i.vaccine.id === id ? { ...i, quantity: i.quantity + 1 } : i)),
        });
      },

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
            items: items.map((i) => (i.vaccine.id === id ? { ...i, quantity: i.quantity - 1 } : i)),
          });
        }
      },

      updateQuantity: (vaccineId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(vaccineId);
          return;
        }

        const items = get().items;
        set({
          items: items.map((i) => (i.vaccine.id === vaccineId ? { ...i, quantity } : i)),
        });
      },

      clearCart: () => set({ items: [] }),

      totalQuantity: () => get().items.reduce((acc, item) => acc + item.quantity, 0),

      totalPrice: () =>
        get().items.reduce((acc, item) => acc + item.vaccine.price * item.quantity, 0),

      get itemCount() {
        return get().totalQuantity();
      },
      get total() {
        return get().totalPrice();
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);

export { useCartStore };
export default useCartStore;
