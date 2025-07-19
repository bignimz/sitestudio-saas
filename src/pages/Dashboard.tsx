import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Globe, Edit, Trash2, ExternalLink } from "lucide-react";
import { projectsApi, authApi } from "../lib/api";
import { Project } from "../types";
import { toast } from "sonner";

const Dashboard = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [siteUrl, setSiteUrl] = useState("");
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await projectsApi.getProjects();
      if (response.error) {
        toast.error("Failed to load projects");
        return;
      }
      setProjects(response.data?.data || []);
    } catch (error) {
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFromUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteUrl.trim()) return;

    setCreating(true);
    try {
      const response = await projectsApi.createFromUrl(siteUrl.trim());
      if (response.error) {
        toast.error(response.error);
        return;
      }
      
      toast.success("Project created successfully!");
      setShowCreateForm(false);
      setSiteUrl("");
      loadProjects();
      
      // Navigate to editor
      if (response.data) {
        navigate(`/editor/${response.data.id}`);
      }
    } catch (error) {
      toast.error("Failed to create project");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    
    try {
      const response = await projectsApi.deleteProject(projectId);
      if (response.error) {
        toast.error("Failed to delete project");
        return;
      }
      
      toast.success("Project deleted successfully");
      loadProjects();
    } catch (error) {
      toast.error("Failed to delete project");
    }
  };

  const handleLogout = async () => {
    try {
      await authApi.signOut();
      navigate("/");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg px-4 py-6">
        <h2 className="text-xl font-bold mb-6">Site Editor</h2>
        <nav className="space-y-4">
          <Link to="/dashboard" className="block text-blue-600 font-medium">
            Projects
          </Link>
          <Link to="/pricing" className="block text-gray-700 hover:text-blue-500">
            Upgrade
          </Link>
          <button 
            onClick={handleLogout}
            className="block text-gray-700 hover:text-blue-500 text-left"
          >
            Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-semibold mb-2">My Projects</h1>
              <p className="text-gray-600">Create and manage your website projects.</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              New Project
            </motion.button>
          </div>
        </header>

        {/* Create Project Form */}
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-white p-6 rounded-lg shadow-sm border"
          >
            <h3 className="text-lg font-semibold mb-4">Create Project from URL</h3>
            <form onSubmit={handleCreateFromUrl} className="flex gap-4">
              <div className="flex-1">
                <input
                  type="url"
                  value={siteUrl}
                  onChange={(e) => setSiteUrl(e.target.value)}
                  placeholder="Enter website URL (e.g., https://example.com)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={creating}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {creating ? "Creating..." : "Create"}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </form>
          </motion.div>
        )}

        {/* Projects Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-16">
            <Globe className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
            <p className="text-gray-500 mb-6">Get started by creating your first project from a website URL.</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              Create Your First Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {project.title}
                    </h3>
                    {project.description && (
                      <p className="text-sm text-gray-600 mb-2">{project.description}</p>
                    )}
                    {project.site_url && (
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Globe size={14} />
                        <span className="truncate">{project.site_url}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        project.is_published
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {project.is_published ? "Published" : "Draft"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/editor/${project.id}`}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <Edit size={16} />
                    Edit
                  </Link>
                  {project.published_url && (
                    <a
                      href={project.published_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center p-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <ExternalLink size={16} />
                    </a>
                  )}
                  <button
                    onClick={() => handleDeleteProject(project.id)}
                    className="flex items-center justify-center p-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="mt-4 text-xs text-gray-500">
                  Created {new Date(project.created_at).toLocaleDateString()}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
