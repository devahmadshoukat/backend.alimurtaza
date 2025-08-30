# A. Ali Murtaza Store API

A comprehensive REST API for managing products and stock for an e-commerce store.

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm run dev
   ```

3. **Server will be running on:** `http://localhost:4000`

## 📋 Available Endpoints

### Health & Documentation
- `GET /api/health` - Health check
- `GET /api` - API documentation

### Products
- `GET /api/products` - Get all products with filtering
- `GET /api/products/gender/:gender` - Get products by gender (men/women/kids/baby)
- `POST /api/products` - Create new product
- `GET /api/products/id/:id` - Get product by ID
- `GET /api/products/slug/:slug` - Get product by slug
- `GET /api/products/sku/:sku` - Get product by SKU
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Soft delete product
- `PATCH /api/products/:id/restore` - Restore soft deleted product
- `GET /api/products/deleted/all` - Get all soft deleted products
- `PATCH /api/products/:id/stock` - Update product stock
- `GET /api/products/featured/all` - Get featured products
- `GET /api/products/search/:query` - Search products
- `GET /api/products/analytics/overview` - Get product analytics
- `PATCH /api/products/bulk/stock` - Bulk stock update

### Stock Management
- `PATCH /api/stock/:productId` - Update product stock
- `GET /api/stock/:productId/info` - Get stock information
- `GET /api/stock/:productId/check` - Check variant stock
- `PATCH /api/stock/bulk/update` - Bulk stock update
- `GET /api/stock/low-stock` - Get low stock products
- `GET /api/stock/out-of-stock` - Get out of stock products
- `GET /api/stock/analytics/overview` - Get stock analytics
- `POST /api/stock/recalculate-all` - Recalculate all stock
- `GET /api/stock/:productId/history` - Get stock history
- `GET /api/stock/alerts` - Get stock alerts

## 🛠️ Tools

### Postman Collection
Import `A_Ali_Murtaza_Store_API.postman_collection.json` into Postman for easy API testing.

### Command Line Product Creator
Use the interactive command-line tool to create products:

```bash
npm run add-product
```

This will guide you through creating a product step by step.

### Frontend Integration
See `frontend-integration-example.js` for complete examples of how to integrate the API with your React/Next.js frontend.

**Quick Examples:**

```javascript
// Get men's products
const menProducts = await fetch('/api/products/gender/men');

// Get product by slug
const product = await fetch('/api/products/slug/premium-cotton-shirt');

// Get all products with filters
const products = await fetch('/api/products?gender=men&category=shirts&minPrice=1000&maxPrice=5000');
```

## 🔄 Soft Delete Conflict Resolution

When you delete a product (soft delete), it's marked as inactive but remains in the database. If you try to create a product with the same name, you'll get a duplicate error.

### Solutions:

1. **Restore the existing product:**
   ```json
   POST /api/products
   {
     "name": "Premium Cotton Shirt",
     "restore": true,
     "price": { "current": 2999 },
     "category": { "gender": "men", "type": ["shirts"] },
     // ... other fields
   }
   ```

2. **Create a new product with modified name:**
   ```json
   POST /api/products
   {
     "name": "Premium Cotton Shirt",
     "price": { "current": 2999 },
     "category": { "gender": "men", "type": ["shirts"] },
     // ... other fields
   }
   ```
   The API will automatically append a timestamp to avoid conflicts.

3. **View soft deleted products:**
   ```bash
   GET /api/products/deleted/all
   ```

4. **Restore a specific product:**
   ```bash
   PATCH /api/products/:id/restore
   ```

## 📊 Product Structure

```json
{
  "name": "Product Name",
  "price": {
    "current": 2999,
    "old": 3999,
    "discountPercentage": 25
  },
  "category": {
    "gender": "men",
    "type": ["shirts", "casual"],
    "colors": [
      {
        "colorName": "White",
        "images": ["image1.jpg", "image2.jpg"],
        "sizes": [
          {
            "name": "M",
            "stock": 20,
            "sku": "MS-WH-M"
          }
        ]
      }
    ]
  },
  "media": {
    "thumbnail": "thumbnail.jpg"
  },
  "fabricImages": ["fabric1.jpg", "fabric2.jpg"],
  "isFeatured": true,
  "isActive": true,
  "tags": ["premium", "cotton"]
}
```

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
MONGODB_URI=mongodb://localhost:27017/store
NODE_ENV=development
```

## 📝 Notes

- Prices are stored in cents (2999 = $29.99)
- Products use soft delete (marked as inactive, not removed from database)
- Stock is automatically calculated from color/size variants
- SKUs are auto-generated for each variant
- Slugs are auto-generated from product name and category

## 🐛 Troubleshooting

### "Duplicate entry" error when creating products
This happens when trying to create a product with the same name as a soft-deleted product. Use the `restore: true` parameter or let the API create a new product with a modified name.

### Server won't start
Make sure MongoDB is running and the connection string is correct in your `.env` file.

### Route not found
Check that you're using the correct endpoint path. Both `/api/products` and `/api/product` work for product endpoints.
