export interface Course {
  id: string;
  titleFa: string;
  titleEn: string;
  descriptionFa: string;
  descriptionEn: string;
  price: number;
  duration: string;
  durationWeeks: number;
  durationHours: number;
  lessons: number;
  level: string;
  language: string;
  certificate: boolean;
  instructor: string;
  instructorImage: string;
  image: string;
  featured: boolean;
  active: boolean;
  createdAt: string;
}
