import { useState, useEffect, useCallback } from 'react';
import { projectApi, taskApi } from '../services/services';
import TaskModal from '../components/TaskModal';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import {
  TASK_STATUS_LABELS,
  TASK_PRIORITY_LABELS,
  formatDate,
  getErrorMessage,
  statusBadgeClass,
} from '../utils/helpers';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [defaultProjectId, setDefaultProjectId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      const { data } = await taskApi.getAll(params);
      setTasks(data.data.tasks);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, priorityFilter]);

  useEffect(() => {
    projectApi.getAll({ limit: 100 }).then(({ data }) => {
      const loadedProjects = data.data.projects;
      setProjects(loadedProjects);
      if (loadedProjects.length === 1) {
        setDefaultProjectId(loadedProjects[0].id);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(fetchTasks, 300);
    return () => clearTimeout(timer);
  }, [fetchTasks]);

  const handleCreate = () => {
    setEditingTask(null);
    setModalOpen(true);
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await taskApi.delete(id);
      fetchTasks();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleMarkComplete = async (task) => {
    try {
      await taskApi.update(task.id, { status: 'COMPLETED' });
      fetchTasks();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      if (editingTask) {
        await taskApi.update(editingTask.id, formData);
      } else {
        await taskApi.create(formData);
        setDefaultProjectId(formData.projectId);
      }
      setModalOpen(false);
      fetchTasks();
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
          <h2>Tasks</h2>
          <p className="page-subtitle">Manage all your tasks</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={handleCreate}>
          + New Task
        </button>
      </div>

      <Alert message={error} onClose={() => setError('')} />

      <div className="filters">
        <input
          type="text"
          placeholder="Search tasks by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>
        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
          <option value="">All Priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>
      </div>

      {loading ? (
        <div className="page-center"><LoadingSpinner size="lg" /></div>
      ) : tasks.length === 0 ? (
        <div className="empty-state">
          <p>No tasks found.</p>
          <button type="button" className="btn btn-primary" onClick={handleCreate}>
            Create Task
          </button>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Task</th>
                <th>Project</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Due Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id}>
                  <td>
                    <strong>{task.name}</strong>
                    {task.description && <p className="table-desc">{task.description}</p>}
                  </td>
                  <td>{task.projectName}</td>
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
                      onClick={() => handleEdit(task)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(task.id)}
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

      <TaskModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        task={editingTask}
        projects={projects}
        defaultProjectId={defaultProjectId}
        loading={submitting}
      />
    </div>
  );
}
