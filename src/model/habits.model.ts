import { Schema, model } from 'mongoose';

const HabitShema = new Schema(
  {
    name: {
      type: String,
      required: true, // "required" siginifica que e obrigatorio
    },
    completedDates: {
      type: [Date],
    },
  },
  {
    versionKey: false,
    timestamps: true, // cria o updateAt e createAt automaticamento
  },
);

export const habitModel = model('Habit', HabitShema);
