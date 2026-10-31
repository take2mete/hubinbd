export type ToolDefinition = {
  slug: string;
  title: string;
  titleBn: string;
  description: string;
  descriptionBn: string;
  category: "calculator";
  icon: string;
};

export const tools: ToolDefinition[] = [
  {
    slug: "age-calculator",
    title: "Age Calculator",
    titleBn: "বয়স ক্যালকুলেটর",
    description: "Calculate your exact age in years, months, and days.",
    descriptionBn: "জন্মতারিখ থেকে বছর, মাস ও দিনে সঠিক বয়স জানুন।",
    category: "calculator",
    icon: "🎂",
  },
  {
    slug: "bmi-calculator",
    title: "BMI Calculator",
    titleBn: "BMI ক্যালকুলেটর",
    description: "Check your Body Mass Index using height and weight.",
    descriptionBn: "উচ্চতা ও ওজন দিয়ে Body Mass Index হিসাব করুন।",
    category: "calculator",
    icon: "⚖️",
  },
];

export function getToolBySlug(slug: string) {
  return tools.find((tool) => tool.slug === slug);
}
