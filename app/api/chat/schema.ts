import { z } from 'zod';

// Define a schema for AI analysis comments
export const aiAnalysisSchema = z.object({
  analysis: z.object({
    comments: z.array(
      z.object({
        id: z.string().describe('Unique identifier for the comment'),
        type: z.enum(['suggestion', 'warning', 'info', 'highlight']).describe('Type of AI comment'),
        title: z.string().describe('Brief title summarizing the comment'),
        content: z.string().describe('Detailed explanation of the finding or recommendation'),
        page: z.number().optional().describe('Page number where this applies (if applicable)'),
        confidence: z.number().min(0).max(1).describe('Confidence score between 0 and 1'),
        timestamp: z.string().describe('ISO timestamp when the comment was generated')
      })
    ),
    summary: z.object({
      warnings: z.number().describe('Count of warning-type comments'),
      suggestions: z.number().describe('Count of suggestion-type comments'),
      highlights: z.number().describe('Count of highlight-type comments'),
      info: z.number().describe('Count of info-type comments')
    })
  })
});

export type AIAnalysisResult = z.infer<typeof aiAnalysisSchema>; 