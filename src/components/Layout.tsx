import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Footer from "./Footer";
import Navbar from "./Navbar";

function Layout() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
}

export default Layout;
