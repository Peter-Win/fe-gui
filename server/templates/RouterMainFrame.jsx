import * as React from "react";
import {
  BrowserRouter,
  Link,
  Switch,
  Route,
  useLocation,
} from "react-router-dom";

const NoMatch = () => {
  const location = useLocation();
  return (
    <h1>
      No match for <code>{location.pathname}</code>
    </h1>
  );
};

export const MainFrame = () => (
  <BrowserRouter>
    <div>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/about">About</Link>
          </li>
          <li>
            <Link to="/users">Users</Link>
          </li>
        </ul>
      </nav>
      <Switch>
        <Route path="/about">
          <h1>About</h1>
        </Route>
        <Route path="/users">
          <h1>Users</h1>
        </Route>
        <Route exact path="/">
          <h1>Home</h1>
        </Route>
        <Route path="*">
          <NoMatch />
        </Route>
      </Switch>
    </div>
  </BrowserRouter>
);
