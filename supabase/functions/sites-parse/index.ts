import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ParsedComponent {
  id: string;
  type: string;
  tag: string;
  content?: string;
  styles: Record<string, any>;
  attributes: Record<string, any>;
  children: ParsedComponent[];
  selector: string;
  position: { x: number; y: number; width: number; height: number };
}

interface FrameworkDetection {
  framework: string;
  version?: string;
  confidence: number;
  indicators: string[];
}

interface ParsedSiteData {
  url: string;
  title: string;
  description: string;
  framework: FrameworkDetection;
  html: string;
  css: string[];
  js: string[];
  components: ParsedComponent[];
  meta: {
    charset: string;
    viewport: string;
    og: Record<string, string>;
  };
}

function detectFramework(html: string, scripts: string[]): FrameworkDetection {
  const indicators: string[] = [];
  let framework = 'HTML/CSS/JS';
  let confidence = 0.3;
  let version: string | undefined;

  // React detection
  if (html.includes('react') || html.includes('_react') || scripts.some(s => s.includes('react'))) {
    framework = 'React';
    confidence = 0.8;
    indicators.push('React library detected');
    
    // Try to detect version
    const reactVersionMatch = html.match(/react[\"']?[:\s]*[\"']?(\d+\.\d+\.\d+)/i);
    if (reactVersionMatch) {
      version = reactVersionMatch[1];
      confidence = 0.9;
    }
  }
  
  // Next.js detection
  if (html.includes('__NEXT_DATA__') || html.includes('_next/static')) {
    framework = 'Next.js';
    confidence = 0.95;
    indicators.push('Next.js framework detected');
  }
  
  // Vue detection
  if (html.includes('vue') || html.includes('Vue') || scripts.some(s => s.includes('vue'))) {
    framework = 'Vue.js';
    confidence = 0.8;
    indicators.push('Vue.js library detected');
  }
  
  // Nuxt detection
  if (html.includes('__NUXT__') || html.includes('_nuxt/')) {
    framework = 'Nuxt.js';
    confidence = 0.95;
    indicators.push('Nuxt.js framework detected');
  }
  
  // Angular detection
  if (html.includes('ng-') || html.includes('angular') || scripts.some(s => s.includes('angular'))) {
    framework = 'Angular';
    confidence = 0.8;
    indicators.push('Angular framework detected');
  }
  
  // Svelte detection
  if (html.includes('svelte') || scripts.some(s => s.includes('svelte'))) {
    framework = 'Svelte';
    confidence = 0.8;
    indicators.push('Svelte framework detected');
  }
  
  // WordPress detection
  if (html.includes('wp-content') || html.includes('wordpress')) {
    framework = 'WordPress';
    confidence = 0.9;
    indicators.push('WordPress CMS detected');
  }
  
  // Static site generators
  if (html.includes('jekyll') || html.includes('_site/')) {
    framework = 'Jekyll';
    confidence = 0.8;
    indicators.push('Jekyll static site generator detected');
  }
  
  if (html.includes('gatsby') || html.includes('___gatsby')) {
    framework = 'Gatsby';
    confidence = 0.9;
    indicators.push('Gatsby framework detected');
  }

  return { framework, version, confidence, indicators };
}

function parseElement(element: any, index: number, parentSelector = ''): ParsedComponent {
  const tagName = element.tagName?.toLowerCase() || 'div';
  const selector = `${parentSelector} ${tagName}:nth-child(${index + 1})`.trim();
  
  // Extract styles
  const computedStyles: Record<string, any> = {};
  const style = element.getAttribute?.('style') || '';
  if (style) {
    style.split(';').forEach((declaration: string) => {
      const [property, value] = declaration.split(':').map((s: string) => s.trim());
      if (property && value) {
        computedStyles[property] = value;
      }
    });
  }
  
  // Extract all attributes
  const attributes: Record<string, any> = {};
  if (element.attributes) {
    for (const attr of element.attributes) {
      attributes[attr.name] = attr.value;
    }
  }
  
  // Determine component type based on element
  let componentType = 'element';
  if (tagName === 'header') componentType = 'header';
  else if (tagName === 'nav') componentType = 'navigation';
  else if (tagName === 'footer') componentType = 'footer';
  else if (tagName === 'section') componentType = 'section';
  else if (tagName === 'article') componentType = 'article';
  else if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) componentType = 'heading';
  else if (tagName === 'p') componentType = 'paragraph';
  else if (tagName === 'img') componentType = 'image';
  else if (tagName === 'a') componentType = 'link';
  else if (tagName === 'button') componentType = 'button';
  else if (['input', 'textarea', 'select'].includes(tagName)) componentType = 'form-element';
  else if (tagName === 'form') componentType = 'form';
  else if (['ul', 'ol'].includes(tagName)) componentType = 'list';
  else if (tagName === 'div' && attributes.class) {
    // Try to infer from class names
    const className = attributes.class.toLowerCase();
    if (className.includes('card')) componentType = 'card';
    else if (className.includes('modal')) componentType = 'modal';
    else if (className.includes('sidebar')) componentType = 'sidebar';
    else if (className.includes('hero')) componentType = 'hero';
    else if (className.includes('cta')) componentType = 'call-to-action';
  }
  
  // Extract text content
  let content = '';
  if (element.textContent) {
    content = element.textContent.trim();
  }
  
  // Parse children
  const children: ParsedComponent[] = [];
  if (element.children) {
    for (let i = 0; i < element.children.length; i++) {
      const child = parseElement(element.children[i], i, selector);
      children.push(child);
    }
  }
  
  return {
    id: `component-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: componentType,
    tag: tagName,
    content,
    styles: computedStyles,
    attributes,
    children,
    selector,
    position: { x: 0, y: 0, width: 0, height: 0 } // Will be calculated on frontend
  };
}

async function fetchAndParseSite(url: string): Promise<ParsedSiteData> {
  try {
    // Fetch the website
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AI-Site-Editor/1.0; +https://ai-site-editor.com)'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
    }
    
    const html = await response.text();
    
    // Parse HTML using DOMParser
    const doc = new DOMParser().parseFromString(html, 'text/html');
    
    // Extract metadata
    const title = doc.querySelector('title')?.textContent || 'Untitled';
    const description = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    const charset = doc.querySelector('meta[charset]')?.getAttribute('charset') || 'utf-8';
    const viewport = doc.querySelector('meta[name="viewport"]')?.getAttribute('content') || '';
    
    // Extract Open Graph data
    const ogData: Record<string, string> = {};
    doc.querySelectorAll('meta[property^="og:"]').forEach(meta => {
      const property = meta.getAttribute('property')?.replace('og:', '') || '';
      const content = meta.getAttribute('content') || '';
      if (property && content) {
        ogData[property] = content;
      }
    });
    
    // Extract CSS links
    const cssLinks: string[] = [];
    doc.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
      const href = link.getAttribute('href');
      if (href) {
        cssLinks.push(new URL(href, url).href);
      }
    });
    
    // Extract JavaScript sources
    const jsLinks: string[] = [];
    doc.querySelectorAll('script[src]').forEach(script => {
      const src = script.getAttribute('src');
      if (src) {
        jsLinks.push(new URL(src, url).href);
      }
    });
    
    // Detect framework
    const framework = detectFramework(html, jsLinks);
    
    // Parse body components
    const body = doc.querySelector('body');
    const components: ParsedComponent[] = [];
    
    if (body && body.children) {
      for (let i = 0; i < body.children.length; i++) {
        const component = parseElement(body.children[i], i, 'body');
        components.push(component);
      }
    }
    
    return {
      url,
      title,
      description,
      framework,
      html,
      css: cssLinks,
      js: jsLinks,
      components,
      meta: {
        charset,
        viewport,
        og: ogData
      }
    };
    
  } catch (error) {
    throw new Error(`Failed to parse site: ${error.message}`);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { url } = await req.json()
    
    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
    // Validate URL format
    try {
      new URL(url);
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid URL format' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
    console.log(`Parsing site: ${url}`);
    
    const parsedData = await fetchAndParseSite(url);
    
    console.log(`Successfully parsed ${url} - Framework: ${parsedData.framework.framework}`);
    
    return new Response(
      JSON.stringify(parsedData),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
    
  } catch (error) {
    console.error('Error parsing site:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to parse site',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})