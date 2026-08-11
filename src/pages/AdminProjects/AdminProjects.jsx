import React, { useMemo, useState } from "react";
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
import { demoProjects } from "../../lib/operations";
import "./adminProjects.css";

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

function AdminProjects() {
  const [lane, setLane] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const projects = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();
    return demoProjects.filter((project) => {
      const matchesLane = lane === "all" || project.lane === lane;
      const matchesSearch = !search || [project.id, project.customer, project.location, project.system].some((value) => value.toLowerCase().includes(search));
      return matchesLane && matchesSearch;
    });
  }, [lane, searchTerm]);

  return (
    <AdminLayout
      title="Solar projects"
      subtitle="Coordinate the work that begins after site inspection and verified financing: quotation, order release, delivery, installation, testing, and commissioning."
      actions={<button type="button" className="ops-button primary"><FiCalendar /> Schedule inspection</button>}
    >
      <section className="project-summary-grid">
        <article><span><FiFileText /></span><div><p>Inspections this week</p><strong>6</strong><small>2 awaiting assignment</small></div></article>
        <article><span><FiPackage /></span><div><p>Ready for release</p><strong>3</strong><small>Requires disbursement check</small></div></article>
        <article><span><FiTruck /></span><div><p>In delivery</p><strong>2</strong><small>1 due today</small></div></article>
        <article><span><FiTool /></span><div><p>On site</p><strong>3</strong><small>Installation or testing</small></div></article>
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
                <button type="button">Open project <FiArrowUpRight /></button>
              </footer>
            </article>
          );
        })}
      </section>
    </AdminLayout>
  );
}

export default AdminProjects;
