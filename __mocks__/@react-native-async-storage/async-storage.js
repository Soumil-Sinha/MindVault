// Mock for @react-native-async-storage/async-storage
const store = {};

const AsyncStorage = {
  setItem: jest.fn(async (key, value) => {
    store[key] = value;
  }),
  getItem: jest.fn(async (key) => store[key] ?? null),
  removeItem: jest.fn(async (key) => {
    delete store[key];
  }),
  clear: jest.fn(async () => {
    Object.keys(store).forEach((k) => delete store[k]);
  }),
  multiGet: jest.fn(async (keys) => keys.map((k) => [k, store[k] ?? null])),
  multiSet: jest.fn(async (pairs) => {
    pairs.forEach(([k, v]) => (store[k] = v));
  }),
  getAllKeys: jest.fn(async () => Object.keys(store)),
};

export default AsyncStorage;
