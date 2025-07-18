# AI-Powered Site Editor - Deployment Guide

This guide will help you deploy the AI-powered site editor SaaS application to production.

## 🏗️ Architecture Overview

- **Frontend**: React + TypeScript + Vite (deployed to Vercel)
- **Backend**: Supabase (database, auth, edge functions)
- **AI**: OpenAI GPT-4 for UX suggestions
- **Payments**: Stripe for subscriptions
- **Deployment**: Vercel + Supabase

## 📋 Prerequisites

- Node.js 18+
- Supabase CLI
- Vercel CLI
- Stripe account
- OpenAI API account

## 🚀 Quick Setup

### 1. Environment Variables

Create a `.env` file in the root directory:

```bash
# Supabase
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
VITE_STRIPE_DAILY_PRICE_ID=price_...
VITE_STRIPE_MONTHLY_PRICE_ID=price_...

# OpenAI
OPENAI_API_KEY=sk-...

# App URLs
VITE_APP_URL=http://localhost:3000
```

### 2. Supabase Setup

#### Initialize Supabase Project

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to existing project or create new one
supabase link --project-ref your-project-ref
# OR
supabase start
```

#### Run Database Schema

```bash
# Run the schema file in Supabase SQL Editor
# Copy content from database/schema.sql and execute
```

#### Deploy Edge Functions

```bash
# Deploy all edge functions
supabase functions deploy sites-parse
supabase functions deploy ai-suggestions
supabase functions deploy stripe-webhook
supabase functions deploy stripe-checkout

# Set environment variables for edge functions
supabase secrets set STRIPE_SECRET_KEY=sk_test_...
supabase secrets set OPENAI_API_KEY=sk-...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
```

### 3. Stripe Setup

#### Create Products and Prices

```bash
# Daily plan
stripe products create --name="Daily Access" --description="24-hour editor access"
stripe prices create --product=prod_... --currency=usd --unit-amount=900 --recurring-interval=day

# Monthly plan  
stripe products create --name="Monthly Pro" --description="30-day editor access"
stripe prices create --product=prod_... --currency=usd --unit-amount=2900 --recurring-interval=month
```

#### Configure Webhooks

Add webhook endpoint in Stripe Dashboard:
- URL: `https://your-project.supabase.co/functions/v1/stripe-webhook`
- Events: 
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`

### 4. Frontend Deployment

#### Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# or use CLI:
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_STRIPE_DAILY_PRICE_ID
vercel env add VITE_STRIPE_MONTHLY_PRICE_ID
```

## 🔧 Local Development

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Supabase

```bash
supabase start
```

### 3. Start Development Server

```bash
npm run dev
```

### 4. Access Services

- Frontend: http://localhost:3000
- Supabase Studio: http://localhost:54323
- Database: postgresql://postgres:postgres@localhost:54322/postgres

## 📁 Project Structure

```
ai-site-editor/
├── src/
│   ├── components/
│   │   ├── editor/
│   │   │   ├── EditorCanvas.tsx      # Main editor interface
│   │   │   ├── ComponentBlock.tsx    # Individual component editor
│   │   │   └── SidebarPanel.tsx      # Component library
│   │   ├── AuthGuard.tsx             # Route protection
│   │   └── SubscriptionGuard.tsx     # Subscription validation
│   ├── pages/
│   │   ├── Dashboard.tsx             # Project management
│   │   ├── Editor.tsx                # Visual editor
│   │   ├── Pricing.tsx               # Subscription plans
│   │   ├── Home.tsx                  # Landing page
│   │   └── Login.tsx                 # Authentication
│   ├── lib/
│   │   ├── api.ts                    # API service layer
│   │   └── supabase.ts               # Supabase client
│   ├── types/
│   │   └── database.ts               # TypeScript types
│   └── App.tsx                       # Main app component
├── supabase/
│   ├── functions/
│   │   ├── sites-parse/              # Website parsing logic
│   │   ├── ai-suggestions/           # AI UX suggestions
│   │   ├── stripe-webhook/           # Stripe event handling
│   │   └── stripe-checkout/          # Checkout session creation
│   └── config.toml                   # Supabase configuration
├── database/
│   └── schema.sql                    # Database schema
└── DEPLOYMENT.md                     # This file
```

## 🎯 Core Features

### ✅ Implemented Features

1. **User Authentication**
   - Email/password sign up/in
   - Protected routes
   - User profile management

2. **Project Management**
   - Create projects from website URLs
   - Project dashboard with CRUD operations
   - Project metadata and settings

3. **Visual Editor**
   - Drag-and-drop component interface
   - Inline content editing
   - Component reordering
   - Real-time preview

4. **Component System**
   - Hero sections
   - Navigation bars
   - Text blocks
   - Images
   - Call-to-action buttons
   - Sections
   - Footers

5. **AI Integration**
   - Website parsing and component extraction
   - AI-powered UX suggestions
   - Layout optimization recommendations

6. **Subscription System**
   - Stripe integration
   - Daily ($9) and Monthly ($29) plans
   - Subscription-gated features
   - Webhook handling for subscription events

7. **Database & Backend**
   - PostgreSQL with Row Level Security
   - Supabase Edge Functions
   - RESTful API design
   - Real-time updates

### 🔄 API Endpoints

#### Projects
- `GET /api/projects` - List user projects
- `POST /api/projects` - Create project from URL
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

#### Components
- `GET /api/components?project_id=:id` - Get project components
- `POST /api/components` - Create component
- `PUT /api/components/:id` - Update component
- `DELETE /api/components/:id` - Delete component

#### AI
- `POST /api/ai/suggestions` - Generate UX suggestions

#### Stripe
- `POST /api/stripe/create-checkout-session` - Create checkout
- `POST /api/stripe/webhook` - Handle Stripe events

## 🔐 Security Features

1. **Row Level Security (RLS)**
   - Users can only access their own data
   - Database-level access control

2. **Authentication**
   - JWT-based authentication
   - Secure session management

3. **Environment Variables**
   - Sensitive data stored securely
   - Separate dev/prod configurations

4. **Stripe Security**
   - Webhook signature verification
   - Secure payment processing

## 🚀 Production Checklist

### Pre-Deployment

- [ ] Set up Supabase production project
- [ ] Configure Stripe live mode
- [ ] Set all environment variables
- [ ] Test payment flows
- [ ] Test AI functionality
- [ ] Set up error tracking (Sentry)
- [ ] Configure monitoring

### Post-Deployment

- [ ] Test complete user flows
- [ ] Verify webhook endpoints
- [ ] Monitor error rates
- [ ] Set up backups
- [ ] Configure alerts

## 📊 Monitoring & Analytics

### Key Metrics to Track

1. **User Metrics**
   - Sign-up conversion rate
   - Active users (daily/monthly)
   - Subscription conversion rate
   - Churn rate

2. **Product Metrics**
   - Projects created per user
   - Editor session duration
   - Component usage patterns
   - AI suggestion acceptance rate

3. **Technical Metrics**
   - API response times
   - Error rates
   - Database performance
   - Edge function execution time

### Recommended Tools

- **Analytics**: Vercel Analytics, Google Analytics
- **Error Tracking**: Sentry
- **Performance**: Vercel Speed Insights
- **Uptime**: Uptime Robot
- **User Behavior**: PostHog, Mixpanel

## 🛠️ Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check Supabase CORS settings
   - Verify API URLs in environment variables

2. **Authentication Issues**
   - Verify JWT expiration settings
   - Check redirect URLs in Supabase auth settings

3. **Stripe Webhook Failures**
   - Verify webhook endpoint URL
   - Check webhook secret
   - Monitor Stripe webhook logs

4. **Database Connection Issues**
   - Check RLS policies
   - Verify database credentials
   - Monitor connection pool usage

### Support Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)

## 🎨 Customization

### Branding
- Update logo and colors in `src/index.css`
- Modify landing page content in `src/pages/Home.tsx`
- Customize email templates in Supabase

### Features
- Add new component types in `src/types/database.ts`
- Extend editor functionality in `src/components/editor/`
- Add new AI suggestions in `supabase/functions/ai-suggestions/`

### Pricing
- Update plans in `src/pages/Pricing.tsx`
- Create new Stripe products and prices
- Update subscription logic in edge functions

## 📞 Support

For technical support or questions:
- Create an issue in the project repository
- Check the troubleshooting section above
- Review the documentation links provided

---

🎉 **Congratulations!** You now have a fully functional AI-powered site editor SaaS application ready for production.