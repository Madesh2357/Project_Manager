const prisma = require('../utils/prisma');

function formatProject(project) {
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    status: project.status,
    startDate: project.startDate,
    endDate: project.endDate,
    createdDate: project.createdAt,
    updatedAt: project.updatedAt,
    taskCount: project._count?.tasks,
  };
}

async function getProjects(req, res, next) {
  try {
    const {
      search,
      status,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const where = {
      userId: req.user.id,
      ...(status && { status }),
      ...(search && {
        name: { contains: search, mode: 'insensitive' },
      }),
    };

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const take = parseInt(limit, 10);

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
        include: { _count: { select: { tasks: true } } },
      }),
      prisma.project.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        projects: projects.map(formatProject),
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

async function getProjectById(req, res, next) {
  try {
    const project = await prisma.project.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: {
        tasks: { orderBy: { createdAt: 'desc' } },
        _count: { select: { tasks: true } },
      },
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    res.json({
      success: true,
      data: {
        project: {
          ...formatProject(project),
          tasks: project.tasks.map((t) => ({
            id: t.id,
            name: t.name,
            description: t.description,
            priority: t.priority,
            status: t.status,
            dueDate: t.dueDate,
            createdDate: t.createdAt,
          })),
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

async function createProject(req, res, next) {
  try {
    const { name, description, status, startDate, endDate } = req.body;

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({
        success: false,
        message: 'Start date cannot be after end date',
      });
    }

    const project = await prisma.project.create({
      data: {
        name,
        description: description || null,
        status: status || 'NOT_STARTED',
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        userId: req.user.id,
      },
      include: { _count: { select: { tasks: true } } },
    });

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: { project: formatProject(project) },
    });
  } catch (error) {
    next(error);
  }
}

async function updateProject(req, res, next) {
  try {
    const existing = await prisma.project.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    const { name, description, status, startDate, endDate } = req.body;
    const newStart = startDate !== undefined ? (startDate ? new Date(startDate) : null) : existing.startDate;
    const newEnd = endDate !== undefined ? (endDate ? new Date(endDate) : null) : existing.endDate;

    if (newStart && newEnd && newStart > newEnd) {
      return res.status(400).json({
        success: false,
        message: 'Start date cannot be after end date',
      });
    }

    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description: description || null }),
        ...(status !== undefined && { status }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
      },
      include: { _count: { select: { tasks: true } } },
    });

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: { project: formatProject(project) },
    });
  } catch (error) {
    next(error);
  }
}

async function deleteProject(req, res, next) {
  try {
    const existing = await prisma.project.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    await prisma.project.delete({ where: { id: req.params.id } });

    res.json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
};
