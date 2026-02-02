# TalentSia - AI-Powered Career Guidance

TalentSia is a comprehensive career platform designed to help users navigate their professional journey with AI-driven insights.

## Features

-   **Resume Builder**: Create ATS-friendly resumes manually or by uploading existing files.
-   **AI Analysis**: Get detailed feedback on your resume, including skill gaps and match scores.
-   **Interest-Based Matching**: Select your career interests (e.g., Frontend, Data Science) for tailored recommendations.
-   **Job Matching**: Find jobs that actually match your skill set, ranked by compatibility.
-   **Authentication**: Secure login and signup via Email and Google (Supabase).

## Tech Stack

-   **Frontend**: React, TypeScript, Vite
-   **Styling**: Tailwind CSS, shadcn/ui
-   **State Management**: Zustand, React Query
-   **Backend/Auth**: Supabase

## Getting Started

1.  **Clone the repository**
    ```bash
    git clone https://github.com/m0hiith/career-compass.git
    cd career-compass
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory and add your Supabase credentials:
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```

## Deployment

Refer to [DEPLOYMENT.md](./DEPLOYMENT.md) for instructions on deploying to Vercel with a custom domain.

## License

© 2025 TalentSia. All rights reserved.
