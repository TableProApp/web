---
title: Política de privacidade
description: O que os apps, site e portal da conta TablePro coletam, para onde os dados vão, por quanto tempo são mantidos e como alterá-los ou excluí-los.
updatedAt: "2026-10-09"
---

Esta política abrange TablePro para Mac, TablePro para iPhone e iPad, o site tablepro.app, a documentação em docs.tablepro.app e o portal da conta tablepro.app/account. Descreve o que cada um realmente envia e armazena hoje. Os dois apps são de código aberto sob a AGPLv3, portanto você pode ler o código que envia os dados abaixo no [repositório TablePro]({github}).

## Resumo {#summary}

- O app para Mac envia um relatório de uso ao TablePro uma vez por dia. Está ativado por padrão e pode ser desativado. O app para iPhone e iPad só envia se você ativar.
- Se ativar uma licença, o app para Mac a verifica com nosso servidor a cada {revalidateDays} dias. Essa verificação inclui o nome do seu Mac.
- Consultas, resultados e senhas não são enviados ao TablePro. A exceção é o que você escolhe publicar na Team Library: configurações de conexão (nunca senhas) e consultas salvas.
- Solicitações de IA vão do app para Mac diretamente ao provedor configurado por você, não a nós.
- Nosso servidor armazena o endereço IP de cada relatório de uso e verificação de licença e consulta um país para cada relatório. Não definimos um prazo para manter esses registros.
- O site conta visualizações de página com Cloudflare Web Analytics, que não define cookies. Também carrega Google Analytics, que só define cookies se você permitir. Todas as páginas carregam nosso chat ao vivo, Crisp, que define seus próprios cookies.
- As compras são vendidas por {merchant}, nosso merchant of record.

## Quem é responsável {#controller}

{publisherName}, um desenvolvedor independente em {publisherCity}, {publisherCountry}, publica os apps do TablePro e este site, e é responsável pelos dados pessoais descritos aqui (o controlador de dados). Para dúvidas sobre esta política ou seus dados, envie um email para [{email}](mailto:{email}).

## TablePro para Mac {#mac-app}

### Relatório de uso {#mac-usage-report}

O app para Mac envia um relatório de uso para `api.tablepro.app` cerca de dez segundos após iniciar e depois uma vez por dia enquanto está em execução. **Está ativado por padrão, e o app não pede confirmação antes de enviar o primeiro relatório.** Para desativar, abra **Settings > General > Privacy** e desmarque **Share anonymous usage data**.

Um relatório contém:

- um ID de máquina: hash SHA-256 do UUID de hardware do Mac (o UUID em si nunca é enviado);
- plataforma, versão do app, versão do macOS, arquitetura do processador e idioma do app;
- os nomes dos tipos de banco das conexões abertas (por exemplo, "PostgreSQL") e quantas conexões estão abertas;
- se uma licença está ativada;
- a data e a hora da primeira tentativa de conexão e da primeira conexão bem-sucedida;
- configurações de atualização (como as atualizações são instaladas e a frequência das verificações). Nosso servidor as descarta quando o relatório chega.

Nunca contém nomes de host, nomes de usuário, senhas, consultas nem linhas.

Nosso servidor armazena cada relatório com o endereço IP de origem. Depois consulta um país para esse IP, enviando-o a ip-api.com e, se isso falhar, a ipinfo.io e depois geoplugin.net. Essas consultas usam HTTP sem criptografia. O país é armazenado com o relatório. Como a verificação de licença abaixo envia o mesmo ID de máquina, relatórios de um Mac com licença ativada podem ser associados à licença.

### Verificações de licença {#mac-license}

O app para Mac só contata nosso servidor de licenças após você digitar uma chave de licença. Isso ocorre ao ativar a licença, ao iniciar se houverem passado {revalidateDays} dias ou mais desde a última verificação e a cada {revalidateDays} dias depois disso. Cada verificação envia:

- sua chave de licença;
- o ID de máquina descrito acima;
- o nome do Mac definido no macOS (que frequentemente inclui seu próprio nome);
- a versão do app e a versão do macOS.

Desativar um Mac envia apenas a chave de licença e o ID de máquina.

Nosso servidor registra todas as solicitações de licença com endereço IP e conteúdo e armazena o ID e nome de cada Mac ativado junto à licença. O portal da conta lista esses Macs pelo nome. Se o servidor não puder ser acessado, os recursos pagos continuam funcionando por {graceDays} dias após a última verificação bem-sucedida.

### Team Library {#library}

A Team Library faz parte de uma licença Team. Ao escolher **Share > Publish to Team Library…** em uma conexão ou **Publish Saved Queries to Team…** na barra lateral Favorites, o app para Mac envia o que você publica ao nosso servidor:

- configurações de conexão: host, porta, nome do banco, nome de usuário, configurações SSH e SSL, opções do driver, comandos de inicialização, configurações de Tunnel Command, nível de Safe Mode e configurações de IA, mas nunca senhas;
- consultas salvas: nomes, texto SQL, palavras-chave e pastas.

Os Macs na mesma licença Team baixam a biblioteca ao iniciar, no máximo uma vez por semana; o Mac que publica a baixa novamente logo após. Publicar novamente substitui o que você publicou antes. Remover um membro da equipe exclui tudo que ele publicou. Se a licença expirar ou for suspensa, a biblioteca permanece no servidor até você solicitar a exclusão.

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

As senhas ficam nas Chaves do macOS. Lista de conexões, histórico de consultas, Query Insights, snapshots de Data Rewind, configurações e abas abertas são armazenados no Mac. O app referencia as chaves SSH onde estão no disco e não as copia. Não contém relator de falhas nem biblioteca de análise de terceiros.

## TablePro para iPhone e iPad {#ios-app}

**Nada vai ao TablePro, a menos que você ative Share Usage Data**, na primeira inicialização ou depois em **Settings > Privacy**. Nesse caso, o app envia um relatório diário ao mesmo servidor do app para Mac, e nosso servidor armazena e consulta seu IP da mesma forma. O relatório contém um hash SHA-256 do identificador atribuído pela Apple ao app no dispositivo, plataforma, versões do app e iOS, arquitetura do processador, idioma, nomes dos tipos de banco das conexões abertas, quantas estão abertas, e a data e a hora da primeira tentativa de conexão, da primeira conexão bem-sucedida e da primeira consulta. Não inclui configurações de atualização e sempre informa que não há licença ativada, pois o app não tem nenhuma das duas coisas.

O app não verifica licenças, não verifica atualizações e não solicita plugins. Além do relatório opcional, conecta apenas aos seus bancos e servidores SSH, ao iCloud da Apple se você ativar o iCloud Sync e à Microsoft quando uma conexão SQL Server autentica com Microsoft Entra ID.

No dispositivo, senhas e chaves SSH coladas ficam nas Chaves, e certificados nunca são sincronizados. O histórico de consultas fica no dispositivo. As conexões são adicionadas ao índice Spotlight local para pesquisa. Durante uma consulta, a Atividade ao Vivo mostra o SQL na Tela Bloqueada e na Dynamic Island expandida, a menos que você ative **Settings > Live Activities > Hide Query**.

Se compartilhar análises com desenvolvedores nos ajustes do iPhone ou iPad, a Apple poderá nos fornecer relatórios de falhas e estatísticas de uso pelo App Store Connect. O app não contém relator de falhas nem biblioteca própria de análise de terceiros.

## iCloud Sync e Handoff {#icloud}

O iCloud Sync fica desativado até você ativá-lo, no Mac e no iPhone e iPad. Quando ativo, os registros vão para um banco privado na sua conta iCloud (container `iCloud.com.TablePro`). TablePro não pode lê-los.

- No Mac, você escolhe o que sincronizar: conexões, grupos e etiquetas, configurações, perfis SSH, perfis de credenciais (nome e nome de usuário, nunca senha), tabelas e bancos favoritos, consultas salvas (incluindo SQL) e pastas de tabelas. Um registro de conexão inclui host, porta, nome de usuário, nome do banco, configurações SSH e SSL, comandos de inicialização, script de pré-conexão e regras de IA. Histórico de consultas, snapshots de Data Rewind e fontes de senha nunca são sincronizados.
- iPhone e iPad sincronizam conexões, grupos e etiquetas.
- Senhas só são sincronizadas se você também ativar **Passwords** em Sync Categories no Mac ou **Sync Passwords** no iPhone e iPad, usando as Chaves do iCloud. No Mac, isso também sincroniza outros segredos guardados pelo TablePro nas Chaves, como chaves de provedores de IA e a chave de licença.

No Mac, o iCloud Sync faz parte de uma licença Starter ou Team. No iPhone e iPad é gratuito.

Handoff transmite o ID da conexão aberta e o nome da tabela aberta entre seus dispositivos, pela Apple. Sem tabela aberta, transmite o nome da conexão ou o host se ela não tiver nome. Não envia configurações nem credenciais.

## Site {#website}

**Hospedagem.** O site e o portal da conta rodam no nosso servidor, atrás do Cloudflare. Como qualquer servidor web, recebem seu endereço IP, user agent do navegador e endereço de cada página solicitada.

**Cloudflare Web Analytics.** Cloudflare adiciona seu script Web Analytics às páginas do site e portal da conta. O navegador o carrega de `static.cloudflareinsights.com`, e ele informa cada visualização ao Cloudflare: página, site de origem do link, tempo de carregamento, navegador, sistema operacional e tipo de dispositivo. Cloudflare adiciona o país de origem da conexão. O script não define cookies nem armazena nada no navegador, e Cloudflare afirma que não usa IP nem detalhes do navegador para identificar você por fingerprinting. Cloudflare nos mostra totais, como visualizações por página ou país, não registros individuais de visitantes. Base legal: interesse legítimo.

**Google Analytics.** O site carrega Google Analytics em todas as páginas no Modo de Consentimento. Até você escolher **Permitir** na pergunta sobre cookies, ele não define cookies e envia ao Google apenas um sinal sem cookies por página, sem identificador armazenado no dispositivo. Se permitir, Google Analytics define os cookies `_ga` e `_ga_<ID>` e mede visitas, como páginas vistas, cliques de download e início de checkout. Armazenamento de publicidade, personalização de anúncios e dados de usuário para anúncios são sempre negados. Google afirma que Google Analytics 4 não registra nem armazena IPs. Nossa propriedade Google Analytics usa o prazo de retenção padrão do Google: os dados coletados no nível de usuário e evento são excluídos após 2 meses. Os relatórios padrão, que guardam totais em vez de identificadores, não são afetados. Base legal: seu consentimento para cookies.

**Chat ao vivo.** Todas as páginas do site e portal da conta mostram um botão do nosso provedor de chat, Crisp. Após a página carregar, o navegador carrega o script Crisp de `client.crisp.chat`, e Crisp define os cookies descritos em [Cookies e armazenamento do navegador](#cookies). Crisp recebe seu IP, detalhes do navegador, endereços das páginas vistas e mensagens escritas e mantém seu IP se você iniciar uma conversa. Informamos ao Crisp apenas o idioma da página, nada mais sobre você. Crisp está sediado na França.

**Script de checkout.** Ao apontar ou navegar pelo teclado até um botão Comprar, o navegador carrega o script de checkout de {merchant} do jsDelivr (`cdn.jsdelivr.net`), que recebe IP e detalhes do navegador. O checkout só abre de {merchant} quando você clica.

**Atribuição de compras.** Ao chegar ao site, o navegador mantém um registro da primeira visita chamado `tablepro:attribution` no armazenamento local por 90 dias: origem da visita (as tags `ref` ou `utm_*` do link seguido ou o site de origem), página de chegada e momento. Se iniciar uma compra, o registro acompanha a solicitação de checkout. Nosso servidor o descarta: não é validado, lido nem armazenado e não é enviado a {merchant}.

**Documentação.** A documentação em docs.tablepro.app é hospedada pela Mintlify, que recebe seu endereço IP e os dados do seu navegador a cada página, e as páginas carregam as fontes do Google Fonts. A documentação faz a própria pergunta sobre cookies, porque não consegue ler a resposta que você deu neste site. Até você escolher **Allow** lá, ela não define cookies nem guarda um ID de visitante. Se permitir, Google Analytics define os cookies `_ga` e `_ga_<ID>` e mede suas visitas à documentação, e Mintlify guarda um ID de visitante aleatório, `mintlify_anonymous_id`, no armazenamento local para contá-las. **Cookie settings**, no rodapé da documentação, altera sua resposta, e recusar remove os dois. Base legal: seu consentimento.

Ler o site não define cookies próprios. As solicitações de inscrição na newsletter, checkout e códigos de desconto do site público omitem credenciais: não enviam cookies do portal da conta nem aceitam cookies da resposta. Abrir páginas do portal da conta é uma operação separada que define os cookies do portal abaixo. Tudo que o site mantém no navegador está listado em [Cookies e armazenamento do navegador](#cookies).

## Compras {#purchases}

As licenças são vendidas por {merchant} (Polar Software, Inc.), nosso merchant of record e revendedor. Você compra de {merchant} sob seus próprios termos para compradores e política de privacidade. {merchant} recebe o pagamento, calcula e recolhe tributos sobre vendas ou IVA, envia recibos e faturas e trata problemas e disputas de pagamento. Coleta nome, email, endereço de cobrança e detalhes de pagamento. Nunca vemos os dados completos do cartão.

De {merchant}, recebemos email, nome e endereço de cobrança conforme inseridos, o que comprou, valores, IDs de pedido e assinatura e mudanças posteriores, como renovações, cancelamentos e reembolsos. Informamos a {merchant} o idioma da página de compra para que nossos emails cheguem nesse idioma. Faturas, recibos, forma de pagamento e assinatura estão no [portal do cliente de {merchant}]({portal}), acessado com o email usado na compra. Os reembolsos são descritos na [política de reembolso](/pt-BR/refund-policy), e o que a licença permite nos [termos de serviço](/pt-BR/terms).

## Portal da conta {#account}

O [portal da conta](/account?locale=pt-BR) em tablepro.app/account é para quem comprou uma licença. Você entra por um link enviado a esse email; o link funciona uma vez e expira após 15 minutos. O portal mostra licenças, Macs ativados (pelo nome) e, em licenças Team, membros, convites, vagas e Team Library.

Armazenamos seu email com licenças e pedidos e o idioma usado conosco, para enviar emails nele. Ao convidar alguém para uma equipe, armazenamos seu email e função e enviamos um código de convite.

## Newsletter {#newsletter}

Se você se inscrever nas notas de versão, armazenamos seu email e o idioma da página de inscrição. Primeiro enviamos um link de confirmação, e toda newsletter tem um link para cancelar a inscrição. Após cancelar, não enviamos mais newsletters; para excluir também o endereço, envie um email.

## Cookies e armazenamento do navegador {#cookies}

Ler o site público e suas solicitações de newsletter, checkout e códigos de desconto não define cookies próprios. Abrir páginas do portal da conta define os dois cookies estritamente necessários listados abaixo. Cloudflare Web Analytics não define cookies nem armazena nada no navegador. Os cookies do Google Analytics só são definidos com seu consentimento. Crisp define seus cookies em cada página após a chat carregar. Nada aqui é usado para publicidade ou vendido.

- **`_ga` e `_ga_<ID>`** (cookies Google Analytics, até 2 anos, apenas se permitir análises): um identificador aleatório do navegador e o estado da visita atual. Recusar ou alterar sua resposta depois os exclui. Base legal: consentimento.
- **`tablepro:analytics-consent`** (armazenamento local, até você limpar): sua resposta à pergunta de análises, para não perguntar em todas as páginas. Site e portal da conta compartilham o registro. Base legal: estritamente necessário para respeitar sua escolha.
- **`tablepro:attribution`** (armazenamento local, 90 dias): registro da primeira visita descrito em [Site](#website). Não contém um identificador seu e só é enviado com a solicitação de checkout, onde nosso servidor o descarta. Base legal: interesse legítimo.
- **`theme`** e **`tablepro:banner-dismissed`** (armazenamento local, até você limpar): se escolheu aparência clara, escura ou do sistema e qual aviso fechou e até quando: 30 dias ou um ano se informar que tem licença ou comprar uma. Base legal: interesse legítimo.
- **`mintlify_anonymous_id`** (armazenamento local em docs.tablepro.app, definido pela Mintlify, somente se você permitir Google Analytics lá): o ID de visitante descrito em [Site](#website). Recusar o remove. A documentação guarda a própria resposta `tablepro:analytics-consent`. Base legal: consentimento.
- **Cookies que começam com `crisp-client/`** (Crisp, por exemplo `crisp-client/session/…`; 6 meses, renovados quando você volta; definidos em todas as páginas quando o chat carrega): mantêm o chat e sua conversa entre páginas e visitas. Base legal: interesse legítimo, para oferecer suporte em todas as páginas.
- **`tablepro-session` e `XSRF-TOKEN`** (cookies do portal da conta, 2 horas): mantêm sua sessão e protegem os formulários do portal contra falsificação de solicitações entre sites (CSRF). Abrir outras páginas do portal, como confirmação de compra e páginas da newsletter, também os define. As solicitações de newsletter, checkout e códigos de desconto do site público omitem credenciais e não mantêm esses cookies. Base legal: estritamente necessários.

Você pode alterar ou retirar a resposta sobre análises a qualquer momento em **Configurações de cookies**, no rodapé de todas as páginas, ou aqui:

<cookie-settings></cookie-settings>

## Base legal {#lawful-basis}

Para leitores no Espaço Econômico Europeu e Reino Unido, as bases legais sob o GDPR e UK GDPR são:

- **Contrato** (Art. 6(1)(b)): vender e fornecer licenças, verificações de licença, portal da conta e Team Library.
- **Interesse legítimo** (Art. 6(1)(f)): relatório de uso do app para Mac e consulta de país, registros de solicitações de licença, segurança e prevenção de abuso, logs do servidor web, Cloudflare Web Analytics, registro de atribuição de compras e chat ao vivo em todas as páginas.
- **Consentimento** (Art. 6(1)(a)): cookies Google Analytics, relatório de uso do app para iPhone e iPad, newsletter e conversas iniciadas no chat ao vivo.
- **Obrigação legal** (Art. 6(1)(c)): registros fiscais e contábeis e respostas a solicitações legais.

## Quem recebe dados {#sharing}

Compartilhamos dados pessoais apenas com os serviços necessários para operar TablePro:

- **{merchant}**, merchant of record das compras.
- **Um provedor de entrega de email**, para links de acesso, recibos enviados por nós, convites de equipe e newsletters.
- **Nosso provedor de hospedagem e Cloudflare**, para site, portal da conta e servidor dos apps. Cloudflare também conta visualizações com Cloudflare Web Analytics.
- **Google**, para Google Analytics no site, na documentação e no portal da conta.
- **Crisp**, para chat ao vivo em todas as páginas do site e portal da conta.
- **jsDelivr**, que fornece o script de checkout de {merchant} ao navegador ao apontar para um botão Comprar.
- **Mintlify**, que hospeda a documentação em docs.tablepro.app.
- **ip-api.com, ipinfo.io e geoplugin.net**, que recebem IPs dos relatórios de uso para consultar o país.
- **GitHub**, que hospeda feed de atualização, catálogo de plugins e downloads.

Não vendemos dados pessoais nem os compartilhamos com anunciantes.

## Transferências internacionais {#transfers}

Os serviços acima operam em vários países, portanto os dados podem ser processados fora do seu país. {merchant}, Google, GitHub, Cloudflare e Mintlify processam dados nos Estados Unidos; Google faz isso sob o EU-US Data Privacy Framework e Cláusulas Contratuais Padrão. Quando exigido por lei, transferências do EEE e Reino Unido se baseiam em Cláusulas Contratuais Padrão ou outro mecanismo aprovado.

## Por quanto tempo mantemos dados {#retention}

- **Relatórios de uso**, com IPs e países: nenhum prazo foi definido, e nada os exclui automaticamente.
- **Registros de licença**: IDs e nomes dos Macs ativados e logs de solicitações de licença com IPs são mantidos enquanto a licença existir. Nada os exclui automaticamente.
- **Pedidos**: mantidos para fins fiscais e contábeis.
- **Team Library**: até nova publicação, remoção do membro que publicou ou solicitação de exclusão. Permanece após o fim da licença.
- **Links de acesso à conta**: expiram após 15 minutos e são excluídos. Sessões do portal duram 2 horas.
- **Newsletter**: até cancelar a inscrição ou excluirmos o endereço a seu pedido.
- **Google Analytics**: dados no nível de usuário e evento por 2 meses, o período padrão usado por nossa propriedade. Cookies duram até 2 anos ou são excluídos quando você recusa.
- **Cloudflare Web Analytics**: Cloudflare nos mostra totais de visualizações dos últimos seis meses. Nada é armazenado no navegador.
- **Chat ao vivo e emails de suporte**: mantidos pelo Crisp e em nossa caixa de email até serem excluídos. Solicite a exclusão das conversas e emails.
- **Logs do servidor web**: mantidos para segurança e diagnóstico de problemas. Ainda não definimos um prazo fixo.

## Seus direitos {#rights}

Conforme seu local de residência, você pode solicitar que:

- forneçamos uma cópia dos dados pessoais que mantemos sobre você (acesso);
- os corrijamos (retificação);
- os excluamos (apagamento), exceto o que precisamos manter por lei;
- limitemos seu uso (restrição);
- os enviemos em formato estruturado e legível por máquina (portabilidade);
- deixemos de usá-los com base em interesse legítimo (oposição).

Você pode retirar o consentimento quando quiser e reclamar à autoridade de proteção de dados. Para exercer esses direitos, envie um email para [{email}](mailto:{email}). Respondemos em até 30 dias. A exclusão é feita manualmente, portanto informe o email, chave de licença ou dispositivo envolvido. Dados mantidos por {merchant}, Google, Crisp ou GitHub também são cobertos pelas políticas deles.

**Residentes da Califórnia.** A California Consumer Privacy Act dá o direito de saber quais informações pessoais coletamos, pedir sua exclusão, recusar sua venda e não receber tratamento diferente por exercer esses direitos. Não vendemos informações pessoais.

## Crianças {#children}

TablePro não é dirigido a menores de 16 anos, e não coletamos seus dados pessoais intencionalmente. Se acreditar que uma criança nos forneceu dados pessoais, entre em contato, e os excluiremos.

## Segurança {#security}

O tráfego entre apps, site, portal da conta e nosso servidor usa HTTPS. As consultas de país descritas em [Relatório de uso](#mac-usage-report) são a exceção: usam HTTP sem criptografia. Links de acesso são armazenados apenas como hashes, e o acesso aos sistemas é limitado a {publisherName} e aos prestadores de serviço listados em [Quem recebe dados](#sharing). Nenhum sistema é perfeitamente seguro. Para relatar uma vulnerabilidade, consulte a [página de Segurança](/pt-BR/security#report) ou envie um email para [{email}](mailto:{email}).

## Alterações desta política {#changes}

Quando esta política muda, atualizamos aqui com uma nova data de "Última atualização" e, quando exigido por lei, informamos diretamente.

## Contato {#contact}

Para dúvidas sobre privacidade ou esta política, envie um email para [{email}](mailto:{email}).
