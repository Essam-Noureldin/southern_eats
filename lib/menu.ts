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
  | "salads"
  | "seafood"
  | "combos"
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

/**
 * `price` and `imageUrl` are optional — the live samssoutherneatery.com
 * menu doesn't display prices, and we don't have photography for the
 * full catalogue yet. Per the no-synthetic-data rule (memory:
 * feedback_no_synthetic_data) we omit values we can't verify rather
 * than fabricate them. DishCard / DishDetail render gracefully when
 * either field is missing.
 */
export interface MenuItem {
  id: string;
  category: Category;
  name: string;
  description: string;
  price?: number;
  imageUrl?: string;
  tags: DishTag[];
  signature?: boolean;
}

export const categories: { id: Category; label: string }[] = [
  { id: "appetizers", label: "Starters" },
  { id: "salads", label: "Salads" },
  { id: "seafood", label: "Seafood" },
  { id: "combos", label: "Seafood Combos" },
  { id: "chicken", label: "Chicken & Wings" },
  { id: "poboys", label: "Po'Boys" },
  { id: "burgers", label: "Burgers & Sandwiches" },
  { id: "family", label: "Family Portions" },
  { id: "sides", label: "Sides" },
  { id: "kids", label: "Kids" },
  { id: "drinks", label: "Drinks" },
];

/**
 * Menu items below come from two sources:
 *
 *  - Items WITH price + imageUrl: lifted from the original Lovable demo.
 *    Prices and photography are placeholder until the franchise office
 *    confirms real values and supplies real photos.
 *  - Items WITHOUT price + imageUrl: pulled from the live
 *    samssoutherneatery.com/menu page so the catalogue is complete.
 *    The live brand site doesn't publish prices and we don't have
 *    photos for these dishes; the UI shows a typographic placeholder
 *    card and omits the price line. Fill these in when real data lands.
 */
export const menu: MenuItem[] = [
  // Appetizers
  { id: "fried-green-tomatoes", category: "appetizers", name: "Fried Green Tomatoes", description: "Sliced thick, cornmeal-battered, served with comeback sauce.", price: 5.99, imageUrl: "/images/dish-greentomatoes.jpeg", tags: ["gf"], signature: true },
  { id: "hush-puppies", category: "appetizers", name: "Hush Puppies (8)", description: "Cornmeal fritters fried golden, with honey butter on the side.", price: 3.49, imageUrl: "/images/dish-hushpuppies.jpeg", tags: [] },
  { id: "fried-pickles", category: "appetizers", name: "Fried Dill Pickles", description: "Hand-battered dill chips fried crisp, with ranch.", price: 4.99, imageUrl: "/images/dish-friedpickles.jpeg", tags: [] },
  { id: "gumbo-cup", category: "appetizers", name: "Cup of Gumbo", description: "Dark roux, shrimp, andouille, okra, served over rice.", price: 5.49, imageUrl: "/images/dish-gumbo.jpg", tags: ["shellfish", "spicy"] },
  { id: "fried-mushrooms", category: "appetizers", name: "Fried Mushrooms", description: "Hand-battered button mushrooms, fried crisp.", imageUrl: "/images/dish-friedmushrooms.jpeg", tags: [] },
  { id: "onion-rings", category: "appetizers", name: "Onion Rings", description: "Thick-cut onions, lightly battered and fried golden.", imageUrl: "/images/dish-onionrings.jpeg", tags: [] },
  { id: "cheddar-poppers", category: "appetizers", name: "Cheddar Poppers", description: "Breaded cheddar cheese bites fried until molten inside.", imageUrl: "/images/dish-cheddarpoppers.jpeg", tags: [] },
  { id: "cheese-sticks", category: "appetizers", name: "Cheese Sticks", description: "Mozzarella sticks, breaded and fried, with marinara.", imageUrl: "/images/dish-cheesesticks.jpeg", tags: [] },
  { id: "appetizer-sampler", category: "appetizers", name: "Appetizer Sampler", description: "Pick any two starters from the list.", imageUrl: "/images/dish-appetizersampler.jpeg", tags: [] },

  // Salads
  { id: "shrimp-salad", category: "salads", name: "Shrimp Salad", description: "Crisp greens topped with fried shrimp.", imageUrl: "/images/dish-shrimpsalad.jpeg", tags: ["shellfish"] },
  { id: "fish-salad", category: "salads", name: "Fish Salad", description: "Crisp greens topped with fried fish.", imageUrl: "/images/dish-fishsalad.jpeg", tags: [] },
  { id: "chicken-salad", category: "salads", name: "Chicken Salad", description: "Crisp greens topped with chicken strips.", imageUrl: "/images/dish-chickensalad.jpeg", tags: [] },
  { id: "green-salad", category: "salads", name: "Green Salad", description: "Mixed greens, tomato, cucumber, dressing of your choice.", imageUrl: "/images/dish-greensalad.jpeg", tags: ["gf"] },

  // Seafood
  { id: "jumbo-shrimp-15", category: "seafood", name: "Jumbo Shrimp (15)", description: "Hand-breaded jumbo shrimp, fried gold, served with hush puppies and your choice of two sides.", price: 13.99, imageUrl: "/images/dish-jumboshrimp-square.jpeg", tags: ["shellfish"], signature: true },
  { id: "catfish-4pc", category: "seafood", name: "Catfish Platter (4 fillets)", description: "Cornmeal-crusted Mississippi catfish, fried hot to order, with red beans and rice.", price: 11.49, imageUrl: "/images/dish-catfish.jpeg", tags: [], signature: true },
  { id: "sams-special-25", category: "seafood", name: "Sam's Special 25", description: "25 baby shrimp tossed in our proprietary house sauce. Sweet, spicy, addictive.", price: 12.99, imageUrl: "/images/dish-samspecial.jpeg", tags: ["shellfish", "spicy"], signature: true },
  { id: "fried-oysters", category: "seafood", name: "Fried Oysters (8)", description: "Plump Gulf oysters, cornmeal-dredged, fried light. With remoulade.", price: 14.49, imageUrl: "/images/dish-friedoysters.jpeg", tags: ["shellfish"] },
  { id: "stuffed-crab", category: "seafood", name: "Stuffed Crab (2)", description: "Lump crab, breadcrumbs, the trinity. Baked until golden.", price: 9.99, imageUrl: "/images/dish-stuffedcrab.jpeg", tags: ["shellfish"] },
  { id: "four-piece-fish", category: "seafood", name: "Four Piece Fish", description: "Four fish fillets fried hot, with two Southern sides.", imageUrl: "/images/dish-fourpiecefish.jpeg", tags: [] },
  { id: "tilapia-platter", category: "seafood", name: "Tilapia Platter", description: "Cornmeal-crusted tilapia, with two Southern sides.", imageUrl: "/images/dish-tilapia.jpeg", tags: [] },
  { id: "whole-catfish", category: "seafood", name: "Whole Catfish (2)", description: "Two whole catfish fried bone-in, with two Southern sides.", imageUrl: "/images/dish-wholecatfish.jpeg", tags: [] },
  { id: "crab-cakes", category: "seafood", name: "Crab Cakes (3)", description: "Three pan-seared lump crab cakes, with remoulade.", imageUrl: "/images/dish-crabcakes.jpeg", tags: ["shellfish"] },

  // Seafood Combos
  { id: "fish-shrimp-combo", category: "combos", name: "Fish & Shrimp Combo", description: "One fish fillet and five jumbo shrimp, with two sides.", imageUrl: "/images/dish-fishshrimp-combo.jpeg", tags: ["shellfish"] },
  { id: "fish-oyster-combo", category: "combos", name: "Fish & Oyster Combo", description: "One fish fillet and four fried oysters, with two sides.", imageUrl: "/images/dish-fishoyster-combo.jpeg", tags: ["shellfish"] },
  { id: "shrimp-oyster-combo", category: "combos", name: "Shrimp & Oyster Combo", description: "Five jumbo shrimp and four fried oysters, with two sides.", imageUrl: "/images/dish-shrimpoyster-combo.jpeg", tags: ["shellfish"] },
  { id: "fish-shrimp-oyster-combo", category: "combos", name: "Fish, Shrimp & Oyster Combo", description: "One fish, four shrimp, four oysters. The full Sam's plate, with two sides.", imageUrl: "/images/dish-trinity-combo.jpeg", tags: ["shellfish"], signature: true },

  // Chicken
  { id: "chicken-tenders-4", category: "chicken", name: "Chicken Tenders (4)", description: "Hand-breaded all-white-meat tenders, fried crisp. With honey mustard.", price: 8.49, imageUrl: "/images/dish-chickentenders.jpeg", tags: [] },
  { id: "fried-chicken-2pc", category: "chicken", name: "Fried Chicken (2 pieces)", description: "Bone-in dark or white meat, 24-hour buttermilk brine, fried to order.", price: 7.99, imageUrl: "/images/dish-friedchicken.jpeg", tags: [] },
  { id: "spicy-chicken-sandwich", category: "chicken", name: "Spicy Chicken Sandwich", description: "Buttermilk-fried thigh, slaw, pickles, comeback sauce, brioche bun.", price: 8.99, imageUrl: "/images/dish-spicychicken.jpeg", tags: ["spicy"] },
  { id: "chicken-wings", category: "chicken", name: "Chicken Wings", description: "Available in three or five pieces. Fried hot, served plain.", imageUrl: "/images/dish-wings-plain.jpeg", tags: [] },
  { id: "buffalo-wings", category: "chicken", name: "Buffalo Wings", description: "Tossed in classic Buffalo sauce. Three or five pieces.", imageUrl: "/images/dish-wings-buffalo.jpeg", tags: ["spicy"] },
  { id: "lemon-pepper-wings", category: "chicken", name: "Lemon Pepper Wings", description: "Dusted with cracked pepper and lemon. Three or five pieces.", imageUrl: "/images/dish-wings-lemonpepper.jpeg", tags: [] },
  { id: "fried-livers", category: "chicken", name: "Fried Livers", description: "Crispy fried chicken livers, a Southern classic.", imageUrl: "/images/dish-friedlivers.jpeg", tags: [] },
  { id: "fried-gizzards", category: "chicken", name: "Fried Gizzards", description: "Crispy fried chicken gizzards, slow-cooked tender.", imageUrl: "/images/dish-friedgizzards.jpeg", tags: [] },
  { id: "liver-gizzard-combo", category: "chicken", name: "Livers & Gizzards", description: "Half livers, half gizzards. The full plate.", imageUrl: "/images/dish-livergizzard-combo.jpeg", tags: [] },

  // Po'Boys
  { id: "shrimp-poboy", category: "poboys", name: "Shrimp Po'Boy", description: "Toasted French roll, fried shrimp, lettuce, tomato, pickle, remoulade.", price: 7.75, imageUrl: "/images/dish-shrimppoboy.jpeg", tags: ["shellfish"], signature: true },
  { id: "catfish-poboy", category: "poboys", name: "Fish Po'Boy", description: "Two cornmeal-fried fillets, dressed all the way on a French roll.", price: 8.25, imageUrl: "/images/dish-catfishpoboy.jpeg", tags: [] },
  { id: "oyster-poboy", category: "poboys", name: "Oyster Po'Boy", description: "Half a dozen fried Gulf oysters, dressed on toasted French.", price: 9.99, imageUrl: "/images/dish-oysterpoboy.jpeg", tags: ["shellfish"] },
  { id: "fried-chicken-poboy", category: "poboys", name: "Fried Chicken Po'Boy", description: "Hand-breaded fried chicken, dressed all the way on French.", imageUrl: "/images/dish-friedchickenpoboy.jpeg", tags: [] },
  { id: "gyro-poboy", category: "poboys", name: "Gyro Po'Boy", description: "Marinated gyro meat, lettuce, tomato, onion, tzatziki, on French.", imageUrl: "/images/dish-gyropoboy.jpeg", tags: [] },

  // Burgers & Sandwiches
  { id: "sams-cheeseburger", category: "burgers", name: "Southern Single Burger", description: "Quarter-pound smashed, American cheese, lettuce, tomato, pickle.", price: 6.99, imageUrl: "/images/dish-cheeseburger.jpeg", tags: [] },
  { id: "double-bacon", category: "burgers", name: "Southern Double Burger", description: "Two patties, bacon, cheddar, comeback sauce.", price: 9.49, imageUrl: "/images/dish-doublebacon.jpeg", tags: [] },
  { id: "philly-cheese-steak", category: "burgers", name: "Philly Cheese Steak", description: "Sliced ribeye, peppers, onions, melted provolone on a hoagie.", imageUrl: "/images/dish-phillysteak.jpeg", tags: [] },
  { id: "philly-chicken", category: "burgers", name: "Philly Chicken Sandwich", description: "Sliced chicken, peppers, onions, melted provolone on a hoagie.", imageUrl: "/images/dish-phillychicken.jpeg", tags: [] },

  // Family
  { id: "family-fish-fry", category: "family", name: "Family Fish Fry (12 fillets)", description: "Twelve catfish fillets, two pints of sides, hush puppies. Feeds 4–6.", price: 32.99, imageUrl: "/images/dish-familyfish.jpeg", tags: ["family-size"] },
  { id: "family-fish-fry-24", category: "family", name: "Family Fish Fry (24 fillets)", description: "Twenty-four fillets, two large sides, hush puppies. Feeds 8–10.", imageUrl: "/images/dish-familyfish-24.jpeg", tags: ["family-size"] },
  { id: "family-shrimp", category: "family", name: "Family Shrimp Boil (30)", description: "Thirty jumbo shrimp, two pints of sides, hush puppies. Feeds 4–6.", price: 39.99, imageUrl: "/images/dish-familyshrimp.jpeg", tags: ["shellfish", "family-size"] },
  { id: "family-shrimp-40", category: "family", name: "Family Shrimp Boil (40)", description: "Forty jumbo shrimp, two large sides, hush puppies. Feeds 6–8.", imageUrl: "/images/dish-familyshrimp-40.jpeg", tags: ["shellfish", "family-size"] },
  { id: "family-chicken", category: "family", name: "Family Chicken Bucket (12 pc)", description: "Twelve pieces bone-in fried chicken, two pints of sides, biscuits. Feeds 4–6.", price: 28.99, imageUrl: "/images/dish-familychicken.jpeg", tags: ["family-size"] },
  { id: "family-wing-dinner", category: "family", name: "Family Wing Dinner (20)", description: "Twenty wings, two large sides. Feeds 4–6.", imageUrl: "/images/dish-familywings.jpeg", tags: ["family-size"] },
  { id: "family-strip-dinner", category: "family", name: "Family Strip Dinner (20)", description: "Twenty chicken strips, two large sides. Feeds 4–6.", imageUrl: "/images/dish-familystrips.jpeg", tags: ["family-size"] },

  // Sides
  { id: "red-beans-rice", category: "sides", name: "Red Beans & Rice", description: "Slow-simmered with andouille and the trinity.", price: 2.99, imageUrl: "/images/dish-redbeans.jpeg", tags: [] },
  { id: "coleslaw", category: "sides", name: "Coleslaw", description: "Cool, creamy, just enough vinegar.", price: 2.49, imageUrl: "/images/dish-coleslaw.jpeg", tags: ["gf"] },
  { id: "fries", category: "sides", name: "Seasoned Fries", description: "Cut thick, dusted with our Cajun seasoning.", price: 2.99, imageUrl: "/images/dish-fries.jpeg", tags: ["gf"] },
  { id: "okra", category: "sides", name: "Fried Okra", description: "Cornmeal-dusted, fried light and crisp.", price: 2.99, imageUrl: "/images/dish-okra.jpeg", tags: [] },
  { id: "mashed-potatoes", category: "sides", name: "Mashed Potatoes", description: "Buttery whipped potatoes with peppered cream gravy.", imageUrl: "/images/dish-mashedpotatoes.jpeg", tags: ["gf"] },
  { id: "green-beans", category: "sides", name: "Green Beans", description: "Slow-cooked Southern style with smoked turkey.", imageUrl: "/images/dish-greenbeans.jpeg", tags: ["gf"] },
  { id: "mac-cheese", category: "sides", name: "Mac & Cheese", description: "Three-cheese blend, baked until bubbling.", imageUrl: "/images/dish-maccheese.jpeg", tags: [] },

  // Kids
  { id: "kids-tenders", category: "kids", name: "Kids Tenders & Fries", description: "Two tenders, fries, and a drink.", price: 5.49, imageUrl: "/images/dish-kidstenders.jpeg", tags: [] },
  { id: "kids-shrimp", category: "kids", name: "Kids Shrimp & Fries", description: "Five baby shrimp, fries, and a drink.", price: 5.99, imageUrl: "/images/dish-kidsshrimp.jpeg", tags: ["shellfish"] },
  { id: "kids-fish", category: "kids", name: "Kids Fried Fish", description: "Two fish fillets, fries, and a drink.", imageUrl: "/images/dish-kidsfish.jpeg", tags: [] },
  { id: "kids-nuggets", category: "kids", name: "Kids Chicken Nuggets", description: "Six nuggets, fries, and a drink.", imageUrl: "/images/dish-kidsnuggets.jpeg", tags: [] },
  { id: "kids-grilled-cheese", category: "kids", name: "Kids Grilled Cheese", description: "Classic grilled cheese, fries, and a drink.", imageUrl: "/images/dish-kidsgrilled.jpeg", tags: [] },

  // Drinks
  { id: "sweet-tea", category: "drinks", name: "Sweet Tea", description: "Brewed fresh, served cold over ice.", price: 2.49, imageUrl: "/images/dish-sweettea.jpeg", tags: ["gf"] },
  { id: "lemonade", category: "drinks", name: "Hand-Squeezed Lemonade", description: "Tart, sweet, and shaken to order.", price: 2.99, imageUrl: "/images/dish-lemonade.jpeg", tags: ["gf"] },
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
