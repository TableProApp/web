---
title: Política de privacidade
description: Dados coletados pelo TablePro, finalidades, destinatários, retenção, escolhas e direitos.
updatedAt: "2026-11-05"
---

Esta política cobre TablePro para Mac, Linux, iPhone e iPad; tablepro.app; docs.tablepro.app; e serviços de conta, compras, suporte e newsletter. O [inventário técnico](https://docs.tablepro.app/security/privacy) lista campos, destinos e controles. O código está no [repositório público]({github}).

## Resumo {#summary}

Consultas e resultados comuns passam entre seu dispositivo e seu banco de dados. Dados de uso não contêm SQL, linhas ou credenciais. Conteúdo publicado na Team Library, enviado ao suporte ou compartilhado com IA e ferramentas externas chega a esses destinatários.

Dados de uso vêm ativados no Mac e Linux, com opção de desativar. O app publicado para iPhone e iPad só envia após consentimento. A análise direta pode se ligar à conta e às compras. Desativar não interrompe solicitações da conta ou análises do servidor.

O site mede visitas e carrega Crisp em todas as páginas. Cookies do Google Analytics dependem da sua escolha. Newsletters medem aberturas e cliques. Excluir a conta deixa alguns registros, inclusive no PostHog e Crisp. Leia [retenção](#retention) e [direitos](#rights). O [controlador](#controller) atende solicitações mesmo sem conta.

<span id="contact"></span>

## Responsável {#controller}

{publisherName}, desenvolvedor individual em {publisherCity}, {publisherCountry}, é o controlador dos dados pessoais descritos. Contato: [{email}](mailto:{email}). Não temos encarregado de proteção de dados. Para equipes, controlamos registros de conta, convites e serviço. Processamos conteúdo da Team Library conforme instruções da equipe, que decide o que publicar e quem acessa.

<span id="lawful-basis"></span>

## Dados e finalidades {#data-use}

Para EEE e Reino Unido, cada finalidade indica a base legal: contrato (artigo 6(1)(b)), interesse legítimo (6(1)(f)), consentimento (6(1)(a)) ou obrigação legal (6(1)(c)). Não tomamos decisões automatizadas com efeitos legais ou de importância semelhante.

<span id="mac-account"></span>

### Contas e dispositivos {#account}

O uso local gratuito dispensa conta. Serviços de conta precisam do seu e-mail. Guardamos nome, idioma, métodos de acesso, licenças, pedidos, dispositivos, funções e assentos de equipe. O registro Mac/Linux envia ID da máquina, nome, plataforma e versões do app/sistema. O nome do dispositivo pode conter seu nome. Isso é separado dos dados de uso. Finalidade e base são fornecer conta e plano por contrato.

O acesso usa links e códigos por e-mail, passkeys, Apple, GitHub ou Google. Passkeys incluem chave pública, nome, estado de sincronização e datas de uso. Provedores de identidade fornecem ID e e-mail verificado; Apple pode fornecer nome. Seu token é criptografado e revogado ao desvincular Apple ou excluir conta. Mudanças são registradas com IP e user agent. O interesse legítimo é proteger contas e investigar abusos.

O [portal]({account}) permite editar perfil e acesso, gerenciar dispositivos, exportar JSON e excluir a conta. Não é possível excluir enquanto você possui equipe com outros membros. A exclusão encerra assinaturas sem reembolso. [Retenção](#retention) explica o que fica.

### Compras {#purchases}

{merchant} (Polar Software, Inc.) é merchant of record e revendedor. Coleta nome, e-mail, endereço de cobrança e dados de pagamento sob seus termos. Cuida de pagamento, impostos, recibos e disputas. Nunca recebemos os dados completos do cartão.

Enviamos compra, idioma, origem da visita e IP para checkout, impostos e moeda. Recebemos dados do comprador/cobrança, valores, IDs de pedido/assinatura, renovações, cancelamentos e reembolsos. Pedidos mantêm e-mail, país, valores e atribuição. Compra sem login cria conta não verificada para o e-mail se necessário. Motivos e comentários de cancelamento vão a {merchant} e ficam na assinatura. O tratamento cumpre contrato; registros fiscais/contábeis atendem obrigações legais. Sem dados obrigatórios o checkout não termina. Gerencie cobrança no [portal de {merchant}]({portal}); veja [termos](/pt-BR/terms) e [reembolsos](/pt-BR/refund-policy).

### Equipes e conteúdo compartilhado {#library}

Quem convida fornece e-mail, função e assento. Proprietários e administradores veem nomes/e-mails, convites e mudanças, incluindo endereços convidados, mas não IPs ou navegadores do log. Membros veem equipe, plano, assentos e própria função. Usamos os registros para cumprir o serviço contratado.

No Mac, publicar na Team Library envia configurações de conexão e consultas salvas ao servidor para membros autorizados. Inclui host, porta, banco, usuário, SSH/SSL, comandos iniciais, Tunnel Command e IA. Consultas incluem nomes, SQL, palavras-chave e pastas. Campos de senha são excluídos; segredos escritos em SQL ou texto livre não são removidos. A biblioteca mostra o último autor. Sair da equipe não apaga o conteúdo. Veja [prazos de exclusão](#retention). Team Catalog grava arquivos na pasta compartilhada escolhida.

### Análise de uso e serviço {#analytics}

Nosso interesse legítimo é entender uso, corrigir problemas e medir compras. Mac/Linux enviam dados de [Seus apps](#apps). O servidor envia eventos de acesso, compras, dispositivos e equipes ao PostHog com IDs de conta, sem nomes/e-mails. IDs ligam uso e serviço. O interruptor para eventos do app, não solicitações necessárias ou eventos do servidor. Exerça [direitos](#rights) para oposição ou exclusão.

### Newsletter e e-mail {#newsletter}

Amazon SES envia códigos, convites, avisos e newsletters. E-mails de serviço cumprem o solicitado. Novas inscrições precisam de confirmação e consentimento. Guardamos endereço, idioma, datas de inscrição/confirmação, IPs, user agents, página e versão do consentimento.

Cada newsletter mede aberturas e cliques de todos os destinatários por imagem e `links.news.tablepro.app`. Amazon SES recebe hora, link, IP e user agent e passa ao servidor para contagem. Bloquear imagens para aberturas, não cliques. Links de cancelamento e e-mail não são rastreados. Não há opção separada para medição. Cancele na newsletter ou pelo controle de um clique do app de e-mail; não enviamos confirmação depois. Nova inscrição precisa confirmar. Falhas permanentes e denúncias de spam param envios. Solicite exclusão em [contato](#controller).

A lista antiga transferiu todo endereço não cancelado, confirmado ou não, incluindo compradores, titulares de licença e inscritos beta. Cancelados continuaram assim; falhas e denúncias entraram na lista de supressão. Veja [retenção](#retention).

### Suporte {#support}

Mensagens, anexos e diagnósticos chegam a nós e ao serviço escolhido. Podem conter dados ou segredos que você incluir. Crisp recebe IP, navegador e páginas vistas quando o chat carrega no site/portal. Guarda IP se você iniciar conversa. Fornecemos idioma e, no portal autenticado, e-mail e ID da conta. Carregar chat em cada página atende ao interesse legítimo de suporte. Conversas iniciadas usam consentimento.

## Seus apps {#apps}

| App e versão | Dados de uso | Controle |
| --- | --- | --- |
| Mac 0.86.0, desde 0.86.0-beta.1 | Direto ao PostHog; ativado | Settings > General > Privacy |
| Linux desde 0.1.0-beta.1 | Direto ao PostHog; ativado | Preferences > General > Privacy |
| iPhone/iPad publicados | Relatório pelo servidor; desativado até consentir | Settings > Privacy |

<span id="mac-local"></span>

### Dados no dispositivo {#local-data}

Conexões, histórico, logs locais e abas ficam no dispositivo salvo compartilhamento escolhido. Tráfego de banco vai aos seus servidores. Senhas usam o armazenamento de credenciais da plataforma. Mac referencia chaves SSH onde estão no disco. Análise não inclui hosts, usuários, SQL, linhas ou credenciais. [Integrações](#integrations), Team Library e suporte têm as exceções descritas.

### Mac {#mac-app}

Análise direta e comportamento de conta começam em 0.86.0, incluindo 0.86.0-beta.1. Login registra o Mac e busca o plano. O token fica no Keychain desse Mac e nunca sincroniza pelo iCloud Keychain. Uma chave de licença existente é trocada por login e excluída localmente.

#### Dados de uso do Mac {#mac-usage-report}

Ativados por padrão, sem pergunta antes do primeiro evento. Desative **Share usage data** em **Settings > General > Privacy**. Iniciar com a opção desligada não inicia PostHog. Nenhum relatório automático de falha é enviado; seu coletor está desativado.

Eventos cobrem uso diário com tipos/quantidade de conexões abertas, primeira tentativa, sucesso e primeira consulta por tipo, bloqueios pagos e motivos, cliques de upgrade, método de login/logout e perguntas de compra de licença com respostas. PostHog adiciona contexto de dispositivo, tela, rede, sessão, app e sistema. Recebe IP e deriva localização aproximada. Antes do login, ID aleatório sem perfil pessoal. Depois, ID de conta com perfil de versões, arquitetura, idioma e localização. Logout cria novo ID. Veja [campos e destinos](https://docs.tablepro.app/security/privacy#usage-data).

#### Atualizações e plugins {#mac-updates}

Feed e catálogo vêm do GitHub por updates.tablepro.app. Downloads e contagens também alcançam GitHub. Pedidos levam IP/user agent. Desative **Automatically check for updates** em **Settings > General > Software Update** para parar verificações automáticas. O catálogo não tem interruptor. [Detalhes técnicos](https://docs.tablepro.app/security/privacy#update-checks) incluem o feed antigo.

#### Versões antigas do Mac {#mac-license}

Antes de 0.86.0, a mesma opção ativada controla relatório ao servidor. Contém ID da máquina com hash, dados app/sistema, tipos/quantidade de conexões, licença e datas de primeira tentativa/sucesso. Configurações de atualização enviadas são descartadas. O servidor atual repassa ao PostHog com país Cloudflare, sem IP/chave e sem perfil. O ID pode ligar dispositivos da conta. Não há histórico dedicado agora, mas jobs, logs, backups e arquivo antigo podem manter dados. Veja [retenção](#retention).

Versões antigas só contatam licença após inserir chave. Enviam chave, ID, nome Mac e versões. Dispositivos pertencem à conta; ativação/desativação são auditadas com IP/user agent. O [inventário](https://docs.tablepro.app/security/privacy#older-mac-reports) mantém campos e frequência.

### iPhone e iPad {#ios-app}

O app publicado não envia relatório antes de **Share Usage Data** no início ou em **Settings > Privacy**. A base é consentimento. Relatório diário passa pelo servidor ao PostHog sem IP, com país Cloudflare e sem perfil. Contém ID Apple com hash, plataforma, versões, arquitetura, idioma, tipos/quantidade de conexões e datas de primeira tentativa, sucesso e primeira consulta. Sempre indica ausência de licença e não inclui ajustes de atualização. Não verifica conta, licença, atualização ou plugin.

Banco/SSH, iCloud opcional e login Microsoft Entra para SQL Server enviam a esses serviços. Senhas e chaves coladas ficam no Keychain; certificados e histórico no dispositivo. Conexões entram no Spotlight local. Live Activity pode mostrar SQL na tela bloqueada salvo Hide Query. Separadamente, Share With App Developers da Apple pode fornecer falhas e estatísticas por App Store Connect. O app não tem coletor de falhas ou biblioteca analítica externa. Veja [iOS](https://docs.tablepro.app/ios#privacy).

### Linux {#linux-app}

Desde 0.1.0-beta.1, login registra dispositivo conforme [contas](#account). Segredos usam o chaveiro desktop. Atualizações do gerenciador de pacotes seguem seu distribuidor. Nenhum relatório automático de falha.

#### Dados de uso do Linux {#linux-usage-data}

Ativados por padrão desde 0.1.0-beta.1. Desative Share usage data em Preferences > General > Privacy. Direto ao PostHog EU: uso diário com tipos/quantidade de conexões, primeira tentativa/sucesso e consulta por tipo, login/logout, cliques upgrade e perguntas de licença/respostas Buy. Levam IDs, versões, arquitetura, idioma e metadados SDK. PostHog recebe IP e deriva localização. Antes do login, ID aleatório sem perfil; depois, perfil liga uso e compras. Logout redefine ID. Nenhum host, SQL, linha ou credencial. Registro de dispositivo inclui hostname separadamente.

Desligar para novos envios. Pedido em andamento pode terminar. Não exclui eventos anteriores nem interrompe conta e análise do servidor. Veja [retenção](#retention), [direitos](#rights) e [inventário](https://docs.tablepro.app/security/privacy#linux-usage-data).

<span id="mac-third-parties"></span>

## Serviços escolhidos {#integrations}

Provedores de banco, SSH e proxy recebem tráfego solicitado diretamente. Serviços de login recebem autenticação quando configurados. Apple Maps fornece mapas; DuckDB extensões usadas. Helpers baixados de conexão/IA contatam provedores. Seus termos se aplicam.

### iCloud e Handoff {#icloud}

iCloud Sync opcional guarda conexões, grupos, tags, ajustes, consultas e perfis SSH no CloudKit privado. No Mac, também sincroniza favoritos e pastas de tabelas e bancos de dados, além de nomes, usuários e modos de senha dos perfis de credenciais, nunca a senha do perfil. Apple hospeda; não podemos ler. Sincronizar senhas é opção separada, desligada, pelo iCloud Keychain com criptografia ponta a ponta. No Mac inclui outros segredos gravados ali, como chaves IA e licenças antigas. Tokens de conta nunca sincronizam. Mac exige Pro ou Team; iOS é grátis. Handoff passa ID conexão e tabela, ou nome/host sem tabela, entre dispositivos Apple, sem credenciais. Veja [controles](https://docs.tablepro.app/features/icloud-sync).

### IA e ferramentas externas {#ai-tools}

IA envia direto ao provedor ou modelo local escolhido. Pode enviar prompts, esquema, SQL e conversa. Anexar linhas da grade vem desligado. Resultados de ferramenta de consulta autorizada também entram na conversa e chegam ao provedor, independentemente da opção. GitHub Copilot baixa helper do npm e inicia com Send telemetry to GitHub ativado.

MCP vem desligado e não inicia assim, nem via bridge ou pareamento. Ligado, clientes autenticados pedem dados dentro das permissões. Cliente IA pode enviar resultados ao próprio serviço. Servidores MCP externos recebem argumentos aprovados. Veja [controles IA/MCP](https://docs.tablepro.app/security/privacy#ai-providers).

## Sites e armazenamento do navegador {#website}

Servidor e Cloudflare recebem IP, user agent e páginas. Cloudflare Web Analytics conta visitas, referências, tempos, categorias navegador/sistema/dispositivo e países sem armazenamento ou fingerprint. O interesse legítimo é entender e manter o site.

Google Analytics carrega em Consent Mode. Antes de Allow, envia sinal sem cookie ou ID salvo. Consentimento ativa cookies e medida de visitas, downloads e checkout. Armazenamento publicitário, personalização e dados de anúncio são sempre negados. Google diz que GA4 não guarda IP.

Crisp carrega em todo site/portal como em [suporte](#support). Apontar ou tabular para Buy carrega script {merchant} do jsDelivr, que recebe IP/navegador; clicar abre checkout. Iniciar formulário carrega Turnstile contra abuso, interesse legítimo. País/fuso sugerem idioma e desconto regional por interesse legítimo; pedidos omitem cookies e respostas não ficam na página.

A primeira visita cria `tablepro:attribution` por 90 dias: tags/referência, página inicial e data. No checkout, servidor passa origem a {merchant} como metadados, guarda no pedido e envia ao PostHog com checkout/pagamento. Página/data não ficam. A base é interesse legítimo em medir fontes de compra. Pedidos públicos de newsletter, compra e desconto omitem credenciais e não criam cookie do portal. O portal não executa script analítico, mas o servidor envia eventos.

### Documentação {#docs}

Mintlify hospeda docs.tablepro.app. Pedidos de página, Google Fonts e estrelas GitHub revelam IP/navegador aos provedores. Docs pede consentimento separado. Antes de Allow não guarda cookies analíticos ou ID. Allow ativa Google Analytics e ID Mintlify. Cookie settings no rodapé revoga e remove ambos. A escolha do site não cruza para essa origem.

### Cookies e armazenamento {#cookies}

Cloudflare Web Analytics não guarda nada no navegador. Páginas públicas não criam cookies próprios. Prazos são separados da retenção dos provedores. Armazenamento necessário mantém login ou escolha; consentimento e interesses estão descritos aqui.

| Nome/serviço | Finalidade e início | Prazo e controle |
| --- | --- | --- |
| `_ga`, `_ga_<ID>` | Google Analytics após consentir | Até 2 anos; recusar exclui |
| `tablepro:analytics-consent` | Escolha necessária, separada site/docs | Até limpar |
| `tablepro:attribution` | Fonte inicial enviada ao checkout; interesse legítimo | 90 dias |
| `theme`, `tablepro:language`, `tablepro:campaign-closed` | Aparência, idiomas escolhidos/recusados, aviso fechado; interesse legítimo | Até limpar; tema portal separado |
| `mintlify_anonymous_id` | ID docs após consentir lá | Até limpar ou recusar |
| Cookies `crisp-client/` | Continuidade do chat após carregar em toda página; interesse legítimo | 6 meses, renovados ao voltar |
| `__Host-tp_session` | Login necessário no portal | 30 dias autenticado; até 10 minutos durante login; sair exclui |
| `locale`, `context`, `sign-in-return-to` | Idioma, vista Personal/equipe e retorno; interesse legítimo | Dois primeiros até limpar; retorno 15 minutos |

Mude o consentimento com Cookie settings no rodapé ou aqui:

<cookie-settings></cookie-settings>

## Destinatários {#sharing}

| Destinatário | Dados e finalidade |
| --- | --- |
| [OVH]({ovhPrivacy}) | Servidor e registros do serviço |
| [Cloudflare]({cloudflarePrivacy}) | DNS/proxy, R2/backups, Turnstile, Cloudflare Web Analytics |
| [Amazon Web Services]({awsPrivacy}) | E-mail Amazon SES, entrega e interação; links CloudFront, eventos SNS/SQS |
| [PostHog EU]({posthogPrivacy}) | Análise app/servidor; IDs sem nomes/e-mails; pedidos diretos com IP |
| [{merchant}]({merchantPrivacy}) | Merchant of record independente; checkout, cobrança e compras |
| [Crisp]({crispPrivacy}) | Chat, navegador/páginas e identidade da conta autenticada |
| [Google]({googlePrivacy}) | Análise site/docs e fontes; login escolhido |
| [Mintlify]({mintlifyPrivacy}) | Hospedagem docs e medição consentida |
| [GitHub]({githubPrivacy}) | Downloads, atualizações, plugins, estrelas, issues públicas e login opcional |
| [Apple]({applePrivacy}) | Login opcional; serviços/diagnósticos em apps/integrações |
| [jsDelivr]({jsdelivrPrivacy}) | Script checkout com IP/navegador |

Membros recebem conteúdo e dados conforme a função. Integrações recebem o que você envia. Não vendemos dados nem compartilhamos para publicidade. Outras divulgações só por exigência legal. Políticas próprias dos provedores também valem.

## Locais de tratamento {#transfers}

OVH e Amazon SES ficam em Singapura (`ap-southeast-1` para SES). PostHog na UE; Crisp tem sede na França. {publisherName} opera do Vietnã. Provedores dos EUA, incluindo {merchant}, Google, GitHub, Cloudflare, Amazon Web Services e Mintlify, processam nos EUA. Armazenamento/backups podem envolver outros países. Garantias EEE/Reino Unido usam cláusulas contratuais padrão ou mecanismos aprovados dos provedores; Google também usa EU-US Data Privacy Framework. Peça informações em [contato](#controller).

## Retenção {#retention}

Não fixamos limite onde indicado. Excluir conta não exclui PostHog ou Crisp. Escreva via [contato](#controller) para exclusão nesses provedores mediante solicitação.

| Registros | Retenção e exclusão |
| --- | --- |
| Análise PostHog | Sem limite definido. Desligar deixa eventos anteriores. Solicite exclusão. |
| Jobs e logs servidor | Jobs mantêm relatórios durante envio/tentativas. Logs servem à segurança/diagnóstico. Sem limite geral; nenhuma promessa de zero cópias. |
| Dispositivos | Inclusive removidos, até excluir conta |
| Conta e auditoria | Conta, acessos, dispositivos, licenças e vínculos removidos. Auditoria fica sem limite; campos e-mail e IP/user agent do autor removidos, mas endereços em texto livre podem ficar. |
| Pedidos e avisos provedores | Pedidos fiscais/contábeis sem limite. Vínculos conta/e-mail removidos. Eventos {merchant}, Amazon SES e Apple ficam; dados pessoais de compra e destinatário/interação de e-mail são limpos para a conta excluída. |
| Team Library | Item excluído mantém última versão para sync. Exclusão normal de equipe remove biblioteca após 30 dias, restaurável antes. Excluir conta do único proprietário remove ambos imediatamente. Fim da licença não exclui. |
| Autenticação | Links/códigos expiram em 15 minutos, excluídos 7 dias depois. Sessões 30 dias. Tokens expiram 90 dias após uso, excluídos 30 depois. Jobs e-mail guardam texto claro até limpeza: um dia após enviar ou 7 após desistir. |
| Newsletter | Novos endereços não confirmados após 30 dias. Confirmados/migrados até solicitação ou exclusão da conta com o endereço. Cancelar mantém endereço marcado cancelado. |
| Supressão | Endereços com falhas/denúncias e primeiras/últimas datas ficam após excluir conta/inscrição para impedir envios. Sem limite. |
| Google Analytics | Dados de usuário/evento: 2 meses; relatórios totais padrão separados |
| Cloudflare Web Analytics | Totais dos últimos seis meses disponíveis |
| Suporte | Crisp e caixa postal até excluir, também a pedido. Sem limite. |
| Backups e arquivo migração | Sem limite. Excluir conta não remove cópias. Base antiga completa contém nomes/e-mails, licenças, pedidos, equipes, nomes de dispositivos, inscritos, beta, e-mails, relatórios de uso e logs de licença com IP. |

## Escolhas e direitos {#rights}

Use interruptores, Cookie settings site/docs e cancelamento newsletter. Retirar consentimento vale para o futuro sem invalidar tratamento anterior. Opções não excluem dados antigos ou param análise servidor. Em [Settings do portal]({account}), exporte ou exclua conta; não cobre todos os registros retidos.

Conforme residência, solicite acesso, correção, exclusão, restrição, portabilidade ou oposição ao interesse legítimo. Sem conta: escreva em [contato](#controller). Podemos pedir detalhes para encontrar registros, como ID instalação. Nunca envie chave de licença em texto claro por e-mail. Respondemos em um mês. Você pode reclamar à autoridade de proteção de dados. Obrigações legais podem limitar exclusão.

### Direitos regionais {#regional-rights}

**Residentes da Califórnia.** A California Consumer Privacy Act dá o direito de saber quais informações pessoais coletamos, pedir sua exclusão, recusar sua venda e não receber tratamento diferente por exercer esses direitos. Não vendemos informações pessoais.

## Crianças {#children}

TablePro não se destina a menores de 16 anos e não coletamos seus dados conscientemente. Se acreditar que uma criança nos forneceu dados, entre em contato e os excluiremos.

## Segurança {#security}

Os serviços usam HTTPS. Contas não têm senhas. Credenciais e tokens API de equipe são hashes, salvo job e-mail temporário em [retenção](#retention). Acesso limitado a {publisherName} e [destinatários](#sharing). Nenhum sistema é perfeitamente seguro. Informe vulnerabilidades na [página segurança](/pt-BR/security#report).

## Mudanças {#changes}

A página mostra a última atualização. Versões anteriores ficam no [histórico público do repositório web]({webGithub}/commits/main/resources/data/legal/en/privacy.md). Atualizamos antes de novas finalidades, avisamos diretamente quando a lei exige e pedimos novo consentimento quando necessário.
