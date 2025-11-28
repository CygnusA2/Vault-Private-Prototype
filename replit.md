# Vault Private - UHNW Private Banking App

## Overview
A proof-of-concept mobile app prototype for a proprietary authenticator and private banking experience designed for ultra-high net worth clients. This prototype demonstrates the envisioned user flow for investor and client presentations.

**Status**: Frontend prototype (demo mode - no real backend or data persistence)

## Recent Changes
- November 28, 2025: Initial prototype created
- Custom gold/dark luxury theme implemented
- Complete authentication flow with SMS verification simulation
- KYC onboarding with 5-step progressive disclosure
- Biometric enrollment simulation (fingerprint, iris)
- Face recognition login simulation with 2FA auto-fill
- Dashboard with mock account data
- **Pre-Approve screen added** - Now appears immediately after sign-in (both new users and returning users) before Dashboard
- Theme extended with cream (#E8D5B7) and sage (#A8C4B5) accent colors for Pre-Approve
- **Auth flow streamlined** - Phone entry and SMS verification consolidated into Welcome screen
- **Document screen updated** - Now requires 3 documents: Passport, National ID, Proof of Address (no older than 1 month)
- **Face scan animation added** - Up/down scanning line with progress percentage
- **Dow Jones Risk & Compliance** - New security layer added to Biometric Setup screen
- **California address** - Default address updated to Menlo Park, CA

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
│   ├── RootNavigator.tsx      # Auth/Main switch
│   ├── AuthStackNavigator.tsx # Onboarding flow
│   ├── MainTabNavigator.tsx   # 4-tab navigation
│   └── HomeStackNavigator.tsx # Home tab stack
├── screens/
│   ├── WelcomeScreen.tsx      # Phone entry + SMS verification combined
│   ├── KYCNameScreen.tsx      # Personal details (Step 1)
│   ├── KYCDocumentScreen.tsx  # Document upload - 3 required (Step 2)
│   ├── KYCSelfieScreen.tsx    # Face scan with animation (Step 3)
│   ├── KYCBiometricScreen.tsx # Biometric + Dow Jones (Step 4)
│   ├── KYCAddressScreen.tsx   # California address (Step 5)
│   ├── PreApproveScreen.tsx   # Pre-approval document upload
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

## Key Features Demonstrated

### New User Onboarding
1. **Welcome screen** - Phone entry with country code picker, auto-sends SMS code
2. **SMS verification** - 6-digit code entry on same screen (demo: use 123456)
3. **Personal Details** - First name, last name, email (Step 1)
4. **Identity Documents** - Upload 3 required docs: Passport, National ID, Proof of Address (Step 2)
5. **Photo Verification** - Face scan with animated up/down scanning line (Step 3)
6. **Biometric Setup** - Fingerprint, Iris Recognition, Dow Jones Risk & Compliance check (Step 4)
7. **Address Details** - California address auto-fill: 2800 Sand Hill Road, Menlo Park (Step 5)
8. **Pre-Approve screen** - Document upload simulation
9. Continue to Dashboard

### Returning User Login
1. Face recognition simulation
2. Automatic 2FA code delivery and auto-fill
3. **Pre-Approve screen** (same as new users)
4. Seamless transition to dashboard

### Main App
- **Home Tab**: Welcome card, balance, quick actions, transactions
- **Accounts Tab**: List of accounts with balances
- **Settings Tab**: Security, profile, preferences
- **Profile Tab**: User info, verification badges

## KYC Document Requirements
1. **Passport** - Valid government-issued passport
2. **National ID Card** - Front and back of national ID
3. **Proof of Address** - Utility bill or bank statement, no older than 1 month

## Security Features
- **Fingerprint** - Biometric enrollment simulation
- **Iris Recognition** - Enhanced security biometric
- **Dow Jones Risk & Compliance** - Deep due diligence against global sanctions and watchlists

## Future Development (Production Phase)
- Real SMS gateway integration (Twilio)
- Actual biometric authentication (FaceID, TouchID)
- Backend API with secure data storage
- KYC/AML compliance integration
- Real banking operations
- Security audit and penetration testing
