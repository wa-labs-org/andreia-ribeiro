// Dados de contato do ateliê — um lugar só para o rodapé e o formulário.
//  - whatsapp: só dígitos, com DDI e DDD (ex.: '5561999998888'). Enquanto
//    estiver vazio, o formulário não envia e avisa que falta configurar.
//  - email, instagram, pinterest: deixe null para não exibir (some do rodapé).
export const contato = {
	endereco: ['Av. Londrina, 250 — Centro', 'Loanda — PR · 87900-000'],
	// abre o endereço no Google Maps
	mapa: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('Avenida Londrina, 250, Centro, Loanda - PR, 87900-000'),
	// endereço por partes, para os dados estruturados (schema.org) do Google
	enderecoPartes: {
		rua: 'Avenida Londrina, 250 — Centro',
		cidade: 'Loanda',
		estado: 'PR',
		cep: '87900-000',
		pais: 'BR',
	},
	whatsapp: '5544999756139', // só dígitos, com 55 + DDD
	whatsappExibicao: '(44) 99975-6139',
	email: null as string | null,
	instagram: 'https://instagram.com/andreiaribeiroatelier' as string | null, // URL completa do perfil
	pinterest: null as string | null, // URL completa do perfil
};

/** Link do WhatsApp do ateliê (ou null enquanto o número não estiver configurado). */
export const linkWhatsapp = (texto?: string) =>
	contato.whatsapp ? `https://wa.me/${contato.whatsapp}${texto ? `?text=${encodeURIComponent(texto)}` : ''}` : null;
