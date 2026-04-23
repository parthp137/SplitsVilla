import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// This page redirects to the Landing page
const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/");
  }, [navigate]);

  return null;
};

export default Index;
