import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, Wand2, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Pricing = () => {
  const [isYearly, setIsYearly] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const navigate = useNavigate();

  const plans = [
    {
      id: "free",
      name: "Free",
      monthlyPrice: 0,
      yearlyPrice: 0,
      description: "Perfect for testing",
      features: [
        "2-3 updates and deployments",
        "Basic AI scanning",
        "Visual editor",
        "Community support",
        "1 website"
      ],
      popular: false,
      color: "border-gray-200",
      bgColor: "bg-white",
      buttonText: "Get Started",
      buttonStyle: "bg-gray-100 text-gray-700 hover:bg-gray-200"
    },
    {
      id: "daily",
      name: "Daily Access",
      monthlyPrice: 9,
      yearlyPrice: 9,
      description: "Short-term access for 24 hours",
      subDescription: "or $18 for 3 days",
      features: [
        "24 hours full access",
        "All AI features",
        "Visual & code editor",
        "Priority support",
        "Unlimited updates"
      ],
      popular: false,
      color: "border-gray-200",
      bgColor: "bg-white",
      buttonText: "Get 24h Access",
      buttonStyle: "bg-blue-600 text-white hover:bg-blue-700",
      extraButton: {
        text: "Get 3-Day Access ($18)",
        style: "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }
    },
    {
      id: "pro",
      name: "Pro Access",
      monthlyPrice: 25,
      yearlyPrice: 250,
      description: "Full monthly access",
      savingsText: "Save $50/year (17% off)",
      features: [
        "Unlimited websites",
        "Advanced AI features",
        "Code editor",
        "Custom domains",
        "Priority support",
        "Real-time collaboration"
      ],
      popular: true,
      color: "border-blue-200",
      bgColor: "bg-blue-50",
      buttonText: "Start Pro Trial",
      buttonStyle: "bg-blue-600 text-white hover:bg-blue-700"
    },
    {
      id: "early-bird",
      name: "One-Time Payment",
      monthlyPrice: 249,
      yearlyPrice: 249,
      description: "Lifetime access",
      isLifetime: true,
      features: [
        "Lifetime access",
        "All features included",
        "Unlimited websites",
        "Priority support",
        "Future updates included",
        "No recurring fees"
      ],
      popular: false,
      color: "border-orange-200",
      bgColor: "bg-orange-50",
      buttonText: "Get Lifetime Access",
      buttonStyle: "bg-orange-500 text-white hover:bg-orange-600",
      badge: "Early Bird"
    }
  ];

  const handlePlanSelect = async (planId: string) => {
    if (planId === "free") {
      navigate("/login");
      return;
    }

    setLoading(planId);
    try {
      // Handle plan selection logic here
      toast.success("Redirecting to checkout...");
      setTimeout(() => {
        setLoading(null);
      }, 2000);
    } catch (error) {
      toast.error("Failed to process payment");
      setLoading(null);
    }
  };

  const getDisplayPrice = (plan: any) => {
    if (plan.isLifetime) return plan.monthlyPrice;
    return isYearly ? plan.yearlyPrice : plan.monthlyPrice;
  };

  const getPriceInterval = (plan: any) => {
    if (plan.isLifetime) return "lifetime";
    if (plan.id === "daily") return "day";
    return isYearly ? "year" : "month";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-2">
                <Wand2 className="h-8 w-8 text-blue-600" />
                <span className="text-2xl font-bold text-gray-900">SiteStudio</span>
              </Link>
            </div>
            <Link 
              to="/" 
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Start free, scale as you grow
            </p>
            
            {/* Early Bird Banner */}
            <div className="bg-orange-500 text-white px-6 py-3 rounded-lg inline-block mb-8">
              <span className="font-bold">🔥 EARLY BIRD SPECIAL</span>
              <div className="text-sm">One-Time Payment: Only $249 for the first 100 customers!</div>
              <div className="text-xs opacity-90">Limited time offer - Lifetime access with all features included</div>
            </div>

            {/* Monthly/Yearly Toggle */}
            <div className="flex items-center justify-center mb-12">
              <span className={`mr-3 text-sm font-medium ${!isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
                Monthly
              </span>
              <button
                onClick={() => setIsYearly(!isYearly)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isYearly ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isYearly ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`ml-3 text-sm font-medium ${isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
                Yearly
              </span>
              {isYearly && (
                <span className="ml-2 text-sm font-medium text-green-600">Save 17%</span>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`relative ${plan.bgColor} p-8 rounded-lg border-2 ${plan.color} hover:shadow-lg transition-all duration-300`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    {plan.id === "free" ? "Free" : `$${getDisplayPrice(plan)}`}
                  </div>
                  {plan.id !== "free" && !plan.isLifetime && (
                    <div className="text-gray-600">/{getPriceInterval(plan)}</div>
                  )}
                  {plan.subDescription && (
                    <div className="text-sm text-gray-500 mt-1">{plan.subDescription}</div>
                  )}
                  <p className="text-gray-600 mt-2">{plan.description}</p>
                  {plan.savingsText && isYearly && (
                    <p className="text-sm text-green-600 font-medium mt-1">{plan.savingsText}</p>
                  )}
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="space-y-2">
                  <button
                    onClick={() => handlePlanSelect(plan.id)}
                    disabled={loading === plan.id}
                    className={`w-full py-3 rounded-lg font-medium transition-colors ${plan.buttonStyle} ${
                      loading === plan.id ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {loading === plan.id ? "Processing..." : plan.buttonText}
                  </button>
                  
                  {plan.extraButton && (
                    <button
                      onClick={() => handlePlanSelect(`${plan.id}-3day`)}
                      className={`w-full py-2 rounded-lg text-sm transition-colors ${plan.extraButton.style}`}
                    >
                      {plan.extraButton.text}
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about our pricing
            </p>
          </div>

          <div className="space-y-8">
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What's included in the free plan?
              </h3>
              <p className="text-gray-600">
                The free plan includes basic AI scanning, visual editor access, and allows for 2-3 updates and deployments. Perfect for testing our platform.
              </p>
            </div>

            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                How does the daily access work?
              </h3>
              <p className="text-gray-600">
                Daily access gives you full platform access for 24 hours. You can also purchase 3-day access for $18, which provides 72 hours of full access.
              </p>
            </div>

            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What's the difference between monthly and yearly billing?
              </h3>
              <p className="text-gray-600">
                Yearly billing offers a 17% discount compared to monthly billing. You save $50 per year with the Pro plan when billed annually.
              </p>
            </div>

            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Is the lifetime deal really lifetime?
              </h3>
              <p className="text-gray-600">
                Yes! The Early Bird special for $249 gives you lifetime access to all features with no recurring fees. This includes all future updates and unlimited websites.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I upgrade or downgrade my plan?
              </h3>
              <p className="text-gray-600">
                Yes, you can change your plan at any time. Upgrades take effect immediately, and downgrades take effect at the end of your current billing period.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Choose the plan that works best for you and start transforming your websites today.
          </p>
          <Link 
            to="/login" 
            className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-colors"
          >
            Start Free Trial
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Pricing;