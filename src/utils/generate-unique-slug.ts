import { Model } from 'mongoose';
import slugify from 'slugify';
import { v4 as uuidv4 } from 'uuid';

export async function generateUniqueSlug(model: Model<any>, field: string) {
  const slug = slugify(field, { lower: true });
  const exists = await model.exists({ slug });
  if (exists) {
    return `${slug}-${uuidv4()}`;
  }
  return slug;
}
