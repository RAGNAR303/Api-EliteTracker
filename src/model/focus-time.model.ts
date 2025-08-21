import { Schema, model } from 'mongoose';

const FocusTimeSchema = new Schema(
  {
    timeFrom: Date, // Vai ser do tipo data

    timeTo: Date, // Vai ser do tipo data

    userId: String,
  },
  {
    versionKey: false,
    timestamps: true, // cria o updateAt e createAt automaticamento
  },
);

export const focusTimeModel = model('FocusTime', FocusTimeSchema);
