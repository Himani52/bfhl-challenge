# BFHL — Full Stack Node Hierarchy Challenge

## Project Structure

```
bfhl-project/
├── backend/
│   ├── index.js        ← Express API (POST /bfhl)
│   └── package.json
├── frontend/
│   └── index.html      ← Single-page frontend
├── render.yaml         ← Render.com deploy config (backend)
└── vercel.json         ← Vercel deploy config (frontend)
```

---

## Step 1 — Personalise

Open `backend/index.js` and update **lines 7–9**:

```js
const USER_ID       = "yourname_ddmmyyyy";        // e.g. "johndoe_17091999"
const EMAIL_ID      = "you@college.edu";
const COLLEGE_ROLL  = "21CSXXXX";
```

---

## Step 2 — Run locally

```bash
# Backend
cd backend
npm install
node index.js          # starts on http://localhost:3001

# Frontend — just open in browser
open frontend/index.html
# (update the API URL field to http://localhost:3001/bfhl)
```

Test with curl:
```bash
curl -X POST http://localhost:3001/bfhl \
  -H "Content-Type: application/json" \
  -d '{"data":["A->B","A->C","B->D","X->Y","Y->Z","Z->X","hello","1->2"]}'
```

---

## Step 3 — Push to GitHub

```bash
git init
git add .
git commit -m "BFHL Full Stack Challenge"
git remote add origin https://github.com/YOUR_USERNAME/bfhl-challenge.git
git push -u origin main
```

---

## Step 4 — Deploy Backend to Render

1. Go to [render.com](https://render.com) → New → Web Service
2. Connect your GitHub repo
3. Settings:
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && node index.js`
   - **Environment:** Node
4. Deploy → copy the URL, e.g. `https://bfhl-api.onrender.com`

---

## Step 5 — Deploy Frontend to Vercel (or Netlify)

### Vercel
1. Go to [vercel.com](https://vercel.com) → New Project → Import GitHub repo
2. Set **Root Directory** to `frontend`
3. Deploy → copy the URL

### Netlify (alternative)
1. Drag-and-drop the `frontend/` folder at [app.netlify.com/drop](https://app.netlify.com/drop)
2. Copy the URL

### Update the frontend API URL
In the deployed frontend, update the API URL input to your Render backend URL.

Or hard-code it by editing `frontend/index.html` line ~120:
```html
<input ... value="https://bfhl-api.onrender.com/bfhl" />
```

---

## API Specification

**POST** `/bfhl`  
Content-Type: `application/json`

Request:
```json
{ "data": ["A->B", "A->C", "B->D", "X->Y", "Y->Z", "Z->X", "hello"] }
```

Response includes: `user_id`, `email_id`, `college_roll_number`, `hierarchies`, `invalid_entries`, `duplicate_edges`, `summary`.

---

## Submission Checklist

- [ ] Personalised `user_id`, `email_id`, `college_roll_number` in `backend/index.js`
- [ ] Backend deployed and responding at `<your-url>/bfhl`
- [ ] Frontend deployed and calling the hosted backend
- [ ] GitHub repo is **public**
- [ ] Submitted form with all 3 URLs
