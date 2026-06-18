import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../services/services';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import { getErrorMessage } from '../utils/helpers';

const statCards = [
  { key: 'totalProjects', label: 'Total Projects', icon: '📁', color: 'blue' },
  { key: 'totalTasks', label: 'Total Tasks', icon: '✅', color: 'purple' },
  { key: 'completedTasks', label: 'Completed Tasks', icon: '✔️', color: 'green' },
  { key: 'pendingTasks', label: 'Pending Tasks', icon: '⏳', color: 'yellow' },
  { key: 'projectsInProgress', label: 'Projects In Progress', icon: '🚀', color: 'orange' },
];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await dashboardApi.getStats();
        setStats(data.data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="page-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2>Dashboard</h2>
        <p className="page-subtitle">Overview of your projects and tasks</p>
      </div>
      <Alert message={error} onClose={() => setError('')} />
      <div className="stats-grid">
        {statCards.map(({ key, label, icon, color }) => (
          <div key={key} className={`stat-card stat-${color}`}>
            <span className="stat-icon">{icon}</span>
            <div className="stat-content">
              <span className="stat-value">{stats?.[key] ?? 0}</span>
              <span className="stat-label">{label}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="action-buttons">
          <Link to="/projects" className="btn btn-primary">View Projects</Link>
          <Link to="/tasks" className="btn btn-outline">View Tasks</Link>
        </div>
      </div>
    </div>
  );
}
