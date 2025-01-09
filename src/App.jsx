import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import ProtectedLanding from "./components/ProtectedLanding";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Post from "./pages/Post";
import Inbox from "./pages/Inbox";
import Message from "./pages/Message";
import Search from "./pages/Search";
import Notifications from "./pages/Notifications";
function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route element={<ProtectedLanding />}>
            <Route exact path="/" element={<Landing />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route exact path="/home" element={<Home />}>
              <Route path="inbox" element={<Inbox />}>
                <Route path=":uid" element={<Message />} />
              </Route>
              <Route path="search" element={<Search />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="/home/:userId/posts/:postId" element={<Post />} />
              <Route path=":profile" element={<Profile />} />
            </Route>
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
