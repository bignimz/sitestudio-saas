import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Component {
  id: string;
  component_type: string;
  content: Record<string, any>;
  position: number;
  styles?: Record<string, any>;
  is_visible: boolean;
}

interface SuggestionRequest {
  projectId: string;
  components: Component[];
}

interface AISuggestionData {
  type: 'layout' | 'content' | 'style' | 'ux';
  description: string;
  component_id?: string;
  changes: Record<string, any>;
  confidence: number;
}

async function generateAISuggestions(components: Component[]): Promise<AISuggestionData[]> {
  const suggestions: AISuggestionData[] = [];
  
  // OpenAI API call would go here, but for now we'll use rule-based suggestions
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (openaiApiKey) {
    try {
      const prompt = createPrompt(components);
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are a UX/UI expert. Analyze the provided website components and suggest improvements for better user experience, conversion, and design. Return suggestions as a JSON array.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1500
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        const aiSuggestions = JSON.parse(data.choices[0].message.content);
        return aiSuggestions;
      }
    } catch (error) {
      console.error('OpenAI API error:', error);
    }
  }
  
  // Fallback to rule-based suggestions
  return generateRuleBasedSuggestions(components);
}

function createPrompt(components: Component[]): string {
  const componentsSummary = components.map(comp => ({
    type: comp.component_type,
    content: comp.content,
    position: comp.position
  }));
  
  return `
Analyze this website structure and provide UX/UI improvement suggestions:

Components:
${JSON.stringify(componentsSummary, null, 2)}

Please provide suggestions in the following JSON format:
[
  {
    "type": "layout|content|style|ux",
    "description": "Clear description of the suggestion",
    "component_id": "optional component ID if specific to a component",
    "changes": {
      "content": { /* suggested content changes */ },
      "styles": { /* suggested style changes */ }
    },
    "confidence": 0.8
  }
]

Focus on:
1. Layout improvements (hero above fold, CTA placement)
2. Content optimization (headlines, copy clarity)
3. Visual hierarchy and spacing
4. Conversion optimization
5. Mobile responsiveness considerations
`;
}

function generateRuleBasedSuggestions(components: Component[]): AISuggestionData[] {
  const suggestions: AISuggestionData[] = [];
  
  // Check for hero section positioning
  const heroComponent = components.find(c => c.component_type === 'hero');
  if (heroComponent && heroComponent.position > 1) {
    suggestions.push({
      type: 'layout',
      description: 'Move hero section to the top of the page for better first impression',
      component_id: heroComponent.id,
      changes: {
        position: 0
      },
      confidence: 0.9
    });
  }
  
  // Check for missing CTA in hero
  if (heroComponent && (!heroComponent.content.ctaText || !heroComponent.content.ctaUrl)) {
    suggestions.push({
      type: 'content',
      description: 'Add a clear call-to-action button to your hero section',
      component_id: heroComponent.id,
      changes: {
        content: {
          ...heroComponent.content,
          ctaText: 'Get Started',
          ctaUrl: '#signup'
        }
      },
      confidence: 0.85
    });
  }
  
  // Check for navbar positioning
  const navbarComponent = components.find(c => c.component_type === 'navbar');
  if (navbarComponent && navbarComponent.position > 0) {
    suggestions.push({
      type: 'layout',
      description: 'Move navigation to the top for better usability',
      component_id: navbarComponent.id,
      changes: {
        position: 0
      },
      confidence: 0.95
    });
  }
  
  // Suggest better contrast for CTAs
  const ctaComponents = components.filter(c => c.component_type === 'cta');
  ctaComponents.forEach(cta => {
    if (!cta.content.backgroundColor || cta.content.backgroundColor === '#ffffff') {
      suggestions.push({
        type: 'style',
        description: 'Use a more prominent color for your call-to-action button',
        component_id: cta.id,
        changes: {
          content: {
            ...cta.content,
            backgroundColor: '#3b82f6',
            textColor: '#ffffff'
          }
        },
        confidence: 0.8
      });
    }
  });
  
  // Check for image alt texts
  const imageComponents = components.filter(c => c.component_type === 'image');
  imageComponents.forEach(img => {
    if (!img.content.alt || img.content.alt.length < 5) {
      suggestions.push({
        type: 'ux',
        description: 'Add descriptive alt text for better accessibility',
        component_id: img.id,
        changes: {
          content: {
            ...img.content,
            alt: 'Descriptive alt text needed'
          }
        },
        confidence: 0.7
      });
    }
  });
  
  // Suggest footer positioning
  const footerComponent = components.find(c => c.component_type === 'footer');
  if (footerComponent && footerComponent.position < components.length - 1) {
    suggestions.push({
      type: 'layout',
      description: 'Move footer to the bottom of the page',
      component_id: footerComponent.id,
      changes: {
        position: components.length - 1
      },
      confidence: 0.9
    });
  }
  
  // General layout suggestions
  if (components.length > 5) {
    suggestions.push({
      type: 'layout',
      description: 'Consider adding more whitespace between sections for better readability',
      changes: {
        styles: {
          marginBottom: '4rem'
        }
      },
      confidence: 0.6
    });
  }
  
  // Content length suggestions
  const textComponents = components.filter(c => c.component_type === 'text' || c.component_type === 'section');
  textComponents.forEach(comp => {
    if (comp.content.text && comp.content.text.length > 200) {
      suggestions.push({
        type: 'content',
        description: 'Consider breaking up long text blocks for better readability',
        component_id: comp.id,
        changes: {
          content: {
            ...comp.content,
            text: comp.content.text.substring(0, 150) + '...'
          }
        },
        confidence: 0.65
      });
    }
  });
  
  return suggestions;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { projectId, components }: SuggestionRequest = await req.json()
    
    if (!projectId || !components) {
      return new Response(
        JSON.stringify({ error: 'Project ID and components are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
    const suggestions = await generateAISuggestions(components);
    
    return new Response(
      JSON.stringify(suggestions),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('AI suggestions error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})