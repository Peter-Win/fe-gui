import * as React from 'react';
import { hot } from 'react-hot-loader/root';
<%= importStyle %>
const App: React.FC = () => (
    <React.StrictMode>
        <h1><%= title %></h1>
        <p>Generated for React + <%= techDescr %>.</p>
    </React.StrictMode>
);

export default hot(App);