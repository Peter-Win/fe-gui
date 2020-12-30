import * as React from 'react';
import { hot } from 'react-hot-loader/root';
<%= importStyle %>
const App: React.FC = () => (
    <>
        <h1>Hello, world!</h1>
        <p>Generated for React + <%= techDescr %>.</p>
    </>
);

export default hot(App);