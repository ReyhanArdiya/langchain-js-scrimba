import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { retriever } from "./challenge-2/retriever.js";
import { RunnableSequence, RunnablePassthrough } from "@langchain/core/runnables";

document.addEventListener("submit", e => {
  e.preventDefault();
  progressConversation();
});

const llm = new ChatGoogleGenerativeAI({
  model: "gemini-1.5-pro"
});

const standaloneQuestionTemplate =
  "Given a question, convert it to a standalone question. question: {question} standalone question:";
const standaloneQuestionPrompt = PromptTemplate.fromTemplate(
  standaloneQuestionTemplate
);

const answerTemplate = `You are a helpful and enthusiastic support bot who can answer a given question about Scrimba based on the context provided. Try to find the answer in the context. If you really don't know the answer, say "I'm sorry, I don't know the answer to that." And direct the questioner to email help@scrimba.com. Don't try to make up an answer. Always speak as if you were chatting to a friend.
context: {context}
question: {question}
answer: `;
const answerPrompt = PromptTemplate.fromTemplate(answerTemplate);

/**
 * Super Challenge:
 *
 * Set up a RunnableSequence so that the standaloneQuestionPrompt
 * passes the standalone question to the retriever, and the retriever
 * passes the combined docs as context to the answerPrompt. Remember,
 * the answerPrompt should also have access to the original question.
 *
 * When you have finished the challenge, you should see a
 * conversational answer to our question in the console.
 *
 **/

const standaloneQuestionChain = RunnableSequence.from([
  standaloneQuestionPrompt,
  llm,
  new StringOutputParser()
]);

const combineDocuments = docs => {
  return docs.map(doc => doc.pageContent).join("\n\n");
};

const retrieverChain = RunnableSequence.from([retriever, combineDocuments]);

const answerChain = RunnableSequence.from([
  answerPrompt,
  llm,
  new StringOutputParser()
]);

const chain = RunnableSequence.from([
  {
    context: RunnableSequence.from([standaloneQuestionChain, retrieverChain]),
    original_input: new RunnablePassthrough()
  },
  {
    question: ({ original_input: { question } }) => question,
    context: ({ context }) => context
  },
  answerChain
]);

async function progressConversation() {
  const userInput = document.getElementById("user-input");
  const chatbotConversation = document.getElementById(
    "chatbot-conversation-container"
  );
  const question = userInput.value;
  userInput.value = "";

  // add human message
  const newHumanSpeechBubble = document.createElement("div");
  newHumanSpeechBubble.classList.add("speech", "speech-human");
  chatbotConversation.appendChild(newHumanSpeechBubble);
  newHumanSpeechBubble.textContent = question;
  chatbotConversation.scrollTop = chatbotConversation.scrollHeight;
  const response = await chain.invoke({
    question
  });

  // add AI message
  const newAiSpeechBubble = document.createElement("div");
  newAiSpeechBubble.classList.add("speech", "speech-ai");
  chatbotConversation.appendChild(newAiSpeechBubble);
  newAiSpeechBubble.textContent = result;
  chatbotConversation.scrollTop = chatbotConversation.scrollHeight;
}
