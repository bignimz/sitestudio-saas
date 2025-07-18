import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, Zap, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../lib/api";
import { supabase } from "../lib/supabase";
import { toast } from "sonner";

const Pricing = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const navigate = useNavigate();

  const plans = [
    {
      id: "daily",
      name: "Daily Access",
      price: 9,
      interval: "day",
      description: "Perfect for quick edits and short-term projects",
      priceId: process.env.VITE_STRIPE_DAILY_PRICE_ID,
      features: [
        "Full editor access for 24 hours",
        "Unlimited projects",
        "AI suggestions",
        "Export capabilities",
        "Priority support"
      ],
      popular: false,
      color: "border-gray-200"
    },
    {
      id: "monthly",
      name: "Monthly Pro",
      price: 29,
      interval: "month",
      description: "Best value for ongoing website management",
      priceId: process.env.VITE_STRIPE_MONTHLY_PRICE_ID,
      features: [
        "Full editor access for 30 days",
        "Unlimited projects",
        "Advanced AI suggestions",
        "Priority export queue",
        "24/7 premium support",
        "Custom domain publishing",
        "Advanced analytics"
      ],
      popular: true,
      color: "border-blue-500 ring-2 ring-blue-500"
    }
  ];

  const handleSubscribe = async (planId: string, priceId: string) => {
    setLoading(planId);
    
    try {
      // Check if user is authenticated
      const userResponse = await authApi.getUser();
      if (userResponse.error || !userResponse.data?.user) {
        toast.error("Please sign in to subscribe");
        navigate("/login");
        return;
      }

      // Create Stripe checkout session
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          priceId,
          successUrl: `${window.location.origin}/dashboard?success=true`,
          cancelUrl: `${window.location.origin}/pricing?canceled=true`
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();
      window.location.href = url;
      
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error("Failed to start subscription process");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Site Editor</h1>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate("/dashboard")}
                className="text-gray-600 hover:text-gray-900"
              >
                Dashboard
              </button>
              <button 
                onClick={() => navigate("/")}
                className="text-gray-600 hover:text-gray-900"
              >
                Home
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto px-4"
        >
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Choose Your <span className="text-blue-600">Editing Plan</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Unlock the full power of our AI-driven site editor. Start creating amazing websites today.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Zap className="h-4 w-4 text-yellow-500" />
            <span>Get started in seconds • No setup required • Cancel anytime</span>
          </div>
        </motion.div>
      </div>

      {/* Pricing Plans */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative bg-white rounded-2xl shadow-lg p-8 ${plan.color} ${
                plan.popular ? 'scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-5xl font-bold text-gray-900">${plan.price}</span>
                  <span className="text-gray-500">/{plan.interval}</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSubscribe(plan.id, plan.priceId!)}
                disabled={loading === plan.id}
                className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                  plan.popular
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading === plan.id ? 'Loading...' : `Start ${plan.name}`}
              </motion.button>

              <p className="text-center text-sm text-gray-500 mt-4">
                No long-term commitment • Cancel anytime
              </p>
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-20"
        >
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3">Can I cancel anytime?</h3>
              <p className="text-gray-600">
                Yes! You can cancel your subscription at any time. For daily plans, you'll have access until the end of your 24-hour period. For monthly plans, you'll retain access until the end of your billing cycle.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3">What happens to my projects?</h3>
              <p className="text-gray-600">
                Your projects are always saved and accessible. Even if your subscription expires, you can view your projects. You'll just need an active subscription to edit them.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3">Do you offer refunds?</h3>
              <p className="text-gray-600">
                We offer a 7-day money-back guarantee for monthly subscriptions. Daily subscriptions are non-refundable due to their short duration.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3">Is my data secure?</h3>
              <p className="text-gray-600">
                Absolutely! We use enterprise-grade security measures to protect your data. All connections are encrypted and your projects are stored securely in the cloud.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Pricing;