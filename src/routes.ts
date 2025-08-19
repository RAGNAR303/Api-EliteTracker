import { Router } from 'express';
import packageJson from '../package.json';
import { HabitsController } from './contollers/habits.controller';
import { FocusTimeController } from './contollers/focus-time.controller';
import { AuthController } from './contollers/auth.controller';

export const routes = Router();

const habitsController = new HabitsController();
const focusTimeController = new FocusTimeController();
const authcontroller = new AuthController();

routes.get('/', (request, response) => {
  const { name, description, version } = packageJson;

  return response.status(200).json({ name, description, version });
});

routes.get('/auth', authcontroller.auth);

routes.get('/auth/callback', authcontroller.authCallback);

// Rota para listar(index) os hábitos que foi cadastrado
routes.get('/habits', habitsController.index);

routes.get('/habits/:id/metrics', habitsController.metrics);

// Rota para criação(store) de hábitos
routes.post('/habits', habitsController.store);

// Rota para Detetar(remove) de hábitos
routes.delete('/habits/:id', habitsController.remove);

// Rota para Patch(toggle) de hábitos marcar/desmarcar
routes.patch('/habits/:id/toggle', habitsController.toggle);

// Rota para criação de tempos de foco
routes.post('/focus-time', focusTimeController.store);
// Rota para criação de tempos de foco
routes.get('/focus-time', focusTimeController.index);

routes.get('/focus-time/metrics', focusTimeController.metricsByMonth);
