
import { GoogleGenAI, Type } from "@google/genai";
import { EvaluationReport } from "../types";

const parseDataUrl = (dataUrl: string) => {
  try {
    const parts = dataUrl.split(',');
    if (parts.length !== 2) return null;
    const data = parts[1];
    const mimeType = parts[0].match(/:(.*?);/)?.[1] || "image/jpeg";
    return { inlineData: { data, mimeType } };
  } catch (err) {
    return null;
  }
};

export const evaluateAnswerSheet = async (
  qpImages: string[],
  keyImages: string[],
  studentImages: string[]
): Promise<EvaluationReport> => {
  const apiKey = process.env.API_KEY;

  if (!apiKey || apiKey === "undefined" || apiKey === "") {
    throw new Error("API_KEY_MISSING");
  }

  const ai = new GoogleGenAI({ apiKey });
  const modelName = "gemini-3-pro-preview";

  const parts: any[] = [
    {
      text: `You are a professional academic examiner.
Your task is to evaluate a student's answer sheet based on a provided question paper and (optional) answer key.

CRITICAL INSTRUCTIONS:
1. PAGE VERIFICATION:
   - I have provided multiple pages for the Question Paper, Answer Key, and Student Answer Sheet.
   - You MUST acknowledge and process EVERY SINGLE PAGE provided.
   - If there are 8 pages of student answers, you MUST evaluate all 8 pages. Do not stop early.
   - Check the page labels (e.g., "Student Answer Sheet (Page 8)") to ensure you haven't missed the final pages.

2. TOTAL MARKS & MARKING SCHEME (STRICT ADHERENCE):
   - DO NOT assume a total score (like 70, 80, or 100).
   - Look at the HEADER of the Question Paper. Total marks are often mentioned there as "70 Marks", "Max: 100", or "Marks: 80" even without explicit labels like "Total Marks" or "Maximum Marks".
   - INDEPENDENT VERIFICATION: You MUST manually list every question number found in the Question Paper and identify the marks assigned to EACH question.
   - MATHEMATICALLY SUM these individual marks to verify the total. If the header indicates 70 but the questions only add up to 60, use 60 as the maxScore and note the discrepancy in generalFeedback.
   - Identify the marking scheme (e.g., +4/-1 for MCQs, or specific marks for steps in descriptive answers) strictly from the paper.
   - If no marking scheme is explicitly stated, assume 1 mark per question unless the paper suggests otherwise.
   - Double-check your addition. Your reputation depends on mathematical accuracy.

3. HANDLING OPTIONAL QUESTIONS (CHOICE-BASED SECTIONS):
   - Some sections may allow choice (e.g., "Attempt any 5 out of 8" or "Answer any 2").
   - You MUST identify these instructions in the Question Paper.
   - Cross-reference with the Student Answer Sheet to see which questions the student actually attempted.
   - For the "maxScore" calculation: Use the sum of marks for the REQUIRED number of questions. For example, if a section says "Attempt any 2" and each question is 5 marks, that section contributes 10 marks to the maxScore, regardless of how many questions are in the list.
   - If a student attempts MORE than the required number of questions, evaluate all of them but only count the BEST scores towards the totalScore (up to the limit specified in the paper).

4. EVALUATION PHILOSOPHY:
   - Evaluate with fairness.
   - For Multiple Choice Questions (MCQs): Match the OPTION (A, B, C, D) primarily.
   - For descriptive answers: Award partial marks for partially correct answers.

5. ANTI-HALLUCINATION:
   - ONLY evaluate questions that actually exist in the Question Paper.
   - ONLY use information present in the Student Answer Sheet.
   - If a question is in the paper but not answered, marksObtained is 0.
   - For optional sections: If a student didn't attempt an optional question, it is NOT an error. Only penalize (0 marks) if they failed to meet the MINIMUM required attempts for that section.

6. OUTPUT:
   - Return ONLY a valid JSON object.
   - Ensure 'grades' array contains EVERY question from the paper, even those on the very last pages of the student's work.`
    }
  ];

  const addFiles = (urls: string[], label: string) => {
    urls.forEach((url, i) => {
      const part = parseDataUrl(url);
      if (part) {
        parts.push({ text: `DOCUMENT: ${label} (Page ${i + 1})` });
        parts.push(part);
      }
    });
  };

  addFiles(qpImages, "Question Paper");
  addFiles(keyImages, "Expert Answer Key");
  addFiles(studentImages, "Student Handwritten Answer Sheet");

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts },
      config: {
        temperature: 0.1,
        seed: 42,
        thinkingConfig: { thinkingBudget: 24000 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            studentInfo: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                rollNumber: { type: Type.STRING },
                subject: { type: Type.STRING },
                class: { type: Type.STRING },
                examName: { type: Type.STRING },
                date: { type: Type.STRING },
              },
              required: ["name", "subject"]
            },
            grades: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  questionNumber: { type: Type.STRING },
                  studentAnswer: { type: Type.STRING },
                  correctAnswer: { type: Type.STRING },
                  marksObtained: { type: Type.NUMBER },
                  totalMarks: { type: Type.NUMBER },
                  feedback: { type: Type.STRING },
                },
                required: ["questionNumber", "marksObtained", "totalMarks"]
              }
            },
            totalScore: { type: Type.NUMBER },
            maxScore: { type: Type.NUMBER },
            percentage: { type: Type.NUMBER },
            generalFeedback: { type: Type.STRING },
          },
          required: ["studentInfo", "grades", "totalScore", "maxScore", "percentage", "generalFeedback"]
        }
      }
    });

    if (!response.text) throw new Error("Empty AI response.");
    const data = JSON.parse(response.text.trim());
    
    // Safety arithmetic check
    const calculatedTotal = data.grades.reduce((acc: number, g: any) => acc + (g.marksObtained || 0), 0);
    data.totalScore = calculatedTotal;
    data.percentage = data.maxScore > 0 ? (calculatedTotal / data.maxScore) * 100 : 0;

    return data;
  } catch (error: any) {
    console.error("NextGenEval Engine Failure:", error);
    throw error;
  }
};
