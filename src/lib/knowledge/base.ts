export interface KnowledgeEntry {
  id: string;
  category: string;
  title: string;
  content: string;
  timestamp: string;
  relevance: number;
  tags: string[];
}

const knowledgeEntries: KnowledgeEntry[] = [
  {
    id: "k-1",
    category: "market-patterns",
    title: "نمط الرأس والكتفين",
    content: "نمط انعكاسي يشير إلى تغير الاتجاه، يتشكل من ثلاث قمم مع قمة وسطى أعلى",
    timestamp: "2026-01-15T10:00:00Z",
    relevance: 95,
    tags: ["فني", "انعكاسي", "شموع"],
  },
  {
    id: "k-2",
    category: "risk-management",
    title: "قاعدة 2% للمخاطرة",
    content: "لا تخاطر بأكثر من 2% من رأس مالك في صفقة واحدة",
    timestamp: "2026-01-10T08:00:00Z",
    relevance: 100,
    tags: ["مخاطرة", "إدارة رأس مال"],
  },
  {
    id: "k-3",
    category: "market-patterns",
    title: "استراتيجية SMC",
    content: "Smart Money Concepts تتبع حركة المؤسسات الكبيرة من خلال تحليل Order Blocks و Liquidity Pools",
    timestamp: "2026-02-01T12:00:00Z",
    relevance: 88,
    tags: ["SMC", "مؤسسي", "سيولة"],
  },
  {
    id: "k-4",
    category: "fundamental",
    title: "تحليل DCF",
    content: "Discounted Cash Flow يحسب القيمة الحالية للتدفقات النقدية المستقبلية لتحديد القيمة العادلة",
    timestamp: "2026-01-20T09:00:00Z",
    relevance: 92,
    tags: ["تسعير", "تدفقات", "قيمة عادلة"],
  },
  {
    id: "k-5",
    category: "psychology",
    title: "تحيز التأكيد",
    content: "الميل للبحث عن معلومات تؤكد رأيك الحالي وتتجاهل ما يتعارض معه",
    timestamp: "2026-02-05T14:00:00Z",
    relevance: 85,
    tags: ["نفسية", "تحيز", "قرارات"],
  },
  {
    id: "k-6",
    category: "crisis-patterns",
    title: "نمط أزمة 2008",
    content: "انهيار سوق العقارات يسبب تأثير دومينو عبر الأوراق المالية المدعومة بالرهن العقاري",
    timestamp: "2026-01-05T07:00:00Z",
    relevance: 75,
    tags: ["أزمة", "عقارات", "تاريخ"],
  },
];

export function getKnowledgeBase(): KnowledgeEntry[] {
  return knowledgeEntries;
}

export function searchKnowledge(query: string): KnowledgeEntry[] {
  const q = query.toLowerCase();
  return knowledgeEntries.filter(
    (e) =>
      e.title.toLowerCase().includes(q) ||
      e.content.toLowerCase().includes(q) ||
      e.tags.some((t) => t.includes(q))
  );
}

export function addKnowledgeEntry(entry: Omit<KnowledgeEntry, "id" | "timestamp">): KnowledgeEntry {
  const newEntry: KnowledgeEntry = {
    ...entry,
    id: `k-${Date.now()}`,
    timestamp: new Date().toISOString(),
  };
  knowledgeEntries.push(newEntry);
  return newEntry;
}
