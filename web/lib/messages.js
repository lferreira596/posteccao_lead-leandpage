export const STATUS_ORDER = [
  'novo', 'contato_feito', 'interessado', 'proposta_enviada', 'fechado', 'perdido'
]

export const STATUS_CONFIG = {
  novo:             { label: 'Novo',             emoji: '🔵', bg: 'bg-blue-50',   border: 'border-blue-200',   dot: 'bg-blue-500'   },
  contato_feito:    { label: 'Contato Feito',    emoji: '🟡', bg: 'bg-yellow-50', border: 'border-yellow-200', dot: 'bg-yellow-500' },
  interessado:      { label: 'Interessado',      emoji: '🟠', bg: 'bg-orange-50', border: 'border-orange-200', dot: 'bg-orange-500' },
  proposta_enviada: { label: 'Proposta Enviada', emoji: '🟣', bg: 'bg-purple-50', border: 'border-purple-200', dot: 'bg-purple-500' },
  fechado:          { label: 'Fechado',          emoji: '🟢', bg: 'bg-green-50',  border: 'border-green-200',  dot: 'bg-green-500'  },
  perdido:          { label: 'Perdido',          emoji: '🔴', bg: 'bg-red-50',    border: 'border-red-200',    dot: 'bg-red-500'    },
}

export function gerarMensagem(lead) {
  const { name, reviews, status } = lead
  const templates = {
    novo:
      `Oi, tudo bem? Vi que o ${name} tem ${reviews} avaliações no Google — parabéns, é um número incrível!\n\n` +
      `Trabalho criando páginas de captação para restaurantes. Muitos clientes te pesquisam no Google mas não encontram ` +
      `um lugar para reservar mesa, ver o cardápio ou entrar em contato direto.\n\n` +
      `Posso te mostrar um exemplo de como ficaria para o ${name}? É rápido, sem compromisso.`,

    contato_feito:
      `Oi! Passei aqui para saber se você teve chance de ver minha mensagem sobre o ${name}.\n\n` +
      `Tenho um exemplo pronto que posso te mostrar agora mesmo. Só preciso de 2 minutos do seu tempo.`,

    interessado:
      `Que ótimo! Vou te enviar o exemplo da página do ${name} agora.\n\n` +
      `A ideia é simples: uma página com o cardápio, botão de reserva direto no WhatsApp, fotos e localização. ` +
      `Tudo que o cliente precisa para escolher você na hora.\n\n` +
      `Qual o melhor horário para conversarmos 15 minutos?`,

    proposta_enviada:
      `Segue a proposta para o ${name}:\n\n` +
      `✅ Página personalizada com identidade do restaurante\n` +
      `✅ Cardápio digital integrado\n` +
      `✅ Botão de reserva via WhatsApp\n` +
      `✅ Galeria de fotos\n` +
      `✅ Localização e horário de funcionamento\n` +
      `✅ Otimizada para aparecer no Google\n\n` +
      `Vocês já têm ${reviews} avaliações — isso é prova social poderosa. ` +
      `A página vai converter essa visibilidade em clientes prontos para comprar.\n\n` +
      `Posso ter tudo pronto em até 5 dias úteis. Quando podemos fechar?`,
  }
  return templates[status] || ''
}

export function linkWhatsApp(phone, message) {
  if (!phone) return '#'
  const num = phone.replace(/\D/g, '')
  const n = num.startsWith('55') ? num : '55' + num
  return `https://wa.me/${n}?text=${encodeURIComponent(message)}`
}

export function linkInstagramDM(instagram) {
  if (!instagram) return '#'
  const handle = instagram.replace(/^@/, '').replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/\/$/, '')
  return `https://ig.me/m/${handle}`
}

export function linkBuscarInstagram(name) {
  return `https://www.google.com/search?q=instagram+${encodeURIComponent(name)}+restaurante`
}
