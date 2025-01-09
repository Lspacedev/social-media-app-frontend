import { useNavigate } from "react-router";

function MsgContainer({ message }) {
  const navigation = useNavigate();
  let userId = localStorage.getItem("userId");

  function goToMessage() {
    let senderId = message.senderId;
    let receiverId = message.receiverId;
    let id = Number(userId) === senderId ? receiverId : senderId;
    navigation(`/home/inbox/${message.id}`);
  }
  function formateTimestamp(date) {
    const d = new Date(date).toDateString();
    return d;
  }
  return (
    <div className="MsgContainer" onClick={goToMessage}>
      <h4>
        {message.senderId === Number(userId)
          ? message.receiverUsername
          : message.senderUsername}
      </h4>
      <p>{formateTimestamp(message.timestamp)}</p>
    </div>
  );
}

export default MsgContainer;
