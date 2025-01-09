import SideNavigation from "../components/Home/SideNavigation/SideNavigation";
import Search from "../components/Home/Search/Search";
import Feed from "../components/Home/Feed/Feed";
import { Outlet } from "react-router-dom";
import { useParams, useLocation } from "react-router";
function Home() {
  const { profile, postId, uid } = useParams();
  const location = useLocation();
  const { pathname } = location;

  return (
    <div className="Home">
      <SideNavigation />
      {typeof profile === "undefined" &&
      typeof postId === "undefined" &&
      pathname !== "/home/inbox" &&
      typeof uid === "undefined" &&
      pathname !== "/home/search" &&
      pathname !== "/home/notifications" ? (
        <Feed />
      ) : (
        <Outlet />
      )}

      <Search />
    </div>
  );
}

export default Home;
