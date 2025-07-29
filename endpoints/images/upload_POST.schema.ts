import { z } from 'zod';


const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export const schema = z.object({
  image: z
    .instanceof(File, { message: 'Image is required.' })
    .refine((file) => file.size <= MAX_FILE_SIZE, `File size should be less than 5MB.`)
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      'Only .jpg, .jpeg, .png and .webp formats are supported.',
    ),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  imageUrl: string;
};

export const postImagesUpload = async (formData: FormData, init?: RequestInit): Promise<OutputType> => {
  // Frontend validation before upload
  const file = formData.get('image');
  schema.parse({ image: file });

  const result = await fetch(`/_api/images/upload`, {
    method: 'POST',
    body: formData,
    ...init,
  });

  if (!result.ok) {
    const errorObject = await result.json();
    throw new Error((errorObject as { error: string })?.error || 'Failed to upload image');
  }

  return await result.json() as OutputType;
};