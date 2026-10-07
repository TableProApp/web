---
title: Política de privacidad
description: Qué recopilan las apps, el sitio web y el portal de cuentas de TablePro, adónde se envía, cuánto tiempo se conserva y cómo modificarlo o eliminarlo.
updatedAt: "2026-10-05"
---

Esta política cubre TablePro para Mac, TablePro para iPhone y iPad, el sitio web tablepro.app y el portal de cuentas tablepro.app/account. Describe qué envía y almacena realmente cada uno de ellos en la actualidad. Ambas apps son de código abierto bajo AGPLv3, por lo que puedes consultar el código que envía cualquiera de los datos siguientes en el [repositorio de TablePro]({github}).

## Resumen {#summary}

- La app para Mac envía a TablePro un informe de uso una vez al día. Está activado por defecto y puedes desactivarlo. La app para iPhone y iPad solo envía uno si lo activas.
- Si activas una licencia, la app para Mac la comprueba con nuestro servidor cada {revalidateDays} días. Esa comprobación incluye el nombre de tu Mac.
- Las consultas que ejecutas, tus resultados y tus contraseñas no se envían a TablePro. La excepción es lo que decidas publicar en una biblioteca de equipo: ajustes de conexión (nunca contraseñas) y consultas guardadas.
- Las solicitudes de IA van directamente desde la app para Mac al proveedor de IA que configures, no a nosotros.
- Nuestro servidor almacena la dirección IP de cada informe de uso y comprobación de licencia, y busca el país de cada informe de uso. No hemos fijado un plazo de conservación de estos registros.
- El sitio web cuenta las visitas a páginas con Cloudflare Web Analytics, que no establece cookies. También carga Google Analytics, que solo establece cookies si las permites. Todas las páginas cargan además nuestro chat en directo, Crisp, que establece sus propias cookies.
- Las compras las vende {merchant}, nuestro comerciante registrado.

## Quién es responsable {#controller}

TablePro, que publica las apps y este sitio web, es responsable de los datos personales descritos aquí (el responsable del tratamiento). Si tienes preguntas sobre esta política o tus datos, escribe a [{email}](mailto:{email}).

## TablePro para Mac {#mac-app}

### Informe de uso {#mac-usage-report}

La app para Mac envía un informe de uso a `api.tablepro.app` unos diez segundos después de iniciarse y, después, una vez al día mientras está en ejecución. **Está activado por defecto y la app no pregunta antes de enviar el primero.** Para desactivarlo, abre **Ajustes > General > Privacidad** y desmarca **Compartir datos de uso anónimos**.

El informe contiene:

- un identificador de máquina: un hash SHA-256 del UUID de hardware de tu Mac (el UUID en sí nunca se envía);
- la plataforma, la versión de la app, la versión de macOS, la arquitectura del procesador y el idioma de la app;
- los nombres de los tipos de bases de datos que usan tus conexiones (por ejemplo, «PostgreSQL») y el número de conexiones;
- si hay una licencia activada;
- las fechas del primer intento de conexión, de la primera conexión correcta y de la primera consulta;
- tus ajustes de actualización (cómo se instalan y con qué frecuencia se comprueban). Nuestro servidor los descarta al recibir el informe.

Nunca contiene nombres de host, nombres de usuario, contraseñas, consultas ni filas.

Nuestro servidor almacena cada informe junto con la dirección IP de origen. Después busca el país de esa dirección IP enviándola a ip-api.com y, si falla, a ipinfo.io y después a geoplugin.net. Estas consultas se realizan mediante HTTP sin cifrar. El país se almacena junto al informe. Como la comprobación de licencia descrita a continuación envía el mismo identificador de máquina, los informes de un Mac con licencia activada pueden vincularse con esa licencia.

### Comprobaciones de licencia {#mac-license}

La app para Mac solo contacta con nuestro servidor de licencias después de que introduzcas una clave de licencia. Lo hace al activar la licencia, al iniciarse si han pasado {revalidateDays} días o más desde la última comprobación y cada {revalidateDays} días a partir de entonces. Cada comprobación envía:

- tu clave de licencia;
- el identificador de máquina descrito arriba;
- el nombre de tu Mac configurado en macOS (a menudo incluye tu propio nombre);
- la versión de la app y la de macOS.

Al desactivar un Mac, solo se envían la clave de licencia y el identificador de máquina.

Nuestro servidor registra todas las solicitudes de licencia con su dirección IP y su contenido, y almacena el identificador y el nombre de cada Mac activado junto con tu licencia. El portal de cuentas muestra esos Mac por nombre. Si no se puede acceder a nuestro servidor, las funciones de pago siguen funcionando durante {graceDays} días desde la última comprobación correcta.

### Biblioteca de equipo {#library}

La biblioteca de equipo forma parte de una licencia Team. Al seleccionar **Compartir > Publicar en la biblioteca de equipo…** en una conexión o **Publicar consultas guardadas en el equipo…** en la barra lateral Favoritos, la app para Mac sube al servidor lo que publicas:

- ajustes de conexión: host, puerto, nombre de base de datos, nombre de usuario, ajustes SSH y SSL, opciones del controlador, comandos de inicio, ajustes del comando de túnel, nivel del modo seguro y ajustes de IA, pero nunca contraseñas;
- consultas guardadas: sus nombres, texto SQL, palabras clave y carpetas.

Los Mac de la misma licencia Team descargan la biblioteca al iniciarse, como máximo una vez por semana, y el Mac que publica vuelve a descargarla justo después. Publicar de nuevo sustituye lo que habías publicado. Eliminar un miembro del equipo borra todo lo que ese miembro publicó. Si la licencia caduca o se suspende, la biblioteca permanece en nuestro servidor hasta que solicites eliminarla.

El catálogo de equipo, la otra función Team, escribe archivos de conexión sin contraseñas en una carpeta compartida que eliges. No pasa por nuestro servidor.

### Actualizaciones y plugins {#mac-updates}

- **Comprobaciones de actualización.** Una vez al día, la app para Mac descarga el canal de actualizaciones desde GitHub (`raw.githubusercontent.com`). La solicitud no envía información de tu Mac aparte de lo que lleva cualquier solicitud web: tu dirección IP y un agente de usuario con la versión de la app. Para desactivarlo, abre **Ajustes > General > Actualización de software** y desmarca **Buscar actualizaciones automáticamente**. Las actualizaciones se descargan desde GitHub.
- **Catálogo de plugins.** Al iniciarse la app y al abrir los ajustes de plugins, se descarga la lista de controladores y temas disponibles desde GitHub. No hay un ajuste para desactivarlo. Los controladores y temas que instalas se descargan desde GitHub, y el explorador de plugins consulta los recuentos de descargas en la API de GitHub.

GitHub recibe tu dirección IP con estas solicitudes. Se les aplica la declaración de privacidad de GitHub.

### Servicios que decides usar {#mac-third-parties}

La app para Mac solo envía datos a estos servicios cuando los configuras, directamente y nunca a través de TablePro:

- **Tus bases de datos, servidores SSH y proxies**, que reciben lo que les envían tus conexiones.
- **Proveedores de IA.** Al añadir un proveedor y usar el asistente de IA o las sugerencias en línea, las solicitudes van a ese proveedor o a un modelo que se ejecuta en tu Mac. Por defecto, la solicitud incluye el tipo y nombre de la base de datos, las definiciones de tablas y columnas del esquema y la consulta actual. Solo se envían filas de resultados si activas esa opción. Se aplican las condiciones del proveedor. Al añadir GitHub Copilot, se descarga su servidor de lenguaje desde npm y su ajuste «Enviar telemetría a GitHub» está activado inicialmente.
- **Servicios de inicio de sesión**: Microsoft Entra ID, Google, Amazon Web Services y Cloudflare Access, cuando una conexión los usa.
- **Apple Maps**, que proporciona las teselas al mostrar resultados en un mapa.
- **DuckDB**, que proporciona extensiones de DuckDB la primera vez que una consulta usa una de ellas.
- **Clientes MCP.** El servidor MCP está desactivado por defecto. Se inicia cuando lo activas o cuando un cliente MCP configurado inicia el puente de TablePro o se empareja con él, y solo escucha en tu Mac (127.0.0.1). Un cliente de IA conectado a él, como Claude o Cursor, recibe los resultados que solicita y los envía a su propio servicio según sus condiciones.
- **Servidores MCP que añadas.** Una sesión de IA envía a ese servidor las llamadas a herramientas que apruebes, junto con sus argumentos.

### Datos que permanecen en tu Mac {#mac-local}

Las contraseñas se guardan en el Llavero de macOS. La lista de conexiones, el historial de consultas, Query Insights, las instantáneas de Data Rewind, los ajustes y las pestañas abiertas se almacenan en tu Mac. La app referencia las claves SSH donde están en el disco y no las copia. No contiene un sistema de informes de fallos ni una biblioteca de análisis de terceros.

## TablePro para iPhone y iPad {#ios-app}

**No se envía nada a TablePro a menos que actives Compartir datos de uso**, al iniciar la app por primera vez o después en **Ajustes > Privacidad**. Si lo haces, la app envía un informe una vez al día al mismo servidor que la app para Mac, y nuestro servidor almacena y consulta su dirección IP de la misma forma. El informe contiene un hash SHA-256 del identificador que Apple asigna a la app en tu dispositivo, la plataforma, las versiones de la app y de iOS, la arquitectura del procesador, el idioma de la app, los nombres de los tipos de bases de datos que usas, el número de conexiones y las mismas fechas de primer uso. No incluye ajustes de actualización ni clave de licencia, porque la app no tiene ninguno de ellos.

La app no realiza comprobaciones de licencia, comprobaciones de actualización ni solicitudes de plugins. Aparte del informe opcional, solo se conecta a tus bases de datos y servidores SSH, a iCloud de Apple si activas iCloud Sync y a Microsoft cuando una conexión SQL Server inicia sesión con Microsoft Entra ID.

En el dispositivo, las contraseñas y las claves SSH pegadas se guardan en el Llavero, y los certificados nunca se sincronizan. El historial de consultas permanece en el dispositivo. Tus conexiones se añaden al índice Spotlight del dispositivo para que puedas buscarlas. Mientras se ejecuta una consulta, su Actividad en directo muestra el SQL en la pantalla de bloqueo y en la Dynamic Island expandida, a menos que actives **Ajustes > Actividades en directo > Ocultar consulta**.

Si compartes análisis con desarrolladores de apps en los ajustes de tu iPhone o iPad, Apple puede enviarnos informes de fallos y estadísticas de uso mediante App Store Connect. La app no contiene un sistema propio de informes de fallos ni una biblioteca propia de análisis de terceros.

## iCloud Sync y Handoff {#icloud}

iCloud Sync está desactivado hasta que lo actives, tanto en el Mac como en iPhone y iPad. Cuando está activado, los registros se envían a una base de datos privada en tu propia cuenta de iCloud (contenedor `iCloud.com.TablePro`). TablePro no puede leerlos.

- En el Mac eliges qué sincronizar: conexiones, grupos y etiquetas, ajustes, perfiles SSH, perfiles de credenciales (su nombre y nombre de usuario, nunca la contraseña), tablas y bases de datos favoritas, consultas guardadas (incluido su texto SQL) y carpetas de tablas. Un registro de conexión incluye host, puerto, nombre de usuario, nombre de base de datos, ajustes SSH y SSL, comandos de inicio, script previo a la conexión y reglas de IA. El historial de consultas, las instantáneas de Data Rewind y las fuentes de contraseñas nunca se sincronizan.
- iPhone y iPad sincronizan conexiones, grupos y etiquetas.
- Las contraseñas solo se sincronizan si también activas **Contraseñas** en Categorías de sincronización en el Mac, o **Sincronizar contraseñas** en iPhone y iPad, que usa el Llavero de iCloud. En el Mac también se sincronizan los demás secretos que TablePro guarda en el Llavero, como las claves de proveedores de IA y la clave de licencia.

En el Mac, iCloud Sync forma parte de una licencia Starter o Team. En iPhone y iPad es gratis.

Handoff transmite el identificador de la conexión abierta y el nombre de la tabla abierta entre tus propios dispositivos a través de Apple. Si no hay una tabla abierta, transmite el nombre de la conexión o su host si no tiene nombre. No envía ajustes ni credenciales.

## Sitio web {#website}

**Alojamiento.** El sitio web y el portal de cuentas se ejecutan en nuestro servidor, detrás de Cloudflare. Como cualquier servidor web, reciben tu dirección IP, el agente de usuario de tu navegador y la dirección de cada página que solicitas.

**Cloudflare Web Analytics.** Cloudflare añade su script de Web Analytics a las páginas del sitio web y del portal de cuentas. Tu navegador lo carga desde `static.cloudflareinsights.com` e informa de cada visita a Cloudflare: la página, el sitio que la enlazó, cuánto tardó en cargar y tu navegador, sistema operativo y tipo de dispositivo. Cloudflare añade el país de origen de tu conexión. El script no establece cookies ni almacena nada en tu navegador, y Cloudflare afirma que no usa tu dirección IP ni los detalles del navegador para identificarte mediante huella digital. Cloudflare nos muestra totales, como visitas por página o país, no un registro de cada visitante. Base jurídica: interés legítimo.

**Google Analytics.** El sitio carga Google Analytics en todas las páginas en modo de consentimiento. Hasta que selecciones **Permitir** en la pregunta sobre cookies, no establece cookies y solo envía a Google una señal sin cookies por página, sin almacenar un identificador en tu dispositivo. Si lo permites, Google Analytics establece las cookies `_ga` y `_ga_<ID>` y mide tus visitas, como páginas vistas, clics de descarga e inicio de compras. El almacenamiento publicitario, la personalización de anuncios y los datos de usuario para anuncios están siempre denegados. Google afirma que Google Analytics 4 no registra ni almacena direcciones IP. Nuestra propiedad de Google Analytics usa el periodo de conservación predeterminado de Google: Google elimina los datos de usuarios y eventos recopilados al cabo de 2 meses. Los informes estándar de Google, que contienen totales en lugar de identificadores, no se ven afectados. Base jurídica: tu consentimiento para las cookies.

**Chat en directo.** Todas las páginas del sitio web y del portal de cuentas muestran un botón de chat de nuestro proveedor, Crisp. Una vez cargada una página, tu navegador carga el script de Crisp desde `client.crisp.chat`, y Crisp establece las cookies descritas en [Cookies y almacenamiento del navegador](#cookies). Crisp recibe tu dirección IP, los detalles del navegador, las direcciones de las páginas que visitas y los mensajes que escribes, y conserva tu dirección IP si inicias una conversación. Solo comunicamos a Crisp el idioma de la página, ningún otro dato sobre ti. Crisp tiene su sede en Francia.

**Script de compra.** Cuando apuntas a un botón Comprar o llegas a él con el tabulador, tu navegador carga el script de compra de {merchant} desde jsDelivr (`cdn.jsdelivr.net`), que recibe tu dirección IP y los detalles del navegador. El proceso de compra solo se abre desde {merchant} cuando haces clic.

**Atribución de compras.** Al llegar al sitio, tu navegador conserva durante 90 días un registro de primera visita llamado `tablepro:attribution` en su almacenamiento local: el origen de la visita (las etiquetas `ref` o `utm_*` del enlace seguido, o el sitio que te enlazó), la página de llegada y la fecha. Si inicias una compra, el registro se envía con la solicitud de compra. Nuestro servidor lo descarta: no lo valida, lee ni almacena, ni lo transmite a {merchant}.

Leer el sitio no establece cookies propias. Suscribirse al boletín o iniciar una compra o una comprobación de código de descuento envía una solicitud a nuestro servidor que establece las dos cookies del portal de cuentas, `tablepro-session` y `XSRF-TOKEN`. Todo lo que el sitio conserva en tu navegador aparece en [Cookies y almacenamiento del navegador](#cookies).

## Compras {#purchases}

Las licencias las vende {merchant} (Polar Software, Inc.), nuestro comerciante registrado y revendedor. Compras a {merchant} según sus propias condiciones para compradores y su política de privacidad. {merchant} recibe el pago, calcula y paga los impuestos sobre ventas o el IVA, envía recibos y facturas y gestiona problemas y disputas de pago. Recopila tu nombre, correo, dirección de facturación y datos de pago. Nunca vemos los datos completos de tu tarjeta.

De {merchant} recibimos tu correo, tu nombre y dirección de facturación tal como los introdujiste, lo que compraste, los importes, los identificadores de pedido y suscripción y los cambios posteriores, como renovaciones, cancelaciones y reembolsos. Comunicamos a {merchant} el idioma de la página donde compraste para que nuestros correos te lleguen en ese idioma. Las facturas, los recibos, el método de pago y la suscripción están en el [portal de clientes de {merchant}]({portal}), al que accedes con el correo usado al comprar. Los reembolsos se describen en la [política de reembolso](/refund-policy), y lo que permite una licencia, en las [condiciones del servicio](/terms).

## Portal de cuentas {#account}

El [portal de cuentas](/account?locale=es) en tablepro.app/account es para la persona que compró una licencia. Accedes mediante un enlace que enviamos a ese correo; es de un solo uso y caduca a los 15 minutos. El portal muestra tus licencias, los Mac activados en ellas (por nombre) y, para una licencia Team, los miembros, las invitaciones, los puestos y la biblioteca de equipo.

Almacenamos tu correo junto con tus licencias y pedidos, y el idioma que usas con nosotros para enviarte los correos en él. Cuando invitas a alguien a un equipo, almacenamos su correo y rol y le enviamos un código de invitación.

## Boletín {#newsletter}

Si te suscribes a las notas de versión, almacenamos tu correo y el idioma de la página desde la que te suscribiste. Primero enviamos un enlace de confirmación y todos los boletines incluyen un enlace para darse de baja. Tras darte de baja no enviamos más boletines; para que eliminemos también la dirección, escríbenos.

## Cookies y almacenamiento del navegador {#cookies}

Leer el sitio público no establece cookies propias; suscribirse al boletín o iniciar una compra establece las dos cookies del portal estrictamente necesarias indicadas abajo. Cloudflare Web Analytics no establece cookies ni almacena nada en tu navegador. Las cookies de Google Analytics no se establecen hasta que las permites. Crisp establece sus cookies en todas las páginas una vez cargado el chat. Nada de esto se usa para publicidad ni se vende.

- **`_ga` y `_ga_<ID>`** (cookies de Google Analytics, hasta 2 años, solo si permites el análisis): un identificador aleatorio del navegador y el estado de tu visita actual. Rechazarlas, o cambiar tu respuesta después, las elimina. Base jurídica: consentimiento.
- **`tablepro:analytics-consent`** (almacenamiento local, hasta que lo borres): tu respuesta a la pregunta sobre análisis, para no preguntarte en todas las páginas. El sitio web y el portal de cuentas lo comparten. Base jurídica: estrictamente necesario para respetar tu elección.
- **`tablepro:attribution`** (almacenamiento local, 90 días): el registro de primera visita descrito en [Sitio web](#website). No contiene un identificador tuyo y solo se envía con una solicitud de compra, donde nuestro servidor lo descarta. Base jurídica: interés legítimo.
- **`theme`** y **`tablepro:banner-dismissed`** (almacenamiento local, hasta que lo borres): si elegiste apariencia clara, oscura o del sistema, y qué aviso cerraste y hasta cuándo: 30 días, o un año si indicas que tienes licencia o compras una. Base jurídica: interés legítimo.
- **Cookies que comienzan por `crisp-client/`** (Crisp, por ejemplo `crisp-client/session/…`; 6 meses, renovados cuando vuelves; establecidas en todas las páginas al cargar el chat): mantienen el chat y tu conversación entre páginas y visitas. Base jurídica: interés legítimo, para ofrecer soporte en todas las páginas.
- **`tablepro-session` y `XSRF-TOKEN`** (cookies del portal de cuentas, 2 horas): mantienen tu sesión iniciada y protegen los formularios del portal contra falsificación de solicitudes entre sitios. Otras páginas del portal, como la confirmación de compra y las páginas del boletín, también las establecen, al igual que suscribirse al boletín o iniciar una compra o una comprobación de código de descuento desde cualquier página del sitio. Base jurídica: estrictamente necesarias.

Puedes cambiar o retirar tu respuesta sobre análisis en cualquier momento desde **Configuración de cookies** en el pie de todas las páginas, o aquí:

<cookie-settings></cookie-settings>

## Base jurídica {#lawful-basis}

Para lectores del Espacio Económico Europeo y del Reino Unido, las bases jurídicas según el RGPD y el RGPD del Reino Unido son:

- **Contrato** (art. 6.1.b): venta y provisión de licencias, comprobaciones de licencia, portal de cuentas y biblioteca de equipo.
- **Interés legítimo** (art. 6.1.f): informe de uso de la app para Mac y búsqueda de país, registros de solicitudes de licencia, seguridad y prevención de abusos, registros del servidor web, Cloudflare Web Analytics, registro de atribución de compras y chat en directo en todas las páginas.
- **Consentimiento** (art. 6.1.a): cookies de Google Analytics, informe de uso de la app para iPhone y iPad, boletín y conversaciones que inicias en el chat en directo.
- **Obligación legal** (art. 6.1.c): registros fiscales y contables y respuestas a solicitudes legítimas.

## Quién recibe datos {#sharing}

Solo compartimos datos personales con los servicios necesarios para operar TablePro:

- **{merchant}**, el comerciante registrado para las compras.
- **Un proveedor de envío de correo**, para enlaces de acceso, recibos enviados por nosotros, invitaciones de equipo y boletines.
- **Nuestro proveedor de alojamiento y Cloudflare**, para el sitio web, el portal de cuentas y el servidor con el que se comunican las apps. Cloudflare también cuenta las visitas mediante Cloudflare Web Analytics.
- **Google**, para Google Analytics en el sitio web y el portal de cuentas.
- **Crisp**, para el chat en directo en todas las páginas del sitio web y del portal de cuentas.
- **jsDelivr**, que proporciona al navegador el script de compra de {merchant} cuando apuntas a un botón Comprar.
- **ip-api.com, ipinfo.io y geoplugin.net**, que reciben direcciones IP de los informes de uso para buscar el país.
- **GitHub**, que aloja el canal de actualizaciones, el catálogo de plugins y las descargas.

No vendemos datos personales ni los compartimos con anunciantes.

## Transferencias internacionales {#transfers}

Los servicios anteriores operan en varios países, por lo que tus datos pueden tratarse fuera del tuyo. {merchant}, Google, GitHub y Cloudflare tratan datos en Estados Unidos; Google lo hace según el Marco de Privacidad de Datos UE-EE. UU. y las Cláusulas Contractuales Tipo. Cuando la ley lo exige, las transferencias desde el EEE y el Reino Unido se basan en Cláusulas Contractuales Tipo u otro mecanismo aprobado.

## Cuánto tiempo conservamos los datos {#retention}

- **Informes de uso**, con sus direcciones IP y países: no se ha fijado un plazo y nada los elimina automáticamente.
- **Registros de licencia**: los identificadores y nombres de los Mac activados y el registro de solicitudes de licencia con sus direcciones IP se conservan mientras exista la licencia. Nada los elimina automáticamente.
- **Pedidos**: se conservan para fines fiscales y contables.
- **Biblioteca de equipo**: hasta que se publique de nuevo, se elimine al miembro que la publicó o solicites su eliminación. Permanece tras finalizar una licencia.
- **Enlaces de acceso a la cuenta**: caducan a los 15 minutos y después se eliminan. Las sesiones del portal duran 2 horas.
- **Boletín**: hasta que te des de baja o eliminemos la dirección a petición tuya.
- **Google Analytics**: datos de usuarios y eventos durante 2 meses, el plazo predeterminado de Google que usa nuestra propiedad. Sus cookies duran hasta 2 años o se eliminan al rechazarlas.
- **Cloudflare Web Analytics**: Cloudflare nos muestra los totales de visitas de los últimos seis meses. No se almacena nada en tu navegador.
- **Chat en directo y correos de soporte**: se conservan en Crisp y en nuestra bandeja hasta su eliminación. Solicita que eliminemos tus conversaciones y correos.
- **Registros del servidor web**: se conservan para seguridad y resolución de problemas. Todavía no hemos fijado un plazo.

## Tus derechos {#rights}

Según dónde residas, puedes pedirnos que:

- te demos una copia de los datos personales que tenemos sobre ti (acceso);
- los corrijamos (rectificación);
- los eliminemos (supresión), salvo los que debamos conservar por ley;
- limitemos su uso (limitación);
- te los enviemos en un formato estructurado y legible por máquina (portabilidad);
- dejemos de usarlos según el interés legítimo (oposición).

Puedes retirar tu consentimiento en cualquier momento y reclamar ante tu autoridad de protección de datos. Para ejercer estos derechos, escribe a [{email}](mailto:{email}). Respondemos en 30 días. La eliminación de datos es manual, así que indica el correo, la clave de licencia o el dispositivo correspondiente. Los datos que conservan {merchant}, Google, Crisp o GitHub también están cubiertos por sus propias políticas.

**Residentes de California.** La Ley de Privacidad del Consumidor de California te otorga el derecho a saber qué información personal recopilamos, pedirnos su eliminación, excluirte de su venta y no recibir un trato distinto por ejercer estos derechos. No vendemos información personal.

## Menores {#children}

TablePro no está dirigido a menores de 16 años y no recopilamos sus datos personales a sabiendas. Si crees que un menor nos ha proporcionado datos personales, contacta con nosotros y los eliminaremos.

## Seguridad {#security}

El tráfico entre las apps, el sitio web, el portal de cuentas y nuestro servidor usa HTTPS. La búsqueda de país descrita en [Informe de uso](#mac-usage-report) es la excepción: se realiza mediante HTTP sin cifrar. Los enlaces de acceso a la cuenta solo se almacenan como hashes, y el acceso a nuestros sistemas se limita a quienes operan TablePro. Ningún sistema es perfectamente seguro. Para informar de una vulnerabilidad, escribe a [{email}](mailto:{email}).

## Cambios en esta política {#changes}

Cuando cambia esta política, la actualizamos aquí con una nueva fecha de «Última actualización» y, cuando la ley lo exige, te lo comunicamos directamente.

## Contacto {#contact}

Si tienes preguntas sobre privacidad o esta política, escribe a [{email}](mailto:{email}).
