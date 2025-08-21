// importando exepress
import 'dotenv/config';
import express from 'express';
import { setupMongo } from './database';
import { routes } from './routes';

const app = express();

setupMongo()
  .then(() => {
    // Faz o "express" endenter json
    app.use(express.json());
    app.use(routes);

    // Função de callBack avisando que o servidor foi iniciado,
    // quando der o comando no terminal ou cmd "Servidor rodando a porta 4000"
    app.listen(4000, () => console.log(`🚀Server is running at port 4000!😁`));
  })
  .catch((err) => {
    console.error(err.message);
  });

/* 
M (Model) -> Responsavel por se comunicar com o banco;
V (View)  -> Mostrar isso parta o usuario (React)
C (Controller) -> Controla a requisição, chama o Modal, define RN`s(Regras de negocio) e faz o retorno pro Usuário


*/
