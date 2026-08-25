export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
  /** Tope de stock conocido al agregarlo — evita pedir más de lo disponible
   * en el cliente; el servidor vuelve a validar al crear el pedido
   * (create_guest_order ya lo hace con `for update`). */
  stockAvailable: number;
}
