#!/bin/bash
# Bash script to create super admin
# Usage: ./scripts/create-admin.sh

API_URL="http://localhost:5119/api/auth/populate-admin"

echo "Creating Super Admin..."
echo ""

response=$(curl -s -X POST "$API_URL" -H "Content-Type: application/json")

if [ $? -eq 0 ]; then
    echo "✓ Super Admin Created Successfully!"
    echo ""
    echo "Credentials:"
    echo "$response" | grep -o '"email":"[^"]*"' | sed 's/"email":"\(.*\)"/  Email: \1/'
    echo "$response" | grep -o '"password":"[^"]*"' | sed 's/"password":"\(.*\)"/  Password: \1/'
    echo "$response" | grep -o '"role":"[^"]*"' | sed 's/"role":"\(.*\)"/  Role: \1/'
    echo ""
    echo "⚠️  IMPORTANT: Change this password in production!"
else
    echo "✗ Error creating super admin"
    echo "Make sure the backend is running on http://localhost:5119"
fi

