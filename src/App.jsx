import { Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Detail from "./pages/Detail";

function App() {
  return (
    <Routes>

      <Route
        path="/"
        element={<Dashboard />}
      />

      <Route
        path="/detail/:id"
        element={<Detail />}
      />

    </Routes>
  );
}

export default App;