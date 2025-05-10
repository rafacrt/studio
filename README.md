# Alugo Project

This project consists of two main parts:

1.  **Alugo Mobile App**: A Flutter application for users to find and book university student accommodations.
2.  **Alugo Admin Panel**: A Next.js (React/TypeScript) web application for administrators to manage listings, users, and view analytics.

## Flutter Mobile App

The user-facing mobile application is built with Flutter.

### Getting Started with Flutter App

1.  **Ensure Flutter is installed:** Follow the [official Flutter installation guide](https://docs.flutter.dev/get-started/install).
2.  **Navigate to the Flutter project directory:** (Assuming the Flutter project is at the root or in a `alugo_flutter` sub-directory - adjust as per your structure).
    ```bash
    # cd alugo_flutter # If in a subdirectory
    ```
3.  **Get dependencies:**
    ```bash
    flutter pub get
    ```
4.  **Run the app:**
    ```bash
    flutter run
    ```

## Next.js Admin Panel

The administrative panel is a Next.js web application.

### Getting Started with Next.js Admin Panel

1.  **Navigate to the Next.js project directory** (this is likely the root of the current project).
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Set up environment variables:**
    Create a `.env.local` file in the root of the Next.js project (if not already present from previous steps for map keys, etc.). Add any necessary environment variables for the admin panel or Genkit.
    Example:
    ```
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY
    # Other Genkit/Firebase related keys if applicable
    ```
4.  **Run the development server for the admin panel:**
    ```bash
    npm run dev
    ```
    This will typically start the admin panel on `http://localhost:9002`.

5.  **(Optional) Genkit Development Server:**
    If you are working with Genkit flows:
    ```bash
    npm run genkit:dev
    # or
    npm run genkit:watch
    ```

### Accessing the Admin Panel

Once the Next.js development server is running, you can usually access the admin panel by navigating to `/admin/dashboard` (e.g., `http://localhost:9002/admin/dashboard`). Login with admin credentials.
