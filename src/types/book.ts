export type Book = {
  id: string;
  title?: string;
  subtitle?: string;
  description?: string;
  author?: string;
  authors?: {
    name: string;
  }[];
  imageUrl?: string;
  link?: string;
  /** The user's rating from 0-5 */
  rating?: number;
  /** The average community rating from 0-5 */
  avgRating?: number;
  pages?: number;
  releaseYear?: number;
  dateRead?: Date;
  dateAdded?: Date;
};
