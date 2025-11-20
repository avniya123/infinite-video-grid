-- Add user_type column to saved_enrolled_users table
ALTER TABLE public.saved_enrolled_users 
ADD COLUMN user_type TEXT;

-- Add index for better query performance on user_type
CREATE INDEX idx_saved_enrolled_users_user_type ON public.saved_enrolled_users(user_type);

-- Add comment for documentation
COMMENT ON COLUMN public.saved_enrolled_users.user_type IS 'Type of user (e.g., family, friend, colleague, client, or custom types)';