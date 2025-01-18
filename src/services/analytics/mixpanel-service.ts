import mixpanel from 'mixpanel-browser';
import { ENABLE_ANALYTICS, MIXPANEL_TOKEN } from '../../config/api-config';

export class MixpanelService {
  constructor() {
    if (ENABLE_ANALYTICS) {
      mixpanel.init(MIXPANEL_TOKEN, {
        debug: process.env.NODE_ENV === 'development',
        persistence: 'localStorage'
      });
      console.log('Mixpanel initialized successfully');
    }
  }

  trackToolUsage(toolName: string, metadata: Record<string, any> = {}) {
    if (!ENABLE_ANALYTICS) return;
    
    mixpanel.track('Tool Used', {
      tool_name: toolName,
      timestamp: new Date().toISOString(),
      ...metadata
    });
  }

  trackAgentExecution(agentName: string, metadata: Record<string, any> = {}) {
    if (!ENABLE_ANALYTICS) return;
    
    mixpanel.track('Agent Executed', {
      agent_name: agentName,
      timestamp: new Date().toISOString(),
      ...metadata
    });
  }

  trackLLMInteraction(type: 'completion' | 'search' | 'planning', metadata: Record<string, any> = {}) {
    if (!ENABLE_ANALYTICS) return;
    
    mixpanel.track('LLM Interaction', {
      interaction_type: type,
      timestamp: new Date().toISOString(),
      ...metadata
    });
  }

  trackError(error: Error, context: Record<string, any> = {}) {
    if (!ENABLE_ANALYTICS) return;
    
    mixpanel.track('Error', {
      error_name: error.name,
      error_message: error.message,
      error_stack: error.stack,
      timestamp: new Date().toISOString(),
      ...context
    });
  }

  identifyUser(userId: string, traits: Record<string, any> = {}) {
    if (!ENABLE_ANALYTICS) return;
    
    mixpanel.identify(userId);
    if (Object.keys(traits).length > 0) {
      mixpanel.people.set(traits);
    }
  }

  trackCustomEvent(eventName: string, properties: Record<string, any> = {}) {
    if (!ENABLE_ANALYTICS) return;
    
    mixpanel.track(eventName, {
      timestamp: new Date().toISOString(),
      ...properties
    });
  }
} 