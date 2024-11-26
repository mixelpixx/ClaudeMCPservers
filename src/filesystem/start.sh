#!/bin/bash

# Check if at least one directory is provided
if [ $# -eq 0 ]; then
    echo "Usage: $0 <allowed-directory> [additional-directories...]"
    exit 1
fi

# Start the server with the provided directories
npm start -- "$@"
