import { createClient } from "@/lib/supabase/client"

type DbRow<T> = T & { created_at?: string; updated_at?: string }

export type FaqCategory = DbRow<{
  id: string
  slug: string
  label: string
  icon_name: string
  display_order: number
}>

export type FaqQuestion = DbRow<{
  id: string
  category_id: string
  question: string
  answer: string
  display_order: number
}>

export type HowStep = DbRow<{
  id: string
  title: string
  description: string
  icon_name: string
  color_gradient: string
  step_number: number
}>

export type HowDetail = DbRow<{
  id: string
  step_id: string
  detail_text: string
  display_order: number
}>

export type WhyFeature = DbRow<{
  id: string
  feature_text: string
  display_order: number
}>

export type WhyBenefit = DbRow<{
  id: string
  title: string
  description: string
  icon_name: string
  color_gradient: string
  display_order: number
}>

const supabase = createClient()

export async function fetchFaqContent() {
  const { data: categories } = await supabase
    .from<FaqCategory>("content_faq_categories")
    .select("*")
    .order("display_order", { ascending: true })

  const { data: questions } = await supabase
    .from<FaqQuestion>("content_faq_questions")
    .select("*")
    .order("display_order", { ascending: true })

  return { categories: categories ?? [], questions: questions ?? [] }
}

export async function fetchHowItWorksContent() {
  const { data: steps } = await supabase
    .from<HowStep>("content_how_it_works_steps")
    .select("*")
    .order("step_number", { ascending: true })

  const { data: details } = await supabase
    .from<HowDetail>("content_how_it_works_details")
    .select("*")
    .order("display_order", { ascending: true })

  return { steps: steps ?? [], details: details ?? [] }
}

export async function fetchWhyChooseContent() {
  const { data: features } = await supabase
    .from<WhyFeature>("content_why_choose_us_features")
    .select("*")
    .order("display_order", { ascending: true })

  const { data: benefits } = await supabase
    .from<WhyBenefit>("content_why_choose_us_benefits")
    .select("*")
    .order("display_order", { ascending: true })

  return { features: features ?? [], benefits: benefits ?? [] }
}
