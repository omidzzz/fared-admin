export interface Tour {
  id: string;
  titleEn: string;
  titleFa: string;
  descriptionFa: string;
  descriptionEn: string;
  price: number;
  destination: string;
  dateRange: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  duration: string;
  location: string;
  image: string;
  maxCapacity: number;
  spotsLeft: number;
  instructor: string;
  featured: boolean;
  active: boolean;
  createdAt: string;
}
