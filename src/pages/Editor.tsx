import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Save, Eye, ArrowLeft, Sparkles } from "lucide-react";
import EditorCanvas from "../components/editor/EditorCanvas";
import SidebarPanel from "../components/editor/SidebarPanel";
import { projectsApi, componentsApi, aiApi } from "../lib/api";
import { Component, Project } from "../types/database";
import { toast } from "sonner";

export default function Editor() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [gettingSuggestions, setGettingSuggestions] = useState(false);

  useEffect(() => {
    if (projectId) {
      loadProjectData();
    }
  }, [projectId]);

  const loadProjectData = async () => {
    if (!projectId) return;

    try {
      // Load project and components in parallel
      const [projectResponse, componentsResponse] = await Promise.all([
        projectsApi.getProject(projectId),
        componentsApi.getComponents(projectId),
      ]);

      if (projectResponse.error) {
        toast.error("Failed to load project");
        navigate("/dashboard");
        return;
      }

      if (componentsResponse.error) {
        toast.error("Failed to load components");
        return;
      }

      setProject(projectResponse.data!);
      setComponents(componentsResponse.data || []);
    } catch (error) {
      toast.error("Failed to load project data");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleAddComponent = async (type: string) => {
    if (!projectId) return;

    const newComponent = {
      project_id: projectId,
      component_type: type as any,
      content: getDefaultContent(type),
      position: components.length,
      is_visible: true,
    };

    try {
      const response = await componentsApi.createComponent(newComponent);
      if (response.error) {
        toast.error("Failed to add component");
        return;
      }

      if (response.data) {
        setComponents((prev) => [...prev, response.data!]);
        toast.success("Component added successfully");
      }
    } catch (error) {
      toast.error("Failed to add component");
    }
  };

  const handleUpdateComponent = async (componentId: string, updates: Partial<Component>) => {
    try {
      const response = await componentsApi.updateComponent(componentId, updates);
      if (response.error) {
        toast.error("Failed to update component");
        return;
      }

      setComponents((prev) => prev.map((comp) => (comp.id === componentId ? { ...comp, ...updates } : comp)));
    } catch (error) {
      toast.error("Failed to update component");
    }
  };

  const handleDeleteComponent = async (componentId: string) => {
    try {
      const response = await componentsApi.deleteComponent(componentId);
      if (response.error) {
        toast.error("Failed to delete component");
        return;
      }

      setComponents((prev) => prev.filter((comp) => comp.id !== componentId));
      toast.success("Component deleted");
    } catch (error) {
      toast.error("Failed to delete component");
    }
  };

  const handleReorderComponents = async (reorderedComponents: Component[]) => {
    setComponents(reorderedComponents);

    try {
      const updates = reorderedComponents.map((comp, index) => ({
        id: comp.id,
        position: index,
      }));

      await componentsApi.reorderComponents(updates);
    } catch (error) {
      toast.error("Failed to save component order");
    }
  };

  const handleSave = async () => {
    if (!project) return;

    setSaving(true);
    try {
      // Could add additional save operations here
      toast.success("Project saved successfully");
    } catch (error) {
      toast.error("Failed to save project");
    } finally {
      setSaving(false);
    }
  };

  const handleGetSuggestions = async () => {
    if (!projectId) return;

    setGettingSuggestions(true);
    try {
      const response = await aiApi.generateSuggestions(projectId);
      if (response.error) {
        toast.error("Failed to get AI suggestions");
        return;
      }

      toast.success(`Generated ${response.data?.length || 0} suggestions`);
      // You could show suggestions in a modal or panel here
    } catch (error) {
      toast.error("Failed to get AI suggestions");
    } finally {
      setGettingSuggestions(false);
    }
  };

  const getDefaultContent = (type: string) => {
    switch (type) {
      case "text":
        return { text: "New text content", fontSize: "16px", color: "#000000" };
      case "image":
        return { url: "https://via.placeholder.com/400x300", alt: "Placeholder image" };
      case "hero":
        return {
          title: "Hero Title",
          subtitle: "Hero subtitle goes here",
          backgroundColor: "#f8fafc",
          ctaText: "Get Started",
          ctaUrl: "#",
        };
      case "cta":
        return {
          text: "Call to Action",
          url: "#",
          backgroundColor: "#3b82f6",
          textColor: "#ffffff",
        };
      case "section":
        return {
          title: "Section Title",
          text: "Section content goes here",
          backgroundColor: "#ffffff",
        };
      case "navbar":
        return {
          logoText: project?.title || "Logo",
          links: [
            { text: "Home", url: "#" },
            { text: "About", url: "#about" },
            { text: "Contact", url: "#contact" },
          ],
          backgroundColor: "#ffffff",
          textColor: "#000000",
        };
      case "footer":
        return {
          copyright: `© ${new Date().getFullYear()} ${project?.title || "Website"}`,
          backgroundColor: "#f8fafc",
          textColor: "#64748b",
        };
      default:
        return {};
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Project not found</h2>
          <button onClick={() => navigate("/dashboard")} className="text-blue-600 hover:text-blue-700">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 px-6 py-3 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} />
              Back
            </button>
            <div>
              <h1 className="text-lg font-semibold">{project.title}</h1>
              <p className="text-sm text-gray-500">Visual Editor</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGetSuggestions}
              disabled={gettingSuggestions}
              className="flex items-center gap-2 px-4 py-2 border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 disabled:opacity-50 transition-colors"
            >
              <Sparkles size={16} />
              {gettingSuggestions ? "Getting..." : "AI Suggestions"}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Save size={16} />
              {saving ? "Saving..." : "Save"}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Eye size={16} />
              Preview
            </motion.button>
          </div>
        </div>
      </div>

      {/* Main Editor */}
      <div className="flex pt-16 w-full">
        <SidebarPanel
          onAddComponent={handleAddComponent}
          components={components}
          onReorderComponents={handleReorderComponents}
        />
        <EditorCanvas
          components={components}
          onUpdateComponent={handleUpdateComponent}
          onDeleteComponent={handleDeleteComponent}
        />
      </div>
    </div>
  );
}
