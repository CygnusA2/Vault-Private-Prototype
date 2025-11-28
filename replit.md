# Vault Private - UHNW Private Banking App

## Overview
A proof-of-concept mobile app prototype for a proprietary authenticator and private banking experience designed for ultra-high net worth clients. This prototype demonstrates the complete transaction flow for investor and client presentations.

**Status**: Full-stack application with Node.js/TypeScript backend API

## Recent Changes
- November 28, 2025: Added Node.js/TypeScript backend API server
- Backend API with modular architecture for third-party integrations
- Security middleware (JWT auth, rate limiting, input sanitization)
- Placeholder modules for DocuSign, OpenAI, Canton Network, Stewart Title, Wolters Kluwer
- Initial prototype created with custom gold/dark luxury theme
- Complete authentication flow with SMS verification simulation
- KYC onboarding with 5-step progressive disclosure
- Transaction flow: Pre-Approve → Illiquid Assets → LedgerToken → Optimus → Dashboard

## Project Architecture

### Tech Stack
- **Frontend**: Expo SDK 54 with React Native
- **Backend**: Node.js with Express and TypeScript
- **Navigation**: React Navigation 7 (Stack + Bottom Tabs)
- **Animations**: React Native Reanimated
- **Styling**: StyleSheet with custom theme constants
- **Security**: JWT authentication, Helmet, CORS, rate limiting

### Directory Structure
```
/
├── App.tsx                    # Root component with providers
├── context/
│   └── AuthContext.tsx        # Authentication state management
├── navigation/
│   ├── RootNavigator.tsx      # Auth/Transaction flow switch
│   ├── AuthStackNavigator.tsx # Onboarding flow
│   ├── MainTabNavigator.tsx   # 4-tab navigation
│   └── HomeStackNavigator.tsx # Home tab stack
├── screens/
│   ├── WelcomeScreen.tsx      # Phone entry + SMS verification
│   ├── KYCNameScreen.tsx      # Personal details (Step 1)
│   ├── KYCDocumentScreen.tsx  # Document upload - 3 required (Step 2)
│   ├── KYCSelfieScreen.tsx    # Face scan with animation (Step 3)
│   ├── KYCBiometricScreen.tsx # Biometric + Iris scan + Dow Jones (Step 4)
│   ├── KYCAddressScreen.tsx   # California address (Step 5)
│   ├── PreApproveScreen.tsx   # Pre-approval with auto-checked docs
│   ├── IlliquidAssetsScreen.tsx # Asset portfolio analysis
│   ├── LedgerTokenScreen.tsx  # Tokenization process
│   ├── OptimusScreen.tsx      # Cash conversion
│   ├── FaceRecognitionScreen.tsx # Face scan login
│   ├── TwoFactorScreen.tsx    # 2FA auto-fill
│   ├── DashboardScreen.tsx    # Main home
│   ├── AccountsScreen.tsx     # Account list
│   ├── SettingsScreen.tsx     # App settings
│   └── ProfileScreen.tsx      # User profile
├── components/
│   ├── ProgressStepper.tsx    # KYC progress indicator
│   └── [shared components]    # Themed views, buttons, etc.
├── constants/
│   └── theme.ts               # Colors, spacing, typography
│
└── server/                    # Backend API Server
    ├── src/
    │   ├── index.ts           # Express server entry point
    │   ├── core/
    │   │   ├── config.ts      # Environment configuration
    │   │   ├── logger.ts      # Logging utility
    │   │   └── middleware/
    │   │       ├── auth.ts    # JWT authentication
    │   │       └── security.ts # Rate limiting, sanitization
    │   ├── api/
    │   │   └── routes/
    │   │       ├── health.ts  # Health check endpoints
    │   │       ├── auth.ts    # Authentication endpoints
    │   │       ├── kyc.ts     # KYC/compliance endpoints
    │   │       ├── documents.ts # DocuSign integration
    │   │       ├── assets.ts  # Asset/tokenization endpoints
    │   │       └── liquidity.ts # Lender syndicate endpoints
    │   └── modules/
    │       ├── docusign/      # DocuSign API integration
    │       ├── openai/        # OpenAI AI agent integration
    │       ├── canton/        # Canton Network blockchain
    │       ├── stewart/       # Stewart Title services
    │       ├── wolters/       # Wolters Kluwer lien services
    │       └── lenders/       # Private credit syndicate
    └── .env.example           # Environment variables template
```

## Backend API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Server health check |
| `/api/health/ready` | GET | Integration status |
| `/api/auth/session` | POST | Create session (SMS verification) |
| `/api/auth/device-attestation` | POST | Device verification |
| `/api/auth/me` | GET | Get current user |
| `/api/kyc/status` | GET | KYC verification status |
| `/api/kyc/submit` | POST | Submit KYC data |
| `/api/kyc/compliance-check` | POST | Run Dow Jones/LSEG checks |
| `/api/documents/sign` | POST | Initiate DocuSign envelope |
| `/api/documents/status/:id` | GET | Check document status |
| `/api/assets/verify` | POST | AI-powered asset verification |
| `/api/assets/tokenize` | POST | Tokenize asset on Canton |
| `/api/assets/portfolio` | GET | Get user portfolio |
| `/api/liquidity/offers` | GET | Get lender offers |
| `/api/liquidity/request` | POST | Request liquidity |
| `/api/liquidity/drawdown` | POST | Initiate drawdown |

## Environment Variables

Copy `server/.env.example` to configure:
- `API_PORT` - Backend port (default: 8080)
- `JWT_SECRET` - Token signing secret
- `DOCUSIGN_API_KEY` - DocuSign integration
- `OPENAI_API_KEY` - OpenAI for AI agents
- `CANTON_API_KEY` - Canton Network
- `STEWART_API_KEY` - Stewart Title
- `WOLTERS_KLUWER_API_KEY` - Wolters Kluwer

## Demo Credentials
- **SMS Code**: Enter `123456` to proceed through verification
- **Face Recognition**: Simulated - auto-proceeds after 3 seconds
- **2FA Auto-fill**: Simulated with random 6-digit code

## User Preferences
- Luxury, premium aesthetic with gold accents on dark background
- Minimal UI with focus on security messaging
- Animation-rich experience for premium feel
- No emojis in the application
- Green action color: #4ade80
- Screen background: #0d3612 (Illiquid Assets, LedgerToken, Optimus)

## Production Roadmap

### Phase 1: Foundation (Identity & Documents)
- DocuSign - Digital signatures for KYC, loan agreements
- OpenAI - AI agents for asset verification
- Cloudflare - Security, WAF, zero-trust ($5K credits available)

### Phase 2: Asset Verification
- Stewart Title - Real estate title verification
- Wolters Kluwer - Lien searches, UCC filings

### Phase 3: Tokenization & Liquidity
- Canton Network - Blockchain tokenization
- Private Credit Syndicate APIs - Lender connectivity

## Security Considerations
- JWT-based authentication with token refresh
- Rate limiting on all endpoints
- Input sanitization for XSS prevention
- Audit logging for compliance
- CORS configuration for frontend
- Helmet security headers

## Running the Application

**Frontend (Expo):**
```bash
npm run dev
```

**Backend (API Server):**
```bash
cd server && npx tsx src/index.ts
```

The frontend runs on port 5000, backend API on port 8080.
