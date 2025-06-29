# Supabase Schema Approach

## Why Public Schema with Prefix?

Supabase's PostgREST API only exposes certain schemas by default:
- `public` schema (default)
- `graphql_public` schema

Custom schemas like `content_management` require additional configuration in Supabase to be exposed through the API.

## Our Solution

Instead of using a separate schema, we use the **public schema with table prefixes**:
- All content management tables use the `cm_` prefix
- Example: `cm_module_content`, `cm_quality_assessments`, etc.

## Benefits

1. **Immediate API Access**: Tables in public schema are automatically accessible through Supabase API
2. **No Configuration Required**: Works out-of-the-box with default Supabase settings
3. **Clear Organization**: The `cm_` prefix clearly identifies content management tables
4. **Full Feature Support**: All Supabase features (RLS, real-time, etc.) work seamlessly

## Implementation

### SQL Script
Use: `supabase_content_schema_public.sql`
- Creates all tables in public schema with `cm_` prefix
- Maintains all relationships and constraints
- Enables RLS on all tables

### ContentManager
- Updated to use `cm_` prefix for all table operations
- No schema qualification needed
- Direct access through Supabase client

### Result
Same functionality, better compatibility with Supabase's default configuration.