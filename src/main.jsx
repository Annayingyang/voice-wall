import React from "react";
import ReactDOM from "react-dom/client";   // ✅ this line is required
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

// Layout (with <Outlet />)
import Layout from "./components/Layout.jsx";

// Pages
import Home from "./pages/Home.jsx";
import Topics from "./pages/Topics.jsx";
import Questions from "./pages/Questions.jsx";
import Answer from "./pages/Answer.jsx";
import Wall from "./pages/Wall.jsx";
import Login from "./pages/Login.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: "topics", element: <Topics /> },
      { path: "topics/:slug", element: <Questions /> },
      { path: "answer/:questionId", element: <Answer /> },
      { path: "wall", element: <Wall /> },
      { path: "login", element: <Login /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
