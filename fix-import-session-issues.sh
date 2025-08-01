#!/bin/bash

# Fix Import Session and Batch History Issues
# This script applies the database migration and provides deployment instructions

echo "🔧 Fixing Import Session and Batch History Issues"
echo "================================================="

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "   npm install -g supabase"
    exit 1
fi

echo "📋 Summary of fixes applied:"
echo "• Added missing import_session_id column to employees table"
echo "• Fixed BatchHistory component 400 error with graceful fallback"
echo "• Improved session persistence and error handling"
echo "• Enhanced state management after activation attempts"
echo ""

echo "🗄️  Running database migration..."
if supabase db push; then
    echo "✅ Database migration applied successfully"
else
    echo "❌ Database migration failed. Please check your Supabase connection:"
    echo "   supabase login"
    echo "   supabase link --project-ref <your-project-ref>"
    exit 1
fi

echo ""
echo "🚀 Next steps:"
echo "1. The migration adds the missing import_session_id column"
echo "2. Frontend fixes are already applied and handle both old and new schema"
echo "3. Test the import session and batch history functionality"
echo "4. Deploy to production when ready"

echo ""
echo "🔍 Testing checklist:"
echo "□ Create a new import session"
echo "□ Add employees to the spreadsheet"
echo "□ Activate the employees"
echo "□ Check batch history (eye button should work)"
echo "□ Try restoring a batch"
echo "□ Refresh page and verify session persistence"

echo ""
echo "✅ Fix applied successfully!"