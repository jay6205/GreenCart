import React from "react";
import { useAppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useEffect } from "react";

const AuthSuccess = () => {
  const { axios, setUser } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const fetchUser = async () => {
      try {
        // call the backend is-auth endpoint (must be withCredentials)
        const { data } = await axios.get("/user/is-auth");
        // API shape in your controller: data.data.user
        const user = data?.data?.user ?? null;
        if (mounted && user) {
          setUser(user);
          toast.success("Signed in successfully");
        }
      } catch (err) {
        // Not fatal — just treat as not logged in
        console.error("Auth check failed:", err?.response?.data || err);
        // toast.error("Could not finish sign-in. Try again.");
      } finally {
        // always navigate somewhere (dashboard or homepage)
        // small delay gives better UX but not required
        setTimeout(() => navigate("/"), 200);
      }
    };

    fetchUser();
    return () => {
      mounted = false;
    };
  }, [axios, setUser, navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h2 className="text-xl font-medium">Signing you in…</h2>
        <p className="text-sm text-gray-500 mt-2">
          Almost there — redirecting you now.
        </p>
      </div>
    </div>
  );
};

export default AuthSuccess;
