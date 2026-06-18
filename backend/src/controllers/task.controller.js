const prisma = require('../utils/prisma');

function formatTask(task) {
  return {
    id: task.id,
    name: task.name,
    description: task.description,
    priority: task.priority,
    status: task.status,
    dueDate: task.dueDate,
    createdDate: task.createdAt,
    updatedAt: task.updatedAt,
    projectId: task.projectId,
    projectName: task.project?.name,
  };
}

async function verifyProjectOwnership(projectId, userId) {
  return prisma.project.findFirst({
    where: { id: projectId, userId },
  });
}

async function getTasks(req, res, next) {
  try {
    const {
      search,
      status,
      priority,
      projectId,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const where = {
      project: { userId: req.user.id },
      ...(projectId && { projectId }),
      ...(status && { status }),
      ...(priority && { priority }),
      ...(search && {
        name: { contains: search, mode: 'insensitive' },
      }),
    };

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const take = parseInt(limit, 10);

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
        include: { project: { select: { name: true } } },
      }),
      prisma.task.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        tasks: tasks.map(formatTask),
        pagination: {
          page: parseInt(page, 10),
          limit: take,
          total,
          totalPages: Math.ceil(total / take),
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

async function getTaskById(req, res, next) {
  try {
    const task = await prisma.task.findFirst({
      where: {
        id: req.params.id,
        project: { userId: req.user.id },
      },
      include: { project: { select: { name: true } } },
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    res.json({
      success: true,
      data: { task: formatTask(task) },
    });
  } catch (error) {
    next(error);
  }
}

async function createTask(req, res, next) {
  try {
    const { name, description, priority, status, dueDate, projectId } = req.body;

    const project = await verifyProjectOwnership(projectId, req.user.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    const task = await prisma.task.create({
      data: {
        name,
        description: description || null,
        priority: priority || 'MEDIUM',
        status: status || 'PENDING',
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId,
      },
      include: { project: { select: { name: true } } },
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: { task: formatTask(task) },
    });
  } catch (error) {
    next(error);
  }
}

async function updateTask(req, res, next) {
  try {
    const existing = await prisma.task.findFirst({
      where: {
        id: req.params.id,
        project: { userId: req.user.id },
      },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    const { name, description, priority, status, dueDate } = req.body;

    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description: description || null }),
        ...(priority !== undefined && { priority }),
        ...(status !== undefined && { status }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
      },
      include: { project: { select: { name: true } } },
    });

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: { task: formatTask(task) },
    });
  } catch (error) {
    next(error);
  }
}

async function deleteTask(req, res, next) {
  try {
    const existing = await prisma.task.findFirst({
      where: {
        id: req.params.id,
        project: { userId: req.user.id },
      },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    await prisma.task.delete({ where: { id: req.params.id } });

    res.json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};
