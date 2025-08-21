import { Schema, model } from 'mongoose';

const HabitShema = new Schema(
  {
    name: String,

    completedDates: [Date],

    userId: String,
  },
  {
    versionKey: false,
    timestamps: true, // cria o updateAt e createAt automaticamento
  },
);

export const habitModel = model('Habit', HabitShema);
