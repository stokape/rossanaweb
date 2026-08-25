/**
 * Tipos de la base de datos — escritos a mano a partir del esquema en
 * `supabase/migrations/` (la generación automática vía Supabase CLI
 * requiere Docker Desktop, no disponible en esta máquina).
 *
 * Si más adelante se instala Docker, se puede regenerar con:
 *   npx supabase gen types typescript --db-url "<connection-string>" > src/types/database.ts
 * y comparar contra este archivo antes de reemplazarlo.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ProductStatus = "draft" | "published" | "archived";
export type MaterialUnit =
  | "unidad"
  | "gramo"
  | "kilogramo"
  | "centimetro"
  | "metro"
  | "paquete";
export type InventoryMovementType =
  | "purchase"
  | "production_consumption"
  | "production_output"
  | "sale"
  | "adjustment"
  | "return"
  | "cancellation";
export type OrderStatus =
  | "esperando_pago"
  | "pago_por_validar"
  | "en_preparacion"
  | "listo_para_entrega"
  | "enviado"
  | "entregado"
  | "cancelado";
export type PaymentStatus =
  | "pending"
  | "submitted"
  | "possible_duplicate"
  | "paid"
  | "rejected";
export type OperationNumberSource = "ocr" | "manual";

export interface Database {
  public: {
    Tables: {
      stores: {
        Row: {
          id: string;
          name: string;
          slug: string;
          legal_name: string | null;
          description: string | null;
          logo_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          legal_name?: string | null;
          description?: string | null;
          logo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["stores"]["Insert"]>;
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          store_id: string | null;
          full_name: string | null;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          store_id?: string | null;
          full_name?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      roles: {
        Row: { id: string; key: string; name: string };
        Insert: { id?: string; key: string; name: string };
        Update: Partial<Database["public"]["Tables"]["roles"]["Insert"]>;
        Relationships: [];
      };
      profile_roles: {
        Row: { profile_id: string; role_id: string; store_id: string };
        Insert: { profile_id: string; role_id: string; store_id: string };
        Update: Partial<Database["public"]["Tables"]["profile_roles"]["Insert"]>;
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          store_id: string;
          name: string;
          slug: string;
          description: string | null;
          image_url: string | null;
          display_order: number;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          name: string;
          slug: string;
          description?: string | null;
          image_url?: string | null;
          display_order?: number;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["categories"]["Insert"]>;
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          store_id: string;
          category_id: string | null;
          sku: string;
          name: string;
          slug: string;
          short_description: string | null;
          description: string | null;
          material: string | null;
          color: string | null;
          dimensions: string | null;
          weight_grams: number | null;
          status: ProductStatus;
          featured: boolean;
          stock_on_hand: number;
          stock_reserved: number;
          stock_available: number;
          minimum_stock: number;
          labor_cost: number;
          packaging_cost: number;
          other_direct_cost: number;
          markup_percentage: number;
          tax_rate: number;
          include_tax: boolean;
          price: number;
          compare_at_price: number | null;
          seo_title: string | null;
          seo_description: string | null;
          tags: string[];
          on_offer: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          category_id?: string | null;
          sku: string;
          name: string;
          slug: string;
          short_description?: string | null;
          description?: string | null;
          material?: string | null;
          color?: string | null;
          dimensions?: string | null;
          weight_grams?: number | null;
          status?: ProductStatus;
          featured?: boolean;
          stock_on_hand?: number;
          stock_reserved?: number;
          minimum_stock?: number;
          labor_cost?: number;
          packaging_cost?: number;
          other_direct_cost?: number;
          markup_percentage?: number;
          tax_rate?: number;
          include_tax?: boolean;
          price?: number;
          compare_at_price?: number | null;
          seo_title?: string | null;
          seo_description?: string | null;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
        Relationships: [];
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          url: string;
          alt: string | null;
          display_order: number;
          is_primary: boolean;
          image_type: "gallery" | "360";
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          url: string;
          alt?: string | null;
          display_order?: number;
          is_primary?: boolean;
          image_type?: "gallery" | "360";
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["product_images"]["Insert"]>;
        Relationships: [];
      };
      materials: {
        Row: {
          id: string;
          store_id: string;
          sku: string | null;
          name: string;
          category: string | null;
          photo_url: string | null;
          unit: MaterialUnit;
          current_stock: number;
          minimum_stock: number;
          average_unit_cost: number;
          supplier: string | null;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          sku?: string | null;
          name: string;
          category?: string | null;
          photo_url?: string | null;
          unit?: MaterialUnit;
          current_stock?: number;
          minimum_stock?: number;
          average_unit_cost?: number;
          supplier?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["materials"]["Insert"]>;
        Relationships: [];
      };
      product_components: {
        Row: {
          id: string;
          product_id: string;
          material_id: string;
          quantity_required: number;
          unit: MaterialUnit;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          material_id: string;
          quantity_required: number;
          unit: MaterialUnit;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["product_components"]["Insert"]>;
        Relationships: [];
      };
      material_purchases: {
        Row: {
          id: string;
          store_id: string;
          material_id: string;
          quantity: number;
          total_paid: number;
          unit_cost: number;
          supplier: string | null;
          purchased_at: string;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          material_id: string;
          quantity: number;
          total_paid: number;
          supplier?: string | null;
          purchased_at?: string;
          created_by?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["material_purchases"]["Insert"]>;
        Relationships: [];
      };
      production_runs: {
        Row: {
          id: string;
          store_id: string;
          product_id: string;
          quantity_produced: number;
          total_production_cost: number;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          product_id: string;
          quantity_produced: number;
          total_production_cost?: number;
          created_by?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["production_runs"]["Insert"]>;
        Relationships: [];
      };
      inventory_movements: {
        Row: {
          id: string;
          store_id: string;
          movement_type: InventoryMovementType;
          material_id: string | null;
          product_id: string | null;
          quantity: number;
          reference_type: string | null;
          reference_id: string | null;
          notes: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          movement_type: InventoryMovementType;
          material_id?: string | null;
          product_id?: string | null;
          quantity: number;
          reference_type?: string | null;
          reference_id?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["inventory_movements"]["Insert"]>;
        Relationships: [];
      };
      customers: {
        Row: {
          id: string;
          store_id: string;
          auth_user_id: string | null;
          first_name: string | null;
          last_name: string | null;
          email: string | null;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          auth_user_id?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          email?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["customers"]["Insert"]>;
        Relationships: [];
      };
      addresses: {
        Row: {
          id: string;
          customer_id: string;
          department: string;
          province: string;
          district: string;
          address_line: string;
          reference: string | null;
          instructions: string | null;
          is_default: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          department: string;
          province: string;
          district: string;
          address_line: string;
          reference?: string | null;
          instructions?: string | null;
          is_default?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["addresses"]["Insert"]>;
        Relationships: [];
      };
      carts: {
        Row: {
          id: string;
          store_id: string;
          customer_id: string | null;
          session_token: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          customer_id?: string | null;
          session_token?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["carts"]["Insert"]>;
        Relationships: [];
      };
      cart_items: {
        Row: {
          id: string;
          cart_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          cart_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["cart_items"]["Insert"]>;
        Relationships: [];
      };
      shipping_zones: {
        Row: {
          id: string;
          store_id: string;
          department: string;
          province: string | null;
          district: string | null;
          cost: number;
          active: boolean;
        };
        Insert: {
          id?: string;
          store_id: string;
          department: string;
          province?: string | null;
          district?: string | null;
          cost?: number;
          active?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["shipping_zones"]["Insert"]>;
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          store_id: string;
          order_number: string;
          customer_id: string;
          status: OrderStatus;
          is_gift: boolean;
          gift_recipient_name: string | null;
          gift_recipient_phone: string | null;
          gift_message: string | null;
          gift_special_packaging: boolean;
          buyer_first_name: string;
          buyer_last_name: string;
          buyer_phone: string;
          buyer_email: string;
          shipping_department: string;
          shipping_province: string;
          shipping_district: string;
          shipping_address: string;
          shipping_reference: string | null;
          shipping_instructions: string | null;
          subtotal: number;
          shipping_cost: number;
          discount: number;
          total: number;
          stock_reserved_until: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          order_number: string;
          customer_id: string;
          status?: OrderStatus;
          is_gift?: boolean;
          gift_recipient_name?: string | null;
          gift_recipient_phone?: string | null;
          gift_message?: string | null;
          gift_special_packaging?: boolean;
          buyer_first_name: string;
          buyer_last_name: string;
          buyer_phone: string;
          buyer_email: string;
          shipping_department: string;
          shipping_province: string;
          shipping_district: string;
          shipping_address: string;
          shipping_reference?: string | null;
          shipping_instructions?: string | null;
          subtotal: number;
          shipping_cost?: number;
          discount?: number;
          total: number;
          stock_reserved_until?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          product_name: string;
          sku: string | null;
          unit_price: number;
          quantity: number;
          subtotal: number;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          product_name: string;
          sku?: string | null;
          unit_price: number;
          quantity: number;
          subtotal: number;
        };
        Update: Partial<Database["public"]["Tables"]["order_items"]["Insert"]>;
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          order_id: string;
          method: string;
          status: PaymentStatus;
          amount_expected: number;
          confirmed_by: string | null;
          confirmed_at: string | null;
          rejection_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          method?: string;
          status?: PaymentStatus;
          amount_expected: number;
          confirmed_by?: string | null;
          confirmed_at?: string | null;
          rejection_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["payments"]["Insert"]>;
        Relationships: [];
      };
      payment_receipts: {
        Row: {
          id: string;
          payment_id: string;
          file_url: string;
          mime_type: string;
          file_size_bytes: number;
          operation_number: string | null;
          operation_number_source: OperationNumberSource | null;
          amount_detected: number | null;
          operation_date_detected: string | null;
          ocr_confidence: number | null;
          ocr_raw_data: Json | null;
          is_possible_duplicate: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          payment_id: string;
          file_url: string;
          mime_type: string;
          file_size_bytes: number;
          operation_number?: string | null;
          operation_number_source?: OperationNumberSource | null;
          amount_detected?: number | null;
          operation_date_detected?: string | null;
          ocr_confidence?: number | null;
          ocr_raw_data?: Json | null;
          is_possible_duplicate?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["payment_receipts"]["Insert"]>;
        Relationships: [];
      };
      favorites: {
        Row: { id: string; customer_id: string; product_id: string; created_at: string };
        Insert: { id?: string; customer_id: string; product_id: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["favorites"]["Insert"]>;
        Relationships: [];
      };
      site_settings: {
        Row: {
          id: string;
          store_id: string;
          business_name: string | null;
          whatsapp_number: string | null;
          yape_holder_name: string | null;
          yape_number: string | null;
          yape_qr_url: string | null;
          yape_instructions: string | null;
          tax_rate: number;
          stock_reservation_minutes: number;
          promo_bar_messages: Json;
          social_links: Json;
          policies: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          business_name?: string | null;
          whatsapp_number?: string | null;
          yape_holder_name?: string | null;
          yape_number?: string | null;
          yape_qr_url?: string | null;
          yape_instructions?: string | null;
          tax_rate?: number;
          stock_reservation_minutes?: number;
          promo_bar_messages?: Json;
          social_links?: Json;
          policies?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["site_settings"]["Insert"]>;
        Relationships: [];
      };
      banners: {
        Row: {
          id: string;
          store_id: string;
          title: string | null;
          subtitle: string | null;
          image_url: string | null;
          link_url: string | null;
          placement: "hero" | "promo" | "brand";
          display_order: number;
          active: boolean;
          starts_at: string | null;
          ends_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          title?: string | null;
          subtitle?: string | null;
          image_url?: string | null;
          link_url?: string | null;
          placement?: "hero" | "promo" | "brand";
          display_order?: number;
          active?: boolean;
          starts_at?: string | null;
          ends_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["banners"]["Insert"]>;
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: string;
          store_id: string;
          actor_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          old_value: Json | null;
          new_value: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          actor_id?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          old_value?: Json | null;
          new_value?: Json | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["audit_logs"]["Insert"]>;
        Relationships: [];
      };
      order_number_counters: {
        Row: { store_id: string; last_number: number };
        Insert: { store_id: string; last_number?: number };
        Update: Partial<Database["public"]["Tables"]["order_number_counters"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: {
      storefront_products: {
        Row: {
          id: string;
          store_id: string;
          category_id: string | null;
          sku: string;
          name: string;
          slug: string;
          short_description: string | null;
          description: string | null;
          material: string | null;
          color: string | null;
          dimensions: string | null;
          weight_grams: number | null;
          featured: boolean;
          stock_available: number;
          price: number;
          compare_at_price: number | null;
          seo_title: string | null;
          seo_description: string | null;
          tags: string[];
          on_offer: boolean;
          created_at: string;
          updated_at: string;
        };
        Relationships: [];
      };
    };
    Functions: {
      create_guest_order: {
        Args: {
          p_store_id: string;
          p_customer: Json;
          p_shipping: Json;
          p_items: Json;
          p_gift?: Json | null;
          p_shipping_cost?: number;
          p_discount?: number;
        };
        Returns: { id: string; order_number: string }[];
      };
      get_order_public: {
        Args: { p_order_id: string };
        Returns: Json;
      };
      submit_payment_receipt: {
        Args: {
          p_order_id: string;
          p_file_url: string;
          p_mime_type: string;
          p_file_size_bytes: number;
          p_operation_number?: string | null;
          p_operation_number_source?: OperationNumberSource | null;
          p_amount_detected?: number | null;
          p_operation_date_detected?: string | null;
          p_ocr_confidence?: number | null;
          p_ocr_raw_data?: Json | null;
        };
        Returns: string;
      };
      register_production_run: {
        Args: {
          p_store_id: string;
          p_product_id: string;
          p_quantity: number;
          p_user_id: string;
        };
        Returns: string;
      };
      confirm_payment: {
        Args: { p_payment_id: string; p_confirmed_by: string };
        Returns: undefined;
      };
    };
    Enums: {
      product_status: ProductStatus;
      material_unit: MaterialUnit;
      inventory_movement_type: InventoryMovementType;
      order_status: OrderStatus;
      payment_status: PaymentStatus;
      operation_number_source: OperationNumberSource;
    };
  };
}
