import { BaseAgent } from './base-agent';
import type { AgentResult } from '../types/agent';
import { createChatCompletion } from '../services/llm-service';
import { TOOLS } from '../services/tool-service';

export class WeatherAgent extends BaseAgent {
  async process(query: string, language: string): Promise<AgentResult> {
    // Extract location from query
    const locationResponse = await createChatCompletion([
      { role: 'system', content: this.config.systemPrompt(language) },
      { role: 'user', content: `Extract the location from this query: ${query}` }
    ], {
      tools: [TOOLS.EXTRACT_LOCATION.tool],
      toolChoice: { type: "function", function: { name: TOOLS.EXTRACT_LOCATION.name } }
    });

    let location;
    try {
      location = JSON.parse(locationResponse.toolCallResponse || '{}').location;
    } catch (e) {
      console.error('Error parsing location:', e);
      throw new Error('Could not extract location from query');
    }

    // Get weather data
    const weatherResponse = await createChatCompletion([
      { role: 'system', content: this.config.systemPrompt(language) },
      { role: 'user', content: `Get weather for location: ${location}` }
    ], {
      tools: [TOOLS.GET_WEATHER.tool],
      toolChoice: { type: "function", function: { name: TOOLS.GET_WEATHER.name } }
    });

    let weatherData;
    try {
      weatherData = JSON.parse(weatherResponse.toolCallResponse || '{}');
    } catch (e) {
      console.error('Error parsing weather data:', e);
      throw new Error('Could not get weather data');
    }

    // Format response
    const formattedResponse = await createChatCompletion([
      { role: 'system', content: this.config.systemPrompt(language) },
      { 
        role: 'user', 
        content: `Format this weather data into a natural response in ${language}:\n${JSON.stringify(weatherData, null, 2)}` 
      }
    ]);

    return {
      answer: formattedResponse.content,
      sources: [{
        title: `Weather data for ${location}`,
        url: `https://weather.example.com/${encodeURIComponent(location)}`
      }],
      confidence: 0.95
    };
  }
} 