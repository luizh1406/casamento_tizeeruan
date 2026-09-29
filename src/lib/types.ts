export interface TimelineItem { time: string; title: string; description?: string }
export interface FaqItem { q: string; a: string }
export interface GalleryItem { src: string; alt: string }

export interface Settings {
  brideName: string;
  groomName: string;
  weddingDate: string; // YYYY-MM-DD
  weddingTime: string; // HH:MM
  rsvpDeadline: string; // YYYY-MM-DD
  heroTagline: string;
  heroImage: string;
  story: {
    title: string;
    image: string;
    meetingTitle: string;
    meetingText: string;
    proposalTitle: string;
    proposalText: string;
    message: string;
  };
  venue: { name: string; address: string; mapsUrl: string; embedUrl: string };
  timeline: TimelineItem[];
  dressCode: { enabled: boolean; title: string; text: string; tips: string[] };
  faq: FaqItem[];
  gallery: GalleryItem[];
  pix: { key: string; receiverName: string; city: string };
  whatsapp: { number: string; message: string };
  social: { instagram: string; hashtag: string };
  seoImage: string;
}

export interface Gift {
  id: number;
  name: string;
  description: string;
  image_url: string;
  amount_cents: number | null;
  active: boolean;
  sort_order: number;
}

export type OrderStatus = "pending" | "reported" | "confirmed" | "cancelled";

export interface GiftOrder {
  id: number;
  public_token: string;
  gift_id: number | null;
  gift_name: string;
  amount_cents: number;
  guest_name: string;
  message: string;
  status: OrderStatus;
  created_at: string;
  confirmed_at: string | null;
}

export interface Rsvp {
  id: number;
  name: string;
  phone: string;
  attending: boolean;
  companions_count: number;
  companions_names: string;
  notes: string;
  created_at: string;
}
