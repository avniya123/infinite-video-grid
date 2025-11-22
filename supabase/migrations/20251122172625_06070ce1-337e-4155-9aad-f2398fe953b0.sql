-- Allow users to update video variations that they have saved to their templates
CREATE POLICY "Users can update variations they have saved"
ON video_variations
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM user_templates
    WHERE user_templates.variation_id = video_variations.id
    AND user_templates.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_templates
    WHERE user_templates.variation_id = video_variations.id
    AND user_templates.user_id = auth.uid()
  )
);