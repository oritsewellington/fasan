import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import App from "./App.jsx";
import { store } from "./store/store.js";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          richColors
          expand={false}
          toastOptions={{
            style: { fontFamily: "Inter, sans-serif", fontSize: "14px" },
            duration: 4000,
          }}
        />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
);
