export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          image_url: string | null;
          accent_tone: string;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description?: string | null;
          image_url?: string | null;
          accent_tone?: string;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          description?: string | null;
          image_url?: string | null;
          accent_tone?: string;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          category_id: string;
          slug: string;
          name: string;
          short_description: string | null;
          description: string | null;
          image_url: string | null;
          gallery_urls: Json;
          badge: string | null;
          sku: string | null;
          base_price: number;
          sale_price: number | null;
          compare_at_price: number | null;
          unit_label: string;
          stock_quantity: number;
          stock_status: string;
          is_featured: boolean;
          is_frozen: boolean;
          accent_tone: string;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id: string;
          slug: string;
          name: string;
          short_description?: string | null;
          description?: string | null;
          image_url?: string | null;
          gallery_urls?: Json;
          badge?: string | null;
          sku?: string | null;
          base_price: number;
          sale_price?: number | null;
          compare_at_price?: number | null;
          unit_label?: string;
          stock_quantity?: number;
          stock_status?: string;
          is_featured?: boolean;
          is_frozen?: boolean;
          accent_tone?: string;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string;
          slug?: string;
          name?: string;
          short_description?: string | null;
          description?: string | null;
          image_url?: string | null;
          gallery_urls?: Json;
          badge?: string | null;
          sku?: string | null;
          base_price?: number;
          sale_price?: number | null;
          compare_at_price?: number | null;
          unit_label?: string;
          stock_quantity?: number;
          stock_status?: string;
          is_featured?: boolean;
          is_frozen?: boolean;
          accent_tone?: string;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      deals: {
        Row: {
          id: string;
          slug: string;
          name: string;
          headline: string;
          description: string | null;
          savings_label: string | null;
          banner_image_url: string | null;
          banner_tone: string;
          discount_type: string | null;
          discount_value: number | null;
          starts_at: string | null;
          ends_at: string | null;
          is_featured: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          headline: string;
          description?: string | null;
          savings_label?: string | null;
          banner_image_url?: string | null;
          banner_tone?: string;
          discount_type?: string | null;
          discount_value?: number | null;
          starts_at?: string | null;
          ends_at?: string | null;
          is_featured?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          headline?: string;
          description?: string | null;
          savings_label?: string | null;
          banner_image_url?: string | null;
          banner_tone?: string;
          discount_type?: string | null;
          discount_value?: number | null;
          starts_at?: string | null;
          ends_at?: string | null;
          is_featured?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      deal_items: {
        Row: {
          id: string;
          deal_id: string;
          product_id: string;
          quantity: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          deal_id: string;
          product_id: string;
          quantity?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          deal_id?: string;
          product_id?: string;
          quantity?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      delivery_zones: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          delivery_charge: number;
          free_delivery_minimum: number;
          estimated_delivery_time: string | null;
          accent_tone: string;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description?: string | null;
          delivery_charge?: number;
          free_delivery_minimum?: number;
          estimated_delivery_time?: string | null;
          accent_tone?: string;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          description?: string | null;
          delivery_charge?: number;
          free_delivery_minimum?: number;
          estimated_delivery_time?: string | null;
          accent_tone?: string;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      delivery_zone_areas: {
        Row: {
          id: string;
          zone_id: string | null;
          area_name: string | null;
          delivery_charge: number | null;
          description: string | null;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          zone_id?: string | null;
          area_name?: string | null;
          delivery_charge?: number | null;
          description?: string | null;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          zone_id?: string | null;
          area_name?: string | null;
          delivery_charge?: number | null;
          description?: string | null;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          customer_name: string;
          phone: string;
          address: string;
          note: string | null;
          delivery_zone_id: string | null;
          delivery_zone_name: string;
          delivery_zone_area_id: string | null;
          delivery_zone_area_name: string | null;
          delivery_charge: number;
          subtotal: number;
          total: number;
          status: string;
          whatsapp_message: string | null;
          whatsapp_sent: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number?: string;
          customer_name: string;
          phone: string;
          address: string;
          note?: string | null;
          delivery_zone_id?: string | null;
          delivery_zone_name: string;
          delivery_zone_area_id?: string | null;
          delivery_zone_area_name?: string | null;
          delivery_charge?: number;
          subtotal?: number;
          total?: number;
          status?: string;
          whatsapp_message?: string | null;
          whatsapp_sent?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_number?: string;
          customer_name?: string;
          phone?: string;
          address?: string;
          note?: string | null;
          delivery_zone_id?: string | null;
          delivery_zone_name?: string;
          delivery_zone_area_id?: string | null;
          delivery_zone_area_name?: string | null;
          delivery_charge?: number;
          subtotal?: number;
          total?: number;
          status?: string;
          whatsapp_message?: string | null;
          whatsapp_sent?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          product_name: string;
          quantity: number;
          unit_price: number;
          line_total: number;
          item_type: string;
          product_snapshot: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id?: string | null;
          product_name: string;
          quantity?: number;
          unit_price?: number;
          line_total?: number;
          item_type?: string;
          product_snapshot?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string | null;
          product_name?: string;
          quantity?: number;
          unit_price?: number;
          line_total?: number;
          item_type?: string;
          product_snapshot?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      contact_inquiries: {
        Row: {
          id: string;
          customer_name: string;
          phone: string | null;
          email: string | null;
          subject: string | null;
          message: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          customer_name: string;
          phone?: string | null;
          email?: string | null;
          subject?: string | null;
          message: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          customer_name?: string;
          phone?: string | null;
          email?: string | null;
          subject?: string | null;
          message?: string;
          status?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      site_settings: {
        Row: {
          id: number;
          site_name: string;
          tagline: string;
          whatsapp_number: string;
          logo_url: string | null;
          announcement_bar: string | null;
          contact_phone: string | null;
          contact_email: string | null;
          address: string | null;
          business_hours: string | null;
          hero_kicker: string;
          hero_title: string;
          hero_subtitle: string;
          homepage_story_title: string;
          homepage_story_body: string;
          products_section_title: string | null;
          deals_section_title: string | null;
          contact_section_title: string | null;
          primary_color: string | null;
          secondary_color: string | null;
          background_color: string | null;
          surface_color: string | null;
          currency_code: string | null;
        };
        Insert: {
          id?: number;
          site_name: string;
          tagline: string;
          whatsapp_number: string;
          logo_url?: string | null;
          announcement_bar?: string | null;
          contact_phone?: string | null;
          contact_email?: string | null;
          address?: string | null;
          business_hours?: string | null;
          hero_kicker: string;
          hero_title: string;
          hero_subtitle: string;
          homepage_story_title: string;
          homepage_story_body: string;
          products_section_title?: string | null;
          deals_section_title?: string | null;
          contact_section_title?: string | null;
          primary_color?: string | null;
          secondary_color?: string | null;
          background_color?: string | null;
          surface_color?: string | null;
          currency_code?: string | null;
        };
        Update: {
          id?: number;
          site_name?: string;
          tagline?: string;
          whatsapp_number?: string;
          logo_url?: string | null;
          announcement_bar?: string | null;
          contact_phone?: string | null;
          contact_email?: string | null;
          address?: string | null;
          business_hours?: string | null;
          hero_kicker?: string;
          hero_title?: string;
          hero_subtitle?: string;
          homepage_story_title?: string;
          homepage_story_body?: string;
          products_section_title?: string | null;
          deals_section_title?: string | null;
          contact_section_title?: string | null;
          primary_color?: string | null;
          secondary_color?: string | null;
          background_color?: string | null;
          surface_color?: string | null;
          currency_code?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

type PublicSchema = Database["public"];
type PublicTables = PublicSchema["Tables"];

export type Tables<TableName extends keyof PublicTables> =
  PublicTables[TableName]["Row"];

export type TablesInsert<TableName extends keyof PublicTables> =
  PublicTables[TableName]["Insert"];

export type TablesUpdate<TableName extends keyof PublicTables> =
  PublicTables[TableName]["Update"];
