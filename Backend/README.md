# Cargo Lingo Dashboard Backend API

## Shipment Management API

### Base URL
```
http://localhost:8000/api
```

### Authentication
All shipment endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Shipment Endpoints

#### 1. Create Shipment
- **POST** `/shipments/create`
- **Description**: Create a new shipment/bilty
- **Body**:
```json
{
  "biltyNumber": "BLT-2024-001",
  "senderName": "Ahmed Khan",
  "addaName": "Karachi Central",
  "cityName": "Karachi",
  "receiverName": "Fatima Ali",
  "receiverPhone": "0300-1234567",
  "receiverAddress": "House #123, Street 5, Lahore",
  "paymentStatus": "unpaid",
  "phoneNumber": "0300-1234567",
  "items": [
    {
      "description": "Electronics",
      "quantity": 2,
      "unitFare": 1000,
      "totalFare": 2000
    }
  ],
  "mazdoori": 150,
  "biltyCharges": 50,
  "reriCharges": 100,
  "extraCharges": 0,
  "receivedFare": 0,
  "deliveryStatus": "pending",
  "dateTime": "2024-01-15 10:30",
  "vehicleNumber": "ABC-123",
  "driverName": "Muhammad Hassan",
  "pickupType": "delivery"
}
```

#### 2. Get All Shipments
- **GET** `/shipments/get/all`
- **Description**: Get all shipments with optional filters
- **Query Parameters**:
  - `search`: Search in bilty number, sender name, receiver name
  - `status`: Filter by delivery status (pending, delivered, returned)
  - `paymentStatus`: Filter by payment status (paid, unpaid)

#### 3. Get Shipment by ID
- **GET** `/shipments/get/:id`
- **Description**: Get a specific shipment by its ID

#### 4. Update Shipment
- **PUT** `/shipments/update/:id`
- **Description**: Update an existing shipment
- **Body**: Same as create shipment (all fields optional)

#### 5. Delete Shipment
- **DELETE** `/shipments/delete/:id`
- **Description**: Delete a shipment

### Authentication Endpoints

#### 1. Register User
- **POST** `/auth/register`
- **Body**:
```json
{
  "name": "User Name",
  "email": "user@example.com",
  "password": "password123",
  "phone": "0300-1234567",
  "address": "User Address",
  "answer": "Security Answer"
}
```

#### 2. Login User
- **POST** `/auth/login`
- **Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Response Format
All API responses follow this format:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in `.env`:
```
PORT=8000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

3. Start the server:
```bash
npm start
```

## Database Schema

### Shipment Model
- `biltyNumber`: Unique bilty number
- `senderName`: Sender's name
- `addaName`: Adda name
- `cityName`: City name
- `receiverName`: Receiver's name
- `receiverPhone`: Receiver's phone
- `receiverAddress`: Receiver's address
- `paymentStatus`: paid/unpaid
- `phoneNumber`: Sender's phone
- `items`: Array of shipment items
- `totalFare`: Total fare amount
- `mazdoori`: Mazdoori charges
- `biltyCharges`: Bilty charges
- `reriCharges`: Reri charges
- `extraCharges`: Extra charges
- `receivedFare`: Received fare amount
- `remainingFare`: Remaining fare amount
- `deliveryStatus`: delivered/pending/returned
- `dateTime`: Date and time
- `vehicleNumber`: Vehicle number (optional)
- `driverName`: Driver name (optional)
- `pickupType`: self/delivery
- `createdBy`: Reference to user who created the shipment 