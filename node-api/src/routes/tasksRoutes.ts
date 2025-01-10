import { Router, Request, Response } from 'express';
import { TasksRepository } from '../repositories/tasksRepository';
import axios from 'axios';

const router = Router();
const tasksRepository = new TasksRepository();
const supportedLanguages = ['pt', 'en', 'es']; // Idiomas suportados

router.post('/', async (req: Request, res: Response) => {
  try {
    const { text, lang } = req.body;

    if (!text || !lang) {
      return res
        .status(400)
        .json({ error: 'The fields "text" and "lang" are required.' });
    }

    if (!supportedLanguages.includes(lang)) {
      return res.status(400).json({ error: 'Language not supported' });
    }

    const task = tasksRepository.createTask(text, lang);

    const pythonServiceUrl = 'http://localhost:8000/summarize';

    const response = await axios.post(pythonServiceUrl, { text, lang });

    const summary = response.data.summary;

    tasksRepository.updateTask(task.id, summary);

    return res.status(201).json({
      message: `Task #${task.id} created successfully!`,
    });
  } catch (error: any) {
    console.error('Error creating task:', error.message || error);

    if (error.response) {
      console.error('Python service error response:', error.response.data);
      return res.status(error.response.status).json({
        error: error.response.data.detail || 'Python service error',
      });
    }

    return res
      .status(500)
      .json({ error: 'An error occurred while creating the task.' });
  }
});

// GET: Lista todas as tarefas
router.get('/', (req, res) => {
  const tasks = tasksRepository.getAllTasks();

  if (tasks.length === 0) {
    return res.status(404).json({ message: 'No tasks found.' });
  }

  return res.json(tasks);
});

// GET: Obtém uma tarefa pelo ID
router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const task = tasksRepository.getTaskById(Number(id));

  if (!task) {
    return res.status(404).json({ error: 'Task not found.' });
  }

  return res.json(task);
});

// DELETE: Remove uma tarefa pelo ID
router.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const task = tasksRepository.getTaskById(Number(id));

  if (!task) {
    return res.status(404).json({ error: 'Task not found.' });
  }

  tasksRepository.deleteTask(Number(id));

  return res.status(200).json({
    message: `Task #${task.id} deleted successfully!`,
  });
});

export default router;
