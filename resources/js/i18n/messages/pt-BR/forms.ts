import type { Messages } from '../../types.ts';

export default {
    "email": {
        "label": "Endereço de email",
        "placeholder": "voce@example.com"
    },
    "subscribe": "Inscrever-se",
    "invalidEmail": "Digite um endereço de email válido.",
    "tooMany": "Muitas tentativas. Aguarde um minuto e tente novamente.",
    "failed": "Algo deu errado. Tente novamente.",
    "network": "Não foi possível acessar o servidor. Verifique sua conexão e tente novamente.",
    "subscribed": "Confira sua caixa de entrada para encontrar o link de confirmação."
} satisfies Messages['forms'];
