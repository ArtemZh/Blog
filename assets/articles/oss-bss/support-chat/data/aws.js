/* Архітектура самого бота на AWS (розділ 06). Смуги згори вниз = шлях запиту:
   канал → край і вхід → оркестратор → модель і знання → інструменти → API оператора.
   Нижня смуга — наскрізне. Моніторинг і безпека «всюди», тому без дротів.
   Тексти: node.aw-* / band.aws-* / api.aws-* у copy.csv. */
window.AWS = {
  width: 1440,
  cols: 5,
  key: ['aw-orch'],
  bands: [
    { id: 'aws-ch', groups: [
      { id: 'awc0', label: false, col: 0, nodes: ['aw-widget'] },
    ] },
    { id: 'aws-edge', groups: [
      { id: 'awe0', label: false, col: 0, nodes: ['aw-cf'] },
      { id: 'awe1', label: false, col: 1, nodes: ['aw-apigw'] },
      { id: 'awe2', label: false, col: 2, nodes: ['aw-cognito'] },
    ] },
    { id: 'aws-orch', groups: [
      { id: 'awo1', label: false, col: 1, nodes: ['aw-orch'] },
    ] },
    { id: 'aws-model', groups: [
      { id: 'awm0', label: false, col: 0, nodes: ['aw-openai'] },
      { id: 'awm1', label: false, col: 1, nodes: ['aw-secrets'] },
      { id: 'awm2', label: false, col: 2, nodes: ['aw-kb'] },
    ] },
    { id: 'aws-tools', groups: [
      { id: 'awt2', label: false, col: 2, nodes: ['aw-lambda'] },
      { id: 'awt3', label: false, col: 3, nodes: ['aw-link'] },
    ] },
    { id: 'aws-ops', groups: [
      { id: 'awp3', label: false, col: 3, nodes: ['aw-tmf'] },
    ] },
    { id: 'aws-cross', groups: [
      { id: 'awx0', label: false, col: 0, nodes: ['aw-ddb'] },
      { id: 'awx1', label: false, col: 1, nodes: ['aw-handoff'] },
      { id: 'awx2', label: false, col: 2, nodes: ['aw-connect'] },
      { id: 'awx3', label: false, col: 3, nodes: ['aw-sec'] },
      { id: 'awx4', label: false, col: 4, nodes: ['aw-obs'] },
    ] },
  ],
  edges: [
    // запит
    { id: 'aw-widget-cf', from: 'aw-widget', to: 'aw-cf', api: 'aws-req' },
    { id: 'aw-cf-apigw', from: 'aw-cf', to: 'aw-apigw', api: 'aws-req' },
    { id: 'aw-apigw-cognito', from: 'aw-apigw', to: 'aw-cognito', api: 'aws-token' },
    { id: 'aw-apigw-orch', from: 'aw-apigw', to: 'aw-orch', api: 'aws-req' },
    // робота оркестратора
    { id: 'aw-orch-openai', from: 'aw-orch', to: 'aw-openai', api: 'aws-llm' },
    { id: 'aw-orch-secrets', from: 'aw-orch', to: 'aw-secrets', api: 'aws-key' },
    { id: 'aw-orch-kb', from: 'aw-orch', to: 'aw-kb', api: 'aws-search' },
    { id: 'aw-orch-lambda', from: 'aw-orch', to: 'aw-lambda', api: 'aws-tool' },
    { id: 'aw-lambda-link', from: 'aw-lambda', to: 'aw-link', api: 'aws-private' },
    { id: 'aw-link-tmf', from: 'aw-link', to: 'aw-tmf', api: 'aws-tmf' },
    { id: 'aw-orch-ddb', from: 'aw-orch', to: 'aw-ddb', api: 'aws-state' },
    // відповідь стрімиться назад тим самим WebSocket
    { id: 'aw-orch-apigw', from: 'aw-orch', to: 'aw-apigw', api: 'aws-stream' },
    { id: 'aw-apigw-widget', from: 'aw-apigw', to: 'aw-widget', api: 'aws-stream' },
    // передача людині і відповідь у той самий чат
    { id: 'aw-orch-handoff', from: 'aw-orch', to: 'aw-handoff', api: 'aws-human' },
    { id: 'aw-handoff-connect', from: 'aw-handoff', to: 'aw-connect', api: 'aws-queue' },
    { id: 'aw-connect-widget', from: 'aw-connect', to: 'aw-widget', api: 'aws-reply' },
  ],
};
