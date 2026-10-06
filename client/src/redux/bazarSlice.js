import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  productData: [],
  userInfo: null,
};

const getCartItemKey = (item) => {
  return `${item._id}-${item.variantId || "default"}-${
    item.size || "no-size"
  }-${item.color || "no-color"}`;
};

export const bazarSlice = createSlice({
  name: "bazar",
  initialState,

  reducers: {
    addToCart: (state, action) => {
      const incomingItem = action.payload;

      const incomingKey = getCartItemKey(incomingItem);

      const existingItem = state.productData.find(
        (item) => getCartItemKey(item) === incomingKey
      );

      if (existingItem) {
        existingItem.quantity += incomingItem.quantity;
      } else {
        state.productData.push(incomingItem);
      }
    },

    increamentQuantity: (state, action) => {
      const incomingItem = action.payload;

      const item = state.productData.find(
        (item) => getCartItemKey(item) === getCartItemKey(incomingItem)
      );

      if (item) {
        item.quantity++;
      }
    },

    decrementQuantity: (state, action) => {
      const incomingItem = action.payload;

      const item = state.productData.find(
        (item) => getCartItemKey(item) === getCartItemKey(incomingItem)
      );

      if (item) {
        if (item.quantity > 1) {
          item.quantity--;
        }
      }
    },

    deleteItem: (state, action) => {
      const itemToDelete = action.payload;

      state.productData = state.productData.filter(
        (item) => getCartItemKey(item) !== getCartItemKey(itemToDelete)
      );
    },

    resetCart: (state) => {
      state.productData = [];
    },

    // ================= USER =================

    addUser: (state, action) => {
      state.userInfo = action.payload;
    },

    removeUser: (state) => {
      state.userInfo = null;
    },
  },
});

export const {
  addToCart,
  deleteItem,
  resetCart,
  increamentQuantity,
  decrementQuantity,
  addUser,
  removeUser,
} = bazarSlice.actions;

export default bazarSlice.reducer;