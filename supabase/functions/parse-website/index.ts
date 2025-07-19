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
  content: string;
  styles: Record<string, any>;
  attributes: Record<string, any>;
  selector: string;
  children?: ParsedComponent[];
}

interface FrameworkDetection {
  framework: string;
  version?: string;
  confidence: number;
  indicators: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { url, projectId } = await req.json()

    if (!url || !projectId) {
      return new Response(
        JSON.stringify({ error: 'URL and projectId are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Fetch the website
    console.log(`Fetching website: ${url}`)
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AI-Site-Editor/1.0)'
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch website: ${response.status} ${response.statusText}`)
    }

    const html = await response.text()
    
    // Parse HTML and detect framework
    const frameworkDetection = detectFramework(html)
    const components = parseComponents(html)

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Save framework detection to project
    const { error: projectError } = await supabase
      .from('projects')
      .update({
        framework: frameworkDetection,
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId)

    if (projectError) {
      console.error('Error updating project:', projectError)
      throw new Error('Failed to update project with framework info')
    }

    // Save components to database
    const componentsToInsert = components.map((comp, index) => ({
      project_id: projectId,
      component_type: comp.type,
      content: {
        tag: comp.tag,
        content: comp.content,
        styles: comp.styles,
        attributes: comp.attributes,
        selector: comp.selector,
        children: comp.children
      },
      position: index,
      is_visible: true
    }))

    const { error: componentsError } = await supabase
      .from('components')
      .insert(componentsToInsert)

    if (componentsError) {
      console.error('Error inserting components:', componentsError)
      throw new Error('Failed to save components')
    }

    return new Response(
      JSON.stringify({
        success: true,
        framework: frameworkDetection,
        components: components.length,
        data: {
          framework: frameworkDetection,
          components: componentsToInsert
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Parse website error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to parse website',
        details: error.toString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

function detectFramework(html: string): FrameworkDetection {
  const indicators: string[] = []
  let framework = 'HTML/CSS/JS'
  let confidence = 0
  let version: string | undefined

  // React detection
  if (html.includes('react') || html.includes('React')) {
    indicators.push('React references found')
    confidence += 30
  }
  if (html.includes('react-dom') || html.includes('ReactDOM')) {
    indicators.push('ReactDOM found')
    confidence += 40
    framework = 'React'
  }
  if (html.includes('data-reactroot') || html.includes('id="root"')) {
    indicators.push('React root element found')
    confidence += 20
    framework = 'React'
  }

  // Vue detection
  if (html.includes('vue') || html.includes('Vue')) {
    indicators.push('Vue references found')
    confidence += 30
  }
  if (html.includes('v-if') || html.includes('v-for') || html.includes('v-model')) {
    indicators.push('Vue directives found')
    confidence += 50
    framework = 'Vue'
  }
  if (html.includes('Vue.createApp') || html.includes('new Vue')) {
    indicators.push('Vue app initialization found')
    confidence += 40
    framework = 'Vue'
  }

  // Angular detection
  if (html.includes('angular') || html.includes('Angular')) {
    indicators.push('Angular references found')
    confidence += 30
  }
  if (html.includes('ng-app') || html.includes('ng-controller')) {
    indicators.push('Angular directives found')
    confidence += 50
    framework = 'Angular'
  }
  if (html.includes('@angular') || html.includes('ng-version')) {
    indicators.push('Angular framework markers found')
    confidence += 40
    framework = 'Angular'
  }

  // Next.js detection
  if (html.includes('__NEXT_DATA__') || html.includes('_next/static')) {
    indicators.push('Next.js markers found')
    confidence += 60
    framework = 'Next.js'
  }

  // Nuxt detection
  if (html.includes('__NUXT__') || html.includes('nuxt')) {
    indicators.push('Nuxt.js markers found')
    confidence += 60
    framework = 'Nuxt.js'
  }

  // Svelte detection
  if (html.includes('svelte') || html.includes('Svelte')) {
    indicators.push('Svelte references found')
    confidence += 40
    framework = 'Svelte'
  }

  // WordPress detection
  if (html.includes('wp-content') || html.includes('wordpress')) {
    indicators.push('WordPress markers found')
    confidence += 50
    framework = 'WordPress'
  }

  // Bootstrap detection
  if (html.includes('bootstrap') || html.includes('Bootstrap')) {
    indicators.push('Bootstrap CSS framework found')
    confidence += 20
  }

  // jQuery detection
  if (html.includes('jquery') || html.includes('jQuery')) {
    indicators.push('jQuery library found')
    confidence += 20
  }

  return {
    framework,
    version,
    confidence: Math.min(confidence, 100),
    indicators
  }
}

function parseComponents(html: string): ParsedComponent[] {
  const components: ParsedComponent[] = []
  
  try {
    // Create a basic DOM parser using regex (since we can't use full DOM API in Deno)
    const elementRegex = /<(\w+)([^>]*?)>(.*?)<\/\1>/gs
    let match
    let componentId = 1

    while ((match = elementRegex.exec(html)) !== null) {
      const [fullMatch, tag, attributesStr, content] = match
      
      // Skip script and style tags
      if (['script', 'style', 'meta', 'link', 'title'].includes(tag.toLowerCase())) {
        continue
      }

      // Parse attributes
      const attributes: Record<string, any> = {}
      const attrRegex = /(\w+)=["']([^"']*?)["']/g
      let attrMatch
      while ((attrMatch = attrRegex.exec(attributesStr)) !== null) {
        attributes[attrMatch[1]] = attrMatch[2]
      }

      // Determine component type
      const componentType = getComponentType(tag, attributes, content)
      
      // Generate selector
      const selector = generateSelector(tag, attributes)

      // Extract basic styles (this is simplified - in a real app you'd parse CSS)
      const styles = extractInlineStyles(attributesStr)

      const component: ParsedComponent = {
        id: `comp-${componentId++}`,
        type: componentType,
        tag: tag.toLowerCase(),
        content: content.replace(/<[^>]*>/g, '').trim().substring(0, 200), // Strip HTML and truncate
        styles,
        attributes,
        selector,
        children: []
      }

      // Only include meaningful components
      if (component.content.length > 0 || ['header', 'nav', 'footer', 'section', 'article', 'div'].includes(tag.toLowerCase())) {
        components.push(component)
      }
    }

  } catch (error) {
    console.error('Error parsing components:', error)
  }

  return components.slice(0, 20) // Limit to first 20 components
}

function getComponentType(tag: string, attributes: Record<string, any>, content: string): string {
  const tagLower = tag.toLowerCase()
  
  // Check by tag name first
  const tagTypeMap: Record<string, string> = {
    'header': 'header',
    'nav': 'navigation',
    'footer': 'footer',
    'section': 'section',
    'article': 'article',
    'aside': 'sidebar',
    'main': 'main-content',
    'h1': 'heading',
    'h2': 'heading',
    'h3': 'heading',
    'h4': 'heading',
    'h5': 'heading',
    'h6': 'heading',
    'p': 'paragraph',
    'img': 'image',
    'a': 'link',
    'button': 'button',
    'form': 'form',
    'input': 'form-input',
    'textarea': 'form-textarea',
    'select': 'form-select',
    'ul': 'list',
    'ol': 'list',
    'li': 'list-item'
  }

  if (tagTypeMap[tagLower]) {
    return tagTypeMap[tagLower]
  }

  // Check by class names
  const className = attributes.class || ''
  if (className.includes('hero')) return 'hero'
  if (className.includes('navbar') || className.includes('navigation')) return 'navigation'
  if (className.includes('footer')) return 'footer'
  if (className.includes('sidebar')) return 'sidebar'
  if (className.includes('card')) return 'card'
  if (className.includes('modal')) return 'modal'
  if (className.includes('button') || className.includes('btn')) return 'button'
  if (className.includes('form')) return 'form'

  // Check by content patterns
  if (content.length > 100 && tagLower === 'div') return 'content-block'
  if (content.length < 50 && tagLower === 'div') return 'wrapper'

  return tagLower === 'div' ? 'container' : 'element'
}

function generateSelector(tag: string, attributes: Record<string, any>): string {
  if (attributes.id) {
    return `#${attributes.id}`
  }
  
  if (attributes.class) {
    const classes = attributes.class.split(' ').filter((c: string) => c.trim())
    if (classes.length > 0) {
      return `.${classes[0]}`
    }
  }
  
  return tag.toLowerCase()
}

function extractInlineStyles(attributesStr: string): Record<string, any> {
  const styles: Record<string, any> = {}
  
  const styleMatch = attributesStr.match(/style=["']([^"']*?)["']/)
  if (styleMatch) {
    const styleStr = styleMatch[1]
    const styleRules = styleStr.split(';')
    
    styleRules.forEach(rule => {
      const [property, value] = rule.split(':').map(s => s.trim())
      if (property && value) {
        styles[property] = value
      }
    })
  }
  
  return styles
}