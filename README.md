# Operação Travessia

Jogo 2D de sátira política fictícia em JavaScript e Canvas. O enredo não afirma nem retrata acontecimentos reais.

## Jogar

Abra `dist/index.html` no Microsoft Edge ou em outro navegador moderno. Não precisa instalar dependências nem acessar a internet.

Opcionalmente, rode `node server.cjs` nesta pasta e abra http://127.0.0.1:4173.

## Controles

- Espaço, seta para cima ou W: pular; aperte novamente no ar para o pulo duplo.
- Setas esquerda/direita ou A/D: mover na pista.
- Shift: arrancada com proteção temporária; recarrega em 3 segundos.
- P ou Escape: pausar/continuar.
- R: recomeçar.
- No celular, use os botões na tela. Toque na pista para pular.
- Use o botão de nota musical para ligar/desligar o som.

Atravesse três trechos: a ponte, as participações de Janones, Guilherme Cortez e Erika Hilton, e o palanque dos memes do Lula. Evite cones, barreiras, patrulhas, posts e balões. O desafio final termina quando a barra de discurso esvazia. Você começa com quatro vidas; nove selos coletados recuperam uma vida. A arrancada permite passar pelos obstáculos sem sofrer dano durante um instante. Seu recorde fica salvo neste navegador quando o armazenamento está disponível. O jogo pausa automaticamente ao sair da janela.

Depois da ponte há um avião e uma animação de 18 segundos: embarque no Paraguai, decolagem, viagem, pouso nos Estados Unidos e recepção por um cartum do Trump. No menu, **Ver a animação final** permite conferir a sequência sem concluir o percurso. A animação aceita pausa, reinício e pular. A viagem e os diálogos finais são fictícios.

Os projéteis do Lula fazem referência a memes da campanha de 2026. Consulte `dist/fontes.html` (link no rodapé do jogo) para o contexto e as fontes, incluindo a identificação de um lapso de formulação no debate.

## Arquivos

- `dist/index.html` e `dist/styles.css`: interface responsiva.
- `dist/engine.js`: física, regras e progressão, independente da interface.
- `dist/scene.js`: cenário e personagens desenhados por código.
- `dist/ending.js`: avião e animação de chegada aos Estados Unidos.
- `dist/game.js`: desenho, controles, sons e integração.
- `dist/fontes.html`: contexto e referências dos memes de 2026.
- `server.cjs`: servidor local opcional, sem bibliotecas externas.

Para conferir lógica e desenhos: `node --test tests/engine.test.cjs tests/render.test.cjs`.
