import React, { useState, useEffect } from 'react';
import { Save, Download, Upload, RefreshCw, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface CodeEditorProps {
  projectId: string;
  siteUrl: string;
  onSave?: (css: string, js: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  projectId,
  siteUrl,
  onSave
}) => {
  const [activeTab, setActiveTab] = useState<'css' | 'js'>('css');
  const [cssCode, setCssCode] = useState('/* Add your custom CSS here */\n\n');
  const [jsCode, setJsCode] = useState('// Add your custom JavaScript here\n\n');
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Sample CSS for common website modifications
  const sampleCSS = `/* Sample CSS modifications for your website */

/* Change header background */
header, .header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  color: white !important;
}

/* Style navigation links */
nav a, .nav-link {
  color: #333 !important;
  font-weight: 500 !important;
  transition: color 0.3s ease !important;
}

nav a:hover, .nav-link:hover {
  color: #007bff !important;
}

/* Improve button styling */
.btn, button {
  border-radius: 8px !important;
  padding: 12px 24px !important;
  font-weight: 600 !important;
  border: none !important;
  cursor: pointer !important;
}

.btn-primary, .primary-button {
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%) !important;
  color: white !important;
}

/* Add smooth animations */
* {
  transition: all 0.3s ease !important;
}

/* Improve spacing */
.container, .content {
  max-width: 1200px !important;
  margin: 0 auto !important;
  padding: 0 20px !important;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .container, .content {
    padding: 0 15px !important;
  }
  
  h1 {
    font-size: 2rem !important;
  }
  
  h2 {
    font-size: 1.5rem !important;
  }
}`;

  const sampleJS = `// Sample JavaScript modifications for your website

// Add smooth scrolling to all anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Add fade-in animation to elements when they come into view
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

// Apply fade-in to various elements
const elementsToAnimate = document.querySelectorAll('h1, h2, h3, p, .card, .section');
elementsToAnimate.forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(el);
});

// Add click handlers for better interactivity
document.querySelectorAll('button, .btn').forEach(button => {
  button.addEventListener('click', function() {
    // Add a subtle animation on click
    this.style.transform = 'scale(0.98)';
    setTimeout(() => {
      this.style.transform = 'scale(1)';
    }, 150);
  });
});

// Improve form handling
document.querySelectorAll('form').forEach(form => {
  form.addEventListener('submit', function(e) {
    const submitButton = this.querySelector('button[type="submit"], input[type="submit"]');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.innerHTML = 'Submitting...';
      
      // Re-enable after 3 seconds (adjust based on your needs)
      setTimeout(() => {
        submitButton.disabled = false;
        submitButton.innerHTML = 'Submit';
      }, 3000);
    }
  });
});

console.log('Custom JavaScript loaded for website enhancement');`;

  const handleLoadSample = () => {
    if (activeTab === 'css') {
      setCssCode(sampleCSS);
      toast.success('Sample CSS loaded');
    } else {
      setJsCode(sampleJS);
      toast.success('Sample JavaScript loaded');
    }
  };

  const handleSave = () => {
    onSave?.(cssCode, jsCode);
    toast.success('Code saved successfully!');
  };

  const handleDownload = () => {
    const content = activeTab === 'css' ? cssCode : jsCode;
    const fileName = `${projectId}-custom.${activeTab}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${activeTab.toUpperCase()} file downloaded`);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (activeTab === 'css') {
        setCssCode(content);
      } else {
        setJsCode(content);
      }
      toast.success(`${activeTab.toUpperCase()} file loaded`);
    };
    reader.readAsText(file);
  };

  const generatePublishCode = () => {
    const publishCSS = cssCode.trim();
    const publishJS = jsCode.trim();
    
    let publishCode = '<!-- Add this to your website\'s <head> section -->\n';
    
    if (publishCSS) {
      publishCode += `<style>\n${publishCSS}\n</style>\n\n`;
    }
    
    if (publishJS) {
      publishCode += '<!-- Add this before the closing </body> tag -->\n';
      publishCode += `<script>\n${publishJS}\n</script>`;
    }
    
    return publishCode;
  };

  const copyPublishCode = () => {
    const code = generatePublishCode();
    navigator.clipboard.writeText(code).then(() => {
      toast.success('Publish code copied to clipboard!');
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-gray-900">Code Editor</h3>
          
          {/* Tab Selector */}
          <div className="flex bg-gray-200 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('css')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'css'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              CSS
            </button>
            <button
              onClick={() => setActiveTab('js')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'js'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              JavaScript
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleLoadSample}
            className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors flex items-center space-x-1"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Load Sample</span>
          </button>
          
          <label className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors cursor-pointer flex items-center space-x-1">
            <Upload className="h-3 w-3" />
            <span>Upload</span>
            <input
              type="file"
              accept={activeTab === 'css' ? '.css' : '.js'}
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          
          <button
            onClick={handleDownload}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center space-x-1"
          >
            <Download className="h-3 w-3" />
            <span>Download</span>
          </button>
          
          <button
            onClick={handleSave}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-1"
          >
            <Save className="h-3 w-3" />
            <span>Save</span>
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 relative">
        <textarea
          value={activeTab === 'css' ? cssCode : jsCode}
          onChange={(e) => activeTab === 'css' ? setCssCode(e.target.value) : setJsCode(e.target.value)}
          className="w-full h-full p-4 font-mono text-sm bg-gray-900 text-gray-100 border-none outline-none resize-none"
          placeholder={
            activeTab === 'css'
              ? '/* Write your custom CSS here */\n\n/* Example:\nbody {\n  font-family: "Arial", sans-serif;\n  background-color: #f0f0f0;\n}\n\n.my-class {\n  color: #333;\n  padding: 20px;\n}'
              : '// Write your custom JavaScript here\n\n// Example:\ndocument.addEventListener("DOMContentLoaded", function() {\n  console.log("Page loaded");\n  \n  // Your code here\n});'
          }
          spellCheck={false}
        />
      </div>

      {/* Publish Section */}
      <div className="border-t bg-gray-50 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-1">Ready to Publish?</h4>
            <p className="text-xs text-gray-600">
              Copy the generated code and add it to your website
            </p>
          </div>
          <button
            onClick={copyPublishCode}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
          >
            Copy Publish Code
          </button>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;