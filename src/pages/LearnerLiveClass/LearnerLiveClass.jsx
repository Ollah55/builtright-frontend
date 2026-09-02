import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { FiArrowLeft, FiLock, FiVideo } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { readLearnerApiResponse } from "../../services/learnerApi";
import "./learnerLiveClass.css";

const API_BASE_URL = "https://builtright-backend-1.onrender.com";

function LearnerLiveClass() {
  const navigate = useNavigate();
  const [joining, setJoining] = useState(false);
  const [message, setMessage] = useState("");

  const enterClassroom = async () => {
    try {
      setJoining(true);
      setMessage("");

      const response = await fetch(`${API_BASE_URL}/api/learner/zoom-signature`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("learnerToken")}`,
        },
      });
      const meeting = await readLearnerApiResponse(response, "Could not open the live classroom.");
      const { ZoomMtg } = await import("@zoom/meetingsdk");

      ZoomMtg.preLoadWasm();
      ZoomMtg.prepareWebSDK();
      ZoomMtg.init({
        leaveUrl: `${window.location.origin}/learner/portal`,
        patchJsMedia: true,
        leaveOnPageUnload: true,
        disableInvite: true,
        screenShare: false,
        meetingInfo: ["topic", "host", "participant"],
        success: () => {
          ZoomMtg.join({
            signature: meeting.signature,
            meetingNumber: meeting.meetingNumber,
            passWord: meeting.passcode,
            userName: meeting.userName,
            userEmail: meeting.userEmail,
            success: () => setJoining(false),
            error: (error) => {
              setJoining(false);
              setMessage(error?.reason || error?.errorMessage || "Zoom could not join this class.");
            },
          });
        },
        error: (error) => {
          setJoining(false);
          setMessage(error?.reason || error?.errorMessage || "Zoom could not start in this browser.");
        },
      });
    } catch (error) {
      setJoining(false);
      setMessage(error.message);
    }
  };

  return (
    <main className="learner-live-page">
      <Helmet><title>Live Class | BuiltRight Training</title></Helmet>
      <button type="button" className="learner-live-back" onClick={() => navigate("/learner/portal")}>
        <FiArrowLeft /> Back to training portal
      </button>

      <section className="learner-live-entry">
        <div className="learner-live-icon"><FiVideo /></div>
        <p className="learner-live-kicker">BuiltRight private classroom</p>
        <h1>Join today&apos;s live solar class</h1>
        <p>
          The class will open inside this secure learner page. Allow microphone and camera access when your
          browser asks.
        </p>
        <div className="learner-live-security"><FiLock /> Access is verified using your learner account.</div>
        {message && <p className="learner-live-message">{message}</p>}
        <button type="button" className="learner-live-join" onClick={enterClassroom} disabled={joining}>
          <FiVideo /> {joining ? "Opening classroom..." : "Enter classroom"}
        </button>
        <small>Classes run Monday–Friday, 10:00–16:00 WAT.</small>
      </section>
    </main>
  );
}

export default LearnerLiveClass;
