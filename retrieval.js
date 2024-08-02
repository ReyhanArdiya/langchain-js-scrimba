import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { createClient } from "@supabase/supabase-js";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { StringOutputParser } from "@langchain/core/output_parsers";

const sbApiKey = process.env.SUPABASE_API_KEY;
const sbUrl = process.env.SUPABASE_URL_LC_CHATBOT;

const client = createClient(sbUrl, sbApiKey);

const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "embedding-001"
});
const vectorStore = new SupabaseVectorStore(embeddings, {
  client,
  tableName: "documents",
  queryName: "match_documents"
});

const retriever = vectorStore.asRetriever();

const llm = new ChatGoogleGenerativeAI({
  model: "gemini-1.5-pro"
});

const standaloneQuestionTemplate =
  "Given a question, convert it to a standalone question. question: {question} standalone question:";

const standaloneQuestionPrompt = PromptTemplate.fromTemplate(
  standaloneQuestionTemplate
);

// Pipe is kinda like then in a promise chain
const chain = standaloneQuestionPrompt
  .pipe(llm)
  .pipe(new StringOutputParser())
  .pipe(retriever);

const response = await chain.invoke({
  question:
    "Laptop gw tuh jelek banget brooo, tapi pengen amet nyoba Scrimba gimana yoww?"
});

// const res2 = await retriever.invoke("Will scrimba work for old laptops?");

console.log(response);
