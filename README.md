# MindLink - Real-time Collaborative Mind Map

MindLink is a real-time collaborative mind mapping application built with the MERN stack (MongoDB, Express, React, Node.js) and Socket.IO.

## Features

- **Real-time Collaboration**: See changes from other users instantly (nodes, edges, cursor movements).
- **Infinite Canvas**: Drag and explore a limitless workspace.
- **Mind Mapping**: Create nodes, connect them with edges, and organize your thoughts.
- **User Authentication**: Secure login and registration.
- **Persistence**: Maps are saved to MongoDB.

## Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    npm run install:all
    ```

2.  **Start the Application**:
    ```bash
    npm start
    ```
    This will run both the client (http://localhost:5173) and server (http://localhost:5001).

3.  **Open in Browser**:
    Visit `http://localhost:5173`.

## Architecture

-   **Frontend**: React, Vite, Socket.IO Client
-   **Backend**: Node.js, Express, Socket.IO, Mongoose
-   **Database**: MongoDB

## Usage

-   **Add Node**: Double-click on the canvas or click the "+ Add Node" button.
-   **Connect Nodes**: Hold `Shift` and drag from one node to another.
-   **Move Node**: Drag nodes around.
-   **Edit Text**: Double-click a node's text to edit.
-   **Delete Node**: Select a node and press `Delete` or `Backspace`.
-   **Pan Canvas**: Click and drag on the empty background.
-   **Zoom**: Use the `+` and `-` buttons in the toolbar.
