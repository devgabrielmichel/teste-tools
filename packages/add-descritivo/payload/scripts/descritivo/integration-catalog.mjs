/** Catálogo de integrações detectáveis no código → linguagem comercial */
export const INTEGRATION_CATALOG = [
  {
    id: 'pncp',
    ecossistema: 'PNCP (Portal Nacional de Contratações Públicas)',
    beneficio: 'Histórico de preços e materiais disponível na hora da decisão, sem consulta manual',
    patterns: [/pncp/i],
  },
  {
    id: 'comprasgov',
    ecossistema: 'Compras.gov.br',
    beneficio: 'Sincronização de catálogo oficial e estatísticas de preço para decisões informadas',
    patterns: [/compras\.gov/i],
  },
  {
    id: 'brasilapi',
    ecossistema: 'Validação de CNPJ e CEP',
    beneficio: 'Cadastro com dados verificados automaticamente em tempo real',
    patterns: [/brasilapi/i],
  },
  {
    id: 'ai',
    ecossistema: 'Inteligência Artificial documental',
    beneficio: 'Análise automática de documentos, com resultado registrado para auditoria',
    patterns: [/openai/i, /gemini/i, /aiComply/i, /documentValidation/i],
  },
  {
    id: 'erp',
    ecossistema: 'Integração com ERPs',
    beneficio: 'Conexão facilitada com o sistema de gestão que a empresa já usa',
    patterns: [/SupplierApi/i, /api-docs/i, /supplier.*api/i, /integracao.*erp/i],
  },
  {
    id: 'ipapi',
    ecossistema: 'Rastreabilidade de acessos',
    beneficio: 'Registro de localização aproximada em cada acesso para auditoria',
    patterns: [/ipapi/i],
  },
];
