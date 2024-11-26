
export const BASE_API_URL = import.meta.env.VITE_API_URL;
const BASE_API_URL_TESTING = 'http://0.0.0.0:8000/api/'

// Product Images API URLs
export const API_URL_PRODUCT_IMAGES = (productId) => `${BASE_API_URL}product/${productId}/images/`;
export const API_URL_PRODUCT_IMAGE_DELETE = (imageId) => `${BASE_API_URL}product/image/${imageId}/`;

// Category API URLs
export const API_URL_CATEGORIES = BASE_API_URL + 'category/';
export const API_URL_PRODUCTS = BASE_API_URL + 'product/';
export const API_URL_USERS = BASE_API_URL + 'user/';
export const API_URL_SUPPLIERS = BASE_API_URL + 'supplier/';
export const API_URL_SUPPLIERS_GLOBAL_HISTORY = BASE_API_URL + 'product_batch/';
export const API_URL_STORES = BASE_API_URL + 'store/';
export const API_URL_WAREHOUSES = BASE_API_URL + 'warehouse/';
export const API_URL_WAREHOUSES_TRANSFERS = BASE_API_URL + "warehouse_transfer/";
export const API_URL_INVENTORIES = BASE_API_URL + 'inventory/';
export const API_URL_PRODUCT_BATCH = BASE_API_URL + 'product_batch/';
export const API_URL_BATCH = BASE_API_URL + 'batch/';
export const API_URL_STORE_LABELS = BASE_API_URL_TESTING + 'stores/labels';
export const API_URL_BATCH_UPDATE_STATUS = API_URL_BATCH + 'update-status/';
export const API_URL_BATCH_BULK_UPDATE_STATUS = BASE_API_URL + 'batches/'
export const API_URL_CREATE_BATCH = BASE_API_URL + 'create_batch';
export const API_URL_SALES = BASE_API_URL + 'sale/';
export const API_URL_STORE_TRANSFER = BASE_API_URL + 'store-transfers';
export const API_URL_STORE_TRANSFER_DETAIL = BASE_API_URL + 'store-transfer-details';
export const API_URL_CREATE_STORE_TRANSFER = BASE_API_URL + 'create-transfer';
