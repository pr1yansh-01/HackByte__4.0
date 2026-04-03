import { Feedback, SimilarityResult, Priority } from '@/types/feedback';

function preprocessText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(text: string): Set<string> {
  const stopWords = new Set([
    'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare',
    'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as',
    'i', 'me', 'my', 'we', 'our', 'you', 'your', 'he', 'she', 'it', 'they',
    'this', 'that', 'these', 'those', 'what', 'which', 'who', 'whom',
    'and', 'or', 'but', 'if', 'then', 'else', 'when', 'up', 'down', 'out',
    'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below'
  ]);
  
  const tokens = preprocessText(text).split(' ');
  return new Set(tokens.filter(token => token.length > 2 && !stopWords.has(token)));
}

function calculateJaccardSimilarity(tokens1: Set<string>, tokens2: Set<string>): number {
  let intersectionSize = 0;
  tokens1.forEach(x => {
    if (tokens2.has(x)) intersectionSize++;
  });
  const unionSize = tokens1.size + tokens2.size - intersectionSize;
  
  if (unionSize === 0) return 0;
  return intersectionSize / unionSize;
}

function extractKeyPhrases(text: string): string[] {
  const words = preprocessText(text).split(' ');
  const phrases: string[] = [];
  
  for (let i = 0; i < words.length - 1; i++) {
    phrases.push(`${words[i]} ${words[i + 1]}`);
  }
  
  return phrases;
}

function calculatePhraseSimilarity(text1: string, text2: string): number {
  const phrases1 = new Set(extractKeyPhrases(text1));
  const phrases2 = new Set(extractKeyPhrases(text2));
  
  let intersectionSize = 0;
  phrases1.forEach(x => {
    if (phrases2.has(x)) intersectionSize++;
  });
  const unionSize = phrases1.size + phrases2.size - intersectionSize;
  
  if (unionSize === 0) return 0;
  return intersectionSize / unionSize;
}

export function calculateSimilarity(text1: string, text2: string): number {
  const combined1 = `${text1}`;
  const combined2 = `${text2}`;
  
  const tokens1 = tokenize(combined1);
  const tokens2 = tokenize(combined2);
  
  const jaccardSimilarity = calculateJaccardSimilarity(tokens1, tokens2);
  const phraseSimilarity = calculatePhraseSimilarity(combined1, combined2);
  
  let wordOverlap = 0;
  tokens1.forEach(x => {
    if (tokens2.has(x)) wordOverlap++;
  });
  const maxOverlap = Math.max(tokens1.size, tokens2.size);
  const overlapScore = maxOverlap > 0 ? wordOverlap / maxOverlap : 0;
  
  return (jaccardSimilarity * 0.4) + (phraseSimilarity * 0.4) + (overlapScore * 0.2);
}

export function findSimilarFeedbacks(
  newTitle: string,
  newDescription: string,
  existingFeedbacks: Feedback[],
  threshold: number = 0.3
): SimilarityResult {
  const combinedNew = `${newTitle} ${newDescription}`;
  const similarFeedbacks: Feedback[] = [];
  
  for (const feedback of existingFeedbacks) {
    const combinedExisting = `${feedback.title} ${feedback.description}`;
    const similarityScore = calculateSimilarity(combinedNew, combinedExisting);
    
    if (similarityScore >= threshold) {
      similarFeedbacks.push(feedback);
    }
  }
  
  similarFeedbacks.sort((a, b) => {
    const scoreA = calculateSimilarity(combinedNew, `${a.title} ${a.description}`);
    const scoreB = calculateSimilarity(combinedNew, `${b.title} ${b.description}`);
    return scoreB - scoreA;
  });
  
  const avgScore = similarFeedbacks.length > 0
    ? similarFeedbacks.reduce((sum, fb) => 
        sum + calculateSimilarity(combinedNew, `${fb.title} ${fb.description}`), 0
      ) / similarFeedbacks.length
    : 0;
  
  return {
    isSimilar: similarFeedbacks.length > 0,
    similarityScore: avgScore,
    similarFeedbacks
  };
}

export function calculatePriorityFromSimilarCount(similarCount: number): Priority {
  if (similarCount === 0) return 'low';
  if (similarCount <= 2) return 'medium';
  return 'high';
}
