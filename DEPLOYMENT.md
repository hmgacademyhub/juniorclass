# Deployment Guide: HMG Academy v4

This platform is a static enterprise application. It is engineered to be hosted for **zero cost** while providing a world-class user experience.

## 🚀 Deployment Steps (GitHub Pages)

1. **Repository Setup**:
   - Create a new repository on GitHub (e.g., `hmg-academy-v4`).
   - Upload the entire contents of the `class v4` folder.
   - Ensure `index.html` is located in the root directory.

2. **Enable Hosting**:
   - Navigate to **Settings** $\rightarrow$ **Pages**.
   - Under **Build and deployment**, select **Deploy from a branch**.
   - Choose the `main` branch and the `/ (root)` folder.
   - Click **Save**.

3. **Final Verification**:
   - Access your site via `https://yourusername.github.io/hmg-academy-v4/`.
   - Test the **Dashboard $\rightarrow$ Lesson $\rightarrow$ Quiz $\rightarrow$ Certificate** flow.
   - Verify that the **Library** and **Planner** are functioning correctly.

## 🛠 Scaling the Content

To expand the platform to cover every single topic in the blended Nigerian and British curricula:

### The "Gold Standard" Content Template
Create a new JSON file in `data/curriculum/topics/` using this structure:
- `learning_objectives`: Clear, measurable goals.
- `key_vocabulary`: Essential academic terms.
- `content`: Use `heading`, `text`, `info-box`, `knowledge-check`, and `table` blocks.
- `assessment`: At least 5-10 high-quality multiple-choice questions.

## 💰 Cost & Sustainability Analysis
- **Hosting**: $0 (GitHub Pages / Vercel).
- **Database**: $0 (JSON-as-a-database).
- **AI API**: $0 (Content is pre-curated).
- **Maintenance**: Extremely low.
