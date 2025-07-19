import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Wand2, 
  ArrowRight, 
  CheckCircle, 
  Star, 
  Globe, 
  Scan,
  Edit3,
  Code,
  Zap,
  Users,
  Eye,
  LogIn,
  Save
} from "lucide-react";

const Home = () => {
  const stats = [
    { number: "10,000+", label: "Sites Transformed" },
    { number: "99.9%", label: "Success Rate" },
    { number: "< 2 min", label: "Setup Time" },
    { number: "24/7", label: "Live Updates" }
  ];

  const features = [
    {
      icon: Scan,
      title: "AI-Powered Scanning",
      description: "Our AI automatically detects and maps all components, sections, and content blocks in your static website.",
      color: "text-blue-600"
    },
    {
      icon: Edit3,
      title: "Visual Content Editor",
      description: "Edit text, images, and layouts with an intuitive drag-and-drop interface. No coding required.",
      color: "text-green-600"
    },
    {
      icon: Code,
      title: "Advanced Code Editor",
      description: "For developers: Direct access to HTML, CSS, and JavaScript with syntax highlighting and live preview.",
      color: "text-purple-600"
    },
    {
      icon: Zap,
      title: "Instant Publishing",
      description: "Changes go live immediately. See your updates reflected on your actual website in real-time.",
      color: "text-orange-600"
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Invite team members with different permission levels. Perfect for agencies and content teams.",
      color: "text-red-600"
    },
    {
      icon: Globe,
      title: "Multi-Site Management",
      description: "Manage multiple websites from a single dashboard. Perfect for agencies and freelancers.",
      color: "text-teal-600"
    }
  ];

  const steps = [
    {
      step: "Step 1",
      icon: Globe,
      title: "Enter Website URL",
      description: "Simply paste the URL of your static website",
      color: "text-blue-600"
    },
    {
      step: "Step 2", 
      icon: Scan,
      title: "AI Analysis",
      description: "Our AI scans and identifies all components and sections",
      color: "text-green-600"
    },
    {
      step: "Step 3",
      icon: Edit3,
      title: "Visual Editing",
      description: "Edit content, images, and layouts using our visual editor",
      color: "text-purple-600"
    },
    {
      step: "Step 4",
      icon: Save,
      title: "Publish Changes",
      description: "Changes go live instantly on your actual website",
      color: "text-orange-600"
    }
  ];

  const frameworks = [
    { name: "React", icon: "⚛️" },
    { name: "Vue.js", icon: "🖖" },
    { name: "Angular", icon: "🅰️" },
    { name: "HTML/CSS", icon: "🌐" },
    { name: "Bootstrap", icon: "🅱️" },
    { name: "Tailwind", icon: "💨" },
    { name: "Next.js", icon: "▲" },
    { name: "Gatsby", icon: "🚀" },
    { name: "Hugo", icon: "⚡" },
    { name: "Jekyll", icon: "💎" },
    { name: "Astro", icon: "🚀" },
    { name: "Svelte", icon: "🔥" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Wand2 className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">
                SiteStudio
              </span>
            </div>
            <div className="flex items-center space-x-6">
              <a 
                href="#features" 
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Features
              </a>
              <a 
                href="#how-it-works" 
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                How It Works
              </a>
              <a 
                href="#frameworks" 
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Frameworks
              </a>
              <Link 
                to="/pricing" 
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Pricing
              </Link>
              <Link 
                to="/login" 
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                <LogIn className="h-4 w-4" />
                Login
              </Link>
              <Link 
                to="/login" 
                className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex justify-center mb-16"
          >
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="text-center"
                  >
                    <div className="text-2xl font-bold text-blue-600">
                      {stat.number}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Main Hero Content */}
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
                             <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
                Transform Any Static Website Into a{" "}
                <span className="text-blue-600">
                  Dynamic Experience
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
                Turn your static HTML sites into fully editable, dynamic websites with AI-powered component detection. No rebuilding required - just paste your URL and start editing.
              </p>
            </motion.div>

                         <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.8, delay: 0.4 }}
               className="flex flex-col sm:flex-row gap-4 justify-center items-center"
             >
               <Link 
                 to="/login" 
                 className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
               >
                 Start Free Trial
                 <ArrowRight className="h-5 w-5" />
               </Link>
               <button className="bg-white text-gray-800 px-8 py-4 rounded-lg font-semibold text-lg border border-gray-300 hover:bg-gray-50 transition-colors flex items-center gap-2">
                 <Eye className="h-5 w-5" />
                 Watch Demo
               </button>
             </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Make Static Sites Dynamic
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powerful features that work with any static website, regardless of how it was built.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="border-2 hover:border-blue-200 transition-all duration-300 hover:shadow-lg group bg-white p-6 rounded-lg"
              >
                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Transform your static website into a dynamic, editable experience in just four simple steps.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center border-2 hover:border-blue-200 transition-all duration-300 hover:shadow-lg bg-white p-6 rounded-lg"
                >
                  <div className="text-sm font-semibold text-blue-600 mb-2">
                    {step.step}
                  </div>
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <step.icon className={`h-8 w-8 ${step.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">
                    {step.description}
                  </p>
                </motion.div>
                
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="h-6 w-6 text-gray-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Framework Support Section */}
      <section id="frameworks" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Works with Any Framework
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              SiteStudio integrates seamlessly with any static website, regardless of the technology stack used to build it.
            </p>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {frameworks.map((framework, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 group text-center hover:-translate-y-1"
              >
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
                  {framework.icon}
                </div>
                <div className="text-sm font-medium text-gray-700">
                  {framework.name}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>



      {/* CTA Section */}
      <section className="py-24 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Website?
            </h2>
            <p className="text-xl text-blue-100 mb-10">
              Join thousands of satisfied customers who have made their static sites dynamic
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/login" 
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                Start Free Trial
                <ArrowRight className="h-5 w-5" />
              </Link>
              <button className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-colors">
                Schedule Demo
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Wand2 className="h-8 w-8 text-blue-400" />
              <span className="text-2xl font-bold">SiteStudio</span>
            </div>
            <div className="text-gray-400">
              © 2024 SiteStudio. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
