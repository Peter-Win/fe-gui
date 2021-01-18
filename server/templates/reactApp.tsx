import * as React from "react";
import { hot } from "react-hot-loader/root";
import { MainFrame } from "./MainFrame";
<%= importStyle %>
const App: React.FC = () => (
    <React.StrictMode>
        <MainFrame />
    </React.StrictMode>
);

export default hot(App);
