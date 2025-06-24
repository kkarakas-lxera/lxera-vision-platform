# LXERA SaaS Platform Backend

## 🚀 Quick Setup Guide

### 1. Prerequisites

- Python 3.11+
- PostgreSQL (via Supabase)
- Redis (optional, for background tasks)

### 2. Environment Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Database Setup

The database schemas have been created and are ready to apply to your Supabase project.

#### Option A: Apply schemas via Supabase Dashboard

1. Go to your Supabase project: https://supabase.com/dashboard/project/xwfweumeryrgbguwrocr
2. Navigate to SQL Editor
3. Run each schema file in order:
   - `database/schemas/auth_schema.sql`
   - `database/schemas/content_schema.sql`
   - `database/schemas/multimedia_schema.sql`

#### Option B: Use the initialization script (Recommended)

```bash
# Ensure .env file has correct credentials
python database/init_database.py
```

### 4. Run the Backend

```bash
# Start the FastAPI server
python main.py

# Or with uvicorn directly
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 5. Access the API

- API Documentation: http://localhost:8000/api/docs
- Alternative Docs: http://localhost:8000/api/redoc
- Health Check: http://localhost:8000/api/health

## 📁 Project Structure

```
backend/
├── api/                    # API endpoints
│   ├── auth.py            # Authentication endpoints
│   ├── courses.py         # Course management
│   ├── employees.py       # Employee management
│   ├── files.py           # File upload/download
│   └── admin.py           # Super admin endpoints
├── auth/                   # Authentication logic
│   └── auth_handler.py    # JWT & permissions
├── database/              # Database management
│   ├── connection.py      # Supabase client
│   ├── init_database.py   # DB initialization
│   └── schemas/           # SQL schemas
├── course_generator/      # OpenAI course integration
├── main.py               # FastAPI application
├── requirements.txt      # Python dependencies
└── .env                  # Environment variables
```

## 🔑 Authentication & Roles

### Three-tier user system:

1. **Super Admin**
   - Full system access
   - Manage all companies
   - System monitoring

2. **Company Admin**
   - Manage company employees
   - Generate courses
   - View analytics

3. **Learner**
   - Access assigned courses
   - Track progress
   - Download materials

### Default Super Admin

- Email: `admin@lxera.com`
- Password: `admin123`
- **⚠️ Change this immediately in production!**

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register learner
- `POST /api/auth/companies` - Create company (Super Admin)
- `GET /api/auth/me` - Current user info

### Courses
- `POST /api/courses/generate` - Generate new course
- `GET /api/courses/` - List courses
- `GET /api/courses/{course_id}` - Get course details
- `POST /api/courses/assign` - Assign to employees
- `PUT /api/courses/progress` - Update progress

### Employees
- `POST /api/employees/` - Create employee
- `GET /api/employees/` - List employees
- `GET /api/employees/{id}` - Get employee details
- `POST /api/employees/bulk-import` - CSV import

### Files
- `POST /api/files/upload` - Upload file
- `GET /api/files/` - List files
- `GET /api/files/{id}/download` - Download file

### Admin (Super Admin only)
- `GET /api/admin/stats/system` - System statistics
- `GET /api/admin/stats/companies` - Company statistics
- `GET /api/admin/activity/recent` - Recent activity

## 🛠️ Development Tips

### Testing the API

```bash
# Test health endpoint
curl http://localhost:8000/api/health

# Login as admin
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@lxera.com", "password": "admin123"}'
```

### Common Issues

1. **Database connection errors**
   - Check Supabase credentials in `.env`
   - Ensure database schemas are applied

2. **Import errors**
   - Ensure virtual environment is activated
   - Run `pip install -r requirements.txt`

3. **CORS errors**
   - Check `CORS_ORIGINS` in `.env`
   - Add your frontend URL

## 🚧 Next Steps

1. **Complete OpenAI Integration**
   - Connect course generator pipeline
   - Implement background task processing
   - Add real-time progress updates

2. **Add WebSocket Support**
   - Real-time course generation progress
   - Live notifications
   - Dashboard updates

3. **Production Deployment**
   - Set up proper environment variables
   - Configure production database
   - Enable SSL/HTTPS
   - Set up monitoring

## 📞 Support

For issues or questions:
- Check API docs: http://localhost:8000/api/docs
- Review error logs in console
- Check Supabase logs for database issues