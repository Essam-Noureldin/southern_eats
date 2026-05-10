/**
 * WHAT: Menu data — single source of truth for dish information.
 *       Lifted verbatim from lovable-demo/src/data/menu.ts with the
 *       asset paths swapped for /images/ public URLs.
 * WHY:  Mock data while the franchise client signs off on a real
 *       menu source. Centralising it here means DishCarousel,
 *       DishCard, and the future /menu page all read from one place.
 * IF REMOVED: nothing renders for any dish; the homepage carousel
 *       and /menu page break.
 * COMMON MISTAKE: hard-coding dish content into the carousel
 *       component itself. Keep data and presentation separate so
 *       /menu can render the full list and the carousel can render
 *       a filtered slice without duplicating either.
 */
export type Category =
  | "appetizers"
  | "seafood"
  | "chicken"
  | "poboys"
  | "burgers"
  | "family"
  | "sides"
  | "kids"
  | "drinks";

export type DishTag =
  | "gf"
  | "shellfish"
  | "halal-friendly"
  | "spicy"
  | "family-size";

export interface MenuItem {
  id: string;
  category: Category;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  tags: DishTag[];
  signature?: boolean;
}

export const categories: { id: Category; label: string }[] = [
  { id: "appetizers", label: "Starters" },
  { id: "seafood", label: "Seafood" },
  { id: "chicken", label: "Chicken" },
  { id: "poboys", label: "Po'Boys" },
  { id: "burgers", label: "Burgers" },
  { id: "family", label: "Family Portions" },
  { id: "sides", label: "Sides" },
  { id: "kids", label: "Kids" },
  { id: "drinks", label: "Drinks" },
];

const IMG = {
  catfish: "/images/dish-catfish.jpg",
  shrimp: "/images/hero-shrimp.jpg",
  samspecial: "/images/dish-samspecial.jpg",
  poboy: "/images/dish-poboy.jpg",
  greentom: "/images/dish-greentomatoes.jpg",
  family: "/images/dish-familyfry.jpg",
  chicken: "/images/dish-chicken.jpg",
} as const;

export const menu: MenuItem[] = [
  // Appetizers
  { id: "fried-green-tomatoes", category: "appetizers", name: "Fried Green Tomatoes", description: "Sliced thick, cornmeal-battered, served with comeback sauce.", price: 5.99, imageUrl: IMG.greentom, tags: ["gf"], signature: true },
  { id: "hush-puppies", category: "appetizers", name: "Hush Puppies (8)", description: "Cornmeal fritters fried golden, with honey butter on the side.", price: 3.49, imageUrl: IMG.greentom, tags: [] },
  { id: "fried-pickles", category: "appetizers", name: "Fried Dill Pickles", description: "Hand-battered dill chips fried crisp, with ranch.", price: 4.99, imageUrl: IMG.greentom, tags: [] },
  { id: "gumbo-cup", category: "appetizers", name: "Cup of Gumbo", description: "Dark roux, shrimp, andouille, okra, served over rice.", price: 5.49, imageUrl: IMG.greentom, tags: ["shellfish", "spicy"] },

  // Seafood
  { id: "jumbo-shrimp-15", category: "seafood", name: "Jumbo Shrimp (15)", description: "Hand-breaded jumbo shrimp, fried gold, served with hush puppies and your choice of two sides.", price: 13.99, imageUrl: IMG.shrimp, tags: ["shellfish"], signature: true },
  { id: "catfish-4pc", category: "seafood", name: "Catfish Platter (4 fillets)", description: "Cornmeal-crusted Mississippi catfish, fried hot to order, with red beans and rice.", price: 11.49, imageUrl: IMG.catfish, tags: [], signature: true },
  { id: "sams-special-25", category: "seafood", name: "Sam's Special 25", description: "25 baby shrimp tossed in our proprietary house sauce. Sweet, spicy, addictive.", price: 12.99, imageUrl: IMG.samspecial, tags: ["shellfish", "spicy"], signature: true },
  { id: "fried-oysters", category: "seafood", name: "Fried Oysters (8)", description: "Plump Gulf oysters, cornmeal-dredged, fried light. With remoulade.", price: 14.49, imageUrl: IMG.shrimp, tags: ["shellfish"] },
  { id: "stuffed-crab", category: "seafood", name: "Stuffed Crab (2)", description: "Lump crab, breadcrumbs, the trinity. Baked until golden.", price: 9.99, imageUrl: IMG.catfish, tags: ["shellfish"] },

  // Chicken
  { id: "chicken-tenders-4", category: "chicken", name: "Chicken Tenders (4)", description: "Hand-breaded all-white-meat tenders, fried crisp. With honey mustard.", price: 8.49, imageUrl: IMG.chicken, tags: [] },
  { id: "fried-chicken-2pc", category: "chicken", name: "Fried Chicken (2 pieces)", description: "Bone-in dark or white meat, 24-hour buttermilk brine, fried to order.", price: 7.99, imageUrl: IMG.chicken, tags: [] },
  { id: "spicy-chicken-sandwich", category: "chicken", name: "Spicy Chicken Sandwich", description: "Buttermilk-fried thigh, slaw, pickles, comeback sauce, brioche bun.", price: 8.99, imageUrl: IMG.chicken, tags: ["spicy"] },

  // Po'Boys
  { id: "shrimp-poboy", category: "poboys", name: "Shrimp Po'Boy", description: "Toasted French roll, fried shrimp, lettuce, tomato, pickle, remoulade.", price: 7.75, imageUrl: IMG.poboy, tags: ["shellfish"], signature: true },
  { id: "catfish-poboy", category: "poboys", name: "Catfish Po'Boy", description: "Two cornmeal-fried fillets, dressed all the way on a French roll.", price: 8.25, imageUrl: IMG.poboy, tags: [] },
  { id: "oyster-poboy", category: "poboys", name: "Oyster Po'Boy", description: "Half a dozen fried Gulf oysters, dressed on toasted French.", price: 9.99, imageUrl: IMG.poboy, tags: ["shellfish"] },

  // Burgers
  { id: "sams-cheeseburger", category: "burgers", name: "Sam's Cheeseburger", description: "Quarter-pound smashed, American cheese, lettuce, tomato, pickle.", price: 6.99, imageUrl: IMG.poboy, tags: [] },
  { id: "double-bacon", category: "burgers", name: "Double Bacon Burger", description: "Two patties, bacon, cheddar, comeback sauce.", price: 9.49, imageUrl: IMG.poboy, tags: [] },

  // Family
  { id: "family-fish-fry", category: "family", name: "Family Fish Fry (12 fillets)", description: "Twelve catfish fillets, two pints of sides, hush puppies. Feeds 4–6.", price: 32.99, imageUrl: IMG.family, tags: ["family-size"] },
  { id: "family-shrimp", category: "family", name: "Family Shrimp Boil (50)", description: "Fifty jumbo shrimp, two pints of sides, hush puppies. Feeds 4–6.", price: 39.99, imageUrl: IMG.family, tags: ["shellfish", "family-size"] },
  { id: "family-chicken", category: "family", name: "Family Chicken Bucket (12 pc)", description: "Twelve pieces bone-in fried chicken, two pints of sides, biscuits. Feeds 4–6.", price: 28.99, imageUrl: IMG.family, tags: ["family-size"] },

  // Sides
  { id: "red-beans-rice", category: "sides", name: "Red Beans & Rice", description: "Slow-simmered with andouille and the trinity.", price: 2.99, imageUrl: IMG.catfish, tags: [] },
  { id: "coleslaw", category: "sides", name: "Coleslaw", description: "Cool, creamy, just enough vinegar.", price: 2.49, imageUrl: IMG.catfish, tags: ["gf"] },
  { id: "fries", category: "sides", name: "Seasoned Fries", description: "Cut thick, dusted with our Cajun seasoning.", price: 2.99, imageUrl: IMG.catfish, tags: ["gf"] },
  { id: "okra", category: "sides", name: "Fried Okra", description: "Cornmeal-dusted, fried light and crisp.", price: 2.99, imageUrl: IMG.catfish, tags: [] },

  // Kids
  { id: "kids-tenders", category: "kids", name: "Kids Tenders & Fries", description: "Two tenders, fries, and a drink.", price: 5.49, imageUrl: IMG.chicken, tags: [] },
  { id: "kids-shrimp", category: "kids", name: "Kids Shrimp & Fries", description: "Five baby shrimp, fries, and a drink.", price: 5.99, imageUrl: IMG.chicken, tags: ["shellfish"] },

  // Drinks
  { id: "sweet-tea", category: "drinks", name: "Sweet Tea", description: "Brewed fresh, served cold over ice.", price: 2.49, imageUrl: IMG.catfish, tags: ["gf"] },
  { id: "lemonade", category: "drinks", name: "Hand-Squeezed Lemonade", description: "Tart, sweet, and shaken to order.", price: 2.99, imageUrl: IMG.catfish, tags: ["gf"] },
];

/**
 * WHAT: Look up a single dish by its slug (id).
 * WHY:  /menu/[slug] page resolves the route param to a dish via this
 *       helper. Centralising it here means the lookup is one well-tested
 *       function, not four duplicated `menu.find(...)` calls scattered
 *       across pages and components.
 * IF REMOVED: every consumer would inline `menu.find(m => m.id === slug)`,
 *       and the slug semantics (case-sensitive, exact match) would drift.
 * COMMON MISTAKE: making this case-insensitive — view-transition-name
 *       must match exactly between thumbnail and detail page, so any
 *       canonicalisation here would break the morph.
 */
export function getMenuItem(slug: string): MenuItem | undefined {
  if (!slug) return undefined;
  return menu.find((m) => m.id === slug);
}
