import { request, Request, Response } from 'express';
import { habitModel } from '../model/habits.model';
import z, { date } from 'zod';
import { buildValidationErrorMessage } from '../utils/build-validation-error-message.util';
import dayjs from 'dayjs';
import mongoose from 'mongoose';

export class HabitsController {
  // "store"(post) rota para criação de um Habits
  store = async (request: Request, response: Response): Promise<Response> => {
    const schema = z.object({
      name: z.string(),
    });

    //

    const habit = schema.safeParse(request.body);
    // Retorna uma messagem erro em enviar o informação do nome errado
    if (!habit.success) {
      const errors = buildValidationErrorMessage(habit.error.issues);

      return response.status(422).json({ message: errors });
    }

    // Procurando no banco a "habits "e colocando em uma cosnt
    const findhabit = await habitModel.findOne({ name: habit.data.name });

    // Se já existe aquele habito ele manda responta "O habito já existe"
    if (findhabit) {
      return response
        .status(400)
        .json({ message: 'Habit already exits(Hábito já existe)' });
    }

    // manda os habitos creados para o banco
    const newHabit = await habitModel.create({
      name: habit.data.name,
      completedDates: [],
    });

    // Retornando  JSON da criação do habit

    return response.status(201).json(newHabit);
  };
  // Função para listar os Habitos no metodo "index"(get) trazer para ser vizualizado
  index = async (request: Request, response: Response) => {
    const habits = await habitModel.find().sort({ name: 1 });
    // "sort " manda os listagem em order alfabetica => crescente
    // Se colocar -1 ele lista da formar decrecente

    // retorna a listagem em formar de JSON dos Habits
    return response.status(200).json(habits);
  };

  // "remove"(delete) exlusão de um hábito pelo seu id
  remove = async (request: Request, response: Response) => {
    // Verificação com Zod do ID
    const schema = z.object({
      id: z.string(),
    });

    const habit = schema.safeParse(request.params); // params => parâmetros
    console.log(habit);

    // Se nao tiver sucesso manda uma menssagem de erro
    if (!habit.success) {
      const errors = buildValidationErrorMessage(habit.error.issues);

      return response.status(422).json({ message: errors });
    }
    // Verificando se o Habits ja exite para ser deletado
    const findhabit = await habitModel.findOne({
      _id: habit.data.id,
    });
    // Se não exitir ele vai retorna que não existe
    if (!findhabit) {
      return response
        .status(404)
        .json({ message: 'Habit not found(Hábito não existe)' });
    }

    await habitModel.deleteOne({
      _id: habit.data.id,
    });
    // return para não trava aplicação
    return response.status(204).send();
  };

  toggle = async (request: Request, response: Response) => {
    // Verificação com Zod do ID
    const schema = z.object({
      id: z.string(),
    });

    const valited = schema.safeParse(request.params);

    // Se nao tiver sucesso manda uma menssagem de erro
    if (!valited.success) {
      const errors = buildValidationErrorMessage(valited.error.issues);

      return response.status(422).json({ message: errors });
    }
    // Verificando se o Habits ja exite para ser deletado
    const findhabit = await habitModel.findOne({
      _id: valited.data.id,
    });

    console.log(findhabit);

    // Se não exitir ele vai retorna que não existe
    if (!findhabit) {
      return response
        .status(404)
        .json({ message: 'Habit not found(Hábito não existe)' });
    }
    // trazendo a data atual com padrao UTC
    const now = dayjs().startOf('day').toISOString();

    const isHabitCompleteOnDate = findhabit
      .toObject()
      ?.completedDates.find(
        (item) => dayjs(String(item)).toISOString() === now,
      );

    if (isHabitCompleteOnDate) {
      const habitUpdated = await habitModel.findOneAndUpdate(
        {
          _id: valited.data.id, // procurar o id para update
        },
        {
          $pull: {
            completedDates: now, // vai remover a data
          },
        },
        {
          returnDocument: 'after', // vai trazer o resuldado
        },
      );

      return response.json(habitUpdated);
    }

    const habitUpdated = await habitModel.findOneAndUpdate(
      {
        _id: valited.data.id, // procurar o id para update
      },
      {
        $push: {
          completedDates: now, // vai colocar a data
        },
      },
      {
        returnDocument: 'after', // vai trazer o resuldado
      },
    );

    console.log(isHabitCompleteOnDate);

    return response.status(200).json(habitUpdated);
  };

  metrics = async (request: Request, response: Response) => {
    // Validação das informações
    const schema = z.object({
      id: z.string(),
      date: z.coerce.date(),
    });

    const validated = schema.safeParse({ ...request.params, ...request.query });

    console.log({ ...request.params, ...request.query });

    if (!validated.success) {
      const errors = buildValidationErrorMessage(validated.error.issues);

      return response.status(422).json({ message: errors });
    }
    // pegando o começo do mês
    const dateFrom = dayjs(validated.data.date).startOf('month');
    // pegando o final no mês
    const dateTo = dayjs(validated.data.date).endOf('month');

    const monthlength = dateTo.diff(dateFrom, 'days') + 1;

    console.log(monthlength);

    const [habitMetrics] = await habitModel
      .aggregate()
      .match({
        _id: new mongoose.Types.ObjectId(validated.data.id),
      })
      .project({
        _id: 1, // 0 retorna nada
        name: 1, // 0 retorna nada
        completedDates: {
          // O array com as datas
          $filter: {
            // filtrar as datas função
            input: '$completedDates', // o que vai ser filtrado que o array
            as: 'completedDate', // o "chave" de cada data no array
            cond: {
              // A condição que vai ser as filtragem, no caso por mês , que vai começãr no dia 01 e vai ate o final
              $and: [
                {
                  // "greater than or equal to" (maior ou igual a)
                  $gte: ['$$completedDate', dateFrom.toDate()],
                },
                {
                  // "lesser than or equal to" (menor ou igual a)
                  $lte: ['$$completedDate', dateTo.toDate()],
                },
              ],
            },
          },
        },
      });
    // se não exitir ele retorna uma messagem que não foi achado
    if (!habitMetrics) {
      return response
        .status(404)
        .json({ message: 'Metric not found(Metrica não existe)' });
    }

    return response.status(200).json(habitMetrics);
  };
}
