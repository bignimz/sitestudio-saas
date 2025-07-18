import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ParseRequest {
  url: string;
}

interface ParsedComponent {
  component_type: string;
  content: Record<string, any>;
  position: number;
  is_visible: boolean;
}

interface ParsedSiteData {
  title: string;
  description?: string;
  components: ParsedComponent[];
}

async function parseSite(url: string): Promise<ParsedSiteData> {
  try {
    // Fetch the HTML content
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch site: ${response.status}`);
    }
    
    const html = await response.text();
    
    // Basic HTML parsing using regex (in production, use a proper HTML parser)
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    
    const title = titleMatch ? titleMatch[1].trim() : 'Untitled Site';
    const description = descMatch ? descMatch[1].trim() : undefined;
    
    const components: ParsedComponent[] = [];
    let position = 0;
    
    // Extract header/nav
    const navMatch = html.match(/<nav[^>]*>([\s\S]*?)<\/nav>/i) || 
                    html.match(/<header[^>]*>([\s\S]*?)<\/header>/i);
    if (navMatch) {
      const navContent = navMatch[1];
      const links = extractLinks(navContent);
      
      components.push({
        component_type: 'navbar',
        content: {
          logoText: title,
          links: links,
          backgroundColor: '#ffffff',
          textColor: '#000000'
        },
        position: position++,
        is_visible: true
      });
    }
    
    // Extract hero section
    const heroSelectors = [
      /<section[^>]*class=["'][^"']*hero[^"']*["'][^>]*>([\s\S]*?)<\/section>/i,
      /<div[^>]*class=["'][^"']*hero[^"']*["'][^>]*>([\s\S]*?)<\/div>/i,
      /<div[^>]*class=["'][^"']*banner[^"']*["'][^>]*>([\s\S]*?)<\/div>/i
    ];
    
    for (const regex of heroSelectors) {
      const heroMatch = html.match(regex);
      if (heroMatch) {
        const heroContent = heroMatch[1];
        const heroTitle = extractTextContent(heroContent, 'h1') || extractTextContent(heroContent, 'h2') || title;
        const heroSubtitle = extractTextContent(heroContent, 'p');
        const ctaLink = extractLinks(heroContent)[0];
        
        components.push({
          component_type: 'hero',
          content: {
            title: heroTitle,
            subtitle: heroSubtitle,
            backgroundColor: '#f8fafc',
            ctaText: ctaLink?.text || 'Learn More',
            ctaUrl: ctaLink?.url || '#'
          },
          position: position++,
          is_visible: true
        });
        break;
      }
    }
    
    // Extract main content sections
    const sectionMatches = html.matchAll(/<section[^>]*>([\s\S]*?)<\/section>/gi);
    for (const match of sectionMatches) {
      const sectionContent = match[1];
      const sectionTitle = extractTextContent(sectionContent, 'h2') || extractTextContent(sectionContent, 'h3');
      const sectionText = extractTextContent(sectionContent, 'p');
      
      if (sectionTitle || sectionText) {
        components.push({
          component_type: 'section',
          content: {
            title: sectionTitle,
            text: sectionText,
            backgroundColor: '#ffffff'
          },
          position: position++,
          is_visible: true
        });
      }
    }
    
    // Extract images
    const imgMatches = html.matchAll(/<img[^>]*src=["']([^"']+)["'][^>]*alt=["']([^"']*)["'][^>]*>/gi);
    for (const match of imgMatches) {
      const src = match[1];
      const alt = match[2];
      
      // Skip small icons and logos
      if (!src.includes('icon') && !src.includes('logo') && src.length > 10) {
        components.push({
          component_type: 'image',
          content: {
            url: src.startsWith('http') ? src : new URL(src, url).href,
            alt: alt || 'Image'
          },
          position: position++,
          is_visible: true
        });
      }
    }
    
    // Extract footer
    const footerMatch = html.match(/<footer[^>]*>([\s\S]*?)<\/footer>/i);
    if (footerMatch) {
      const footerContent = footerMatch[1];
      const links = extractLinks(footerContent);
      const copyrightMatch = footerContent.match(/©[^<]+/);
      
      components.push({
        component_type: 'footer',
        content: {
          copyright: copyrightMatch ? copyrightMatch[0] : `© ${new Date().getFullYear()} ${title}`,
          links: links,
          backgroundColor: '#f8fafc',
          textColor: '#64748b'
        },
        position: position++,
        is_visible: true
      });
    }
    
    return {
      title,
      description,
      components
    };
    
  } catch (error) {
    console.error('Error parsing site:', error);
    throw new Error(`Failed to parse site: ${error.message}`);
  }
}

function extractTextContent(html: string, tag: string): string | undefined {
  const regex = new RegExp(`<${tag}[^>]*>([^<]+)<\/${tag}>`, 'i');
  const match = html.match(regex);
  return match ? match[1].trim() : undefined;
}

function extractLinks(html: string): Array<{ text: string; url: string }> {
  const links: Array<{ text: string; url: string }> = [];
  const linkMatches = html.matchAll(/<a[^>]*href=["']([^"']+)["'][^>]*>([^<]+)<\/a>/gi);
  
  for (const match of linkMatches) {
    const url = match[1];
    const text = match[2].trim();
    
    if (text && text.length > 0 && !text.includes('<')) {
      links.push({ text, url });
    }
  }
  
  return links;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { url }: ParseRequest = await req.json()
    
    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
    // Validate URL
    try {
      new URL(url);
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid URL provided' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
    const parsedData = await parseSite(url);
    
    return new Response(
      JSON.stringify(parsedData),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Parse error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})