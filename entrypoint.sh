#!/bin/sh

# Run the database deployment
bun run db:deploy

# Start the application
bun run start