const apiKey = "";

function sendMessage() {
    var message = document.getElementById('message-input');
    if (!message.value) {
        message.style.border = '1px solid red';
        return;
    }

    message.style.border = 'none';

    var status = document.getElementById('status');
    var btnSubmit = document.getElementById('btn-submit');

    status.style.display = 'block';
    status.innerHTML = 'Carregando...';
    btnSubmit.disabled = true;
    btnSubmit.style.cursor = 'not-allowed';
    message.disabled = true;

    fetch("https://api.deepseek.com/chat/completions", {
        method: 'POST',
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: "deepseek-chat",
            messages: [
                {
                    role: "system",
                    content: "Analise a seguinte pergunta e responda com base exclusivamente no Código de Defesa do Consumidor (Lei nº 8.078/1990). Se a pergunta não estiver relacionada ao CDC, retorne exatamente a seguinte frase: 'Desculpe, isso não está relacionado ao Código de Defesa do Consumidor.' Caso a pergunta esteja relacionada ao CDC, forneça uma resposta completa e detalhada, com base na legislação consumerista. Após a análise, oriente o consumidor sobre os próximos passos, sugerindo que ele tente resolver a situação diretamente com o estabelecimento, buscando uma solução amigável. Caso não seja possível resolver com o estabelecimento, recomende que ele faça uma reclamação no PROCON (Programa de Proteção e Defesa do Consumidor) da sua região. Se o consumidor desejar continuar com o caso ou necessitar de uma solução judicial, sugira que ele procure um advogado para avaliar as possibilidades legais. Você será uma mulher que se chama 'Ju'. Não use palavras técnicas, explique para uma pessoa sem muito conhecimento na área judicial, sendo didatica. Quando você recomendar um advogado, fale para o cliente 'Vá à aba de Advogados Parceiros', pois lá temos advogados de confiança."
                },
                {
                    role: "user",
                    content: message.value
                }
            ],
            options: {
                temperature: 0.1
            },
            stream: true,
        })
    })
        .then((response) => {
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let done = false;
            let text = '';

            // Função para ler os dados conforme eles chegam
            const streamData = () => {
                reader.read().then(({ done, value }) => {
                    if (done) {
                        status.style.display = 'none';
                        btnSubmit.disabled = false;
                        btnSubmit.style.cursor = 'pointer';
                        message.disabled = false;
                        return;
                    }

                    const content = decoder.decode(value, { stream: true });

                    // Cada linha da stream pode ter múltiplos "data: {json}" separados
                    const lines = content.split('\n').filter(line => line.trim().startsWith('data:'));

                    for (const line of lines) {
                        const jsonStr = line.replace(/^data:\s*/, '').trim();

                        if (jsonStr === "[DONE]") continue;

                        try {
                            const parsed = JSON.parse(jsonStr);
                            const delta = parsed.choices?.[0]?.delta;
                            const piece = delta?.content || '';
                            text += piece;

                            const cleanedText = cleanText(text);
                            updateMessage(cleanedText);
                        } catch (e) {
                            console.error('Erro ao parsear JSON do chunk:', e);
                        }
                    }

                    streamData(); // Continue lendo
                });
            };


            // Iniciar o fluxo de leitura
            streamData();
        })
        .catch((e) => {
            console.log('Error -> ', e);
        });
}

// Função para extrair o conteúdo da mensagem
function extractMessageContent(content) {
    try {
        const parsed = JSON.parse(content);
        // Acesse a propriedade message.content
        return parsed.message?.content || '';
    } catch (e) {
        console.error('Error parsing content: ', e);
        return '';
    }
}

// Função para limpar o texto da resposta (remover tags, como <think>)
function cleanText(text) {
    const regexThink = /<think>[\s\S]*?<\/think>/g;
    const regexHTMLTags = /<\/?[^>]+(>|$)/g;
    let cleanedText = text.replace(regexThink, '');  // Remove <think>
    cleanedText = cleanedText.replace(regexHTMLTags, ''); // Remove outras tags HTML
    return cleanedText.trim();
}

// Função para atualizar a mensagem na tela (de forma contínua)
function updateMessage(content) {
    // Encontre o elemento da mensagem de resposta (ou crie se não existir)
    var historic = document.getElementById('historic');

    let responseBox = document.getElementById('response-box');

    if (!responseBox) {
        // Se a caixa de resposta não existir, crie uma nova
        responseBox = document.createElement('div');
        responseBox.id = 'response-box';
        responseBox.className = 'box-response-message';

        var chatResponse = document.createElement('p');
        chatResponse.className = 'chat-message';
        responseBox.appendChild(chatResponse);

        historic.appendChild(responseBox);
    }

    // Atualize o conteúdo da mensagem
    var chatResponse = responseBox.querySelector('.chat-message');
    chatResponse.innerHTML = content;

    // Levar o scroll para o final
    historic.scrollTop = historic.scrollHeight;
}
