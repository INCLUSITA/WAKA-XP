
-- Add experience_id FK to flows table
ALTER TABLE public.flows 
ADD COLUMN experience_id uuid REFERENCES public.experiences(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX idx_flows_experience_id ON public.flows(experience_id);
