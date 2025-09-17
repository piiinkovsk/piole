#!/bin/sh
set -e

# Function to wait for postgres
wait_for_postgres() {
  echo "Waiting for postgres..."
  for i in $(seq 1 30); do
    npx prisma migrate deploy --preview-feature &> /dev/null && return 0
    echo "Waiting for postgres... $i/30"
    sleep 2
  done
  echo "Postgres is not available"
  return 1
}

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Wait for the database to be ready
wait_for_postgres

# Apply migrations
echo "Running migrations..."
npx prisma migrate deploy

# Run the appropriate seed based on environment
if [ "$NODE_ENV" = "production" ]; then
  echo "Production environment detected, running production seed..."
  # Try to run seed, but proceed even if it fails
  npx ts-node prisma/seed-prod.ts || echo "Warning: Production seed failed, but continuing app startup"
else
  echo "Development environment detected, running development seed..."
  # Try to run seed, but proceed even if it fails
  npx ts-node prisma/seed.ts || echo "Warning: Development seed failed, but continuing app startup"
fi

# Start the application
echo "Starting application..."
exec "$@"
