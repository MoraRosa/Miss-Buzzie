# GitHub Pages Deployment Guide

Complete step-by-step guide to deploy your Business Planning Platform to GitHub Pages for free.

## Prerequisites

- GitHub account
- Git installed on your computer
- Node.js and npm installed

## Step 1: Prepare Your Repository

### Create a GitHub Repository

1. Go to [GitHub](https://github.com)
2. Click the "+" icon → "New repository"
3. Name it (e.g., `business-planning-platform`)
4. Choose Public or Private
5. Don't initialize with README (we already have one)
6. Click "Create repository"

### Connect Local Project to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit files
git commit -m "Initial commit: Business Planning Platform"

# Add remote repository (replace with your repo URL)
git remote add origin https://github.com/yourusername/business-planning-platform.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 2: Configure Vite for GitHub Pages

### Update `vite.config.ts`

Find the line with `base:` and update it:

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(() => ({
  // IMPORTANT: Change this to your repository name
  base: "/business-planning-platform/", // ← Update this line!

  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
```

**⚠️ Important:**

- If your repo is named `my-business-planner`, use `base: '/my-business-planner/'`
- Don't forget the leading and trailing slashes!

### Add CNAME for Custom Domain (Optional)

If you want to use a custom domain:

1. Create file `public/CNAME`
2. Add your domain (e.g., `businessplan.yourdomain.com`)

## Step 3: Install Deployment Package

```bash
npm install --save-dev gh-pages
```

## Step 4: Add Deployment Scripts

Open `package.json` and find the `"scripts"` section. Add these two lines:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

## Step 5: Deploy to GitHub Pages

### First Deployment

```bash
# Build and deploy in one command
npm run deploy
```

This will:

1. Build your app for production
2. Create a `gh-pages` branch
3. Push the built files to that branch
4. Your site will be live in a few minutes!

### Update GitHub Settings

1. Go to your repository on GitHub
2. Click "Settings" tab
3. Scroll to "Pages" section (left sidebar)
4. Under "Source", select:
   - **Branch:** `gh-pages`
   - **Folder:** `/ (root)`
5. Click "Save"

### Wait for Deployment

- GitHub will show a message: "Your site is ready to be published"
- After 1-2 minutes, it will change to: "Your site is live"
- Visit: `https://yourusername.github.io/business-planning-platform/`

## Step 6: Update and Redeploy

Whenever you make changes:

```bash
# 1. Save your changes
git add .
git commit -m "Description of changes"
git push origin main

# 2. Deploy updated version
npm run deploy
```

The site updates automatically in 1-2 minutes!

## Troubleshooting

### Site shows blank page or 404 errors

**Problem:** Base URL not set correctly

**Solution:**

1. Check `vite.config.ts` - `base` must match your repo name exactly
2. Rebuild and redeploy:
   ```bash
   npm run deploy
   ```

### CSS/Images not loading

**Problem:** Asset paths incorrect

**Solution:**

- In `vite.config.ts`, verify `base: '/your-repo-name/'` (with slashes!)
- Redeploy: `npm run deploy`

### Changes not appearing

**Problem:** Browser cache or deployment delay

**Solution:**

1. Wait 2-3 minutes after deploying
2. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
3. Try incognito/private browsing

### Deploy command fails

**Problem:** gh-pages not installed properly

**Solution:**

```bash
npm install --save-dev gh-pages
npm run deploy
```

## Custom Domain Setup

### Add Custom Domain

1. **Create CNAME file:**

   - Create `public/CNAME` file
   - Add your domain: `businessplan.yourdomain.com`

2. **Configure DNS:**

   - Go to your domain registrar
   - Add CNAME record:
     ```
     Type: CNAME
     Name: businessplan (or @)
     Value: yourusername.github.io
     ```

3. **Update GitHub Pages:**

   - Settings → Pages
   - Enter custom domain
   - Check "Enforce HTTPS"

4. **Redeploy:**
   ```bash
   npm run deploy
   ```

### DNS Configuration Examples

**For subdomain (businessplan.yourdomain.com):**

```
Type: CNAME
Host: businessplan
Points to: yourusername.github.io
```

**For apex domain (yourdomain.com):**

```
Type: A
Host: @
Points to: 185.199.108.153
Points to: 185.199.109.153
Points to: 185.199.110.153
Points to: 185.199.111.153
```

## Cost Breakdown

| Service              | Cost                          |
| -------------------- | ----------------------------- |
| GitHub Pages Hosting | $0                            |
| GitHub Repository    | $0 (public repos)             |
| SSL Certificate      | $0 (included)                 |
| Bandwidth            | $0 (unlimited for normal use) |
| Storage              | $0 (up to 1GB site)           |
| **Total**            | **$0/month** ✅               |

## Performance Tips

### Enable Caching

GitHub Pages automatically caches static assets for optimal performance.

### Optimize Build

The production build is already optimized with:

- Code splitting
- Minification
- Tree shaking
- Asset optimization

### Check Site Speed

Use these tools:

- [Google PageSpeed Insights](https://pagespeed.web.dev/)
- [GTmetrix](https://gtmetrix.com/)

## Security

### HTTPS

- Automatically enabled by GitHub Pages
- Free SSL certificate included
- No configuration needed

### Data Privacy

- All data stored in user's browser (localStorage)
- No data sent to any server
- Export/Import for backup control

## Monitoring

### Check Deployment Status

```bash
# View deployment history
git log --oneline gh-pages
```

### GitHub Actions (Optional)

For automatic deployments on push to main:

1. Create `.github/workflows/deploy.yml`
2. Add workflow configuration
3. Push to trigger auto-deploy

## Next Steps

✅ Your site is now live and free forever!

**Share your platform:**

- Share the URL with users
- Add to your portfolio
- Submit to startup directories
- Share on social media

**Maintain your site:**

- Regular backups of your repo
- Monitor GitHub Pages status
- Update dependencies periodically

**Enhance your platform:**

- Add analytics (optional)
- Create user documentation
- Build community around the project

---

**Need help?**

- Check [GitHub Pages docs](https://docs.github.com/en/pages)
- Open an issue on GitHub
- Review deployment logs

**Congratulations! Your business planning platform is now live! 🎉**
