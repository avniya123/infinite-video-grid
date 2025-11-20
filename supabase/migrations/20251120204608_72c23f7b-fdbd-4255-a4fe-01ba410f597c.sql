-- Create orders table to track all payments and purchases
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  order_number TEXT NOT NULL UNIQUE,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'completed', 'failed')),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('paytm', 'credit')),
  subtotal DECIMAL(10, 2) NOT NULL,
  discount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  tax DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  discount_code TEXT,
  share_method TEXT NOT NULL CHECK (share_method IN ('cart', 'edited')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create order_templates table to track which templates were in each order
CREATE TABLE public.order_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  template_id UUID NOT NULL,
  template_title TEXT NOT NULL,
  template_price DECIMAL(10, 2) NOT NULL,
  template_duration TEXT NOT NULL,
  template_orientation TEXT NOT NULL,
  template_resolution TEXT NOT NULL,
  template_thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order_shared_users table to track users in each order
CREATE TABLE public.order_shared_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_phone TEXT NOT NULL,
  user_type TEXT NOT NULL,
  has_access BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_shared_users ENABLE ROW LEVEL SECURITY;

-- Create policies for orders
CREATE POLICY "Users can view their own orders"
  ON public.orders
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders"
  ON public.orders
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders"
  ON public.orders
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create policies for order_templates
CREATE POLICY "Users can view templates from their orders"
  ON public.order_templates
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_templates.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create templates for their orders"
  ON public.order_templates
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_templates.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Create policies for order_shared_users
CREATE POLICY "Users can view shared users from their orders"
  ON public.order_shared_users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_shared_users.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create shared users for their orders"
  ON public.order_shared_users
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_shared_users.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Create trigger for updating updated_at
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_order_number ON public.orders(order_number);
CREATE INDEX idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX idx_order_templates_order_id ON public.order_templates(order_id);
CREATE INDEX idx_order_shared_users_order_id ON public.order_shared_users(order_id);