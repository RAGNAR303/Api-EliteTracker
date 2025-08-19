import { Schema, model } from 'mongoose';

const FocusTimeSchema = new Schema(
  {
    timeFrom: {
      // tempo inicial
      type: Date, // Vai ser do tipo data
      required: true, // "required" siginifica que e obrigatorio
    },
    timeTo: {
      // tempo final
      type: Date, // Vai ser do tipo data
      required: true, // "required" siginifica que e obrigatorio
    },
  },
  {
    versionKey: false,
    timestamps: true, // cria o updateAt e createAt automaticamento
  },
);

export const focusTimeModel = model('FocusTime', FocusTimeSchema);
