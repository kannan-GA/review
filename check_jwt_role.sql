-- Check what role the current session is using
-- This helps debug if Supabase is using a different role name

SELECT 
    current_user,
    session_user,
    current_setting('request.jwt.claim.role', true) as jwt_role,
    current_setting('request.jwt.claim.email', true) as jwt_email;

-- Also check all available roles
SELECT rolname FROM pg_roles WHERE rolname IN ('anon', 'authenticated', 'public', 'service_role');

