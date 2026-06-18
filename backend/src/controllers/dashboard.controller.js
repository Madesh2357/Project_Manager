const prisma = require('../utils/prisma');

async function getDashboardStats(req, res, next) {
  try {
    const userId = req.user.id;

    const [
      totalProjects,
      projectsInProgress,
      totalTasks,
      completedTasks,
      pendingTasks,
    ] = await Promise.all([
      prisma.project.count({ where: { userId } }),
      prisma.project.count({ where: { userId, status: 'IN_PROGRESS' } }),
      prisma.task.count({ where: { project: { userId } } }),
      prisma.task.count({ where: { project: { userId }, status: 'COMPLETED' } }),
      prisma.task.count({ where: { project: { userId }, status: 'PENDING' } }),
    ]);

    res.json({
      success: true,
      data: {
        totalProjects,
        totalTasks,
        completedTasks,
        pendingTasks,
        projectsInProgress,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getDashboardStats };
