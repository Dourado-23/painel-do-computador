// 1) Escreve um objeto { rótulo: valor } como linhas de uma tabela
function PreencherTabela(id, dados) {
    const tabela = document.getElementById(id);
    tabela.innerHTML = '';

    for (const [rotulo, valor] of Object.entries(dados)) {
        const linha = tabela.insertRow();
        linha.insertCell().textContent = rotulo;
        linha.insertCell().textContent = valor;
    }
}

// 2) Navegador e sistema
function mostrarSistema() {
    PreencherTabela('sistema', {
        'Navegador': navigator.userAgent,
        'Idioma': navigator.language,
        'Núcleos de CPU': navigator.hardwareConcurrency,
        'Memória (GB)': navigator.deviceMemory || 'Indisponível',
        'Placa de vídeo': obterPlacaDeVideo(),
        'Fuso horário': Intl.DateTimeFormat().resolvedOptions().timeZone,
        'Online': navigator.onLine ? 'Sim' : 'Não'
    });
}

// Identifica o renderizador gráfico, quando permitido
function obterPlacaDeVideo() {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl');

    if (!gl) {
        return 'WebGL indisponível';
    }

    const extensao = gl.getExtension('WEBGL_debug_renderer_info');

    if (extensao) {
        return gl.getParameter(extensao.UNMASKED_RENDERER_WEBGL);
    }

    return gl.getParameter(gl.RENDERER);
}

// 3) Tela e janela
function mostrarTela() {
    PreencherTabela('tela', {
        'Resolução da tela': screen.width + ' x ' + screen.height,
        'Janela do navegador': window.innerWidth + ' x ' + window.innerHeight,
        'Escala de pixels': window.devicePixelRatio,
        'Modo escuro': matchMedia('(prefers-color-scheme: dark)').matches
            ? 'Sim'
            : 'Não'
    });
}

// 4) Localização
document.getElementById('btn-local').addEventListener('click', function () {
    const saida = document.getElementById('local');
    saida.textContent = 'Buscando...';

    navigator.geolocation.getCurrentPosition(
        function (pos) {
            saida.textContent =
                'Latitude: ' + pos.coords.latitude.toFixed(4) +
                ', Longitude: ' + pos.coords.longitude.toFixed(4);
        },
        function (erro) {
            saida.textContent =
                'Não foi possível obter a localização: ' + erro.message;
        }
    );
});

// 5) Arquivos escolhidos pelo usuário
document.getElementById('arquivos').addEventListener('change', function (evento) {
    const dados = {};

    for (const arq of evento.target.files) {
        dados[arq.name] = (arq.size / 1024).toFixed(1) + ' KB';
    }

    PreencherTabela('lista-arquivos', dados);
});

// 6) Desempenho gráfico
function mostrarGrafico() {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') ||
        canvas.getContext('webgl');

    if (!gl) {
        PreencherTabela('grafico', {
            'WebGL': 'Indisponível'
        });
        return;
    }

    const extensao = gl.getExtension('WEBGL_debug_renderer_info');

    const renderizador = extensao
        ? gl.getParameter(extensao.UNMASKED_RENDERER_WEBGL)
        : gl.getParameter(gl.RENDERER);

    PreencherTabela('grafico', {
        'Versão do WebGL': gl instanceof WebGL2RenderingContext
            ? 'WebGL 2'
            : 'WebGL 1',
        'Renderizador gráfico': renderizador,
        'Textura máxima': gl.getParameter(gl.MAX_TEXTURE_SIZE) + ' px',
        'Viewport máximo': gl.getParameter(gl.MAX_VIEWPORT_DIMS).join(' x ') + ' px'
    });
}

// 7) Data e hora
function mostrarDataHora() {
    const agora = new Date();

    PreencherTabela('data-hora', {
        'Data': agora.toLocaleDateString('pt-BR'),
        'Hora': agora.toLocaleTimeString('pt-BR'),
        'Fuso horário': Intl.DateTimeFormat().resolvedOptions().timeZone
    });
}

// 8) Internet
function mostrarInternet() {
    const conexao = navigator.connection ||
        navigator.mozConnection ||
        navigator.webkitConnection;

    const dados = {
        'Estado': navigator.onLine ? 'Online' : 'Offline'
    };

    if (conexao) {
        dados['Tipo de conexão'] = conexao.type || 'Não informado';
        dados['Tipo de rede'] = conexao.effectiveType || 'Não informado';
        dados['Velocidade estimada'] =
            conexao.downlink != null
                ? conexao.downlink + ' Mbps'
                : 'Indisponível';
    } else {
        dados['Detalhes da conexão'] =
            'Não disponíveis neste navegador';
    }

    PreencherTabela('internet', dados);
}

// Inicialização
mostrarSistema();
mostrarTela();
mostrarGrafico();
mostrarDataHora();
mostrarInternet();

// Atualizações automáticas
window.addEventListener('resize', mostrarTela);
window.addEventListener('online', mostrarInternet);
window.addEventListener('offline', mostrarInternet);

setInterval(mostrarDataHora, 1000);

const conexao = navigator.connection ||
    navigator.mozConnection ||
    navigator.webkitConnection;

if (conexao) {
    conexao.addEventListener('change', mostrarInternet);
}