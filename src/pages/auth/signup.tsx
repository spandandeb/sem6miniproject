import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";
import InputField from "../../components/InputField";

interface SignupProps {
  setAuth: React.Dispatch<React.SetStateAction<boolean>>;
  setUser: React.Dispatch<React.SetStateAction<any>>;
}

const Signup: React.FC<SignupProps> = ({ setAuth, setUser }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        setAuth(true); // Set authentication state
        setUser({ id: data.userId, name, email }); // Store user info
        navigate("/"); // Redirect to home
      } else {
        setError(data.message || "Signup failed. Try again.");
      }
    } catch (error) {
      console.error("Signup error:", error);
      setError("Something went wrong. Try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-6 bg-white shadow-lg rounded-lg w-96 text-center">
        <FaUser className="mx-auto text-3xl text-blue-500" />
        <h2 className="text-2xl font-bold mt-2">Create account!</h2>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <InputField
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            icon={<FaUser />}
          />
          <InputField
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<FaEnvelope />}
          />
          <InputField
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<FaLock />}
          />
          <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded">
            Create →
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;
