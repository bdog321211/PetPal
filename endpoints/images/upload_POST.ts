import { schema, OutputType } from './upload_POST.schema';
import { getServerUserSession } from '../../helpers/getServerUserSession';

import { NotAuthenticatedError } from '../../helpers/getSetServerSession';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    if (!user) {
      throw new NotAuthenticatedError();
    }

    const formData = await request.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return Response.json({ error: 'No image file provided.' }, { status: 400 });
    }

    // Backend validation
    if (file.size > MAX_FILE_SIZE) {
      return Response.json({ error: `File size should be less than ${MAX_FILE_SIZE / 1024 / 1024}MB.` }, { status: 400 });
    }
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      return Response.json({ error: 'Invalid file type. Only JPEG, PNG, and WEBP are accepted.' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const dataUri = `data:${file.type};base64,${base64}`;

    return Response.json({ imageUrl: dataUri } satisfies OutputType);
  } catch (error) {
    console.error('Error uploading image:', error);
    if (error instanceof NotAuthenticatedError) {
      return Response.json({ error: 'You must be logged in to upload an image.' }, { status: 401 });
    }
    if (error instanceof Error) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    return Response.json({ error: 'An unknown error occurred during image upload.' }, { status: 500 });
  }
}