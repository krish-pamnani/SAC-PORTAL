# SAC Treasury Portal - Frontend

React-based frontend for the SAC Treasurer Portal.

## Features

- ✅ Clean, modern UI with responsive design
- ✅ Role-based dashboards (Student, Entity, Treasury)
- ✅ Real-time data updates
- ✅ Bank details management with encryption
- ✅ Event creation and tracking
- ✅ Excel export for treasury
- ✅ Email notifications integration

## Tech Stack

- **Framework**: React 18
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Styling**: Vanilla CSS (responsive)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run Development Server

```bash
npm start
```

App will open at `http://localhost:3000`

### 4. Build for Production

```bash
npm run build
```

This creates an optimized build in the `build/` folder.

## Project Structure

```
src/
├── components/          # Reusable components (if needed)
├── contexts/
│   └── AuthContext.js   # Authentication state management
├── pages/
│   ├── Login.js         # Login page
│   ├── StudentDashboard.js   # Student portal
│   ├── EntityDashboard.js    # Entity portal
│   └── TreasuryDashboard.js  # Treasury portal
├── services/
│   └── api.js           # API client and endpoints
├── App.js               # Main app with routing
└── index.css            # Global styles
```

## User Flows

### Student Flow
1. Login with email/password
2. View events where they won prizes
3. Team leaders submit bank details (with optional save profile)
4. All team members can view bank details once submitted
5. Track payment status

### Entity Flow
1. Login with entity credentials
2. Create new event with:
   - Event name and prize pool
   - Multiple teams with prizes
   - Team members and leaders
3. View past events and submission status
4. Monitor which teams have submitted bank details

### Treasury Flow
1. Login with treasury credentials
2. View all events and bank submission status
3. Send reminder emails to pending teams
4. Download complete data as Excel
5. Mark payments as completed with UTR

## Deployment to Vercel

### Option 1: GitHub Integration (Recommended)

1. Push code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Click "New Project"
4. Import your repository
5. Configure:
   - **Framework Preset**: Create React App
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
6. Add environment variables:
   - `REACT_APP_API_URL`
   - `REACT_APP_SUPABASE_URL`
   - `REACT_APP_SUPABASE_ANON_KEY`
7. Deploy

### Option 2: Vercel CLI

```bash
npm install -g vercel
vercel login
vercel
```

Follow the prompts and add environment variables in Vercel dashboard.

## Environment Variables

### Development
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

### Production
```env
REACT_APP_API_URL=https://your-backend.onrender.com
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

## Available Scripts

### `npm start`
Runs the app in development mode at http://localhost:3000

### `npm run build`
Builds the app for production to the `build` folder

### `npm test`
Launches the test runner (if tests are configured)

### `npm run eject`
**Warning**: This is a one-way operation!

## Features by User Type

### Student Dashboard
- **My Events**: View all prize-winning events
- **Provide Bank Details**: Team leaders submit account info (with save profile option)
- **View Bank Details**: All members see submitted details
- **My Profile**: View saved bank profile

### Entity Dashboard
- **New Event**: Create events with multiple teams and members
- **Past Events**: View all created events and submission status
- **Team Management**: Add/remove teams and members
- **Team Leader Selection**: Designate one member as leader per team

### Treasury Dashboard
- **All Events**: View all events with submission progress
- **Send Reminders**: Bulk email to pending team leaders
- **Download Data**: Export complete database as Excel
- **Mark Payments**: Track completed payments with UTR numbers
- **Statistics**: View total events, amounts paid/pending

## Styling Guidelines

The app uses a clean, modern design with:
- Purple gradient theme (#667eea to #764ba2)
- Card-based layout
- Responsive grid system
- Smooth animations and transitions
- Consistent spacing and typography

All styles are in `src/index.css` for easy customization.

## Security Features

- JWT token authentication
- Automatic token refresh
- Protected routes by user type
- No sensitive data in localStorage (only tokens)
- Account numbers masked in UI
- HTTPS required in production

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### Login fails
- Check API URL in `.env`
- Verify backend is running
- Check network tab for errors

### Blank page after login
- Check console for errors
- Verify user type in localStorage
- Clear cache and reload

### API errors
- Verify backend URL
- Check CORS configuration
- Ensure backend is deployed and accessible

## Contributing

This is a college project for IIM Indore SAC Treasury. For issues or improvements, contact the SAC Treasury team.
