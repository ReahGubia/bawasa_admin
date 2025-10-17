# BAWASA Web - Supabase Authentication Setup

## Overview

The BAWASA web application has been configured to use Supabase authentication. The sign-in functionality is now connected to the Supabase authentication table, allowing users to sign in with their existing accounts.

## Setup Instructions

### 1. Install Dependencies

Due to npm cache permission issues, you may need to run one of the following commands:

```bash
# Option 1: Fix npm cache permissions (requires sudo)
sudo chown -R 501:20 "/Users/clarencevega/.npm"
npm install

# Option 2: Use yarn instead
yarn install

# Option 3: Use npm with different cache location
npm install --cache /tmp/.npm
```

### 2. Environment Variables

The Supabase configuration is already set up with the following credentials:

- **Supabase URL**: `https://uckdfqnwzyowaobsdnbe.supabase.co`
- **Anon Key**: Already configured in the code

If you need to use different credentials, create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 3. Run the Application

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`

## Authentication Flow

### Sign In Process

1. Navigate to `/signin`
2. Enter email and password
3. Click "Sign In"
4. On successful authentication, redirect to `/dashboard`
5. On failure, display error message

### Dashboard

The dashboard page (`/dashboard`) includes:

- User information display
- Sign out functionality
- Automatic redirect to sign-in if not authenticated

## Files Modified/Created

### New Files

- `src/lib/supabase.ts` - Supabase client configuration and auth helpers
- `src/app/dashboard/page.tsx` - Dashboard page for authenticated users

### Modified Files

- `package.json` - Added `@supabase/supabase-js` dependency
- `src/app/signin/page.tsx` - Updated to use Supabase authentication

## Testing with Admin Account

Since there's already an admin account ready to sign in, you can test the authentication by:

1. Starting the development server
2. Navigating to `/signin`
3. Using the admin credentials to sign in
4. Verifying successful redirect to dashboard

## Supabase Configuration Details

The configuration uses the same Supabase project as the mobile app:

- **Project URL**: `https://uckdfqnwzyowaobsdnbe.supabase.co`
- **Authentication**: Email/password based
- **User Management**: Handled by Supabase Auth

## Troubleshooting

### Common Issues

1. **Module not found error**: Run `npm install` or `yarn install` to install dependencies
2. **Authentication errors**: Check if the Supabase URL and key are correct
3. **Redirect issues**: Ensure the dashboard route exists and is accessible

### Debug Information

The Supabase client includes error handling and will display specific error messages for authentication failures. Check the browser console for detailed error information.

## Next Steps

After successful authentication setup:

1. Test with the existing admin account
2. Implement additional authentication features (password reset, etc.)
3. Add role-based access control if needed
4. Implement session management and persistence
