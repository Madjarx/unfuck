#!/bin/bash

# Project root
#
# ----------------
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
PROJECT_ROOT="$( cd "$DIR/../../.." && pwd )"
# ----------------


# Colors
#
# ----------------
Color_Off='\033[0m' # Text Reset
Black='\033[0;30m'  # Black
Red='\033[0;31m'    # Red
Green='\033[0;32m'  # Green
Yellow='\033[0;33m' # Yellow
Blue='\033[0;34m'   # Blue
Purple='\033[0;35m' # Purple
Cyan='\033[0;36m'   # Cyan
White='\033[0;97m'  # White
# ----------------


# Argument check
#
if [ "$1" == "--dev" ]; then
  TEMPLATE_PATH="$PROJECT_ROOT/packages/bot/templates/.env.dev"
elif [ "$1" == "--prod" ]; then
  TEMPLATE_PATH="$PROJECT_ROOT/packages/bot/templates/.env.prod"
elif [ "$1" == "--staging" ]; then
  TEMPLATE_PATH="$PROJECT_ROOT/packages/bot/templates/.env.staging"
else
  echo -e "Usage: $0 --dev | --prod | --staging"
  exit 1
fi


# Define the destination .env file path
#
DEST_ENV_PATH="$PROJECT_ROOT/packages/bot/.env"


# Remove the existing .env file if it exists
#
if [ -f "$DEST_ENV_PATH" ]; then
  rm "$DEST_ENV_PATH"
  if [ $? -ne 0 ]; then
    echo -e "Failed to remove existing .env file at $DEST_ENV_PATH"
    exit 1
  fi
  echo -e "Removed existing .env file at $DEST_ENV_PATH"
fi


# Copy the template .env file to the destination
#
cp "$TEMPLATE_PATH" "$DEST_ENV_PATH"
if [ $? -ne 0 ]; then
  echo -e "${Red}Failed to copy $TEMPLATE_PATH to $DEST_ENV_PATH${Color_Off}"
  exit 1
fi

# Alert the console
#
echo "Copied $TEMPLATE_PATH to $DEST_ENV_PATH"


# Print the contents of the created .env file
echo "  "
cat "$DEST_ENV_PATH"
if [ $? -ne 0 ]; then
  echo -e "${Red}Failed to read the contents of $DEST_ENV_PATH${Color_Off}"
  exit 1
fi

# Log the result
echo " "
echo " "
echo -e "${Green}ENV file configuration finished. Result: SUCCESS ${Color_Off}"