import { useEffect, useState } from "react";
import { useParams, Outlet } from "react-router-dom";
import MsgContainer from "../components/Inbox/MsgContainer";
import io from "socket.io-client";
import parseJwt from "../utils/checkToken";

function Inbox() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const { uid } = useParams();
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  useEffect(() => {
    parseJwt(token);
    getMessages();
  }, []);

  async function getMessages() {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_PROD_URL}/users/${userId}/messages`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      setMessages(data.messages);
      setLoading(false);
    } catch (err) {
      console.log(err);
      setErr(err.message);
    }
  }
  if (loading)
    return (
      <div
        style={{
          color: "#e6e8e6",
          flex: 2,
          height: "100vh",
          width: "100vw",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Loading...
      </div>
    );
  if (err !== "") return <div>{err}</div>;
  return (
    <div className="Inbox">
      {typeof uid === "undefined" ? (
        <div className="messages">
          {messages.length > 0 ? (
            messages.map((message, i) => (
              <MsgContainer key={i} message={message} />
            ))
          ) : (
            <div
              style={{
                color: "#e6e8e6",
                textAlign: "center",
                margin: "10px",
              }}
            >
              No messages
            </div>
          )}
        </div>
      ) : (
        <Outlet />
      )}
    </div>
  );
}

export default Inbox;
