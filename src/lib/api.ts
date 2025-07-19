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
    
    // Find common components
    const componentSelectors = [
      { selector: 'header, .header, #header', type: 'header', name: 'Header' },
      { selector: 'nav, .nav, .navbar, .navigation', type: 'navigation', name: 'Navigation' },
      { selector: '.hero, .hero-section, .banner', type: 'hero', name: 'Hero Section' },
      { selector: 'main, .main, .content, .main-content', type: 'main-content', name: 'Main Content' },
      { selector: 'footer, .footer, #footer', type: 'footer', name: 'Footer' },
      { selector: 'h1', type: 'heading', name: 'Main Heading' },
      { selector: 'h2, h3', type: 'heading', name: 'Subheading' },
      { selector: 'p', type: 'paragraph', name: 'Paragraph' },
      { selector: 'img', type: 'image', name: 'Image' },
      { selector: 'a', type: 'link', name: 'Link' },
      { selector: 'button, .btn', type: 'button', name: 'Button' },
      { selector: 'section', type: 'section', name: 'Section' },
      { selector: 'article', type: 'article', name: 'Article' },
      { selector: 'aside, .sidebar', type: 'sidebar', name: 'Sidebar' },
      { selector: 'form', type: 'form', name: 'Form' }
    ];

    componentSelectors.forEach(({ selector, type, name }) => {
      const elements = doc.querySelectorAll(selector);
      elements.forEach((element, index) => {
        if (index < 3) { // Limit to first 3 of each type
          const content = element.textContent?.trim().substring(0, 100) || '';
          const attributes: Record<string, any> = {};
          
          // Extract attributes
          for (const attr of element.attributes) {
            attributes[attr.name] = attr.value;
          }

          components.push({
            project_id: projectId,
            component_type: type,
            content: {
              tag: element.tagName.toLowerCase(),
              content,
              styles: {
                display: 'block',
                margin: '0',
                padding: '8px'
              },
              attributes,
              selector: generateCSSSelector(element)
            },
            position: componentId++,
            is_visible: true
          });
        }
      });
    });

  } catch (error) {
    console.error('Error parsing HTML:', error);
  }

  return components.slice(0, 15); // Limit total components
};

const createFallbackComponents = (url: string, projectId: string) => {
  const domain = new URL(url).hostname;
  
  return [
    {
      project_id: projectId,
      component_type: 'header',
      content: {
        tag: 'header',
        content: `Navigation Header - Edit this text`,
        styles: { 
          backgroundColor: '#ffffff', 
          padding: '16px', 
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        },
        attributes: { class: 'header navbar' },
        selector: 'header'
      },
      position: 0,
      is_visible: true
    },
    {
      project_id: projectId,
      component_type: 'hero',
      content: {
        tag: 'section',
        content: `Welcome to ${domain} - Hero Section`,
        styles: { 
          backgroundColor: '#3b82f6', 
          color: '#ffffff',
          padding: '80px 20px', 
          textAlign: 'center',
          fontSize: '48px',
          fontWeight: 'bold'
        },
        attributes: { class: 'hero-section banner' },
        selector: '.hero'
      },
      position: 1,
      is_visible: true
    },
    {
      project_id: projectId,
      component_type: 'navigation',
      content: {
        tag: 'nav',
        content: `Home | About | Services | Contact`,
        styles: { 
          backgroundColor: '#f8fafc', 
          padding: '12px 20px',
          borderBottom: '1px solid #e5e7eb'
        },
        attributes: { class: 'navigation nav' },
        selector: 'nav'
      },
      position: 2,
      is_visible: true
    },
    {
      project_id: projectId,
      component_type: 'paragraph',
      content: {
        tag: 'p',
        content: `This is sample content from ${domain}. Click to edit this paragraph and customize the text, styling, and formatting to match your website's needs.`,
        styles: { 
          fontSize: '16px', 
          lineHeight: '1.8', 
          margin: '24px 0',
          padding: '0 20px',
          color: '#374151'
        },
        attributes: { class: 'content-paragraph' },
        selector: 'p'
      },
      position: 3,
      is_visible: true
    },
    {
      project_id: projectId,
      component_type: 'button',
      content: {
        tag: 'button',
        content: `Click Me - Call to Action`,
        styles: { 
          backgroundColor: '#10b981', 
          color: '#ffffff', 
          padding: '12px 24px',
          border: 'none',
          borderRadius: '6px',
          fontSize: '16px',
          fontWeight: '500',
          cursor: 'pointer'
        },
        attributes: { class: 'cta-button btn' },
        selector: 'button'
      },
      position: 4,
      is_visible: true
    },
    {
      project_id: projectId,
      component_type: 'image',
      content: {
        tag: 'img',
        content: `Image placeholder`,
        styles: { 
          width: '100%',
          maxWidth: '600px',
          height: 'auto',
          borderRadius: '8px',
          margin: '20px 0'
        },
        attributes: { 
          class: 'content-image',
          src: 'https://via.placeholder.com/600x400/3b82f6/ffffff?text=Sample+Image',
          alt: 'Sample website image'
        },
        selector: 'img'
      },
      position: 5,
      is_visible: true
    },
    {
      project_id: projectId,
      component_type: 'footer',
      content: {
        tag: 'footer',
        content: `© 2024 ${domain}. All rights reserved. | Privacy Policy | Terms of Service`,
        styles: { 
          backgroundColor: '#1f2937', 
          color: '#9ca3af', 
          padding: '40px 20px',
          textAlign: 'center',
          fontSize: '14px',
          marginTop: '60px'
        },
        attributes: { class: 'footer site-footer' },
        selector: 'footer'
      },
      position: 6,
      is_visible: true
    }
  ];
};

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
        
        try {
          // Try direct fetch first (will likely fail due to CORS)
          const response = await fetch(projectData.site_url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; AI-Site-Editor/1.0)'
            }
          });
          
          if (response.ok) {
            html = await response.text();
            console.log('Direct fetch successful');
          }
        } catch (fetchError) {
          console.log('Direct fetch failed due to CORS, trying alternative approach');
          
          // Try using a CORS proxy as fallback
          try {
            const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(projectData.site_url)}`;
            const proxyResponse = await fetch(proxyUrl);
            
            if (proxyResponse.ok) {
              const proxyData = await proxyResponse.json();
              html = proxyData.contents;
              console.log('CORS proxy fetch successful');
            }
          } catch (proxyError) {
            console.log('CORS proxy also failed, using URL-based detection');
          }
        }

        // Parse components or create fallback
        let components: any[] = [];
        
        if (html && html.length > 100) {
          console.log('Parsing HTML content, length:', html.length);
          components = parseHtmlToComponents(html, data.id);
          console.log('Parsed components from HTML:', components.length);
        }
        
        // If no components found or no HTML, create fallback components
        if (components.length === 0) {
          console.log('No components parsed, creating fallback components');
          components = createFallbackComponents(projectData.site_url, data.id);
          console.log('Created fallback components:', components.length);
        }
        
        // Detect framework from HTML or URL
        framework = html ? detectFrameworkFromHtml(html) : detectFrameworkFromUrl(projectData.site_url);
        console.log('Detected framework:', framework);

        // Insert components (always create at least fallback ones)
        if (components.length > 0) {
          console.log('Inserting components into database:', components);
          const { error: componentsError } = await supabase
            .from('components')
            .insert(components);

          if (componentsError) {
            console.error('Error creating components:', componentsError);
            console.error('Components that failed to insert:', components);
          } else {
            console.log(`✅ Created ${components.length} components successfully`);
          }
        } else {
          console.error('❌ No components to insert - this should not happen');
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