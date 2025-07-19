import { supabase } from './supabase';
// Temporary inline types
interface User {
  id: string;
  email: string;
  stripe_customer_id?: string;
  created_at: string;
  updated_at: string;
}

interface Project {
  id: string;
  user_id: string;
  site_url?: string;
  title: string;
  description?: string;
  is_published: boolean;
  published_url?: string;
  created_at: string;
  updated_at: string;
}

interface Component {
  id: string;
  project_id: string;
  component_type: string;
  content: Record<string, any>;
  position: number;
  styles?: Record<string, any>;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

interface Subscription {
  id: string;
  user_id: string;
  stripe_subscription_id?: string;
  status: string;
  plan_type: string;
  current_period_start?: string;
  current_period_end?: string;
  created_at: string;
  updated_at: string;
}

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ParsedSiteData {
  title: string;
  description?: string;
  components: Omit<Component, 'id' | 'project_id' | 'created_at' | 'updated_at'>[];
}

interface AISuggestionData {
  type: 'layout' | 'content' | 'style' | 'ux';
  description: string;
  component_id?: string;
  changes: Record<string, any>;
  confidence: number;
}

// Helper function to handle API responses
const handleResponse = <T>(data: T | null, error: any): ApiResponse<T> => {
  if (error) {
    console.error('API Error:', error);
    return { error: error.message };
  }
  return { data: data || undefined };
};

// Helper functions for website parsing
const parseHtmlToComponents = (html: string, projectId: string) => {
  const components: any[] = [];
  let componentId = 1;

  try {
    // Create a temporary DOM element to parse HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Enhanced component selectors with more specific targeting
    const componentSelectors = [
      { selector: 'header, [role="banner"], .header, #header', type: 'header', name: 'Header' },
      { selector: 'nav, [role="navigation"], .nav, .navbar, .navigation', type: 'navigation', name: 'Navigation' },
      { selector: '.hero, .hero-section, .banner, .jumbotron, .hero-banner', type: 'hero', name: 'Hero Section' },
      { selector: 'main, [role="main"], .main, .content, .main-content', type: 'main-content', name: 'Main Content' },
      { selector: 'footer, [role="contentinfo"], .footer, #footer', type: 'footer', name: 'Footer' },
      { selector: 'h1', type: 'heading', name: 'Main Heading' },
      { selector: 'h2, h3, h4', type: 'heading', name: 'Heading' },
      { selector: 'p:not(:empty)', type: 'paragraph', name: 'Paragraph' },
      { selector: 'img[src]', type: 'image', name: 'Image' },
      { selector: 'a[href]:not(:empty)', type: 'link', name: 'Link' },
      { selector: 'button, .btn, input[type="button"], input[type="submit"]', type: 'button', name: 'Button' },
      { selector: 'section', type: 'section', name: 'Section' },
      { selector: 'article', type: 'article', name: 'Article' },
      { selector: 'aside, .sidebar', type: 'sidebar', name: 'Sidebar' },
      { selector: 'form', type: 'form', name: 'Form' },
      { selector: '.card, .panel, .widget', type: 'card', name: 'Card Component' },
      { selector: '.container, .wrapper, .row', type: 'container', name: 'Container' }
    ];

    componentSelectors.forEach(({ selector, type, name }) => {
      const elements = doc.querySelectorAll(selector);
      elements.forEach((element, index) => {
        if (index < 5) { // Increased limit for more components
          const textContent = element.textContent?.trim() || '';
          
          // Skip empty or very small elements
          if (textContent.length < 3 && type !== 'image' && type !== 'container') {
            return;
          }

          const attributes: Record<string, any> = {};
          
          // Extract all attributes
          for (const attr of element.attributes) {
            attributes[attr.name] = attr.value;
          }

          // Extract computed styles from style attribute
          const inlineStyles = extractInlineStyles(element.getAttribute('style') || '');
          
          // Get element's actual position in the document
          const elementIndex = Array.from(element.parentNode?.children || []).indexOf(element);

          components.push({
            project_id: projectId,
            component_type: type,
            content: {
              tag: element.tagName.toLowerCase(),
              content: textContent.substring(0, 200), // More content for better context
              originalHtml: element.outerHTML.substring(0, 500), // Store original HTML for reference
              styles: {
                ...inlineStyles,
                // Add some basic styling for editing
                minHeight: type === 'image' ? 'auto' : '20px',
                display: inlineStyles.display || 'block'
              },
              attributes,
              selector: generateAdvancedSelector(element),
              xpath: generateXPath(element),
              elementIndex,
              parentTag: element.parentElement?.tagName.toLowerCase() || 'body'
            },
            position: componentId++,
            is_visible: true
          });
        }
      });
    });

    console.log('Parsed components by type:', components.reduce((acc, comp) => {
      acc[comp.component_type] = (acc[comp.component_type] || 0) + 1;
      return acc;
    }, {}));

  } catch (error) {
    console.error('Error parsing HTML:', error);
  }

  return components.slice(0, 30); // Allow more components
};

const extractComponentsViaProxy = async (url: string, projectId: string) => {
  try {
    // Try a different CORS proxy with better HTML extraction
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    
    if (response.ok) {
      const html = await response.text();
      console.log('Alternative proxy fetch successful, HTML length:', html.length);
      return parseHtmlToComponents(html, projectId);
    }
  } catch (error) {
    console.log('Alternative proxy failed:', error);
  }
  
  return [];
};

const generateAdvancedSelector = (element: Element): string => {
  // Generate a more specific CSS selector
  if (element.id) {
    return `#${element.id}`;
  }
  
  if (element.className) {
    const classes = element.className.split(' ').filter(c => c.trim());
    if (classes.length > 0) {
      return `.${classes[0]}`;
    }
  }
  
  // Use tag + nth-child for better specificity
  const parent = element.parentElement;
  if (parent) {
    const siblings = Array.from(parent.children);
    const index = siblings.indexOf(element) + 1;
    return `${element.tagName.toLowerCase()}:nth-child(${index})`;
  }
  
  return element.tagName.toLowerCase();
};

const generateXPath = (element: Element): string => {
  // Generate XPath for more precise element targeting
  if (element.id) {
    return `//*[@id="${element.id}"]`;
  }
  
  const path = [];
  let current = element;
  
  while (current && current.nodeType === Node.ELEMENT_NODE) {
    let selector = current.tagName.toLowerCase();
    
    if (current.id) {
      selector += `[@id="${current.id}"]`;
      path.unshift(selector);
      break;
    } else {
      const siblings = Array.from(current.parentNode?.children || []);
      const index = siblings.indexOf(current) + 1;
      selector += `[${index}]`;
    }
    
    path.unshift(selector);
    current = current.parentElement as Element;
  }
  
  return '/' + path.join('/');
};

const extractInlineStyles = (styleString: string): Record<string, any> => {
  const styles: Record<string, any> = {};
  
  if (!styleString) return styles;
  
  const rules = styleString.split(';');
  rules.forEach(rule => {
    const [property, value] = rule.split(':').map(s => s.trim());
    if (property && value) {
      styles[property] = value;
    }
  });
  
  return styles;
};

const tryMultipleExtractionMethods = async (url: string): Promise<string> => {
  const methods = [
    // Method 1: Direct fetch (will likely fail due to CORS)
    async () => {
      console.log('Trying direct fetch...');
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; AI-Site-Editor/1.0)'
        }
      });
      if (response.ok) {
        const html = await response.text();
        console.log('✅ Direct fetch successful, HTML length:', html.length);
        return html;
      }
      throw new Error('Direct fetch failed');
    },

    // Method 2: AllOrigins proxy
    async () => {
      console.log('Trying AllOrigins proxy...');
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      if (response.ok) {
        const data = await response.json();
        console.log('✅ AllOrigins proxy successful, HTML length:', data.contents?.length || 0);
        return data.contents || '';
      }
      throw new Error('AllOrigins proxy failed');
    },

    // Method 3: CORS proxy
    async () => {
      console.log('Trying CORS proxy...');
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      if (response.ok) {
        const html = await response.text();
        console.log('✅ CORS proxy successful, HTML length:', html.length);
        return html;
      }
      throw new Error('CORS proxy failed');
    },

    // Method 4: Another proxy service
    async () => {
      console.log('Trying proxy-cors.isomorphic-git.org...');
      const proxyUrl = `https://proxy-cors.isomorphic-git.org/${url}`;
      const response = await fetch(proxyUrl);
      if (response.ok) {
        const html = await response.text();
        console.log('✅ Isomorphic proxy successful, HTML length:', html.length);
        return html;
      }
      throw new Error('Isomorphic proxy failed');
    }
  ];

  // Try each method in sequence
  for (const method of methods) {
    try {
      const result = await method();
      if (result && result.length > 100) {
        return result;
      }
    } catch (error) {
      console.log('Method failed:', error.message);
      continue;
    }
  }

  console.log('❌ All extraction methods failed');
  return '';
};

// Normalize component types to valid database values
const normalizeComponentType = (type: string): string => {
  // Convert any component type to a simple text format that won't violate constraints
  const normalized = type.toLowerCase()
    .replace(/[^a-z0-9]/g, '_')  // Replace non-alphanumeric with underscore
    .replace(/_+/g, '_')         // Replace multiple underscores with single
    .replace(/^_|_$/g, '');      // Remove leading/trailing underscores
  
  // Ensure it's not empty
  return normalized || 'element';
};

// Removed fake component creation - we only work with real website components

const detectFrameworkFromHtml = (html: string) => {
  const indicators: string[] = [];
  let framework = 'HTML/CSS/JS';
  let confidence = 50;

  // React detection
  if (html.includes('react') || html.includes('React')) {
    indicators.push('React references found');
    confidence += 30;
  }
  if (html.includes('data-reactroot') || html.includes('id="root"')) {
    indicators.push('React root element found');
    confidence += 40;
    framework = 'React';
  }
  if (html.includes('_next') || html.includes('__NEXT_DATA__')) {
    indicators.push('Next.js markers found');
    confidence += 60;
    framework = 'Next.js';
  }

  // Vue detection
  if (html.includes('vue') || html.includes('Vue')) {
    indicators.push('Vue references found');
    confidence += 30;
  }
  if (html.includes('v-if') || html.includes('v-for') || html.includes('v-model')) {
    indicators.push('Vue directives found');
    confidence += 50;
    framework = 'Vue';
  }

  // Angular detection
  if (html.includes('angular') || html.includes('ng-')) {
    indicators.push('Angular markers found');
    confidence += 50;
    framework = 'Angular';
  }

  // WordPress detection
  if (html.includes('wp-content') || html.includes('wordpress')) {
    indicators.push('WordPress markers found');
    confidence += 60;
    framework = 'WordPress';
  }

  // Other frameworks
  if (html.includes('bootstrap')) {
    indicators.push('Bootstrap CSS framework');
    confidence += 20;
  }
  if (html.includes('jquery') || html.includes('jQuery')) {
    indicators.push('jQuery library found');
    confidence += 20;
  }

  return {
    framework,
    confidence: Math.min(confidence, 100),
    indicators
  };
};

const detectFrameworkFromUrl = (url: string) => {
  const domain = new URL(url).hostname;
  let framework = 'HTML/CSS/JS';
  let confidence = 30;
  const indicators = ['URL-based detection'];

  // Common patterns
  if (domain.includes('github.io') || domain.includes('netlify') || domain.includes('vercel')) {
    indicators.push('Static hosting detected');
    confidence += 20;
  }
  
  if (domain.includes('wordpress') || domain.includes('wp.com')) {
    framework = 'WordPress';
    confidence += 50;
    indicators.push('WordPress hosting detected');
  }

  return { framework, confidence, indicators };
};

const generateCSSSelector = (element: Element): string => {
  if (element.id) {
    return `#${element.id}`;
  }
  
  if (element.className) {
    const classes = element.className.split(' ').filter(c => c.trim());
    if (classes.length > 0) {
      return `.${classes[0]}`;
    }
  }
  
  return element.tagName.toLowerCase();
};

// User API
export const userApi = {
  async getProfile(): Promise<ApiResponse<User>> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .single();
    
    return handleResponse(data, error);
  },

  async updateProfile(updates: Partial<User>): Promise<ApiResponse<User>> {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .select()
      .single();
    
    return handleResponse(data, error);
  }
};

// Projects API
export const projectsApi = {
  // New methods matching Dashboard expectations
  async getAll(): Promise<Project[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user?.id) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  },

  async create(projectData: { site_url: string; title: string; description: string }): Promise<Project> {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      // Create the project first
      const { data, error } = await supabase
        .from('projects')
        .insert({
          user_id: user.user.id,
          site_url: projectData.site_url,
          title: projectData.title,
          description: projectData.description,
          is_published: false
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // Parse the website using a client-side approach
      try {
        console.log('Starting to parse website:', projectData.site_url);
        
        // Fetch the website HTML using a CORS proxy or direct fetch
        let html = '';
        let framework = { framework: 'HTML/CSS/JS', confidence: 50, indicators: ['Default detection'] };
        
        // Try Supabase Edge Function first (bypasses CORS), then fallback methods
        try {
          console.log('🔄 Attempting to parse website via Supabase Edge Function...');
          const { data: parseResult, error: parseError } = await supabase.functions.invoke('parse-website', {
            body: { url: projectData.site_url }
          });

          if (parseError) {
            console.log('Supabase function failed:', parseError);
            throw parseError;
          }

          if (parseResult && parseResult.html) {
            html = parseResult.html;
            console.log('✅ Supabase function successful, HTML length:', html.length);
            
            // Use framework detection from edge function if available
            if (parseResult.framework) {
              framework = parseResult.framework;
              console.log('Framework detected by edge function:', framework);
            }
          } else {
            throw new Error('No HTML returned from edge function');
          }
        } catch (edgeFunctionError) {
          console.log('Edge function failed, trying direct methods:', edgeFunctionError);
          html = await tryMultipleExtractionMethods(projectData.site_url);
        }

        // Parse real website components
        let components: any[] = [];
        
        if (html && html.length > 100) {
          console.log('Parsing HTML content, length:', html.length);
          components = parseHtmlToComponents(html, data.id);
          console.log('Parsed components from HTML:', components.length);
          
          // Normalize component types to valid database values
          components = components.map(comp => ({
            ...comp,
            component_type: normalizeComponentType(comp.component_type)
          }));
        } else {
          // If no HTML, try to extract components using a different approach
          console.log('No HTML content, attempting alternative extraction');
          components = await extractComponentsViaProxy(projectData.site_url, data.id);
          
          // Normalize component types for extracted components too
          components = components.map(comp => ({
            ...comp,
            component_type: normalizeComponentType(comp.component_type)
          }));
        }
        
        if (components.length === 0) {
          console.warn('⚠️ Could not extract real components due to CORS restrictions');
          console.log('User will need to use URL-based editing or provide HTML content manually');
          // Don't create fake components - let the user work with the live site via iframe
        }
        
        // Detect framework from HTML or URL
        framework = html ? detectFrameworkFromHtml(html) : detectFrameworkFromUrl(projectData.site_url);
        console.log('Detected framework:', framework);

        // Insert components - ensure we always have something to work with
        if (components && components.length > 0) {
          console.log('Inserting components into database. Count:', components.length);
          
          // Validate components before insertion
          const validComponents = components.filter(comp => 
            comp && 
            comp.project_id && 
            comp.component_type && 
            comp.content
          );

          if (validComponents.length > 0) {
            const { error: componentsError } = await supabase
              .from('components')
              .insert(validComponents);

            if (componentsError) {
              console.error('Error creating components:', componentsError);
              console.error('Failed components:', validComponents);
            } else {
              console.log(`✅ Successfully created ${validComponents.length} components`);
            }
          } else {
            console.error('❌ No valid components after filtering');
          }
        } else {
          console.error('❌ No components array or empty array');
        }

        // Update project with framework detection
        await supabase
          .from('projects')
          .update({ framework })
          .eq('id', data.id);

      } catch (error) {
        console.error('Error processing website:', error);
        // Continue without failing project creation
      }

      return data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create project');
    }
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  },

  // Original methods for backward compatibility
  async getProjects(page = 1, limit = 10): Promise<ApiResponse<PaginatedResponse<Project>>> {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('projects')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      return handleResponse(null, error);
    }

    const result: PaginatedResponse<Project> = {
      data: data || [],
      count: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    };

    return { data: result };
  },

  async getProject(id: string): Promise<ApiResponse<Project>> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();
    
    return handleResponse(data, error);
  },

  async createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Project>> {
    const { data, error } = await supabase
      .from('projects')
      .insert(project)
      .select()
      .single();
    
    return handleResponse(data, error);
  },

  async createFromUrl(siteUrl: string): Promise<ApiResponse<Project>> {
    try {
      // First, parse the site
      const parseResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sites-parse`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({ url: siteUrl })
      });

      if (!parseResponse.ok) {
        throw new Error('Failed to parse site');
      }

      const parsedData: ParsedSiteData = await parseResponse.json();

      // Create the project
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user?.id) {
        return { error: 'User not authenticated' };
      }

      const projectData = {
        user_id: user.user.id,
        title: parsedData.title,
        description: parsedData.description,
        site_url: siteUrl,
        is_published: false
      };

      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert(projectData)
        .select()
        .single();

      if (projectError || !project) {
        return handleResponse(null, projectError);
      }

      // Create components
      const components = parsedData.components.map((comp, index) => ({
        ...comp,
        project_id: project.id,
        position: index
      }));

      if (components.length > 0) {
        const { error: componentsError } = await supabase
          .from('components')
          .insert(components);

        if (componentsError) {
          console.error('Error creating components:', componentsError);
        }
      }

      return { data: project };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },

  async updateProject(id: string, updates: Partial<Project>): Promise<ApiResponse<Project>> {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    return handleResponse(data, error);
  },

  async deleteProject(id: string): Promise<ApiResponse<boolean>> {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);
    
    if (error) {
      return handleResponse(null, error);
    }
    return { data: true };
  }
};

// Components API
export const componentsApi = {
  async getComponents(projectId: string): Promise<ApiResponse<Component[]>> {
    const { data, error } = await supabase
      .from('components')
      .select('*')
      .eq('project_id', projectId)
      .order('position', { ascending: true });
    
    return handleResponse(data, error);
  },

  async createComponent(component: Omit<Component, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Component>> {
    const { data, error } = await supabase
      .from('components')
      .insert(component)
      .select()
      .single();
    
    return handleResponse(data, error);
  },

  async updateComponent(id: string, updates: Partial<Component>): Promise<ApiResponse<Component>> {
    const { data, error } = await supabase
      .from('components')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    return handleResponse(data, error);
  },

  async deleteComponent(id: string): Promise<ApiResponse<boolean>> {
    const { error } = await supabase
      .from('components')
      .delete()
      .eq('id', id);
    
    if (error) {
      return handleResponse(null, error);
    }
    return { data: true };
  },

  async reorderComponents(components: Array<{ id: string; position: number }>): Promise<ApiResponse<boolean>> {
    try {
      const updates = components.map(({ id, position }) =>
        supabase
          .from('components')
          .update({ position })
          .eq('id', id)
      );

      await Promise.all(updates);
      return { data: true };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
};

// Subscriptions API
export const subscriptionsApi = {
  async getSubscription(): Promise<ApiResponse<Subscription>> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    return handleResponse(data, error);
  },

  async createSubscription(subscription: Omit<Subscription, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Subscription>> {
    const { data, error } = await supabase
      .from('subscriptions')
      .insert(subscription)
      .select()
      .single();
    
    return handleResponse(data, error);
  },

  async updateSubscription(id: string, updates: Partial<Subscription>): Promise<ApiResponse<Subscription>> {
    const { data, error } = await supabase
      .from('subscriptions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    return handleResponse(data, error);
  }
};

// AI Suggestions API
export const aiApi = {
  async getSuggestions(projectId: string): Promise<ApiResponse<any[]>> {
    const { data, error } = await supabase
      .from('ai_suggestions')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    
    return handleResponse(data, error);
  },

  async generateSuggestions(projectId: string): Promise<ApiResponse<AISuggestionData[]>> {
    try {
      // Get project components
      const componentsResponse = await componentsApi.getComponents(projectId);
      if (componentsResponse.error || !componentsResponse.data) {
        return { error: 'Failed to get project components' };
      }

      // Call AI API
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-suggestions`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({ 
          projectId,
          components: componentsResponse.data 
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate suggestions');
      }

      const suggestions: AISuggestionData[] = await response.json();

      // Save suggestions to database
      await supabase
        .from('ai_suggestions')
        .insert({
          project_id: projectId,
          suggestions: suggestions
        });

      return { data: suggestions };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },

  async applySuggestion(projectId: string, suggestionId: string, suggestion: AISuggestionData): Promise<ApiResponse<boolean>> {
    try {
      // Apply the suggestion based on its type
      if (suggestion.component_id) {
        await componentsApi.updateComponent(suggestion.component_id, {
          content: suggestion.changes.content || undefined,
          styles: suggestion.changes.styles || undefined
        });
      }

      // Update applied suggestions
      const { data: latestSuggestion } = await supabase
        .from('ai_suggestions')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (latestSuggestion) {
        const appliedSuggestions = latestSuggestion.applied_suggestions || [];
        appliedSuggestions.push(suggestionId);

        await supabase
          .from('ai_suggestions')
          .update({ applied_suggestions: appliedSuggestions })
          .eq('id', latestSuggestion.id);
      }

      return { data: true };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
};

// Auth helper functions
export const authApi = {
  // New methods matching Dashboard expectations
  async getCurrentUser(): Promise<any> {
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data.user;
  },

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw new Error(error.message);
    }
  },

  // Original methods for backward compatibility
  async signUp(email: string, password: string): Promise<ApiResponse<any>> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });
    
    return handleResponse(data, error);
  },

  async signIn(email: string, password: string): Promise<ApiResponse<any>> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    return handleResponse(data, error);
  },

  async signOut(): Promise<ApiResponse<boolean>> {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return handleResponse(null, error);
    }
    return { data: true };
  },

  async getUser(): Promise<ApiResponse<any>> {
    const { data, error } = await supabase.auth.getUser();
    
    return handleResponse(data, error);
  }
};