/**
 * main.jsx — React app entry point
 * WHAT:  Bootstraps the React application into the DOM.
 * HOW:   Creates a React root on the #root element, renders the HomePage
 *        example wrapped in StrictMode (development warnings for side effects).
 * WHY:   Vite requires an explicit JS entry point referenced by index.html.
 *        This file is the bridge between the HTML shell and the React tree.
 */
import React from "react";
import ReactDOM from "react-dom/client";
import HomePage from "./examples/HomePage.jsx";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HomePage />
  </React.StrictMode>
);
