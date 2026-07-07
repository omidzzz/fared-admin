export interface BusinessSettings {
  businessNameFa: string;
  businessNameEn: string;
  phone: string;
  email: string;
  address: string;
  seo: {
    titleFa: string;
    descriptionFa: string;
    keywords: string;
  };
  social: {
    instagram: string;
    telegram: string;
    whatsapp: string;
  };
  emailNotifications: {
    newOrder: boolean;
    newLead: boolean;
    lowStock: boolean;
  };
}
