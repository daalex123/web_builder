import type { Product, ProductCard, SiteSettings } from "./schemas";
import { isEcommerceEnabled, productToCard } from "./ecommerce";

export const ASSISTANT_MODES = [
  {
    value: "consultative",
    label: "Consultative sales",
    description: "Ask questions, understand needs, recommend products without pressure.",
  },
  {
    value: "friendly",
    label: "Friendly guide",
    description: "Warm, approachable, helpful — like a knowledgeable shop associate.",
  },
  {
    value: "expert",
    label: "Product expert",
    description: "Technical, detailed answers — ideal for furniture, design, or spec-heavy catalogs.",
  },
  {
    value: "concierge",
    label: "Concierge",
    description: "Premium, polished tone — focuses on experience and bespoke service.",
  },
] as const;

export type AssistantMode = (typeof ASSISTANT_MODES)[number]["value"];

export const ASSISTANT_ROLES = [
  "Sales Consultant",
  "Design Advisor",
  "Customer Success Specialist",
  "Showroom Associate",
  "Personal Shopper",
] as const;

export const assistantConfigSchema = {
  enabled: false,
  name: "Maya",
  role: "Sales Consultant",
  mode: "consultative" as AssistantMode,
  persona:
    "You are warm, patient, and genuinely curious about the visitor's space and needs. You never hard-sell — you guide people to the right choice and make them feel confident.",
  greeting: "Hi there! I'm here to help you find exactly what you're looking for. What brought you in today?",
  placeholder: "Ask about products, sizing, delivery…",
  conversionGoals: [
    "Understand the visitor's needs before recommending",
    "Suggest relevant products from the catalog when appropriate",
    "Encourage visiting the shop or contact page when ready to buy",
  ],
  suggestedTopics: [
    "What's popular right now?",
    "Help me choose for my living room",
    "Tell me about delivery",
  ],
  primaryCtaLabel: "Browse the shop",
  primaryCtaHref: "/shop/",
};

export type AssistantConfig = SiteSettings["assistant"];

export function getAssistantConfig(site: SiteSettings) {
  return site.assistant ?? null;
}

export function isAssistantEnabled(site: SiteSettings): boolean {
  return site.assistant?.enabled === true;
}

function formatProductPrice(product: Product): string {
  if (product.sale && product.salePrice) {
    const regular = product.price ?? product.priceFrom;
    return regular ? `${product.salePrice} (was ${regular})` : product.salePrice;
  }
  return product.price ?? product.priceFrom ?? "on request";
}

export function formatProductForAssistant(product: Product): string {
  const description =
    product.shortDescription?.trim() ||
    product.description?.trim().slice(0, 280) ||
    "No description";
  const category = product.category ? `Category: ${product.category} | ` : "";
  const stock = product.inStock ? "in stock" : "out of stock";

  return [
    `- ${product.name} (slug: ${product.slug})`,
    `  ${category}Price: ${formatProductPrice(product)} | ${stock}`,
    `  ${description}`,
    `  Link: /shop/${product.slug}/`,
  ].join("\n");
}

export function buildProductCatalogForAssistant(
  site: SiteSettings,
  products: Product[] | undefined,
): { catalogText: string; productCount: number } {
  const ecommerce = isEcommerceEnabled(site);
  const published = (products ?? []).filter((p) => p.status === "published");

  if (!ecommerce) {
    return {
      catalogText:
        "E-commerce is disabled — no product catalog. Answer from site info and suggest contacting the business.",
      productCount: 0,
    };
  }

  if (!published.length) {
    return {
      catalogText:
        "No published products yet. Help visitors with general questions and suggest browsing /shop/ or contacting the business.",
      productCount: 0,
    };
  }

  return {
    catalogText: published.map(formatProductForAssistant).join("\n"),
    productCount: published.length,
  };
}

export function buildAssistantSystemPrompt(
  site: SiteSettings,
  products: Product[] | undefined,
): string {
  const cfg = site.assistant;
  if (!cfg) return "";

  const modeGuide = ASSISTANT_MODES.find((m) => m.value === cfg.mode)?.description ?? "";
  const { catalogText: productCatalog } = buildProductCatalogForAssistant(site, products);

  const goals = (cfg.conversionGoals ?? []).map((g) => `- ${g}`).join("\n");

  return `You are ${cfg.name}, the ${cfg.role} for ${site.name}.

PERSONA & VOICE:
${cfg.persona}

MODE (${cfg.mode}): ${modeGuide}

BUSINESS CONTEXT:
- Site: ${site.name}
- About: ${site.description}
- Contact: ${site.contact?.email ?? "see contact page"}${site.contact?.phones?.length ? ` | Phone: ${site.contact.phones.join(", ")}` : ""}

CONVERSION GOALS (guide the conversation naturally toward these):
${goals || "- Help visitors feel confident and move toward a purchase or contact"}

PRODUCT CATALOG (only recommend items from this list; use exact names, prices, and slugs):
${productCatalog}

RULES:
- Stay in character as ${cfg.name}. Never say you are an AI, language model, or bot.
- Keep replies concise: 2–4 short paragraphs max, or a brief list when comparing products.
- Ask one thoughtful follow-up question when it helps qualify the visitor.
- When recommending products, use only items from PRODUCT CATALOG above — exact name, price, category, and stock status.
- Always include a markdown link for each recommended product: [product name](/shop/slug/) — this shows the product image in chat.
- If the catalog has no description for a product, say what you know (name, price, category) and invite them to view the product page.
- If unsure, offer to connect them via contact email or suggest browsing /shop/.
- Never invent products, prices, or policies not in the catalog or site context.
- Be honest if something is out of stock and suggest alternatives.`;
}

export type AssistantChatMessage = {
  role: "user" | "assistant";
  content: string;
  /** Product cards with images when the assistant recommends catalog items. */
  products?: ProductCard[];
};

/** Extract /shop/slug/ references from assistant reply text. */
export function extractMentionedProductSlugs(text: string): string[] {
  const slugs = new Set<string>();
  const pattern = /\/shop\/([a-z0-9][a-z0-9-]*)\/?/gi;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    slugs.add(match[1].toLowerCase());
  }
  return [...slugs];
}

export function resolveMentionedProductCards(
  catalog: Product[] | undefined,
  reply: string,
): ProductCard[] {
  const slugs = extractMentionedProductSlugs(reply);
  if (!slugs.length) return [];

  const bySlug = new Map(
    (catalog ?? [])
      .filter((p) => p.status === "published")
      .map((p) => [p.slug.toLowerCase(), p]),
  );

  return slugs
    .map((slug) => bySlug.get(slug))
    .filter((p): p is Product => p !== undefined)
    .map(productToCard);
}
