# FamBams - Family Schedule App

Your complete family scheduling application ready to deploy!

## What You Have

This is a fully functional Next.js app with:
- Parent dashboard for managing kids and schedules
- Family viewer interface for grandparents/relatives
- Calendar view with event details
- Invitation system with relationship types
- Mobile-responsive design

## Deployment Instructions

### Step 1: Upload to GitHub

1. Go to https://github.com and sign in
2. Click the "+" button in the top right corner
3. Select "New repository"
4. Repository settings:
   - Name: `fambams-app`
   - Description: "Family schedule sharing app"
   - Make it **Public**
   - Do NOT initialize with README (you already have one)
5. Click "Create repository"

### Using GitHub Desktop (Easiest Method)

1. Download GitHub Desktop from https://desktop.github.com
2. Open GitHub Desktop
3. Click "File" → "Add Local Repository"
4. Click "Choose..." and select your `fambams-app` folder
5. Click "Publish repository"
6. Make sure "Keep this code private" is UNCHECKED
7. Click "Publish repository"

### Step 2: Deploy to Vercel

1. Go to https://vercel.com and sign in with GitHub
2. Click "Add New..." → "Project"
3. Click "Import" next to your `fambams-app` repository
4. Vercel will auto-detect it's a Next.js app
5. Click "Deploy" (don't change any settings)
6. Wait 2-3 minutes
7. You'll get a URL like: `fambams-app.vercel.app`

### Step 3: Connect Your fambams.com Domain

1. In Vercel, go to your project → Settings → Domains
2. Add `fambams.com`
3. Follow Vercel's DNS instructions
4. Update your domain registrar's DNS settings
5. Wait 24-48 hours for DNS to propagate

## Demo Accounts

**Parent:** sarah@example.com  
**Viewer:** grandma@example.com

## Next Steps

This demo uses sample data. To make it production-ready, you'll need:
1. Real database (Firebase/Supabase)
2. Authentication system
3. Email service for invitations
4. Photo upload functionality

---

Built with Next.js, React, and Tailwind CSS