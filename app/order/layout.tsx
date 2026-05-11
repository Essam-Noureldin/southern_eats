import { CartProvider } from "@/components/order/CartContext";

/**
 * WHAT: Layout for every /order/* route. Wraps children in CartProvider
 *       so the cart state is shared between /order/[id] (menu), the
 *       /order/[id]/checkout form, and the /order/[id]/confirmation page.
 * WHY:  React Context is component-tree-scoped — without a common
 *       ancestor, the menu's cart and the checkout's cart would be two
 *       different stores. Putting the provider on the /order segment
 *       layout means it mounts once and stays mounted across in-flow
 *       client navigations.
 * IF REMOVED: useCart() throws on every /order/* page.
 * COMMON MISTAKE: putting CartProvider in the root app/layout.tsx. That
 *       works too, but then every page in the site pays the (tiny)
 *       provider cost. Scoping it to /order keeps the rest of the site
 *       free of any cart concerns.
 */
export default function OrderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CartProvider>{children}</CartProvider>;
}
