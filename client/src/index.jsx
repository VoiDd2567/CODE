import React from "react";
import { createRoot } from "react-dom/client";
import AppWrapper from "./AppWrapper.jsx"
import "./translates/i18n";


const app = createRoot(document.getElementById("app"));
app.render(<AppWrapper />) 