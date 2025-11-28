# Design Guidelines: UHNW Private Banking App

## 1. Authentication & Navigation

### Auth Flow
- **Primary**: SMS-based phone verification (no email/password)
- **2FA**: TOTP via SMS with simulated biometric auto-fill
- **Biometrics**: Mock facial recognition, fingerprint, iris enrollment

**Auth Screens:**
Welcome → Phone Entry → SMS Verification → KYC (5 steps) → Biometric Setup → Dashboard

**Returning Users:**
Face Recognition → 2FA Auto-fill → Dashboard

### Navigation Structure
**Onboarding**: Stack navigation (linear flow)

**Main App**: 4-tab navigation + FAB
- Tabs: Home, Accounts, Settings, Profile
- FAB: Transfers/Payments (bottom-right)

---

## 2. Screen Layouts

### Safe Areas & Headers
- **Transparent Header**: `top: insets.top + Spacing.xxl`, `bottom: insets.bottom + Spacing.xxl`
- **Default Header**: `top: headerHeight + Spacing.xl`, `bottom: insets.bottom + Spacing.xl`
- **Tab Screens**: `bottom: tabBarHeight + Spacing.xl`

### Screen Specifications

**Welcome Screen**
- Transparent header, full-screen branded gradient background
- Centered logo, 2 CTAs: "Get Started" (primary), "Sign In" (secondary)

**Phone Number Entry**
- Default header with back button
- Country code picker + phone input, submit button below

**SMS Verification**
- 6-digit OTP (individual boxes), auto-verify on completion
- Resend link with countdown timer

**KYC Onboarding (5 Steps)**
- Progress indicator (X/5), back button (left), continue/done (right)
- **Step 1**: Full Name fields
- **Step 2**: Passport/ID upload (camera simulation + upload option)
- **Step 3**: Selfie (oval guide overlay, retake option)
- **Step 4**: Biometric enrollment (fingerprint/iris toggles, skip option)
- **Step 5**: Address details (auto-detected location, editable fields)

**Face Recognition Login**
- Transparent header, centered scanning animation
- Status text: "Recognizing..." → "Welcome back, [Name]"
- Auto-transition to 2FA

**2FA Auto-Fill**
- Animated 6-digit code display, "Code sent via SMS" subtext
- Auto-transition to dashboard

**Dashboard (Home)**
- Transparent header, notification bell (right)
- Content: Welcome card, total balance card, recent transactions (3-5), quick actions grid (Transfer, Pay, Invest, Support)

**Settings**
- Default header, grouped list:
  - **Security**: 2FA, Biometrics toggle, PIN
  - **Profile**: Personal details, Documents
  - **Preferences**: Notifications, Language, Currency
  - **About**: Terms, Privacy, Version
  - Log Out (red, confirmation alert)

**Profile**
- Transparent header, Edit button (right)
- Content: Large avatar, name, account number, verified badges (Phone, ID, Biometrics), account cards

---

## 3. Design System

### Colors
**Primary**
- Primary: `#C9A961` (Gold - CTAs, accents)
- Primary Dark: `#A68947` (Pressed states)
- Primary Light: `#E5D4A8` (Highlights)

**Neutrals**
- Background: `#0A0E14`, Surface: `#1A1F2E`, Surface Light: `#252B3A`, Border: `#2D3548`
- Text Primary: `#FFFFFF`, Text Secondary: `#A0A8B8`, Text Tertiary: `#6B7280`

**Semantic**
- Success: `#10B981`, Error: `#EF4444`, Warning: `#F59E0B`, Info: `#3B82F6`

### Typography
**Font**: System default (SF/Roboto)

**Scale**
- Display: 32px/700/40px (Welcome screens)
- H1: 28px/600/36px (Screen titles)
- H2: 24px/600/32px (Card titles)
- H3: 20px/600/28px (Sections)
- Body Large: 17px/400/24px (Primary)
- Body: 15px/400/22px (Standard)
- Caption: 13px/400/18px (Metadata)
- Label: 11px/600/16px/UPPERCASE (Forms)

**Financial Numbers**: Tabular/monospace, Weight 600

### Visual Patterns

**Touch Feedback**
- Scale down to 0.97 on press
- Buttons: 50% opacity overlay
- List items: Surface color change (`#252B3A` → `#2D3548`)

**Cards**
- Border radius: 16px (cards), 12px (buttons)
- NO drop shadows, use surface color differentiation
- 1px border (`Border` color)
- Card spacing: 16px

**Forms**
- Input height: 48px, radius: 8px
- Background: `#1A1F2E`, border: 1px `#2D3548` (focus: Primary)
- Label above, caption below
- Error state: Red border + red caption

**Icons**
- Feather icons (@expo/vector-icons)
- Sizes: 24px (standard), 20px (list), 32px (feature)
- Colors: Text Secondary (inactive), Primary (active)

**FAB**
- Size: 56x56px circle, bottom-right, 16px from edges
- Shadow: `{width: 0, height: 4}`, opacity: 0.15, radius: 8
- Background: Primary Gold gradient

**Progress**
- Stepper: Horizontal dots, Primary fill for completed
- Loading: Circular spinner (Primary)
- Bar: 4px height, rounded, Primary fill

**Animations**
- Spring animations, 300-400ms
- Biometric scans: 1.5s pulsing cycle
- Code entry: Staggered slide-in per digit

---

## 4. Accessibility

- **Contrast**: Text Primary on Background meets WCAG AAA
- **Touch Targets**: Minimum 44x44px
- **Focus States**: Primary color border for keyboard navigation
- **Labels**: All inputs have accessible labels
- **Error Announcements**: Screen reader friendly error messages
- **Biometric Fallback**: Always provide manual code entry option

---

## 5. Required Assets

1. **Bank logo** (SVG, white version)
2. **App icon** (1024x1024px, gold emblem on dark)
3. **Face recognition overlay** (oval, gold accent)
4. **Fingerprint animation** (concentric circles, gold gradient)
5. **Iris scanning visual** (eye outline, scanning line)
6. **6 preset avatars** (abstract geometric, gold/navy, no faces)
7. **Verification badge** (green checkmark circle)
8. **Security shield icon**
9. **Empty state illustration** (minimal line art, gold)
10. **Passport/ID placeholder** (upload template)

**Asset Style**: Minimal, high-contrast, refined luxury aesthetic, gold accents for emphasis only.

---

## 6. Implementation Notes

**State Management**: Local simulation for prototype (no real SMS/backend)

**Key Components**:
- Custom 6-box OTP input
- Country code picker
- Progress stepper
- Grouped settings list
- Animated biometric scanners
- Balance/transaction cards

**Platform Considerations**:
- Use platform-specific safe area insets
- Respect system font sizing preferences
- Test on both iOS and Android for header/tab bar heights