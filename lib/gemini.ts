import { APP_PROPERTISE } from "@/app-config";
import { GoogleGenAI } from "@google/genai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { generateText } from "ai";

// Initialize Google AI
const ai = new GoogleGenAI({ apiKey: APP_PROPERTISE.GEMINI_API_KEY });

const google = createGoogleGenerativeAI({
  apiKey: APP_PROPERTISE.GEMINI_API_KEY,
});

// Constants
const MAX_CHUNK_SIZE = 4000;
const MAX_COMBINED_SUMMARY_SIZE = 15000; // Adjust based on model's context window
const CHUNK_OVERLAP = 200;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // ms

// Types
type SummaryType = "concise" | "detailed";
type UsageStats = {
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
};

// HTML formatting prompt
export const HTML_PROMPT = `Format your response as clean, semantic HTML with appropriate elements (h1, h2, p, ul, li, etc.). 
  Use Tailwind CSS classes for styling. Make sure to use proper heading hierarchy and structure.
  
  Guidelines for HTML output:
  - Start with an <h1> containing the document title
  - Use <h2> for main sections
  - Use <h3> for subsections
  - Use <p> for paragraphs
  - Use <ul> and <li> for lists
  - Use <blockquote> for quotes
  - Use <strong> and <em> for emphasis
  - Use Tailwind classes like:
    - text-2xl, text-xl, text-lg for text sizes
    - font-bold, font-semibold for font weights
    - mb-4, mt-2 for margins
    - text-gray-700, text-blue-600 for colors
    - etc.
  
  DO NOT include any JavaScript, just pure HTML with Tailwind classes.
  DO NOT include any <html>, <head>, <body> tags or doctype declarations.
  DO NOT include any comments or unnecessary attributes.
  ONLY return the HTML content that can be directly injected into a document.`;

/**
 * Splits text into manageable chunks for processing
 * @param text The text to split into chunks
 * @param maxChunkSize Maximum size of each chunk
 * @returns Array of text chunks
 */
export async function chunkText(
  text: string,
  maxChunkSize = MAX_CHUNK_SIZE
): Promise<string[]> {
  try {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: maxChunkSize,
      chunkOverlap: CHUNK_OVERLAP,
    });

    const chunks = await splitter.createDocuments([text]);
    return chunks.map((chunk) => chunk.pageContent);
  } catch (error) {
    console.error("Error chunking text:", error);
    throw new Error("Failed to process text into chunks");
  }
}

/**
 * Generates text with retry logic
 * @param prompt The prompt to send to the model
 * @returns Generated text and usage statistics
 */
async function generateTextWithRetry(
  prompt: string
): Promise<{ text: string; usage?: UsageStats }> {
  let attempts = 0;

  while (attempts < MAX_RETRIES) {
    try {
      const result = await generateText({
        model: google("gemini-1.5-pro-latest"),
        prompt,
      });

      return result;
    } catch (error: any) {
      attempts++;
      console.warn(
        `API request failed (attempt ${attempts}/${MAX_RETRIES}):`,
        error
      );

      if (attempts >= MAX_RETRIES) {
        throw new Error(
          `Failed to generate text after ${MAX_RETRIES} attempts: ${error.message}`
        );
      }

      // Exponential backoff
      await new Promise((resolve) =>
        setTimeout(resolve, RETRY_DELAY * Math.pow(2, attempts - 1))
      );
    }
  }

  throw new Error("Failed to generate text after retries");
}

/**
 * Tracks token usage for billing/monitoring purposes
 * @param userId User ID for tracking
 * @param tokens Total tokens used
 * @param model Model used
 */
async function trackTokenUsage(
  userId: string,
  tokens: number,
  model: string
): Promise<void> {
  try {
    // Implementation for tracking token usage in your database
    // Example: await db.tokenUsage.create({ userId, tokens, model, timestamp: new Date() });
    console.info(`Tracked ${tokens} tokens for user ${userId} using ${model}`);
  } catch (error) {
    console.error("Failed to track token usage:", error);
    // Non-blocking - we don't want to fail the main function if tracking fails
  }
}

/**
 * Generates a summary for a chunk of text
 * @param chunk Text chunk to summarize
 * @param pdfTitle Title of the document
 * @param summaryType Type of summary to generate
 * @param chunkIndex Index of the current chunk
 * @param totalChunks Total number of chunks
 * @param useHTML Whether to format the output as HTML
 * @returns Summary of the chunk
 */
async function summarizeChunk(
  userId: string,
  chunk: string,
  pdfTitle: string,
  summaryType: SummaryType,
  chunkIndex: number,
  totalChunks: number,
  useHTML: boolean
): Promise<string> {
  const prompt = `
    You are summarizing part ${
      chunkIndex + 1
    } of ${totalChunks} of the document titled "${pdfTitle}".
    ${
      summaryType === "concise"
        ? "Create a concise summary highlighting only the most important points."
        : "Create a detailed summary capturing all significant information and key details."
    }
    ${useHTML ? HTML_PROMPT : ""}
    
    Text to summarize:
    ${chunk}
  `;

  try {
    const { text, usage } = await generateTextWithRetry(prompt);

    // Track token usage if available
    if (usage) {
      await trackTokenUsage(userId, usage.totalTokens, "gemini-1.5-pro-latest");
    }

    return text;
  } catch (error) {
    console.error(`Error summarizing chunk ${chunkIndex + 1}:`, error);
    throw new Error(
      `Failed to summarize part ${chunkIndex + 1} of the document`
    );
  }
}

/**
 * Creates a meta-summary from multiple summaries
 * @param summaries Array of summaries to combine
 * @param pdfTitle Title of the document
 * @param summaryType Type of summary to generate
 * @param useHTML Whether to format the output as HTML
 * @returns Combined meta-summary
 */
async function createMetaSummary(
  userId: string,
  summaries: string[],
  pdfTitle: string,
  summaryType: SummaryType,
  useHTML: boolean
): Promise<string> {
  // If the combined text is too large, we need to chunk it again
  const combinedText = summaries.join("\n\n");

  if (combinedText.length > MAX_COMBINED_SUMMARY_SIZE) {
    console.info("Combined summaries too large, chunking meta-summaries");

    // Chunk the combined summaries
    const metaChunks = await chunkText(combinedText, MAX_COMBINED_SUMMARY_SIZE);

    // Create meta-summaries for each chunk of summaries
    const metaSummaries = await Promise.all(
      metaChunks.map(async (chunk, index) => {
        const metaPrompt = `
          You are creating an intermediate summary of a document titled "${pdfTitle}".
          This is part ${index + 1} of ${
          metaChunks.length
        } of the combined summaries.
          
          Create a coherent ${
            summaryType === "concise" ? "concise" : "comprehensive"
          } summary 
          that captures the key information from these summaries.
          
          Summaries to combine:
          ${chunk}
        `;

        const { text, usage } = await generateTextWithRetry(metaPrompt);

        if (usage) {
          await trackTokenUsage(
            userId,
            usage.totalTokens,
            "gemini-1.5-pro-latest"
          );
        }

        return text;
      })
    );

    // Recursively combine these meta-summaries until we have a single summary
    return createMetaSummary(
      userId,
      metaSummaries,
      pdfTitle,
      summaryType,
      useHTML
    );
  }

  // If the combined text is small enough, create the final summary
  const finalPrompt = `
    You are creating a final summary of a document titled "${pdfTitle}".
    Below are summaries of different parts of the document.
    
    Create a coherent, well-structured ${
      summaryType === "concise" ? "concise" : "comprehensive"
    } summary 
    that captures the key information from all parts.
    ${useHTML ? HTML_PROMPT : ""}
    
    Part summaries:
    ${combinedText}
  `;

  try {
    const { text, usage } = await generateTextWithRetry(finalPrompt);

    if (usage) {
      await trackTokenUsage(userId, usage.totalTokens, "gemini-1.5-pro-latest");
    }

    return text;
  } catch (error) {
    console.error("Error creating final meta-summary:", error);
    throw new Error("Failed to create the final document summary");
  }
}

/**
 * Main function to generate PDF summary
 * @param userId User ID for tracking usage
 * @param pdfText Full text of the PDF
 * @param pdfTitle Title of the PDF
 * @param summaryType Type of summary to generate
 * @returns Generated summary
 */
export async function generatePdfSummary(
  userId: string,
  pdfText: string,
  pdfTitle: string,
  summaryType: SummaryType = "concise"
): Promise<string> {
  try {
    // Input validation
    if (!pdfText || pdfText.trim() === "") {
      throw new Error("PDF text is empty");
    }

    if (!pdfTitle || pdfTitle.trim() === "") {
      pdfTitle = "Untitled Document";
    }

    // Chunk the text
    const chunks = await chunkText(pdfText);
    console.info(`Document split into ${chunks.length} chunks`);

    // Determine if we should use HTML formatting
    // For small documents, we can apply HTML formatting directly
    // For larger documents, we'll defer HTML formatting to the final meta-summary
    const useHtmlForChunks = chunks.length <= 3;

    // Generate summaries for each chunk
    const chunkSummaries = await Promise.all(
      chunks.map((chunk, index) =>
        summarizeChunk(
          userId,
          chunk,
          pdfTitle,
          summaryType,
          index,
          chunks.length,
          useHtmlForChunks
        )
      )
    );

    // For very small documents, we can just combine the summaries directly
    if (chunks.length === 1) {
      return chunkSummaries[0];
    }

    // For small documents (2-3 chunks), we can combine them without a meta-summary
    if (chunks.length <= 3) {
      return chunkSummaries.join("\n\n");
    }

    // For larger documents, create a meta-summary
    return await createMetaSummary(
      userId,
      chunkSummaries,
      pdfTitle,
      summaryType,
      true
    );
  } catch (error: any) {
    console.error("Error generating PDF summary:", error);
    throw new Error(`Failed to generate PDF summary: ${error.message}`);
  }
}
