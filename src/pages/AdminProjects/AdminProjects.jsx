import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowUpRight,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiMapPin,
  FiPackage,
  FiSearch,
  FiTool,
  FiTruck,
  FiUser,
} from "react-icons/fi";
import AdminLayout from "../../components/AdminLayout/AdminLayout";
import { getStageIndex } from "../../lib/operations";
import "./adminProjects.css";

const API_BASE_URL = "https://builtright-backend-1.onrender.com";

const projectLanes = [
  { id: "all", label: "All projects" },
  { id: "finance", label: "Finance release" },
  { id: "delivery", label: "Delivery" },
  { id: "installation", label: "Installation" },
  { id: "commissioning", label: "Commissioning" },
];

const milestones = [
  { id: "inspection", label: "Inspection", icon: FiFileText },
  { id: "quotation", label: "Quotation", icon: FiCheckCircle },
  { id: "order", label: "Order", icon: FiPackage },
  { id: "delivery", label: "Delivery", icon: FiTruck },
  { id: "installation", label: "Installation", icon: FiTool },
  { id: "commissioning", label: "Commissioning", icon: FiCheckCircle },
];

const laneProgress = { finance: 2, delivery: 3, installation: 4, commissioning: 5 };

function toProject(request) {
  const status = request.status || "submitted";
  const lane = status === "completed"
    ? "commissioning"
    : ["installation-scheduled", "installation-in-progress"].includes(status)
      ? "installation"
      : status === "order-created"
        ? "delivery"
        : "finance";
  const stage = status.split("-").map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`).join(" ");
  return {
    id: request.reference || request._id,
    requestId: request._id,
    customer: request.customer?.fullName || "Customer not recorded",
    location: request.customer?.location || "Site not recorded",
    system: request.systemCapacity || request.systemName || request.items?.[0]?.name || "System pending",
    stage,
    lane,
    delivery: request.deliveryStatus || (getStageIndex(status) >= getStageIndex("order-created") ? "Processing" : "Not released"),
    installation: request.installationStatus || (status === "completed" ? "Completed" : status === "installation-in-progress" ? "In progress" : status === "installation-scheduled" ? "Scheduled" : "Not scheduled"),
    owner: request.installerAssignment?.installerName || "Awaiting assignment",
    updated: request.updatedAt ? new Date(request.updatedAt).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" }) : "Not updated",
  };
}

function AdminProjects() {
  const navigate = useNavigate();
  const [lane, setLane] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [projectRecords, setProjectRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const token = localStorage.getItem("builtright_admin_token") || localStorage.getItem("adminToken");
        const response = await fetch(`${API_BASE_URL}/api/loan-requests`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await response.json();
        if (!response.ok || !data.status) throw new Error(data.message || "Could not load projects.");
        setProjectRecords((data.loanRequests || [])
          .filter((request) => getStageIndex(request.status) >= getStageIndex("quotation-approved"))
          .map(toProject));
      } catch (error) {
        setMessage(error.message || "Could not load projects.");
      } finally {
        setLoading(false);
      }
    };
    loadProjects();
  }, []);

  const projects = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();
    return projectRecords.filter((project) => {
      const matchesLane = lane === "all" || project.lane === lane;
      const matchesSearch = !search || [project.id, project.customer, project.location, project.system].some((value) => value.toLowerCase().includes(search));
      return matchesLane && matchesSearch;
    });
  }, [lane, projectRecords, searchTerm]);

  const summary = {
    inspections: projectRecords.filter((project) => project.owner !== "Awaiting assignment").length,
    release: projectRecords.filter((project) => project.lane === "finance").length,
    delivery: projectRecords.filter((project) => project.lane === "delivery").length,
    onsite: projectRecords.filter((project) => ["installation", "commissioning"].includes(project.lane)).length,
  };

  return (
    <AdminLayout
      title="Solar projects"
      subtitle="Coordinate the work that begins after site inspection and verified financing: quotation, order release, delivery, installation, testing, and commissioning."
      actions={<button type="button" className="ops-button primary" onClick={() => navigate("/admin/loan-requests")}><FiCalendar /> Open assessment queue</button>}
    >
      {message && <div className="finance-message" role="status">{message}</div>}
      <section className="project-summary-grid">
        <article><span><FiFileText /></span><div><p>Assigned projects</p><strong>{summary.inspections}</strong><small>With a responsible installer</small></div></article>
        <article><span><FiPackage /></span><div><p>Finance release</p><strong>{summary.release}</strong><small>Requires payment or disbursement progress</small></div></article>
        <article><span><FiTruck /></span><div><p>In delivery</p><strong>{summary.delivery}</strong><small>Orders released for fulfilment</small></div></article>
        <article><span><FiTool /></span><div><p>On site or complete</p><strong>{summary.onsite}</strong><small>Installation through commissioning</small></div></article>
      </section>

      <section className="project-toolbar">
        <div className="finance-search"><FiSearch /><input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search project, customer, site or system" /></div>
        <div className="project-lane-tabs">
          {projectLanes.map((item) => <button type="button" key={item.id} className={lane === item.id ? "active" : ""} onClick={() => setLane(item.id)}>{item.label}</button>)}
        </div>
      </section>

      <section className="project-board">
        {projects.map((project) => {
          const activeMilestone = laneProgress[project.lane] ?? 0;
          return (
            <article className="project-card" key={project.id}>
              <div className="project-card-head">
                <div className="project-ref"><span>{project.id}</span><strong>{project.customer}</strong><small><FiMapPin /> {project.location}</small></div>
                <i className={`project-stage ${project.lane}`}>{project.stage}</i>
              </div>

              <div className="project-system-row">
                <div><p>System</p><strong>{project.system}</strong></div>
                <div><p>Delivery</p><strong>{project.delivery}</strong></div>
                <div><p>Installation</p><strong>{project.installation}</strong></div>
                <div><p>Project owner</p><strong><FiUser /> {project.owner}</strong></div>
              </div>

              <div className="project-milestones">
                {milestones.map((milestone, index) => {
                  const Icon = milestone.icon;
                  const complete = index <= activeMilestone;
                  return (
                    <div className={complete ? "complete" : ""} key={milestone.id}>
                      <span><Icon /></span>
                      <p>{milestone.label}</p>
                    </div>
                  );
                })}
              </div>

              <footer className="project-card-footer">
                <span><FiClock /> Updated {project.updated}</span>
                <button type="button" onClick={() => navigate(`/admin/loan-requests/${project.requestId}`)}>Open project <FiArrowUpRight /></button>
              </footer>
            </article>
          );
        })}
        {!loading && projects.length === 0 && (
          <article className="project-card"><h2>No operational projects yet</h2><p>Projects appear here after a customer approves the final quotation.</p></article>
        )}
      </section>
    </AdminLayout>
  );
}

export default AdminProjects;
