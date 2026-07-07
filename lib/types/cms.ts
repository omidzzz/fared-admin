export interface HeroCMS {
  titleFa: string;
  subtitleFa: string;
  ctaLabel: string;
  ctaHref: string;
  backgroundImage: string;
}

export interface FeaturedProductsCMS {
  titleFa: string;
  productIds: string[];
}

export interface FeaturedCrystalsCMS {
  titleFa: string;
  crystalIds: string[];
}

export interface CategoryShowcaseCMS {
  titleFa: string;
  categories: { label: string; href: string; image: string }[];
}

export interface FeatureBadgesCMS {
  badges: { icon: string; labelFa: string }[];
}

export interface CMSContent {
  hero: HeroCMS;
  featuredProducts: FeaturedProductsCMS;
  featuredCrystals: FeaturedCrystalsCMS;
  categoryShowcase: CategoryShowcaseCMS;
  featureBadges: FeatureBadgesCMS;
}
