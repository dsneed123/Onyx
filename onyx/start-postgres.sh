#!/bin/bash

# Start PostgreSQL
echo "Starting PostgreSQL..."
sudo systemctl start postgresql

# Check status
sudo systemctl status postgresql --no-pager

# Create database user if needed
echo ""
echo "Creating database user..."
sudo -u postgres psql -c "CREATE USER dsneedy WITH PASSWORD 'onyx123' CREATEDB;" 2>/dev/null || echo "User may already exist"
sudo -u postgres psql -c "ALTER USER dsneedy WITH SUPERUSER;" 2>/dev/null

echo ""
echo "PostgreSQL is ready! You can now run: cd onyx/backend && npm run db:setup"
