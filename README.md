# OmniPlay - Next.js & Supabase Arcade Game Platform

OmniPlay is a modern, high-performance, and SEO-optimized HTML5 game arcade platform. Migrated from a PHP + MySQL architecture, it is rebuilt on **Next.js (App Router)** and **Supabase (PostgreSQL)**, designed to run serverlessly on **Vercel** with extreme scalability.

---

## 💡 The "Know Why" (Architecture & Design Decisions)

Understanding why this architecture was chosen and how it benefits the platform compared to the legacy PHP/MySQL setup:

### 1. Why Next.js App Router & Server Components?
* **Organic Search Engine Optimization (SEO)**: Arcade websites rely heavily on organic search traffic. In the old PHP setup, pages were dynamically generated on request but required database roundtrips. Next.js Server Components query Supabase directly during request rendering on the edge, outputting fully hydrated, SEO-optimized HTML with metadata tags directly to search engine crawlers.
* **Layout Persistence & Interactivity**: OmniPlay features sidebar navigation and persistent drawers (Search, Menu) that shouldn't reset or reload when navigating between games or categories. React state handles drawer states cleanly without complex session-cookie hacks.
* **Serverless Architecture**: Moving to Next.js APIs (`app/api/*`) removes the need for managing a dedicated PHP hosting server (like Apache/Nginx). You pay only for execution time, and Vercel scales from zero to millions of requests automatically.

### 2. Why Supabase & PostgreSQL?
* **MySQL to PostgreSQL Transition**: PostgreSQL is a highly robust relational database with advanced indexing and native full-text search capabilities. By converting `poko.sql` to PostgreSQL (`poko_postgres.sql`), we gain superior performance for prefix matching (crucial for game title autocomplete search).
* **Supabase Client SDK**: Instantiating connection pools in PHP is slow and prone to bottlenecking under heavy load. Supabase handles database connection pooling automatically, serving queries over secure HTTPS via PostgREST.
* **Built-in Authentication**: Legacy PHP session handling is vulnerable to CSRF and session hijacking. Supabase Auth utilizes secure, JWT-based OAuth and Email password credentials, keeping customer/admin tables protected.

### 3. Database Translation Decisions
During migration, a custom Python parser mapped the MySQL schema to PostgreSQL:
* **Auto-increments**: Translated MySQL `int(...) AUTO_INCREMENT` to PostgreSQL `SERIAL PRIMARY KEY` for seamless identity tracking.
* **Data Types**: MySQL's `mediumtext` and `longtext` types were standardized into Postgres's unbounded `text` type, which is highly optimized.
* **Escaping Character Literals**: MySQL's non-standard `\'` escape sequences were converted to Postgres-compliant standard SQL single-quote escaping (`''`).

---

## 🛠️ The "Know How" (Setup & Deployment)

Follow these steps to run OmniPlay locally, populate the database, and deploy it to Vercel.

### 📦 Prerequisites
* [Node.js](https://nodejs.org/) (v18.x or later)
* A [Supabase](https://supabase.com/) Account (Free tier is sufficient)
* A [Vercel](https://vercel.com/) Account

---

### 1. Database Setup (Supabase)

Before running the application, you need to populate your PostgreSQL database with the games and site schema.

1. Go to your **Supabase Dashboard** and create a new project.
2. Navigate to the **SQL Editor** in the left sidebar.
3. Click **New Query**.
4. Open the SQL migration file [poko_postgres.sql](file:///d:/HIMALAY/1000-html-game-php-by-digirg/poko_postgres.sql) located in the root of the original project directory.
5. Copy the entire contents of `poko_postgres.sql` and paste them into the Supabase SQL Editor.
6. Click **Run**. This will create the required tables (`zon_games`, `zon_categories`, `zon_pages`, etc.) and seed the database with over 1,000 HTML5 arcade games.

---

### 2. Local Environment Setup

1. Inside the `omniplay-nextjs` directory, create a `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key-here # Required for secure Auth Admin actions
   ```
2. Replace the values with your actual project credentials (found under **Project Settings -> API** in the Supabase dashboard).

---

### 3. Installation & Run Locally

Install the required npm packages and start the hot-reloading development server:

```bash
# Navigate to the project directory
cd omniplay-nextjs

# Install dependencies
npm install

# Start the dev server
npm run dev
```

* Open [http://localhost:3000](http://localhost:3000) in your browser.
* The local instance will hot-reload as you make modifications to the source code.

---

### 4. Deploying to Vercel

1. Push your local repository to GitHub (this has already been pushed to [himalayladha/omniplay](https://github.com/himalayladha/omniplay.git)).
2. Log in to the [Vercel Dashboard](https://vercel.com/).
3. Click **Add New Project** and select the `omniplay` repository.
4. Expand **Environment Variables** and add the keys:
   * `NEXT_PUBLIC_SUPABASE_URL`
   * `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   * `SUPABASE_SERVICE_ROLE_KEY`
5. Click **Deploy**. Vercel will build the production application bundle, run static optimization, and deploy your site on a secure edge domain.

---

## ⚡ Overhauled Admin Panel Feature Suite (`/admin`)

The Admin Panel has been expanded into a complete glassmorphic control dashboard, including:
* **Visual Stats & SVG Analytics**: Lightweight inline SVG analytics bar charts mapping category distribution and top-played games without bringing in heavy external graphing libraries.
* **Monetization Ads Manager (`zon_ads`)**: Edit ad codes and toggle slot status (e.g. `700x100`, `300x250`) instantly.
* **Manage Blog CRUD (`zon_blog`)**: Create, update, write, and delete articles with thumbnail covers and raw HTML descriptions.
* **Comments Moderator (`zon_comments`)**: Parallel client-side resolution mapping `user_id` to usernames and `game_id` to game titles, with options to delete reviews.
* **Categories customizer (`zon_category`)**: Edit names and URL slug handlers.
* **Maintenance & Auto Link Checker Crawler**: A batched client-side web crawler auditing active database games. It catches connection, CSP, or X-Frame-Options blocks in real-time, takes them offline, and creates a bug report explaining the reason.
* **Spotlight Pickers**: Easily set or clear the hero landing banner game.
* **GameMonetize Auto-Filler**: Paste JSON, play links, or copy-pasted page text inside game modals to auto-fill title, URL, descriptions, instructions, categories, and construct image thumbnails.

---

## 📂 Codebase Structure & Navigation

* **[app/layout.js](file:///d:/HIMALAY/1000-html-game-php-by-digirg/omniplay-nextjs/app/layout.js)**: Base HTML structure, Google Fonts integration (Outfit & Roboto), and AppContext wrapping.
* **[app/page.js](file:///d:/HIMALAY/1000-html-game-php-by-digirg/omniplay-nextjs/app/page.js)**: Main homepage rendering featured games, search integration, categories, and footer.
* **[app/g/[gameName]/page.js](file:///d:/HIMALAY/1000-html-game-php-by-digirg/omniplay-nextjs/app/g/%5BgameName%5D/page.js)**: Game playing view utilizing the `GamePlay` component, showing views count, rating likes, comments, and recommendations.
* **[app/[categoryName]/page.js](file:///d:/HIMALAY/1000-html-game-php-by-digirg/omniplay-nextjs/app/%5BcategoryName%5D/page.js)**: Lists games filtered by their corresponding category name.
* **[app/admin/page.js](file:///d:/HIMALAY/1000-html-game-php-by-digirg/omniplay-nextjs/app/admin/page.js)**: Complete admin panel (Games CRUD, Fetch feeder, Site Settings, User roles, Ad manager, Blogs, Comments, Categories, Link Checker, and SVG charts).
* **[components/](file:///d:/HIMALAY/1000-html-game-php-by-digirg/omniplay-nextjs/components)**:
  * `Navbar.js` & `Footer.js`: Site headers and footer links synced directly from the database.
  * `SearchDrawer.js` & `MenuDrawer.js`: Persistent slide-out panels managing searches and navigation options.
  * `GamePlay.js`: Game screen interface managing fullscreen requests, embed auditing, rating likes, and comments.
* **[lib/supabase.js](file:///d:/HIMALAY/1000-html-game-php-by-digirg/omniplay-nextjs/lib/supabase.js)**: Supabase client initializer with placeholder fallback.

---

## 📡 API Routing

The platform handles interactions via Next.js Serverless routes:
1. **`/api/search`**: Query-based search returning title/tag matching games.
2. **`/api/like`**: Increments/decrements game like and dislike values using IP hashes.
3. **`/api/views`**: Increments game play counter when a user loads a game.
4. **`/api/report`**: Inserts bug reports into the database table for admin review.
5. **`/api/check-game-embed`**: Serverless auditor retrieving headers and body elements of game play URLs to detect CSP, sameorigin, or link blockages.
6. **`/api/admin/create-user`**: Auth Admin endpoint using the Service Role Key to register new users or admins.
7. **`/api/admin/set-role`**: Auth Admin endpoint promoting or demoting users between User and Admin roles.
8. **`/api/admin/fetch-games`**: FEEDS game importer fetching listings from the GameMonetize API.
