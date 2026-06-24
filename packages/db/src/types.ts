export type DbPage = {
  id: string;
  slug: string;
  title: string;
  template: string;
  layout: string;
  sections: string | null;
  content: string;
  seo: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type DbMedia = {
  id: string;
  filename: string;
  url: string;
  alt: string | null;
  mimeType: string;
  size: number | null;
  createdAt: string;
};

export type DbPageTemplate = {
  id: string;
  name: string;
  description: string | null;
  layout: string;
  content: string;
  sections: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DbProduct = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  shortDescription: string | null;
  price: string | null;
  priceFrom: string | null;
  sale: boolean;
  salePrice: string | null;
  image: string;
  gallery: string;
  category: string | null;
  inStock: boolean;
  seo: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type DbPublishLog = {
  id: string;
  status: string;
  message: string | null;
  createdAt: string;
};
