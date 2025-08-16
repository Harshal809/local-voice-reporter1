import { useState } from "react";
import { signUpUser } from "../lib/auth";
import { useNavigate  } from "react-router-dom";
import { Link } from "react-router-dom";
import heroImage from "@/assets/civic-hero.jpg";
import Header from "./Header";

export default function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate= useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage("Error: Passwords do not match");
      return;
    }
    setLoading(true);
    setMessage("");
    const result = await signUpUser(email, password);
    setLoading(false);

    if (result.success) {
      setMessage("Signup successful! Redirecting you to dashboard...");
      setTimeout(() => {
        navigate('/dashboard')
      }, 1500)
    } else {
      setMessage(`Error: ${result.message}`);
    }
  };

  return (
    <div className={"bg-white/80"}>
      <Header />
    <div className="relative w-full h-screen">
      
      <img 
        src={heroImage}
        alt="Citizens reporting civic issues"
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/90"></div>

    <div className="absolute inset-0 flex items-center justify-center px-4">
      <div className="bg-white/80 backdrop-blur-md p-8 rounded-xl shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Welcom to CivicPulse!
        </h2>
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border border-gray-300 p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border border-gray-300 p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="border border-gray-300 p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>

          {message && (
            <p
              className={`text-sm mt-2 ${
                message.startsWith("Error: ") ? "text-red-600" : "text-green-600"
              }`}
            >
              {message}
            </p>
          )}
        </form>
        <p className="mt-4 text-sm text-gray-600 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  </div>
  </div>
  );
}
