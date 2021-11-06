import * as React from "react";
import {
  BrowserRouter,
  Link,
  Outlet,
  Routes,
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

const MainFrameLayout = () => (
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
  <main>
  <Outlet />
</main>
</div>
);

export const MainFrame = () => (
  <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainFrameLayout />}>
          <Route index element={<h1>Home</h1>} />
          <Route path="/about" element={<h1>About</h1>} />
          <Route path="/users" element={<h1>Users</h1>} />
          <Route path="*" element={<NoMatch />} />
        </Route>
      </Routes>
  </BrowserRouter>
);
