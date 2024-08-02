import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

import fs from "fs";

import { createClient } from "@supabase/supabase-js";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

try {
  const text = fs.readFileSync("scrimba-info.txt", "utf-8");

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 50
  });

  const output = await splitter.createDocuments([text]);

  const sbApiKey = process.env.SUPABASE_API_KEY;
  const sbUrl = process.env.SUPABASE_URL_LC_CHATBOT;
  // const googleApiKey = process.env.GEMINI_GENAI_API_KEY;

  const client = createClient(sbUrl, sbApiKey);

  const embeddings = new GoogleGenerativeAIEmbeddings({
    model: "embedding-001"
  });

  await SupabaseVectorStore.fromDocuments(output, embeddings, {
    client,
    tableName: "documents"
  });
} catch (err) {
  console.log(err);
}
