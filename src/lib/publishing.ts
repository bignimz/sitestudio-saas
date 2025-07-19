// Publishing utilities for applying changes to live websites

export interface ComponentChange {
  selector: string;
  xpath: string;
  newContent?: string;
  newStyles?: Record<string, string>;
  newAttributes?: Record<string, string>;
}

export const generateCSS = (components: any[]): string => {
  let css = `
/* AI Site Editor - Generated Styles */
/* These styles will override the original website styles */

`;

  components.forEach(component => {
    const { selector, styles } = component.content;
    
    if (styles && Object.keys(styles).length > 0) {
      css += `${selector} {\n`;
      
      Object.entries(styles).forEach(([property, value]) => {
        if (value && value !== 'undefined') {
          css += `  ${property}: ${value} !important;\n`;
        }
      });
      
      css += `}\n\n`;
    }
  });

  return css;
};

export const generateJavaScript = (components: any[]): string => {
  let js = `
// AI Site Editor - Content Updates
// This script will update the website content

(function() {
  console.log('AI Site Editor: Applying content changes...');
  
`;

  components.forEach(component => {
    const { selector, xpath, content, attributes } = component.content;
    
    // Update text content
    if (content) {
      js += `
  // Update content for: ${component.component_type}
  try {
    const element = document.querySelector('${selector}');
    if (element) {
      if (element.tagName.toLowerCase() !== 'img') {
        element.textContent = \`${content.replace(/`/g, '\\`')}\`;
      }
      console.log('Updated content for:', '${selector}');
    }
  } catch (e) {
    console.warn('Could not update content for:', '${selector}', e);
  }
`;
    }
    
    // Update attributes
    if (attributes) {
      Object.entries(attributes).forEach(([attr, value]) => {
        if (attr === 'src' || attr === 'href' || attr === 'alt') {
          js += `
  // Update ${attr} for: ${selector}
  try {
    const element = document.querySelector('${selector}');
    if (element) {
      element.setAttribute('${attr}', '${value}');
      console.log('Updated ${attr} for:', '${selector}');
    }
  } catch (e) {
    console.warn('Could not update ${attr} for:', '${selector}', e);
  }
`;
        }
      });
    }
  });

  js += `
  console.log('AI Site Editor: All changes applied successfully!');
})();
`;

  return js;
};

export const generateHTMLOverrides = (components: any[]): string => {
  let html = `
<!-- AI Site Editor - HTML Overrides -->
<style id="ai-site-editor-styles">
${generateCSS(components)}
</style>

<script id="ai-site-editor-script">
${generateJavaScript(components)}
</script>
`;

  return html;
};

export const generatePublishingCode = (components: any[], projectUrl: string) => {
  const css = generateCSS(components);
  const js = generateJavaScript(components);
  
  return {
    css,
    javascript: js,
    htmlSnippet: generateHTMLOverrides(components),
    instructions: `
To apply these changes to your live website:

1. CSS Method:
   - Add the generated CSS to your website's stylesheet
   - Or include it in a <style> tag in your HTML head

2. JavaScript Method:
   - Add the generated JavaScript to your website
   - Or include it in a <script> tag before closing </body>

3. HTML Snippet Method:
   - Insert the complete HTML snippet into your website's <head> section
   - This includes both CSS and JavaScript changes

4. CMS Integration:
   - Copy the CSS to your theme's custom CSS section
   - Copy the JavaScript to your theme's custom JS section

Note: Changes will only affect elements that match the original selectors.
The !important flags ensure your changes override existing styles.
`
  };
};