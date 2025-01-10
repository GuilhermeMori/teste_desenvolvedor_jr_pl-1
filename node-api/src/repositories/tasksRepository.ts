import fs from 'fs';
import path from 'path';

interface Task {
  id: number;
  text: string;
  summary: string | null;
  lang: string; // Adicionando o campo lang
}

export class TasksRepository {
  private tasks: Task[] = [];
  private currentId: number = 1;
  private readonly filePath: string;

  constructor() {
    this.filePath = path.join(__dirname, '../../data/tasks.json');
    this.ensureFileExists(); // Garantir que o arquivo e o diretório existam
    this.loadTasksFromFile();
  }

  // Garantir que o arquivo e o diretório existam
  private ensureFileExists(): void {
    const directory = path.dirname(this.filePath);

    // Cria o diretório se ele não existir
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
      console.log(`Diretório criado: ${directory}`);
    }

    // Cria o arquivo vazio se ele não existir
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, '[]', 'utf-8');
      console.log(`Arquivo criado: ${this.filePath}`);
    }
  }

  // Carregar as tarefas do arquivo JSON
  private loadTasksFromFile(): void {
    try {
      const fileContent = fs.readFileSync(this.filePath, 'utf-8');
      this.tasks = JSON.parse(fileContent) || [];
      this.currentId =
        this.tasks.length > 0 ? this.tasks[this.tasks.length - 1].id + 1 : 1;
    } catch (error) {
      console.error('Erro ao carregar tarefas do arquivo:', error);
      this.tasks = [];
      this.currentId = 1;
    }
  }

  // Salvar as tarefas no arquivo JSON
  private saveTasksToFile(): void {
    try {
      fs.writeFileSync(
        this.filePath,
        JSON.stringify(this.tasks, null, 2),
        'utf-8',
      );
    } catch (error) {
      console.error('Erro ao salvar tarefas no arquivo:', error);
    }
  }

  createTask(text: string, lang: string): Task {
    const task: Task = {
      id: this.currentId++,
      text,
      summary: null,
      lang, // Salvando o idioma da tarefa
    };
    this.tasks.push(task);
    this.saveTasksToFile();
    return task;
  }

  updateTask(id: number, summary: string): Task | null {
    const taskIndex = this.tasks.findIndex((t) => t.id === id);
    if (taskIndex > -1) {
      this.tasks[taskIndex].summary = summary;
      this.saveTasksToFile();
      return this.tasks[taskIndex];
    }
    return null;
  }

  getTaskById(id: number): Task | null {
    return this.tasks.find((t) => t.id === id) || null;
  }

  getAllTasks(): Task[] {
    return this.tasks;
  }

  deleteTask(id: number): boolean {
    const taskIndex = this.tasks.findIndex((t) => t.id === id);
    if (taskIndex > -1) {
      this.tasks.splice(taskIndex, 1);
      this.saveTasksToFile();
      return true;
    }
    return false;
  }
}
