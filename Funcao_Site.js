// ===================================================================
// 0. FUNÇÕES AUXILIARES GLOBAIS (ADICIONADAS PARA CORES ANÁLOGAS)
// ===================================================================

// Converte RGB para HSL (Hue, Saturation, Lightness). Essencial para manipular o Matiz.
function rgbParaHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    // Retorna Hue (0-360), Saturation (0-100), Lightness (0-100)
    return [h * 360, s * 100, l * 100]; 
}

// Converte HSL de volta para RGB.
function hslParaRgb(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;
    let r, g, b;

    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

// ===================================================================
// 1. SELETOR DE COR (CÍRCULO CROMÁTICO E QUADRADO)
// ===================================================================

// --- Funções Auxiliares do Seletor ---

// Função utilitária (usada por múltiplas seções)
function rgbParaHex(r, g, b) {
    return (
        "#" +
        [r, g, b]
            .map(v => v.toString(16).padStart(2, "0"))
            .join("")
    );
}

function pickMatiz(e) {
    const rect = circulo.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const pixel = wctx.getImageData(x, y, 1, 1).data;
    matiz = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
    
    // Originalmente faltava a verificação de limite do círculo, mas mantendo o código original:
    marcador.style.left = `${x}px`;
    marcador.style.top = `${y}px`;
    
    drawQuadrado(matiz);
}

function drawQuadrado(baseCor) {
    sctx.fillStyle = baseCor;
    sctx.fillRect(0, 0, size, size);
    const whiteGrad = sctx.createLinearGradient(0, 0, size, 0);
    whiteGrad.addColorStop(0, "#fff");
    whiteGrad.addColorStop(1, "transparent");
    sctx.fillStyle = whiteGrad;
    sctx.fillRect(0, 0, size, size);
    const blackGrad = sctx.createLinearGradient(0, 0, 0, size);
    blackGrad.addColorStop(0, "transparent");
    blackGrad.addColorStop(1, "#000");
    sctx.fillStyle = blackGrad;
    sctx.fillRect(0, 0, size, size);
}

function pickQuadrado(e) {
    const rect = quadrado.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const pixel = sctx.getImageData(x, y, 1, 1).data;
    const cor = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
    marcadorSaturacao.style.left = `${x}px`;
    marcadorSaturacao.style.top = `${y}px`;
    selecao.textContent = cor;
    selecao.style.background = cor;
    localStorage.setItem("ultimaCor", cor);
    document.getElementById("hex").value = rgbParaHex(pixel[0], pixel[1], pixel[2]);
}

// --- Variáveis do Seletor ---
const circulo = document.getElementById("circulo-cromatico");
const wctx = circulo.getContext("2d");
const marcador = document.getElementById("marcador-cor");

const quadrado = document.getElementById("quadrado");
const sctx = quadrado.getContext("2d");
const marcadorSaturacao = document.getElementById("marcador-saturacao");

const selecao = document.getElementById("selecao");
const size = 220;
circulo.width = size;
circulo.height = size;
quadrado.width = size;
quadrado.height = size;

let matiz = "red";
let isDraggingCirculo = false;
let isDraggingQuadrado = false;

// --- Desenho do Círculo Cromático (Matiz) ---
const grad = wctx.createConicGradient(0, size / 2, size / 2);
grad.addColorStop(0, "red");
grad.addColorStop(1 / 6, "yellow");
grad.addColorStop(2 / 6, "lime");
grad.addColorStop(3 / 6, "cyan");
grad.addColorStop(4 / 6, "blue");
grad.addColorStop(5 / 6, "magenta");
grad.addColorStop(1, "red");
wctx.fillStyle = grad;
wctx.beginPath();
wctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
wctx.fill();

// --- Event Listeners (Ouvintes de Eventos) do Seletor ---
circulo.addEventListener("mousedown", e => {
    isDraggingCirculo = true;
    pickMatiz(e);
});
circulo.addEventListener("mousemove", e => {
    if (isDraggingCirculo) pickMatiz(e);
});
document.addEventListener("mouseup", () => isDraggingCirculo = false);

quadrado.addEventListener("mousedown", e => {
    isDraggingQuadrado = true;
    pickQuadrado(e);
});
quadrado.addEventListener("mousemove", e => {
    if (isDraggingQuadrado) pickQuadrado(e);
});
document.addEventListener("mouseup", () => isDraggingQuadrado = false);

// --- Inicialização e LocalStorage do Seletor ---
drawQuadrado("blue"); // Chama a função que já foi declarada
const salva = localStorage.getItem("ultimaCor");
if (salva) {
    selecao.textContent = salva;
    selecao.style.background = salva;
}

function complemento() {
    let hex = document.getElementById("hex").value;
    hex = hex.replace(/[^0-9a-f]/gi, '');
    const separartwo = hex.match(/[0-9a-f]{2}/gi);
    if (!separartwo) return;
    const cor = separartwo.map(v => parseInt(v, 16));
    const comp = cor.map(v => 255 - v);
    const compHex = comp.map(v => v.toString(16).padStart(2, '0'));
    const corFinal = "#" + compHex.join('').toUpperCase();

    // NOVO: Renderiza o resultado no novo container
    const container = document.getElementById('complementar-resultado-container');
    container.innerHTML = `
        <p style="font-size: 1.2em; margin-bottom: 20px;">Cor Complementar:</p>
        <div class="card-cor-resultado">
            <div class="bloco-cor-display" style="background-color: ${corFinal};"></div>
            <span class="hex-texto-display">${corFinal}</span>
        </div>
    `;
}

// ===================================================================
// 3. CORES ANÁLOGAS
// ===================================================================

// Função chamada pelo novo botão 'análogas'
function iniciarAnalogas() {
    let hex = document.getElementById("hex").value;
    hex = hex.replace(/[^0-9a-f]/gi, '').toLowerCase(); 
    
    const container = document.getElementById('coresAnalogasList');
    container.innerHTML = ''; // Limpa resultados anteriores

    if (hex.length !== 6) {
        container.innerHTML = `<span id="analogasMensagem">Insira um código HEX válido.</span>`;
        return;
    }
    
    analogas(hex);
}

// Função principal de cálculo e exibição das análogas
function iniciarAnalogas() {
    let hex = document.getElementById("hex").value;
    hex = hex.replace(/[^0-9a-f]/gi, '').toLowerCase(); 
    
    const container = document.getElementById('coresAnalogasList');
    container.innerHTML = ''; // Limpa resultados anteriores
    
    const titulo = document.getElementById('analogas-titulo');
    titulo.style.display = 'none'; // Esconde o título

    if (hex.length !== 6) {
        container.innerHTML = `<span>Insira um código HEX válido.</span>`;
        return;
    }
    
    analogas(hex);
}

// Função principal de cálculo e exibição das análogas
function analogas(hex) {
    // Converte HEX (string) para RGB (números)
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);

    // Converte RGB da cor base para HSL
    const [h, s, l] = rgbParaHsl(r, g, b);

    // Define o deslocamento do matiz (30 graus é padrão para análogas)
    const offset = 30; 

    // Calcula a Matiz para as duas análogas (H-30 e H+30)
    let h1 = (h - offset + 360) % 360;
    let h2 = (h + offset) % 360;

    // Converte as novas matizes HSL de volta para HEX
    const [r1, g1, b1] = hslParaRgb(h1, s, l);
    const hex1 = rgbParaHex(r1, g1, b1).toUpperCase(); 

    const [r2, g2, b2] = hslParaRgb(h2, s, l);
    const hex2 = rgbParaHex(r2, g2, b2).toUpperCase();
    
    const container = document.getElementById('coresAnalogasList');
    container.innerHTML = ''; // Limpa o container
    
    // Mostra o título da seção
    const titulo = document.getElementById('analogas-titulo');
    titulo.style.display = 'block';

    const cores = [hex1, hex2];
    
    cores.forEach(corHex => {
        // NOVO: Usa a classe de card padrão
        const cardHTML = `
            <div class="card-cor-resultado">
                <div class="bloco-cor-display" style="background-color: ${corHex};"></div>
                <span class="hex-texto-display">${corHex}</span>
            </div>
        `;
        container.innerHTML += cardHTML;
    });
}


// ===================================================================
// 4. EXTRATOR DE PALETA DA IMAGEM
// ===================================================================

// --- Variáveis do Extrator ---
const inputImagem = document.getElementById('inputImagem');
const imgVisualizacao = document.getElementById('imgVisualizacao');
const paletaCores = document.getElementById('paletaCores');
const paletaCoresMensagem = document.getElementById('paletaCoresMensagem');
const nomeArquivoSpan = document.getElementById('nomeArquivo');

// --- Constantes do Algoritmo ---
const MAX_CORES = 6;
const SALTO_PIXEL = 5;
const BALDE_CORES = 10;
const LIMITE_DIFERENCA_COR = 80; 

// --- Funções Auxiliares do Extrator ---

// Exibe a imagem na tela e limpa a paleta antiga
function exibirImagem(arquivo) {
    const reader = new FileReader();
    reader.onload = function(e) {
        imgVisualizacao.src = e.target.result;
        imgVisualizacao.style.display = 'block';
        paletaCoresMensagem.textContent = "Processando a imagem...";
        paletaCoresMensagem.style.display = 'block';
        
        Array.from(paletaCores.children).forEach(child => {
            if (child.classList.contains('bloco-cor') || (child.tagName === 'DIV' && child.style.display === 'flex')) {
                paletaCores.removeChild(child);
            }
        });
    }
    reader.readAsDataURL(arquivo);
}

// Calcula a "distância" Euclidiana entre duas cores RGB
function calcularDistanciaCor(rgb1, rgb2) {
    const [r1, g1, b1] = rgb1.split(',').map(Number);
    const [r2, g2, b2] = rgb2.split(',').map(Number);
    const distR = (r1 - r2) ** 2;
    const distG = (g1 - g2) ** 2;
    const distB = (b1 - b2) ** 2;
    return Math.sqrt(distR + distG + distB);
}

// Função utilitária para obter o RGB do "balde"
function getExactRGBFromGroup(rgbString) {
    const [r, g, b] = rgbString.split(',').map(Number);
    return { r, g, b }; 
}

// Desenha os blocos de cor na tela
function exibirPaleta(paleta) {
    paletaCoresMensagem.style.display = 'none';

    // Limpa a paleta (necessário caso a função seja chamada de novo)
    Array.from(paletaCores.children).forEach(child => {
        if (child.classList.contains('bloco-cor') || (child.tagName === 'DIV' && child.style.display === 'flex')) {
            paletaCores.removeChild(child);
        }
    });

    if (paleta.length === 0) {
        paletaCoresMensagem.style.display = 'block';
        paletaCoresMensagem.textContent = 'Não foi possível extrair cores suficientes.';
        return;
    }

    // Cria os elementos da paleta
    paleta.forEach(([corRGB, contagem]) => {
        const { r, g, b } = getExactRGBFromGroup(corRGB);
        const corHex = rgbParaHex(r, g, b); 
            
        const blocoCor = document.createElement('div');
        blocoCor.className = 'bloco-cor';
        blocoCor.style.backgroundColor = corHex;

        const blocoTexto = document.createElement('div');
        blocoTexto.className = 'hex-texto';
        blocoTexto.textContent = corHex.toUpperCase();
            
        const containerCor = document.createElement('div');
        containerCor.style.display = 'flex';
        containerCor.style.flexDirection = 'column';
        containerCor.style.alignItems = 'center';
            
        containerCor.appendChild(blocoCor);
        containerCor.appendChild(blocoTexto);

        paletaCores.appendChild(containerCor);
    });
}

// O algoritmo principal de extração de cores
// Esta função é chamada pelo 'onload' da tag <img> no HTML
function extrairPaletaCores(imgElement) {
    const canvas = document.getElementById('canvasProcessamento');
    const ctx = canvas.getContext('2d');
    canvas.width = imgElement.naturalWidth;
    canvas.height = imgElement.naturalHeight;

    try {
        ctx.drawImage(imgElement, 0, 0, canvas.width, canvas.height);
        const dadosImagem = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const dados = dadosImagem.data;
        const contagemCores = {};
        const totalPixels = dados.length;

        // 1. Contagem de pixels (agrupados por "balde")
        for (let i = 0; i < totalPixels; i += 4 * SALTO_PIXEL) {
            const r_original = dados[i];
            const g_original = dados[i + 1];
            const b_original = dados[i + 2];
            if (dados[i + 3] < 128) continue; // Pula transparente
                
            const r = Math.floor(r_original / BALDE_CORES) * BALDE_CORES;
            const g = Math.floor(g_original / BALDE_CORES) * BALDE_CORES;
            const b = Math.floor(b_original / BALDE_CORES) * BALDE_CORES;
                
            const r_agrupado = Math.min(255, r);
            const g_agrupado = Math.min(255, g);
            const b_agrupado = Math.min(255, b);
                
            const rgbString = `${r_agrupado},${g_agrupado},${b_agrupado}`;
            contagemCores[rgbString] = (contagemCores[rgbString] || 0) + 1;
        }

        // 2. Ordena as cores por dominância
        const coresOrdenadas = Object.entries(contagemCores);
        coresOrdenadas.sort((a, b) => b[1] - a[1]);
            
        // 3. Filtra a paleta para garantir variedade de cores
        const paletaFinal = [];
        for (const [corRGB, contagem] of coresOrdenadas) {
            if (paletaFinal.length === 0) {
                paletaFinal.push([corRGB, contagem]);
                continue;
            }

            let diferenteOSuficiente = true;
            for (const [corExistente] of paletaFinal) {
                const distancia = calcularDistanciaCor(corRGB, corExistente); 
                if (distancia < LIMITE_DIFERENCA_COR) {
                    diferenteOSuficiente = false;
                    break; 
                }
            }

            if (diferenteOSuficiente) {
                paletaFinal.push([corRGB, contagem]);
            }

            if (paletaFinal.length >= MAX_CORES) {
                break;
            }
        }
            
        exibirPaleta(paletaFinal); // 4. Exibe o resultado

    } catch (error) {
        paletaCoresMensagem.style.display = 'block';
        paletaCoresMensagem.innerHTML = "<span style='color:red;'>Erro ao processar imagem. <br>Certifique-se de que a imagem é um arquivo local, ou não está protegida por CORS (Cross-Origin).</span>";
        console.error("Erro ao extrair dados da imagem:", error);
    }
}

// --- Event Listener principal do Input de Imagem ---
inputImagem.addEventListener('change', function(evento) {
    const arquivo = evento.target.files[0];
    if (arquivo) {
        exibirImagem(arquivo); 
        nomeArquivoSpan.innerHTML = `&#127861; ${arquivo.name}`;
    } else {
        nomeArquivoSpan.textContent = "Nenhum arquivo escolhido"; 
        imgVisualizacao.style.display = 'none';
        paletaCoresMensagem.textContent = "Carregue uma imagem para ver as cores.";
        paletaCoresMensagem.style.display = 'block';
    }
});

// ===================================================================
// 5. FUNCIONALIDADE DO CONTA-GOTAS (NOVO)
// ===================================================================

// --- Variáveis e Event Listener ---
const btnContaGotas = document.getElementById('conta-gotas-btn');
const selecaoDisplay = document.getElementById('selecao'); // Pega o display principal
const hexInput = document.getElementById('hex'); // Pega o input hex

// Adiciona o clique ao botão
btnContaGotas.addEventListener('click', iniciarContaGotas);

// --- Funções ---

// Função para converter o HEX que a API retorna para o formato RGB (para o display)
function hexParaRgb(hex) {
    // Remove o '#' se ele existir
    hex = hex.replace(/^#/, '');

    // Converte de 3 para 6 dígitos (ex: #F00 para #FF0000)
    if (hex.length === 3) {
        hex = hex.split('').map(char => char + char).join('');
    }

    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);
    
    return `rgb(${r}, ${g}, ${b})`;
}

// Função principal que abre o conta-gotas
async function iniciarContaGotas() {
    
    // 1. Verifica a compatibilidade
    if (!window.EyeDropper) {
        alert("Seu navegador não suporta o conta-gotas. Tente usar o Chrome ou Edge.");
        return;
    }

    const eyeDropper = new EyeDropper();

    try {
        // 2. Abre o seletor do conta-gotas
        const result = await eyeDropper.open();
        
        // 3. Pega a cor (ex: #A1B2C3)
        const corHex = result.sRGBHex.toUpperCase();
        
        // 4. Converte para RGB (ex: rgb(161, 178, 195))
        const corRgb = hexParaRgb(corHex);

        // 5. Atualiza o site (inputs e displays)
        hexInput.value = corHex;
        selecaoDisplay.style.backgroundColor = corHex;
        selecaoDisplay.textContent = corRgb; // Atualiza o display principal
        
    } catch (error) {
        // Ocorre se o usuário apertar 'Esc' e cancelar a seleção
        console.log("Seleção do conta-gotas cancelada.");
    }
}