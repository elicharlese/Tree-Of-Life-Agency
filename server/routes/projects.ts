import express from 'express';
import { 
  getProjects, 
  getProject, 
  createProject, 
  updateProject, 
  updateProjectStatus,
  getProjectMilestones,
  addProjectMilestone,
  assignDevelopers
} from '../controllers/projectController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.route('/')
  .get(getProjects)
  .post(createProject);

router.route('/:id')
  .get(getProject)
  .put(updateProject);

router.put('/:id/status', updateProjectStatus);
router.get('/:id/milestones', getProjectMilestones);
router.post('/:id/milestones', addProjectMilestone);
router.put('/:id/assign', assignDevelopers);

export default router;
