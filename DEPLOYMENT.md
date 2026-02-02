# Deployment Guide: Vercel & talentsia.in

Since you have your code on GitHub and own the domain `talentsia.in`, deploying via Vercel is the best choice.

## Step 1: Deploy to Vercel
1.  **Login to Vercel**: Go to [vercel.com](https://vercel.com) and sign in with your **GitHub** account.
2.  **Add New Project**:
    *   Click **"Add New..."** -> **"Project"**.
    *   Select your `career-compass` repository from the list.
    *   Click **Import**.
3.  **Configure Environment Variables**:
    *   In the "Environment Variables" section, add the same keys from your local `.env`:
        *   `VITE_SUPABASE_URL`: (Your URL)
        *   `VITE_SUPABASE_ANON_KEY`: (Your Key)
4.  **Deploy**: Click **Deploy**. Vercel will build your site and give you a `*.vercel.app` URL.

## Step 2: Connect Custom Domain (talentsia.in)
1.  Go to your project dashboard on Vercel.
2.  Click **Settings** -> **Domains**.
3.  Enter `talentsia.in` in the input box and click **Add**.
4.  **Update DNS Records**:
    *   Vercel will show you the DNS records you need to add.
    *   Go to your domain registrar (where you bought `talentsia.in`, e.g., namecheap, godaddy).
    *   Add the **A Record** (76.76.21.21) or **CNAME** provided by Vercel.
5.  Wait for verification (can take a few minutes to an hour).

## Step 3: Update Auth Configuration (CRITICAL)
Once your domain is live (`https://talentsia.in`), you **MUST** update your auth providers to allow it.

### 1. Update Supabase
*   Go to Supabase Dashboard -> **Authentication** -> **URL Configuration**.
*   Add `https://talentsia.in` to **Site URL**.
*   Add `https://talentsia.in/**` to **Redirect URLs**.

### 2. Update Google Cloud Console
*   Go to Google Cloud Console -> **Credentials**.
*   Edit your OAuth 2.0 Client.
*   **Authorized JavaScript origins**: Add `https://talentsia.in`.
*   **Authorized redirect URIs**: Add `https://talentsia.in`.
