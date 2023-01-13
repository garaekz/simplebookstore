import { AuthorDocument } from '../authors/schemas/author.schema';
import { GenreDocument } from '../genres/schemas/genre.schema';

export interface CreateBookPayload {
  title: string;
  slug: string;
  saga?: string;
  sagaNumber?: number;
  description: string;
  authors: AuthorDocument[];
  genres: GenreDocument[];
  published: Date;
  rating: number;
  price: number;
  cover: string;
  discount?: number;
  discountedPrice?: number;
}

export interface UpdateBookPayload {
  title?: string;
  slug?: string;
  saga?: string;
  sagaNumber?: number;
  description?: string;
  authors?: AuthorDocument[];
  genres?: GenreDocument[];
  published?: Date;
  rating?: number;
  price?: number;
  cover?: string;
  discount?: number;
  discountedPrice?: number;
}
