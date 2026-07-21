# AI Expense Tracker - Project Documentation

## Overview
The AI Expense Tracker is a modern, responsive full-stack web application designed to help users manage their finances seamlessly. It features a premium UI, robust natural language AI capabilities for logging expenses, and state-of-the-art biometric authentication (WebAuthn).

---

## 🛠️ Technology Stack
### Frontend
* **Framework:** React.js (Vite)
* **Styling:** Vanilla CSS & Bootstrap (for responsive layout structures)
* **API Communication:** Axios
* **Authentication:** WebAuthn (`@simplewebauthn/browser`) & JWT

### Backend
* **Framework:** FastAPI (Python)
* **Database:** MongoDB (via PyMongo)
* **Authentication:** JWT (JSON Web Tokens), `webauthn` v3 package, `bcrypt` for password hashing
* **Server:** Uvicorn

### Deployment
* **Frontend Hosting:** Netlify (`https://followmyexpense.netlify.app`)
* **Backend Hosting:** Render

---

## 🌟 Core Features

### 1. Natural Language AI Expense Logging
Users can log expenses by simply typing or speaking naturally (e.g., "I spent $15 on coffee today"). The AI service parses the input to automatically categorize the expense, determine the amount, and save it to the database.

### 2. Premium & Responsive UI
The user interface was completely redesigned to feature a warm, aesthetic beige and brown color palette. It utilizes modern cards, micro-animations, and a mobile-first bottom navigation bar featuring a centralized, prominent voice-input button.

### 3. JWT & Biometric Authentication (Passkeys)
The app features a highly secure dual-authentication system:
* **Standard Login:** Username and Password (secured via `bcrypt` hashing and JWT).
* **Biometric Login (WebAuthn):** Users can register their device's fingerprint or FaceID scanner. The implementation uses **Discoverable Credentials (Usernameless Login)**, allowing users to click a single "Login with Fingerprint" button without ever typing their username.

### 4. Expense Management
Users can view a chronological list of their expenses, properly scoped to their individual user accounts. 

---

## 📁 Architecture & File Structure

### Backend (`/backend`)
* **`app/main.py`**: The entry point of the FastAPI application. It configures CORS (allowing cross-origin requests from Netlify) and registers all API routers. It also includes a global exception handler to gracefully catch 500 errors and return JSON responses.
* **`app/api/auth.py`**: Handles all authentication routes:
  * `/auth/login` & `/auth/register`: Standard JWT routes.
  * `/auth/webauthn/register/...`: Generates challenges and verifies fingerprint registration using the `webauthn` library.
  * `/auth/webauthn/login/...`: Usernameless login endpoints. Generates global challenges stored in MongoDB and verifies incoming biometric signatures to dynamically identify the user.
* **`app/api/expenses.py` & `app/api/ai.py`**: Protected routes that require a valid JWT token. They handle CRUD operations for expenses and interactions with the AI parsing logic.
* **`app/services/`**: Contains core business logic (`auth_service.py`, `expense_service.py`, `ai_service.py`), separating concerns from the API routing layer.

### Frontend (`/frontend`)
* **`src/services/api.js`**: Configures the Axios instance. Includes an interceptor that automatically attaches the JWT `Bearer` token from `localStorage` to every outgoing request.
* **`src/pages/Login.jsx` & `Register.jsx`**: The authentication entry points. They contain the forms and the WebAuthn triggers for seamless biometric login.
* **`src/components/Dashboard/Dashboard.jsx`**: The main hub of the application. It fetches the user's scoped expenses and includes a Settings dropdown where users can enroll new fingerprint credentials.
* **`src/contexts/AuthContext.jsx`**: Manages global authentication state, ensuring the UI accurately reflects whether a user is logged in or out.

---

## 🔐 Deep Dive: Usernameless WebAuthn Implementation
A significant architectural update was made to support **Usernameless Login**:
1. **Challenge Generation:** When a user clicks "Login with Fingerprint", the frontend requests a challenge. Because the username isn't known yet, the backend generates a secure challenge and saves it in a temporary, global MongoDB collection (`webauthn_challenges`).
2. **Device Prompt:** The browser prompts the user to scan their fingerprint. It looks up any passkeys associated with the domain (`followmyexpense.netlify.app`).
3. **Verification:** The device sends the signed challenge and the `credential_id` back to the server. 
4. **Identification:** The server pulls the original challenge from the global collection, verifies the cryptographic signature, and then searches the `users` collection to find which user owns that specific `credential_id`. The user is successfully identified and issued a JWT!

> [!TIP]
> If you ever need to test biometric features locally, ensure you are using `localhost` or `127.0.0.1`. WebAuthn is strictly blocked by browsers on non-HTTPS network IP addresses.
