import { LOCATIONS } from "./locations";

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
 * `price` and `imageUrl` are optional on the type.
 *
 * `imageUrl` is genuinely sometimes missing — DishCard / DishDetail
 * render a typographic placeholder when it is.
 *
 * `price` USED to be missing for items pulled from samssoutherneatery.com
 * (the brand site doesn't publish prices) per the no-synthetic-data rule.
 * For the in-house /order demo flow we now ship placeholder market-rate
 * prices on every item so the cart math works and every dish is
 * orderable — see the SOURCE comment below the `categories` array.
 * The /order pages carry a visible "Demo prices" banner so users aren't
 * misled, and the franchise replaces these with real prices at launch.
 * Logged as a deviation in MASTER_PROMPT_DEVIATIONS.md.
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
 * PRICES: Updated 2026-05-15 to REAL prices read off the live
 * samsofmobile.com online-ordering menu (the Mobile, AL franchise
 * location — the only Sam's location publishing per-item prices).
 * Every changed number is a real published price for that dish or,
 * where Mobile sells a different portion count of the same dish, the
 * real published price of its nearest portion (those are tagged
 * `// ~Mobile <note>` inline).
 *
 * A handful of catalogue items are NOT on Mobile's menu at all (e.g.
 * bone-in fried chicken, gyro po'boy, 24/40-count family packs, kids
 * grilled cheese, fountain drinks priced $0.00+ online). Per the
 * no-synthetic-data rule we do NOT invent a number for these — they
 * keep their prior placeholder and are tagged `// NO Mobile price`.
 *
 * Caveat for the pitch: Mobile is one location; franchise prices vary
 * per store. The per-location menuOverride system (getMenuForLocation)
 * exists precisely so a signed franchise can set real per-store prices
 * without touching this base file. The /order pages still show the
 * "Demo prices" banner until the franchise confirms a canonical price
 * book.
 */
export const menu: MenuItem[] = [
  // Appetizers — Mobile prices every fried starter at $8.50 (half $4.99)
  { id: "fried-green-tomatoes", category: "appetizers", name: "Fried Green Tomatoes", description: "Sliced thick, cornmeal-battered, served with comeback sauce.", price: 8.50, imageUrl: "/images/dish-greentomatoes.jpeg", tags: ["gf"], signature: true },
  { id: "gumbo-cup", category: "appetizers", name: "Cup of Gumbo", description: "Dark roux, shrimp, andouille, okra, served over rice.", price: 5.49, imageUrl: "/images/dish-gumbo.jpg", tags: ["shellfish", "spicy"] }, // NO Mobile price (gumbo listed $0.00+ online)
  { id: "fried-mushrooms", category: "appetizers", name: "Fried Mushrooms", description: "Hand-battered button mushrooms, fried crisp.", price: 8.50, imageUrl: "/images/dish-friedmushrooms.jpeg", tags: [] },
  { id: "onion-rings", category: "appetizers", name: "Onion Rings", description: "Thick-cut onions, lightly battered and fried golden.", price: 8.50, imageUrl: "/images/dish-onionrings.jpeg", tags: [] },
  { id: "cheddar-poppers", category: "appetizers", name: "Cheddar Poppers", description: "Breaded cheddar cheese bites fried until molten inside.", price: 8.50, imageUrl: "/images/dish-cheddarpoppers.jpeg", tags: [] }, // ~Mobile poppers tier $8.50 (Mobile sells Jalapeno Poppers)
  { id: "cheese-sticks", category: "appetizers", name: "Cheese Sticks", description: "Mozzarella sticks, breaded and fried, with marinara.", price: 8.50, imageUrl: "/images/dish-cheesesticks.jpeg", tags: [] }, // = Mobile Mozzarella Sticks $8.50

  // Salads
  { id: "shrimp-salad", category: "salads", name: "Shrimp Salad", description: "Crisp greens topped with fried shrimp.", price: 12.99, imageUrl: "/images/dish-shrimpsalad.jpeg", tags: ["shellfish"] },
  { id: "fish-salad", category: "salads", name: "Fish Salad", description: "Crisp greens topped with fried fish.", price: 12.99, imageUrl: "/images/dish-fishsalad.jpeg", tags: [] },
  { id: "chicken-salad", category: "salads", name: "Chicken Salad", description: "Crisp greens topped with chicken strips.", price: 12.99, imageUrl: "/images/dish-chickensalad.jpeg", tags: [] },
  { id: "green-salad", category: "salads", name: "Green Salad", description: "Mixed greens, tomato, cucumber, dressing of your choice.", price: 7.99, imageUrl: "/images/dish-greensalad.jpeg", tags: ["gf"] },

  // Seafood
  { id: "jumbo-shrimp-15", category: "seafood", name: "Jumbo Shrimp (15)", description: "Hand-breaded jumbo shrimp, fried gold, served with hush puppies and your choice of two sides.", price: 16.99, imageUrl: "/images/dish-jumboshrimp-square.jpeg", tags: ["shellfish"], signature: true }, // ~Mobile 12-pc Shrimp $16.99 (nearest portion)
  { id: "catfish-4pc", category: "seafood", name: "Catfish Platter (4 fillets)", description: "Cornmeal-crusted Mississippi catfish, fried hot to order, with red beans and rice.", price: 10.99, imageUrl: "/images/dish-catfish.jpeg", tags: [], signature: true }, // ~Mobile 3-pc Fish $10.99 (nearest portion)
  { id: "sams-special-25", category: "seafood", name: "Sam's Special 25", description: "25 baby shrimp tossed in our proprietary house sauce. Sweet, spicy, addictive.", price: 12.99, imageUrl: "/images/dish-samspecial.jpeg", tags: ["shellfish", "spicy"], signature: true }, // = Mobile Special tier $12.99
  { id: "fried-oysters", category: "seafood", name: "Fried Oysters (8)", description: "Plump Gulf oysters, cornmeal-dredged, fried light. With remoulade.", price: 11.99, imageUrl: "/images/dish-friedoysters.jpeg", tags: ["shellfish"] }, // ~Mobile 6-pc Oysters $11.99 (nearest portion)
  { id: "stuffed-crab", category: "seafood", name: "Stuffed Crab (2)", description: "Lump crab, breadcrumbs, the trinity. Baked until golden.", price: 9.99, imageUrl: "/images/dish-stuffedcrab.jpeg", tags: ["shellfish"] }, // NO Mobile price (not on Mobile menu)
  { id: "four-piece-fish", category: "seafood", name: "Four Piece Fish", description: "Four fish fillets fried hot, with two Southern sides.", price: 10.99, imageUrl: "/images/dish-fourpiecefish.jpeg", tags: [] }, // = Mobile 3-pc Fish $10.99
  { id: "tilapia-platter", category: "seafood", name: "Tilapia Platter", description: "Cornmeal-crusted tilapia, with two Southern sides.", price: 12.99, imageUrl: "/images/dish-tilapia.jpeg", tags: [] }, // = Mobile 2-pc Tilapia $12.99
  { id: "whole-catfish", category: "seafood", name: "Whole Catfish (2)", description: "Two whole catfish fried bone-in, with two Southern sides.", price: 12.99, imageUrl: "/images/dish-wholecatfish.jpeg", tags: [] }, // = Mobile 2 Whole Catfish $12.99
  { id: "crab-cakes", category: "seafood", name: "Crab Cakes (3)", description: "Three pan-seared lump crab cakes, with remoulade.", price: 11.99, imageUrl: "/images/dish-crabcakes.jpeg", tags: ["shellfish"] }, // = Mobile 3 Crab Cakes $11.99

  // Seafood Combos
  { id: "fish-shrimp-combo", category: "combos", name: "Fish & Shrimp Combo", description: "One fish fillet and five jumbo shrimp, with two sides.", price: 12.99, imageUrl: "/images/dish-fishshrimp-combo.jpeg", tags: ["shellfish"] }, // = Mobile Special "1 Fish 5 Shrimp" $12.99
  { id: "fish-oyster-combo", category: "combos", name: "Fish & Oyster Combo", description: "One fish fillet and four fried oysters, with two sides.", price: 13.99, imageUrl: "/images/dish-fishoyster-combo.jpeg", tags: ["shellfish"] }, // ~Mobile "3 Fish & 1 Item" $13.99 (nearest)
  { id: "shrimp-oyster-combo", category: "combos", name: "Shrimp & Oyster Combo", description: "Five jumbo shrimp and four fried oysters, with two sides.", price: 17.50, imageUrl: "/images/dish-shrimpoyster-combo.jpeg", tags: ["shellfish"] }, // ~Mobile "6 Jumbo Shrimp & 6 Oysters" $17.50 (nearest)
  { id: "fish-shrimp-oyster-combo", category: "combos", name: "Fish, Shrimp & Oyster Combo", description: "One fish, four shrimp, four oysters. The full Sam's plate, with two sides.", price: 17.99, imageUrl: "/images/dish-trinity-combo.jpeg", tags: ["shellfish"], signature: true }, // ~Mobile "3 Fish & 2 Items" $17.99 (nearest)

  // Chicken
  { id: "chicken-tenders-4", category: "chicken", name: "Chicken Tenders (4)", description: "Hand-breaded all-white-meat tenders, fried crisp. With honey mustard.", price: 8.99, imageUrl: "/images/dish-chickentenders.jpeg", tags: [] }, // ~Mobile 5 Chicken Strips $8.99 (nearest portion)
  { id: "fried-chicken-2pc", category: "chicken", name: "Fried Chicken (2 pieces)", description: "Bone-in dark or white meat, 24-hour buttermilk brine, fried to order.", price: 7.99, imageUrl: "/images/dish-friedchicken.jpeg", tags: [] }, // NO Mobile price (no bone-in chicken on Mobile menu)
  { id: "spicy-chicken-sandwich", category: "chicken", name: "Spicy Chicken Sandwich", description: "Buttermilk-fried thigh, slaw, pickles, comeback sauce, brioche bun.", price: 10.99, imageUrl: "/images/dish-spicychicken.jpeg", tags: ["spicy"] }, // ~Mobile chicken sandwich tier $10.99
  { id: "chicken-wings", category: "chicken", name: "Chicken Wings", description: "Available in three or five pieces. Fried hot, served plain.", price: 10.99, imageUrl: "/images/dish-wings-plain.jpeg", tags: [] }, // ~Mobile 6 Jumbo Wings $10.99 (nearest portion)
  { id: "buffalo-wings", category: "chicken", name: "Buffalo Wings", description: "Tossed in classic Buffalo sauce. Three or five pieces.", price: 10.99, imageUrl: "/images/dish-wings-buffalo.jpeg", tags: ["spicy"] }, // ~Mobile wings tier $10.99 (no flavour upcharge listed)
  { id: "lemon-pepper-wings", category: "chicken", name: "Lemon Pepper Wings", description: "Dusted with cracked pepper and lemon. Three or five pieces.", price: 10.99, imageUrl: "/images/dish-wings-lemonpepper.jpeg", tags: [] }, // ~Mobile wings tier $10.99 (no flavour upcharge listed)
  { id: "fried-livers", category: "chicken", name: "Fried Livers", description: "Crispy fried chicken livers, a Southern classic.", price: 8.99, imageUrl: "/images/dish-friedlivers.jpeg", tags: [] }, // = Mobile Fried Chicken Livers $8.99
  { id: "fried-gizzards", category: "chicken", name: "Fried Gizzards", description: "Crispy fried chicken gizzards, slow-cooked tender.", price: 8.99, imageUrl: "/images/dish-friedgizzards.jpeg", tags: [] }, // = Mobile Fried Chicken Gizzards $8.99
  { id: "liver-gizzard-combo", category: "chicken", name: "Livers & Gizzards", description: "Half livers, half gizzards. The full plate.", price: 9.99, imageUrl: "/images/dish-livergizzard-combo.jpeg", tags: [] }, // = Mobile Liver & Gizzards Mixed $9.99

  // Po'Boys
  { id: "shrimp-poboy", category: "poboys", name: "Shrimp Po'Boy", description: "Toasted French roll, fried shrimp, lettuce, tomato, pickle, remoulade.", price: 11.99, imageUrl: "/images/dish-shrimppoboy.jpeg", tags: ["shellfish"], signature: true }, // = Mobile Shrimp Po'Boy $11.99
  { id: "catfish-poboy", category: "poboys", name: "Fish Po'Boy", description: "Two cornmeal-fried fillets, dressed all the way on a French roll.", price: 10.99, imageUrl: "/images/dish-catfishpoboy.jpeg", tags: [] }, // = Mobile Fish Po'Boy $10.99
  { id: "oyster-poboy", category: "poboys", name: "Oyster Po'Boy", description: "Half a dozen fried Gulf oysters, dressed on toasted French.", price: 11.99, imageUrl: "/images/dish-oysterpoboy.jpeg", tags: ["shellfish"] }, // = Mobile Oyster Po'Boy $11.99
  { id: "fried-chicken-poboy", category: "poboys", name: "Fried Chicken Po'Boy", description: "Hand-breaded fried chicken, dressed all the way on French.", price: 10.99, imageUrl: "/images/dish-friedchickenpoboy.jpeg", tags: [] }, // ~Mobile Deluxe Chicken Sub $10.99 (nearest)
  { id: "gyro-poboy", category: "poboys", name: "Gyro Po'Boy", description: "Marinated gyro meat, lettuce, tomato, onion, tzatziki, on French.", price: 8.49, imageUrl: "/images/dish-gyropoboy.jpeg", tags: [] }, // NO Mobile price (not on Mobile menu)

  // Burgers & Sandwiches
  { id: "sams-cheeseburger", category: "burgers", name: "Southern Single Burger", description: "Quarter-pound smashed, American cheese, lettuce, tomato, pickle.", price: 8.99, imageUrl: "/images/dish-cheeseburger.jpeg", tags: [] }, // = Mobile Single Cheese Burger $8.99
  { id: "double-bacon", category: "burgers", name: "Southern Double Burger", description: "Two patties, bacon, cheddar, comeback sauce.", price: 10.99, imageUrl: "/images/dish-doublebacon.jpeg", tags: [] }, // = Mobile Double Cheese Burger $10.99
  { id: "philly-cheese-steak", category: "burgers", name: "Philly Cheese Steak", description: "Sliced ribeye, peppers, onions, melted provolone on a hoagie.", price: 10.99, imageUrl: "/images/dish-phillysteak.jpeg", tags: [] }, // = Mobile Philly Cheese Steak $10.99
  { id: "philly-chicken", category: "burgers", name: "Philly Chicken Sandwich", description: "Sliced chicken, peppers, onions, melted provolone on a hoagie.", price: 10.99, imageUrl: "/images/dish-phillychicken.jpeg", tags: [] }, // = Mobile Philly Chicken $10.99

  // Family
  { id: "family-fish-fry", category: "family", name: "Family Fish Fry (12 fillets)", description: "Twelve catfish fillets, two pints of sides, hush puppies. Feeds 4–6.", price: 27.99, imageUrl: "/images/dish-familyfish.jpeg", tags: ["family-size"] }, // = Mobile 12 Piece Fish $27.99
  { id: "family-fish-fry-24", category: "family", name: "Family Fish Fry (24 fillets)", description: "Twenty-four fillets, two large sides, hush puppies. Feeds 8–10.", price: 58.99, imageUrl: "/images/dish-familyfish-24.jpeg", tags: ["family-size"] }, // NO Mobile price (Mobile max is 12-pc)
  { id: "family-shrimp", category: "family", name: "Family Shrimp Boil (30)", description: "Thirty jumbo shrimp, two pints of sides, hush puppies. Feeds 4–6.", price: 27.99, imageUrl: "/images/dish-familyshrimp.jpeg", tags: ["shellfish", "family-size"] }, // ~Mobile 20 Piece Shrimp $27.99 (nearest portion)
  { id: "family-shrimp-40", category: "family", name: "Family Shrimp Boil (40)", description: "Forty jumbo shrimp, two large sides, hush puppies. Feeds 6–8.", price: 52.99, imageUrl: "/images/dish-familyshrimp-40.jpeg", tags: ["shellfish", "family-size"] }, // NO Mobile price (Mobile max is 20-pc)
  { id: "family-chicken", category: "family", name: "Family Chicken Bucket (12 pc)", description: "Twelve pieces bone-in fried chicken, two pints of sides, biscuits. Feeds 4–6.", price: 28.99, imageUrl: "/images/dish-familychicken.jpeg", tags: ["family-size"] }, // NO Mobile price (no bone-in bucket on Mobile menu)
  { id: "family-wing-dinner", category: "family", name: "Family Wing Dinner (20)", description: "Twenty wings, two large sides. Feeds 4–6.", price: 22.99, imageUrl: "/images/dish-familywings.jpeg", tags: ["family-size"] }, // = Mobile 20 Piece Wings $22.99
  { id: "family-strip-dinner", category: "family", name: "Family Strip Dinner (20)", description: "Twenty chicken strips, two large sides. Feeds 4–6.", price: 17.99, imageUrl: "/images/dish-familystrips.jpeg", tags: ["family-size"] }, // ~Mobile 12 Chicken Strips $17.99 (nearest portion)

  // Sides
  { id: "red-beans-rice", category: "sides", name: "Red Beans & Rice", description: "Slow-simmered with andouille and the trinity.", price: 2.99, imageUrl: "/images/dish-redbeans.jpeg", tags: [] }, // = Mobile Red Beans & Rice $2.99
  { id: "coleslaw", category: "sides", name: "Coleslaw", description: "Cool, creamy, just enough vinegar.", price: 2.99, imageUrl: "/images/dish-coleslaw.jpeg", tags: ["gf"] }, // = Mobile Coleslaw $2.99
  { id: "fries", category: "sides", name: "Seasoned Fries", description: "Cut thick, dusted with our Cajun seasoning.", price: 2.99, imageUrl: "/images/dish-fries.jpeg", tags: ["gf"] }, // = Mobile French Fries $2.99
  { id: "okra", category: "sides", name: "Fried Okra", description: "Cornmeal-dusted, fried light and crisp.", price: 2.99, imageUrl: "/images/dish-okra.jpeg", tags: [] }, // = Mobile side tier $2.99
  { id: "mashed-potatoes", category: "sides", name: "Mashed Potatoes", description: "Buttery whipped potatoes with peppered cream gravy.", price: 2.99, imageUrl: "/images/dish-mashedpotatoes.jpeg", tags: ["gf"] }, // = Mobile side tier $2.99
  { id: "green-beans", category: "sides", name: "Green Beans", description: "Slow-cooked Southern style with smoked turkey.", price: 2.99, imageUrl: "/images/dish-greenbeans.jpeg", tags: ["gf"] }, // = Mobile Green Beans $2.99
  { id: "mac-cheese", category: "sides", name: "Mac & Cheese", description: "Three-cheese blend, baked until bubbling.", price: 2.99, imageUrl: "/images/dish-maccheese.jpeg", tags: [] }, // ~Mobile side tier $2.99 (mac not a Mobile side)

  // Kids
  { id: "kids-tenders", category: "kids", name: "Kids Tenders & Fries", description: "Two tenders, fries, and a drink.", price: 7.99, imageUrl: "/images/dish-kidstenders.jpeg", tags: [] }, // = Mobile Kids Chicken Strips $7.99
  { id: "kids-shrimp", category: "kids", name: "Kids Shrimp & Fries", description: "Five baby shrimp, fries, and a drink.", price: 7.99, imageUrl: "/images/dish-kidsshrimp.jpeg", tags: ["shellfish"] }, // = Mobile Kids Shrimp $7.99
  { id: "kids-fish", category: "kids", name: "Kids Fried Fish", description: "Two fish fillets, fries, and a drink.", price: 7.99, imageUrl: "/images/dish-kidsfish.jpeg", tags: [] }, // = Mobile Kids Fish $7.99
  { id: "kids-nuggets", category: "kids", name: "Kids Chicken Nuggets", description: "Six nuggets, fries, and a drink.", price: 7.99, imageUrl: "/images/dish-kidsnuggets.jpeg", tags: [] }, // ~Mobile Kids Chicken Strips $7.99 (nearest)
  { id: "kids-grilled-cheese", category: "kids", name: "Kids Grilled Cheese", description: "Classic grilled cheese, fries, and a drink.", price: 4.99, imageUrl: "/images/dish-kidsgrilled.jpeg", tags: [] }, // NO Mobile price (not on Mobile menu)

  // Drinks
  { id: "sweet-tea", category: "drinks", name: "Sweet Tea", description: "Brewed fresh, served cold over ice.", price: 2.49, imageUrl: "/images/dish-sweettea.jpeg", tags: ["gf"] }, // NO Mobile price (Mobile lists Drink $0.00+ online)
  { id: "lemonade", category: "drinks", name: "Hand-Squeezed Lemonade", description: "Tart, sweet, and shaken to order.", price: 2.99, imageUrl: "/images/dish-lemonade.jpeg", tags: ["gf"] }, // NO Mobile price (Mobile lists Drink $0.00+ online)
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

/**
 * Per-location overrides to the base `menu` array. Three independent
 * dimensions, all optional:
 *   - hide:           item ids removed from the menu at this location
 *   - priceOverrides: item id → new price (replaces base, other fields kept)
 *   - addItems:       extra MenuItems only available at this location
 *
 * Override semantics are deliberately simple — no "swap an image", no
 * "rename an item", no "move to a different category". Those would expand
 * the surface without serving a demoable use case. If a location truly
 * needs a different dish, they `hide` the base one and `addItems` the new one.
 */
export interface MenuOverride {
  hide?: string[];
  priceOverrides?: Record<string, number>;
  addItems?: MenuItem[];
}

/**
 * WHAT: Return the menu as it should be served for a specific location id.
 * WHY:  Some franchise locations need to drop items, retag prices, or add
 *       house specials. This helper is the single read path that applies
 *       those overrides on top of the base menu — every consumer (the
 *       LocationMenu UI, /api/order's server-side cart validation, future
 *       JSON-LD per-location pages) routes through it so the per-location
 *       view is consistent.
 *
 *       Importantly, /api/order recomputes line totals using this function
 *       too — that's the trust boundary. A tampered cart that ships the
 *       base-menu price for an item priced higher at the location is
 *       rejected because the server's price is what wins.
 * IF REMOVED: every consumer would import the raw `menu` array and the
 *       per-location variation would silently bypass server-side validation.
 * COMMON MISTAKE: mutating the base `menu` array when applying overrides.
 *       Always copy items before modifying them — the base export is shared
 *       across consumers and a mutation here would leak globally.
 */
export function getMenuForLocation(locationId: string): MenuItem[] {
  const loc = LOCATIONS.find((l) => l.id === locationId);
  const override = loc?.menuOverride;
  if (!override) return menu.slice();

  const hideSet = new Set(override.hide ?? []);
  const priceMap = override.priceOverrides ?? {};

  const base = menu
    .filter((m) => !hideSet.has(m.id))
    .map((m) => {
      const newPrice = priceMap[m.id];
      if (typeof newPrice === "number") return { ...m, price: newPrice };
      return { ...m };
    });

  if (override.addItems && override.addItems.length > 0) {
    return [...base, ...override.addItems.map((m) => ({ ...m }))];
  }
  return base;
}
