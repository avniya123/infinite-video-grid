-- Create table for saved enrolled users
CREATE TABLE public.saved_enrolled_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  enrolled_user_name TEXT NOT NULL,
  enrolled_user_phone TEXT,
  enrolled_user_email TEXT NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.saved_enrolled_users ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own saved users" 
ON public.saved_enrolled_users 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own saved users" 
ON public.saved_enrolled_users 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved users" 
ON public.saved_enrolled_users 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved users" 
ON public.saved_enrolled_users 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_saved_enrolled_users_updated_at
BEFORE UPDATE ON public.saved_enrolled_users
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();