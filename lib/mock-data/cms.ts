import type { CMSContent } from "@/lib/types";

export const MOCK_CMS: CMSContent = {
  hero: {
    titleFa: "سفر معنوی خود را آغاز کنید",
    subtitleFa: "کریستال‌های طبیعی، دوره‌های مدیتیشن و محصولات انرژی درمانی برای ارتقای آگاهی و آرامش درون",
    ctaLabel: "مشاهده محصولات",
    ctaHref: "/products",
    backgroundImage: "/images/cms/hero-banner.jpg",
  },
  featuredProducts: {
    titleFa: "محصولات ویژه",
    productIds: ["p1", "p2", "p4", "p8", "p10"],
  },
  featuredCrystals: {
    titleFa: "کریستال‌های منتخب",
    crystalIds: ["p1", "p2", "p6", "p11"],
  },
  categoryShowcase: {
    titleFa: "دسته‌بندی‌ها",
    categories: [
      { label: "سنگ‌های قیمتی", href: "/products?category=stones", image: "/images/categories/stones.jpg" },
      { label: "شمع‌های چاکرا", href: "/products?category=candles", image: "/images/categories/candles.jpg" },
      { label: "دوره‌های آموزشی", href: "/courses", image: "/images/categories/courses.jpg" },
      { label: "تورهای معنوی", href: "/tours", image: "/images/categories/tours.jpg" },
      { label: "لوازم جانبی", href: "/products?category=accessories", image: "/images/categories/accessories.jpg" },
      { label: "پوشاک", href: "/products?category=clothes", image: "/images/categories/clothes.jpg" },
    ],
  },
  featureBadges: {
    badges: [
      { icon: "truck", labelFa: "ارسال سریع به سراسر ایران" },
      { icon: "shield", labelFa: "ضمانت اصالت کالا" },
      { icon: "headphones", labelFa: "پشتیبانی تخصصی" },
      { icon: "leaf", labelFa: "محصولات طبیعی و ارگانیک" },
    ],
  },
};
