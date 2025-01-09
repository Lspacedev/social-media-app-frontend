import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedLanding() {
  let auth = localStorage.getItem("token");
  return auth !== null ? <Navigate to="/home" /> : <Outlet />;
}
