import type { ContentDoc } from "./schemas";
import type { PageLayout, PageSection } from "./layouts";

function emptyDoc(): ContentDoc {
  return { type: "doc", content: [] };
}

export type SamplePageTemplate = {
  id: string;
  name: string;
  description: string;
  category: string;
  layout: PageLayout;
  title: string;
  slug: string;
  sections: PageSection[];
  content: ContentDoc;
};

function doc(...paragraphs: string[]): ContentDoc {
  return {
    type: "doc",
    content: paragraphs.map((text) => ({
      type: "paragraph",
      content: [{ type: "text", text }],
    })),
  };
}

export const SAMPLE_PAGE_TEMPLATES: SamplePageTemplate[] = [
  {
    id: "about-standard",
    name: "About Us",
    description: "Company overview with team values and mission statement",
    category: "Business",
    layout: "standard",
    title: "About Us",
    slug: "about-us",
    sections: [],
    content: doc(
      "We are a passionate team dedicated to delivering exceptional products and services.",
      "Founded with a vision to make quality accessible, we have grown into a trusted name in our industry.",
      "Our mission is to create value for our customers through innovation, integrity, and outstanding support.",
    ),
  },
  {
    id: "contact-page",
    name: "Contact Page",
    description: "Contact layout with hero and office details",
    category: "Business",
    layout: "contact",
    title: "Contact Us",
    slug: "contact",
    sections: [
      {
        id: "contact-hero",
        type: "hero",
        title: "Get in Touch",
        subtitle: "We would love to hear from you. Reach out anytime.",
        ctaLabel: "Email us",
        ctaHref: "mailto:hello@example.com",
      },
      {
        id: "contact-text",
        type: "text",
        heading: "Send us a message",
        body: "Fill out the form below or visit our office during business hours.",
      },
    ],
    content: doc("Our team typically responds within one business day."),
  },
  {
    id: "services-landing",
    name: "Services Landing",
    description: "Marketing landing page with features and call-to-action",
    category: "Marketing",
    layout: "landing",
    title: "Our Services",
    slug: "services",
    sections: [
      {
        id: "svc-hero",
        type: "hero",
        title: "Services that scale with you",
        subtitle: "From strategy to execution, we help you grow.",
        ctaLabel: "View plans",
        ctaHref: "/pricing/",
      },
      {
        id: "svc-features",
        type: "features",
        items: [
          { title: "Consulting", body: "Expert guidance tailored to your goals." },
          { title: "Implementation", body: "End-to-end delivery with proven methods." },
          { title: "Support", body: "Ongoing partnership after launch." },
        ],
      },
      {
        id: "svc-cta",
        type: "cta",
        title: "Start your project today",
        body: "Book a free consultation with our team.",
        buttonLabel: "Book a call",
        buttonHref: "/contact/",
      },
    ],
    content: emptyDoc(),
  },
  {
    id: "portfolio-gallery",
    name: "Portfolio Gallery",
    description: "Showcase work with an image grid and project descriptions",
    category: "Creative",
    layout: "gallery",
    title: "Portfolio",
    slug: "portfolio",
    sections: [
      {
        id: "port-gallery",
        type: "gallery",
        images: [
          { src: "/uploads/placeholder.jpg", alt: "Project Alpha" },
          { src: "/uploads/placeholder.jpg", alt: "Project Beta" },
          { src: "/uploads/placeholder.jpg", alt: "Project Gamma" },
          { src: "/uploads/placeholder.jpg", alt: "Project Delta" },
        ],
      },
    ],
    content: doc("A selection of recent projects across branding, web, and print design."),
  },
  {
    id: "team-sidebar",
    name: "Team Page",
    description: "Team bios with sidebar quick links",
    category: "Business",
    layout: "sidebar",
    title: "Our Team",
    slug: "team",
    sections: [
      {
        id: "team-cols",
        type: "columns",
        columns: [
          { title: "Leadership", body: "Experienced leaders guiding our vision and culture." },
          { title: "Engineering", body: "Builders who ship reliable, scalable products." },
        ],
      },
    ],
    content: doc("Meet the people behind our success. We believe great teams create great outcomes."),
  },
  {
    id: "privacy-full",
    name: "Privacy Policy",
    description: "Legal page with full-width readable text",
    category: "Legal",
    layout: "full-width",
    title: "Privacy Policy",
    slug: "privacy-policy",
    sections: [],
    content: doc(
      "This privacy policy explains how we collect, use, and protect your personal information.",
      "We only collect data necessary to provide our services and never sell your information to third parties.",
      "You may request access, correction, or deletion of your data at any time by contacting us.",
    ),
  },
  {
    id: "product-split",
    name: "Product Showcase",
    description: "Split hero with product image and feature highlights",
    category: "Marketing",
    layout: "split-hero",
    title: "Product Name",
    slug: "product",
    sections: [
      {
        id: "prod-hero",
        type: "hero",
        title: "The product your workflow needs",
        subtitle: "Designed for teams who demand more.",
        image: "/uploads/placeholder.jpg",
        ctaLabel: "Buy now",
        ctaHref: "/shop/",
      },
      {
        id: "prod-features",
        type: "features",
        items: [
          { title: "Fast", body: "Built for speed and reliability." },
          { title: "Secure", body: "Enterprise-grade security by default." },
          { title: "Simple", body: "Intuitive interface anyone can use." },
        ],
      },
    ],
    content: doc("Available now with free shipping on all orders."),
  },
  {
    id: "faq-standard",
    name: "FAQ Page",
    description: "Frequently asked questions in a clean standard layout",
    category: "Support",
    layout: "standard",
    title: "Frequently Asked Questions",
    slug: "faq",
    sections: [
      {
        id: "faq-cols",
        type: "columns",
        columns: [
          { title: "How do I get started?", body: "Sign up and follow the onboarding guide in your dashboard." },
          { title: "What payment methods do you accept?", body: "We accept all major credit cards and bank transfers." },
          { title: "Can I cancel anytime?", body: "Yes, cancel your subscription from account settings." },
        ],
      },
    ],
    content: doc("Still have questions? Contact our support team."),
  },
];

export function getSampleTemplate(id: string) {
  return SAMPLE_PAGE_TEMPLATES.find((t) => t.id === id);
}
