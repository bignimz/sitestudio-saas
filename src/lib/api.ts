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