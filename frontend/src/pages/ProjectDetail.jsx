import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectApi, taskApi } from '../services/services';
import ProjectModal from '../components/ProjectModal';
import TaskModal from '../components/TaskModal';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import {
  PROJECT_STATUS_LABELS,
  TASK_STATUS_LABELS,
  TASK_PRIORITY_LABELS,
  formatDate,
  getErrorMessage,
  statusBadgeClass,
} from '../utils/helpers';

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchProject = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await projectApi.getById(id);
      setProject(data.data.project);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const handleProjectUpdate = async (formData) => {
    setSubmitting(true);
    try {
      await projectApi.update(id, formData);
      setProjectModalOpen(false);
      fetchProject();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleTaskSubmit = async (formData) => {
    setSubmitting(true);
    try {
      if (editingTask) {
        await taskApi.update(editingTask.id, formData);
      } else {
        await taskApi.create(formData);
      }
      setTaskModalOpen(false);
      setEditingTask(null);
      fetchProject();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleTaskDelete = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await taskApi.delete(taskId);
      fetchProject();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleMarkComplete = async (task) => {
    try {
      await taskApi.update(task.id, { status: 'COMPLETED' });
      fetchProject();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (loading) {
    return <div className="page-center"><LoadingSpinner size="lg" /></div>;
  }

  if (!project) {
    return (
      <div className="page">
        <Alert message={error || 'Project not found'} />
        <Link to="/projects" className="btn btn-outline">Back to Projects</Link>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="breadcrumb">
        <Link to="/projects">Projects</Link> / <span>{project.name}</span>
      </div>

      <Alert message={error} onClose={() => setError('')} />

      <div className="detail-header">
        <div>
          <h2>{project.name}</h2>
          <span className={statusBadgeClass(project.status)}>
            {PROJECT_STATUS_LABELS[project.status]}
          </span>
        </div>
        <button type="button" className="btn btn-outline" onClick={() => setProjectModalOpen(true)}>
          Edit Project
        </button>
      </div>

      {project.description && <p className="detail-desc">{project.description}</p>}

      <div className="detail-meta">
        <span>Start: {formatDate(project.startDate)}</span>
        <span>End: {formatDate(project.endDate)}</span>
        <span>Created: {formatDate(project.createdDate)}</span>
      </div>

      <div className="section-header">
        <h3>Tasks ({project.tasks?.length ?? 0})</h3>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => { setEditingTask(null); setTaskModalOpen(true); }}
        >
          + Add Task
        </button>
      </div>

      {!project.tasks?.length ? (
        <div className="empty-state">
          <p>No tasks yet. Add your first task to this project.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Task</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Due Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {project.tasks.map((task) => (
                <tr key={task.id}>
                  <td>
                    <strong>{task.name}</strong>
                    {task.description && <p className="table-desc">{task.description}</p>}
                  </td>
                  <td>
                    <span className={statusBadgeClass(task.priority)}>
                      {TASK_PRIORITY_LABELS[task.priority]}
                    </span>
                  </td>
                  <td>
                    <span className={statusBadgeClass(task.status)}>
                      {TASK_STATUS_LABELS[task.status]}
                    </span>
                  </td>
                  <td>{formatDate(task.dueDate)}</td>
                  <td className="table-actions">
                    {task.status !== 'COMPLETED' && (
                      <button
                        type="button"
                        className="btn btn-success btn-sm"
                        onClick={() => handleMarkComplete(task)}
                      >
                        Complete
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => { setEditingTask(task); setTaskModalOpen(true); }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => handleTaskDelete(task.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ProjectModal
        isOpen={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
        onSubmit={handleProjectUpdate}
        project={project}
        loading={submitting}
      />

      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => { setTaskModalOpen(false); setEditingTask(null); }}
        onSubmit={handleTaskSubmit}
        task={editingTask}
        projects={[{ id: project.id, name: project.name }]}
        defaultProjectId={project.id}
        loading={submitting}
      />
    </div>
  );
}
