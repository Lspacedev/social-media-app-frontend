import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import parseJwt from "../utils/checkToken";
import SendMessage from "../components/Inbox/SendMessage";
import io from "socket.io-client";

function Message() {
  const [message, setMessage] = useState({});
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const { uid } = useParams();

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  useEffect(() => {
    parseJwt(token);
    getMessage();
  }, []);

  useEffect(() => {
    const socket = io.connect("http://localhost:3000");

    socket.on("reply-added", (message) => {
      setMessage(message);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnecting");
    });
  }, []);
  async function getMessage() {
    try {
      const res = await fetch(
        `http://localhost:3000/users/${userId}/messages/${uid}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();

      setMessage(data.message);
      setLoading(false);
    } catch (err) {
      console.log(err);
      setErr(err.message);
    }
  }

  if (loading) return <div>Loading...</div>;
  if (err !== "") return <div>{err}</div>;
  return (
    <div className="Message">
      {JSON.stringify(message) !== "{}" && (
        <div className="texts">
          {message.replies && message.replies.length > 0 ? (
            message.replies.map((reply, i) => (
              <div
                key={i}
                className={`text ${
                  reply.authorId != userId ? "left" : "right"
                }`}
              >
                <p
                  className={`text-content ${
                    reply.authorId != userId ? "left" : "right"
                  }`}
                >
                  {reply.text}
                </p>

                <p className="text-timestamp">
                  {new Date(reply.timestamp).toUTCString()}
                </p>
              </div>
            ))
          ) : (
            <div>No messages</div>
          )}
        </div>
      )}

      <SendMessage isReply={JSON.stringify(message) !== "{}" ? true : false} />
    </div>
  );
}

export default Message;
