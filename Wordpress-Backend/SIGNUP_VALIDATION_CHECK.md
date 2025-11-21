# Signup Validation Check

## Frontend Validation (SignupPage.js)

### Required Fields:
- ✅ firstName (required, trimmed)
- ✅ lastName (required, trimmed)
- ✅ email (required, valid email format)
- ✅ password (required, min 8 chars, strength check)
- ✅ confirmPassword (required, must match password)
- ✅ role (defaults to ROLES.USER)

### Password Requirements:
- Minimum 8 characters
- Strength score >= 3 (Good/Strong)
- Checks: length, numbers, special chars, upper/lower case

## Backend Validation (RegisterModel.cs)

### Required Fields:
- ✅ FirstName (required, max 100 chars)
- ✅ LastName (required, max 100 chars)
- ✅ Email (required, valid email format)
- ✅ Password (required, min 6 chars, max 100 chars)
- ✅ ConfirmPassword (required, must match Password)
- ✅ Role (optional, defaults to "User")

## Data Flow

### Frontend → Backend:
1. **SignupPage.js** sends:
   ```javascript
   {
     firstName: string,
     lastName: string,
     email: string,
     password: string,
     role: string
   }
   ```

2. **AuthContext.js** transforms to:
   ```javascript
   {
     FirstName: string,      // PascalCase for C#
     LastName: string,
     Email: string,
     Password: string,
     ConfirmPassword: string,  // Added (same as password)
     Role: string
   }
   ```

3. **Backend receives** RegisterModel with validation

## Potential Issues:

1. **Case Sensitivity**: Frontend now sends PascalCase to match C# model
2. **Password Length**: Frontend requires 8 chars, backend requires 6 chars (frontend is stricter)
3. **ConfirmPassword**: Frontend validates match, backend also validates match

## Testing:

1. Check browser console for "Sending registration data" log
2. Check backend logs for "Registration request received" log
3. Verify all fields are present and correct

