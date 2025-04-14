# 🏋️‍♂️ OpenBench Backend System

> **Real-time gym equipment usage tracker with sensor integration, activity logging, and user authentication.**

![Status](https://img.shields.io/badge/status-in%20development-yellow)
![License](https://img.shields.io/badge/license-private-lightgrey)

---

## 📦 Project Overview

OpenBench is a backend system designed to track **gym equipment usage** in real time using **sensor data** (motion and vibration sensors).  
The system receives data from sensors, logs equipment usage sessions, updates equipment availability, and provides audit trails for all activities.

✅ Real-time sensor-driven updates  
✅ Equipment session tracking and status updates  
✅ Full activity logging for audit & analytics  
✅ Secure user authentication with JWT, MFA, and email verification  
✅ Modular, scalable, and production-ready

---

## 🏗️ Tech Stack

| Layer                  | Technology                                         |
| ---------------------- | -------------------------------------------------- |
| Backend Framework      | Node.js + Express.js (TypeScript)                  |
| Database               | MySQL (local, future AWS RDS ready)                |
| Sensor Communication   | MQTT over TLS, optional API POST for testing       |
| Authentication         | JWT, One-Time Code (MFA), Email Verification       |
| Logging                | Winston (file & console), MySQL activity logs      |
| Environment Management | dotenv                                             |
| Testing & API Client   | Postman                                            |
| Date Handling          | Native JS Date (considering `date-fns` for future) |

---

## 🗄️ Database Structure (Current ✅)

### **users**

| Column                          | Type      | Description                   |
| ------------------------------- | --------- | ----------------------------- |
| id                              | INT       | Primary Key                   |
| username, first_name, last_name | VARCHAR   | User identity                 |
| email                           | VARCHAR   | Unique user email             |
| password                        | VARCHAR   | Hashed password               |
| role                            | VARCHAR   | 'user', 'admin', 'technician' |
| is_verified                     | TINYINT   | Email verified flag           |
| security questions & answers    | VARCHAR   | For password recovery         |
| created_at, updated_at          | TIMESTAMP | Record tracking               |

### **equipment**

| Column               | Type      | Description                     |
| -------------------- | --------- | ------------------------------- |
| equipmentId          | INT       | Primary Key                     |
| name, location, type | VARCHAR   | Equipment details               |
| status               | ENUM      | 'available', 'in_use', 'faulty' |
| usageCount           | INT       | Times used                      |
| lastUsedAt           | DATETIME  | Last usage timestamp            |
| createdAt, updatedAt | TIMESTAMP | Record tracking                 |

### **equipment_usage**

| Column      | Type     | Description         |
| ----------- | -------- | ------------------- |
| usageId     | INT      | Primary Key         |
| equipmentId | INT      | FK to equipment     |
| startTime   | DATETIME | Session start       |
| endTime     | DATETIME | Session end         |
| durationSec | INT      | Duration in seconds |

### **sensor_data**

| Column       | Type     | Description           |
| ------------ | -------- | --------------------- |
| data_id      | INT      | Primary Key           |
| sensor_id    | INT      | Sensor reference      |
| equipment_id | VARCHAR  | Linked equipment      |
| datetime     | DATETIME | Sensor event time     |
| in_use       | TINYINT  | Sensor activity state |

### **activity_logs**

| Column     | Type      | Description            |
| ---------- | --------- | ---------------------- |
| id         | INT       | Primary Key            |
| user_id    | INT       | Linked user (nullable) |
| action     | VARCHAR   | Description of event   |
| details    | TEXT      | More info              |
| ip_address | VARCHAR   | Request origin IP      |
| created_at | TIMESTAMP | Log time               |

---

## 🔒 Security Features

- ✅ JWT Access & Refresh Tokens
- ✅ Email verification flow with expiring tokens
- ✅ Multi-Factor Authentication (One-Time Code)
- ✅ Secure password hashing with bcrypt + optional pepper
- ✅ Rate limiting & Helmet.js for HTTP security headers
- ✅ IP logging for all critical actions
- ✅ Input validation for sensor and user data

---

## 🌐 API Endpoints Overview

| Method | Endpoint                       | Description                         |
| ------ | ------------------------------ | ----------------------------------- |
| POST   | /api/auth/register             | Register new user                   |
| POST   | /api/auth/login                | Login & send OTC                    |
| POST   | /api/auth/verify-otc           | Verify One-Time Code & issue tokens |
| GET    | /api/auth/verify-email         | Verify email via token              |
| POST   | /api/auth/resend-otc           | Resend OTC for login                |
| POST   | /api/auth/refresh-access-token | Refresh JWT access token            |
| POST   | /api/auth/logout               | Logout user                         |
| GET    | /api/equipment                 | List all equipment                  |
| POST   | /api/equipment                 | Create equipment                    |
| PUT    | /api/equipment/:id             | Update equipment                    |
| DELETE | /api/equipment/:id             | Delete equipment                    |
| GET    | /api/equipment/status          | Filter equipment by status          |
| GET    | /api/equipment/usage-summary   | Equipment status counts             |
| POST   | /api/sensors/data              | Sensor data input                   |

---

## 📖 Detailed API Request & Response Reference

### POST /api/auth/register
Registers a new user.

**Request Body:**
```json
{
  "username": "martin",
  "first_name": "Martin",
  "last_name": "Jimenez",
  "email": "martin@example.com",
  "password": "securePassword123",
  "security_question_1": "What is your pet's name?",
  "answer_1": "Fluffy",
  "security_question_2": "What is your favorite color?",
  "answer_2": "Blue"
}
```
Response 201 Created:
{
"message": "User registered successfully. Please verify your email."
}
Response 400 Bad Request:
```
{
"message": "Missing required fields"
}
```
POST /api/auth/login Initiates login, sends OTP.
Request Body:
```
{
"email": "martin@example.com",
"pwd": "securePassword123"
}
```

Response 200 OK:
```
{
"message": "One-time code sent to your email.",
"step": "verify-otc",
"userId": 1
}
```

Response 401 Unauthorized:
```
{
"message": "Invalid email or password."
}
```

POST /api/auth/verify-otc Verifies OTP and issues access token.
Request Body:
```
{
"userId": 1,
"code": "12345678"
}
```

Response 200 OK:
```
{
"accessToken": "JWT_ACCESS_TOKEN"
}
```

GET /api/auth/verify-email?token=xxx Verifies email token.
Response 200 OK:
```
{
"message": "Email successfully verified."
}
```

Response 400 Bad Request:
```
{
"message": "Invalid or expired verification token"
}
```

POST /api/auth/refresh-access-token Refreshes JWT access token.
Headers:
Cookie: refreshToken=<refresh_token>
Response 200 OK:
```
{
"accessToken": "NEW_JWT_ACCESS_TOKEN"
}
```

GET /api/equipment Fetch all equipment.
Headers:
Authorization: Bearer <accessToken>
Response 200 OK:
```
[
{
"equipmentId": 1,
"name": "Bench Press",
"status": "available",
"location": "Room A",
"type": "Strength",
"usageCount": 5,
"lastUsedAt": "2025-04-10 12:00:00"
}
]
```

POST /api/equipment Create equipment.
Request Body:
```
{
"name": "Treadmill 1",
"location": "Room A",
"type": "Cardio",
"status": "available"
}
```

Response 201 Created:
```
{
"message": "Equipment created successfully"
}
```

PUT /api/equipment/:id Update equipment.
Request Body:
```
{
"name": "Updated Equipment",
"location": "Room B",
"type": "Cardio",
"status": "available"
}
```

Response 200 OK:
```
{
"message": "Equipment updated successfully"
}
```

DELETE /api/equipment/:id Delete equipment.
Response 200 OK:
```
{
"message": "Equipment deleted successfully"
}
```

POST /api/sensors/data Simulate sensor activity.
Request Body:
```
{
"sensorId": 1,
"equipmentId": 2,
"timestamp": "2025-04-10T12:00:00Z",
"activity": true
}
```

Response 201 Created:
```
{
"message": "Sensor data processed successfully"
}
```

Response 400 Bad Request:
```
{
"message": "Missing or invalid sensor data fields"
}
```

📊 Logging
Every major action is logged in:

✅ activity_logs table

✅ Console (development) via Winston

✅ Future (optional): File and external log services

Tracked:

User authentication events

Sensor activity

Equipment CRUD operations

Usage sessions start/end

🛠️ Setup & Development
1. Install dependencies
   npm install

2. Create .env file
   SMTP_HOST=<smtp>
   SMTP_PORT=587
   SMTP_USER=<user>
   SMTP_PASS=<pass>
   EMAIL_FROM=<email>
   APP_URL=http://localhost:5001
   PEPPER_SECRET=<pepper>
   JWT_ACCESS_SECRET=<secret>
   JWT_REFRESH_SECRET=<secret>

3. Run development server:
   npm run dev

4. Test API:

- Use Postman
- Flow: register -> verify email -> login -> verify-otc -> use JWT

Contributing:
This project is in active development.
Contributions, testing, and feedback are welcome!

License:
Private educational and professional project.

Author:
Martin Jimenez
Backend Developer — Node.js, TypeScript, MySQL, and AWS enthusiast 🚀
