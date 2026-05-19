import { supabase } from "./supabase";

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  skills: string[];
  description: string;
  url?: string;
  match?: number;
  postedDate?: string;
}

/**
 * Search for jobs using Supabase `jobs` table.
 * If a query is provided, it performs a case‑insensitive partial match on the title.
 */
export async function searchJobs(query = "") {
  let supabaseQuery = supabase
    .from("jobs")
    .select("*");

  if (query) {
    supabaseQuery = supabaseQuery.ilike("title", `%${query}%`);
  }

  const { data, error } = await supabaseQuery;

  if (error) {
    console.error("Supabase Error:", error);
    return { jobs: [], total: 0, error: error.message };
  }

  return { jobs: data as Job[], total: data?.length ?? 0 };
}
