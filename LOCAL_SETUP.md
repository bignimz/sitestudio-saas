# 🚀 Local Development Setup Guide

Follow this step-by-step guide to run the AI-Powered Site Editor locally.

## 📋 Prerequisites

Make sure you have the following installed:
- **Node.js 18+** - [Download here](https://nodejs.org/)
- **npm or yarn** - Comes with Node.js
- **Git** - [Download here](https://git-scm.com/)
- **Docker** - [Download here](https://www.docker.com/get-started) (for Supabase local development)

## 🔧 Step-by-Step Setup

### Step 1: Clone and Install Dependencies

```bash
# Clone the repository (if not already done)
git clone <your-repo-url>
cd ai-site-editor

# Install dependencies
npm install
```

### Step 2: Setup Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Open .env in your editor and update it (we'll fill in values in next steps)
```

### Step 3: Initialize Supabase

```bash
# Install Supabase CLI globally
npm install -g supabase

# Initialize Supabase in your project
npx supabase init

# Start Supabase locally (this will download Docker images first time)
npx supabase start
```

**Important:** The first time you run `supabase start`, it will:
- Download Docker images (this may take a few minutes)
- Start local Supabase services
- Show you important URLs and keys

### Step 4: Get Supabase Credentials

After running `supabase start`, you'll see output like this:

```bash
Started supabase local development setup.

         API URL: http://localhost:54321
     GraphQL URL: http://localhost:54321/graphql/v1
          DB URL: postgresql://postgres:postgres@localhost:54322/postgres
      Studio URL: http://localhost:54323
    Inbucket URL: http://localhost:54324
      JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
        anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 5: Update Your .env File

Open your `.env` file and update it with the values from Step 4:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... # Use the anon key from supabase start output

# Optional configurations (can be added later)
# STRIPE_SECRET_KEY=sk_test_...
# OPENAI_API_KEY=sk-...
# VITE_STRIPE_DAILY_PRICE_ID=price_...
# VITE_STRIPE_MONTHLY_PRICE_ID=price_...

# App Configuration
VITE_APP_URL=http://localhost:3000
```

### Step 6: Setup Database Schema

1. **Open Supabase Studio** in your browser: http://localhost:54323

2. **Go to SQL Editor** (left sidebar)

3. **Copy and paste the database schema**:
   - Open the file `database/schema.sql`
   - Copy all the content
   - Paste it in the Supabase SQL Editor
   - Click "Run" to execute the schema

### Step 7: Deploy Edge Functions (Optional)

If you want to test AI features and site parsing:

```bash
# Deploy the edge functions
npx supabase functions deploy sites-parse
npx supabase functions deploy ai-suggestions
npx supabase functions deploy stripe-webhook
npx supabase functions deploy stripe-checkout
```

### Step 8: Start the Development Server

```bash
# Start the React development server
npm run dev
```

The application should now be running at: **http://localhost:3000**

## 🎯 Testing the Application

### 1. **Test Authentication**
- Go to http://localhost:3000
- Click "Sign Up" or "Login"
- Create a test account with any email/password
- You should be redirected to the dashboard

### 2. **Test Project Creation**
- In the dashboard, click "New Project"
- Enter a website URL (e.g., `https://example.com`)
- The app will try to parse the site (this requires the edge function)

### 3. **Test Visual Editor**
- Create a project or add components manually
- Try the drag-and-drop interface
- Test inline editing of components

## 🛠️ Troubleshooting

### Issue: Supabase Config Error

If you get config errors when running `supabase start`:

```bash
# Stop supabase
npx supabase stop

# Reset and start again
npx supabase start
```

### Issue: Blank Page or React Errors

1. **Check the browser console** for errors
2. **Verify environment variables** in `.env`
3. **Restart the dev server**:
   ```bash
   # Stop the server (Ctrl+C)
   # Then restart
   npm run dev
   ```

### Issue: Database Connection Errors

1. **Verify Supabase is running**:
   ```bash
   npx supabase status
   ```

2. **Check database schema was applied**:
   - Go to http://localhost:54323
   - Check that tables exist in the Database tab

### Issue: Edge Function Errors

For local development, some features that depend on edge functions might not work:
- Site parsing from URLs
- AI suggestions
- Stripe payments

These are optional for basic local development and testing.

## 📁 Available Local Services

When everything is running, you'll have access to:

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend App** | http://localhost:3000 | Main React application |
| **Supabase Studio** | http://localhost:54323 | Database management UI |
| **Supabase API** | http://localhost:54321 | Backend API endpoint |
| **Email Testing** | http://localhost:54324 | Test emails (Inbucket) |

## 🔄 Daily Development Workflow

```bash
# Start your development session
npx supabase start    # Start Supabase services
npm run dev          # Start React dev server

# When you're done
# Ctrl+C              # Stop React dev server
npx supabase stop    # Stop Supabase services (optional)
```

## 🧪 Testing Features

### Basic Features (No external APIs needed):
- ✅ User authentication
- ✅ Project CRUD operations
- ✅ Component management
- ✅ Visual editor interface
- ✅ Dashboard navigation

### Advanced Features (Require API keys):
- 🔶 Site parsing (needs edge function)
- 🔶 AI suggestions (needs OpenAI API key)
- 🔶 Stripe payments (needs Stripe keys)

## 🎨 Making Changes

### Frontend Changes
- Edit files in `src/` directory
- Changes will hot-reload automatically

### Database Changes
- Make changes in Supabase Studio: http://localhost:54323
- Or update `database/schema.sql` and re-run the SQL

### Backend Logic Changes
- Edit edge functions in `supabase/functions/`
- Redeploy with: `npx supabase functions deploy <function-name>`

## 📞 Getting Help

If you encounter issues:

1. **Check this troubleshooting section**
2. **Look at browser console errors**
3. **Check Supabase logs**: `npx supabase logs`
4. **Verify all prerequisites are installed**
5. **Make sure Docker is running** (required for Supabase)

## 🎉 You're Ready!

If you can access http://localhost:3000 and see the landing page, you're all set for local development!

### Next Steps:
- Explore the codebase in `src/`
- Try creating and editing projects
- Customize components and styling
- Add your own features

---

**Happy coding! 🚀**