---
title: Política de privacidade
description: O que os apps, site e portal da conta TablePro coletam, para onde os dados vão, por quanto tempo são mantidos e como alterá-los ou excluí-los.
updatedAt: "2026-10-30"
---

Esta política abrange TablePro para Mac, TablePro para iPhone e iPad, o site tablepro.app, a documentação em docs.tablepro.app e o portal da conta account.tablepro.app. Descreve o que cada um realmente envia e armazena hoje. Os dois apps são de código aberto sob a AGPLv3, portanto você pode ler o código que envia os dados abaixo no [repositório TablePro]({github}).

## Resumo {#summary}

- O app para Mac envia dados de uso. Está ativado por padrão e pode ser desativado. O app para iPhone e iPad só envia um relatório de uso se você ativar.
- Se você entrar em uma conta TablePro ou ativar uma chave de licença, o app para Mac registra seu Mac em nosso servidor, com o nome dele, e verifica seu plano com ele regularmente.
- Consultas, resultados e senhas não são enviados ao TablePro. A exceção é o que você escolhe publicar na Team Library: configurações de conexão (nunca senhas) e consultas salvas.
- Solicitações de IA vão do app para Mac diretamente ao provedor configurado por você, não a nós.
- A partir da versão que traz as contas TablePro, o app para Mac envia seus dados de uso diretamente ao PostHog, nosso serviço de análise de produto na UE, que então recebe o endereço IP do seu Mac e deduz dele uma localização aproximada. As versões anteriores e o app para iPhone e iPad enviam relatórios de uso ao nosso servidor, que os repassa ao PostHog sem os endereços IP. Sua conta mantém um registro das mudanças feitas nela, como acessos e novos dispositivos, com o endereço IP e o navegador da solicitação que fez cada uma.
- O site conta visualizações de página com Cloudflare Web Analytics, que não define cookies. Também carrega Google Analytics, que só define cookies se você permitir. Todas as páginas carregam nosso chat ao vivo, Crisp, que define seus próprios cookies.
- O portal da conta em account.tablepro.app não carrega nenhum script de análise. Ele define um cookie para manter você conectado, e nas configurações dele você pode baixar os dados da sua conta ou excluí-la.
- As compras são vendidas por {merchant}, nosso merchant of record.

## Quem é responsável {#controller}

{publisherName}, um desenvolvedor independente em {publisherCity}, {publisherCountry}, publica os apps do TablePro e este site, e é responsável pelos dados pessoais descritos aqui (o controlador de dados). Para dúvidas sobre esta política ou seus dados, envie um email para [{email}](mailto:{email}).

## TablePro para Mac {#mac-app}

### Dados de uso {#mac-usage-report}

A partir da versão que traz as contas TablePro, o app para Mac envia dados de uso diretamente ao PostHog, nosso serviço de análise de produto, em `eu.i.posthog.com`, na UE. **Está ativado por padrão, e o app não pede confirmação antes de enviar o primeiro evento.** Para desativar, abra **Settings > General > Privacy** e desmarque **Share usage data**. Enquanto a configuração está desativada, o app não envia nada ao PostHog, e se o app iniciar com ela desativada, nem chega a iniciar a biblioteca do PostHog.

O app envia um evento:

- uma vez por dia enquanto está em execução, com os nomes dos tipos de banco das conexões abertas (por exemplo, "PostgreSQL") e quantas conexões estão abertas;
- na sua primeira tentativa de conexão, na primeira conexão bem-sucedida e na sua primeira consulta, cada uma com o tipo de banco;
- quando mostra que um recurso pago não está disponível, uma vez por recurso a cada execução do app, com o recurso e o motivo, como não ter entrado na conta;
- quando você clica para fazer upgrade, com o lugar do app onde clicou;
- quando você entra, com a forma (no app, com uma chave de licença ou pela troca da chave que já estava no Mac), e quando você sai.

A biblioteca do PostHog adiciona a cada evento o modelo do Mac, o tamanho da tela, o fuso horário e o idioma, se ele está no Wi-Fi, a versão, o build e o bundle ID do app, a versão do macOS, a versão da biblioteca e um ID de sessão aleatório. O PostHog recebe o endereço IP do Mac a cada solicitação e deduz dele uma localização aproximada, como o país e a cidade. Enquanto a configuração está ativada, a biblioteca também busca no PostHog suas configurações e feature flags (`/config` de `eu-assets.i.posthog.com` e `/flags` de `eu.i.posthog.com`).

Antes de você entrar, os eventos levam um ID aleatório que a biblioteca cria no Mac, e o PostHog não cria um perfil de pessoa para ele. Quando você entra, eles passam a levar o ID da sua conta, e o perfil dessa conta no PostHog guarda as versões do app e do macOS, a arquitetura do processador, o idioma do app e a localização aproximada que o PostHog deduz do endereço IP. Isso liga suas instalações aos seus acessos e compras. Sair da conta inicia um novo ID aleatório. Os dados de uso do app não levam mais o ID de máquina, se há uma licença ativada nem as configurações de atualização.

As versões anteriores às contas TablePro enviam, em vez disso, um relatório de uso para `api.tablepro.app`, com a mesma configuração, cerca de dez segundos após iniciar e depois uma vez por dia enquanto estão em execução. Um relatório contém:

- um ID de máquina: hash SHA-256 do UUID de hardware do Mac (o UUID em si nunca é enviado);
- plataforma, versão do app, versão do macOS, arquitetura do processador e idioma do app;
- os nomes dos tipos de banco das conexões abertas (por exemplo, "PostgreSQL") e quantas conexões estão abertas;
- se uma licença está ativada;
- a data e a hora da primeira tentativa de conexão e da primeira conexão bem-sucedida;
- configurações de atualização (como as atualizações são instaladas e a frequência das verificações). Nosso servidor as descarta quando o relatório chega.

Nem os eventos nem os relatórios contêm nomes de host, nomes de usuário, senhas, consultas ou linhas.

Nosso servidor não armazena o relatório nem o endereço IP de origem. Ele repassa o relatório ao PostHog como um evento sobre o ID de máquina, com o país que o Cloudflare informa para sua conexão e sem sua chave de licença nem seu IP, e o PostHog não cria com ele um perfil de pessoa. Como sua conta lista os dispositivos pelo mesmo ID de máquina, relatórios de um Mac em que você entrou ou ativou uma licença podem ser associados à sua conta.

### Verificações de licença {#mac-license}

As versões anteriores às contas TablePro só contatam nosso servidor de licenças após você digitar uma chave de licença. Isso ocorre ao ativar a licença, ao iniciar se houverem passado {revalidateDays} dias ou mais desde a última verificação e a cada {revalidateDays} dias depois disso. Cada verificação envia:

- sua chave de licença;
- o ID de máquina descrito em [Dados de uso](#mac-usage-report);
- o nome do Mac definido no macOS (que frequentemente inclui seu próprio nome);
- a versão do app e a versão do macOS.

Desativar um Mac envia apenas a chave de licença e o ID de máquina.

Nosso servidor mantém cada Mac ativado como dispositivo da conta dona da licença: ID de máquina e nome, versões do app e do macOS e quando ele se comunicou pela última vez. A ativação e a desativação de um Mac ficam no registro de auditoria dessa conta com o endereço IP e o user agent da solicitação; as verificações periódicas não. O portal da conta lista seus dispositivos pelo nome. Se o servidor não puder ser acessado, os recursos pagos continuam funcionando por {graceDays} dias após a última verificação bem-sucedida.

### Conta TablePro {#mac-account}

A partir da versão que traz as contas TablePro, você entra no app para Mac com uma [conta TablePro](#account) em vez de uma chave de licença. O app abre a página de acesso em uma janela do navegador, onde você pode digitar o código do email de acesso. Depois de entrar, ele registra seu Mac como dispositivo da sua conta: o ID de máquina descrito acima, o nome do seu Mac, a plataforma e as versões do app e do macOS. Em seguida busca seu plano em nosso servidor como um arquivo assinado uma vez por dia enquanto está aberto, e esse arquivo mantém os recursos pagos funcionando por até {offlineDays} dias sem nosso servidor. O token que mantém o app conectado fica só nas Chaves do macOS daquele Mac e nunca é sincronizado pelas Chaves do iCloud, mesmo com a sincronização de senhas ativada.

Uma chave de licença que já esteja no seu Mac é trocada uma única vez por um acesso à conta dona dela e depois excluída do Mac. Um dispositivo que não se comunica por 180 dias é removido. Você pode remover dispositivos no app ou no portal da conta, e na primeira vez que um Mac usa sua licença avisamos você por email.

### Team Library {#library}

A Team Library faz parte de uma licença Team. Ao escolher **Share > Publish to Team Library…** em uma conexão ou **Publish Saved Queries to Team…** na barra lateral Favorites, o app para Mac envia o que você publica ao nosso servidor:

- configurações de conexão: host, porta, nome do banco, nome de usuário, configurações SSH e SSL, opções do driver, comandos de inicialização, configurações de Tunnel Command, nível de Safe Mode e configurações de IA, mas nunca senhas;
- consultas salvas: nomes, texto SQL, palavras-chave e pastas.

A partir da versão que traz as contas TablePro, o app para Mac de cada membro com vaga baixa as mudanças da biblioteca ao iniciar, a cada 15 minutos e depois de cada publicação. Publicar envia só o que mudou e remove só os itens que aquele Mac publicou e não tem mais. Se outra pessoa alterou um item antes, o app pergunta qual cópia manter, e mostra quem alterou por último cada consulta da equipe. As versões anteriores às contas TablePro baixam a biblioteca ao iniciar, no máximo uma vez por semana; o Mac que publica a baixa novamente logo após. Publicar novamente a partir delas substitui o que você publicou antes. A seção Library do portal da conta mostra cada item, com o nome de quem o alterou por último, aos membros que podem ler a biblioteca, e permite que proprietários e administradores excluam itens. Um item excluído fica 90 dias no servidor, para que todos os Macs possam sincronizar a exclusão. Se a licença terminar, a biblioteca permanece no servidor até o proprietário da equipe excluir a equipe, o que também exclui a biblioteca.

Team Catalog, o outro recurso Team, grava arquivos de conexão sem senhas em uma pasta compartilhada escolhida por você. Não passa pelo nosso servidor.

### Atualizações e plugins {#mac-updates}

- **Verificações de atualização.** Uma vez por dia, o app para Mac baixa o feed de atualização do GitHub (`raw.githubusercontent.com`). A solicitação não envia informações do Mac além do que toda solicitação web contém: endereço IP e um user agent com a versão do app. Para desativar, abra **Settings > General > Software Update** e desmarque **Automatically check for updates**. As próprias atualizações são baixadas do GitHub.
- **Catálogo de plugins.** Ao iniciar o app e ao abrir as configurações de plugins, ele baixa a lista de drivers e temas disponíveis do GitHub. Não há configuração para desativar isso. Drivers e temas instalados são baixados do GitHub, e o navegador de plugins lê as contagens de downloads pela API do GitHub.

GitHub recebe seu endereço IP com essas solicitações. A declaração de privacidade do próprio GitHub se aplica a elas.

### Serviços que você escolhe usar {#mac-third-parties}

O app para Mac só envia dados a estes serviços quando você os configura, diretamente, nunca pelo TablePro:

- **Seus bancos, servidores SSH e proxies**, que recebem o que as conexões enviam.
- **Provedores de IA.** Ao adicionar um provedor e usar o assistente ou sugestões em linha, as solicitações vão ao provedor ou a um modelo no Mac. Por padrão, incluem tipo e nome do banco, definições de tabelas e colunas do esquema e a consulta atual. Linhas de resultados só são enviadas se você ativar. Os termos do próprio provedor se aplicam. Adicionar GitHub Copilot baixa seu servidor de linguagem do npm, e a configuração "Send telemetry to GitHub" vem ativada.
- **Serviços de autenticação**: Microsoft Entra ID, Google, Amazon Web Services e Cloudflare Access, quando uma conexão os usa.
- **Apple Maps**, que fornece os blocos do mapa ao mostrar resultados em um mapa.
- **DuckDB**, que fornece extensões DuckDB na primeira vez que uma consulta as usa.
- **Clientes MCP.** O servidor MCP vem desativado. Inicia quando você o ativa ou quando um cliente MCP configurado inicia a ponte do TablePro ou faz pareamento, e escuta apenas no seu Mac (127.0.0.1). Um cliente de IA conectado, como Claude ou Cursor, recebe os resultados solicitados e os envia ao próprio serviço sob seus próprios termos.
- **Servidores MCP adicionados por você.** Uma sessão de IA envia as chamadas de ferramentas aprovadas, com seus argumentos, ao servidor.

### Dados que ficam no seu Mac {#mac-local}

As senhas ficam nas Chaves do macOS. Lista de conexões, histórico de consultas, Query Insights, snapshots de Data Rewind, configurações e abas abertas são armazenados no Mac. O app referencia as chaves SSH onde estão no disco e não as copia. As versões anteriores às contas TablePro não contêm relator de falhas nem biblioteca de análise de terceiros. A partir da versão que traz as contas TablePro, o app inclui a biblioteca do PostHog, que envia os dados de uso descritos acima. A biblioteca contém o relator de falhas do PostHog, que o app mantém desativado, então nenhum relatório de falha é enviado. Ela guarda seu ID aleatório, suas configurações e os eventos ainda não enviados em arquivos em `~/Library/Application Support/com.TablePro`.

## TablePro para iPhone e iPad {#ios-app}

**Nada vai ao TablePro, a menos que você ative Share Usage Data**, na primeira inicialização ou depois em **Settings > Privacy**. Nesse caso, o app envia um relatório diário ao mesmo servidor das versões do app para Mac anteriores às contas TablePro, e nosso servidor o repassa ao PostHog da mesma forma, sem o IP. O relatório contém um hash SHA-256 do identificador atribuído pela Apple ao app no dispositivo, plataforma, versões do app e iOS, arquitetura do processador, idioma, nomes dos tipos de banco das conexões abertas, quantas estão abertas, e a data e a hora da primeira tentativa de conexão, da primeira conexão bem-sucedida e da primeira consulta. Não inclui configurações de atualização e sempre informa que não há licença ativada, pois o app não tem nenhuma das duas coisas.

O app não verifica licenças, não verifica atualizações e não solicita plugins. Além do relatório opcional, conecta apenas aos seus bancos e servidores SSH, ao iCloud da Apple se você ativar o iCloud Sync e à Microsoft quando uma conexão SQL Server autentica com Microsoft Entra ID.

No dispositivo, senhas e chaves SSH coladas ficam nas Chaves, e certificados nunca são sincronizados. O histórico de consultas fica no dispositivo. As conexões são adicionadas ao índice Spotlight local para pesquisa. Durante uma consulta, a Atividade ao Vivo mostra o SQL na Tela Bloqueada e na Dynamic Island expandida, a menos que você ative **Settings > Live Activities > Hide Query**.

Se compartilhar análises com desenvolvedores nos ajustes do iPhone ou iPad, a Apple poderá nos fornecer relatórios de falhas e estatísticas de uso pelo App Store Connect. O app não contém relator de falhas nem biblioteca própria de análise de terceiros.

## iCloud Sync e Handoff {#icloud}

O iCloud Sync fica desativado até você ativá-lo, no Mac e no iPhone e iPad. Quando ativo, os registros vão para um banco privado na sua conta iCloud (container `iCloud.com.TablePro`). TablePro não pode lê-los.

- No Mac, você escolhe o que sincronizar: conexões, grupos e etiquetas, configurações, perfis SSH, perfis de credenciais (nome e nome de usuário, nunca senha), tabelas e bancos favoritos, consultas salvas (incluindo SQL) e pastas de tabelas. Um registro de conexão inclui host, porta, nome de usuário, nome do banco, configurações SSH e SSL, comandos de inicialização, script de pré-conexão e regras de IA. Histórico de consultas, snapshots de Data Rewind e fontes de senha nunca são sincronizados.
- iPhone e iPad sincronizam conexões, grupos e etiquetas.
- Senhas só são sincronizadas se você também ativar **Passwords** em Sync Categories no Mac ou **Sync Passwords** no iPhone e iPad, usando as Chaves do iCloud. No Mac, isso também sincroniza outros segredos guardados pelo TablePro nas Chaves, como chaves de provedores de IA e a chave de licença. A partir da versão que traz as contas TablePro, a chave de licença é excluída assim que é trocada por um acesso, e o token que mantém o app conectado nunca é sincronizado.

No Mac, o iCloud Sync faz parte de uma licença Starter ou Team. No iPhone e iPad é gratuito.

Handoff transmite o ID da conexão aberta e o nome da tabela aberta entre seus dispositivos, pela Apple. Sem tabela aberta, transmite o nome da conexão ou o host se ela não tiver nome. Não envia configurações nem credenciais.

## Site {#website}

**Hospedagem.** O site e o portal da conta rodam no nosso servidor, atrás do Cloudflare. Como qualquer servidor web, recebem seu endereço IP, user agent do navegador e endereço de cada página solicitada.

**Cloudflare Web Analytics.** Cloudflare adiciona seu script Web Analytics às páginas do site; o portal da conta não o executa. O navegador o carrega de `static.cloudflareinsights.com`, e ele informa cada visualização ao Cloudflare: página, site de origem do link, tempo de carregamento, navegador, sistema operacional e tipo de dispositivo. Cloudflare adiciona o país de origem da conexão. O script não define cookies nem armazena nada no navegador, e Cloudflare afirma que não usa IP nem detalhes do navegador para identificar você por fingerprinting. Cloudflare nos mostra totais, como visualizações por página ou país, não registros individuais de visitantes. Base legal: interesse legítimo.

**Google Analytics.** O site carrega Google Analytics em todas as páginas no Modo de Consentimento. Até você escolher **Permitir** na pergunta sobre cookies, ele não define cookies e envia ao Google apenas um sinal sem cookies por página, sem identificador armazenado no dispositivo. Se permitir, Google Analytics define os cookies `_ga` e `_ga_<ID>` e mede visitas, como páginas vistas, cliques de download e início de checkout. Armazenamento de publicidade, personalização de anúncios e dados de usuário para anúncios são sempre negados. Google afirma que Google Analytics 4 não registra nem armazena IPs. Nossa propriedade Google Analytics usa o prazo de retenção padrão do Google: os dados coletados no nível de usuário e evento são excluídos após 2 meses. Os relatórios padrão, que guardam totais em vez de identificadores, não são afetados. Base legal: seu consentimento para cookies.

**Chat ao vivo.** Todas as páginas do site e portal da conta mostram um botão do nosso provedor de chat, Crisp. Após a página carregar, o navegador carrega o script Crisp de `client.crisp.chat`, e Crisp define os cookies descritos em [Cookies e armazenamento do navegador](#cookies). Crisp recebe seu IP, detalhes do navegador, endereços das páginas vistas e mensagens escritas e mantém seu IP se você iniciar uma conversa. Informamos ao Crisp o idioma da página. Quando você está conectado ao portal da conta, também passamos ao Crisp o e-mail e o ID da sua conta, que ligam a conversa à sua conta. Nada mais sobre você é informado ao Crisp. Crisp está sediado na França.

**Script de checkout.** Ao apontar ou navegar pelo teclado até um botão Comprar, o navegador carrega o script de checkout de {merchant} do jsDelivr (`cdn.jsdelivr.net`), que recebe IP e detalhes do navegador. O checkout só abre de {merchant} quando você clica.

**Verificação da newsletter.** Quando você começa a usar o formulário da newsletter, o navegador carrega o Cloudflare Turnstile de `challenges.cloudflare.com` para verificar que é uma pessoa se inscrevendo; o Cloudflare recebe seu endereço IP e detalhes do navegador.

**Atribuição de compras.** Ao chegar ao site, o navegador mantém um registro da primeira visita chamado `tablepro:attribution` no armazenamento local por 90 dias: origem da visita (as tags `ref` ou `utm_*` do link seguido ou o site de origem), página de chegada e momento. Se iniciar uma compra, o registro acompanha a solicitação de checkout. Nosso servidor envia a origem da visita a {merchant} como metadado do checkout, guarda-a com o pedido quando você paga e a envia ao PostHog com o checkout e o pagamento. A página de chegada e o momento não são guardados.

**Documentação.** A documentação em docs.tablepro.app é hospedada pela Mintlify, que recebe seu endereço IP e os dados do seu navegador a cada página, e as páginas carregam as fontes do Google Fonts. A barra de navegação mostra o número de estrelas do repositório, que seu navegador busca na API do GitHub, então o GitHub também recebe seu endereço IP e os dados do seu navegador. Essa solicitação não define cookies. A documentação faz a própria pergunta sobre cookies, porque não consegue ler a resposta que você deu neste site. Até você escolher **Allow** lá, ela não define cookies nem guarda um ID de visitante. Se permitir, Google Analytics define os cookies `_ga` e `_ga_<ID>` e mede suas visitas à documentação, e Mintlify guarda um ID de visitante aleatório, `mintlify_anonymous_id`, no armazenamento local para contá-las. **Cookie settings**, no rodapé da documentação, altera sua resposta, e recusar remove os dois. Base legal: seu consentimento.

**Idioma e desconto regional.** Para sugerir a página no seu idioma quando o navegador não indica nenhum dos idiomas do site, e para mostrar o desconto regional que o checkout aplicaria, o site pergunta à Cloudflare (`/cdn-cgi/trace`) e ao nosso servidor de qual país vem a sua conexão, e pode ler o fuso horário do seu dispositivo. Nenhuma das duas solicitações leva cookies, e a página não guarda nada das respostas. Base legal: interesse legítimo.

Ler o site não define cookies próprios. As solicitações de inscrição na newsletter, checkout e códigos de desconto do site público omitem credenciais: não enviam cookies do portal da conta nem aceitam cookies da resposta. Abrir páginas do portal da conta é uma operação separada: entrar nele define o cookie do portal abaixo. Tudo que o site mantém no navegador está listado em [Cookies e armazenamento do navegador](#cookies).

## Compras {#purchases}

As licenças são vendidas por {merchant} (Polar Software, Inc.), nosso merchant of record e revendedor. Você compra de {merchant} sob seus próprios termos para compradores e política de privacidade. {merchant} recebe o pagamento, calcula e recolhe tributos sobre vendas ou IVA, envia recibos e faturas e trata problemas e disputas de pagamento. Coleta nome, email, endereço de cobrança e detalhes de pagamento. Nunca vemos os dados completos do cartão.

Quando você inicia um checkout, nosso servidor informa a {merchant} o que você está comprando, o idioma da página de compra, a origem da sua visita (veja [Site](#website)) e seu endereço IP, que {merchant} usa para calcular impostos e moeda. De {merchant}, recebemos email, nome e endereço de cobrança conforme inseridos, o que comprou, valores, IDs de pedido e assinatura e mudanças posteriores, como renovações, cancelamentos e reembolsos. Com cada pedido guardamos o email, o país de cobrança e os valores.

Uma compra feita sem entrar vai para a conta TablePro do email usado na compra, que é criada se não existir e fica sem verificação até você entrar pela primeira vez. No [portal da conta]({account}) você pode mudar o ciclo de cobrança ou as vagas de uma assinatura, cancelá-la ou retomá-la e pedir reembolso. Ao cancelar, o motivo escolhido e o comentário que você escrever vão para {merchant} e ficam com a assinatura. Cartão, faturas, dados fiscais e endereço de cobrança estão no [portal do cliente de {merchant}]({portal}), que o portal da conta abre para você. Os reembolsos são descritos na [política de reembolso](/pt-BR/refund-policy), e o que a licença permite nos [termos de serviço](/pt-BR/terms).

## Portal da conta {#account}

O [portal da conta]({account}) em account.tablepro.app é onde você gerencia sua conta TablePro: licenças, dispositivos, cobrança e equipes. Ele roda em nosso servidor, atrás do Cloudflare, como o site.

**Sua conta.** Uma conta pertence a uma pessoa e é identificada por um email. Ela guarda esse endereço, o nome e o idioma que você definir, seus métodos de acesso, os dispositivos conectados a ela, suas licenças e pedidos, as equipes de que você faz parte com sua função e vaga, e um registro de auditoria das mudanças feitas nela, como acessos, novos dispositivos e mudanças de equipe, com o endereço IP e o navegador da solicitação que fez cada uma. Nossos emails chegam a você no idioma da sua conta.

**Acesso.** Enviamos por email um link e um código de 6 dígitos: o link funciona uma vez, o código aceita 5 tentativas e ambos expiram após 15 minutos. Você também pode adicionar chaves de acesso; de cada uma guardamos a chave pública, o nome que você der, se ela sincroniza entre seus dispositivos e quando foi adicionada e usada pela última vez. Ou você pode entrar com Apple, GitHub ou Google: o provedor nos informa um ID seu e seu email verificado, e a Apple também seu nome na primeira vez. Guardamos o ID e o endereço com sua conta e, para a Apple, um token que mantemos criptografado e revogamos junto à Apple quando você desvincula a Apple ou exclui sua conta. Se o endereço de um provedor pertencer a uma conta existente, enviamos a essa conta um link e um código para confirmar antes de vinculá-las, a menos que o Google gerencie o endereço (Gmail ou Google Workspace).

**Suas equipes.** Ao convidar alguém para uma equipe, guardamos o email, a função e se o convite inclui uma vaga, e enviamos um link válido por 7 dias. Proprietários e administradores veem os membros da equipe com nomes e emails, os convites e o registro de auditoria da equipe, que mostra quem mudou o quê, incluindo endereços convidados, mas nunca um endereço IP ou navegador. Membros veem a equipe, o plano, as vagas e a própria função.

**Seus dados.** Nas configurações você pode mudar nome, email e idioma, adicionar e remover métodos de acesso, baixar os dados da sua conta em um arquivo JSON e excluir sua conta. Não é possível excluí-la enquanto você for proprietário de uma equipe com outros membros. A exclusão remove seus métodos de acesso, dispositivos, licenças, participações em equipes e as equipes que só têm você, e encerra suas assinaturas sem reembolso. O que guardamos depois está em [Por quanto tempo mantemos dados](#retention).

**O que o portal carrega.** O portal não carrega Google Analytics, Cloudflare Web Analytics nem nenhum outro script de análise, e não faz pergunta sobre cookies. Ele mostra o chat ao vivo do Crisp descrito em [Site](#website), e uma compra feita nele abre o checkout de {merchant} sobre a página. Ele informa erros e tempos de carregamento ao Grafana Cloud com o Grafana Faro: o erro, a tela onde ocorreu (nunca o endereço completo, que pode conter o token de um link), seu navegador e sistema operacional, e um ID aleatório da sua visita.

## Newsletter {#newsletter}

Se você se inscrever nas notas de versão, primeiro enviamos um link de confirmação no idioma da página de inscrição. O link vale por 7 dias, e um endereço recebe no máximo 3 por dia. Depois que você confirma, seu endereço entra na nossa lista da newsletter no Resend, o serviço que envia nossos emails. Toda newsletter tem um link para cancelar a inscrição, tratado pelo Resend. Após cancelar, não enviamos mais newsletters; para excluir também o endereço, envie um email. O Cloudflare Turnstile verifica o formulário, como descrito em [Site](#website).

Na mudança do nosso servidor anterior, todo endereço da lista de emails dele que não tinha cancelado a inscrição entrou nesta lista como inscrito, confirmado ou não: aquele servidor também adicionava os endereços de compradores, titulares de licença e inscritos no beta, e enviava emails a eles. Os endereços que tinham cancelado a inscrição vieram como cancelados, e aqueles cujos emails tinham voltado ou sido marcados como spam foram para a lista de supressão do Resend, para que nenhuma newsletter chegue a eles.

## Cookies e armazenamento do navegador {#cookies}

Ler o site público e suas solicitações de newsletter, checkout e códigos de desconto não define cookies próprios. Entrar no portal da conta, ou começar a entrar, define o único cookie estritamente necessário listado abaixo. Cloudflare Web Analytics não define cookies nem armazena nada no navegador. Os cookies do Google Analytics só são definidos com seu consentimento. Crisp define seus cookies em cada página após a chat carregar. Nada aqui é usado para publicidade ou vendido.

- **`_ga` e `_ga_<ID>`** (cookies Google Analytics, até 2 anos, apenas se permitir análises): um identificador aleatório do navegador e o estado da visita atual. Recusar ou alterar sua resposta depois os exclui. Base legal: consentimento.
- **`tablepro:analytics-consent`** (armazenamento local, até você limpar): sua resposta à pergunta de análises, para não perguntar em todas as páginas. O portal da conta não carrega análises, então não faz essa pergunta nem lê a resposta. Base legal: estritamente necessário para respeitar sua escolha.
- **`tablepro:attribution`** (armazenamento local, 90 dias): registro da primeira visita descrito em [Site](#website). Não contém um identificador seu e só é enviado com a solicitação de checkout, que envia a origem da visita a {merchant}. Base legal: interesse legítimo.
- **`theme`** (armazenamento local, até você limpar): se escolheu aparência clara, escura ou do sistema. O portal da conta guarda a sua própria. Base legal: interesse legítimo.
- **`tablepro:language`** (armazenamento local, até você limpar): o idioma que você escolheu no menu de idiomas ou na barra de idioma e cada idioma cuja sugestão você fechou, para que não seja oferecido de novo. Base legal: interesse legítimo.
- **`mintlify_anonymous_id`** (armazenamento local em docs.tablepro.app, definido pela Mintlify, somente se você permitir Google Analytics lá): o ID de visitante descrito em [Site](#website). Recusar o remove. A documentação guarda a própria resposta `tablepro:analytics-consent`. Base legal: consentimento.
- **Cookies que começam com `crisp-client/`** (Crisp, por exemplo `crisp-client/session/…`; 6 meses, renovados quando você volta; definidos em todas as páginas quando o chat carrega): mantêm o chat e sua conversa entre páginas e visitas. Base legal: interesse legítimo, para oferecer suporte em todas as páginas.
- **`__Host-tp_session`** (cookie do portal da conta, 30 dias a partir do acesso): mantém sua sessão. Antes de entrar, ele só é definido enquanto um acesso por chave de acesso, Apple, GitHub, Google ou por um app está em andamento, por no máximo 10 minutos. Sair o exclui. As solicitações de newsletter, checkout e códigos de desconto do site público omitem credenciais e nunca o recebem. Base legal: estritamente necessário.
- **`locale`, `context` e `sign-in-return-to`** (armazenamento local do portal da conta): o idioma escolhido ali antes de entrar e se você abriu por último Pessoal ou uma equipe, ambos até você limpar, e por 15 minutos a página para onde voltar depois de abrir um link de acesso recebido por email. Base legal: interesse legítimo.
- **`com.grafana.faro.session`** (armazenamento de sessão do portal da conta, até você fechar a aba): o ID aleatório da visita nos relatórios de erros do portal. Base legal: interesse legítimo.

Você pode alterar ou retirar a resposta sobre análises a qualquer momento em **Configurações de cookies**, no rodapé de todas as páginas, ou aqui:

<cookie-settings></cookie-settings>

## Base legal {#lawful-basis}

Para leitores no Espaço Econômico Europeu e Reino Unido, as bases legais sob o GDPR e UK GDPR são:

- **Contrato** (Art. 6(1)(b)): vender e fornecer licenças, sua conta com seus métodos de acesso e dispositivos, verificações de licença, portal da conta e Team Library.
- **Interesse legítimo** (Art. 6(1)(f)): dados de uso do app para Mac e sua análise no PostHog, eventos sobre acessos, compras, dispositivos e equipes que nosso servidor envia ao PostHog, registro de auditoria da conta, segurança e prevenção de abuso, incluindo o Cloudflare Turnstile no formulário da newsletter, logs do servidor web e relatórios de erros do portal da conta, Cloudflare Web Analytics, registro de atribuição de compras, consulta de país para o idioma e o desconto regional, e chat ao vivo em todas as páginas.
- **Consentimento** (Art. 6(1)(a)): cookies Google Analytics, relatório de uso do app para iPhone e iPad, newsletter e conversas iniciadas no chat ao vivo.
- **Obrigação legal** (Art. 6(1)(c)): registros fiscais e contábeis e respostas a solicitações legais.

## Quem recebe dados {#sharing}

Compartilhamos dados pessoais apenas com os serviços necessários para operar TablePro:

- **{merchant}**, merchant of record das compras.
- **Resend**, que envia nossos emails: links e códigos de acesso, convites de equipe, avisos de conta e de segurança, e newsletters. Ele mantém a lista da newsletter e nos avisa quando um email para um endereço volta ou é marcado como spam.
- **Nosso provedor de hospedagem e Cloudflare**, para site, portal da conta e servidor dos apps. Cloudflare também conta visualizações com Cloudflare Web Analytics e verifica o formulário da newsletter com o Turnstile.
- **Google**, para Google Analytics no site e na documentação.
- **Crisp**, para chat ao vivo em todas as páginas do site e portal da conta.
- **PostHog** (EU Cloud), nosso serviço de análise de produto, que recebe os relatórios de uso dos apps e os eventos do nosso servidor sobre acessos, compras, dispositivos e equipes, com o ID da sua conta, mas nunca seu email ou nome. Os dados de uso que o app para Mac envia diretamente chegam ao PostHog com o endereço IP do seu Mac.
- **Grafana Labs** (Grafana Cloud), que recebe os logs e traces do nosso servidor e os relatórios de erros do portal da conta.
- **Apple, GitHub e Google**, quando você entra na sua conta com eles.
- **jsDelivr**, que fornece o script de checkout de {merchant} ao navegador ao apontar para um botão Comprar.
- **Mintlify**, que hospeda a documentação em docs.tablepro.app.
- **GitHub**, que hospeda feed de atualização, catálogo de plugins e downloads, e fornece o número de estrelas exibido na documentação.

Não vendemos dados pessoais nem os compartilhamos com anunciantes.

## Transferências internacionais {#transfers}

Os serviços acima operam em vários países, portanto os dados podem ser processados fora do seu país. {merchant}, Google, GitHub, Cloudflare e Mintlify processam dados nos Estados Unidos; Google faz isso sob o EU-US Data Privacy Framework e Cláusulas Contratuais Padrão. O PostHog os processa na União Europeia. Quando exigido por lei, transferências do EEE e Reino Unido se baseiam em Cláusulas Contratuais Padrão ou outro mecanismo aprovado.

## Por quanto tempo mantemos dados {#retention}

- **Relatórios de uso e eventos de análise**: nosso servidor não guarda cópia depois de repassá-los ao PostHog. Não definimos prazo para eles no PostHog. Excluir sua conta exclui o perfil e os eventos dela no PostHog uma hora depois.
- **Registros do nosso servidor anterior**: uma cópia de todo o banco de dados dele é mantida por tempo indeterminado em um arquivo. Ela inclui licenças, pedidos e membros de equipe com seus emails e nomes; os Macs ativados com uma licença, com seus nomes; inscritos na newsletter e no beta; registros dos emails que ele enviou; e os relatórios de uso e os registros de solicitações de licença que ele mantinha, com seus IPs.
- **Dispositivos**: mantidos enquanto estão em uso. Um dispositivo que não se comunica por 180 dias é removido, a menos que um arquivo offline dele ainda seja válido, e um dispositivo removido é excluído um ano depois.
- **Registro de auditoria da sua conta**: mantido enquanto a conta existir, com o endereço IP e o navegador de cada mudança que você fez. Excluir a conta remove dele seus emails e o endereço IP e o navegador do que você fez; o registro de cada mudança permanece.
- **Pedidos**: mantidos para fins fiscais e contábeis. Excluir sua conta remove deles seu email e sua conta.
- **Notificações de {merchant}, Resend e Apple**: 180 dias. As de {merchant} contêm nome, email e endereço de cobrança; excluir sua conta remove esses dados mais cedo das notificações sobre suas compras.
- **Team Library**: até um item ser alterado ou excluído; um item excluído é mantido por 90 dias. A biblioteca é excluída junto com a equipe e permanece após o fim de uma licença.
- **Links e códigos de acesso**: expiram após 15 minutos e são excluídos 7 dias depois. Sessões do portal duram 30 dias. O token que mantém um app conectado expira 90 dias após o último uso pelo app e é excluído 30 dias depois.
- **Contas excluídas**: a conta, seus métodos de acesso, dispositivos, licenças e participações em equipes são excluídos imediatamente. Pedidos e o registro de auditoria ficam como descrito acima. O que nosso servidor anterior guardava sobre você continua no arquivo dele, descrito acima.
- **Newsletter**: um link de confirmação e o endereço para onde foi enviado são excluídos 7 dias após o link expirar. Um endereço confirmado, ou trazido do nosso servidor anterior, fica em nossa lista no Resend até o excluirmos a seu pedido; após cancelar a inscrição, ele fica marcado como cancelado, para que nenhuma newsletter chegue a ele.
- **Google Analytics**: dados no nível de usuário e evento por 2 meses, o período padrão usado por nossa propriedade. Cookies duram até 2 anos ou são excluídos quando você recusa.
- **Cloudflare Web Analytics**: Cloudflare nos mostra totais de visualizações dos últimos seis meses. Nada é armazenado no navegador.
- **Chat ao vivo e emails de suporte**: mantidos pelo Crisp e em nossa caixa de email até serem excluídos. Solicite a exclusão das conversas e emails.
- **Logs do servidor web**: mantidos para segurança e diagnóstico de problemas. Ainda não definimos um prazo fixo.
- **Logs e traces do nosso servidor e relatórios de erros do portal**: 14 dias, no Grafana Cloud.

## Seus direitos {#rights}

Conforme seu local de residência, você pode solicitar que:

- forneçamos uma cópia dos dados pessoais que mantemos sobre você (acesso);
- os corrijamos (retificação);
- os excluamos (apagamento), exceto o que precisamos manter por lei;
- limitemos seu uso (restrição);
- os enviemos em formato estruturado e legível por máquina (portabilidade);
- deixemos de usá-los com base em interesse legítimo (oposição).

Você pode retirar o consentimento quando quiser e reclamar à autoridade de proteção de dados. Para exercer esses direitos, envie um email para [{email}](mailto:{email}). Respondemos em até 30 dias. No [portal da conta]({account}), as configurações também dão uma cópia dos dados da sua conta e excluem a conta. Para o resto, como um endereço da newsletter ou um Mac sem conta, informe o email, chave de licença ou dispositivo envolvido. Dados mantidos por {merchant}, Google, Crisp ou GitHub também são cobertos pelas políticas deles.

**Residentes da Califórnia.** A California Consumer Privacy Act dá o direito de saber quais informações pessoais coletamos, pedir sua exclusão, recusar sua venda e não receber tratamento diferente por exercer esses direitos. Não vendemos informações pessoais.

## Crianças {#children}

TablePro não é dirigido a menores de 16 anos, e não coletamos seus dados pessoais intencionalmente. Se acreditar que uma criança nos forneceu dados pessoais, entre em contato, e os excluiremos.

## Segurança {#security}

O tráfego entre apps, site, portal da conta e nosso servidor usa HTTPS. Contas TablePro não têm senha. Links e códigos de acesso, os tokens que mantêm os apps conectados e os tokens de API de equipe são armazenados como hashes. A tarefa que envia por email um link e um código de acesso os guarda em texto simples até ser excluída: um dia depois do envio do email, ou 7 dias depois de desistirmos de enviá-lo. Os dois deixam de funcionar 15 minutos depois do seu pedido. O acesso aos sistemas é limitado a {publisherName} e aos prestadores de serviço listados em [Quem recebe dados](#sharing). Nenhum sistema é perfeitamente seguro. Para relatar uma vulnerabilidade, consulte a [página de Segurança](/pt-BR/security#report) ou envie um email para [{email}](mailto:{email}).

## Alterações desta política {#changes}

Quando esta política muda, atualizamos aqui com uma nova data de "Última atualização" e, quando exigido por lei, informamos diretamente.

## Contato {#contact}

Para dúvidas sobre privacidade ou esta política, envie um email para [{email}](mailto:{email}).
