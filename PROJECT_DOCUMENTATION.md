# COMPLIANCE QR CODE PLATFORM — DOKUMENTI BUUXA EE NIDAAMKA (SYSTEM DOCUMENTATION)

Buug-hagahan wuxuu si faahfaahsan u sharxayaa dhismaha nidaamka (Architecture), fayl kasta iyo shaqada uu qabto, iyo dhammaan **API Endpoints**-ka nidaamka oo ay weheliyaan dariiqyadooda (Routes & Controllers).

---

## 📑 Tusmada Cutubyada (Table of Contents)

1. [Dulmar Guud & Farsamooyinka (Overview & Tech Stack)](#1-dulmar-guud--farsamooyinka)
2. [Qaab-dhismeedka Faylasha (Folder Structure)](#2-qaab-dhismeedka-faylasha)
3. [Faylasha Backend-ka iyo Shaqadooda (Backend Core Files)](#3-faylasha-backend-ka-iyo-shaqadooda)
4. [Xog-Keydiyeyaasha MongoDB (Database Models)](#4-xog-keydiyeyaasha-mongodb-database-models)
5. [Dhammaan API Endpoints-ka Nidaamka (Complete API Reference)](#5-dhammaan-api-endpoints-ka-nidaamka)
   - [A. Public & Customer APIs](#a-public--customer-apis)
   - [B. Authentication APIs](#b-authentication-apis)
   - [C. Platform Super Admin APIs](#c-platform-super-admin-apis)
   - [D. Organization Portal APIs](#d-organization-portal-apis)
6. [Faylasha Frontend-ka iyo Shaqadooda (Frontend Structure & Pages)](#6-faylasha-frontend-ka-iyo-shaqadooda)
7. [Nidaamka SMS Integration & Fariimaha (Tabaarak Gateway)](#7-nidaamka-sms-integration--fariimaha)
8. [Deploy-ka & Deegaannada (Netlify & Render Deployment)](#8-deploy-ka--deegaannada)

---

## 1. Dulmar Guud & Farsamooyinka

**Compliance QR** waa nidaam casri ah oo u saamaxaya xarumaha dowladda, shirkadaha ganacsiga, isbitaallada, iyo jaamacadaha inay helaan QR Code gaar ah. Macaamiishu marka ay scan-gareeyaan taleefankooda, waxay si toos ah u gudbin karaan **Cabasho** ama **Talo**, iyadoo fariinta macmiilka isla markiiba loogu dirayo maamulka xarunta SMS toos ah.

### Farsamooyinka La Adeegsaday (Tech Stack):
- **Backend:** Node.js (v20+), Express.js (ES Modules)
- **Database:** MongoDB Atlas & Mongoose ODM
- **SMS Gateway:** Tabaarak SMS API (`https://sms.tabaarak.com`)
- **Email:** Nodemailer & Google SMTP
- **AI Copilot:** Google Gemini Generative AI SDK
- **Frontend:** React 18, Vite, Tailwind CSS, Lucide Icons, React Router v6, Axios, React Hot Toast
- **Security:** JWT (Access/Refresh rotation), BCrypt, Helmet, CORS, Rate Limiting, Org-Data Isolation.

---

## 2. Qaab-dhismeedka Faylasha

```text
complent QR code/
├── client/                     # Frontend Application (React + Vite)
│   ├── public/
│   │   └── _redirects          # Netlify SPA redirect config
│   ├── src/
│   │   ├── components/         # UI Components (Sidebar, Navbar, Modals, Stats, etc.)
│   │   ├── context/            # Global State (AuthContext, LanguageContext)
│   │   ├── layouts/            # Layout wrappers (Admin, Org, Customer, Public)
│   │   ├── pages/              # Screen pages (Admin, Org, Customer, Public)
│   │   │   ├── admin/          # Admin pages (Overview, Orgs, QR, Reports, etc.)
│   │   │   ├── customer/       # QR Scan, Complaint & Feedback forms, Confirmation
│   │   │   ├── org/            # Organization pages (Overview, Submissions, Notifications)
│   │   │   └── public/         # Landing, About, Contact, Platform Complaint
│   │   ├── utils/              # API Client (Axios) & Phone formatters
│   │   ├── App.jsx             # Main Router configuration
│   │   └── main.jsx            # React root mount
│   └── vite.config.js          # Vite config (Proxy, Host, Build Chunks)
│
├── server/                     # Backend API (Node.js + Express)
│   ├── src/
│   │   ├── config/             # Environment & Database connections
│   │   ├── constants/          # Statuses, Roles, Enums
│   │   ├── controllers/        # Request handlers
│   │   ├── integrations/       # External APIs (SMS Tabaarak, Email SMTP, WhatsApp)
│   │   ├── jobs/               # Cron jobs (Subscription expiry checker)
│   │   ├── middleware/         # Auth, Authorization, Org Isolation, Error Handler
│   │   ├── models/             # Mongoose Models (Org, User, QR, Submission, Notification)
│   │   ├── routes/             # Express API Route definitions
│   │   ├── services/           # Business logic layer
│   │   ├── utils/              # Token generators, ApiError, AsyncHandler
│   │   ├── validators/         # Zod input validation schemas
│   │   ├── app.js              # Express app setup & route mounting
│   │   └── seed.js             # Initial database seeder
│   ├── nodemon.json            # Fast development reload config
│   └── .env                    # Secret environment variables
└── README.md
```

---

## 3. Faylasha Backend-ka iyo Shaqadooda

### ⚙️ Qaabeynta (Config):
- [`server/src/config/env.js`](file:///c:/Users/Araale/Documents/complent%20QR%20code/server/src/config/env.js): Wuxuu akhriyaa dhammaan doorsoomayaasha `.env` (PORT, MONGODB_URI, JWT, Tabaarak SMS, SMTP, iwm) isagoo xaqiijinaya inaysan waxba ka dhimnayn.
- [`server/src/config/db.js`](file:///c:/Users/Araale/Documents/complent%20QR%20code/server/src/config/db.js): Wuxuu maamulaa xiriirka MongoDB Atlas.

### 🛡️ Ilaalada & Dhexdhexaadiyeyaasha (Middleware):
- [`server/src/middleware/auth.js`](file:///c:/Users/Araale/Documents/complent%20QR%20code/server/src/middleware/auth.js): Wuxuu xaqiijiyaa JWT token-ka qofka soo galaya (`Bearer Token`).
- [`server/src/middleware/authorize.js`](file:///c:/Users/Araale/Documents/complent%20QR%20code/server/src/middleware/authorize.js): Wuxuu hubiyaa darajada isticmaalaha (`SUPER_ADMIN` ama `ORGANIZATION_USER`).
- [`server/src/middleware/orgIsolation.js`](file:///c:/Users/Araale/Documents/complent%20QR%20code/server/src/middleware/orgIsolation.js): Wuxuu ilaaliyaa xogta gaarka ah ee xarun kasta (Privacy Isolation), isagoo u diidaya in Xarunta A ay aragto xogta Xarunta B.
- [`server/src/middleware/errorHandler.js`](file:///c:/Users/Araale/Documents/complent%20QR%20code/server/src/middleware/errorHandler.js): Wuxuu qabtaa dhammaan khaladaadka (Errors) isagoo ku soo celinaya qaab midaysan oo nadiif ah (`{ success: false, message, data: null, errors: [] }`).
- [`server/src/middleware/validate.js`](file:///c:/Users/Araale/Documents/complent%20QR%20code/server/src/middleware/validate.js): Wuxuu xogta soo gasha ku hubiyaa Zod Schemas.
- [`server/src/middleware/upload.js`](file:///c:/Users/Araale/Documents/complent%20QR%20code/server/src/middleware/upload.js): Multer middleware u qaabilsan soo gelinta sawirrada/logos-ka.

### 🧩 Adeegyada Ganacsiga (Services Layer):
- [`server/src/services/organization.service.js`](file:///c:/Users/Araale/Documents/complent%20QR%20code/server/src/services/organization.service.js): Diiwaangelinta xarunta, abuurista akoonka wakiilka, xisaabinta rukumashada, iyo dirista SMS-ka login-ka.
- [`server/src/services/submission.service.js`](file:///c:/Users/Araale/Documents/complent%20QR%20code/server/src/services/submission.service.js): Keydinta cabashada/talada macmiilka, xisaabinta tixraaca (Reference Number), iyo u dirista fariinta SMS-ka tooska ah xarunta.
- [`server/src/services/qr.service.js`](file:///c:/Users/Araale/Documents/complent%20QR%20code/server/src/services/qr.service.js): Abuurista Secure Token-ka QR Code-ka, dhisidda URL-ka, soo saarista sawirka PNG Data URL, iyo soo saarista PDF-ka rasmiga ah ee la daabaco.
- [`server/src/services/notification.service.js`](file:///c:/Users/Araale/Documents/complent%20QR%20code/server/src/services/notification.service.js): Diiwaangelinta fariin kasta oo SMS/WhatsApp ah oo baxda (`PENDING`, `SENT`, `FAILED`), iyo dib-u-tijaabinta haddii ay fashilanto.
- [`server/src/services/subscription.service.js`](file:///c:/Users/Araale/Documents/complent%20QR%20code/server/src/services/subscription.service.js): Maamulka muddada rukumashada (30 maalmood), xisaabinta maalmaha u haray, iyo joojinta QR code-ka haddii muddo dhaafto.
- [`server/src/services/audit.service.js`](file:///c:/Users/Araale/Documents/complent%20QR%20code/server/src/services/audit.service.js): Diiwaangelinta ficil kasta oo maamulku sameeyo (Audit Logs).
- [`server/src/services/report.service.js`](file:///c:/Users/Araale/Documents/complent%20QR%20code/server/src/services/report.service.js): Soo saarista tirokoobyada (Analytics), garaafyada, iyo soo dejinta faylasha CSV.
- [`server/src/services/chatbot.service.js`](file:///c:/Users/Araale/Documents/complent%20QR%20code/server/src/services/chatbot.service.js): Adeegga AI Copilot ee ku xiran Google Gemini.

### 🌐 Isku-Xirayaasha Dibadda (Integrations):
- [`server/src/integrations/sms/sms.service.js`](file:///c:/Users/Araale/Documents/complent%20QR%20code/server/src/integrations/sms/sms.service.js): Xiriiriyaha rasmiga ah ee **Tabaarak SMS Gateway API** oo leh Token Caching (12 saac) iyo diris SMS toos ah.
- [`server/src/integrations/email/email.service.js`](file:///c:/Users/Araale/Documents/complent%20QR%20code/server/src/integrations/email/email.service.js): Dirista emails-ka (Password reset, notifications) iyadoo la isticmaalayo Google SMTP.

---

## 4. Xog-Keydiyeyaasha MongoDB (Database Models)

| Model Name | Faylka | Shaqadiisa |
| :--- | :--- | :--- |
| **`Organization`** | [`models/Organization.js`](file:///c:/Users/Araale/Documents/complent%20QR%20code/server/src/models/Organization.js) | Xogta xarunta (Magaca, Nooca, Email, Taleefan, Logo, Qeybaha cabashooyinka, Xaaladda) |
| **`OrganizationUser`**| [`models/OrganizationUser.js`](file:///c:/Users/Araale/Documents/complent%20QR%20code/server/src/models/OrganizationUser.js) | Akoonka wakiilka xarunta (Username, Password Hash, Phone, `mustChangePassword`) |
| **`AdminUser`** | [`models/AdminUser.js`](file:///c:/Users/Araale/Documents/complent%20QR%20code/server/src/models/AdminUser.js) | Akoonka Super Admin-ka guud ee nidaamka maamula |
| **`QRCode`** | [`models/QRCode.js`](file:///c:/Users/Araale/Documents/complent%20QR%20code/server/src/models/QRCode.js) | Xogta QR Code-ka (`publicToken`, `scanCount`, `status`: ACTIVE/REVOKED) |
| **`CustomerSubmission`**| [`models/CustomerSubmission.js`](file:///c:/Users/Araale/Documents/complent%20QR%20code/server/src/models/CustomerSubmission.js)| Cabashada/Talada macmiilka (`referenceNumber`, `type`: COMPLAINT/FEEDBACK, `message`, `status`) |
| **`Notification`** | [`models/Notification.js`](file:///c:/Users/Araale/Documents/complent%20QR%20code/server/src/models/Notification.js) | Diiwaanka fariin kasta oo SMS ah (`recipient`, `message`, `type`, `status`: SENT/FAILED, `sentAt`) |
| **`RenewalRequest`** | [`models/RenewalRequest.js`](file:///c:/Users/Araale/Documents/complent%20QR%20code/server/src/models/RenewalRequest.js) | Codsiyada cusboonaysiinta rukumashada ee xarumuhu soo dirsadaan |
| **`SubscriptionPayment`**| [`models/SubscriptionPayment.js`](file:///c:/Users/Araale/Documents/complent%20QR%20code/server/src/models/SubscriptionPayment.js)| Diiwaanka lacag-bixinta rukumashada |
| **`AuditLog`** | [`models/AuditLog.js`](file:///c:/Users/Araale/Documents/complent%20QR%20code/server/src/models/AuditLog.js) | Diiwaanka dhaqdhaqaaqa maamulka (Security & Compliance audit) |
| **`PlatformSettings`**| [`models/PlatformSettings.js`](file:///c:/Users/Araale/Documents/complent%20QR%20code/server/src/models/PlatformSettings.js)| Qaabeynta guud ee nidaamka (Platform name, Logo, Contact info) |
| **`PlatformComplaint`**| [`models/PlatformComplaint.js`](file:///c:/Users/Araale/Documents/complent%20QR%20code/server/src/models/PlatformComplaint.js)| Cabashooyinka guud ee lagu soo gudbiyo nidaamka (Platform-level) |

---

## 5. Dhammaan API Endpoints-ka Nidaamka

### A. Public & Customer APIs
*Faylka Routes-ka:* [`server/src/routes/public.routes.js`](file:///c:/Users/Araale/Documents/complent%20QR%20code/server/src/routes/public.routes.js)  
*Faylka Controller-ka:* [`server/src/controllers/public.controller.js`](file:///c:/Users/Araale/Documents/complent%20QR%20code/server/src/controllers/public.controller.js)

| Method | Endpoint | Shaqada uu Qabto | Gelitaanka |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` ama `/api/health` | Health Check (Render & monitoring) | Public |
| `GET` | `/api/public/qr/:token` | Hubinta QR token-ka iyo soo qaadista xogta xarunta | Public |
| `POST` | `/api/public/submissions` | Gudbinta Cabashada ama Talada macmiilka | Public |
| `GET` | `/api/public/settings` | Soo qaadista xogta guud ee platform-ka (Logo, Magaca) | Public |
| `POST` | `/api/platform-complaints` | Gudbinta cabashada guud ee ku saabsan nidaamka | Public |

---

### B. Authentication APIs
*Faylka Routes-ka:* [`server/src/routes/auth.routes.js`](file:///c:/Users/Araale/Documents/complent%20QR%20code/server/src/routes/auth.routes.js)  
*Faylka Controller-ka:* [`server/src/controllers/auth.controller.js`](file:///c:/Users/Araale/Documents/complent%20QR%20code/server/src/controllers/auth.controller.js)

| Method | Endpoint | Shaqada uu Qabto | Gelitaanka |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Gelitaanka nidaamka (Super Admin & Org User) | Public |
| `POST` | `/api/auth/refresh` | Cusboonaysiinta Access Token-ka (Token Rotation) | Public (Cookie/Body) |
| `POST` | `/api/auth/logout` | Ka bixitaanka nidaamka iyo tirtirista token-ka | Authenticated |
| `GET` | `/api/auth/me` | Soo qaadista xogta qofka hadda galgan | Authenticated |
| `POST` | `/api/auth/change-password` | Beddelka furaha sirta ah (Khasab ah galitaanka 1-aad) | Authenticated |
| `POST` | `/api/auth/forgot-password` | Codsiga dib-u-dejinta furaha (Email Reset Link) | Public |
| `POST` | `/api/auth/reset-password` | Xaqiijinta furaha cusub iyadoo la adeegsanayo token-ka | Public |

---

### C. Platform Super Admin APIs
*Xeerka:* Kaliya **`SUPER_ADMIN`** ayaa geli kara routes-kan (`/api/admin/*`).

| Qeybta | Method | Endpoint | Shaqada uu Qabto | Faylka Controller-ka |
| :--- | :--- | :--- | :--- | :--- |
| **Diiwaangelinta** | `POST` | `/api/admin/organizations/wizard` | Diiwaangelinta xarun cusub + Wakiil + QR + 30 Maalmood + SMS | [`admin.organization.controller.js`](file:///c:/Users/Araale/Documents/complent%20QR%20code/server/src/controllers/admin.organization.controller.js) |
| **Xarumaha** | `GET` | `/api/admin/organizations` | Liiska dhammaan xarumaha + shaandhayn + pagination | [`admin.organization.controller.js`](file:///c:/Users/Araale/Documents/complent%20QR%20code/server/src/controllers/admin.organization.controller.js) |
| | `GET` | `/api/admin/organizations/:id` | Faahfaahinta xarun gaar ah | [`admin.organization.controller.js`](file:///c:/Users/Araale/Documents/complent%20QR%20code/server/src/controllers/admin.organization.controller.js) |
| | `PATCH` | `/api/admin/organizations/:id` | Wax ka beddelka xogta xarunta | [`admin.organization.controller.js`](file:///c:/Users/Araale/Documents/complent%20QR%20code/server/src/controllers/admin.organization.controller.js) |
| | `DELETE` | `/api/admin/organizations/:id` | Tirtirista ama Deactivate-gareynta xarunta | [`admin.organization.controller.js`](file:///c:/Users/Araale/Documents/complent%20QR%20code/server/src/controllers/admin.organization.controller.js) |
| **Wakiillada** | `POST` | `/api/admin/organizations/:id/user` | Abuurista akoon wakiil cusub oo xarun leedahay | [`admin.user.controller.js`](file:///c:/Users/Araale/Documents/complent%20QR%20code/server/src/controllers/admin.user.controller.js) |
| | `PATCH` | `/api/admin/organization-users/:id/reset-password` | Dib-u-dejinta furaha wakiilka | [`admin.user.controller.js`](file:///c:/Users/Araale/Documents/complent%20QR%20code/server/src/controllers/admin.user.controller.js) |
| **QR Codes** | `POST` | `/api/admin/organizations/:id/qr/regenerate` | Dib-u-soo saarista QR Code cusub | [`admin.qr.controller.js`](file:///c:/Users/Araale/Documents/complent%20QR%20code/server/src/controllers/admin.qr.controller.js) |
| | `GET` | `/api/admin/organizations/:id/qr/download` | Soo dejinta faylka PDF-ka rasmiga ah ee QR Code | [`admin.qr.controller.js`](file:///c:/Users/Araale/Documents/complent%20QR%20code/server/src/controllers/admin.qr.controller.js) |
| **Submissions** | `GET` | `/api/admin/submissions` | Liiska dhammaan cabashooyinka & talooyinka nidaamka | [`admin.submission.controller.js`](file:///c:/Users/Araale/Documents/complent%20QR%20code/server/src/controllers/admin.submission.controller.js) |
| | `PATCH` | `/api/admin/submissions/:id/status` | Beddelka xaaladda cabashada (`RESOLVED`, `IN_REVIEW`, iwm) | [`admin.submission.controller.js`](file:///c:/Users/Araale/Documents/complent%20QR%20code/server/src/controllers/admin.submission.controller.js) |
| **Rukumashada** | `GET` | `/api/admin/renewal-requests` | Liiska codsiyada cusboonaysiinta rukumashada | [`admin.renewal.controller.js`](file:///c:/Users/Araale/Documents/complent%20QR%20code/server/src/controllers/admin.renewal.controller.js) |
| | `PATCH` | `/api/admin/renewal-requests/:id/approve` | Ansixinta codsiga iyo kordhinta muddada xarunta | [`admin.renewal.controller.js`](file:///c:/Users/Araale/Documents/complent%20QR%20code/server/src/controllers/admin.renewal.controller.js) |
| | `PATCH` | `/api/admin/renewal-requests/:id/reject` | Diidmada codsiga cusboonaysiinta | [`admin.renewal.controller.js`](file:///c:/Users/Araale/Documents/complent%20QR%20code/server/src/controllers/admin.renewal.controller.js) |
| **Tirokoobyada**| `GET` | `/api/admin/reports/overview` | Tirokoobyada guud ee Dashboard-ka sare | [`admin.report.controller.js`](file:///c:/Users/Araale/Documents/complent%20QR%20code/server/src/controllers/admin.report.controller.js) |
| | `GET` | `/api/admin/reports/export/csv` | Soo dejinta xogta dhammaan cabashooyinka oo CSV ah | [`admin.report.controller.js`](file:///c:/Users/Araale/Documents/complent%20QR%20code/server/src/controllers/admin.report.controller.js) |
| **Fariimaha SMS**| `GET` | `/api/admin/notifications` | Diiwaanka dhammaan fariimihii SMS ee baxay | [`admin.notification.controller.js`](file:///c:/Users/Araale/Documents/complent%20QR%20code/server/src/controllers/admin.notification.controller.js) |
| | `POST` | `/api/admin/notifications/:id/retry` | Dib-u-dirista SMS fashilmay | [`admin.notification.controller.js`](file:///c:/Users/Araale/Documents/complent%20QR%20code/server/src/controllers/admin.notification.controller.js) |
| **Audit Logs** | `GET` | `/api/admin/audit-logs` | Diiwaanka dhaqdhaqaaqa iyo amniga nidaamka | [`admin.audit.controller.js`](file:///c:/Users/Araale/Documents/complent%20QR%20code/server/src/controllers/admin.audit.controller.js) |
| **Settings** | `GET` / `PATCH` | `/api/admin/settings` | Wax ka beddelka magaca, logo-ka, iyo xogta platform-ka | [`admin.settings.controller.js`](file:///c:/Users/Araale/Documents/complent%20QR%20code/server/src/controllers/admin.settings.controller.js) |

---

### D. Organization Portal APIs
*Xeerka:* Kaliya **`ORGANIZATION_USER`** ayaa geli kara routes-kan (`/api/organization/*`), waxaana ilaaliya `enforceOrgIsolation` middleware.  
*Faylka Routes-ka:* [`server/src/routes/org.routes.js`](file:///c:/Users/Araale/Documents/complent%20QR%20code/server/src/routes/org.routes.js)  
*Faylka Controller-ka:* [`server/src/controllers/org.controller.js`](file:///c:/Users/Araale/Documents/complent%20QR%20code/server/src/controllers/org.controller.js)

| Method | Endpoint | Shaqada uu Qabto |
| :--- | :--- | :--- |
| `GET` | `/api/organization/overview` | Soo qaadista tirokoobyada xarunta, xaaladda rukumashada, iyo maalmaha u haray |
| `PATCH` | `/api/organization/profile` | Wax ka beddelka xogta xarunta (Email, Taleefan, WhatsApp, Cinwaan) |
| `GET` | `/api/organization/submissions` | Liiska cabashooyinka iyo talooyinka xaruntan u gaarka ah oo keliya |
| `GET` | `/api/organization/submissions/:id` | Faahfaahinta hal cabasho ama talo |
| `PATCH` | `/api/organization/submissions/:id/status`| Beddelka xaaladda cabashada (`RESOLVED`, `IN_REVIEW`, `DISMISSED`) |
| `GET` | `/api/organization/qr` | Soo qaadista QR Code-ka rasmiga ah ee xarunta |
| `GET` | `/api/organization/qr/download` | Soo dejinta faylka PDF-ka ee QR Code-ka xarunta |
| `POST` | `/api/organization/renewal-requests` | Soo gudbinta codsi cusboonaysiin rukumasho |
| `GET` | `/api/organization/renewal-requests` | Diiwaanka codsiyadii hore ee rukumashada xarunta |
| `GET` | `/api/organization/notifications` | **Diiwaanka fariimaha SMS ee xarunta u gaarka ah (Notification History)** |
| `GET` | `/api/organization/export/csv` | Soo dejinta xogta cabashooyinka xarunta oo fayl CSV ah |
| `POST` | `/api/organization/chatbot` | Wadahadalka AI Copilot oo xogta xarunta ku salaysan |

---

## 6. Faylasha Frontend-ka iyo Shaqadooda

### 🖥️ Bogagga Muhiimka ah (Pages):

#### 1. Bogagga Macmiilka (Customer QR Experience):
- [`QRLandingPage.jsx`](file:///c:/Users/Araale/Documents/complent%20QR%20code/client/src/pages/customer/QRLandingPage.jsx): Bogga ugu horreeya ee furma marka QR-ka la scan-gareeyo. Macmiilku wuxuu ka dooranayaa inuu diro **Cabasho** ama **Talo**.
- [`ComplaintFormPage.jsx`](file:///c:/Users/Araale/Documents/complent%20QR%20code/client/src/pages/customer/ComplaintFormPage.jsx): Foomka gudbinta Cabashada (Qeybta, fariinta, xalka la soo jeedinayo, taleefanka ikhtiyaariga ah).
- [`FeedbackFormPage.jsx`](file:///c:/Users/Araale/Documents/complent%20QR%20code/client/src/pages/customer/FeedbackFormPage.jsx): Foomka gudbinta Talada wax-dhisaysa.
- [`ConfirmationPage.jsx`](file:///c:/Users/Araale/Documents/complent%20QR%20code/client/src/pages/customer/ConfirmationPage.jsx): Bogga guusha ee muujiya Number-ka tixraaca (Reference Number).
- [`ServiceUnavailablePage.jsx`](file:///c:/Users/Araale/Documents/complent%20QR%20code/client/src/pages/customer/ServiceUnavailablePage.jsx): Wuxuu soo baxaa haddii QR Code-ka xaruntu uu xiran yahay ama rukumashadii ka dhacday.

#### 2. Bogagga Xarunta (Organization Portal):
- [`OrgDashboardPage.jsx`](file:///c:/Users/Araale/Documents/complent%20QR%20code/client/src/pages/org/OrgDashboardPage.jsx): Dashboard-ka xarunta ee muujiya cabashooyinka cusub, kuwa la xaliyay, iyo maalmaha rukumashada.
- [`OrgSubmissionsPage.jsx`](file:///c:/Users/Araale/Documents/complent%20QR%20code/client/src/pages/org/OrgSubmissionsPage.jsx): Shaandhaynta iyo maaraynta cabashooyinka/talooyinka.
- [`OrgNotificationsPage.jsx`](file:///c:/Users/Araale/Documents/complent%20QR%20code/client/src/pages/org/OrgNotificationsPage.jsx): Diiwaanka fariimaha SMS ee loo diray maamulka xarunta iyo xaaladdooda (`SENT`/`FAILED`).
- [`OrgQrPage.jsx`](file:///c:/Users/Araale/Documents/complent%20QR%20code/client/src/pages/org/OrgQrPage.jsx): Muuqaalka QR Code-ka xarunta iyo badhanka lagula soo dego PDF-ka.
- [`OrgSubscriptionPage.jsx`](file:///c:/Users/Araale/Documents/complent%20QR%20code/client/src/pages/org/OrgSubscriptionPage.jsx): Xaaladda rukumashada iyo foomka codsiga cusboonaysiinta.
- [`OrgProfilePage.jsx`](file:///c:/Users/Araale/Documents/complent%20QR%20code/client/src/pages/org/OrgProfilePage.jsx): Wax ka beddelka macluumaadka xarunta.

#### 3. Qaybaha Guud (Components & Modals):
- [`MustChangePasswordModal.jsx`](file:///c:/Users/Araale/Documents/complent%20QR%20code/client/src/components/MustChangePasswordModal.jsx): Daaqad khasab kaga dhigaysa wakiilka cusub inuu furaha iskabadalo marka ugu horeysa ee uu soo galo nidaamka.
- [`Sidebar.jsx`](file:///c:/Users/Araale/Documents/complent%20QR%20code/client/src/components/Sidebar.jsx): Liiska navigation-ka ee dhinaca bidix u muuqda.
- [`Navbar.jsx`](file:///c:/Users/Araale/Documents/complent%20QR%20code/client/src/components/Navbar.jsx): Baarka sare ee muujiya akoonka iyo badhanka ka-bixitaanka (Logout).

---

## 7. Nidaamka SMS Integration & Fariimaha

Nidaamku wuxuu isticmaalaa **Tabaarak SMS Gateway API** (`https://sms.tabaarak.com`).

### 1. Fariinta Akoonka Cusub (Onboarding SMS):
Marka Platform Admin-ku diiwaangeliyo xarun, wakiilku wuxuu taleefankiisa ku helayaa SMS kooban oo sidan u qoran:
```text
Your Compliance QR account has been created.

Login:
http://192.168.61.230:5173/login

Username:
exampleUser

Temporary Password:
Compliance@2026
```

### 2. Fariinta Cabashada / Talada Macmiilka:
Marka macmiilku foomka soo buuxiyo, SMS-ka gaaraya maamulka xarunta waa **qoraalka fariinta macmiilka oo qura (NO metadata/headers)**:
- *Cabasho:* `"Shaqaalaha reception-ka adeeggoodu ma fiicna."`
- *Talo:* `"Waxaan soo jeedinayaa in la kordhiyo kuraasta."`

---

## 8. Deploy-ka & Deegaannada

### Frontend (Netlify):
- **Build Command:** `npm run build`
- **Publish Directory:** `client/dist`
- **SPA Redirect Rule:** Faylka [`client/public/_redirects`](file:///c:/Users/Araale/Documents/complent%20QR%20code/client/public/_redirects) (`/* /index.html 200`) wuxuu xaqiijinayaa in routes-ku aysan 404 bixin markii bogga la cusboonaysiiyo (refresh).

### Backend (Render):
- **Start Command:** `npm start`
- **Host Binding:** `0.0.0.0`
- **Health Check Path:** `GET /health`

### Doorsoomayaasha Deegaanka ee Wax-soo-saarka (Production Environment Variables):
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secure-jwt-secret
JWT_REFRESH_SECRET=your-secure-refresh-secret
DEFAULT_USER_PASSWORD=Compliance@2026
FRONTEND_URL=https://your-production-app.netlify.app
PUBLIC_APP_URL=https://your-production-app.netlify.app
TABAARAK_SMS_NAME=Bile
TABAARAK_SMS_PASSWORD=Bile2026@!
TABAARAK_SMS_BASE_URL=https://sms.tabaarak.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```
