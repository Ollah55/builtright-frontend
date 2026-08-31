import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { FiBookOpen, FiCalendar, FiDownload, FiLogOut, FiPlay, FiClock } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import "./learnerPortal.css";
import { readLearnerApiResponse } from "../../services/learnerApi";

const API_BASE_URL = "https://builtright-backend-1.onrender.com";

function LearnerPortal() {
  const navigate = useNavigate();
  const [portal, setPortal] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("learnerToken");
    fetch(`${API_BASE_URL}/api/learner/portal`, { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => readLearnerApiResponse(response, "Could not load your portal."))
      .then(setPortal)
      .catch((error) => { setMessage(error.message); if (/token|unauthor/i.test(error.message)) navigate("/learner/login"); })
      .finally(() => setLoading(false));
  }, [navigate]);

  const logout = () => { localStorage.removeItem("learnerToken"); localStorage.removeItem("learnerUser"); navigate("/learner/login"); };
  const cohort = portal?.cohort;
  const dateRange = cohort?.startDate ? `${new Date(cohort.startDate).toLocaleDateString("en-GB", { dateStyle: "medium" })} – ${cohort.endDate ? new Date(cohort.endDate).toLocaleDateString("en-GB", { dateStyle: "medium" }) : "ongoing"}` : "One active cohort · 1 month";

  if (loading) return <main className="learner-portal-page"><div className="learner-portal-loading">Loading your training portal...</div></main>;
  if (!portal) return <main className="learner-portal-page"><div className="learner-portal-error">{message || "Your portal could not be loaded."}<button type="button" onClick={() => window.location.reload()}>Try again</button></div></main>;

  return <main className="learner-portal-page"><Helmet><title>Training Portal | BuiltRight</title></Helmet><header className="learner-portal-header"><div><p className="learner-eyebrow">BuiltRight virtual training</p><h1>Welcome, {portal.learner.fullName}</h1><p>{cohort.name}</p></div><button type="button" className="learner-logout" onClick={logout}><FiLogOut /> Sign out</button></header><section className="learner-portal-summary"><article><FiCalendar /><span>Cohort dates</span><strong>{dateRange}</strong></article><article><FiClock /><span>Class schedule</span><strong>{cohort.schedule}</strong></article><article><FiBookOpen /><span>Access</span><strong>Curriculum and resources</strong></article></section><section className="learner-portal-grid"><article className="learner-portal-card learner-live-card"><div><p className="learner-card-kicker">Live classroom</p><h2>Join the live class</h2><p>Classes run Monday to Friday from 10:00 to 16:00 WAT. Your join button will activate when the live-session link is configured.</p></div>{cohort.liveUrl ? <a className="learner-primary-button" href={cohort.liveUrl} target="_blank" rel="noreferrer"><FiPlay /> Join live class</a> : <button type="button" className="learner-primary-button is-disabled" disabled><FiPlay /> Live link pending</button>}</article><article className="learner-portal-card"><p className="learner-card-kicker">Course resource</p><h2>Training brochure</h2><p>Download the curriculum or brochure supplied for your active cohort.</p>{cohort.brochureUrl ? <a className="learner-secondary-button" href={cohort.brochureUrl} target="_blank" rel="noreferrer"><FiDownload /> Download brochure</a> : <span className="learner-resource-note">The brochure will appear here when it is uploaded.</span>}</article></section><section className="learner-curriculum"><div className="learner-section-heading"><div><p className="learner-card-kicker">Your course map</p><h2>Curriculum</h2></div><span>One active cohort · four weeks</span></div><div className="learner-curriculum-grid">{cohort.curriculum.map((unit) => <article key={unit.week}><span>{unit.week}</span><h3>{unit.title}</h3><ul>{unit.topics.map((topic) => <li key={topic}>{topic}</li>)}</ul></article>)}</div></section></main>;
}

export default LearnerPortal;
