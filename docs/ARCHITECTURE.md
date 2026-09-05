# FoodSaver AI — System Architecture

> **Version**: 2.0 (Production)  
> **Last Updated**: 2026-08-17

---

## 1. Technology Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 19.x | UI framework |
| Vite | 8.x | Build tool & dev server |
| React Router DOM | 7.x | Client-side routing |
| Axios | 1.x | HTTP client |
| Lucide React | 1.x | Icon library |
| @vis.gl/react-google-maps | 1.x | Google Maps integration |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js | 20+ | Runtime |
| Express | 5.x | HTTP framework |
| Mongoose | 9.x | MongoDB ODM |
| bcryptjs | — | Password hashing |
| jsonwebtoken | — | JWT authentication |
| multer | — | File upload handling |
| express-rate-limit | — | Rate limiting |
| helmet | — | Security headers |
| morgan | — | Request logging |
| express-validator | — | Input validation |

### Database
| Technology | Purpose |
|---|---|
| MongoDB Atlas | Primary database |

### AI Service
| Technology | Purpose |
|---|---|
| Node.js rule-based engine | Food classification, quality, expiry prediction |
| Future: Python/TensorFlow | ML-based image analysis (pluggable) |

### External Services
| Service | Purpose |
|---|---|
| Google Maps API | NGO location, maps, directions |
| Cloudinary (optional) | Image storage (future) |

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)               │
│                                                         │
│  Public Pages    Auth Pages    Protected Pages          │
│  ┌──────────┐   ┌──────────┐  ┌─────────────────────┐  │
│  │ Home     │   │ Login    │  │ Donor Dashboard     │  │
│  │ About    │   │ Register │  │ NGO Dashboard       │  │
│  │ Features │   │ Forgot   │  │ Admin Dashboard     │  │
│  │ Contact  │   │ Reset    │  │ Donate / Analyze    │  │
│  └──────────┘   └──────────┘  │ Pickup / Tracking   │  │
│                               │ Notifications       │  │
│                               │ Profile             │  │
│                               └─────────────────────┘  │
│                                                         │
│  AuthContext ─── API Service Layer ─── Route Guards     │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTP/REST (Axios)
                        │ JWT Bearer Token
                        ▼
┌─────────────────────────────────────────────────────────┐
│                    BACKEND (Express.js)                   │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │                  Middleware Stack                  │   │
│  │  CORS → Helmet → Morgan → JSON → Rate Limit     │   │
│  └──────────────────────────────────────────────────┘   │
│                        │                                │
│  ┌──────────────────────────────────────────────────┐   │
│  │               Route Layer                         │   │
│  │  /api/auth    /api/users     /api/donations      │   │
│  │  /api/ngos    /api/pickups   /api/analysis       │   │
│  │  /api/notifications  /api/admin  /api/dashboard  │   │
│  │  /api/upload  /api/health                        │   │
│  └──────────────────────────────────────────────────┘   │
│                        │                                │
│  ┌──────────────────────────────────────────────────┐   │
│  │            Auth Middleware                         │   │
│  │  requireAuth → requireRole("donor"|"ngo"|"admin")│   │
│  └──────────────────────────────────────────────────┘   │
│                        │                                │
│  ┌──────────────────────────────────────────────────┐   │
│  │             Controller Layer                      │   │
│  │  authController    userController                │   │
│  │  donationController  ngoController               │   │
│  │  pickupController  analysisController            │   │
│  │  notificationController  adminController         │   │
│  │  dashboardController  uploadController           │   │
│  └──────────────────────────────────────────────────┘   │
│                        │                                │
│  ┌──────────────────────────────────────────────────┐   │
│  │              Service Layer                        │   │
│  │  aiService (food analysis + expiry prediction)   │   │
│  │  notificationService (create on events)          │   │
│  └──────────────────────────────────────────────────┘   │
│                        │                                │
│  ┌──────────────────────────────────────────────────┐   │
│  │              Model Layer (Mongoose)               │   │
│  │  User  NGO  Donation  AIAnalysis                 │   │
│  │  Pickup  Notification                            │   │
│  └──────────────────────────────────────────────────┘   │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                  MongoDB Atlas                           │
│  Collections: users, ngos, donations, analyses,         │
│               pickups, notifications                    │
└─────────────────────────────────────────────────────────┘
```

---

## 3. AI Analysis Architecture

```
React Image Upload (FoodImageUpload component)
        │
        ▼
    FormData (multipart/form-data)
        │
        ▼
POST /api/analysis/analyze
        │
        ▼
    Multer middleware (file validation)
        │  • File type: jpeg, png, webp
        │  • Max size: 10MB
        │  • MIME validation
        ▼
    Image saved to /uploads/ (local) or Cloudinary
        │
        ▼
    AI Service (aiService.js)
        │  • Food type classification (rule-based + keywords)
        │  • Quality assessment (freshness scoring)
        │  • Expiry prediction (based on food type + prep date)
        │  • Confidence scoring
        ▼
    AIAnalysis document saved to MongoDB
        │
        ▼
    Response: { analysis result + imageUrl + id }
        │
        ▼
    Frontend displays: FoodAnalysisResult component
```

---

## 4. Authentication Flow

```
Register (POST /api/auth/register)
    │  • Validate input
    │  • Check email uniqueness
    │  • Hash password (bcryptjs)
    │  • Create User document
    │  • Generate JWT
    ▼
Login (POST /api/auth/login)
    │  • Find user by email
    │  • Compare password hash
    │  • Generate JWT (24h expiry)
    │  • Return user + token
    ▼
Protected Request
    │  • Authorization: Bearer <token>
    │  • requireAuth middleware decodes JWT
    │  • Attaches req.user
    │  • requireRole checks user.role
    ▼
Role-Based Dashboard Redirect
    │  • donor  → /dashboard
    │  • ngo    → /ngo/dashboard
    │  • admin  → /admin
```

---

## 5. Database Schema Relationships

```
User ──────┐
  │        │
  │ donor  │ ngo (user with role="ngo")
  │        │
  ▼        ▼
Donation ──── references ──── NGO
  │                            │
  │ has                        │ referenced by
  ▼                            ▼
AIAnalysis                   Pickup
                               │
                               │ triggers
                               ▼
                          Notification
                          (for donor, ngo, admin)
```

---

## 6. API Response Format

### Success
```json
{
  "success": true,
  "data": {},
  "message": "Optional message"
}
```

### Error
```json
{
  "success": false,
  "message": "Human-readable error message"
}
```

### Paginated List
```json
{
  "success": true,
  "count": 25,
  "page": 1,
  "totalPages": 3,
  "data": []
}
```

---

## 7. Folder Structure (Final)

```
FoodSaver-AI/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/        (Navbar, Footer, ProtectedRoute, LoadingSpinner)
│   │   │   ├── admin/         (AdminSidebar, AdminNavbar, StatCard, ActivityTable)
│   │   │   ├── dashboard/
│   │   │   ├── ngo/
│   │   │   ├── notifications/
│   │   │   ├── pickup/
│   │   │   └── *.jsx          (shared components)
│   │   ├── context/           (AuthContext)
│   │   ├── data/              (mock data — dev/test only)
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   ├── dashboard/
│   │   │   ├── map/
│   │   │   ├── ngo/
│   │   │   └── pickup/
│   │   ├── services/          (API service layer)
│   │   ├── styles/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── server/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── donationController.js
│   │   ├── ngoController.js
│   │   ├── pickupController.js
│   │   ├── analysisController.js
│   │   ├── notificationController.js
│   │   ├── adminController.js
│   │   └── dashboardController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   ├── upload.js
│   │   └── validate.js
│   ├── models/
│   │   ├── User.js
│   │   ├── NGO.js
│   │   ├── Donation.js
│   │   ├── AIAnalysis.js
│   │   ├── Pickup.js
│   │   └── Notification.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── donationRoutes.js
│   │   ├── ngoRoutes.js
│   │   ├── pickupRoutes.js
│   │   ├── analysisRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── adminRoutes.js
│   │   └── dashboardRoutes.js
│   ├── services/
│   │   ├── aiService.js
│   │   └── notificationService.js
│   ├── seed/
│   │   └── seedNGOs.js
│   ├── uploads/               (gitignored)
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── docs/
│   ├── PRODUCTION_AUDIT.md
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── DATABASE.md
│   ├── ROUTES.md
│   └── DEPLOYMENT.md
├── .gitignore
├── .env.example
└── README.md
```
