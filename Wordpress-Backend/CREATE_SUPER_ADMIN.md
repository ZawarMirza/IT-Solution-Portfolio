# How to Create Super Admin

## Important Note
The super admin is created automatically when the **backend** starts (not the frontend). The `DbInitializer` runs when the backend application starts.

## Method 1: Start the Backend (Automatic Creation)

1. **Start the backend:**
   ```bash
   cd Wordpress-Backend
   dotnet run
   ```

2. The super admin will be automatically created when the backend starts.

3. **Super Admin Credentials:**
   - Email: `admin@example.com`
   - Password: `Admin@123`
   - Role: Admin

## Method 2: Manual Creation via API Endpoint

If the backend is already running but the super admin wasn't created, you can manually trigger it:

### Using curl:
```bash
curl -X POST http://localhost:5119/api/auth/populate-admin
```

### Using PowerShell:
```powershell
Invoke-RestMethod -Uri "http://localhost:5119/api/auth/populate-admin" -Method POST -ContentType "application/json"
```

### Using Postman or Browser:
1. Open Postman or any API client
2. Create a POST request to: `http://localhost:5119/api/auth/populate-admin`
3. Send the request

### Response:
```json
{
  "message": "Super admin created successfully",
  "credentials": {
    "email": "admin@example.com",
    "password": "Admin@123",
    "role": "Admin"
  },
  "note": "IMPORTANT: Change this password in production!"
}
```

## Method 3: Using Frontend (if you add a button)

You can also call this endpoint from the frontend if needed.

## Troubleshooting

### Backend Not Running
- Make sure the backend is running on `http://localhost:5119`
- Check the terminal for any errors

### Database Issues
- Ensure the database file `WordpressDb.db` exists
- Check that migrations have been applied

### User Already Exists
- If the user already exists, the endpoint will return a message saying so
- You can still use the credentials to login

## Quick Test

After creating the super admin, test login:
1. Go to `http://localhost:3000/login`
2. Use credentials:
   - Email: `admin@example.com`
   - Password: `Admin@123`
3. You should be able to login successfully

