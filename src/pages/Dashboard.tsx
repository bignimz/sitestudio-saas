import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Globe, Edit, Trash2, ExternalLink, Wand2, Calendar, Clock, 
  Settings, LogOut, User, Search, Filter, Crown, CheckCircle, 
  Eye, Code, BarChart3, Zap, Monitor
} from "lucide-react";
import { projectsApi, authApi } from "../lib/api";
import { toast } from "sonner";

// Temporary type definition
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
  components_count?: number;
  framework?: {
    framework: string;
    version?: string;
    confidence: number;
  };
}

interface Component {
  id: string;
  type: string;
  name: string;
  description: string;
  tag: string;
}

const Dashboard = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [siteUrl, setSiteUrl] = useState("");
  const [creating, setCreating] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadProjects();
    loadUser();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      loadComponents();
    }
  }, [selectedProject]);

  const loadUser = async () => {
    try {
      const userData = await authApi.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error("Failed to load user:", error);
    }
  };

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await projectsApi.getAll();
      setProjects(data || []);
      
      // Auto-select first project if available
      if (data && data.length > 0) {
        setSelectedProject(data[0]);
      }
    } catch (error) {
      console.error("Failed to load projects:", error);
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const loadComponents = async () => {
    if (!selectedProject) return;
    
    try {
      // Mock components for now - replace with actual API call
      const mockComponents: Component[] = [
        {
          id: "1",
          type: "header",
          name: "Header Navigation",
          description: "Home About Services Contact...",
          tag: "header"
        },
        {
          id: "2",
          type: "hero",
          name: "Hero Section",
          description: "Welcome to Our Website - This is a sampl...",
          tag: "hero"
        },
        {
          id: "3",
          type: "section",
          name: "Content Section",
          description: "About Our Services - We provide excellen...",
          tag: "section"
        },
        {
          id: "4",
          type: "footer",
          name: "Footer",
          description: "© 2024 Website. All rights reserved...",
          tag: "footer"
        }
      ];
      setComponents(mockComponents);
    } catch (error) {
      console.error("Failed to load components:", error);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteUrl.trim()) return;

    try {
      setCreating(true);
      const project = await projectsApi.create({
        site_url: siteUrl,
        title: `Project from ${new URL(siteUrl).hostname}`,
        description: `Imported from ${siteUrl}`,
      });
      
      toast.success("Project created successfully!");
      setProjects([project, ...projects]);
      setSelectedProject(project);
      setShowCreateForm(false);
      setSiteUrl("");
    } catch (error: any) {
      console.error("Failed to create project:", error);
      toast.error(error.message || "Failed to create project");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;

    try {
      await projectsApi.delete(projectId);
      setProjects(projects.filter(p => p.id !== projectId));
      if (selectedProject?.id === projectId) {
        setSelectedProject(projects.find(p => p.id !== projectId) || null);
      }
      toast.success("Project deleted successfully");
    } catch (error: any) {
      console.error("Failed to delete project:", error);
      toast.error(error.message || "Failed to delete project");
    }
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Manage your website and subscription</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-lg font-medium">
                <Crown className="h-4 w-4" />
                <span>Monthly Pro</span>
              </button>
              
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Settings className="h-5 w-5" />
              </button>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Your Website Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <Globe className="h-6 w-6 text-gray-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Your Website</h2>
                </div>
                
                {selectedProject ? (
                  <Link
                    to={`/editor/${selectedProject.id}`}
                    className="flex items-center space-x-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit Website</span>
                  </Link>
                ) : (
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Website</span>
                  </button>
                )}
              </div>

              {selectedProject ? (
                <div>
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      {selectedProject.title}
                    </h3>
                    <p className="text-blue-600 text-sm mb-2">{selectedProject.site_url}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center space-x-1">
                        <span className="font-medium">
                          {selectedProject.framework?.framework || 'HTML/CSS/JS'}
                        </span>
                      </span>
                      <span>{components.length} components detected</span>
                    </div>
                  </div>

                  {/* Website Preview */}
                  <div className="bg-gray-100 rounded-lg p-4 mb-6">
                    <div className="bg-white rounded border">
                      {selectedProject.site_url ? (
                        <img 
                          src="/api/placeholder/600/300"
                          alt="Website preview"
                          className="w-full h-48 object-cover rounded"
                        />
                      ) : (
                        <div className="h-48 flex items-center justify-center text-gray-400">
                          <Monitor className="h-12 w-12" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Editable Components */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Editable Components</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {components.map((component) => (
                        <div
                          key={component.id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow cursor-pointer group"
                          onClick={() => navigate(`/editor/${selectedProject.id}?component=${component.id}`)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                              {component.name}
                            </h4>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              {component.tag}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 truncate">
                            {component.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Globe className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No website added yet</h3>
                  <p className="text-gray-600 mb-6">
                    Add your first website to start editing with our visual editor
                  </p>
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Website
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Current Plan */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Crown className="h-5 w-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">Current Plan</h3>
              </div>
              
              <div className="mb-4">
                <div className="text-xl font-bold text-gray-900 mb-1">Monthly Pro</div>
                <div className="text-sm text-gray-600">Edit Unlimited components</div>
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Visual & code editor</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Live preview</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Instant publishing</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Priority support</span>
                </div>
              </div>

              <Link
                to="/pricing"
                className="block w-full text-center bg-purple-100 text-purple-700 py-2 rounded-lg hover:bg-purple-200 transition-colors"
              >
                Manage Subscription
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Components</span>
                  <span className="font-semibold">{components.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Framework</span>
                  <span className="font-semibold">
                    {selectedProject?.framework?.framework || 'HTML/CSS/JS'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status</span>
                  <span className="text-green-600 font-semibold">Active</span>
                </div>
              </div>
            </div>

            {/* Recent Projects */}
            {projects.length > 1 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Other Projects</h3>
                
                <div className="space-y-2">
                  {projects.filter(p => p.id !== selectedProject?.id).map((project) => (
                    <button
                      key={project.id}
                      onClick={() => setSelectedProject(project)}
                      className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="font-medium text-gray-900 truncate">{project.title}</div>
                      <div className="text-sm text-gray-500 truncate">{project.site_url}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Project Modal */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => !creating && setShowCreateForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Add Website</h3>
              <form onSubmit={handleCreateProject} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website URL
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="url"
                      required
                      value={siteUrl}
                      onChange={(e) => setSiteUrl(e.target.value)}
                      placeholder="https://example.com"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={creating}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Enter any website URL to start editing
                  </p>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={creating}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating || !siteUrl.trim()}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {creating ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    ) : (
                      <>
                        <Wand2 className="h-4 w-4" />
                        Add Website
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
