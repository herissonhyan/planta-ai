import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { addRequestMeta } from "next/dist/server/request-meta";

// Acessa sua chave da API a partir de uma variável de ambiente
const genAI = new GoogleGenerativeAI(process.env.API_KEY); // Mantenha a chave como variável de ambiente para segurança
const prompt = `
Você é um agente responsavel por analisar fotos de plantas para identificar possiveis doenças.
Ao receber a imagem você deve realizar o seguinto comando:
Analisar se é uma imagem de planta
Se você ver plantas e não der para identificar, solicite para tirar em outro angulo ou mais de perto
Apenas se possivel identifique a planta, caso não saiba ou não tenha certeza não mencione
Analisar se a planta possui algum padrão de doença, ou algo que prejudique sua saude
Explicar a doença da planta
Receitar possiveis remédios
Responsa em portugues
dê respostas curtas e objetivas
seja simpatico e dê respostas engraçadas

`





export async function POST(request) {
    try {
        // Extrai o body da requisição
        const json = await request.json();
        const base64 = json.base64Data.split(",")[1]; 
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        //const prompt = "O que tem nessa imagem?";

        // Gera o conteúdo com base no prompt e na imagem em base64
        const result = await model.generateContent([prompt, { inlineData: { data: base64, mimeType: "image/png" } }]);
        const response = await result.response;

        // Obtém o texto da resposta
        const text = await response.text();

        // Retorna a descrição como resposta
        return NextResponse.json({ description: text });
    } catch (error) {
        console.error("Erro ao processar a imagem:", error);
        return NextResponse.json({ error: "Erro ao processar a imagem" }, { status: 500 });
    }
}
