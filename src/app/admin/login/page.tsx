"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Lock } from "lucide-react";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    const res = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Username atau password salah");
      setLoading(false);
    } else {
      window.location.href = "/admin/dashboard";
    }
  };

  return (
    <div className="flex justify-center items-center h-full min-h-[60vh]">
      <div className="w-full max-w-md bg-card p-8 rounded-2xl shadow-xl border">
        <h1 className="text-2xl font-bold text-center mb-6">Login Admin</h1>
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm text-center">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                className="w-full pl-10 pr-4 py-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary focus:outline-none transition-all" 
                required 
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full pl-10 pr-4 py-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary focus:outline-none transition-all" 
                required 
              />
            </div>
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all mt-4"
          >
            {loading ? "Memeriksa..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
