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
- KYC screens simplified for demo - Continue buttons work without requiring all steps
- Theme extended with cream (#E8D5B7) and sage (#A8C4B5) accent colors for Pre-Approve

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
│   ├── WelcomeScreen.tsx      # Landing page
│   ├── PhoneEntryScreen.tsx   # Phone number input
│   ├── SMSVerificationScreen.tsx # 6-digit OTP
│   ├── KYCNameScreen.tsx      # Personal details (Step 1)
│   ├── KYCDocumentScreen.tsx  # ID upload (Step 2)
│   ├── KYCSelfieScreen.tsx    # Photo verification (Step 3)
│   ├── KYCBiometricScreen.tsx # Biometric setup (Step 4)
│   ├── KYCAddressScreen.tsx   # Address details (Step 5)
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
1. Welcome screen with "Get Started" / "Sign In" options
2. Phone number entry with country code picker
3. SMS verification (demo: use 123456)
4. 5-step KYC: Name → Document → Selfie → Biometrics → Address
5. Automatic location detection for address auto-fill
6. **Pre-Approve screen** with document upload simulation
7. Continue to Dashboard

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

## Future Development (Production Phase)
- Real SMS gateway integration (Twilio)
- Actual biometric authentication (FaceID, TouchID)
- Backend API with secure data storage
- KYC/AML compliance integration
- Real banking operations
- Security audit and penetration testing
