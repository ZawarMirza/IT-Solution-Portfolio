#!/bin/bash
# Bash script to clear/reset the database
# Usage: ./scripts/clear-database.sh

DB_PATH="WordpressDb.db"
DB_BACKUP_PATH="WordpressDb.backup.db"

echo "========================================="
echo "Database Reset Script"
echo "========================================="
echo ""

if [ -f "$DB_PATH" ]; then
    echo "Found database: $DB_PATH"
    echo ""
    read -p "Do you want to DELETE the database? This will remove ALL data! (yes/no): " response
    
    if [ "$response" = "yes" ] || [ "$response" = "y" ]; then
        # Create backup first
        echo "Creating backup..."
        cp "$DB_PATH" "$DB_BACKUP_PATH" 2>/dev/null
        
        # Delete the database
        echo "Deleting database..."
        rm -f "$DB_PATH"
        
        echo "✓ Database deleted successfully!"
        echo ""
        echo "Backup saved as: $DB_BACKUP_PATH"
        echo ""
        echo "Next steps:"
        echo "1. Restart the backend (dotnet run)"
        echo "2. The database will be recreated automatically"
        echo "3. Super admin will be created automatically"
    else
        echo "Operation cancelled."
    fi
else
    echo "Database file not found: $DB_PATH"
    echo "The database will be created when you start the backend."
fi

echo ""
echo "========================================="

