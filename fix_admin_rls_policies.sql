-- Fix RLS Policies for Admin Access
-- This script updates the users table policies to allow admin access

-- First, let's create a policy that allows admins to view all users
-- We'll check if the user has admin role in their JWT token
CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        auth.jwt() ->> 'role' = 'admin' OR 
        auth.jwt() ->> 'user_role' = 'admin' OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_user_id = auth.uid() 
            AND account_type = 'admin'
        )
    );

-- Allow admins to update user status
CREATE POLICY "Admins can update user status" ON users
    FOR UPDATE USING (
        auth.jwt() ->> 'role' = 'admin' OR 
        auth.jwt() ->> 'user_role' = 'admin' OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_user_id = auth.uid() 
            AND account_type = 'admin'
        )
    );

-- Alternative approach: Create a policy that allows service role access
-- This is useful if you're using the service role key for admin operations
CREATE POLICY "Service role can access all users" ON users
    FOR ALL USING (auth.role() = 'service_role');

-- Grant additional permissions to authenticated users
GRANT SELECT, UPDATE ON users TO authenticated;

-- If you want to temporarily disable RLS for testing (NOT recommended for production)
-- ALTER TABLE users DISABLE ROW LEVEL SECURITY;
