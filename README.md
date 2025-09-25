# Charisword Gospel Ministry - Church Management System

A comprehensive full-stack web application for managing church attendance and finance operations, built specifically for Charisword Gospel Ministry.

## 🌟 Features

### Attendance Management
- **Mobile-first attendance recording** for ushers at the gate
- **First-timer registration** with inviter tracking and status management
- **Member lifecycle management** (First-Timer → Associate → Member)
- **Service management** with re-opening capability for missed attendees
- **Real-time attendance tracking** with automatic absent marking

### Financial Management
- **Partnership tracking** with member linking and history
- **Offering management** per service with detailed records
- **Comprehensive financial reporting** and analytics
- **Role-based access control** for finance operations

### Role-Based Access Control
- **Admin**: Full system access, user management, comprehensive reporting
- **Ushers**: Gate attendance recording and first-timer registration
- **Cell Leaders**: View-only access to their assigned cell data
- **Finance Leaders**: Partnership and offering management

### Analytics & Reporting
- **Attendance dashboards** with KPIs and trends
- **Financial reports** with partnership and offering analytics
- **Cell and fold performance** tracking
- **Member growth and conversion** metrics

## 🛠 Technology Stack

- **Frontend**: React with TypeScript, Next.js 14 App Router
- **Backend**: Next.js API Routes with Node.js
- **Database**: MySQL 8.0 with Docker
- **Authentication**: JWT-based with bcrypt password hashing
- **UI Framework**: Tailwind CSS v4 with shadcn/ui components
- **Development**: TypeScript, ESLint, Docker Compose

## 🚀 Getting Started

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ and npm/pnpm
- Git

### Quick Setup

1. **Clone and install:**
\`\`\`bash
git clone <repository-url>
cd charisword-ministry
npm install
\`\`\`

2. **Environment setup:**
\`\`\`bash
cp .env.example .env.local
# Edit .env.local with your configuration
\`\`\`

3. **Start database:**
\`\`\`bash
docker-compose up -d
\`\`\`

4. **Run database scripts:**
\`\`\`bash
# The scripts will be executed automatically when you run them in the v0 interface
# Or manually execute them in phpMyAdmin
\`\`\`

5. **Start development server:**
\`\`\`bash
npm run dev
\`\`\`

6. **Access the application:**
- Application: http://localhost:3000
- phpMyAdmin: http://localhost:8080

### Environment Variables

Create a `.env.local` file with these variables:

\`\`\`env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=charisword_ministry

# JWT Secret (change this in production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Node Environment
NODE_ENV=development
\`\`\`

### Database Setup

The system includes automated database setup:

1. **Docker services:**
   - MySQL 8.0 on port 3306
   - phpMyAdmin on port 8080

2. **Database credentials:**
   - Host: `localhost:3306`
   - Database: `charisword_ministry`
   - Username: `root`
   - Password: `password`

3. **Seed data:** Includes sample members, cells, services, and demo users

### Demo Credentials

Use these credentials to test different role access:

- **Admin**: admin@charisword.org / admin123
- **Usher**: usher1@charisword.org / usher123  
- **Cell Leader**: zoe.leader@charisword.org / leader123
- **Finance Leader**: finance1@charisword.org / finance123

## 📊 Database Schema

The system includes 10 main tables with full relationships:

1. **users** - System users with role-based access and JWT authentication
2. **cells** - Church cell groups (Zoe, Shiloh, Makarios, Integrity, Epignosis, Dunamis)
3. **folds** - Sub-groups within cells (3 folds per cell)
4. **members** - Church members with lifecycle status and contact info
5. **first_timers** - First-time visitors with conversion tracking
6. **services** - Church services (Supergathering, Midweek, Special)
7. **attendance** - Member attendance records with UPSERT capability
8. **partnerships** - Financial partnerships with member linking
9. **offerings** - Service offerings with financial tracking
10. **audit_logs** - System activity logging for compliance

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login with JWT token
- `POST /api/auth/logout` - User logout
- `GET /api/auth/verify` - Token verification

### User Management (Admin only)
- `GET /api/users` - List all users
- `POST /api/users` - Create new user

### Members & Attendance
- `GET /api/members` - List members (filtered by role)
- `POST /api/members` - Create new member
- `GET /api/services` - List services
- `POST /api/services` - Create service
- `POST /api/attendance` - Submit attendance (UPSERT)
- `GET /api/attendance` - Get attendance records

### First-Timers
- `POST /api/first-timers` - Record first-timer
- `GET /api/first-timers` - List first-timers

### Finance (Admin/Finance Leaders only)
- `GET /api/partnerships` - List partnerships
- `POST /api/partnerships` - Record partnership
- `GET /api/offerings` - List offerings
- `POST /api/offerings` - Record offering

### Organization
- `GET /api/cells` - List cells
- `POST /api/cells` - Create cell (Admin only)
- `GET /api/folds` - List folds
- `POST /api/folds` - Create fold (Admin only)

### Reports
- `GET /api/reports/attendance` - Attendance analytics
- `GET /api/reports/partnerships` - Partnership analytics

## 🎨 Design System

### Brand Colors
- **Primary Orange**: #f58502 (Ministry brand color)
- **Secondary Coffee**: #3a1d09 (Ministry brand color)
- **Semantic tokens** for consistent theming

### Typography
- **Primary Font**: Geist Sans (modern, clean)
- **Monospace**: Geist Mono (code and data)

## 🔐 Security Features

- **JWT authentication** with secure token management
- **bcrypt password hashing** with salt rounds
- **Role-based access control** with server-side validation
- **Protected API routes** with middleware authentication
- **Input validation** and sanitization
- **Audit logging** for all critical operations
- **CORS protection** and security headers

## 📱 Mobile Optimization

- **Mobile-first design** for usher interfaces
- **Touch-friendly** attendance recording with large checkboxes
- **Responsive layouts** for all screen sizes
- **Progressive Web App** capabilities

## 🏗 Project Structure

\`\`\`
charisword-ministry/
├── app/                    # Next.js app directory
│   ├── api/               # API routes with authentication
│   ├── attendance/        # Attendance management pages
│   ├── dashboard/         # Role-based dashboard
│   ├── finance/          # Financial management pages
│   ├── login/            # Authentication pages
│   └── globals.css       # Global styles with ministry theme
├── components/           # Reusable UI components
│   ├── ui/              # shadcn/ui components
│   ├── attendance-recorder.tsx
│   ├── first-timer-form.tsx
│   ├── partnership-form.tsx
│   ├── offering-form.tsx
│   └── protected-route.tsx
├── hooks/               # Custom React hooks
│   └── use-auth.tsx    # Authentication hook
├── lib/                # Utility libraries
│   ├── auth.ts         # JWT authentication utilities
│   ├── db.ts          # MySQL database connection
│   └── utils.ts       # General utilities
├── scripts/            # Database setup and seed scripts
├── docker-compose.yml  # Database services
└── README.md          # This file
\`\`\`

## 🚧 Development Status

### ✅ Completed Features
- [x] Complete database schema with relationships
- [x] Docker setup with MySQL and phpMyAdmin
- [x] JWT authentication system
- [x] Role-based access control
- [x] Protected routes and middleware
- [x] Attendance recording with UPSERT logic
- [x] First-timer registration with conversion tracking
- [x] Partnership and offering management
- [x] Member lifecycle management
- [x] Responsive UI with ministry branding
- [x] API endpoints for all core functionality
- [x] Seed data with demo accounts

### 🔄 Ready for Production
The system is fully functional and ready for deployment with:
- Complete backend API
- Authentication and authorization
- Database with sample data
- Role-based user interface
- Mobile-responsive design

## 🚀 Deployment

### Production Setup
1. Set up production MySQL database
2. Update environment variables
3. Build the application: `npm run build`
4. Start production server: `npm start`

### Docker Production
\`\`\`bash
# Build production image
docker build -t charisword-ministry .

# Run with production database
docker-compose -f docker-compose.prod.yml up -d
\`\`\`

## 🤝 Contributing

This is a custom application built for Charisword Gospel Ministry. For support or modifications, please contact the development team.

## 📞 Ministry Contact

**Charisword Gospel Ministry**
- **Phone**: 026 116 9859
- **Location**: KNUST CAMPUS, REHABILITATION CENTER (CEDRES)
- **Digital Address**: GT-337-6599
- **Facebook**: Charisword Gospel Ministry
- **Instagram/TikTok**: @charisword
- **Twitter/X**: @ChariswordM

## 📄 License

This project is proprietary software developed specifically for Charisword Gospel Ministry.

---

*Built with excellence for ministry management* 🙏
