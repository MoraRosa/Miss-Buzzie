# Mizzie 🐝

**Business Planning Made Simple**

An open-source, free business planning platform for entrepreneurs. Create your business model canvas, pitch deck, roadmap, org chart, and financial forecasts - all in your browser with zero cost.

**🌐 [Try it Live](https://morarosa.github.io/Miss-Buzzie/)** | **📖 [Documentation](#-getting-started)** | **🐛 [Report Issues](https://github.com/MoraRosa/Miss-Buzzie/issues)**

![Business Planning Platform](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![GitHub Pages](https://img.shields.io/badge/deployed-GitHub%20Pages-success)

## 🚀 Features

- **Business Model Canvas** - Define your business using the proven 9-block framework
- **Pitch Deck** - Create compelling 12-slide presentations for investors
- **Roadmap** - Plan milestones across 1, 5, and 10-year timeframes
- **Org Chart** - Structure your team with roles and departments
- **Checklist** - Track tasks with progress monitoring
- **Financial Forecasting** - Project 3-year revenue, expenses, and profitability

## ✨ Benefits

- 🎨 **Beautiful UI** - Modern, professional design with light/dark mode
- 💾 **Your Data, Your Control** - Everything stored locally in your browser
- 📤 **Export/Import** - Save and share your business plan as JSON
- 📱 **Fully Responsive** - Works on desktop, tablet, and mobile
- 🆓 **100% Free** - No subscriptions, no hidden costs
- 🌐 **Works Offline** - No internet required after initial load
- 🔒 **Privacy First** - Your data never leaves your device

## 🎯 Perfect For

- Early-stage entrepreneurs
- Startups seeking funding
- Business students
- Consultants and advisors
- Anyone planning a new venture

## 🛠️ Tech Stack

- **React 18** - Modern component-based UI
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Beautiful, accessible components

## 📦 Getting Started

### Local Development

1. **Clone the repository**

   ```bash
   git clone https://github.com/MoraRosa/Miss-Buzzie.git
   cd Miss-Buzzie
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   ```
   http://localhost:8080
   ```

## 🌐 Deploy to GitHub Pages (FREE Hosting)

### One-Time Setup

1. **Update `vite.config.ts`**

   Add your repository name as the base:

   ```typescript
   export default defineConfig(({ mode }) => ({
     base: "/your-repo-name/", // e.g., '/business-planning-platform/'
     // ... rest of config
   }));
   ```

2. **Install gh-pages package**

   ```bash
   npm install --save-dev gh-pages
   ```

3. **Add deployment scripts to package.json**

   Add these scripts:

   ```json
   {
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

4. **Deploy to GitHub Pages**

   ```bash
   npm run deploy
   ```

5. **Enable GitHub Pages**
   - Go to your repo on GitHub
   - Settings → Pages
   - Source: Deploy from branch
   - Branch: `gh-pages`
   - Click Save

Your site will be live at: `https://morarosa.github.io/Miss-Buzzie/`

### Custom Domain (Optional)

1. Add a `CNAME` file to the `public` folder with your domain
2. Configure your domain's DNS settings
3. Enable HTTPS in GitHub Pages settings

## 💡 How to Use

1. **Start Planning** - Click any tab to begin
2. **Fill In Details** - Add your business information
3. **Auto-Save** - Everything saves automatically in your browser
4. **Export Anytime** - Download your plan as JSON
5. **Import Later** - Upload your JSON to continue working

## 🔧 Customization

### Change Theme Colors

Edit `src/index.css` to customize colors:

```css
:root {
  --primary: 333 71% 50%; /* Main brand color */
  --secondary: 240 5% 33%; /* Secondary color */
  --accent: 355 100% 97%; /* Accent color */
}
```

### Add New Sections

1. Create component in `src/components/YourSection.tsx`
2. Import in `src/pages/Index.tsx`
3. Add new tab in the `TabsList`
4. Add `TabsContent` with your component

## 📊 Data Management

### Export Your Data

Click **Export** to download your business plan as JSON. Keep this file safe!

### Import Your Data

Click **Import** and select your previously exported JSON file.

### Backup Strategy

- Export regularly
- Store backups in cloud storage (Google Drive, Dropbox)
- Version your exports with dates

## 🤝 Contributing

Contributions are welcome! This is an open-source project for entrepreneurs by entrepreneurs.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

MIT License - feel free to use this for any purpose, commercial or personal.

## 🌟 Why Open Source?

Business planning tools shouldn't be expensive or locked behind paywalls. This project exists to help entrepreneurs everywhere access professional planning tools for free.

## 💬 Support

- 🐛 [Report bugs](https://github.com/MoraRosa/Miss-Buzzie/issues)
- 💡 [Request features](https://github.com/MoraRosa/Miss-Buzzie/issues)
- ⭐ Star this repo if you find it useful!

## 🎓 Resources

- [Business Model Canvas Guide](https://www.strategyzer.com/canvas/business-model-canvas)
- [Pitch Deck Best Practices](https://www.ycombinator.com/library/4T-how-to-design-a-better-pitch-deck)
- [Startup Financial Modeling](https://www.ycombinator.com/library/7w-startup-financial-models)

---

**Built with ❤️ for entrepreneurs worldwide**

[⭐ Star this project](https://github.com/MoraRosa/Miss-Buzzie) • [🐛 Report Issue](https://github.com/MoraRosa/Miss-Buzzie/issues) • [🤝 Contribute](https://github.com/MoraRosa/Miss-Buzzie/pulls)
