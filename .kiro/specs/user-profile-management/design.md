# Design Document: User Profile Management

## Overview

The User Profile Management feature provides a comprehensive interface for authenticated staff members to manage their personal profile information, system preferences, and notifications. The design integrates profile editing capabilities with theme and language preferences in the header, creating a unified user experience. The system uses localStorage for preference persistence and integrates with the existing API client for backend communication.

### Key Design Principles

1. **Separation of Concerns**: Profile management, preferences (theme/language), and notifications are logically separated but visually integrated
2. **Persistence**: User preferences are persisted to localStorage for cross-session consistency
3. **Real-time Feedback**: Validation errors and notification updates provide immediate user feedback
4. **Accessibility**: All components follow existing UI patterns and accessibility standards
5. **API Integration**: Uses existing API client for all backend communication

## Architecture

### Component Structure

```
ProfilePage (Main Container)
├── ProfileSection
│   ├── EditableFieldsGroup
│   │   ├── FirstNameInput
│   │   ├── MiddleNameInput
│   │   ├── LastNameInput
│   │   ├── EmailInput
│   │   └── PhoneNumberInput
│   ├── ReadOnlyFieldsGroup
│   │   ├── UsernameDisplay
│   │   ├── RoleDisplay
│   │   ├── WingDisplay
│   │   ├── CollegeDisplay
│   │   ├── SchoolDisplay
│   │   ├── DepartmentDisplay
│   │   └── AdministrativeUnitDisplay
│   ├── ValidationErrorDisplay
│   └── SaveButton
│
├── HeaderEnhancements
│   ├── ThemeToggleIcon
│   │   └── ThemeProvider (manages theme state)
│   ├── LanguagePreferenceIcon
│   │   └── LanguageProvider (manages language state)
│   └── NotificationIcon
│       ├── NotificationBadge (shows unread count)
│       └── NotificationPanel
│           ├── NotificationList
│           └── NotificationItem (with category and read/unread toggle)
```

### Data Flow

```
User Input (Profile Fields)
    ↓
Validation Layer (Phone, Name validation)
    ↓
Error Display (if validation fails)
    ↓
API Call (if validation passes)
    ↓
Backend Processing
    ↓
Success/Error Response
    ↓
UI Update (success message or error display)
```

### Theme and Language Flow

```
User Clicks Icon
    ↓
Provider Updates State
    ↓
State Persisted to LocalStorage
    ↓
UI Re-renders with New Theme/Language
    ↓
Preference Loaded on Next Session from LocalStorage
```

### Notification Flow

```
Backend Event (Request/Return/Transfer/Message)
    ↓
Notification Created
    ↓
Notification Added to User's Queue
    ↓
Unread Count Incremented
    ↓
Badge Updated in Real-time
    ↓
User Clicks Notification Icon
    ↓
Notification Panel Opens
    ↓
User Clicks Notification
    ↓
Read/Unread Status Toggled
    ↓
Unread Count Updated
```

## Components and Interfaces

### ProfilePage Component

**Purpose**: Main container for the profile management interface

**Props**:
- None (uses authentication context to get current user)

**State**:
- `profileData`: Object containing user's profile information
- `editedData`: Object containing unsaved changes
- `validationErrors`: Object mapping field names to error messages
- `loading`: Boolean indicating if data is being fetched
- `saving`: Boolean indicating if changes are being saved
- `successMessage`: String containing success feedback
- `errorMessage`: String containing error feedback

**Responsibilities**:
- Fetch user profile data on mount
- Display editable and read-only fields
- Handle form submission and validation
- Display validation errors and feedback messages
- Integrate with API client for updates

### ThemeProvider Component

**Purpose**: Manages theme state and persistence

**Props**:
- `children`: React components to render

**State**:
- `theme`: Current theme ('light' or 'dark')

**Responsibilities**:
- Load theme preference from localStorage on mount
- Persist theme changes to localStorage
- Provide theme context to child components
- Apply theme to document root

**LocalStorage Key**: `user-theme-preference`

### LanguageProvider Component

**Purpose**: Manages language state and persistence

**Props**:
- `children`: React components to render

**State**:
- `language`: Current language ('en' or 'am')

**Responsibilities**:
- Load language preference from localStorage on mount
- Persist language changes to localStorage
- Provide language context to child components
- Update UI text based on selected language

**LocalStorage Key**: `user-language-preference`

### NotificationSystem Component

**Purpose**: Manages notifications and unread count

**State**:
- `notifications`: Array of notification objects
- `unreadCount`: Number of unread notifications
- `panelOpen`: Boolean indicating if notification panel is open

**Responsibilities**:
- Fetch notifications from backend
- Track unread count
- Update badge in real-time
- Handle read/unread status toggling
- Display notifications in panel

**Notification Object Structure**:
```typescript
{
  id: string;
  category: 'request' | 'return' | 'transfer' | 'message';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  relatedId?: string; // ID of related asset/request
}
```

### Validation System

**Phone Number Validation**:
- Pattern: `/^\+251[79]\d{8}$/`
- Validates format: +251[79]XXXXXXXX
- Returns error if invalid or empty (optional field)

**Name Field Validation**:
- Pattern: `/^[a-zA-Z\s]*$/`
- Allows letters and spaces only
- firstName and lastName are required
- middleName is optional

**Email Validation**:
- Pattern: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- Standard email format validation

## Data Models

### UserProfile

```typescript
interface UserProfile {
  id: string;
  username: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  role: 'staff' | 'approval_authority' | 'property_officer' | 'administrator';
  wing: 'academic' | 'administrative';
  // Academic wing fields
  college?: string;
  school?: string;
  department?: string;
  // Administrative wing fields
  administrativeUnit?: string;
}
```

### ValidationError

```typescript
interface ValidationError {
  field: string;
  message: string;
}
```

### Notification

```typescript
interface Notification {
  id: string;
  userId: string;
  category: 'request' | 'return' | 'transfer' | 'message';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  relatedId?: string;
}
```

### ThemePreference

```typescript
type ThemePreference = 'light' | 'dark';
```

### LanguagePreference

```typescript
type LanguagePreference = 'en' | 'am';
```

## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Profile Data Persistence Round Trip

*For any* valid user profile data, when a staff member updates their profile and saves it, then retrieving the profile from the backend should return the same updated data.

**Validates: Requirements 2.2, 2.5, 12.2**

### Property 2: Phone Number Validation Consistency

*For any* phone number input, if the input matches the Ethiopian format pattern +251[79]XXXXXXXX, then the validation should pass and form submission should be allowed; if the input does not match the pattern and is non-empty, then validation should fail and form submission should be prevented.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

### Property 3: Name Field Validation Consistency

*For any* name field input (firstName, middleName, lastName), if the input contains only letters and spaces, then validation should pass; if the input contains any other characters, then validation should fail and display an error message.

**Validates: Requirements 4.1, 4.2, 4.3**

### Property 4: Theme Persistence Across Sessions

*For any* theme selection (light or dark), when a staff member selects a theme and the page is reloaded, the previously selected theme should be restored from localStorage.

**Validates: Requirements 5.3, 5.4, 5.5**

### Property 5: Language Persistence Across Sessions

*For any* language selection (English or Amharic), when a staff member selects a language and the page is reloaded, the previously selected language should be restored from localStorage.

**Validates: Requirements 6.3, 6.4, 6.5**

### Property 6: Unread Count Accuracy

*For any* set of notifications, the unread count badge should equal the number of notifications where isRead is false, and when a notification's read status is toggled, the unread count should update accordingly.

**Validates: Requirements 7.2, 7.3, 7.4, 8.4, 8.5**

### Property 7: Notification Category Assignment

*For any* notification created by the system, the notification should be assigned exactly one category from the set {request, return, transfer, message} based on the event type that triggered it.

**Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.5**

### Property 8: Read-Only Fields Immutability

*For any* read-only field (username, role, wing, college, school, department, administrativeUnit), when displayed on the profile page, the field should not be editable and user input should not modify the underlying data.

**Validates: Requirements 1.3, 1.5, 11.2**

### Property 9: Editable Fields Modifiability

*For any* editable field (firstName, middleName, lastName, email, phoneNumber), when a staff member modifies the field value, the ProfilePage should reflect the change in the input field before submission.

**Validates: Requirements 1.2, 1.4, 2.1**

### Property 10: API Error Handling

*For any* API error response, when the Backend_API returns an error during profile update, the ProfilePage should display an error message containing the error details and prevent the success message from being displayed.

**Validates: Requirements 2.4, 12.4, 12.5**

## Error Handling

### Validation Errors

**Phone Number Errors**:
- Invalid format: "Phone number must be in format +251[79]XXXXXXXX"
- Displayed below phone input field
- Prevents form submission

**Name Field Errors**:
- Invalid characters: "Name can only contain letters and spaces"
- Required field empty: "This field is required"
- Displayed below respective input field
- Prevents form submission

**Email Errors**:
- Invalid format: "Please enter a valid email address"
- Displayed below email input field
- Prevents form submission

### API Errors

**Profile Update Errors**:
- Network error: "Unable to connect to server. Please check your connection."
- Server error: Display error message from backend
- Validation error: Display field-specific error from backend
- Displayed in error message box at top of form

### User Feedback

**Success Messages**:
- "Profile updated successfully"
- Displayed for 3-5 seconds then auto-dismiss
- Green background with success icon

**Error Messages**:
- Displayed in red box with error icon
- Persist until user dismisses or corrects the issue

## Testing Strategy

### Unit Testing

Unit tests validate specific examples, edge cases, and error conditions:

1. **Profile Data Display Tests**
   - Test that editable fields are rendered as inputs
   - Test that read-only fields are rendered as disabled/text
   - Test that all expected fields are present

2. **Validation Tests**
   - Test phone number validation with valid Ethiopian numbers
   - Test phone number validation with invalid formats
   - Test name field validation with letters and spaces
   - Test name field validation with invalid characters
   - Test email validation with valid and invalid formats
   - Test required field validation

3. **Theme Persistence Tests**
   - Test theme toggle updates localStorage
   - Test theme loads from localStorage on mount
   - Test theme applies to document

4. **Language Persistence Tests**
   - Test language toggle updates localStorage
   - Test language loads from localStorage on mount
   - Test language changes UI text

5. **Notification Tests**
   - Test unread count calculation
   - Test notification read/unread toggle
   - Test notification category assignment
   - Test notification panel open/close

6. **API Integration Tests**
   - Test successful profile update
   - Test API error handling
   - Test error message display

### Property-Based Testing

Property-based tests validate universal properties across all inputs:

1. **Property 1: Profile Data Persistence Round Trip**
   - Generate random valid profile data
   - Update profile with generated data
   - Retrieve profile from backend
   - Assert retrieved data matches sent data

2. **Property 2: Phone Number Validation Consistency**
   - Generate valid Ethiopian phone numbers
   - Assert validation passes
   - Generate invalid phone numbers
   - Assert validation fails

3. **Property 3: Name Field Validation Consistency**
   - Generate strings with only letters and spaces
   - Assert validation passes
   - Generate strings with invalid characters
   - Assert validation fails

4. **Property 4: Theme Persistence Across Sessions**
   - Set theme to light/dark
   - Simulate page reload
   - Assert theme is restored from localStorage

5. **Property 5: Language Persistence Across Sessions**
   - Set language to English/Amharic
   - Simulate page reload
   - Assert language is restored from localStorage

6. **Property 6: Unread Count Accuracy**
   - Generate random notifications with mixed read/unread status
   - Assert unread count equals number of unread notifications
   - Toggle notification read status
   - Assert unread count updates correctly

7. **Property 7: Notification Category Assignment**
   - Generate notifications of each category type
   - Assert each notification has exactly one valid category

8. **Property 8: Read-Only Fields Immutability**
   - Attempt to modify read-only fields
   - Assert underlying data is not changed

9. **Property 9: Editable Fields Modifiability**
   - Modify editable fields with random valid data
   - Assert ProfilePage reflects changes before submission

10. **Property 10: API Error Handling**
    - Simulate API error responses
    - Assert error message is displayed
    - Assert success message is not displayed

### Test Configuration

- Minimum 100 iterations per property test
- Each property test tagged with feature name and property number
- Tag format: `Feature: user-profile-management, Property {number}: {property_text}`
- Both unit tests and property tests required for comprehensive coverage
