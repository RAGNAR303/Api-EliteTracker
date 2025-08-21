import { request, Request, Response } from 'express';
import z from 'zod';
import dayjs from 'dayjs';
import { buildValidationErrorMessage } from '../utils/build-validation-error-message.util';
import { focusTimeModel } from '../model/focus-time.model';
import { Query } from 'mongoose';

export class FocusTimeController {
  // "store"(post) rota para criação de um Habits
  store = async (request: Request, response: Response): Promise<Response> => {
    const schema = z.object({
      timeFrom: z.coerce.date(),
      timeTo: z.coerce.date(),
    });

    const focusTime = schema.safeParse(request.body);

    if (!focusTime.success) {
      const errors = buildValidationErrorMessage(focusTime.error.issues);

      return response.status(422).json({ message: errors });
    }

    const timeFrom = dayjs(focusTime.data?.timeFrom);
    const timeTo = dayjs(focusTime.data?.timeTo);

    // Verficando se o tempo final esta vindo do inicial  "true" ou  "false"
    const isTimeToBeforeTimeFrom = timeTo.isBefore(timeFrom);

    if (isTimeToBeforeTimeFrom) {
      return response.status(400).json({
        message:
          'timeTo cannot be is the past(tiemTo não pode estar no passado)',
      });
    }

    // criando um temo de foco
    const createFocusTime = await focusTimeModel.create({
      timeFrom: timeFrom.toDate(),
      timeTo: timeTo.toDate(),
      userId: request.user.id,
    });

    return response.status(201).json(createFocusTime);
  };

  index = async (request: Request, response: Response) => {
    const schema = z.object({
      date: z.coerce.date(),
    });

    const validated = schema.safeParse(request.query);

    if (!validated.success) {
      const errors = buildValidationErrorMessage(validated.error.issues); // issues => problema

      return response.status(422).json({ message: errors });
    }

    const starDate = dayjs(validated.data.date).startOf('day');
    const endDate = dayjs(validated.data.date).endOf('day');

    const focusTime = await focusTimeModel
      .find({
        timeFrom: {
          $gte: starDate.toDate(),
          $lte: endDate.toDate(),
        },
        userId: request.user.id,
      })
      .sort({
        timefrom: 1,
      });

    return response.status(200).json(focusTime);
  };

  metricsByMonth = async (request: Request, response: Response) => {
    const schema = z.object({
      date: z.coerce.date(),
    });

    const validated = schema.safeParse(request.query); // query => consulta

    if (!validated.success) {
      const errors = buildValidationErrorMessage(validated.error.issues); // issues => problema

      return response.status(422).json({ message: errors });
    }
    const starDate = dayjs(validated.data.date).startOf('month');
    const endDate = dayjs(validated.data.date).endOf('month');

    console.log(starDate, endDate);

    const focusTimesMetrics = await focusTimeModel
      .aggregate()
      .match({
        timeFrom: {
          $gte: starDate.toDate(),
          $lte: endDate.toDate(),
        },
        userId: request.user.id,
      })
      .project({
        year: {
          $year: '$timeFrom',
        },
        month: {
          $month: '$timeFrom',
        },
        day: {
          $dayOfMonth: '$timeFrom',
        },
      })
      .group({
        _id: ['$year', '$month', '$day'],
        count: {
          $sum: 1,
        },
      })
      .sort({
        _id: 1,
      });

    return response.status(200).json(focusTimesMetrics);
  };
}
