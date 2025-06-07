#!/bin/bash

set -e

echo "Running precommit checks..."

# Determine package manager (prefer pnpm as project uses it)
if command -v pnpm &> /dev/null; then
    PKG_MANAGER="pnpm"
elif command -v npm &> /dev/null; then
    PKG_MANAGER="npm"
else
    echo "Error: Neither pnpm nor npm found"
    exit 1
fi

echo "Using package manager: $PKG_MANAGER"

# Run type checking
echo "Running type check..."
$PKG_MANAGER run typecheck

# Run tests
echo "Running tests..."
$PKG_MANAGER run test

echo "All precommit checks passed!"
