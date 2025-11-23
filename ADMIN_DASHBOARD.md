# Rent EZ Admin Dashboard

## Overview
Complete internal admin dashboard for managing Rent EZ rental applications, payments, team, and analytics.

---

## Getting Started

### Step 1: Create Your First Admin Account
1. Navigate to `/admin/setup`
2. Enter your details:
   - Full Name
   - Email
   - Password (min 6 characters)
3. Click "Create Admin Account"
4. You'll be redirected to the login page

### Step 2: Log In
1. Navigate to `/admin/login`
2. Enter your email and password
3. Access the dashboard

---

## Dashboard Features

### 1. **Dashboard Overview** (`/admin/dashboard`)
- **KPI Cards**: Total applications, approved, declined, conversion rate, revenue, refunds
- **Recent Activity**: Latest application submissions with status updates
- **Time Range**: Last 30 days by default

### 2. **Applications** (`/admin/applications`)
- **Table View**: All applications with filtering and search
- **Filters**:
  - Status: Pending, Approved, Declined, Refunded
  - Search: Name, email, phone, city
- **Actions**:
  - ✅ Approve (green checkmark)
  - ❌ Decline (red X)
  - 👁️ View Details
- **Export**: Download all filtered applications as CSV

#### Application Detail Page (`/admin/applications/:id`)
- **Full applicant information**:
  - Personal: Name, email, phone, location
  - Employment & Income details
  - Rental preferences
  - Move-in timeline
- **Internal notes** (admin-only)
- **Application timeline** with status history
- **Quick actions**: Approve/Decline from detail view

### 3. **Payments** (`/admin/payments`)
- **Payment tracking**: All $20 application fees
- **Stats**:
  - Total revenue
  - Total refunds
  - Pending payments
- **Payment history table** with filters by status and date
- Links to associated applications

### 4. **Analytics** (`/admin/analytics`)
- **Key metrics**:
  - Total applications
  - Approval rate
- **Top locations**: Cities/states with most applications
- **Applications per day**: Last 7 days trend
- **Traffic sources**: Where applications come from (Facebook, Instagram, etc.)

### 5. **Team Management** (`/admin/team`)
- **View all team members** with roles
- **Role permissions**:
  - **Owner**: Full control (team management, settings, all operations)
  - **Admin**: Application management, payments, analytics (no team/settings access)
  - **Staff**: View and manage applications only
- **Team stats**: Total members, owners/admins, staff count

### 6. **Settings** (`/admin/settings`)
- **Company info**: Name, support email
- **Payment integration**: Stripe connection status
- **Email templates**: Approval and decline email templates
- **Default options**: Application sources, default statuses

---

## User Roles

### Owner
- Full dashboard access
- Team management
- Settings configuration
- All application operations

### Admin
- View and manage applications
- Access payments and analytics
- Cannot manage team or change settings

### Staff
- View and manage applications only
- No access to payments, analytics, team, or settings

---

## Security Features

✅ **Secure authentication** with Supabase Auth
✅ **Row-Level Security (RLS)** on all database tables
✅ **Role-based access control** using separate `user_roles` table
✅ **Security definer functions** to prevent RLS recursion
✅ **Activity logging** for all approve/decline actions
✅ **Auto-confirm emails** enabled for faster testing/onboarding

---

## Database Schema

### Tables
- **applications**: All rental applications
- **payments**: Payment records ($20 application fees)
- **user_roles**: Admin user roles (owner, admin, staff)
- **profiles**: Admin user profiles
- **activity_logs**: Action logs (approve/decline tracking)

### Key Fields in Applications Table
- applicant_name, email, phone
- city, state, address
- desired_move_in_date
- monthly_income, income_range, employment_type
- unit_type, bedroom_count
- source (traffic source)
- status (pending, approved, declined, refunded)
- internal_notes, applicant_notes
- approved_by, approved_at
- declined_by, declined_at

---

## CSV Export Format

When exporting applications to CSV, the file includes:
- Name
- Email
- Phone
- City
- State
- Status
- Move-in Date
- Income
- Employment
- Created At

---

## Common Tasks

### Approve an Application
1. Go to Applications page
2. Find the application (use search/filters if needed)
3. Click the green ✅ button
4. Confirm in the dialog
5. Application status changes to "Approved"
6. Action is logged with your user ID and timestamp

### Decline an Application
1. Go to Applications page
2. Find the application
3. Click the red ❌ button
4. Confirm in the dialog
5. Application status changes to "Declined"
6. Action is logged

### Export Applications
1. Go to Applications page
2. Apply any filters/search you want
3. Click "Export CSV" button
4. CSV file downloads with all filtered applications

### Add a Team Member (Owner Only)
- Currently, team members must be added manually using the `create-admin-user` edge function
- Invite functionality coming soon in future updates

---

## API Endpoints (Edge Functions)

### `create-payment`
Creates Stripe Checkout session for $20 application fee
- **Used by**: Public checkout page
- **Auth**: Public (no JWT verification)

### `create-admin-user`
Creates a new admin user with specified role
- **Used by**: Admin setup page
- **Auth**: Public (for initial setup only)
- **Security**: Should be restricted after first admin is created

---

## Next Steps / Future Enhancements

- ✨ Team invite system with email invitations
- 📧 Automated email sending (approval/decline notifications)
- 🔔 Real-time notifications for new applications
- 📊 Advanced analytics dashboard with charts
- 📱 Mobile-responsive improvements
- 🔍 Advanced filtering (date ranges, income brackets)
- 📄 PDF export for individual applications
- 💳 Refund processing directly from dashboard
- 🔗 Integration with rental specialist matching system
- 📈 Revenue forecasting and trends

---

## Support

For questions or issues with the admin dashboard:
- Email: support@rentez.com
- Check the activity logs for debugging approval/decline actions
- Review the database directly in Lovable Cloud for data integrity

---

## Important Notes

⚠️ **First-Time Setup**: Always create your first admin via `/admin/setup`
⚠️ **Role Security**: Only owners can manage team members and settings
⚠️ **Data Integrity**: All actions are logged in `activity_logs` table
⚠️ **Backup Recommended**: Regularly export CSV data for backup purposes

---

**Version**: 1.0
**Last Updated**: January 2025
