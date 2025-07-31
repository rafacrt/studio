// Temporariamente desabilitado para resolver problemas de build
// import {genkit} from 'genkit';
// import {googleAI} from '@genkit-ai/googleai';

// export const ai = genkit({
//   plugins: [googleAI()],
//   model: 'googleai/gemini-2.0-flash',
// });

// Mock do AI para evitar erros durante o build
export const ai = {
  defineFlow: (config: any, handler: any) => {
    return handler; // Retorna a função handler como fallback
  }
};