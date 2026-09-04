import { useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { FiArrowLeft, FiLock, FiVideo } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { readLearnerApiResponse } from "../../services/learnerApi";
import "./learnerLiveClass.css";

const API_BASE_URL = "https://builtright-backend-1.onrender.com";

function LearnerLiveClass() {
  const navigate = useNavigate();
  const meetingRootRef = useRef(null);
  const meetingClientRef = useRef(null);
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);
  const [message, setMessage] = useState("");

  const getZoomMessage = (error, fallback) =>
    error?.reason || error?.errorMessage || error?.message || fallback;

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
      const { default: ZoomMtgEmbedded } = await import("@zoom/meetingsdk/embedded");
      const client = meetingClientRef.current || ZoomMtgEmbedded.createClient();
      meetingClientRef.current = client;

      await client.init({
        zoomAppRoot: meetingRootRef.current,
        language: "en-US",
        patchJsMedia: true,
        leaveOnPageUnload: true,
        customize: {
          video: {
            isResizable: true,
            viewSizes: {
              default: { width: 980, height: 620 },
              ribbon: { width: 320, height: 720 },
            },
          },
        },
      });

      await client.join({
        signature: meeting.signature,
        meetingNumber: meeting.meetingNumber,
        password: meeting.passcode,
        userName: meeting.userName,
        userEmail: meeting.userEmail,
      });
      setJoined(true);
      setJoining(false);
    } catch (error) {
      setJoining(false);
      setJoined(false);
      setMessage(getZoomMessage(error, "Zoom could not open this class. Please reload the page and try again."));
    }
  };

  return (
    <main className="learner-live-page">
      <Helmet><title>Live Class | BuiltRight Training</title></Helmet>
      <button type="button" className="learner-live-back" onClick={() => navigate("/learner/portal")}>
        <FiArrowLeft /> Back to training portal
      </button>

      <section className={`learner-live-entry ${joined ? "is-hidden" : ""}`}>
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

      <section className={`learner-meeting-shell ${joined || joining ? "is-active" : ""}`} aria-live="polite">
        {joining && <div className="learner-meeting-loading"><span />Connecting securely to the live classroom…</div>}
        <div ref={meetingRootRef} className="learner-meeting-root" />
      </section>
    </main>
  );
}

export default LearnerLiveClass;
