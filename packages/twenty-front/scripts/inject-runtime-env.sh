#!/bin/sh

echo "Injecting runtime environment variables into index.html..."

CONFIG_BLOCK=$(cat << EOF
    <script id="nestermind-env-config" nonce="NONCE_PLACEHOLDER">
      window._env_ = {
        REACT_APP_SERVER_BASE_URL: "$REACT_APP_SERVER_BASE_URL"
      };
    </script>
    <!-- END: nestermind Config -->
EOF
)
# Use sed to replace the config block in index.html
# Using pattern space to match across multiple lines
echo "$CONFIG_BLOCK" | sed -i.bak '
  /<!-- BEGIN: nestermind Config -->/,/<!-- END: nestermind Config -->/{
    /<!-- BEGIN: nestermind Config -->/!{
      /<!-- END: nestermind Config -->/!d
    }
    /<!-- BEGIN: nestermind Config -->/r /dev/stdin
    /<!-- END: nestermind Config -->/d
  }
' build/index.html
rm -f build/index.html.bak
