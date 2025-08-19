#!/bin/bash
# Setup Course Queue Processing Cron Job
# This script sets up a cron job to periodically check and process queued course generation jobs

set -e

echo "🔧 Setting up Course Queue Processing Cron Job"

# Get Supabase project details
SUPABASE_PROJECT_URL="${SUPABASE_URL:-https://xwfweumeryrgbguwrocr.supabase.co}"
SUPABASE_ANON_KEY="${SUPABASE_ANON_KEY}"

if [ -z "$SUPABASE_ANON_KEY" ]; then
    echo "❌ SUPABASE_ANON_KEY environment variable is required"
    exit 1
fi

# Create the cron job script
CRON_SCRIPT_PATH="/tmp/course-queue-processor.sh"

cat > "$CRON_SCRIPT_PATH" << EOF
#!/bin/bash
# Course Queue Processor Cron Job
# Runs every 2 minutes to check for queued course generation jobs

# Logging
LOG_FILE="/tmp/course-queue-processor.log"
echo "\$(date): Checking for queued course generation jobs..." >> "\$LOG_FILE"

# Call the Supabase Edge Function
RESPONSE=\$(curl -s -X POST \\
  "${SUPABASE_PROJECT_URL}/functions/v1/course-queue-scheduler" \\
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \\
  -H "Content-Type: application/json" \\
  -d '{}' 2>&1)

# Log the response
echo "\$(date): Response: \$RESPONSE" >> "\$LOG_FILE"

# Check if the response indicates success
if echo "\$RESPONSE" | grep -q '"success":true'; then
    echo "\$(date): Queue check completed successfully" >> "\$LOG_FILE"
else
    echo "\$(date): Queue check failed: \$RESPONSE" >> "\$LOG_FILE"
fi
EOF

# Make the script executable
chmod +x "$CRON_SCRIPT_PATH"

echo "✅ Cron script created at: $CRON_SCRIPT_PATH"

# Add to crontab (runs every 2 minutes)
CRON_ENTRY="*/2 * * * * $CRON_SCRIPT_PATH"

# Check if cron entry already exists
if crontab -l 2>/dev/null | grep -q "$CRON_SCRIPT_PATH"; then
    echo "⚠️  Cron job already exists for course queue processor"
else
    # Add the cron job
    (crontab -l 2>/dev/null; echo "$CRON_ENTRY") | crontab -
    echo "✅ Cron job added: runs every 2 minutes"
fi

echo ""
echo "🎯 Course Queue Processing Setup Complete!"
echo ""
echo "📋 Setup Summary:"
echo "   • Queue Processor: process-course-queue edge function"
echo "   • Scheduler: course-queue-scheduler edge function"
echo "   • Database Trigger: triggers on new queued jobs"
echo "   • Cron Job: runs every 2 minutes to check queue"
echo "   • Log File: /tmp/course-queue-processor.log"
echo ""
echo "🔍 To monitor the queue processor:"
echo "   tail -f /tmp/course-queue-processor.log"
echo ""
echo "🚀 The LangGraph pipeline is now fully operational with automatic queue processing!"