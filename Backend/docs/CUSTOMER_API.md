# Customer API Documentation

## Base URL
```
http://localhost:8000/api/customers
```

## Authentication
All endpoints require authentication. Include JWT token in Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### 1. Create Customer
**POST** `/create`

**Request Body:**
```json
{
  "name": "John Doe",
  "biltyNumber": "BLT2024001",
  "date": "2024-01-15",
  "quantity": 5,
  "paymentStatus": "cash",
  "deliveryType": "delivery_by_distributor",
  "phone": "+1234567890",
  "address": "123 Main St, City",
  "totalAmount": 1500,
  "paidAmount": 1000,
  "notes": "Handle with care"
}
```

**Required Fields:**
- `name` (string)
- `biltyNumber` (string, unique)
- `quantity` (number, min: 1)

**Optional Fields:**
- `date` (date, defaults to current date)
- `paymentStatus` (enum: "cash", "online", "cod", defaults to "cash")
- `deliveryType` (enum: "self_pickup", "delivery_by_distributor", defaults to "delivery_by_distributor")
- `phone` (string)
- `address` (string)
- `totalAmount` (number, defaults to 0)
- `paidAmount` (number, defaults to 0)
- `notes` (string)

**Response:**
```json
{
  "success": true,
  "message": "Customer created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "biltyNumber": "BLT2024001",
    "date": "2024-01-15T00:00:00.000Z",
    "quantity": 5,
    "paymentStatus": "cash",
    "deliveryType": "delivery_by_distributor",
    "phone": "+1234567890",
    "address": "123 Main St, City",
    "totalAmount": 1500,
    "paidAmount": 1000,
    "remainingAmount": 500,
    "status": "active",
    "notes": "Handle with care",
    "createdBy": "507f1f77bcf86cd799439012",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "isFullyPaid": false,
    "paymentPercentage": 67
  }
}
```

### 2. Get All Customers
**GET** `/get/all`

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10)
- `search` (string) - searches in name, bilty number, phone
- `paymentStatus` (string) - filter by payment status
- `deliveryType` (string) - filter by delivery type
- `status` (string) - filter by customer status
- `sortBy` (string, default: "date") - sort field
- `sortOrder` (string, default: "desc") - sort order

**Example:**
```
GET /get/all?page=1&limit=10&search=john&paymentStatus=cash&sortBy=date&sortOrder=desc
```

**Response:**
```json
{
  "success": true,
  "data": [...customers],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalCustomers": 50,
    "hasNext": true,
    "hasPrev": false
  },
  "summary": {
    "totalAmount": 75000,
    "paidAmount": 45000,
    "remainingAmount": 30000
  }
}
```

### 3. Get Customer by ID
**GET** `/get/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "biltyNumber": "BLT2024001",
    ...
    "createdBy": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Admin User",
      "email": "admin@example.com"
    }
  }
}
```

### 4. Update Customer
**PUT** `/update/:id`

**Request Body:** (all fields optional)
```json
{
  "name": "John Smith",
  "paymentStatus": "online",
  "paidAmount": 1500,
  "status": "completed"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Customer updated successfully",
  "data": {...updated_customer}
}
```

### 5. Delete Customer
**DELETE** `/delete/:id`

**Response:**
```json
{
  "success": true,
  "message": "Customer deleted successfully"
}
```

### 6. Get Customer Statistics
**GET** `/stats`

**Response:**
```json
{
  "success": true,
  "data": {
    "totalCustomers": 150,
    "recentCustomers": 25,
    "paymentStatusStats": [
      { "_id": "cash", "count": 80, "totalAmount": 120000, "paidAmount": 90000 },
      { "_id": "online", "count": 50, "totalAmount": 75000, "paidAmount": 70000 },
      { "_id": "cod", "count": 20, "totalAmount": 30000, "paidAmount": 15000 }
    ],
    "deliveryTypeStats": [
      { "_id": "delivery_by_distributor", "count": 120 },
      { "_id": "self_pickup", "count": 30 }
    ],
    "statusStats": [
      { "_id": "active", "count": 100 },
      { "_id": "completed", "count": 45 },
      { "_id": "cancelled", "count": 5 }
    ],
    "financialSummary": {
      "totalAmount": 225000,
      "paidAmount": 175000,
      "remainingAmount": 50000
    }
  }
}
```

### 7. Search Customer by Bilty Number
**GET** `/search/bilty/:biltyNumber`

**Example:**
```
GET /search/bilty/BLT2024001
```

**Response:**
```json
{
  "success": true,
  "data": {...customer_data}
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Name, bilty number, and quantity are required"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Customer not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error creating customer",
  "error": "Detailed error message"
}
```

## Data Types

### Payment Status
- `cash` - Cash payment
- `online` - Online payment
- `cod` - Cash on Delivery

### Delivery Type
- `self_pickup` - Customer will pick up themselves
- `delivery_by_distributor` - Will be delivered by distributor

### Customer Status
- `active` - Active customer
- `completed` - Order completed
- `cancelled` - Order cancelled

## Virtual Fields

The Customer model includes virtual fields:
- `isFullyPaid` (boolean) - True if remainingAmount <= 0
- `paymentPercentage` (number) - Percentage of payment completed (0-100)

## Indexes

The following indexes are created for better performance:
- `biltyNumber` (unique)
- `name`
- `date` (descending)
- `paymentStatus`
- `deliveryType`
- `status`
- `createdBy`