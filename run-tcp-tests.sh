#!/bin/bash

# Test runner for TCP-based OPSL system
# Usage: ./run-tcp-tests.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TESTING_DIR="$SCRIPT_DIR/testing3"

echo "========================================="
echo "OPSL TCP Integration Test Runner"
echo "========================================="
echo ""

# Check if TCP server is running
echo "Checking TCP server..."
if ! nc -z localhost 3000 2>/dev/null; then
    echo "Starting TCP server..."
    node "$SCRIPT_DIR/start-tcp-server.js" &
    SERVER_PID=$!
    sleep 2
    echo "TCP server started (PID: $SERVER_PID)"
else
    echo "TCP server already running"
fi
echo ""

# Run tests
echo "Running tests..."
echo "-----------------------------------------"

cd "$TESTING_DIR"

echo ""
echo "Test 1: simple_test.opsl"
echo "-----------------------------------------"
node ../runtime-tcp.js simple_test.opsl
echo "✓ simple_test.opsl passed"
echo ""

echo "Test 2: test.opsl"
echo "-----------------------------------------"
node ../runtime-tcp.js test.opsl
echo "✓ test.opsl passed"
echo ""

echo "========================================="
echo "All tests passed!"
echo "========================================="
