import { Routes, Route } from "react-router-dom";
import { AuthGuard } from "./features/auth/AuthGuard";
import { SetupPage } from "./features/auth/SetupPage";
import { UnlockPage } from "./features/auth/UnlockPage";
import { Dashboard } from "./features/dashboard/Dashboard";

function App() {
  return (
    <Routes>
      <Route
        path="/setup"
        element={
          <AuthGuard>
            <SetupPage />
          </AuthGuard>
        }
      />

      <Route
        path="/"
        element={
          <AuthGuard>
            <Dashboard />
          </AuthGuard>
        }
      />

      <Route
        path="/unlock"
        element={
          <AuthGuard>
            <UnlockPage />
          </AuthGuard>
        }
      />

      <Route
        path="/profiles"
        element={
          <AuthGuard>
            <div className="p-20 text-emerald-500 font-bold">Profile Selector Placeholder</div>
          </AuthGuard>
        }
      />
    </Routes>
  );
}

export default App;
