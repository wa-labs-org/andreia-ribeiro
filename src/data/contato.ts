// Dados de contato do ateliê — um lugar só para o rodapé e o formulário.
// TODO: trocar os marcadores pelos dados reais antes de publicar.
//  - whatsapp: só dígitos, com DDI e DDD (ex.: '5561999998888'). Enquanto
//    estiver vazio, o formulário não envia e avisa que falta configurar.
//  - email, instagram, pinterest: deixe null para não exibir o link.
export const contato = {
	endereco: ['Endereço do ateliê', 'Cidade — UF'],
	whatsapp: '', // só dígitos, com 55 + DDD
	whatsappExibicao: '(00) 00000-0000',
	email: null as string | null,
	instagram: null as string | null, // URL completa do perfil
	pinterest: null as string | null, // URL completa do perfil
};

/** Link do WhatsApp do ateliê (ou null enquanto o número não estiver configurado). */
export const linkWhatsapp = (texto?: string) =>
	contato.whatsapp ? `https://wa.me/${contato.whatsapp}${texto ? `?text=${encodeURIComponent(texto)}` : ''}` : null;
