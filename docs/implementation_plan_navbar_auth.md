# Implementation Plan - Navbar Profile & User Authentication UI

## Objective
Add a profile icon with user name and a logout button to the Navbar, visible only after user login. The implementation must be responsive and follow the existing design aesthetics.

## Changes

### 1. Updated `UserData` Interface
- **File**: `src/services/authService.ts`
- **Change**: Added optional `fullName` and `email` properties to the `UserData` interface to support displaying user information.

### 2. Modified `Navbar` Component
- **File**: `src/components/navfooter/Navbar.tsx`
- **Changes**:
    - Imported `useDispatch`, `useSelector` from `react-redux`.
    - Imported `logoutUser` action from `authSlice` and `RootState` from store.
    - Added `LogOut` icon from `lucide-react`.
    - Implemented logic to retrieve `user` and `isAuthenticated` state from Redux.
    - Created `handleLogout` function to dispatch logout action and redirect to home.
    - **Desktop View**:
        - Replaced "Login/Join" buttons with a user profile section (Icon + Name) and a Logout button when authenticated.
        - Hid the "Profile" navigation link if not authenticated.
    - **Mobile View**:
        - In the mobile drawer, replaced "Login/Join" links with user profile info and Logout button when authenticated.
        - Hid "Profile" link in the menu list if not authenticated.

### 3. Fixed `RootLayout` Structure & Conditional Rendering
- **File**: `src/components/layout/ClientLayout.tsx`
- **Change**: Created a new client component `ClientLayout` to conditionally render `Navbar` and `Footer`.
    - `Navbar` and `Footer` are hidden on `/login` and `/register` routes.
- **File**: `src/app/layout.tsx`
- **Change**: Replaced direct usage of `Navbar` and `Footer` with `ClientLayout` inside `Providers`. This ensures:
    1. Redux context is available to Navbar.
    2. Navbar/Footer are hidden on auth pages.

## Verification
- **Login State**: The user name and logout button should appear only when `isAuthenticated` is true.
- **Logout Action**: Clicking logout should clear the session (handled by `logoutUser` thunk) and redirect to home.
- **Responsiveness**: The UI adapts correctly to both desktop and mobile screens.
