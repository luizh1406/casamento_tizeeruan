import type { Settings } from "@/lib/types";

export const DEFAULT_SETTINGS: Settings = {
  brideName: "Beatriz",
  groomName: "Ruan",
  weddingDate: "2027-06-19",
  weddingTime: "16:30",
  rsvpDeadline: "2027-04-15",
  heroTagline: "Estamos contando os dias para celebrar esse momento com vocês.",
  heroImage: "/placeholders/hero.svg",
  pix: { key: "", receiverName: "Beatriz e Ruan", city: "Curitiba" },
  whatsapp: { number: "", message: "Olá! Vim pelo site do casamento e gostaria de tirar uma dúvida." },
  social: { instagram: "", hashtag: "#BeatrizeRuan" },
  seoImage: "",
};

export const SEED_GIFTS: { name: string; description: string; image: string; amountCents: number | null }[] = [
  { name: "Café da manhã dos recém-casados", description: "Para começar o primeiro dia de casados com croissant, café quentinho e zero pressa.", image: "/placeholders/gift-coffee.svg", amountCents: 8000 },
  { name: "Jantar romântico na lua de mel", description: "Uma mesa à luz de velas, taças cheias e a promessa de dividir a sobremesa.", image: "/placeholders/gift-dinner.svg", amountCents: 18000 },
  { name: "Passeio especial na lua de mel", description: "Um passeio para lembrar pelo resto da vida (e encher o álbum de fotos).", image: "/placeholders/gift-trip.svg", amountCents: 30000 },
  { name: "Ajuda para nossa viagem", description: "Uma forcinha para as passagens, malas e sonhos que já estão prontos para embarcar.", image: "/placeholders/gift-plane.svg", amountCents: 50000 },
  { name: "Uma diária da lua de mel", description: "Uma noite de descanso, vista bonita e nenhum despertador tocando.", image: "/placeholders/gift-bed.svg", amountCents: 80000 },
  { name: "Upgrade da lua de mel", description: "Aquele quarto com vista, aquele detalhe a mais. Você é o responsável pelo “uau”.", image: "/placeholders/gift-star.svg", amountCents: 120000 },
  { name: "Presente surpresa para os noivos", description: "Escolha o valor que o seu coração mandar. Vamos guardar cada centavo com carinho.", image: "/placeholders/gift-surprise.svg", amountCents: null },
];
