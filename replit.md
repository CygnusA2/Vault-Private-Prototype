# Vault Private - UHNW Private Banking App

## Overview
A proof-of-concept mobile app prototype for a proprietary authenticator and private banking experience designed for ultra-high net worth clients. This prototype demonstrates the complete transaction flow for investor and client presentations.

**Status**: Frontend prototype (demo mode - no real backend or data persistence)

## Recent Changes
- November 28, 2025: Initial prototype created
- Custom gold/dark luxury theme implemented
- Complete authentication flow with SMS verification simulation
- KYC onboarding with 5-step progressive disclosure
- Biometric enrollment simulation (fingerprint, iris with scanning animation)
- Face recognition login simulation with 2FA auto-fill
- Dashboard with mock account data
- **Pre-Approve screen** - Auto-checks Government ID and Proof of Address (verified from KYC)
- **Iris Recognition** - Now includes eye scanning animation with up/down scan line
- **Illiquid Assets screen** - AI Agent asset analysis with portfolio verification
- **LedgerToken screen** - Asset-to-token conversion with progress animation
- **Optimus screen** - Token-to-cash liquidity conversion

## Project Architecture

### Tech Stack
- **Framework**: Expo SDK 54 with React Native
- **Navigation**: React Navigation 7 (Stack + Bottom Tabs)
- **Animations**: React Native Reanimated
- **Styling**: StyleSheet with custom theme constants

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
└── constants/
    └── theme.ts               # Colors, spacing, typography
```

### Demo Credentials
- **SMS Code**: Enter `123456` to proceed through verification
- **Face Recognition**: Simulated - auto-proceeds after 3 seconds
- **2FA Auto-fill**: Simulated with random 6-digit code

## User Preferences
- Luxury, premium aesthetic with gold accents on dark background
- Minimal UI with focus on security messaging
- Animation-rich experience for premium feel
- No emojis in the application

## Complete Transaction Flow

### New User Onboarding
1. **Welcome screen** - Phone entry, auto-sends SMS code
2. **SMS verification** - 6-digit code (demo: 123456)
3. **Personal Details** - First name, last name, email (Step 1)
4. **Identity Documents** - 3 required docs (Step 2)
5. **Photo Verification** - Face scan with animation (Step 3)
6. **Biometric Setup** - Fingerprint, Iris scan, Dow Jones check (Step 4)
7. **Address Details** - California address auto-fill (Step 5)

### Transaction Processing
8. **Pre-Approve** - Government ID & Proof of Address auto-checked
   - Only requires: Proof of Ownership + Asset Documentation
   - Auto-navigates when complete
9. **Illiquid Assets** - AI Agent analyzes asset portfolio
   - Shows: Real Estate, Art, Private Equity, Wine
   - "Analyze All" or tap individual assets
   - Auto-navigates when all analyzed
10. **LedgerToken** - Converts assets to tokens
    - Shows conversion rate: 1 LT = $1,000
    - "Start Tokenization" with progress animation
    - Auto-navigates when complete
11. **Optimus** - Converts tokens to cash
    - Final liquidity conversion
    - "Convert to Cash" with progress
    - Auto-navigates to Dashboard

### Dashboard
- Welcome card, balance display, quick actions, transactions
- Account management, settings, profile

## Biometric Features
- **Fingerprint** - Toggle enrollment simulation
- **Iris Recognition** - Eye scanning animation with:
  - Eyeball graphic with pupil
  - Scan line moving up/down
  - Progress percentage display
  - Success confirmation
- **Dow Jones Risk & Compliance** - Sanctions/watchlist check simulation

## Asset Categories
1. **Real Estate Portfolio** - $4,250,000
2. **Art Collection** - $1,850,000
3. **Private Equity Holdings** - $2,500,000
4. **Wine Collection** - $320,000
- Total Portfolio: $8,920,000

## Future Development (Production Phase)
- Real SMS gateway integration (Twilio)
- Actual biometric authentication (FaceID, TouchID)
- Backend API with secure data storage
- KYC/AML compliance integration
- Real banking operations
- Security audit and penetration testing
