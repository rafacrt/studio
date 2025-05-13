# Alugo Project

This project consists of a Next.js (React/TypeScript) web application for administrators to manage listings, users, and view analytics, and a user-facing application.

## Next.js Admin Panel & User Application

The administrative panel and user-facing application are part of a Next.js web application.

### Getting Started with Next.js Application

1.  **Navigate to the Next.js project directory** (this is likely the root of the current project).
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Set up environment variables:**
    Create a `.env.local` file in the root of the Next.js project. Add any necessary environment variables.
    Example:
    ```
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY_IF_NEEDED
    # Other Genkit/Firebase related keys if applicable
    ```
4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    This will typically start the application on `http://localhost:9002`.

5.  **(Optional) Genkit Development Server:**
    If you are working with Genkit flows:
    ```bash
    npm run genkit:dev
    # or
    npm run genkit:watch
    ```

### Accessing the Application

- **User Application:** Once the Next.js development server is running, you can access the user application by navigating to the root path or specific user routes (e.g., `http://localhost:9002/explore`).
- **Admin Panel:** You can usually access the admin panel by navigating to `/admin/dashboard` (e.g., `http://localhost:9002/admin/dashboard`). Login with admin credentials.
