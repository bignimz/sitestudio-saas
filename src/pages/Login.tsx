import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../providers/AuthProvider";

export function Login() {
  const [credentials, setCredentials] = useState({
    email: "test@example.com",
    password: "password",
  });
  const [error, setError] = useState("");
  const { user } = useAuth();

  const handleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });
      if (error) throw error;
    } catch (err) {
      setError(err.message);
    }
  };

  if (user) {
    return <div>Already logged in as {user.email}</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="space-y-4 w-64">
        <input
          type="email"
          value={credentials.email}
          onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
          className="w-full p-2 border rounded"
        />
        <input
          type="password"
          value={credentials.password}
          onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
          className="w-full p-2 border rounded"
        />
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <button onClick={handleLogin} className="w-full bg-blue-500 text-white p-2 rounded">
          Sign In
        </button>
      </div>
    </div>
  );
}
