# Deployment & Maintenance Guide: HMG Academy Learnhub v6

Learnhub Class V6 is an optimized static application. Hosting it is **100% free** and requires zero databases or backend infrastructure.

---

## 🚀 Deployment to GitHub Pages (Recommended)

### Step 1: Create your Repository
1.  Log in to your [GitHub Account](https://github.com/).
2.  Click the **`+`** icon (top-right corner) and select **New repository**.
3.  Name your repository: `learnhub-v6`.
4.  Set the repository to **Public** (required for free GitHub Pages).
5.  Do not check any of the initialization settings (README, .gitignore, license), and click **Create repository**.

### Step 2: Push your code
Open a terminal or command line inside your unzipped `class v6` folder and execute:

```bash
# Initialize local repository
git init -b main

# Stage all files
git add .

# Create release commit
git commit -m "feat: deploy Learnhub Class V6 with 54-topic curriculum, STEM solver, and verification ledger"

# Link to GitHub (Replace with your actual GitHub username)
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/learnhub-v6.git

# Force-push to main branch
git push -u origin main -f
```

### Step 3: Activate Hosting
1.  Go to your GitHub repository web page.
2.  Select **Settings** $\rightarrow$ **Pages** (on the left menu).
3.  Under **Build and deployment**:
    *   Set **Source** to *Deploy from a branch*.
    *   Set **Branch** to `main` and select the `/ (root)` folder.
4.  Click **Save**.
5.  Wait roughly 60 seconds. Refresh the page to see your live URL (e.g., `https://YOUR_GITHUB_USERNAME.github.io/learnhub-v6/`).

---

## ⚡ Alternative Free Platforms

### Option A: Vercel (Super Fast CDN)
1.  Log into [Vercel](https://vercel.com/) (using your GitHub login).
2.  Click **Add New** $\rightarrow$ **Project**.
3.  Import your `learnhub-v6` repository.
4.  Keep default build/framework settings and click **Deploy**. Vercel will automatically give you a production-grade SSL link.

### Option B: Netlify
1.  Log into [Netlify](https://www.netlify.com/).
2.  Drag and drop the unzipped `class v6` folder directly into the designated "deploy box" on the Netlify dashboard.
3.  Your site will be live instantly with a custom subdomain.

---

## ⚙️ Modifying or Scalability Controls

Because Class V6 is 100% data-driven, adding new classes, terms, or topics is easy:

### How to Add a Topic:
1.  Open `data/curriculum/map.json`.
2.  Add a topic dictionary entry into the appropriate class $\rightarrow$ subject $\rightarrow$ term list with a unique `id` (e.g., `jss3-math-t3-3`).
3.  Create a matching file inside `data/curriculum/topics/jss3-math-t3-3.json` following the structural standard:
    ```json
    {
      "id": "jss3-math-t3-3",
      "title": "Topic Name",
      "subject": "Subject",
      "class": "JSS 3",
      "term": "Third Term",
      "learning_objectives": ["Obj 1", "Obj 2"],
      "key_vocabulary": [{"term": "Word", "definition": "Def"}],
      "content": [
        {"type": "heading", "text": "Header Text"},
        {"type": "text", "text": "Core paragraph content..."},
        {"type": "knowledge-check", "question": "Q?", "options": ["A","B"], "answer": 0, "explanation": "Why"}
      ],
      "assessment": {
        "quizId": "jss3-math-t3-3-quiz",
        "questions": [{"question": "Q?", "options": ["A","B"], "answer": 0}]
      }
    }
    ```
4.  Save and commit the file. The global resource library, search bar, progress analytics, and curriculum dashboards will dynamically update instantly!

---

## 💰 Sustainability & Operational Costing
*   **Database Cost**: $0 (Cached `localStorage` + client-side JSON files).
*   **AI API Cost**: $0 (Lessons are pre-generated, eliminating paid endpoints).
*   **Hosting Fee**: $0 (GitHub Pages, Vercel, or Netlify free tiers).
*   **SSL Certificates**: $0 (Auto-renewed by CDN).
