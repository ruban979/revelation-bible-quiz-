import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ChapterContext, QuizQuestion } from "../types";

// Initialize Gemini Client
// Note: API Key must be set in process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = "gemini-2.5-flash";

const questionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING, description: "The quiz question in Tamil" },
          options: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "4 multiple choice options in Tamil"
          },
          correctAnswerIndex: { type: Type.INTEGER, description: "Index of the correct answer (0-3)" },
          scriptureReference: { type: Type.STRING, description: "Verse reference, e.g., '1:3'" },
          chapter: { type: Type.INTEGER, description: "The chapter number this question belongs to (1-22)" }
        },
        required: ["question", "options", "correctAnswerIndex", "scriptureReference", "chapter"]
      }
    }
  },
  required: ["questions"]
};

const contextSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "A creative title for the chapter story in Tamil" },
    summary: { type: Type.STRING, description: "A story-based summary of the chapter in Tamil" },
    keyVerses: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "2-3 key verses from the chapter in Tamil"
    },
    hints: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "3 interesting hints, facts, or takeaways about the chapter in Tamil"
    },
    flashcards: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          front: { type: Type.STRING, description: "The front of the card: Key Term, Symbol, or Question in Tamil" },
          back: { type: Type.STRING, description: "The back of the card: Definition, Meaning, or Answer in Tamil" }
        }
      },
      description: "8-10 flashcards for studying the chapter in Tamil"
    },
    fullText: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          number: { type: Type.INTEGER },
          text: { type: Type.STRING }
        }
      },
      description: "The full text of the chapter verse by verse in Tamil (BSI version)"
    },
    commentary: {
      type: Type.OBJECT,
      properties: {
        culturalContext: { type: Type.STRING, description: "Historical and cultural context of the chapter in Tamil" },
        interpretations: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              verseRef: { type: Type.STRING, description: "Verse range, e.g., '1-3' or '4'" },
              explanation: { type: Type.STRING, description: "Theological interpretation in Tamil" },
              crossReferences: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Biblical evidences/references" }
            }
          },
          description: "Verse-by-verse (or grouped verses) detailed commentary"
        }
      },
      description: "Detailed Bible commentary"
    }
  },
  required: ["title", "summary", "keyVerses", "hints", "flashcards", "fullText", "commentary"]
};

export const fetchChapterContext = async (chapter: number): Promise<ChapterContext> => {
  try {
    const prompt = `
      You are an expert theologian and Bible scholar in the Tamil language.
      For the Book of Revelation (வெளிப்படுத்தின விசேஷம்) Chapter ${chapter}:
      
      1. Provide the FULL text of the chapter in Tamil (BSI Version), split by verse number.
      2. Provide a story-based context summary explaining the key events like a narrative.
      3. Provide a creative title.
      4. Select 2-3 key verses.
      5. Provide 3 interesting hints or key facts about this chapter.
      6. Create 8-10 Flashcards for study (Front: Symbol/Term, Back: Meaning).
      7. **Provide Detailed Commentary:**
         - **Cultural Context**: Explain the historical setting, Roman empire context, or geographical significance of this chapter in Tamil.
         - **Interpretations**: Group verses (e.g., 1-3, 4-8) and provide a deep theological explanation for each group in Tamil. Include **Biblical Evidences** (cross-references to Old/New Testament) for your points.

      Output in strict JSON format matching the schema.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: contextSchema,
        systemInstruction: "Always respond in valid JSON containing Tamil text. Ensure all verses are included and commentary is theologically sound.",
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const data = JSON.parse(text);
    return {
      chapter,
      title: data.title,
      summary: data.summary,
      keyVerses: data.keyVerses,
      hints: data.hints || [],
      flashcards: data.flashcards || [],
      fullText: data.fullText || [],
      commentary: data.commentary || { culturalContext: "தகவல் இல்லை", interpretations: [] }
    };
  } catch (error) {
    console.error("Error fetching context:", error);
    // Fallback for demo/error purposes if API fails
    return {
      chapter,
      title: `அதிகாரம் ${chapter} - பிழை`,
      summary: "தகவலைப் பெறுவதில் பிழை ஏற்பட்டது. தயவுசெய்து சிறிது நேரம் கழித்து மீண்டும் முயற்சிக்கவும்.",
      keyVerses: [],
      hints: [],
      flashcards: [],
      fullText: [],
      commentary: { culturalContext: "", interpretations: [] }
    };
  }
};

export const fetchChapterQuestions = async (chapter: number, count: number = 20): Promise<QuizQuestion[]> => {
  try {
    const prompt = `
      Generate ${count} challenging multiple-choice quiz questions for the Book of Revelation (வெளிப்படுத்தின விசேஷம்) Chapter ${chapter} in Tamil.
      Based on the standard Tamil Bible (BSI).
      
      Instructions:
      - Create between ${Math.max(10, count - 5)} and ${count} questions depending on the chapter length.
      - Ensure questions cover the *entire* chapter from beginning to end.
      - Provide 4 options for each question.
      - Indicate the correct answer index.
      - Provide the scripture reference (e.g., "1:5").
      - Set the 'chapter' field to ${chapter}.
      
      Provide the output in strict JSON format.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: questionSchema,
        systemInstruction: "You are a Bible Quiz master. Generate accurate questions based on the Tamil Bible text.",
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const data = JSON.parse(text);
    
    // Map to ensure IDs
    return data.questions.map((q: any, index: number) => ({
      id: index,
      question: q.question,
      options: q.options,
      correctAnswerIndex: q.correctAnswerIndex,
      scriptureReference: q.scriptureReference,
      chapter: chapter
    }));

  } catch (error) {
    console.error("Error fetching questions:", error);
    return [];
  }
};

export const fetchMockExamQuestions = async (count: number = 25, mode: 'standard' | 'audio' = 'standard'): Promise<QuizQuestion[]> => {
  try {
    let promptInstructions = "";

    if (mode === 'audio') {
      promptInstructions = `
      Instructions for AUDIO SPEED TEST:
      1. RANDOMLY select questions from various chapters (1-22).
      2. **Crucial:** Questions must be SHORT and DIRECT (e.g., "Who holds the seven stars?", "What is the number of the beast?"). They will be read aloud with a 10s timer. Avoid long, complex scenarios.
      `;
    } else {
      promptInstructions = `
      Instructions for STANDARD MOCK EXAM:
      1. RANDOMLY select questions from various chapters (1-22).
      2. Create standard multiple-choice questions testing deep knowledge of Revelation.
      3. Mix easy, medium, and hard questions.
      `;
    }

    const prompt = `
      Generate a Full Mock Exam for the Book of Revelation (வெளிப்படுத்தின விசேஷம்) in Tamil.
      Create exactly ${count} questions.

      ${promptInstructions}

      3. Provide 4 options for each question.
      4. Indicate the correct answer index.
      5. Provide the scripture reference.
      6. Include the 'chapter' number.

      Provide the output in strict JSON format.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: questionSchema,
        systemInstruction: "You are a strict Bible Exam examiner. Create questions for an exam in Tamil.",
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const data = JSON.parse(text);
    
    // Map to ensure IDs
    return data.questions.map((q: any, index: number) => ({
      id: index,
      question: q.question,
      options: q.options,
      correctAnswerIndex: q.correctAnswerIndex,
      scriptureReference: q.scriptureReference,
      chapter: q.chapter
    }));

  } catch (error) {
    console.error("Error fetching mock exam:", error);
    return [];
  }
};
