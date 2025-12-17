# Deploying MindLink to Render

I have configured your project for a **Unified Deployment**. This matches industry standards for MERN apps on Render, preventing "Cold Start" synchronization issues and simplifying configuration.

## Steps to Deploy

1. **Push Changes**
   - I have already set up the configuration. Just ensure these changes are pushed to your GitHub repository (I am doing this for you).

2. **Go to Render Dashboard**
   - Log in to [dashboard.render.com](https://dashboard.render.com/).

3. **Create New Blueprint Instance**
   - Click the **New +** button in the top right.
   - Select **Blueprint**.
   - Connect your repository (`mindmap`).

4. **Configuration (Automatic)**
   - Render will detect the `render.yaml` file I created.
   - It will show a service named `mindlink-monorepo`.
   - Click **Apply**.

5. **Environment Variables**
   - Render will ask you for the following values (or you can add them in the "Environment" tab of the dashboard):
     - `MONGODB_URI`: Your MongoDB connection string.
       - **IMPORTANT:** Ensure it looks like: `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/mindlink?retryWrites=true&w=majority`
       - Make sure to add `/mindlink` (the database name) after the `.net` part.
     - `JWT_SECRET`: A secure random string (e.g., specific generated secret).

6. **Database Access**
   - Ensure your MongoDB Atlas **Network Access** whitelist includes `0.0.0.0/0` (Allow Access from Anywhere) so Render can connect.

## Troubleshooting

- **Build Fails?** Check the logs. I updated the build script to ensure `vite` is installed correctly.
- **Login Fails?** Check the server logs on Render. Look for "Connected to MongoDB". If it fails, check your `MONGODB_URI` and Atlas Whitelist.
- **CORS Errors?** I have enabled `origin: "*"` for the backend socket connection to prevent this.
