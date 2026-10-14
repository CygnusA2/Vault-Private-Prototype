# Vault Private — iOS MVP Development

## Project Title

**Vault Private — iOS MVP Development**

## Description

Vault Private is the intended external-user iOS TestFlight MVP for ultra-high-net-worth clients. The public GitHub source currently shows an earlier client-experience prototype covering onboarding, asset submission, AI-assisted analysis concepts, tokenization simulation, and a proposed liquidity journey. Persona, Plaid, and other API work is staged in the private E2E project for validation before promotion here. A screen or configuration does not establish a verified live integration or released TestFlight build.

The earlier client-experience prototype was developed on **Replit** to explore how those workflows could fit together. External provider connectivity and security properties require separate end-to-end verification.

---


## Maturity and validation

This public GitHub snapshot contains demonstration code and is the planned destination for the validated external-user iOS MVP. The private E2E repository is the integration and Maestro test stage. The current status of the Replit working tree and external TestFlight distribution must be verified separately. The presence of a screen, dependency, configuration key, or simulated transaction does not establish a live provider integration, production security control, completed KYC, legal document execution, credit decision, loan disbursement, or on-chain settlement. Validate any such capability separately before citing it in technical or investor diligence.

## Tech Stack

This project was built on **Replit** using a full-stack TypeScript architecture with a React Native mobile frontend, an Express backend API, and several third-party integrations for AI, document signing, tokenization simulation, and real estate infrastructure.

---

## Mobile Application

| Layer | Technology | Version |
|---|---|---|
| Framework | Expo | SDK 54 |
| Language | TypeScript | ~5.9 |
| Runtime | React Native | 0.81.5 |
| UI Library | React | 19.1.0 |
| Web Target | React Native Web | ~0.21.0 |

---

## Navigation

| Package | Version |
|---|---|
| React Navigation Core | ^7.1.8 |
| Native Stack Navigator | ^7.3.16 |
| Bottom Tabs Navigator | ^7.4.0 |

---

## UI & Animation

| Package | Purpose |
|---|---|
| `react-native-reanimated` ~4.1.1 | Gesture-driven animations |
| `react-native-gesture-handler` ~2.28.0 | Native gesture recognition |
| `react-native-worklets` 0.5.1 | UI-thread worklets |
| `expo-linear-gradient` ^15.0.7 | Gradient backgrounds and buttons |
| `expo-blur` ^15.0.7 | Frosted glass effects |
| `expo-glass-effect` ~0.1.6 | iOS liquid glass UI effects |
| `expo-symbols` ~1.0.7 | SF Symbols for iOS |
| `@expo/vector-icons` ^15.0.2 | Feather icon set |
| `react-native-svg` ^15.15.0 | SVG rendering |

---

## Device & System

| Package | Purpose |
|---|---|
| `react-native-safe-area-context` ~5.6.0 | Safe area insets |
| `react-native-screens` ~4.16.0 | Native screen containers |
| `react-native-keyboard-controller` 1.18.5 | Keyboard avoidance |
| `expo-haptics` ~15.0.7 | Tactile feedback |
| `expo-splash-screen` ~31.0.10 | Splash screen management |
| `expo-linking` ~8.0.8 | Deep linking |
| `expo-web-browser` ~15.0.9 | In-app browser |
| `expo-document-picker` ^14.0.7 | Document upload |
| `expo-sharing` ~14.0.8 | Native share sheet |
| `expo-image` ~3.0.10 | Optimized image rendering |
| `expo-constants` ~18.0.9 | App constants and environment variables |
| `expo-system-ui` ~6.0.8 | System UI customization |

---

## Backend API Server

| Layer | Technology | Version |
|---|---|---|
| Runtime | Node.js | 20+ |
| Framework | Express | ^4.18 / ^5.1 |
| Language | TypeScript | ^5.3 |
| Execution | tsx | ^4.6 |

---

## Backend Middleware & Security

| Package | Purpose |
|---|---|
| `helmet` ^7–8 | HTTP security headers |
| `cors` ^2.8.5 | Cross-origin resource sharing |
| `morgan` ^1.10 | HTTP request logging |
| `jsonwebtoken` ^9.0.2 | JWT authentication |
| `zod` ^3–4 | Runtime schema validation |
| `uuid` ^9–13 | Unique ID generation |
| `dotenv` ^16 | Environment variable loading |

---

## Third-Party Integrations

| Integration | Type | Capability |
|---|---|---|
| OpenAI API | Prototype configuration; live behavior not independently verified here | AI-assisted analysis concepts |
| DocuSign eSignature | Prototype configuration; live signing not independently verified here | Proposed digital signature workflow |
| Canton Network | Demo simulation | Asset tokenization with realistic blockchain-style transaction data |
| Stewart Title | API-ready | Real estate title search, escrow, and insurance quotes |
| Wolters Kluwer | API-ready | Lien searches, UCC filings, eVault workflow, and risk assessment support |

---

## Tooling & Code Quality

| Tool | Purpose |
|---|---|
| ESLint + `eslint-config-expo` | Code linting |
| Prettier ^3.6 | Code formatting |
| TypeScript strict mode | Type safety |
| Babel `module-resolver` | Path aliases |

---

## Application Flow

The prototype illustrates a proposed client journey:

1. **Client Onboarding**
   - UHNW client enters the private banking environment.
   - Secure authentication and onboarding screens introduce the Vault Private experience.

2. **KYC and Identity Verification**
   - Client information is collected.
   - Required documents can be uploaded using the document picker.
   - Verification flows are prepared for investor and client demonstrations.

3. **Asset Submission**
   - The client submits an illiquid asset such as real estate.
   - Asset details are captured for verification, tokenization simulation, and liquidity assessment.

4. **AI Asset Verification**
   - The OpenAI API is referenced for AI-assisted asset analysis; current live behavior requires verification.
   - The system reviews asset data and produces a structured verification-style output.

5. **Title, Lien, and Risk Infrastructure**
   - Stewart Title integration is prepared for real estate title search and escrow-related workflows.
   - Wolters Kluwer integration is prepared for lien searches, UCC filings, eVault logic, and risk assessment.

6. **Digital Signature Workflow**
   - DocuSign integration is represented in the prototype; a live end-to-end signing flow is not independently verified here.

7. **Tokenization Simulation**
   - Canton Network is simulated to demonstrate real-world asset tokenization logic.
   - The MVP displays a blockchain-style transaction flow for investor and client presentations.

8. **Liquidity Flow Simulation**
   - The client sees how a verified and tokenized illiquid asset could be converted into available liquidity.
   - The prototype demonstrates the strategic value proposition of faster access to capital without a forced asset sale.

9. **Portfolio and Wealth Advisory**
   - AI-assisted portfolio analysis provides additional context on liquidity, risk, and asset allocation.
   - The experience is designed to feel private, premium, and suitable for demanding UHNW clients.

---

## Key Features

- Premium UHNW private banking interface
- Secure onboarding and authentication journey
- AI-powered asset verification flow
- Document upload capability
- Proposed digital signature workflow
- Real-world asset tokenization simulation
- Canton Network-style blockchain transaction flow
- Liquidity conversion prototype
- Portfolio analysis and AI wealth advisory logic
- Prepared integrations for Stewart Title and Wolters Kluwer
- Built for investor demonstrations, strategic partner conversations, and early client validation

---

## Why This MVP Exists

Vault Private was created to demonstrate a new category of private digital banking infrastructure where illiquid assets can become a source of immediate liquidity. Traditional private banking, securities-backed lending, and real estate financing often involve slow, manual, and fragmented processes.

This MVP shows how Cygnus-A2 can combine AI, tokenization, digital signatures, title infrastructure, lien infrastructure, and private banking design into a faster and more intelligent workflow for UHNW clients.

---

## Replit Build Context

This project was developed on **Replit** to accelerate prototyping, testing, and iteration. Replit was used as the core development environment to build, run, and refine the MVP quickly without requiring a complex local setup.

The project uses:

- **TypeScript** for frontend and backend logic
- **React Native with Expo** for the mobile-first user experience
- **Node.js and Express** for the backend API server
- **OpenAI API** for AI-powered analysis
- **DocuSign API configuration** for a proposed digital signature workflow
- **Simulated Canton Network logic** for tokenization demonstrations
- **Prepared API architecture** for Stewart Title and Wolters Kluwer integrations

---

## Environment Variables

Create a `.env` file and add the required API keys when available:

```env
OPENAI_API_KEY=your_openai_api_key
DOCUSIGN_INTEGRATION_KEY=your_docusign_integration_key
DOCUSIGN_USER_ID=your_docusign_user_id
DOCUSIGN_ACCOUNT_ID=your_docusign_account_id
DOCUSIGN_PRIVATE_KEY=your_docusign_private_key

STEWART_TITLE_API_KEY=your_stewart_title_api_key
WOLTERS_KLUWER_API_KEY=your_wolters_kluwer_api_key

JWT_SECRET=your_jwt_secret
API_BASE_URL=your_backend_api_url
