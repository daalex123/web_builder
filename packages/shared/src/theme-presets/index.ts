import type { Homepage, Menus, SiteSettings } from "../schemas";
import { type FurnitureThemeId, isFurnitureTheme } from "./options";
import { themeImages as img } from "./images";

export {
  FURNITURE_THEME_IDS,
  type FurnitureThemeId,
  type ThemeOption,
  THEME_OPTIONS,
  HOMEPAGE_THEME_OPTIONS,
  isFurnitureTheme,
  hasStructuredHomepage,
  getThemeOption,
} from "./options";

export type ThemePreset = {
  site: Partial<SiteSettings>;
  menus: Menus;
  homepage: Homepage;
};

const sharedProducts = {
  marbleTable: {
    name: "Marble IO Table",
    price: "$1,590",
    image: img.productTable,
    inStock: true,
    sale: true,
  },
  bouqleChair: {
    name: "Bouqle Chair",
    price: "$470",
    salePrice: "$525",
    image: img.productChair,
    inStock: true,
    sale: true,
  },
  ramonChair: {
    name: "Ramon Chair",
    price: "$550",
    salePrice: "$625",
    image: img.productChair,
    inStock: true,
    sale: true,
  },
  salonChair: {
    name: "Salon Chair",
    price: "$525",
    image: img.productChair,
    inStock: true,
  },
  travertineTable: {
    name: "Travertine Table",
    price: "$1,890",
    image: img.productTable,
    inStock: true,
  },
  pebbleSofa: {
    name: "4-Seater Pebble Sofa Set",
    priceFrom: "LKR 99,500",
    image: img.productSofa,
    inStock: true,
  },
  veniceTable: {
    name: "Venice Coffee Table",
    priceFrom: "LKR 18,500",
    image: img.productTable,
    inStock: true,
  },
  malibuSofa: {
    name: "3-Seater Malibu Sofa",
    priceFrom: "LKR 71,500",
    image: img.productSofa,
    inStock: true,
  },
  ioCoffee: {
    name: "IO Coffee Table",
    priceFrom: "$695",
    image: img.productTable,
    inStock: true,
    sale: true,
  },
  floorLamp: {
    name: "Miruna Floor Lamp",
    price: "$895",
    image: img.productLamp,
    inStock: true,
  },
  woolLamp: {
    name: "Wooden Table Lamp",
    priceFrom: "$50",
    image: img.productLamp,
    inStock: true,
  },
  storageUnit: {
    name: "Night Storage",
    priceFrom: "$1,250",
    image: img.productStorage,
    inStock: true,
  },
  upholsteredBed: {
    name: "Sano Upholstered Bed",
    priceFrom: "$1,550",
    image: img.productBed,
    inStock: true,
  },
  consoleTv: {
    name: "1659 TV Console",
    priceFrom: "LKR 27,500",
    image: img.productStorage,
    inStock: true,
  },
  mirror: {
    name: "Mahogany Mirror",
    priceFrom: "LKR 6,500",
    image: img.lookMinimal,
    inStock: true,
  },
};

const ergocraftSinglePreset: ThemePreset = {
  site: {
    name: "Ergo Craft",
    description: "We are a new concept of functionality. Revolutionizing furniture with innovative concepts.",
    theme: "ergocraft-single",
    defaultSeo: {
      metaTitle: "Ergo Craft — Single Brand Furniture",
      metaDescription: "Thoughtfully designed furniture for sanctuary and solace.",
    },
    contact: {
      phones: ["+1 (800) 123-4567"],
      email: "hello@ergocraft.demo",
      addresses: ["917 Vapik River, New York"],
    },
    social: { instagram: "https://instagram.com/ergocraft" },
  },
  menus: {
    header: [
      { label: "HOME", href: "/" },
      {
        label: "SHOP",
        children: [
          { label: "Tables", href: "#" },
          { label: "Chairs", href: "#" },
          { label: "Storage", href: "#" },
          { label: "Lamps", href: "#" },
        ],
      },
      {
        label: "COLLECTIONS",
        children: [
          { label: "The Marble", href: "#" },
          { label: "Calero", href: "#" },
          { label: "Parole", href: "#" },
          { label: "Veny", href: "#" },
        ],
      },
      { label: "ABOUT", href: "/about-us" },
    ],
    footer: [
      {
        label: "STORE",
        children: [
          { label: "About", href: "/about-us" },
          { label: "Showroom", href: "#" },
          { label: "Contact Us", href: "/contact-us" },
        ],
      },
      {
        label: "SHOP",
        children: [
          { label: "Tables", href: "#" },
          { label: "Chairs", href: "#" },
          { label: "Storage", href: "#" },
        ],
      },
      {
        label: "COLLECTIONS",
        children: [
          { label: "The Marble", href: "#" },
          { label: "Calero", href: "#" },
          { label: "Veny", href: "#" },
        ],
      },
      {
        label: "HELP",
        children: [
          { label: "FAQ", href: "#" },
          { label: "Delivery & Return", href: "#" },
          { label: "Interior Planning", href: "#" },
        ],
      },
    ],
  },
  homepage: {
    heroSlides: [
      {
        title: "The Marble",
        subtitle: "Explore our signature marble collection — solid forms, timeless surfaces.",
        ctaLabel: "EXPLORE COLLECTION",
        ctaHref: "#",
        image: img.lookMarble,
      },
      {
        title: "Parole",
        subtitle: "Soft curves and warm textures for modern living spaces.",
        ctaLabel: "SHOP NOW",
        ctaHref: "#",
        image: img.lookLounge,
      },
      {
        title: "Veny",
        subtitle: "Light, airy pieces designed for calm, considered interiors.",
        ctaLabel: "DISCOVER",
        ctaHref: "#",
        image: img.heroStudio,
      },
    ],
    features: [
      { title: "Free", subtitle: "Shipping" },
      { title: "15 Day", subtitle: "Returns" },
      { title: "Premium", subtitle: "Materials" },
      { title: "Design", subtitle: "Support" },
    ],
    bestSellerTabs: ["LATEST ARRIVALS", "TABLES", "CHAIRS", "STORAGE"],
    bestSellers: [
      sharedProducts.marbleTable,
      sharedProducts.bouqleChair,
      sharedProducts.storageUnit,
      sharedProducts.salonChair,
      sharedProducts.travertineTable,
      sharedProducts.ramonChair,
      sharedProducts.woolLamp,
      sharedProducts.floorLamp,
    ],
    shopTheLook: [
      { title: "The Marble", image: img.lookMarble, href: "#" },
      { title: "Calero", image: img.lookWood, href: "#" },
      { title: "Parole", image: img.lookLounge, href: "#" },
      { title: "Veny", image: img.lookMinimal, href: "#" },
      { title: "Arc", image: img.heroDecor, href: "#" },
    ],
    categorySections: [
      {
        title: "Every detail matters",
        subtitle:
          "At Ergo, we craft furniture that surpasses mere props — it becomes part of fostering a serene environment.",
        ctaLabel: "INTERIOR PLANNING",
        ctaHref: "#",
        products: [
          sharedProducts.marbleTable,
          sharedProducts.bouqleChair,
          sharedProducts.salonChair,
          sharedProducts.travertineTable,
        ],
      },
    ],
    ctaBanner: {
      title: "Discover the essence of ERGO Experience",
      body: "An immersive journey into our philosophy, principles, and scope of thoughtfully designed furniture.",
    },
    testimonials: [
      {
        name: "Sarah Mitchell",
        role: "Interior Stylist",
        quote: "Ergo pieces transformed our studio — every surface feels intentional and calm.",
      },
      {
        name: "James Porter",
        quote: "The quality is exceptional. Our clients always ask where the furniture is from.",
      },
      {
        name: "Elena Vasquez",
        role: "Homeowner",
        quote: "Beautiful design that actually works for everyday living.",
      },
    ],
    commitments: [
      {
        title: "Sanctuary & Solace",
        body: "Your space should embody comfort, rest, and inspiration — our furniture is built around that belief.",
      },
      {
        title: "Crafted to Last",
        body: "Sustainably sourced wood and strengthened steel hardware in every collection piece.",
      },
    ],
    instagram: {
      title: "Follow @ergocraft",
      subtitle: "Daily inspiration from our showroom and styled spaces.",
      ctaLabel: "FOLLOW ON INSTAGRAM",
      ctaHref: "#",
    },
    newsletter: {
      title: "Never miss out — stay updated with our latest collections.",
      ctaLabel: "SUBSCRIBE",
    },
  },
};

const ergocraftPreset: ThemePreset = {
  site: {
    name: "Ergocraft",
    description: "Design for living — furniture, decor, and lighting from premium brands.",
    theme: "ergocraft",
    defaultSeo: {
      metaTitle: "Ergocraft — Premium Furniture & Home",
      metaDescription: "Shop living room, dining, bedroom, lighting and more from top brands.",
    },
    contact: {
      phones: ["+1 (800) 123-4567"],
      email: "shop@ergocraft.demo",
      addresses: ["917 Vapik River, New York, NY 10001"],
    },
    social: { instagram: "https://instagram.com/ergocraft" },
  },
  menus: {
    header: [
      { label: "HOME", href: "/" },
      {
        label: "LIVING ROOM",
        children: [
          { label: "Sofas", href: "#" },
          { label: "Armchairs", href: "#" },
          { label: "Coffee Tables", href: "#" },
          { label: "Storage", href: "#" },
        ],
      },
      {
        label: "DINING ROOM",
        children: [
          { label: "Dining Tables", href: "#" },
          { label: "Chairs", href: "#" },
          { label: "Benches", href: "#" },
        ],
      },
      {
        label: "BEDROOM",
        children: [
          { label: "Beds", href: "#" },
          { label: "Nightstands", href: "#" },
          { label: "Dressers", href: "#" },
        ],
      },
      {
        label: "BRANDS",
        children: [
          { label: "Arne Jacobsen", href: "#" },
          { label: "Charles & Ray Eames", href: "#" },
          { label: "Børge Mogensen", href: "#" },
        ],
      },
      { label: "PROMOTIONS", href: "#" },
    ],
    footer: [
      {
        label: "SHOP",
        children: [
          { label: "Living room", href: "#" },
          { label: "Dining room", href: "#" },
          { label: "Bedroom", href: "#" },
          { label: "Lighting", href: "#" },
        ],
      },
      {
        label: "HELP",
        children: [
          { label: "Delivery & Return", href: "#" },
          { label: "Track Your Order", href: "#" },
          { label: "FAQ", href: "#" },
        ],
      },
      {
        label: "COMPANY",
        children: [
          { label: "About", href: "/about-us" },
          { label: "Showroom", href: "#" },
          { label: "Brands", href: "#" },
        ],
      },
    ],
  },
  homepage: {
    heroSlides: [
      {
        title: "Ergo Sofa Collection",
        subtitle: "Relax, make yourself comfortable, and sink into your new favourite spot.",
        ctaLabel: "SHOP PRODUCTS",
        ctaHref: "#",
        image: img.heroModern,
      },
      {
        title: "Save 25% on Tables",
        subtitle: "Limited-time savings on dining and coffee tables from top designers.",
        ctaLabel: "SHOP SALE",
        ctaHref: "#",
        image: img.heroDining,
      },
      {
        title: "New from La Casa Mia",
        subtitle: "Traditional craftsmanship meets contemporary silhouettes.",
        ctaLabel: "NEW IN",
        ctaHref: "#",
        image: img.heroLiving,
      },
    ],
    features: [
      { title: "Fast & Free", subtitle: "Shipping" },
      { title: "15 Days", subtitle: "Returns" },
      { title: "Premium", subtitle: "Materials" },
      { title: "Secure", subtitle: "Payments" },
    ],
    bestSellerTabs: ["BEST SELLERS", "NEW IN", "ON SALE", "LIGHTING"],
    bestSellers: [
      sharedProducts.ioCoffee,
      sharedProducts.bouqleChair,
      sharedProducts.floorLamp,
      sharedProducts.marbleTable,
      sharedProducts.ramonChair,
      sharedProducts.salonChair,
      sharedProducts.storageUnit,
      sharedProducts.upholsteredBed,
    ],
    shopTheLook: [
      { title: "Chairs", image: img.productChair, href: "#" },
      { title: "Tables", image: img.productTable, href: "#" },
      { title: "Sofas", image: img.productSofa, href: "#" },
      { title: "Storage", image: img.productStorage, href: "#" },
      { title: "Beds", image: img.productBed, href: "#" },
      { title: "Lamps", image: img.productLamp, href: "#" },
    ],
    categorySections: [
      {
        title: "Living Room Collection",
        subtitle: "Curated sofas, chairs, and tables by Børge Mogensen and contemporary makers.",
        ctaLabel: "SHOP LIVING",
        ctaHref: "#",
        products: [
          sharedProducts.ioCoffee,
          sharedProducts.salonChair,
          sharedProducts.marbleTable,
        ],
      },
      {
        title: "Dining Room Collection",
        subtitle: "Gather around beautifully crafted tables and chairs for every occasion.",
        ctaLabel: "SHOP DINING",
        ctaHref: "#",
        products: [
          sharedProducts.travertineTable,
          sharedProducts.bouqleChair,
          sharedProducts.ramonChair,
        ],
      },
      {
        title: "Bedroom Collection",
        subtitle: "Restful spaces with upholstered beds, nightstands, and soft lighting.",
        ctaLabel: "SHOP BEDROOM",
        ctaHref: "#",
        products: [
          sharedProducts.upholsteredBed,
          sharedProducts.storageUnit,
          sharedProducts.woolLamp,
        ],
      },
    ],
    ctaBanner: {
      title: "Spring Sale — up to 40% off",
      body: "Enjoy savings on a selection of furniture, decor, and lighting for a limited time.",
    },
    testimonials: [
      {
        name: "Tina Leona Brooks",
        quote: "I wanted to extend my appreciation — the delivery and quality exceeded expectations.",
      },
      {
        name: "Emily Annice Griffith",
        quote: "An absolute pleasure working with Ergocraft. They brought our individual styles to life.",
      },
      {
        name: "Patricia Ashlyn Mitchell",
        quote: "Our designer listened to our ideas and delivered a complete solution for our apartment.",
      },
    ],
    commitments: [
      {
        title: "Our Showroom",
        body: "Visit us at 917 Vapik River, New York — Monday to Saturday, 10am – 6pm.",
      },
      {
        title: "Bringing people together",
        body: "Thoughtfully designed furniture that elevates how you live, dine, and rest.",
      },
    ],
    instagram: {
      title: "Instagram Stories",
      subtitle: "See how our community styles Ergocraft pieces in real homes.",
      ctaLabel: "@ERGocraft_SHOP",
      ctaHref: "#",
    },
    newsletter: {
      title: "Stay up to date with the latest trends",
      ctaLabel: "SUBSCRIBE",
    },
  },
};

const gravityPreset: ThemePreset = {
  site: {
    name: "Gravity",
    description: "Interior design studio — spaces that inspire, furniture that endures.",
    theme: "gravity",
    defaultSeo: {
      metaTitle: "Gravity — Interior Design",
      metaDescription: "Full-service interior design, bespoke furniture, and lighting.",
    },
    contact: {
      phones: ["+1 (800) 123-4567"],
      email: "hello@gravityinterior.demo",
      addresses: ["123 New Lenox, Chicago, IL 60606"],
    },
    social: { instagram: "https://instagram.com/gravityinterior" },
  },
  menus: {
    header: [
      { label: "HOME", href: "/" },
      {
        label: "ABOUT",
        children: [
          { label: "Our Story", href: "/about-us" },
          { label: "Our Team", href: "#" },
        ],
      },
      { label: "SERVICES", href: "#" },
      { label: "PORTFOLIO", href: "#" },
      { label: "CONTACT", href: "/contact-us" },
    ],
    footer: [
      {
        label: "SERVICES",
        children: [
          { label: "Interior Design", href: "#" },
          { label: "Furniture", href: "#" },
          { label: "Lighting", href: "#" },
          { label: "Bespoke Design", href: "#" },
        ],
      },
      {
        label: "COMPANY",
        children: [
          { label: "About", href: "/about-us" },
          { label: "Portfolio", href: "#" },
          { label: "Contact", href: "/contact-us" },
        ],
      },
    ],
  },
  homepage: {
    heroSlides: [
      {
        title: "Interiors That Inspire",
        subtitle:
          "Home is where we go for comfort, rest, and inspiration. We design spaces centred around the people who inhabit them.",
        ctaLabel: "OUR SERVICES",
        ctaHref: "#",
        image: img.heroStudio,
      },
      {
        title: "Your Personal Inspiration",
        subtitle: "Bespoke furniture, lighting, and decoration crafted for your vision.",
        ctaLabel: "VIEW PROJECTS",
        ctaHref: "#",
        image: img.heroShowroom,
      },
    ],
    features: [
      { title: "Interior", subtitle: "Design" },
      { title: "Furniture", subtitle: "Studio" },
      { title: "Lighting", subtitle: "Design" },
      { title: "Bespoke", subtitle: "Craft" },
    ],
    bestSellerTabs: ["FURNITURE", "DECOR", "LIGHTING"],
    bestSellers: [
      { name: "Glass Round Coffee Table", priceFrom: "$30", image: img.productTable, inStock: true },
      { name: "Wicker Lounge Chair", priceFrom: "$100", image: img.productChair, inStock: true },
      { name: "Wooden Table Lamp", priceFrom: "$50", image: img.productLamp, inStock: true, sale: true },
      { name: "Decorative Throw Pillow", priceFrom: "$10", image: img.productRug, inStock: true },
      { name: "Hanging Lamp Epsilon", priceFrom: "$30", image: img.productLamp, inStock: true },
      { name: "Universal 2 Seater Sofa", priceFrom: "$55", image: img.productSofa, inStock: true },
    ],
    shopTheLook: [
      { title: "Furniture", image: img.productSofa, href: "#" },
      { title: "Interior", image: img.heroStudio, href: "#" },
      { title: "Lighting", image: img.productLamp, href: "#" },
      { title: "Featured Project", image: img.heroShowroom, href: "#" },
    ],
    categorySections: [
      {
        title: "What We Do",
        subtitle:
          "From concept sketches to installation — full-service design and production of lighting, furniture, and home decor.",
        ctaLabel: "MAKE AN APPOINTMENT",
        ctaHref: "#",
        products: [
          sharedProducts.floorLamp,
          sharedProducts.ioCoffee,
          sharedProducts.salonChair,
          sharedProducts.woolLamp,
        ],
      },
    ],
    ctaBanner: {
      title: "Need a Free Consultation?",
      body: "Gravity offers individually designed interiors centered around the people inhabiting the space.",
    },
    testimonials: [
      {
        name: "Tina Leona Brooks",
        quote: "I wanted to take a moment and extend my appreciation for what you have been doing for us.",
      },
      {
        name: "Emily Annice Griffith",
        quote: "It has been an absolute pleasure working with you. You brought our individual styles to life.",
      },
      {
        name: "Patricia Ashlyn Mitchell",
        quote: "Our designer listened to our ideas and came up with a complete solution for our apartment.",
      },
    ],
    commitments: [
      {
        title: "Concept",
        body: "We help you create a comprehensive design plan with two concepts tailored to your space and needs.",
      },
      {
        title: "Design & Development",
        body: "Full design services from inspiration to installation — balancing function and visual appeal.",
      },
    ],
    instagram: {
      title: "@gravityinterior",
      subtitle: "Follow our latest projects, mood boards, and studio updates.",
      ctaLabel: "FOLLOW US",
      ctaHref: "#",
    },
    newsletter: {
      title: "Stay Tuned — Sign up for our newsletter",
      ctaLabel: "SUBSCRIBE",
    },
  },
};

const decorazzioPreset: ThemePreset = {
  site: {
    name: "Decorazzio",
    description: "Curated decor and interior styling for distinctive living spaces.",
    theme: "decorazzio",
    defaultSeo: {
      metaTitle: "Decorazzio — Home Decor & Styling",
      metaDescription: "Mirrors, rugs, lighting, and accent pieces for refined interiors.",
    },
    contact: {
      phones: ["+1 (555) 987-6543"],
      email: "studio@decorazzio.demo",
      addresses: ["48 Design District, Los Angeles, CA"],
    },
    social: { instagram: "https://instagram.com/decorazzio" },
  },
  menus: {
    header: [
      { label: "HOME", href: "/" },
      {
        label: "DECOR",
        children: [
          { label: "Mirrors", href: "#" },
          { label: "Rugs", href: "#" },
          { label: "Vases", href: "#" },
        ],
      },
      {
        label: "LIGHTING",
        children: [
          { label: "Floor Lamps", href: "#" },
          { label: "Table Lamps", href: "#" },
          { label: "Wall Lamps", href: "#" },
        ],
      },
      { label: "COLLECTIONS", href: "#" },
      { label: "CONTACT", href: "/contact-us" },
    ],
    footer: [
      {
        label: "SHOP",
        children: [
          { label: "Home Decor", href: "#" },
          { label: "Lighting", href: "#" },
          { label: "Collections", href: "#" },
        ],
      },
      {
        label: "INFO",
        children: [
          { label: "About", href: "/about-us" },
          { label: "Shipping", href: "#" },
          { label: "Contact", href: "/contact-us" },
        ],
      },
    ],
  },
  homepage: {
    heroSlides: [
      {
        title: "Curated for Character",
        subtitle: "Accent pieces, textiles, and lighting that complete your interior story.",
        ctaLabel: "SHOP DECOR",
        ctaHref: "#",
        image: img.heroDecor,
      },
      {
        title: "The Art of Styling",
        subtitle: "Editorial collections blending texture, tone, and timeless form.",
        ctaLabel: "VIEW COLLECTIONS",
        ctaHref: "#",
        image: img.lookMinimal,
      },
    ],
    features: [
      { title: "Handpicked", subtitle: "Pieces" },
      { title: "Designer", subtitle: "Curated" },
      { title: "Express", subtitle: "Delivery" },
      { title: "Style", subtitle: "Advice" },
    ],
    bestSellerTabs: ["NEW", "MIRRORS", "RUGS", "LAMPS"],
    bestSellers: [
      { name: "Arched Floor Mirror", price: "$420", image: img.lookMinimal, inStock: true },
      { name: "Handwoven Area Rug", priceFrom: "$280", image: img.productRug, inStock: true },
      sharedProducts.floorLamp,
      { name: "Ceramic Vase Set", price: "$95", image: img.heroDecor, inStock: true },
      sharedProducts.woolLamp,
      { name: "Textured Throw", price: "$68", image: img.lookWood, inStock: true, sale: true },
    ],
    shopTheLook: [
      { title: "Living Accent", image: img.lookLounge, href: "#" },
      { title: "Bedroom Glow", image: img.heroBedroom, href: "#" },
      { title: "Dining Detail", image: img.lookDining, href: "#" },
      { title: "Entry Statement", image: img.lookMarble, href: "#" },
    ],
    categorySections: [
      {
        title: "Styled Spaces",
        subtitle: "Room-by-room inspiration with shoppable decor accents and lighting.",
        ctaLabel: "EXPLORE LOOKBOOK",
        ctaHref: "#",
        products: [
          sharedProducts.floorLamp,
          { name: "Round Wall Mirror", price: "$195", image: img.lookMinimal, inStock: true },
          { name: "Jute Natural Rug", priceFrom: "$240", image: img.productRug, inStock: true },
          sharedProducts.woolLamp,
        ],
      },
    ],
    ctaBanner: {
      title: "Book a styling consultation",
      body: "Work with our in-house stylists to refine color, texture, and layout in your home.",
    },
    testimonials: [
      {
        name: "Rachel Kim",
        role: "Homeowner",
        quote: "Decorazzio helped us layer textures and finishes we never would have chosen alone.",
      },
      {
        name: "Marcus Allen",
        quote: "Every piece feels intentional — our living room finally feels complete.",
      },
    ],
    commitments: [
      {
        title: "Editorial Collections",
        body: "Seasonal edits of decor and lighting chosen for harmony, contrast, and longevity.",
      },
      {
        title: "Responsible Sourcing",
        body: "We partner with artisans and makers who prioritize quality materials and fair craft.",
      },
    ],
    instagram: {
      title: "Style notes from @decorazzio",
      subtitle: "Daily interiors, product spotlights, and behind-the-scenes styling.",
      ctaLabel: "FOLLOW",
      ctaHref: "#",
    },
    newsletter: {
      title: "Get styling tips and early access to new collections",
      ctaLabel: "JOIN THE LIST",
    },
  },
};

const colomboPreset: ThemePreset = {
  site: {
    name: "Colombo Furniture House",
    description: "Everyday comfort and timeless elegance for every home.",
    theme: "colombo",
    defaultSeo: {
      metaTitle: "Colombo Furniture House",
      metaDescription: "Shop beds, sofas, dining sets, and home furniture by room.",
    },
    contact: {
      phones: ["076-122-4567"],
      email: "info@colombofurniturehouse.com",
      addresses: ["Colombo, Sri Lanka"],
    },
    social: { instagram: "https://instagram.com/colombofurniture" },
  },
  menus: {
    header: [
      { label: "HOME", href: "/" },
      { label: "ALL PRODUCTS", href: "#" },
      {
        label: "SHOP BY CATEGORY",
        children: [
          { label: "Living Room", href: "#" },
          { label: "Dining Room", href: "#" },
          { label: "Bedroom", href: "#" },
          { label: "Home Office", href: "#" },
        ],
      },
      { label: "ABOUT US", href: "/about-us" },
      { label: "CONTACT", href: "/contact-us" },
    ],
    footer: [
      {
        label: "SHOP",
        children: [
          { label: "All Products", href: "#" },
          { label: "Living Room", href: "#" },
          { label: "Bedroom", href: "#" },
          { label: "Dining Room", href: "#" },
        ],
      },
      {
        label: "COMPANY",
        children: [
          { label: "About Us", href: "/about-us" },
          { label: "Careers", href: "#" },
          { label: "Contact", href: "/contact-us" },
        ],
      },
      {
        label: "HELP",
        children: [
          { label: "FAQs", href: "#" },
          { label: "Refund Policy", href: "#" },
          { label: "Privacy Policy", href: "#" },
        ],
      },
    ],
  },
  homepage: {
    heroSlides: [
      {
        title: "Dining Room",
        subtitle: "Save up to 50% on dining sets, chairs, and tables.",
        ctaLabel: "SHOP NOW",
        ctaHref: "#",
        image: img.roomDining,
      },
      {
        title: "Bedroom",
        subtitle: "Save up to 30% on beds, wardrobes, and nightstands.",
        ctaLabel: "SHOP NOW",
        ctaHref: "#",
        image: img.roomBedroom,
      },
      {
        title: "Living Room",
        subtitle: "Save up to 25% on sofas, coffee tables, and TV stands.",
        ctaLabel: "SHOP NOW",
        ctaHref: "#",
        image: img.roomLiving,
      },
    ],
    features: [
      { title: "Islandwide", subtitle: "Delivery" },
      { title: "Quality", subtitle: "Guaranteed" },
      { title: "Showroom", subtitle: "Support" },
      { title: "Easy", subtitle: "Payments" },
    ],
    bestSellerTabs: ["BEST SELLERS", "LIVING", "BEDROOM", "DINING"],
    bestSellers: [
      sharedProducts.consoleTv,
      sharedProducts.pebbleSofa,
      sharedProducts.veniceTable,
      sharedProducts.mirror,
      { name: "2-Seater Pebble Sofa", priceFrom: "LKR 62,500", image: img.productSofa, inStock: true },
      { name: "2235 Coffee Table", priceFrom: "LKR 12,500", image: img.productTable, inStock: true },
      sharedProducts.malibuSofa,
      { name: "Aspen 3-Door Wardrobe", priceFrom: "LKR 85,000", image: img.productStorage, inStock: true },
    ],
    shopTheLook: [
      { title: "Dining Room", image: img.roomDining, href: "#" },
      { title: "Living Room", image: img.roomLiving, href: "#" },
      { title: "Bedroom", image: img.roomBedroom, href: "#" },
      { title: "Kids Room", image: img.roomKids, href: "#" },
      { title: "Home Office", image: img.roomOffice, href: "#" },
    ],
    categorySections: [
      {
        title: "Limited Time Deals",
        subtitle:
          "A conscious collection made from quality materials — crafted for everyday comfort.",
        ctaLabel: "SHOP DEALS",
        ctaHref: "#",
        products: [
          sharedProducts.pebbleSofa,
          sharedProducts.veniceTable,
          sharedProducts.malibuSofa,
          { name: "Venice 60 TV Console", priceFrom: "LKR 25,500", image: img.productStorage, inStock: true },
        ],
      },
      {
        title: "Featured Products",
        subtitle: "Handpicked favourites from our showroom floor.",
        ctaLabel: "VIEW ALL",
        ctaHref: "#",
        products: [
          { name: "Teardrop Coffee Table", price: "LKR 14,500", image: img.productTable, inStock: true },
          sharedProducts.malibuSofa,
          { name: "Venice 60 TV Console", priceFrom: "LKR 25,500", image: img.productStorage, inStock: true },
        ],
      },
    ],
    ctaBanner: {
      title: "Enjoy an extra 60% OFF best selling beds",
      body: "Subscribe to our newsletter and receive an exclusive 10% discount code when you sign up.",
    },
    testimonials: [
      {
        name: "Nimal Perera",
        quote: "Excellent quality and delivery. Our entire living room was furnished in one visit.",
      },
      {
        name: "Ayesha Fernando",
        quote: "Great value for money. The showroom team helped us pick the perfect dining set.",
      },
    ],
    commitments: [
      {
        title: "Shop By Room",
        body: "Browse curated selections for dining, living, bedroom, kids room, and home office.",
      },
      {
        title: "To bring everyday comfort",
        body: "Effortless convenience and timeless elegance to every home across Sri Lanka.",
      },
    ],
    instagram: {
      title: "Follow Colombo Furniture House",
      subtitle: "New arrivals, room inspiration, and showroom highlights.",
      ctaLabel: "FOLLOW US",
      ctaHref: "#",
    },
    newsletter: {
      title: "Subscribe to our newsletter — get 10% off your first order",
      ctaLabel: "SUBSCRIBE",
    },
  },
};

const PRESETS: Record<FurnitureThemeId, ThemePreset> = {
  "ergocraft-single": ergocraftSinglePreset,
  ergocraft: ergocraftPreset,
  gravity: gravityPreset,
  decorazzio: decorazzioPreset,
  colombo: colomboPreset,
};

export function getThemePreset(themeId: string): ThemePreset | null {
  if (!isFurnitureTheme(themeId)) return null;
  return PRESETS[themeId];
}
