import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { projectApi } from '../services/services';
import ProjectModal from '../components/ProjectModal';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import {
  PROJECT_STATUS_LABELS,
  formatDate,
  getErrorMessage,
  statusBadgeClass,
} from '../utils/helpers';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const { data } = await projectApi.getAll(params);
      setProjects(data.data.projects);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(fetchProjects, 300);
    return () => clearTimeout(timer);
  }, [fetchProjects]);

  const handleCreate = () => {
    setEditingProject(null);
    setModalOpen(true);
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project? All tasks will also be deleted.')) return;
    try {
      await projectApi.delete(id);
      fetchProjects();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      if (editingProject) {
        await projectApi.update(editingProject.id, formData);
      } else {
        await projectApi.create(formData);
      }
      setModalOpen(false);
      fetchProjects();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Projects</h2>
          <p className="page-subtitle">Manage your projects</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={handleCreate}>
          + New Project
        </button>
      </div>

      <Alert message={error} onClose={() => setError('')} />

      <div className="filters">
        <input
          type="text"
          placeholder="Search projects by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="NOT_STARTED">Not Started</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      {loading ? (
        <div className="page-center"><LoadingSpinner size="lg" /></div>
      ) : projects.length === 0 ? (
        <div className="empty-state">
          <p>No projects found. Create your first project to get started.</p>
          <button type="button" className="btn btn-primary" onClick={handleCreate}>
            Create Project
          </button>
        </div>
      ) : (
        <div className="card-grid">
          {projects.map((project) => (
            <div key={project.id} className="card">
              <div className="card-header">
                <Link to={`/projects/${project.id}`} className="card-title">
                  {project.name}
                </Link>
                <span className={statusBadgeClass(project.status)}>
                  {PROJECT_STATUS_LABELS[project.status]}
                </span>
              </div>
              {project.description && (
                <p className="card-desc">{project.description}</p>
              )}
              <div className="card-meta">
                <span>{project.taskCount ?? 0} tasks</span>
                <span>Created {formatDate(project.createdDate)}</span>
              </div>
              <div className="card-actions">
                <Link to={`/projects/${project.id}`} className="btn btn-outline btn-sm">View</Link>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => handleEdit(project)}>
                  Edit
                </button>
                <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(project.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ProjectModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        project={editingProject}
        loading={submitting}
      />
    </div>
  );
}
