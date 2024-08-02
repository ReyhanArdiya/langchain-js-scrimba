import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { createClient } from "@supabase/supabase-js";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

const sbApiKey = process.env.SUPABASE_API_KEY;
const sbUrl = process.env.SUPABASE_URL_LC_CHATBOT;

const client = createClient(sbUrl, sbApiKey);

const llm = new ChatGoogleGenerativeAI({
  model: "gemini-1.5-pro"
});
const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "embedding-001"
});

const tweetTemplate =
  "Generate a promotional tweet for a product, from this product description: {productDesc}";

const prompt = PromptTemplate.fromTemplate(tweetTemplate);

console.log(prompt);
