# Vault Private - UHNW Private Banking App

## Overview
A proof-of-concept mobile app prototype for a proprietary authenticator and private banking experience designed for ultra-high net worth clients. This prototype demonstrates the complete transaction flow for investor and client presentations.

**Status**: Full-stack application with Node.js/TypeScript backend API and live third-party integrations

## Recent Changes
- November 29, 2025: Enhanced Canton Network with polished demo simulation (staged tokenization progress)
- November 29, 2025: Added Stewart Title real API integration (title search, escrow, insurance quotes)
- November 29, 2025: Added Wolters Kluwer real API integration (lien search, UCC filings)
- November 29, 2025: New tokenization status polling endpoint for frontend progress display
- November 28, 2025: OpenAI integration live (AI asset verification, portfolio analysis)
- November 28, 2025: DocuSign integration live (digital signatures for KYC, loan agreements)
- Backend API with modular architecture for third-party integrations
- Security middleware (JWT auth, rate limiting, input sanitization)
- Initial prototype created with custom gold/dark luxury theme

## Integration Status

| Integration | Status | Capabilities |
|-------------|--------|--------------|
| **OpenAI** | LIVE | AI asset verification, portfolio analysis, wealth advisor chat |
| **DocuSign** | LIVE | Digital signatures for KYC, loan agreements, tokenization consent |
| **Stewart Title** | READY | Title search, escrow services, insurance quotes (add API key to enable) |
| **Wolters Kluwer** | READY | Lien searches, UCC filings, risk assessment (add API key to enable) |
| **Canton Network** | DEMO | Polished simulation with realistic timing, staged progress, blockchain-like IDs |

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
    │   │       ├── assets.ts  # Asset/tokenization/title/lien endpoints
    │   │       └── liquidity.ts # Lender syndicate endpoints
    │   └── modules/
    │       ├── docusign/      # DocuSign eSignature API (LIVE)
    │       ├── openai/        # OpenAI GPT-4 integration (LIVE)
    │       ├── canton/        # Canton Network simulation (DEMO)
    │       ├── stewart/       # Stewart Title API (READY)
    │       ├── wolters/       # Wolters Kluwer Lien Services (READY)
    │       └── lenders/       # Private credit syndicate
    └── .env.example           # Environment variables template
```

## Backend API Endpoints

### Health & Auth
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Server health check |
| `/api/health/ready` | GET | Integration status |
| `/api/auth/session` | POST | Create session (SMS verification) |
| `/api/auth/device-attestation` | POST | Device verification |
| `/api/auth/me` | GET | Get current user |

### KYC & Compliance
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/kyc/status` | GET | KYC verification status |
| `/api/kyc/submit` | POST | Submit KYC data |
| `/api/kyc/compliance-check` | POST | Run Dow Jones/LSEG checks |

### Documents (DocuSign)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/documents/sign` | POST | Initiate DocuSign envelope |
| `/api/documents/status/:id` | GET | Check document status |

### Assets & Tokenization
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/assets/verify` | POST | AI-powered asset verification (OpenAI) |
| `/api/assets/tokenize` | POST | Initiate tokenization (staged demo) |
| `/api/assets/tokenization/:id/status` | GET | Poll tokenization progress |
| `/api/assets/portfolio` | GET | Get user portfolio |
| `/api/assets/tokens` | GET | Get token balances |
| `/api/assets/transactions` | GET | Transaction history |
| `/api/assets/title-search` | POST | Stewart Title search |
| `/api/assets/lien-search` | POST | Wolters Kluwer lien search |

### Liquidity
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/liquidity/offers` | GET | Get lender offers |
| `/api/liquidity/request` | POST | Request liquidity |
| `/api/liquidity/drawdown` | POST | Initiate drawdown |

## Canton Network Tokenization Flow (Demo)

The tokenization demo provides a polished, realistic simulation for investor presentations:

1. **Initiate** - POST to `/api/assets/tokenize` returns `transactionId`
2. **Poll** - GET `/api/assets/tokenization/:transactionId/status` for progress
3. **Stages** (automatic progression over ~30 seconds):
   - `pending` (0%) - Initializing request
   - `validating` (15-45%) - Verifying ownership, title, liens
   - `tokenizing` (55-75%) - Smart contract deployment, minting
   - `confirming` (85-95%) - Network consensus
   - `confirmed` (100%) - Complete with blockchain data

Response includes authentic-looking:
- Canton transaction IDs (`CANTON_K8X2M_A7B3`)
- Contract addresses (`0x...`)
- Block numbers, gas used, merkle proofs
- Token metadata and compliance checks

## Environment Variables

**Required (in Secrets tab):**
- `DOCUSIGN_API_KEY` - DocuSign Integration Key
- `DOCUSIGN_ACCOUNT_ID` - DocuSign Account ID
- `OPENAI_API_KEY` - OpenAI API Key

**Optional (add to enable real APIs):**
- `STEWART_API_KEY` - Stewart Title API Key
- `STEWART_API_URL` - Stewart Title base URL
- `WOLTERS_KLUWER_API_KEY` - Wolters Kluwer API Key
- `WOLTERS_KLUWER_API_URL` - Wolters Kluwer base URL

**System:**
- `JWT_SECRET` - Token signing secret
- `API_PORT` - Backend port (default: 8080)

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

### Phase 1: Foundation (COMPLETE)
- DocuSign - Digital signatures for KYC, loan agreements
- OpenAI - AI agents for asset verification

### Phase 2: Asset Verification (READY)
- Stewart Title - Real estate title verification (add API key)
- Wolters Kluwer - Lien searches, UCC filings (add API key)

### Phase 3: Tokenization & Liquidity
- Canton Network - Live blockchain (when ready for production)
- Private Credit Syndicate APIs - Lender connectivity

### Infrastructure
- Cloudflare - Security, WAF, zero-trust ($5K credits available)

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
