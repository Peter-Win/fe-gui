import * as React from "react";
import ReactDOM from "react-dom";
import App from "./App";

const container = document.getElementById("root");
if (container) {
  // This patch is required until @hot-loader/react-dom ver 18 is available.
  // @ts-ignore
  if (process.env.NODE_ENV === "development") {
    ReactDOM.render(<App />, container);
  } else {
    // eslint-disable-next-line global-require
    const { createRoot } = require("react-dom/client");
    const root = createRoot(container);
    root.render(<App />);
  }
}
