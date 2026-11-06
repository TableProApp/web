---
title: Política de privacidad
description: Qué recoge TablePro, para qué, quién lo recibe, cuánto se conserva y tus opciones y derechos.
updatedAt: "2026-11-05"
---

Esta política cubre TablePro para Mac, Linux, iPhone y iPad; tablepro.app; docs.tablepro.app; y los servicios de cuentas, compras, soporte y boletines. El [inventario técnico](https://docs.tablepro.app/security/privacy) enumera campos, destinos y controles. El código está en el [repositorio público]({github}).

## Resumen {#summary}

Las consultas y resultados habituales viajan entre tu dispositivo y tu base de datos. Los datos de uso no contienen SQL, filas ni credenciales. El contenido que publiques en Team Library, envíes a soporte o compartas con IA y herramientas externas sí llega a esos destinatarios.

Los datos de uso de Mac y Linux están activados por defecto y tienen un interruptor. La aplicación publicada para iPhone y iPad solo envía informes si aceptas. La analítica directa puede vincularse a tu cuenta y compras. Desactivarla no detiene las solicitudes de cuenta ni la analítica del servidor.

La web mide visitas y carga Crisp en cada página. Las cookies de Google Analytics requieren tu elección. Los boletines miden aperturas y clics. Borrar la cuenta deja algunos registros, incluidos los de PostHog y Crisp. Consulta la [conservación](#retention) y [tus derechos](#rights). El [responsable](#controller) atiende solicitudes también sin cuenta.

<span id="contact"></span>

## Responsable {#controller}

{publisherName}, desarrollador independiente en {publisherCity}, {publisherCountry}, es el responsable de estos datos personales. Contacta en [{email}](mailto:{email}). No tenemos delegado de protección de datos. Para equipos, somos responsables de los registros de cuenta, invitaciones y servicio. Tratamos el contenido publicado en Team Library según las instrucciones del equipo, que decide qué publicar y quién accede.

<span id="lawful-basis"></span>

## Qué recogemos y por qué {#data-use}

Para el EEE y Reino Unido indicamos la base jurídica de cada fin: contrato (artículo 6(1)(b)), interés legítimo (6(1)(f)), consentimiento (6(1)(a)) u obligación legal (6(1)(c)). No tomamos decisiones automatizadas con efectos jurídicos o de importancia similar.

<span id="mac-account"></span>

### Cuentas y dispositivos {#account}

El uso local gratuito no requiere cuenta. Los servicios de cuenta necesitan tu correo. Guardamos nombre, idioma, métodos de acceso, licencias, pedidos, dispositivos, roles y plazas de equipo. El registro de Mac y Linux envía identificador de máquina, nombre del dispositivo, plataforma y versiones de aplicación/sistema. El nombre puede contener el tuyo. Es independiente de los datos de uso. El fin y la base son ofrecer tu cuenta y plan mediante contrato.

El acceso usa enlaces y códigos por correo, passkeys, Apple, GitHub o Google. Las passkeys incluyen clave pública, nombre, estado de sincronización y fechas de uso. Los proveedores de identidad envían un ID y correo verificado; Apple también puede enviar el nombre. Su token se cifra y revoca al desvincular Apple o borrar la cuenta. Registramos cambios con IP y agente de usuario. El interés legítimo es proteger cuentas e investigar abusos.

El [portal]({account}) permite editar perfil y acceso, gestionar dispositivos, exportar datos en JSON y borrar la cuenta. No puedes borrarla si eres propietario de un equipo con otros miembros. Borrarla termina las suscripciones sin reembolso. La [conservación](#retention) explica qué queda.

### Compras {#purchases}

{merchant} (Polar Software, Inc.) es el merchant of record y revendedor. Recoge nombre, correo, dirección de facturación y datos de pago según sus condiciones. Gestiona pagos, impuestos, recibos y disputas. Nunca recibimos los datos completos de la tarjeta.

Enviamos compra, idioma, origen de visita e IP para el pago, impuestos y moneda. Recibimos datos del comprador y facturación, importes, IDs de pedido/suscripción, renovaciones, cancelaciones y reembolsos. El pedido conserva correo, país, importes y atribución. Comprar sin acceder crea una cuenta no verificada para ese correo si no existe. Motivos y comentarios de cancelación llegan a {merchant} y quedan con la suscripción. El tratamiento cumple el contrato; los registros fiscales y contables cumplen obligaciones legales. Sin los datos necesarios no se completa el pago. Gestiona la facturación en [el portal de {merchant}]({portal}); consulta [condiciones](/es/terms) y [reembolsos](/es/refund-policy).

### Equipos y contenido compartido {#library}

Quien invita aporta correo, rol y plaza. Propietarios y administradores ven nombres y correos, invitaciones y cambios del equipo, incluidas las direcciones invitadas, pero no IP ni navegadores del registro. Los miembros ven equipo, plan, plazas y su rol. Usamos estos registros para prestar el servicio bajo contrato.

En Mac, publicar en Team Library envía ajustes de conexión y consultas guardadas al servidor para miembros autorizados. Incluye host, puerto, base, usuario, SSH/SSL, comandos iniciales, Tunnel Command y ajustes de IA. Las consultas incluyen nombres, SQL, palabras clave y carpetas. Se excluyen campos de contraseña; los secretos escritos en SQL u otro texto libre no se eliminan. Se muestra quién cambió cada elemento por última vez. Salir del equipo no borra su contenido. Consulta los [plazos de borrado](#retention). Team Catalog escribe archivos en la carpeta compartida que elijas.

### Analítica de uso y servicio {#analytics}

Nuestro interés legítimo es conocer el uso, corregir problemas y medir compras. Mac y Linux envían los datos de [Tus aplicaciones](#apps). El servidor envía a PostHog eventos de acceso, compras, dispositivos y equipos con IDs de cuenta, sin nombres ni correos. Estos IDs vinculan uso y servicio. El interruptor detiene eventos de la aplicación, no solicitudes necesarias ni eventos del servidor. Ejerce [tus derechos](#rights) para oponerte o pedir borrado.

### Boletines y correo {#newsletter}

Amazon SES envía códigos, invitaciones, avisos de cuenta y boletines. Los correos de servicio cumplen lo solicitado. Las nuevas suscripciones al boletín requieren confirmación y consentimiento. Guardamos dirección, idioma, fechas de alta/confirmación, IP, agentes de usuario, página y versión del consentimiento.

Cada boletín mide aperturas y clics de todos los destinatarios mediante una imagen y `links.news.tablepro.app`. Amazon SES recibe hora, enlace, IP y agente de usuario y los pasa al servidor para contar. Bloquear imágenes impide medir aperturas, no clics. No se siguen enlaces de baja ni de correo. No hay control separado para la medición. Date de baja en el boletín o con el control de un clic de tu aplicación de correo; no enviamos confirmación posterior. Volver a suscribirse requiere confirmar. Rebotes permanentes y avisos de spam detienen el envío. Pide borrar la dirección mediante [contacto](#controller).

La lista anterior migró todas las direcciones que no se habían dado de baja, confirmadas o no, incluidos compradores, titulares de licencias y registros beta. Las bajas se conservaron; rebotes y quejas pasaron a la lista de supresión. Consulta la [conservación](#retention).

### Soporte {#support}

Tus mensajes, adjuntos y diagnósticos llegan a nosotros y al servicio de soporte elegido. Pueden incluir datos o secretos que tú aportes. Al cargarse el chat, Crisp recibe IP, navegador y páginas visitadas en web y portal. Conserva la IP si inicias conversación. Le damos idioma y, en el portal con sesión, correo e ID de cuenta. Cargar chat en cada página responde al interés legítimo de ofrecer soporte. Las conversaciones que inicias se basan en consentimiento.

## Tus aplicaciones {#apps}

| Aplicación y versión | Datos de uso | Control |
| --- | --- | --- |
| Mac 0.86.0, desde 0.86.0-beta.1 | Directos a PostHog; activados | Settings > General > Privacy |
| Linux desde 0.1.0-beta.1 | Directos a PostHog; activados | Preferences > General > Privacy |
| iPhone y iPad publicados | Informe por nuestro servidor; desactivado hasta aceptar | Settings > Privacy |

<span id="mac-local"></span>

### Datos en tu dispositivo {#local-data}

Conexiones, historial, registros locales y pestañas quedan en el dispositivo salvo que elijas compartir. El tráfico de base de datos va a tus servidores. Las contraseñas usan el almacén de credenciales de la plataforma. Mac referencia las claves SSH donde están en disco. La analítica nunca incluye hosts, usuarios, SQL, filas ni credenciales. Las [integraciones](#integrations), Team Library y soporte tienen las excepciones descritas.

### Mac {#mac-app}

Este comportamiento de cuenta y analítica directa empieza en 0.86.0, incluido 0.86.0-beta.1. Acceder registra el Mac y obtiene el plan. El token queda en el Keychain de ese Mac y no sincroniza por iCloud Keychain. Una clave de licencia existente se intercambia por una sesión y se borra localmente.

#### Datos de uso de Mac {#mac-usage-report}

Están activados por defecto y no se pregunta antes del primer evento. Desactiva **Share usage data** en **Settings > General > Privacy**. Si arrancas con la opción desactivada, no se inicia la biblioteca PostHog. No se envían fallos automáticamente; su capturador de fallos está desactivado.

Los eventos cubren uso diario con tipos/cantidad de conexiones abiertas, primer intento, conexión correcta y primera consulta por tipo, bloqueos de funciones de pago y motivos, clics de mejora, método de acceso/salida y preguntas de compra de licencia con respuestas. PostHog añade contexto de dispositivo, pantalla, red, sesión, aplicación y sistema. Recibe IP y deduce ubicación aproximada. Antes de acceder usa ID aleatorio de instalación sin perfil personal. Después usa ID de cuenta y un perfil con versiones, arquitectura, idioma y ubicación. Salir crea otro ID aleatorio. Consulta [campos y destinos](https://docs.tablepro.app/security/privacy#usage-data).

#### Actualizaciones y plugins {#mac-updates}

La aplicación obtiene el feed y catálogo desde GitHub mediante updates.tablepro.app. Las descargas y sus recuentos también llegan a GitHub. Las solicitudes llevan IP y agente de usuario. Desactiva **Automatically check for updates** en **Settings > General > Software Update** para detener comprobaciones automáticas. El catálogo no tiene interruptor. Los [detalles técnicos](https://docs.tablepro.app/security/privacy#update-checks) incluyen el feed antiguo.

#### Versiones anteriores de Mac {#mac-license}

Antes de 0.86.0, el mismo interruptor activado controla un informe al servidor. Contiene ID de máquina con hash, datos de sistema/aplicación, tipos/cantidad de conexiones, estado de licencia y fechas de primer intento/éxito. El servidor descarta los ajustes de actualización enviados. Actualmente reenvía el informe a PostHog con el país de Cloudflare, sin IP ni clave, sin perfil personal. El ID puede vincularlo a dispositivos de cuenta. Ya no se guarda un historial específico, pero tareas, registros, copias y archivo antiguo pueden conservar datos. Consulta la [conservación](#retention).

Las versiones antiguas contactan la licencia solo al introducir una clave. Envían clave, ID, nombre del Mac y versiones. Los dispositivos pertenecen a la cuenta; activación y desactivación quedan auditadas con IP y agente. El [inventario técnico](https://docs.tablepro.app/security/privacy#older-mac-reports) conserva campos y frecuencia.

### iPhone y iPad {#ios-app}

La aplicación publicada no envía informes hasta activar **Share Usage Data** al inicio o en **Settings > Privacy**. La base es consentimiento. El informe diario pasa por el servidor a PostHog sin IP, con país de Cloudflare y sin perfil personal. Contiene identificador Apple con hash, plataforma, versiones, arquitectura, idioma, tipos/cantidad de conexiones y fechas de primer intento, éxito y primera consulta. Siempre indica que no hay licencia; no lleva ajustes de actualización. No comprueba cuentas, licencias, actualizaciones ni plugins.

Conexiones de base/SSH, iCloud opcional y acceso Microsoft Entra para SQL Server envían datos a esos servicios. Contraseñas y claves pegadas quedan en Keychain; certificados e historial, en el dispositivo. Las conexiones entran en Spotlight local. Live Activity puede mostrar SQL en la pantalla bloqueada salvo con Hide Query. Por separado, Share With App Developers de Apple puede enviarnos fallos y estadísticas por App Store Connect. La aplicación no contiene capturador de fallos ni biblioteca de analítica externa. Consulta [iOS](https://docs.tablepro.app/ios#privacy).

### Linux {#linux-app}

Desde 0.1.0-beta.1, acceder registra el dispositivo según [cuentas](#account). Los secretos usan el llavero del escritorio. Las actualizaciones del gestor de paquetes siguen a tu distribuidor. No se envían informes automáticos de fallos.

#### Datos de uso de Linux {#linux-usage-data}

Activados por defecto desde 0.1.0-beta.1. Desactiva Share usage data en Preferences > General > Privacy. Van directamente a PostHog EU: uso diario con tipos/cantidad de conexiones, primer intento/éxito y consulta por tipo, accesos/salidas, clics de mejora y preguntas de compra con respuesta Buy. Llevan IDs de instalación/cuenta, versiones, arquitectura, idioma y metadatos SDK. PostHog recibe IP y deduce ubicación. Antes de acceder hay ID aleatorio sin perfil; después el perfil vincula uso y compras. Salir restablece el ID. No contienen hosts, SQL, filas ni credenciales. El registro de dispositivo sí incluye el nombre del host, por separado.

Desactivar detiene nuevos envíos. Una solicitud en curso puede acabar. No borra eventos previos ni detiene cuenta o analítica del servidor. Consulta [conservación](#retention), [derechos](#rights) e [inventario](https://docs.tablepro.app/security/privacy#linux-usage-data).

<span id="mac-third-parties"></span>

## Servicios que eliges {#integrations}

Tus proveedores de base de datos, SSH y proxy reciben el tráfico solicitado directamente. Los servicios de identidad reciben autenticación cuando los configuras. Apple Maps aporta mapas; DuckDB, extensiones para consultas. Los programas auxiliares de conexión e IA contactan con sus proveedores. Rigen sus propias condiciones.

### iCloud y Handoff {#icloud}

iCloud Sync opcional guarda conexiones, grupos, etiquetas, ajustes, consultas y perfiles SSH en tu CloudKit privado. En Mac también sincroniza favoritos y carpetas de tablas y bases de datos, y nombres, usuarios y modos de contraseña de los perfiles de credenciales, nunca su contraseña. Apple lo aloja; no podemos leerlo. Sincronizar contraseñas es una opción aparte, desactivada, con cifrado de extremo a extremo mediante iCloud Keychain. En Mac afecta a otros secretos de ese almacén, como claves IA y licencias antiguas. Los tokens de cuenta no sincronizan. Mac necesita Pro o Team; iOS es gratuito. Handoff pasa ID de conexión y tabla, o nombre/host sin tabla abierta, entre tus dispositivos Apple, sin credenciales. Consulta [controles](https://docs.tablepro.app/features/icloud-sync).

### IA y herramientas externas {#ai-tools}

La IA envía directamente a tu proveedor o modelo local. Puede enviar instrucciones, esquema, SQL y conversación. Adjuntar filas de la cuadrícula está desactivado por defecto. Los resultados de una herramienta de consulta autorizada también pasan a la conversación y proveedor, al margen de ese interruptor. GitHub Copilot descarga un auxiliar desde npm y empieza con Send telemetry to GitHub activado.

MCP está desactivado por defecto y no arranca así, ni mediante puente o emparejamiento. Al activarlo, clientes autenticados pueden pedir datos dentro de tus permisos. Un cliente IA puede enviarlos a su servicio. Servidores MCP externos reciben argumentos autorizados. Consulta [controles IA y MCP](https://docs.tablepro.app/security/privacy#ai-providers).

## Web y almacenamiento del navegador {#website}

El servidor y Cloudflare reciben IP, agente y páginas. Cloudflare Web Analytics cuenta visitas, referencias, tiempos de carga, categorías de navegador/sistema/dispositivo y países sin almacenamiento ni huellas del navegador. El interés legítimo es entender y mantener la web.

Google Analytics carga en Consent Mode. Antes de Allow envía una señal sin cookie ni ID almacenado. El consentimiento activa cookies y medición de visitas, descargas y compras. Almacenamiento publicitario, personalización y datos publicitarios siempre se deniegan. Google afirma que GA4 no guarda IP.

Crisp carga en toda web y portal según [soporte](#support). Apuntar o tabular a Buy carga el script de {merchant} desde jsDelivr, que recibe IP y navegador; el clic abre el pago. Iniciar el formulario carga Turnstile para prevenir abuso, interés legítimo. Consultas de país y zona horaria sugieren idioma y descuento regional bajo interés legítimo; omiten cookies y no guardan respuestas en la página.

La primera visita crea `tablepro:attribution` durante 90 días: etiquetas/referencia, página de entrada y fecha. Al pagar, nuestro servidor pasa el origen a {merchant} como metadatos, lo guarda en el pedido y lo manda a PostHog con compra/pago. No conserva página de entrada ni fecha. La base es interés legítimo en medir fuentes de compra. Solicitudes públicas de boletín, compra y descuento omiten credenciales y no fijan cookie del portal. El portal no ejecuta scripts analíticos, pero el servidor envía eventos.

### Documentación {#docs}

Mintlify aloja docs.tablepro.app. Solicitudes de páginas, Google Fonts y estrellas GitHub revelan IP y navegador a esos proveedores. Docs pide consentimiento independiente. Antes de Allow no guarda cookies analíticas ni ID. Allow activa Google Analytics e ID de Mintlify. Cookie settings del pie revoca y elimina ambos. La elección de la web no cruza a ese origen.

### Cookies y almacenamiento {#cookies}

Cloudflare Web Analytics no guarda nada en el navegador. Las páginas públicas no fijan cookies propias. Estos plazos son distintos de la conservación del proveedor. El almacenamiento necesario mantiene acceso o elección; los fines de consentimiento e interés legítimo se describen aquí.

| Nombre/servicio | Fin e inicio | Duración y control |
| --- | --- | --- |
| `_ga`, `_ga_<ID>` | Google Analytics tras consentir | Hasta 2 años; rechazar las borra |
| `tablepro:analytics-consent` | Registro necesario de elección, separado en web/docs | Hasta borrarlo |
| `tablepro:attribution` | Origen inicial enviado al pagar; interés legítimo | 90 días |
| `theme`, `tablepro:language`, `tablepro:campaign-closed`, `tablepro:linux-install` | Aspecto, idiomas elegidos/descartados, aviso de oferta cerrado, método de instalación en Linux elegido; interés legítimo | Hasta borrar; tema del portal separado |
| `mintlify_anonymous_id` | ID de docs tras consentir allí | Hasta borrar o rechazar |
| Cookies `crisp-client/` | Continuidad de chat tras cargar en cada página; interés legítimo | 6 meses, renovados al volver |
| `__Host-tp_session` | Acceso necesario al portal | 30 días con sesión; hasta 10 minutos durante el acceso; salir la borra |
| `locale`, `context`, `sign-in-return-to` | Idioma, vista Personal/equipo y retorno; interés legítimo | Dos primeros hasta borrar; retorno 15 minutos |

Cambia el consentimiento con Cookie settings en el pie o aquí:

<cookie-settings></cookie-settings>

## Destinatarios {#sharing}

| Destinatario | Datos y fin |
| --- | --- |
| [OVH]({ovhPrivacy}) | Servidor y registros del servicio |
| [Cloudflare]({cloudflarePrivacy}) | DNS/proxy, almacenamiento R2/copias, Turnstile, Cloudflare Web Analytics |
| [Amazon Web Services]({awsPrivacy}) | Amazon SES: correo, entrega e interacción; enlaces CloudFront, eventos SNS/SQS |
| [PostHog EU]({posthogPrivacy}) | Analítica de aplicación/servidor; IDs sin nombres/correos; solicitudes directas con IP |
| [{merchant}]({merchantPrivacy}) | Merchant of record independiente; pago, facturación y compras |
| [Crisp]({crispPrivacy}) | Chat, navegador/páginas e identidad de cuenta conectada |
| [Google]({googlePrivacy}) | Analítica web/docs y fuentes; acceso opcional |
| [Mintlify]({mintlifyPrivacy}) | Alojamiento docs y medición consentida |
| [GitHub]({githubPrivacy}) | Descargas, actualizaciones, plugins, estrellas, incidencias públicas y acceso opcional |
| [Apple]({applePrivacy}) | Acceso opcional; servicios y diagnósticos descritos en aplicaciones/integraciones |
| [jsDelivr]({jsdelivrPrivacy}) | Script de pago con IP y navegador |

Los miembros reciben contenido y datos según su rol. Las integraciones reciben lo que les diriges. No vendemos datos ni los compartimos para publicidad. Otras revelaciones solo se hacen por exigencia legal. También rigen las políticas de los proveedores.

## Lugar del tratamiento {#transfers}

OVH y Amazon SES están en Singapur (`ap-southeast-1` para SES). PostHog está en la UE; Crisp tiene sede en Francia. {publisherName} opera desde Vietnam. Proveedores estadounidenses, incluidos {merchant}, Google, GitHub, Cloudflare, Amazon Web Services y Mintlify, tratan datos en EE. UU. Almacenamiento y copias pueden implicar otros países. Las garantías exigidas en EEE/Reino Unido usan cláusulas contractuales tipo u otros mecanismos aprobados de cada proveedor; Google también usa EU-US Data Privacy Framework. Pide información mediante [contacto](#controller).

## Conservación {#retention}

No hemos fijado límite donde así se indica. Borrar la cuenta no borra PostHog ni Crisp. Escribe mediante [contacto](#controller) para que borremos allí tus datos a petición.

| Registros | Conservación y borrado |
| --- | --- |
| Analítica PostHog | Sin límite fijado. Desactivar deja eventos anteriores. Solicita borrado. |
| Tareas y registros del servidor | Las tareas retienen informes al enviar/reintentar. Los registros sirven para seguridad y diagnóstico. Sin límite global; no prometemos ausencia de copias. |
| Dispositivos | Incluidos los retirados, hasta borrar la cuenta |
| Cuenta y auditoría | Se borran cuenta, acceso, dispositivos, licencias y pertenencias. La auditoría queda sin límite; se quitan campos de correo e IP/agente del actor, pero pueden quedar direcciones en texto libre. |
| Pedidos y avisos de proveedores | Pedidos por impuestos/contabilidad sin límite fijado. Se quitan enlaces de cuenta/correo. Quedan eventos de {merchant}, Amazon SES y Apple; se limpian datos personales de compra y destinatario/interacción de correo de la cuenta borrada. |
| Team Library | Elementos borrados conservan última versión para sincronizar. Borrado normal de equipo elimina biblioteca a los 30 días, restaurable antes. Borrar cuenta del único propietario elimina ambos al momento. Fin de licencia no la borra. |
| Autenticación | Enlaces/códigos caducan en 15 minutos, se borran 7 días después. Sesión: 30 días. Tokens: caducan 90 días tras uso, se borran 30 días después. Tareas de correo guardan texto claro hasta limpieza: un día tras enviar o 7 tras abandonar. |
| Boletín | Direcciones nuevas no confirmadas: 30 días. Confirmadas/migradas hasta petición o borrado de cuenta con ese correo. La baja conserva dirección como dada de baja. |
| Supresión | Direcciones con rebotes/quejas y fechas primera/última quedan tras borrar cuenta/suscripción para impedir más envíos. Sin límite. |
| Google Analytics | Datos de usuario/evento: 2 meses; informes estándar totales aparte |
| Cloudflare Web Analytics | Totales de visitas de los últimos seis meses disponibles |
| Soporte | Crisp y correo hasta borrado, también a petición. Sin límite fijado. |
| Copias y archivo de migración | Sin límite. Borrar cuenta no borra copias. El archivo completo anterior incluye nombres/correos, licencias, pedidos, equipos, nombres de dispositivos, suscriptores, registros beta, correos, informes de uso y logs de licencia con IP. |

## Opciones y derechos {#rights}

Usa interruptores, Cookie settings de web/docs y baja del boletín. Retirar consentimiento afecta al futuro, sin invalidar el tratamiento previo. Los interruptores no borran datos ni detienen analítica del servidor. En [Settings del portal]({account}) exportas o borras cuenta; no cubre todos los registros de conservación.

Según tu residencia, pide acceso, corrección, borrado, restricción, portabilidad u oposición al interés legítimo. No necesitas cuenta: escribe mediante [contacto](#controller). Podemos pedir detalles para localizar registros, como ID de instalación. Nunca envíes una clave de licencia en texto claro por correo. Respondemos en un mes. Puedes reclamar ante tu autoridad de protección de datos. Obligaciones legales pueden limitar el borrado.

### Derechos regionales {#regional-rights}

**Residentes de California.** La Ley de Privacidad del Consumidor de California te otorga el derecho a saber qué información personal recopilamos, pedirnos su eliminación, excluirte de su venta y no recibir un trato distinto por ejercer estos derechos. No vendemos información personal.

## Menores {#children}

TablePro no se dirige a menores de 16 años y no recogemos sus datos a sabiendas. Si crees que un menor nos dio datos, contacta y los borraremos.

## Seguridad {#security}

El tráfico a nuestros servicios usa HTTPS. Las cuentas no tienen contraseñas. Credenciales y tokens API de equipo se guardan con hash, salvo la tarea temporal de correo en [conservación](#retention). Solo {publisherName} y los [destinatarios](#sharing) acceden a los sistemas. Ningún sistema es perfectamente seguro. Informa vulnerabilidades en [seguridad](/es/security#report).

## Cambios {#changes}

La página muestra su última actualización. Las versiones anteriores están en el [historial público de la web]({webGithub}/commits/main/resources/data/legal/en/privacy.md). Actualizamos antes de usar datos para otro fin, avisamos directamente cuando lo exige la ley y pedimos nuevo consentimiento cuando corresponda.
