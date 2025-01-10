import { useState } from "react";
import { useNavigate } from "react-router";

import Signin from "../components/Forms/SignIn";
import SignUp from "../components/Forms/SignUp";

function Landing() {
  const [signInOpen, setSignInOpen] = useState(false);
  const [signUpOpen, setSignUpOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const navigation = useNavigate();

  async function guestSignIn() {
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_PROD_URL}/guest-log-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Content-length": 0 },
      });
      const data = await res.json();
      setLoading(false);
      if (typeof data.errors !== "undefined") {
        setErrors(data.errors);
      } else {
        alert(data.message);
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.userId);
        navigation("/home");
      }
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div className="Landing" style={landing}>
      {signInOpen && (
        <div className="Modal">
          <Signin closeForm={() => setSignInOpen(false)} />
        </div>
      )}
      {signUpOpen && (
        <div className="Modal">
          <SignUp closeForm={() => setSignUpOpen(false)} />
        </div>
      )}
      <div
        className="landing-image"
        style={{
          flex: 1,
          height: "inherit",
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          padding: 0,
        }}
      >
        <div style={logo}>R</div>
      </div>
      <div
        className="landing-content"
        style={{
          flex: 1,
          height: "inherit",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
        }}
      >
        <h1
          style={{
            color: "#E6E8E6",
            fontSize: "6rem",
            fontWeight: "bold",
            margin: "0px",
          }}
        >
          Ode to Express
        </h1>
        <h2
          style={{
            color: "#E6E8E6",
            fontSize: "2.5rem",
            fontWeight: "bold",
            marginBottom: "20px",
          }}
        >
          Join Now!
        </h2>
        <div style={{ marginBottom: "10px" }}>
          <button className="register-btn" onClick={() => setSignUpOpen(true)}>
            Create account
          </button>
          <p
            style={{
              color: "#E6E8E6",
              fontSize: "0.7rem",
            }}
          >
            By signing up, you agree to the Terms of Service and Privacy Policy,
            including Cookie Use.
          </p>
        </div>
        <div style={{ marginTop: "2rem" }}>
          <p
            style={{
              color: "#E6E8E6",
              fontSize: "1.3rem",
              fontWeight: "bold",
            }}
          >
            Already have an account?
          </p>
          <button className="signin-btn" onClick={() => setSignInOpen(true)}>
            Sign in
          </button>
          <br />
          <br />
          <button
            className="guest-signin-btn"
            onClick={() => (loading ? console.log("loading") : guestSignIn())}
          >
            {loading ? <div>Loading...</div> : <div>Guest sign in</div>}
          </button>
        </div>
      </div>
    </div>
  );
}
const landing = {
  height: "inherit",
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "black",
  margin: "0px",
  padding: "0px",
};
const logo = {
  fontSize: "42rem",
  fontWeight: "400",
  fontStyle: "normal",
  fontFamily: "Silkscreen, serif",
  WebkitTextStroke: "3px #E6E8E6",
};
export default Landing;
