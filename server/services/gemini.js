import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API Client
let genAI = null;
const getGenAI = () => {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured in environment variables.');
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
};

// Response schema to enforce structured output from Gemini
const taskSchema = {
  type: "object",
  properties: {
    tasks: {
      type: "array",
      description: "List of extracted tasks or deadlines found in the document.",
      items: {
        type: "object",
        properties: {
          task: {
            type: "string",
            description: "Clear and concise title of the task or deadline (e.g., 'Assignment 3: Data Structures' or 'Uber Interview')"
          },
          deadline: {
            type: "string",
            description: "Parsed date in YYYY-MM-DD format. Today's date is 2026-07-10. If the date is '15 July', output '2026-07-15'. If the text says 'tomorrow', output '2026-07-11'. If no deadline date is found, default to today's date (2026-07-10)."
          },
          originalDeadline: {
            type: "string",
            description: "The raw deadline string as it appeared in the document text (e.g., '15 July', 'tomorrow', '25th of this month')"
          },
          time: {
            type: "string",
            description: "Extracted time (e.g., '5:00 PM', '11:59 PM', '14:00'), or empty string if not mentioned."
          },
          priority: {
            type: "string",
            enum: ["High", "Medium", "Low"],
            description: "Task priority. Assign 'High' if the deadline is urgent (e.g. within 3-5 days), or if it is an exam/placement interview. Assign 'Medium' if it's moderate, and 'Low' otherwise."
          },
          category: {
            type: "string",
            enum: [
              "Assignments",
              "Placements",
              "Internships",
              "Exams",
              "Bills",
              "Meetings",
              "Events",
              "Projects",
              "Personal",
              "Others"
            ],
            description: "The best fitting category for this task."
          },
          shortSummary: {
            type: "string",
            description: "A short 1-2 sentence summary of what this task requires or details surrounding it."
          },
          reason: {
            type: "string",
            description: "A brief reason why this task was extracted and why this priority was assigned (e.g., 'Deadline is in 5 days; high importance assignment')."
          }
        },
        required: ["task", "deadline", "originalDeadline", "time", "priority", "category", "shortSummary", "reason"]
      }
    }
  },
  required: ["tasks"]
};

/**
 * Send raw text to Gemini and return structured tasks JSON
 * @param {string} rawText - Extracted text from OCR or files
 * @returns {Promise<Array>} List of extracted task objects
 */
export const extractTasksFromText = async (rawText) => {
  try {
    const aiClient = getGenAI();
    // Using gemini-flash-latest (1.5 Flash) to utilize a fresh quota pool and prevent 429 rate limit blocks
    const model = aiClient.getGenerativeModel({ model: 'gemini-flash-latest' });

    const todayDateStr = 'Friday, July 10, 2026';
    const prompt = `
You are a highly advanced AI system designed to extract tasks, deadlines, and events from unstructured text documents.
Today's date is: ${todayDateStr}. Use this reference date to resolve any relative dates (e.g. 'tomorrow' means '2026-07-11', 'next Monday' means '2026-07-13', '15 July' means '2026-07-15').

Analyze the following document text and extract all tasks, deadlines, bills, exams, and key events. 
For each item, determine:
- The title (task)
- The parsed date (YYYY-MM-DD format)
- The original date description
- The time of day (if specified)
- The priority (High, Medium, Low)
- The category (Assignments, Placements, Internships, Exams, Bills, Meetings, Events, Projects, Personal, Others)
- A brief 1-2 sentence summary
- The reason you extracted this task and set this priority.

If the text contains no clear deadlines or tasks, return an empty array for tasks.

--- DOCUMENT TEXT START ---
${rawText}
--- DOCUMENT TEXT END ---
`;

    console.log('[Gemini] Requesting structured extraction from Gemini...');
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: taskSchema
      }
    });

    const textResponse = result.response.text();
    console.log('[Gemini] Received response:', textResponse);
    
    const parsedData = JSON.parse(textResponse);
    return parsedData.tasks || [];
  } catch (error) {
    console.error('[Gemini] Extraction error:', error.message);
    throw new Error(`Failed to extract tasks using Gemini: ${error.message}`);
  }
};
