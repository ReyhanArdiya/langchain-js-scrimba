import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { retriever } from "./retriever.js";

const llm = new ChatGoogleGenerativeAI({
  model: "gemini-1.5-pro"
});

const standaloneQuestionTemplate =
  "Given a question, convert it to a standalone question. question: {question} standalone question:";

const standaloneQuestionPrompt = PromptTemplate.fromTemplate(
  standaloneQuestionTemplate
);

/**
 * Challenge:
 * 1. Create a template and prompt to get an answer to
 *    the user's original question. Remember to include
 *    the original question and the text chunks we got
 *    back from the vector store as input variables. Call
 *    these input variables 'question' and 'context'.
 * ⚠️ Feel free to add this to the chain, but you will get
 *    an error.
 *
 * We want this chatbot to:
 *  - be friendly
 *  - only answer from the context provided and never make up
 *    answers
 *  - apologise if it doesn't know the answer and advise the
 *    user to email help@scrimba.com
 */

const userQuestion =
  "'What are the technical requirements for running Scrimba? I only have a very old laptop which is not that powerful.'";

const scrimBotResponseTemplate =
  "Given a question and the context, answer the question in a friendly manner. Only answer from the given context. If you don't know the answer, apologise and advise the user to email help@scrimba.com. question: {question} context: {context} answer:";

const scrimBotResponsePrompt = PromptTemplate.fromTemplate(scrimBotResponseTemplate);

const combineDocuments = docs => {
  return docs.map(doc => doc.pageContent).join("\n\n");
};

// Pipe is kinda like then in a promise chain
const chain = standaloneQuestionPrompt
  .pipe(llm)
  .pipe(new StringOutputParser())
  .pipe(retriever)
  .pipe(combineDocuments)
  .pipe(scrimBotResponsePrompt);

const response = await chain.invoke({
  question: userQuestion
});

console.log(response);
