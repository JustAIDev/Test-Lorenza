const apiKey = "sk-e6a8fcc552834287ab2b7d88b172b5a3";

function sendMessage() {
    var message = document.getElementById('message-input');
    if (!message.value) {
        message.style.border = '1px solid red';
        return;
    }

    message.style.border = 'none';

    // Configuração de Status
    var status = document.getElementById('status');
    var btnSubmit = document.getElementById('btn-submit');

    status.style.display = 'block';
    status.innerHTML = 'Carregando...';
    btnSubmit.disabled = true;
    btnSubmit.style.cursor = 'not-allowed';
    message.disabled = true;

    fetch("http://localhost:11434/api/chat", {
        method: 'POST',
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: "deepseek-r1",
            messages: [
                {
                    role: "system",
                    content: "You are a consumer rights assistant that replies in Portuguese. You help users understand laws by explaining them in a simple and accessible way."
                },
                {
                    role: "user",
                    content: message.value
                }
            ],
            options: {
                temperature: 0.1
            },
            stream: true,  // Usando stream
        })
    })
    .then((response) => {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let done = false;
        let text = ''; // Variável para acumular o texto

        // Função para ler os dados conforme eles chegam
        const streamData = () => {
            reader.read().then(({ done, value }) => {
                if (done) {
                    // Se não houver mais dados, finalize o processo
                    status.style.display = 'none';
                    btnSubmit.disabled = false;
                    btnSubmit.style.cursor = 'pointer';
                    message.disabled = false;
                    return;
                }

                // Decodifique o valor (em formato Uint8Array) para texto
                const content = decoder.decode(value, { stream: true });

                // A resposta completa da API tem a estrutura { message: { content: "text" } }
                // Aqui extraímos o conteúdo da mensagem
                const messageContent = extractMessageContent(content);

                // Acumule o texto em uma variável
                text += messageContent;

                // Limpar o texto (se necessário) para remover tags ou caracteres indesejados
                const cleanedText = cleanText(text);

                // Atualize o histórico em tempo real com o texto acumulado
                updateMessage(cleanedText);

                // Chama novamente para continuar processando os dados
                streamData();
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
