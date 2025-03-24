import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the API with the API key from environment variables
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(API_KEY);

// Gemini model to use
const MODEL_NAME = 'gemini-2.0-flash';

// Add this interface to define the health data structure
interface HealthData {
  foodEntries?: Array<{
    name: string;
    calories: number;
    mealType?: string;
    date?: string;
  }>;
  exerciseEntries?: Array<{
    name: string;
    durationMinutes: number;
    caloriesBurned: number;
    date?: string;
  }>;
  waterEntries?: Array<{
    amount: number;
    date?: string;
  }>;
  weightEntries?: Array<{
    weight: number;
    date: string;
  }>;
  goals?: {
    dailyCalories?: number;
    dailyWater?: number;
    weightGoal?: number;
  };
  stats?: {
    totalCaloriesIn?: number;
    totalCaloriesBurned?: number;
    totalWaterIntake?: number;
  };
  // Add missing properties that are used in the code
  calorieGoal?: number;
  waterGoal?: number;
  latestWeight?: number;
  totalCaloriesIn?: number;
  totalWaterIntake?: number;
  totalCaloriesBurned?: number;
}

/**
 * Analyzes food entries and estimates calories
 * @param foodDescription Description of the food eaten
 * @returns Estimated calories and detailed nutritional analysis
 */
export const analyzeFoodEntry = async (foodDescription: string) => {
  try {
    if (!API_KEY) {
      throw new Error('Gemini API key is not configured');
    }

    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const prompt = `
      As a nutrition expert, analyze the following food description and provide:
      1. An estimate of the total calories
      2. The food name as a short title
      3. A brief nutritional breakdown (protein, carbs, fat)
      4. A category (breakfast, lunch, dinner, or snack)
      5. Health insights about this food

      Please format your response as a JSON object with the following structure:
      {
        "name": "Food name as a short title",
        "calories": estimated calories as a number,
        "mealType": "breakfast/lunch/dinner/snack",
        "nutritionalBreakdown": {
          "protein": "amount in grams",
          "carbs": "amount in grams",
          "fat": "amount in grams"
        },
        "healthInsights": "Brief health insights"
      }

      Food description: ${foodDescription}
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const textResponse = response.text();
    
    // Extract the JSON object from the response text
    try {
      // Find JSON object in the response (handling possible text before or after the JSON)
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse JSON from response');
      }
    } catch (jsonError) {
      console.error('Error parsing JSON from AI response:', jsonError);
      // Fallback response if parsing fails
      return {
        name: foodDescription.slice(0, 30),
        calories: 0,
        mealType: 'snack',
        nutritionalBreakdown: {
          protein: '0g',
          carbs: '0g',
          fat: '0g'
        },
        healthInsights: 'Could not analyze food. Please try again with a more detailed description.'
      };
    }
  } catch (error) {
    console.error('Error analyzing food with Gemini AI:', error);
    throw error;
  }
};

/**
 * Analyzes exercise and estimates calories burned
 * @param exerciseDescription Description of the exercise performed
 * @param durationMinutes Duration of the exercise in minutes
 * @returns Estimated calories burned and exercise analysis
 */
export const analyzeExerciseEntry = async (exerciseDescription: string, durationMinutes: number) => {
  try {
    if (!API_KEY) {
      throw new Error('Gemini API key is not configured');
    }

    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const prompt = `
      As a fitness expert, analyze the following exercise description and provide:
      1. An estimate of calories burned
      2. A proper name for this exercise
      3. The intensity level (low, moderate, high)
      4. Health benefits of this exercise
      5. Any recommendations for maximizing benefits

      Please format your response as a JSON object with the following structure:
      {
        "name": "Exercise name",
        "calories": estimated calories burned as a number,
        "intensity": "low/moderate/high",
        "benefits": "Brief health benefits",
        "recommendations": "Brief recommendations"
      }

      Exercise description: ${exerciseDescription}
      Duration: ${durationMinutes} minutes
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const textResponse = response.text();
    
    // Extract the JSON object from the response text
    try {
      // Find JSON object in the response (handling possible text before or after the JSON)
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse JSON from response');
      }
    } catch (jsonError) {
      console.error('Error parsing JSON from AI response:', jsonError);
      // Fallback response if parsing fails
      return {
        name: exerciseDescription.slice(0, 30),
        calories: Math.round(durationMinutes * 5), // Rough estimate
        intensity: 'moderate',
        benefits: 'Physical activity has general health benefits.',
        recommendations: 'Could not analyze exercise. Please try again with a more detailed description.'
      };
    }
  } catch (error) {
    console.error('Error analyzing exercise with Gemini AI:', error);
    throw error;
  }
};

/**
 * Generates AI health insights based on health data
 * @param healthData User's health data
 * @returns Personalized health insights and recommendations
 */
export const generateHealthInsights = async (healthData: HealthData) => {
  try {
    if (!API_KEY) {
      throw new Error('Gemini API key is not configured');
    }

    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const prompt = `
      As a health and wellness coach, analyze the following health data and provide three personalized insights:
      1. A nutrition insight
      2. A hydration insight
      3. A physical activity insight

      Please format your response as a JSON array with the following structure:
      [
        {
          "category": "nutrition/hydration/activity",
          "title": "Short, engaging title",
          "description": "Detailed insight and recommendation"
        },
        {
          "category": "nutrition/hydration/activity",
          "title": "Short, engaging title",
          "description": "Detailed insight and recommendation"
        },
        {
          "category": "nutrition/hydration/activity",
          "title": "Short, engaging title",
          "description": "Detailed insight and recommendation"
        }
      ]

      Health data: ${JSON.stringify(healthData)}
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const textResponse = response.text();
    
    // Extract the JSON array from the response text
    try {
      // Find JSON array in the response (handling possible text before or after the JSON)
      const jsonMatch = textResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse JSON from response');
      }
    } catch (jsonError) {
      console.error('Error parsing JSON from AI response:', jsonError);
      // Fallback insights if parsing fails
      return [
        {
          category: 'nutrition',
          title: 'Balance Your Diet',
          description: 'Aim for a balanced diet with plenty of fruits, vegetables, lean proteins, and whole grains.'
        },
        {
          category: 'hydration',
          title: 'Stay Hydrated',
          description: 'Remember to drink at least 8 glasses of water daily for optimal health.'
        },
        {
          category: 'activity',
          title: 'Move Regularly',
          description: 'Try to include at least 30 minutes of physical activity in your daily routine.'
        }
      ];
    }
  } catch (error) {
    console.error('Error generating health insights with Gemini AI:', error);
    throw error;
  }
};

/**
 * Sends a message to Gemini AI and gets a response
 * @param message The user's message
 * @param history Previous conversation history (transformed to Content[] internally)
 * @returns The AI's response
 */
export const getChatResponse = async (message: string, history: { role: 'user' | 'assistant', content: string }[] = []) => {
  try {
    if (!API_KEY) {
      throw new Error('Gemini API key is not configured');
    }

    // Use a chat-optimized model
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    
    // Gemini requires the first message to be from the user
    // If we have history and the first message is from assistant, we'll need to handle it differently
    if (history.length > 0 && history[0].role === 'assistant') {
      // Either remove the first message or use a different approach
      history = history.slice(1);
    }
    
    // If there's no history or it's empty after filtering, just send the message directly
    if (history.length === 0) {
      const result = await model.generateContent(message);
      return result.response.text();
    }
    
    // Transform history to the format expected by Gemini
    const formattedHistory = history.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));
    
    // Create chat session
    const chat = model.startChat({
      history: formattedHistory,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1000,
      },
    });

    // Get response from model
    const result = await chat.sendMessage(message);
    const response = result.response;
    const textResponse = response.text();
    
    return textResponse;
  } catch (error) {
    console.error('Error getting chat response from Gemini AI:', error);
    throw error;
  }
}; 