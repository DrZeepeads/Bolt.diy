#!/bin/bash

set -e

echo "Running precommit checks..."

# Run type checking
echo "Running type check..."
npm run typecheck

# Run tests
echo "Running tests..."
npm run test

echo "All precommit checks passed!"
