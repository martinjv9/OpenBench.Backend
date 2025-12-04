# CLAUDE.md - OpenBench Backend System Guide

> **Comprehensive guide for AI assistants working with the OpenBench Backend codebase**

## Table of Contents
- [Project Overview](#project-overview)
- [Technology Stack](#technology-stack)
- [Codebase Architecture](#codebase-architecture)
- [Directory Structure](#directory-structure)
- [Core Patterns & Conventions](#core-patterns--conventions)
- [Authentication & Security](#authentication--security)
- [Database Models](#database-models)
- [API Endpoints](#api-endpoints)
- [Development Workflows](#development-workflows)
- [Common Tasks](#common-tasks)
- [Important Notes for AI Assistants](#important-notes-for-ai-assistants)

---

## Project Overview

OpenBench is a **real-time gym equipment usage tracker** with sensor integration, activity logging, and secure user authentication. The system receives data from IoT sensors (motion/vibration), logs equipment usage sessions, updates availability status, and provides comprehensive audit trails.

**Key Features:**
- Real-time sensor-driven equipment monitoring via MQTT
- WebSocket updates for live dashboard (Socket.io)
- Secure multi-factor authentication (JWT + OTC)
- Email verification flow
- Role-based access control (user, admin, technician)
- Comprehensive activity logging for audit trails
- Equipment session tracking and analytics

**Author:** Martin Jimenez
**Status:** Active Development
**License:** Private Educational Project

---

## Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Runtime | Node.js + TypeScript | Type-safe backend |
| Framework | Express.js | RESTful API server |
| Database | MySQL (mysql2) | Relational data storage |
| Authentication | JWT + bcrypt | Secure auth with MFA |
| Sensor Communication | MQTT over TLS | IoT device integration |
| Real-time Updates | Socket.io | WebSocket connections |
| Email | Nodemailer + Handlebars | SMTP with templates |
| Logging | Winston | Structured logging with rotation |
| Security | Helmet + express-rate-limit | Headers & DoS protection |
| Validation | express-validator + validator | Input sanitization |

---

## Codebase Architecture

### Architectural Pattern: MVC-like with Services

```
Request Flow:
Client → Route → Middleware → Controller → Model/Service → Database
                     ↓                          ↓
                  Auth/Role               Business Logic
                  Validation              External APIs
```

**Key Principles:**
1. **Separation of Concerns:** Routes define endpoints, controllers handle logic, models manage data
2. **Middleware Chain:** Authentication → Authorization → Validation → Controller
3. **Centralized Services:** Email, logging, MQTT, error handling abstracted to services
4. **Type Safety:** Strict TypeScript throughout, interfaces for all data structures
5. **Error Handling:** Centralized error handler with Winston logging

---

## Directory Structure

```
/home/user/OpenBench.Backend/
├── src/
│   ├── config/                    # Configuration files
│   │   ├── db.ts                 # MySQL connection pool
│   │   ├── jwtConfig.ts          # JWT secrets & expiration
│   │   └── httpsConfig.ts        # SSL/TLS certificates
│   │
│   ├── controllers/              # Request handlers (thin layer)
│   │   ├── adminController.ts    # Admin operations
│   │   ├── dashboardController.ts # Dashboard analytics
│   │   ├── equipmentController.ts # Equipment CRUD
│   │   ├── loginController.ts    # Step 1: Login + OTC send
│   │   ├── logoutController.ts   # Token cleanup
│   │   ├── refreshTokenController.ts # JWT refresh
│   │   ├── registerController.ts # User registration
│   │   ├── resendOTCController.ts # Resend MFA code
│   │   ├── sensorController.ts   # Sensor data processing
│   │   ├── usageController.ts    # Usage analytics
│   │   ├── veriftyOTCController.ts # Step 2: OTC verify + tokens
│   │   └── verifyEmailController.ts # Email confirmation
│   │
│   ├── models/                   # Data layer (database queries)
│   │   ├── EquipmentModel.ts    # Equipment CRUD & analytics
│   │   ├── LoggingModel.ts      # Activity log retrieval
│   │   ├── OneTimeCodeModel.ts  # MFA code storage
│   │   ├── SensorData.ts        # Sensor data & session mgmt
│   │   ├── SensorModel.ts       # Sensor metadata
│   │   ├── UserModel.ts         # User CRUD operations
│   │   └── VerificationTokenModel.ts # Email tokens
│   │
│   ├── routes/                   # Route definitions
│   │   ├── adminRoutes.ts       # Admin-only endpoints
│   │   ├── authRoutes.ts        # Authentication flow
│   │   ├── dashboardRoutes.ts   # Dashboard data
│   │   ├── equipmentRoutes.ts   # Equipment management
│   │   ├── loginRoutes.ts       # Login endpoints
│   │   ├── sensorRoutes.ts      # Sensor data input
│   │   └── usageRoutes.ts       # Usage statistics
│   │
│   ├── services/                 # Business logic & external integrations
│   │   ├── activityLogsService.ts # Audit trail logging
│   │   ├── emailService.ts      # Nodemailer + templates
│   │   ├── errorHandler.ts      # Centralized error responses
│   │   ├── loggingService.ts    # Winston configuration
│   │   └── mqttService.ts       # MQTT client & message handling
│   │
│   ├── middlewares/              # Express middleware
│   │   ├── authMiddleware.ts    # JWT verification
│   │   └── roleMiddleware.ts    # RBAC authorization
│   │
│   ├── utils/                    # Helper functions
│   │   ├── dateUtils.ts         # Date formatting
│   │   ├── generateMFACode.ts   # 8-digit OTC generation
│   │   ├── generateToken.ts     # Random token creation
│   │   └── jwtUtils.ts          # JWT sign/verify helpers
│   │
│   ├── templates/                # Email templates (Handlebars)
│   │   ├── otcEmail.hbs         # MFA code email
│   │   └── verificationEmail.hbs # Email verification
│   │
│   └── server.ts                 # Application entry point
│
├── dist/                         # Compiled JavaScript (gitignored)
├── logs/                         # Winston log files (gitignored)
├── node_modules/                 # Dependencies (gitignored)
├── .env                          # Environment variables (gitignored)
├── .gitignore
├── package.json                  # Dependencies & scripts
├── tsconfig.json                # TypeScript configuration
└── README.md                     # Project documentation
```

---

## Core Patterns & Conventions

### 1. Naming Conventions

**Files:**
- Controllers: `{domain}Controller.ts` (e.g., `loginController.ts`)
- Models: `{Entity}Model.ts` (e.g., `UserModel.ts`)
- Routes: `{domain}Routes.ts` (e.g., `authRoutes.ts`)
- Services: `{purpose}Service.ts` (e.g., `emailService.ts`)
- Utilities: `{function}Utils.ts` or `generate{Thing}.ts`

**Functions:**
- Controllers: `camelCase` verbs (`createEquipment`, `loginUser`)
- Models: `camelCase` with CRUD prefixes (`findUserByEmail`, `getEquipment`)
- Use descriptive names that indicate action and entity

**Variables:**
- `camelCase` for local variables (`userId`, `accessToken`)
- `SCREAMING_SNAKE_CASE` for constants (`JWT_SECRET`, `MQTT_BROKER`)
- Interfaces use `PascalCase` (`User`, `SensorData`)

### 2. Import/Export Patterns

**Named exports** for utilities and models:
```typescript
// Export
export const findUserByEmail = async (email: string) => {...}

// Import
import { findUserByEmail, findUserById } from "../models/UserModel";
```

**Default exports** for controllers and routers:
```typescript
// Export
export default registerUser;

// Import
import registerUser from "../controllers/registerController";
```

### 3. Controller Pattern

Controllers are **thin request handlers** that follow this structure:

```typescript
export const controllerName = async (req: Request, res: Response) => {
  // 1. Extract and validate input
  const { field1, field2 } = req.body;

  if (!field1 || !field2) {
    res.status(400).json({ message: "Missing required fields" });
    return;
  }

  // 2. Try-catch for error handling
  try {
    // 3. Call model/service functions
    const result = await Model.operation(field1, field2);

    // 4. Log activity
    await logActivity(req.user?.id || null, "Action", "Details", req.ip as string);

    // 5. Return response
    res.status(200).json({ message: "Success", data: result });
  } catch (error) {
    // 6. Centralized error handling
    handleError(res, error, "Error message");
  }
};
```

**Key Points:**
- Always validate input before processing
- Use `try-catch` for all async operations
- Log important actions via `activityLogsService`
- Use centralized `handleError` from `errorHandler.ts`
- Use early returns for validation failures
- Explicit return type of `void` (implicit) or `Promise<void>`

### 4. Model Pattern

Models handle **database operations only**:

```typescript
export const modelFunction = async (param: Type): Promise<ReturnType | null> => {
  try {
    const [result]: any = await pool.query(
      "SELECT * FROM table WHERE field = ?",
      [param]
    );

    if (result.length === 0) return null;
    return result[0] as ReturnType;
  } catch (error) {
    logger.error("Error in modelFunction", { error });
    throw error; // Or return null depending on use case
  }
};
```

**Key Points:**
- Use parameterized queries (?) to prevent SQL injection
- Always use try-catch
- Log errors with Winston
- Return `null` for not found, throw for actual errors
- Type cast results appropriately

### 5. Route Pattern

Routes define endpoint structure with middleware chains:

```typescript
import express from "express";
import { authenticateToken } from "../middlewares/authMiddleware";
import { authorizeRoles } from "../middlewares/roleMiddleware";
import { controller1, controller2 } from "../controllers/domainController";

const router = express.Router();

// Public route
router.post("/public-endpoint", controller1);

// Protected route
router.get("/protected-endpoint", authenticateToken, controller2);

// Admin-only route
router.delete(
  "/admin-endpoint/:id",
  authenticateToken,
  authorizeRoles("admin"),
  controller3
);

export default router;
```

**Middleware Order:**
1. Rate limiting (applied in `server.ts`)
2. Authentication (`authenticateToken`)
3. Authorization (`authorizeRoles`)
4. Controller function

### 6. Response Format Conventions

**Success Responses:**
```typescript
// Simple success
res.status(200).json({ message: "Operation successful" });

// Success with data
res.status(200).json({ message: "Success", data: result });

// Creation
res.status(201).json({ message: "Created", id: insertId });

// Direct data return for GET requests
res.status(200).json(arrayOrObject);
```

**Error Responses:**
```typescript
// Validation error (400)
res.status(400).json({ message: "Missing required fields" });

// Unauthorized (401)
res.status(401).json({ message: "Invalid credentials" });

// Forbidden (403)
res.status(403).json({ message: "Access denied" });

// Not found (404)
res.status(404).json({ message: "Resource not found" });

// Conflict (409)
res.status(409).json({ message: "Resource already exists" });

// Server error (500) - use handleError()
handleError(res, error, "Custom error message");
```

### 7. TypeScript Patterns

**Interfaces for data structures:**
```typescript
export interface EntityName {
  id?: number;          // Optional for creation
  requiredField: string;
  optionalField?: string;
  created_at?: Date;
}
```

**Type assertions for database results:**
```typescript
const [rows]: any = await pool.query("SELECT ...");
return rows[0] as EntityType;
```

**Module augmentation for Express:**
```typescript
// In authMiddleware.ts
declare module "express-serve-static-core" {
  interface Request {
    user?: DecodedUser;
  }
}
```

**Explicit return types:**
```typescript
export const functionName = async (param: Type): Promise<ReturnType> => {
  // Implementation
};
```

---

## Authentication & Security

### 1. Multi-Factor Authentication Flow

**Complete authentication requires TWO steps:**

#### Step 1: Login & OTC Send (`loginController.ts`)
```typescript
POST /api/auth/login
Body: { email, pwd }

Process:
1. Validate email/password against database
2. Compare password: bcrypt.compare(pwd + PEPPER, user.password)
3. Generate 8-digit OTC via crypto.randomBytes
4. Hash OTC with bcrypt and store in DB (5min expiration)
5. Send OTC via email
6. Return: { message, step: "verify-otc", userId }
```

#### Step 2: Verify OTC & Issue Tokens (`veriftyOTCController.ts`)
```typescript
POST /api/auth/verify-otc
Body: { userId, code }

Process:
1. Fetch hashed OTC from database
2. Verify expiration time
3. Compare: bcrypt.compare(code, hashedCode)
4. Delete OTC from database
5. Generate access token (15m) + refresh token (7d)
6. Set refresh token in HTTP-only cookie
7. Return: { accessToken, role }
```

### 2. JWT Implementation

**Token Types:**
- **Access Token:** Short-lived (15m default), sent in response body
- **Refresh Token:** Long-lived (7d default), stored in HTTP-only cookie

**Access Token Payload:**
```typescript
{
  userId: number,
  email: string,
  role: string,
  iat: number,
  exp: number
}
```

**Token Generation** (`jwtUtils.ts`):
```typescript
import jwt from "jsonwebtoken";
import { JWT_SECRET, REFRESH_TOKEN_SECRET } from "../config/jwtConfig";

export const generateAccessToken = (userId: number, email: string, role: string): string => {
  return jwt.sign({ userId, email, role }, JWT_SECRET, { expiresIn: "15m" });
};

export const generateRefreshToken = (userId: number, email: string, role: string): string => {
  return jwt.sign({ userId, email, role }, REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
};
```

**Token Verification** (`authMiddleware.ts`):
```typescript
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1]; // "Bearer TOKEN"

  if (!token) {
    res.status(401).json({ message: "Access token required" });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      res.status(403).json({ message: "Invalid or expired token" });
      return;
    }
    req.user = decoded as DecodedUser;
    next();
  });
};
```

**Token Refresh Flow** (`refreshTokenController.ts`):
```typescript
POST /api/auth/refresh
Cookie: refreshToken=xxx

Process:
1. Extract refresh token from cookie
2. Verify with REFRESH_TOKEN_SECRET
3. Generate new access token
4. Return new access token
```

### 3. Email Verification Flow

**Registration** (`registerController.ts`):
```typescript
POST /api/auth/register

Process:
1. Validate all required fields
2. Hash password + security answers (bcrypt + pepper)
3. Create user in database (is_verified = 0)
4. Generate 64-character hex token
5. Store token with 24h expiration
6. Send verification email with link
7. Return success message
```

**Verification** (`verifyEmailController.ts`):
```typescript
GET /api/auth/verify-email?token=xxx

Process:
1. Find token in database
2. Check expiration
3. Update user.is_verified = 1
4. Delete verification token
5. Redirect to frontend with status
```

### 4. Password Security

**Hashing Strategy:** bcrypt + pepper + salt

```typescript
const PEPPER_SECRET = process.env.PEPPER_SECRET || "";
const SALT_ROUNDS = 12;

// Hashing
const salt = await bcrypt.genSalt(SALT_ROUNDS);
const hashedPassword = await bcrypt.hash(password + PEPPER_SECRET, salt);

// Verification
const isValid = await bcrypt.compare(password + PEPPER_SECRET, hashedPassword);
```

**Security answers** are also hashed for account recovery.

### 5. Role-Based Access Control (RBAC)

**Roles:** `user`, `admin`, `technician`

**Authorization Middleware** (`roleMiddleware.ts`):
```typescript
export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      res.status(403).json({ message: "Access denied: insufficient rights" });
      return;
    }
    next();
  };
};
```

**Usage in routes:**
```typescript
router.delete(
  "/equipment/:id",
  authenticateToken,
  authorizeRoles("admin", "technician"),
  deleteEquipment
);
```

### 6. Rate Limiting

**Login Protection** (10 attempts per 15 minutes):
```typescript
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many login attempts, please try again later"
});
app.use("/api/auth/login", authLimiter);
```

**Registration Protection** (20 attempts per 15 minutes):
```typescript
const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many registration attempts, please try again later"
});
app.use("/api/auth/register", registerLimiter);
```

### 7. Additional Security Measures

- **Helmet.js:** Security headers (CSP, HSTS, etc.)
- **CORS:** Strict origin whitelist from `FRONTEND_URL`
- **HTTP-only cookies:** Refresh tokens not accessible via JavaScript
- **Secure cookies:** HTTPS-only in production
- **Input validation:** express-validator + validator.js
- **SQL injection prevention:** Parameterized queries
- **Activity logging:** All critical actions logged with IP address

---

## Database Models

### User Model (`UserModel.ts`)

**Table:** `users`

**Interface:**
```typescript
interface User {
  id?: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  security_question_1: string;
  answer_1: string;
  security_question_2: string;
  answer_2: string;
  role: string; // 'user' | 'admin' | 'technician'
  is_verified: number; // 0 or 1
  created_at?: Date;
  updated_at?: Date;
}
```

**Key Functions:**
- `createUser(user: User): Promise<number>` - Returns insertId
- `findUserByEmail(email: string): Promise<User | null>`
- `findUserByUsername(username: string): Promise<User | null>`
- `findUserById(id: number): Promise<User | null>`
- `getAllUsers(): Promise<User[]>` - Admin only

### Equipment Model (`EquipmentModel.ts`)

**Table:** `equipment`

**Fields:**
- `equipmentId` (INT, PK)
- `name` (VARCHAR)
- `location` (VARCHAR)
- `type` (VARCHAR)
- `status` (ENUM: 'available', 'in_use', 'faulty')
- `usageCount` (INT)
- `lastUsedAt` (DATETIME)
- `createdAt`, `updatedAt` (TIMESTAMP)

**Key Functions:**
- `createEquipment(name, location, type): Promise<number>`
- `getEquipment(): Promise<Equipment[]>` - All equipment
- `getEquipmentByStatus(status): Promise<Equipment[]>`
- `getEquipmentUsageSummary()` - GROUP BY status with counts
- `updateEquipment(id, fields)` - Dynamic field updates
- `deleteEquipment(id): Promise<boolean>`
- `getEquipmentStats()` - JOIN with equipment_usage

**Dynamic Update Pattern:**
```typescript
const updateEquipment = async (id: number, fields: Partial<Equipment>) => {
  const updates: string[] = [];
  const values: any[] = [];

  if (fields.name !== undefined) {
    updates.push("name = ?");
    values.push(fields.name);
  }
  // ... more fields

  values.push(id);
  const query = `UPDATE equipment SET ${updates.join(", ")} WHERE equipmentId = ?`;
  await pool.query(query, values);
};
```

### Sensor Models

**SensorData.ts:**
```typescript
interface SensorData {
  sensorId: number;
  equipmentId: string;
  timestamp: string;
  activity: boolean;
}
```

**Functions:**
- `storeData(data: SensorData)` - Inserts sensor reading
- `startUsageSession(equipmentId)` - Creates usage record, sets status='in_use'
- `endUsageSession(equipmentId)` - Calculates duration, increments usageCount

**SensorModel.ts:**
- `getSensorInfo()` - Returns sensor metadata (ID, battery, lastPing)

### Authentication Models

**OneTimeCodeModel.ts:**
```typescript
interface OneTimeCode {
  userId: number;
  codeHash: string;
  expiresAt: Date;
}
```

**Functions:**
- `createOneTimeCode(userId, expiresInMinutes=5): Promise<string>` - Returns plain code
- `findOneTimeCodebyUserId(userId): Promise<OneTimeCode | null>`
- `deleteOneTimeCode(userId): Promise<void>`

**VerificationTokenModel.ts:**
```typescript
interface VerificationToken {
  user_id: number;
  token: string; // 64-char hex
  expiresAt: Date;
}
```

**Functions:**
- `createVerificationToken({ user_id, token, expiresAt })`
- `findVerificationToken(token): Promise<VerificationToken | null>`
- `deleteVerificationToken(token)`

### Logging Model (`LoggingModel.ts`)

**Table:** `activity_logs`

**Fields:**
- `id` (INT, PK)
- `user_id` (INT, nullable)
- `action` (VARCHAR) - e.g., "Login", "Create Equipment"
- `details` (TEXT) - Additional information
- `ip_address` (VARCHAR)
- `created_at` (TIMESTAMP)

**Function:**
- `getActivityLogs(limit=100)` - LEFT JOIN with users, ordered by created_at DESC

---

## API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | Public | Register new user |
| POST | `/login` | Public | Step 1: Validate credentials, send OTC |
| POST | `/verify-otc` | Public | Step 2: Verify OTC, issue tokens |
| GET | `/verify-email?token=xxx` | Public | Verify email via token |
| POST | `/resend-otc` | Public | Resend MFA code |
| POST | `/refresh` | Cookie | Refresh access token |
| POST | `/logout` | JWT | Logout and cleanup |

### Equipment Routes (`/api/equipment`)

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/` | JWT | All | List all equipment |
| POST | `/` | JWT | Admin, Technician | Create equipment |
| PUT | `/:id` | JWT | Admin, Technician | Update equipment |
| DELETE | `/:id` | JWT | Admin | Delete equipment |
| GET | `/status?status=available` | JWT | All | Filter by status |
| GET | `/usage-summary` | JWT | All | Equipment status counts |

### Sensor Routes (`/api/sensors`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/data` | Public | Receive sensor data (also via MQTT) |

### Dashboard Routes (`/api/dashboard`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/summary` | JWT | Dashboard statistics |
| GET | `/equipment-stats` | JWT | Equipment usage analytics |

### Admin Routes (`/api/admin`)

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/users` | JWT | Admin | List all users |
| GET | `/activity-logs` | JWT | Admin | Activity audit trail |

---

## Development Workflows

### 1. Environment Setup

**Required `.env` file:**
```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=openbench
DB_PORT=3306

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your_refresh_token_secret_here
REFRESH_TOKEN_EXPIRES_IN=7d

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=noreply@openbench.com

# Application
PORT=3000
NODE_ENV=development
APP_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173
CLIENT_URL=http://localhost:5173

# Security
PEPPER_SECRET=your_pepper_secret_here
BCRYPT_SALT_ROUNDS=12

# MQTT (optional for sensor testing)
MQTT_BROKER=mqtt://localhost:1883
```

### 2. Installation & Running

```bash
# Install dependencies
npm install

# Development with auto-reload
npm run dev

# Build TypeScript
npm run build

# Production
npm start
```

**Scripts:**
- `npm run dev` - Runs `nodemon --exec ts-node src/server.ts`
- `npm run build` - Compiles TypeScript to `dist/`, copies templates
- `npm start` - Runs compiled JavaScript from `dist/server.js`

### 3. Database Setup

**Create tables** (SQL schema not included in repo):

Required tables:
- `users`
- `equipment`
- `equipment_usage`
- `sensor_data`
- `sensors`
- `activity_logs`
- `one_time_codes`
- `verification_tokens`
- `email_logs`

**Connection** (`config/db.ts`):
```typescript
import mysql from "mysql2/promise";

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
```

### 4. Testing Flow

**Manual API testing** (use Postman):

1. **Register User:**
   ```
   POST /api/auth/register
   Body: { username, first_name, last_name, email, password, security questions }
   ```

2. **Verify Email:**
   ```
   GET /api/auth/verify-email?token=xxx
   (Token sent to email)
   ```

3. **Login (Step 1):**
   ```
   POST /api/auth/login
   Body: { email, pwd }
   Response: { userId, step: "verify-otc" }
   ```

4. **Verify OTC (Step 2):**
   ```
   POST /api/auth/verify-otc
   Body: { userId, code }
   (Code sent to email)
   Response: { accessToken, role }
   ```

5. **Use Protected Endpoints:**
   ```
   GET /api/equipment
   Header: Authorization: Bearer <accessToken>
   ```

6. **Refresh Token:**
   ```
   POST /api/auth/refresh
   Cookie: refreshToken=xxx (set automatically)
   Response: { accessToken }
   ```

**No automated tests** are currently implemented.

### 5. Logging

**Winston Configuration** (`services/loggingService.ts`):
- **Console:** Development logs (colorized, timestamp)
- **File (combined):** All logs, rotated daily, max 20MB, keep 14 days
- **File (error):** Error-only logs, same rotation

**Usage:**
```typescript
import logger from "./services/loggingService";

logger.info("Operation successful", { data });
logger.error("Operation failed", { error });
logger.warn("Potential issue", { details });
```

**Log Location:** `/logs/` directory (gitignored)

### 6. MQTT Sensor Integration

**MQTT Service** (`services/mqttService.ts`):
- Connects to broker on startup
- Subscribes to `sensors/data` topic
- Processes messages via `sensorController`

**Message Format:**
```json
{
  "sensorId": 1,
  "equipmentId": "BENCH_001",
  "timestamp": "2025-04-10T12:00:00Z",
  "activity": true
}
```

**Behavior:**
- `activity: true` → Start usage session, set status='in_use'
- `activity: false` → End usage session, calculate duration, set status='available'

**Socket.io Broadcast:** Equipment status changes trigger real-time updates:
```typescript
io.emit("equipmentStatusUpdate", { equipmentId, status });
```

---

## Common Tasks

### Adding a New Endpoint

**Example: Add GET `/api/equipment/faulty`**

1. **Create controller function** (`equipmentController.ts`):
```typescript
export const getFaultyEquipment = async (req: Request, res: Response) => {
  try {
    const equipment = await EquipmentModel.getEquipmentByStatus('faulty');
    res.status(200).json(equipment);
  } catch (error) {
    handleError(res, error, "Error fetching faulty equipment");
  }
};
```

2. **Add route** (`equipmentRoutes.ts`):
```typescript
import { getFaultyEquipment } from "../controllers/equipmentController";

router.get("/faulty", authenticateToken, getFaultyEquipment);
```

3. **Test with Postman:**
```
GET http://localhost:3000/api/equipment/faulty
Header: Authorization: Bearer <token>
```

### Adding a New Database Model

**Example: Create `MaintenanceModel.ts`**

1. **Define interface:**
```typescript
export interface Maintenance {
  id?: number;
  equipmentId: number;
  description: string;
  performedBy: number; // user_id
  performedAt: Date;
}
```

2. **Create CRUD functions:**
```typescript
import { pool } from "../config/db";
import logger from "../services/loggingService";

export const createMaintenance = async (data: Maintenance): Promise<number> => {
  try {
    const [result]: any = await pool.query(
      "INSERT INTO maintenance (equipmentId, description, performedBy) VALUES (?, ?, ?)",
      [data.equipmentId, data.description, data.performedBy]
    );
    return result.insertId;
  } catch (error) {
    logger.error("Error creating maintenance record", { error });
    throw error;
  }
};

export const getMaintenanceHistory = async (equipmentId: number): Promise<Maintenance[]> => {
  try {
    const [rows]: any = await pool.query(
      "SELECT * FROM maintenance WHERE equipmentId = ? ORDER BY performedAt DESC",
      [equipmentId]
    );
    return rows as Maintenance[];
  } catch (error) {
    logger.error("Error fetching maintenance history", { error });
    throw error;
  }
};
```

3. **Create controller** (`maintenanceController.ts`)
4. **Create routes** (`maintenanceRoutes.ts`)
5. **Register routes** in `server.ts`

### Adding Email Template

**Example: Password reset email**

1. **Create template** (`src/templates/passwordReset.hbs`):
```handlebars
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; }
    .button { background-color: #4CAF50; color: white; padding: 10px 20px; }
  </style>
</head>
<body>
  <h1>Password Reset Request</h1>
  <p>Hello {{username}},</p>
  <p>Click the link below to reset your password:</p>
  <a href="{{resetLink}}" class="button">Reset Password</a>
  <p>This link expires in 1 hour.</p>
</body>
</html>
```

2. **Add function to emailService** (`emailService.ts`):
```typescript
export const sendPasswordResetEmail = async (to: string, username: string, token: string) => {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  const html = compileTemplate("passwordReset", { username, resetLink });

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject: "Password Reset Request - OpenBench",
      html
    });

    await pool.query(
      "INSERT INTO email_logs (email, subject, status) VALUES (?, ?, ?)",
      [to, "Password Reset Request", "sent"]
    );

    logger.info(`Password reset email sent to ${to}`);
  } catch (error) {
    logger.error("Error sending password reset email", { error });
    throw error;
  }
};
```

3. **Ensure postbuild script copies templates** (already in `package.json`):
```json
"postbuild": "cp -r src/templates dist/templates"
```

### Adding Middleware

**Example: Request logging middleware**

1. **Create middleware** (`middlewares/requestLogger.ts`):
```typescript
import { Request, Response, NextFunction } from "express";
import logger from "../services/loggingService";

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.http(`${req.method} ${req.path} ${res.statusCode} - ${duration}ms`, {
      ip: req.ip,
      userAgent: req.get("user-agent")
    });
  });

  next();
};
```

2. **Apply in server.ts:**
```typescript
import { requestLogger } from "./middlewares/requestLogger";

app.use(requestLogger);
```

---

## Important Notes for AI Assistants

### 1. Code Style Guidelines

- **Strict TypeScript:** Always include type annotations for function parameters and return types
- **Async/Await:** Use async/await, not .then() chains
- **Error Handling:** Always wrap async operations in try-catch
- **Logging:** Log important operations with Winston, not console.log (except server.ts startup)
- **Validation:** Validate all user input before processing
- **Security:** Never commit secrets, use environment variables
- **Comments:** Only add comments for complex logic, code should be self-documenting

### 2. Common Pitfalls to Avoid

**❌ Don't:**
- Use `any` type without good reason
- Forget to hash passwords/sensitive data
- Skip input validation
- Return detailed error messages to client (security risk)
- Commit `.env` file or secrets
- Use `console.log` for application logging (use Winston)
- Forget to clean up tokens/codes after use
- Skip activity logging for important actions

**✅ Do:**
- Use parameterized queries for all SQL
- Return early for validation failures
- Use centralized error handler
- Log all security-relevant events
- Hash all sensitive data (passwords, security answers, OTCs)
- Set appropriate HTTP status codes
- Use HTTP-only cookies for sensitive tokens
- Follow existing patterns and conventions

### 3. Database Query Pattern

**Always use parameterized queries:**
```typescript
// ✅ CORRECT
const [result] = await pool.query(
  "SELECT * FROM users WHERE email = ?",
  [email]
);

// ❌ WRONG - SQL injection vulnerability
const [result] = await pool.query(
  `SELECT * FROM users WHERE email = '${email}'`
);
```

### 4. Authentication Requirements

**Protected Routes Must:**
1. Import `authenticateToken` middleware
2. Apply it before controller: `router.get("/endpoint", authenticateToken, controller)`
3. Access user data via `req.user` (populated by middleware)

**Admin/Technician Routes Must:**
1. Apply `authenticateToken` first
2. Apply `authorizeRoles("admin", "technician")` second
3. Then apply controller

### 5. Activity Logging Best Practices

**Log these actions:**
- User login/logout
- User registration
- Equipment CRUD operations
- Sensor triggers (start/end sessions)
- Admin actions
- Failed authentication attempts
- Password changes

**Pattern:**
```typescript
import { logActivity } from "../services/activityLogsService";

await logActivity(
  req.user?.id || null,  // userId (null for public endpoints)
  "Action Name",          // action type
  "Detailed description", // details
  req.ip as string        // IP address
);
```

### 6. Environment Variable Access

**Always validate environment variables:**
```typescript
const value = process.env.VAR_NAME;
if (!value) {
  throw new Error("Missing environment variable: VAR_NAME");
}
```

**Use defaults for optional values:**
```typescript
const PORT = Number(process.env.PORT) || 3000;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";
```

### 7. Socket.io Real-time Updates

**When to emit:**
- Equipment status changes
- New sensor data
- Equipment CRUD operations

**Pattern:**
```typescript
import { io } from "../server";

io.emit("eventName", { data });
```

**Example:**
```typescript
io.emit("equipmentStatusUpdate", {
  equipmentId,
  status: "in_use",
  timestamp: new Date()
});
```

### 8. File Organization

**When creating new files:**
- Controllers → `src/controllers/{domain}Controller.ts`
- Models → `src/models/{Entity}Model.ts`
- Routes → `src/routes/{domain}Routes.ts`
- Services → `src/services/{purpose}Service.ts`
- Middleware → `src/middlewares/{name}Middleware.ts`
- Utils → `src/utils/{function}Utils.ts`

**Always:**
- Export functions individually (named exports) or as default
- Import dependencies at top of file
- Use relative paths for local imports
- Group imports: external → local config → local modules

### 9. Git Workflow

**When making changes:**
1. Work on feature branch (never main/master)
2. Use descriptive commit messages
3. Follow commit message format: "Type: Description"
   - Examples: "feat: Add equipment maintenance tracking"
   - "fix: Resolve OTC expiration bug"
   - "refactor: Improve error handling in controllers"
   - "docs: Update API documentation"

**Branch naming:**
- Feature: `feature/description`
- Bug fix: `fix/description`
- Refactor: `refactor/description`

### 10. Testing Recommendations

**For manual testing:**
1. Always test authentication flow end-to-end
2. Test with different user roles
3. Test error cases (invalid input, expired tokens)
4. Test rate limiting by making rapid requests
5. Check activity_logs table after operations
6. Verify email sending in development
7. Test MQTT sensor flow if applicable

**Future automated testing:**
- Consider Jest for unit tests
- Supertest for API integration tests
- Test database operations with test database
- Mock external services (SMTP, MQTT)

---

## Glossary

- **OTC:** One-Time Code (MFA)
- **JWT:** JSON Web Token
- **MFA:** Multi-Factor Authentication
- **RBAC:** Role-Based Access Control
- **MQTT:** Message Queuing Telemetry Transport (IoT protocol)
- **SMTP:** Simple Mail Transfer Protocol
- **CORS:** Cross-Origin Resource Sharing
- **Pepper:** Secret string added to passwords before hashing
- **Salt:** Random data added to passwords before hashing (per bcrypt)

---

## Additional Resources

- **Project README:** `/README.md` - User-facing documentation
- **TypeScript Config:** `/tsconfig.json` - Compiler settings
- **Package.json:** Dependencies and scripts
- **Winston Docs:** https://github.com/winstonjs/winston
- **Express Docs:** https://expressjs.com/
- **JWT Best Practices:** https://tools.ietf.org/html/rfc8725

---

**Last Updated:** 2025-12-04
**Maintainer:** Martin Jimenez
**Version:** 1.0.0
