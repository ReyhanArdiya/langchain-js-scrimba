import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { RunnableSequence, RunnablePassthrough } from "@langchain/core/runnables";

const llm = new ChatGoogleGenerativeAI({
  model: "gemini-1.5-pro"
});

const punctuationTemplate = `Given a sentence, add punctuation where needed. 
    sentence: {sentence}
    sentence with punctuation:  
    `;
const punctuationPrompt = PromptTemplate.fromTemplate(punctuationTemplate);

const grammarTemplate = `Given a sentence correct the grammar.
    sentence: {punctuated_sentence}
    sentence with correct grammar: 
    `;
const grammarPrompt = PromptTemplate.fromTemplate(grammarTemplate);

const translationTemplate = `Given a sentence, translate that sentence into {language}
    sentence: {grammatically_correct_sentence}
    translated sentence:
    `;
const translationPrompt = PromptTemplate.fromTemplate(translationTemplate);

const puncChain = RunnableSequence.from([
  punctuationPrompt,
  llm,
  new StringOutputParser()
]);

const grammarChain = RunnableSequence.from([
  grammarPrompt,
  llm,
  new StringOutputParser()
]);

const translationChain = RunnableSequence.from([
  translationPrompt,
  llm,
  new StringOutputParser()
]);

const chain = RunnableSequence.from([
  {
    punctuated_sentence: puncChain,
    original_input: new RunnablePassthrough()
  },
  {
    grammatically_correct_sentence: grammarChain,
    language: ({ original_input: { language } }) => language
  },
  translationChain
]);

const response = await chain.invoke({
  sentence: "i dont liked mondays",
  language: "french"
});

console.log(response);
