import type { Settings } from "@/lib/types";

export const DEFAULT_SETTINGS: Settings = {
  brideName: "Beatriz",
  groomName: "Ruan",
  weddingDate: "2027-06-19",
  weddingTime: "16:30",
  rsvpDeadline: "2027-04-15",
  heroTagline: "Estamos contando os dias para celebrar esse momento com vocês.",
  heroImage: "/placeholders/hero.svg",
  story: {
    title: "Nossa história",
    image: "/placeholders/story.svg",
    meetingTitle: "Como nos conhecemos",
    meetingText: "Foi num fim de tarde comum, entre amigos em comum e uma conversa que não queria acabar. Naquele dia, sem saber, começamos a escrever o nosso capítulo favorito.",
    proposalTitle: "O pedido",
    proposalText: "Diante do mar, com o coração acelerado, veio a pergunta mais fácil de responder da nossa vida. O “sim” saiu antes mesmo do fim da frase.",
    message: "Cada um de vocês faz parte da nossa história. Ter vocês ao nosso lado nesse dia será o maior presente.",
  },
  venue: {
    name: "Igreja Sagrada Família",
    address: "Sol Nascente",
    mapsUrl: "https://maps.app.goo.gl/spfhpEZ58yZhVxN89",
    embedUrl: "https://www.google.com/maps?q=-26.061663,-48.743276&output=embed",
  },
  timeline: [
    { time: "16:00", title: "Recepção dos convidados", description: "Welcome drink e boas-vindas" },
    { time: "16:30", title: "Cerimônia", description: "O momento mais esperado" },
    { time: "18:00", title: "Recepção", description: "Coquetel e brindes" },
    { time: "19:00", title: "Jantar", description: "Um menu pensado com carinho" },
    { time: "21:00", title: "Festa", description: "Hora de dançar até o fim" },
  ],
  dressCode: {
    enabled: true,
    title: "Esporte fino",
    text: "Queremos todos elegantes e confortáveis para celebrar e dançar bastante.",
    tips: [
      "Tons claros e terrosos combinam com a decoração",
      "Evite branco, off-white e marfim — reservados à noiva",
      "Sapatos confortáveis: parte da festa será em área externa",
    ],
  },
  faq: [
    { q: "Posso levar acompanhante?", a: "Os convites são nominais. Se o seu convite inclui acompanhante, informe o nome dele(a) ao confirmar presença." },
    { q: "Crianças são permitidas?", a: "Amamos os pequenos, mas optamos por uma celebração para maiores de 12 anos. Agradecemos a compreensão." },
    { q: "Existe estacionamento?", a: "Sim, o local possui estacionamento com manobristas, sem custo para os convidados." },
    { q: "Qual o traje recomendado?", a: "Esporte fino. Veja mais detalhes na seção “Traje” acima." },
    { q: "Até quando devo confirmar presença?", a: "Pedimos que a confirmação seja feita até 15 de abril de 2027, para organizarmos tudo com carinho." },
    { q: "Como funciona a lista de presentes?", a: "Nossos presentes são simbólicos: você escolhe uma experiência da nossa lua de mel (ou um valor livre) e envia o valor via Pix, direto para os noivos. Simples, seguro e sem taxas." },
  ],
  gallery: [
    { src: "/placeholders/g1.svg", alt: "Os noivos" },
    { src: "/placeholders/g2.svg", alt: "Os noivos" },
    { src: "/placeholders/g3.svg", alt: "Os noivos" },
    { src: "/placeholders/g4.svg", alt: "Os noivos" },
    { src: "/placeholders/g5.svg", alt: "Os noivos" },
    { src: "/placeholders/g6.svg", alt: "Os noivos" },
  ],
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
