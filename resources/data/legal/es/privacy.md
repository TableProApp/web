---
title: Política de privacidad
description: Qué recopilan las apps, el sitio web y el portal de cuentas de TablePro, adónde se envía, cuánto tiempo se conserva y cómo modificarlo o eliminarlo.
updatedAt: "2026-10-30"
---

Esta política cubre TablePro para Mac, TablePro para iPhone y iPad, el sitio web tablepro.app, la documentación en docs.tablepro.app y el portal de cuentas account.tablepro.app. Describe qué envía y almacena realmente cada uno de ellos en la actualidad. Ambas apps son de código abierto bajo AGPLv3, por lo que puedes consultar el código que envía cualquiera de los datos siguientes en el [repositorio de TablePro]({github}).

## Resumen {#summary}

- La app para Mac envía datos de uso. Está activado por defecto y puedes desactivarlo. La app para iPhone y iPad solo envía un informe de uso si lo activas.
- Si inicias sesión en una cuenta de TablePro o activas una clave de licencia, la app para Mac registra tu Mac en nuestro servidor, con su nombre, y comprueba tu plan con él periódicamente.
- Las consultas que ejecutas, tus resultados y tus contraseñas no se envían a TablePro. La excepción es lo que decidas publicar en Team Library: ajustes de conexión (nunca contraseñas) y consultas guardadas.
- Las solicitudes de IA van directamente desde la app para Mac al proveedor de IA que configures, no a nosotros.
- A partir de la versión que añade las cuentas de TablePro, la app para Mac envía sus datos de uso directamente a PostHog, nuestro servicio de analítica de producto en la UE, que entonces recibe la dirección IP de tu Mac y deduce de ella una ubicación aproximada. Las versiones anteriores y la app para iPhone y iPad envían informes de uso a nuestro servidor, que los reenvía a PostHog sin sus direcciones IP. Tu cuenta guarda un registro de los cambios hechos en ella, como inicios de sesión y dispositivos nuevos, con la dirección IP y el navegador de la solicitud que hizo cada uno.
- El sitio web cuenta las visitas a páginas con Cloudflare Web Analytics, que no establece cookies. También carga Google Analytics, que solo establece cookies si las permites. Todas las páginas cargan además nuestro chat en directo, Crisp, que establece sus propias cookies.
- El portal de cuentas en account.tablepro.app no carga ningún script de análisis. Establece una cookie para mantener tu sesión iniciada, y en sus ajustes puedes descargar los datos de tu cuenta o eliminarla.
- Las compras las vende {merchant}, nuestro merchant of record.

## Quién es responsable {#controller}

{publisherName}, un desarrollador independiente en {publisherCity}, {publisherCountry}, publica las apps de TablePro y este sitio web, y es responsable de los datos personales descritos aquí (el responsable del tratamiento). Si tienes preguntas sobre esta política o tus datos, escribe a [{email}](mailto:{email}).

## TablePro para Mac {#mac-app}

### Datos de uso {#mac-usage-report}

A partir de la versión que añade las cuentas de TablePro, la app para Mac envía datos de uso directamente a PostHog, nuestro servicio de analítica de producto, en `eu.i.posthog.com`, en la UE. **Está activado por defecto y la app no pregunta antes de enviar el primer evento.** Para desactivarlo, abre **Settings > General > Privacy** y desmarca **Share usage data**. Mientras está desactivado, la app no envía nada a PostHog, y si la app se inicia con el ajuste desactivado, ni siquiera pone en marcha la biblioteca de PostHog.

La app envía un evento:

- una vez al día mientras está en ejecución, con los nombres de los tipos de bases de datos de tus conexiones abiertas (por ejemplo, «PostgreSQL») y cuántas conexiones hay abiertas;
- en tu primer intento de conexión, en tu primera conexión correcta y en tu primera consulta, cada uno con su tipo de base de datos;
- cuando te muestra que una función de pago no está disponible, una vez por función cada vez que se ejecuta la app, con la función y el motivo, como no haber iniciado sesión;
- cuando haces clic para mejorar tu plan, con el lugar de la app donde lo hiciste;
- cuando inicias sesión, con la forma (en la app, con una clave de licencia o canjeando la clave que ya estaba en tu Mac), y cuando cierras sesión.

La biblioteca de PostHog añade a cada evento el modelo de tu Mac, el tamaño de pantalla, la zona horaria y el idioma, si está conectado por Wi-Fi, la versión, la compilación y el bundle ID de la app, la versión de macOS, la versión de la biblioteca y un identificador de sesión aleatorio. PostHog recibe la dirección IP de tu Mac con cada solicitud y deduce de ella una ubicación aproximada, como el país y la ciudad. Mientras el ajuste está activado, la biblioteca también obtiene de PostHog su configuración y sus feature flags (`/config` desde `eu-assets.i.posthog.com` y `/flags` desde `eu.i.posthog.com`).

Antes de que inicies sesión, los eventos llevan un identificador aleatorio que la biblioteca crea en tu Mac, y PostHog no crea un perfil de persona para él. En cuanto inicias sesión, llevan el identificador de tu cuenta, y el perfil de esa cuenta en PostHog guarda las versiones de la app y de macOS, la arquitectura del procesador, el idioma de la app y la ubicación aproximada que PostHog deduce de la dirección IP. Así se relacionan tus instalaciones con tus inicios de sesión y tus compras. Al cerrar sesión empieza un nuevo identificador aleatorio. Los datos de uso de la app ya no incluyen un identificador de máquina, si hay una licencia activada ni tus ajustes de actualización.

Las versiones anteriores a las cuentas de TablePro envían en su lugar un informe de uso a `api.tablepro.app`, con el mismo ajuste, unos diez segundos después de iniciarse y, después, una vez al día mientras están en ejecución. El informe contiene:

- un identificador de máquina: un hash SHA-256 del UUID de hardware de tu Mac (el UUID en sí nunca se envía);
- la plataforma, la versión de la app, la versión de macOS, la arquitectura del procesador y el idioma de la app;
- los nombres de los tipos de bases de datos de tus conexiones abiertas (por ejemplo, «PostgreSQL») y cuántas conexiones hay abiertas;
- si hay una licencia activada;
- la fecha y la hora del primer intento de conexión y de la primera conexión correcta;
- tus ajustes de actualización (cómo se instalan y con qué frecuencia se comprueban). Nuestro servidor los descarta al recibir el informe.

Ni los eventos ni los informes contienen nombres de host, nombres de usuario, contraseñas, consultas ni filas.

Nuestro servidor no almacena el informe ni la dirección IP de la que llegó. Lo reenvía a PostHog como un evento sobre el identificador de máquina, con el país que Cloudflare indica para tu conexión y sin tu clave de licencia ni tu dirección IP, y PostHog no crea con él un perfil de persona. Como tu cuenta registra sus dispositivos con el mismo identificador de máquina, los informes de un Mac en el que iniciaste sesión o activaste una licencia pueden vincularse con tu cuenta.

### Comprobaciones de licencia {#mac-license}

Las versiones anteriores a las cuentas de TablePro solo contactan con nuestro servidor de licencias después de que introduzcas una clave de licencia. Lo hacen al activar la licencia, al iniciarse si han pasado {revalidateDays} días o más desde la última comprobación y cada {revalidateDays} días a partir de entonces. Cada comprobación envía:

- tu clave de licencia;
- el identificador de máquina descrito en [Datos de uso](#mac-usage-report);
- el nombre de tu Mac configurado en macOS (a menudo incluye tu propio nombre);
- la versión de la app y la de macOS.

Al desactivar un Mac, solo se envían la clave de licencia y el identificador de máquina.

Nuestro servidor guarda cada Mac activado como un dispositivo de la cuenta titular de la licencia: su identificador de máquina y su nombre, las versiones de la app y de macOS, y cuándo se comunicó por última vez. La activación y la desactivación de un Mac quedan en el registro de auditoría de esa cuenta con la dirección IP y el agente de usuario de la solicitud; las comprobaciones periódicas no. El portal de cuentas muestra tus dispositivos por nombre. Si no se puede acceder a nuestro servidor, las funciones de pago siguen funcionando durante {graceDays} días desde la última comprobación correcta.

### Cuenta de TablePro {#mac-account}

A partir de la versión que añade las cuentas de TablePro, inicias sesión en la app para Mac con una [cuenta de TablePro](#account) en lugar de una clave de licencia. La app abre la página de inicio de sesión en una ventana del navegador, donde puedes escribir el código del correo de inicio de sesión. Después registra tu Mac como dispositivo de tu cuenta: el identificador de máquina descrito arriba, el nombre de tu Mac, la plataforma y las versiones de la app y de macOS. A continuación obtiene tu plan de nuestro servidor como un archivo firmado una vez al día mientras se ejecuta, y ese archivo mantiene las funciones de pago hasta {offlineDays} días sin nuestro servidor. El token que mantiene la sesión de la app se guarda solo en el Llavero de macOS de ese Mac y nunca se sincroniza mediante el Llavero de iCloud, ni siquiera con la sincronización de contraseñas activada.

Una clave de licencia que ya esté en tu Mac se canjea una sola vez por un inicio de sesión en la cuenta titular y después se elimina del Mac. Un dispositivo que no se comunica en 180 días se quita. Puedes quitar dispositivos en la app o en el portal de cuentas, y la primera vez que un Mac usa tu licencia te avisamos por correo.

### Team Library {#library}

Team Library forma parte de una licencia Team. Al seleccionar **Share > Publish to Team Library…** en una conexión o **Publish Saved Queries to Team…** en la barra lateral Favorites, la app para Mac sube al servidor lo que publicas:

- ajustes de conexión: host, puerto, nombre de base de datos, nombre de usuario, ajustes SSH y SSL, opciones del controlador, comandos de inicio, ajustes de Tunnel Command, nivel de Safe Mode y ajustes de IA, pero nunca contraseñas;
- consultas guardadas: sus nombres, texto SQL, palabras clave y carpetas.

A partir de la versión que añade las cuentas de TablePro, la app para Mac de cada miembro con puesto descarga los cambios de la biblioteca al iniciarse, cada 15 minutos y después de cada publicación. Publicar envía solo lo que cambió y quita solo los elementos que ese Mac publicó y ya no tiene. Si otra persona cambió antes un elemento, la app pregunta qué copia conservar, y muestra quién cambió por última vez cada consulta del equipo. Las versiones anteriores a las cuentas de TablePro descargan la biblioteca al iniciarse, como máximo una vez por semana, y el Mac que publica vuelve a descargarla justo después. Publicar de nuevo desde ellas sustituye lo que habías publicado. La sección Library del portal de cuentas muestra cada elemento, con el nombre de quien lo cambió por última vez, a los miembros que pueden leer la biblioteca, y permite a propietarios y administradores eliminar elementos. Un elemento eliminado permanece 90 días en nuestro servidor para que todos los Mac puedan sincronizar la eliminación. Si la licencia termina, la biblioteca permanece en nuestro servidor hasta que el propietario del equipo elimina el equipo, lo que también elimina la biblioteca.

Team Catalog, la otra función Team, escribe archivos de conexión sin contraseñas en una carpeta compartida que eliges. No pasa por nuestro servidor.

### Actualizaciones y plugins {#mac-updates}

- **Comprobaciones de actualización.** Una vez al día, la app para Mac descarga el canal de actualizaciones desde GitHub (`raw.githubusercontent.com`). La solicitud no envía información de tu Mac aparte de lo que lleva cualquier solicitud web: tu dirección IP y un agente de usuario con la versión de la app. Para desactivarlo, abre **Settings > General > Software Update** y desmarca **Automatically check for updates**. Las actualizaciones se descargan desde GitHub.
- **Catálogo de plugins.** Al iniciarse la app y al abrir los ajustes de plugins, se descarga la lista de controladores y temas disponibles desde GitHub. No hay un ajuste para desactivarlo. Los controladores y temas que instalas se descargan desde GitHub, y el explorador de plugins consulta los recuentos de descargas en la API de GitHub.

GitHub recibe tu dirección IP con estas solicitudes. Se les aplica la declaración de privacidad de GitHub.

### Servicios que decides usar {#mac-third-parties}

La app para Mac solo envía datos a estos servicios cuando los configuras, directamente y nunca a través de TablePro:

- **Tus bases de datos, servidores SSH y proxies**, que reciben lo que les envían tus conexiones.
- **Proveedores de IA.** Al añadir un proveedor y usar el asistente de IA o las sugerencias en línea, las solicitudes van a ese proveedor o a un modelo que se ejecuta en tu Mac. Por defecto, la solicitud incluye el tipo y nombre de la base de datos, las definiciones de tablas y columnas del esquema y la consulta actual. Solo se envían filas de resultados si activas esa opción. Se aplican las condiciones del proveedor. Al añadir GitHub Copilot, se descarga su servidor de lenguaje desde npm y su ajuste «Send telemetry to GitHub» está activado inicialmente.
- **Servicios de inicio de sesión**: Microsoft Entra ID, Google, Amazon Web Services y Cloudflare Access, cuando una conexión los usa.
- **Apple Maps**, que proporciona las teselas al mostrar resultados en un mapa.
- **DuckDB**, que proporciona extensiones de DuckDB la primera vez que una consulta usa una de ellas.
- **Clientes MCP.** El servidor MCP está desactivado por defecto. Se inicia cuando lo activas o cuando un cliente MCP configurado inicia el puente de TablePro o se empareja con él, y solo escucha en tu Mac (127.0.0.1). Un cliente de IA conectado a él, como Claude o Cursor, recibe los resultados que solicita y los envía a su propio servicio según sus condiciones.
- **Servidores MCP que añadas.** Una sesión de IA envía a ese servidor las llamadas a herramientas que apruebes, junto con sus argumentos.

### Datos que permanecen en tu Mac {#mac-local}

Las contraseñas se guardan en el Llavero de macOS. La lista de conexiones, el historial de consultas, Query Insights, las instantáneas de Data Rewind, los ajustes y las pestañas abiertas se almacenan en tu Mac. La app referencia las claves SSH donde están en el disco y no las copia. Las versiones anteriores a las cuentas de TablePro no contienen un sistema de informes de fallos ni una biblioteca de análisis de terceros. A partir de la versión que añade las cuentas de TablePro, la app incluye la biblioteca de PostHog, que envía los datos de uso descritos arriba. La biblioteca contiene el sistema de informes de fallos de PostHog, que la app deja desactivado, así que no envía informes de fallos. La biblioteca guarda su identificador aleatorio, su configuración y los eventos aún no enviados en archivos dentro de `~/Library/Application Support/com.TablePro`.

## TablePro para iPhone y iPad {#ios-app}

**No se envía nada a TablePro a menos que actives Share Usage Data**, al iniciar la app por primera vez o después en **Settings > Privacy**. Si lo haces, la app envía un informe una vez al día al mismo servidor que las versiones de la app para Mac anteriores a las cuentas de TablePro, y nuestro servidor lo reenvía a PostHog de la misma forma, sin su dirección IP. El informe contiene un hash SHA-256 del identificador que Apple asigna a la app en tu dispositivo, la plataforma, las versiones de la app y de iOS, la arquitectura del procesador, el idioma de la app, los nombres de los tipos de bases de datos de tus conexiones abiertas, cuántas hay abiertas, y la fecha y la hora del primer intento de conexión, de la primera conexión correcta y de la primera consulta. No incluye ajustes de actualización y siempre indica que no hay ninguna licencia activada, porque la app no tiene ni lo uno ni lo otro.

La app no realiza comprobaciones de licencia, comprobaciones de actualización ni solicitudes de plugins. Aparte del informe opcional, solo se conecta a tus bases de datos y servidores SSH, a iCloud de Apple si activas iCloud Sync y a Microsoft cuando una conexión SQL Server inicia sesión con Microsoft Entra ID.

En el dispositivo, las contraseñas y las claves SSH pegadas se guardan en el Llavero, y los certificados nunca se sincronizan. El historial de consultas permanece en el dispositivo. Tus conexiones se añaden al índice Spotlight del dispositivo para que puedas buscarlas. Mientras se ejecuta una consulta, su Actividad en directo muestra el SQL en la pantalla de bloqueo y en la Dynamic Island expandida, a menos que actives **Settings > Live Activities > Hide Query**.

Si compartes análisis con desarrolladores de apps en los ajustes de tu iPhone o iPad, Apple puede enviarnos informes de fallos y estadísticas de uso mediante App Store Connect. La app no contiene un sistema propio de informes de fallos ni una biblioteca propia de análisis de terceros.

## iCloud Sync y Handoff {#icloud}

iCloud Sync está desactivado hasta que lo actives, tanto en el Mac como en iPhone y iPad. Cuando está activado, los registros se envían a una base de datos privada en tu propia cuenta de iCloud (contenedor `iCloud.com.TablePro`). TablePro no puede leerlos.

- En el Mac eliges qué sincronizar: conexiones, grupos y etiquetas, ajustes, perfiles SSH, perfiles de credenciales (su nombre y nombre de usuario, nunca la contraseña), tablas y bases de datos favoritas, consultas guardadas (incluido su texto SQL) y carpetas de tablas. Un registro de conexión incluye host, puerto, nombre de usuario, nombre de base de datos, ajustes SSH y SSL, comandos de inicio, script previo a la conexión y reglas de IA. El historial de consultas, las instantáneas de Data Rewind y las fuentes de contraseñas nunca se sincronizan.
- iPhone y iPad sincronizan conexiones, grupos y etiquetas.
- Las contraseñas solo se sincronizan si también activas **Passwords** en Sync Categories en el Mac, o **Sync Passwords** en iPhone y iPad, que usa el Llavero de iCloud. En el Mac también se sincronizan los demás secretos que TablePro guarda en el Llavero, como las claves de proveedores de IA y la clave de licencia. A partir de la versión que añade las cuentas de TablePro, la clave de licencia se elimina en cuanto se canjea por un inicio de sesión, y el token que mantiene la sesión de la app nunca se sincroniza.

En el Mac, iCloud Sync forma parte de una licencia Starter o Team. En iPhone y iPad es gratis.

Handoff transmite el identificador de la conexión abierta y el nombre de la tabla abierta entre tus propios dispositivos a través de Apple. Si no hay una tabla abierta, transmite el nombre de la conexión o su host si no tiene nombre. No envía ajustes ni credenciales.

## Sitio web {#website}

**Alojamiento.** El sitio web y el portal de cuentas se ejecutan en nuestro servidor, detrás de Cloudflare. Como cualquier servidor web, reciben tu dirección IP, el agente de usuario de tu navegador y la dirección de cada página que solicitas.

**Cloudflare Web Analytics.** Cloudflare añade su script de Web Analytics a las páginas del sitio web; el portal de cuentas no lo ejecuta. Tu navegador lo carga desde `static.cloudflareinsights.com` e informa de cada visita a Cloudflare: la página, el sitio que la enlazó, cuánto tardó en cargar y tu navegador, sistema operativo y tipo de dispositivo. Cloudflare añade el país de origen de tu conexión. El script no establece cookies ni almacena nada en tu navegador, y Cloudflare afirma que no usa tu dirección IP ni los detalles del navegador para identificarte mediante huella digital. Cloudflare nos muestra totales, como visitas por página o país, no un registro de cada visitante. Base jurídica: interés legítimo.

**Google Analytics.** El sitio carga Google Analytics en todas las páginas en modo de consentimiento. Hasta que selecciones **Permitir** en la pregunta sobre cookies, no establece cookies y solo envía a Google una señal sin cookies por página, sin almacenar un identificador en tu dispositivo. Si lo permites, Google Analytics establece las cookies `_ga` y `_ga_<ID>` y mide tus visitas, como páginas vistas, clics de descarga e inicio de compras. El almacenamiento publicitario, la personalización de anuncios y los datos de usuario para anuncios están siempre denegados. Google afirma que Google Analytics 4 no registra ni almacena direcciones IP. Nuestra propiedad de Google Analytics usa el periodo de conservación predeterminado de Google: Google elimina los datos de usuarios y eventos recopilados al cabo de 2 meses. Los informes estándar de Google, que contienen totales en lugar de identificadores, no se ven afectados. Base jurídica: tu consentimiento para las cookies.

**Chat en directo.** Todas las páginas del sitio web y del portal de cuentas muestran un botón de chat de nuestro proveedor, Crisp. Una vez cargada una página, tu navegador carga el script de Crisp desde `client.crisp.chat`, y Crisp establece las cookies descritas en [Cookies y almacenamiento del navegador](#cookies). Crisp recibe tu dirección IP, los detalles del navegador, las direcciones de las páginas que visitas y los mensajes que escribes, y conserva tu dirección IP si inicias una conversación. Comunicamos a Crisp el idioma de la página. Cuando has iniciado sesión en el portal de cuentas, también le damos la dirección de correo electrónico y el ID de tu cuenta, que vinculan la conversación con tu cuenta. No le comunicamos ningún otro dato sobre ti. Crisp tiene su sede en Francia.

**Script de compra.** Cuando apuntas a un botón Comprar o llegas a él con el tabulador, tu navegador carga el script de compra de {merchant} desde jsDelivr (`cdn.jsdelivr.net`), que recibe tu dirección IP y los detalles del navegador. El proceso de compra solo se abre desde {merchant} cuando haces clic.

**Comprobación del boletín.** Cuando empiezas a usar el formulario del boletín, tu navegador carga Cloudflare Turnstile desde `challenges.cloudflare.com` para comprobar que se suscribe una persona; Cloudflare recibe tu dirección IP y los detalles de tu navegador.

**Atribución de compras.** Al llegar al sitio, tu navegador conserva durante 90 días un registro de primera visita llamado `tablepro:attribution` en su almacenamiento local: el origen de la visita (las etiquetas `ref` o `utm_*` del enlace seguido, o el sitio que te enlazó), la página de llegada y la fecha. Si inicias una compra, el registro se envía con la solicitud de compra. Nuestro servidor transmite el origen de la visita a {merchant} como metadatos de la compra, lo guarda con el pedido cuando pagas y lo envía a PostHog con la compra y el pago. La página de llegada y la fecha no se guardan.

**Documentación.** La documentación en docs.tablepro.app está alojada en Mintlify, que recibe tu dirección IP y los datos de tu navegador con cada página, y las páginas cargan sus fuentes desde Google Fonts. La barra de navegación muestra el número de estrellas del repositorio, que tu navegador obtiene de la API de GitHub, por lo que GitHub también recibe tu dirección IP y los datos de tu navegador. Esa solicitud no establece cookies. La documentación hace su propia pregunta sobre cookies, porque no puede leer la respuesta que diste en este sitio. Hasta que selecciones **Allow** allí, no establece cookies ni guarda ningún ID de visitante. Si lo permites, Google Analytics establece las cookies `_ga` y `_ga_<ID>` y mide tus visitas a la documentación, y Mintlify guarda un ID de visitante aleatorio, `mintlify_anonymous_id`, en el almacenamiento local para contarlas. **Cookie settings**, en el pie de la documentación, cambia tu respuesta, y al rechazar se eliminan ambos. Base jurídica: tu consentimiento.

**Idioma y descuento regional.** Para sugerirte la página en tu idioma cuando tu navegador no indica ninguno de los que ofrece el sitio, y para mostrar el descuento regional que aplicaría la compra, el sitio pregunta a Cloudflare (`/cdn-cgi/trace`) y a nuestro servidor de qué país procede tu conexión, y puede leer la zona horaria de tu dispositivo. Ninguna de las dos solicitudes lleva cookies, y la página no guarda nada de las respuestas. Base jurídica: interés legítimo.

Leer el sitio no establece cookies propias. Las solicitudes de suscripción al boletín, compra y comprobación de códigos de descuento desde el sitio público omiten las credenciales: no envían cookies del portal de cuentas ni aceptan cookies de la respuesta. Abrir páginas del portal es una acción separada: iniciar sesión allí establece la cookie del portal indicada abajo. Todo lo que el sitio conserva en tu navegador aparece en [Cookies y almacenamiento del navegador](#cookies).

## Compras {#purchases}

Las licencias las vende {merchant} (Polar Software, Inc.), nuestro merchant of record y revendedor. Compras a {merchant} según sus propias condiciones para compradores y su política de privacidad. {merchant} recibe el pago, calcula y paga los impuestos sobre ventas o el IVA, envía recibos y facturas y gestiona problemas y disputas de pago. Recopila tu nombre, correo, dirección de facturación y datos de pago. Nunca vemos los datos completos de tu tarjeta.

Cuando inicias una compra, nuestro servidor comunica a {merchant} lo que compras, el idioma de la página donde compras, el origen de tu visita (consulta [Sitio web](#website)) y tu dirección IP, que {merchant} usa para calcular impuestos y moneda. De {merchant} recibimos tu correo, tu nombre y dirección de facturación tal como los introdujiste, lo que compraste, los importes, los identificadores de pedido y suscripción y los cambios posteriores, como renovaciones, cancelaciones y reembolsos. Con cada pedido guardamos el correo, el país de facturación y los importes.

Una compra hecha sin iniciar sesión va a la cuenta de TablePro del correo con el que compraste, que se crea si no existe y queda sin verificar hasta que inicias sesión por primera vez. En el [portal de cuentas]({account}) puedes cambiar el ciclo de facturación o los puestos de una suscripción, cancelarla o reanudarla y pedir un reembolso. Cuando cancelas, el motivo que eliges y el comentario que escribas van a {merchant} y se guardan con la suscripción. La tarjeta, las facturas, los datos fiscales y la dirección de facturación están en el [portal de clientes de {merchant}]({portal}), que el portal de cuentas abre por ti. Los reembolsos se describen en la [política de reembolso](/es/refund-policy), y lo que permite una licencia, en las [condiciones del servicio](/es/terms).

## Portal de cuentas {#account}

El [portal de cuentas]({account}) en account.tablepro.app es donde gestionas tu cuenta de TablePro: sus licencias, dispositivos, facturación y equipos. Funciona en nuestro servidor, detrás de Cloudflare, como el sitio web.

**Tu cuenta.** Una cuenta pertenece a una persona y se identifica por una dirección de correo. Contiene esa dirección, el nombre y el idioma que elijas, tus métodos de inicio de sesión, los dispositivos conectados a ella, tus licencias y pedidos, los equipos a los que perteneces con tu rol y tu puesto, y un registro de auditoría de los cambios hechos en ella, como inicios de sesión, dispositivos nuevos y cambios de equipo, con la dirección IP y el navegador de la solicitud que hizo cada uno. Nuestros correos te llegan en el idioma de tu cuenta.

**Inicio de sesión.** Te enviamos por correo un enlace y un código de 6 dígitos: el enlace funciona una vez, el código admite 5 intentos y ambos caducan a los 15 minutos. También puedes añadir llaves de acceso; de cada una guardamos su clave pública, el nombre que le das, si se sincroniza entre tus dispositivos y cuándo se añadió y se usó por última vez. O puedes iniciar sesión con Apple, GitHub o Google: el proveedor nos indica un identificador tuyo y tu dirección de correo verificada, y Apple también tu nombre la primera vez. Guardamos el identificador y la dirección con tu cuenta y, para Apple, un token que conservamos cifrado y revocamos ante Apple cuando desvinculas Apple o eliminas tu cuenta. Si la dirección de un proveedor pertenece a una cuenta existente, enviamos a esa cuenta un enlace y un código para confirmar antes de vincularlas, salvo que Google gestione la dirección (Gmail o Google Workspace).

**Tus equipos.** Cuando invitas a alguien a un equipo, guardamos su correo, su rol y si la invitación incluye un puesto, y le enviamos un enlace válido durante 7 días. Los propietarios y administradores ven los miembros del equipo con sus nombres y correos, sus invitaciones y su registro de auditoría, que muestra quién cambió qué en el equipo, incluidas las direcciones invitadas, pero nunca una dirección IP ni un navegador. Los miembros ven el equipo, su plan, sus puestos y su propio rol.

**Tus datos.** En los ajustes puedes cambiar tu nombre, tu correo y tu idioma, añadir y quitar métodos de inicio de sesión, descargar los datos de tu cuenta como archivo JSON y eliminar tu cuenta. No puedes eliminarla mientras seas propietario de un equipo con otros miembros. Eliminarla quita tus métodos de inicio de sesión, dispositivos, licencias, membresías de equipo y los equipos que solo te tienen a ti, y termina tus suscripciones sin reembolso. Lo que conservamos después se indica en [Cuánto tiempo conservamos los datos](#retention).

**Lo que carga el portal.** El portal no carga Google Analytics, Cloudflare Web Analytics ni ningún otro script de análisis, y no hace ninguna pregunta sobre cookies. Muestra el chat en directo de Crisp descrito en [Sitio web](#website), y una compra hecha allí abre la página de pago de {merchant} sobre la página. Informa de errores y tiempos de carga a Grafana Cloud con Grafana Faro: el error, la pantalla donde ocurrió (nunca la dirección completa, que puede contener el token de un enlace), tu navegador y sistema operativo, y un identificador aleatorio de tu visita.

## Boletín {#newsletter}

Si te suscribes a las notas de versión, primero te enviamos un enlace de confirmación en el idioma de la página desde la que te suscribiste. El enlace es válido durante 7 días y una dirección recibe como máximo 3 al día. Cuando confirmas, tu dirección entra en nuestra lista del boletín en Resend, el servicio que envía nuestros correos. Todos los boletines incluyen un enlace para darse de baja, que gestiona Resend. Tras darte de baja no enviamos más boletines; para que eliminemos también la dirección, escríbenos. Cloudflare Turnstile comprueba el formulario, como se describe en [Sitio web](#website).

Al pasar de nuestro servidor anterior, todas las direcciones de su lista de correo que no se habían dado de baja entraron en esta lista como suscritas, confirmadas o no: ese servidor también había añadido las direcciones de compradores, titulares de licencias e inscritos en la beta, y les enviaba correos. Las direcciones que se habían dado de baja pasaron como dadas de baja, y aquellas cuyos correos habían rebotado o se habían marcado como spam pasaron en su lugar a la lista de supresión de Resend, así que ningún boletín les llega.

## Cookies y almacenamiento del navegador {#cookies}

Leer el sitio público y sus solicitudes de boletín, compra y códigos de descuento no establecen cookies propias. Iniciar sesión en el portal de cuentas, o empezar a hacerlo, establece la única cookie estrictamente necesaria indicada abajo. Cloudflare Web Analytics no establece cookies ni almacena nada en tu navegador. Las cookies de Google Analytics no se establecen hasta que las permites. Crisp establece sus cookies en todas las páginas una vez cargado el chat. Nada de esto se usa para publicidad ni se vende.

- **`_ga` y `_ga_<ID>`** (cookies de Google Analytics, hasta 2 años, solo si permites el análisis): un identificador aleatorio del navegador y el estado de tu visita actual. Rechazarlas, o cambiar tu respuesta después, las elimina. Base jurídica: consentimiento.
- **`tablepro:analytics-consent`** (almacenamiento local, hasta que lo borres): tu respuesta a la pregunta sobre análisis, para no preguntarte en todas las páginas. El portal de cuentas no carga análisis, así que no hace esta pregunta ni lee la respuesta. Base jurídica: estrictamente necesario para respetar tu elección.
- **`tablepro:attribution`** (almacenamiento local, 90 días): el registro de primera visita descrito en [Sitio web](#website). No contiene un identificador tuyo y solo se envía con una solicitud de compra, que transmite el origen de la visita a {merchant}. Base jurídica: interés legítimo.
- **`theme`** (almacenamiento local, hasta que lo borres): si elegiste apariencia clara, oscura o del sistema. El portal de cuentas guarda la suya. Base jurídica: interés legítimo.
- **`tablepro:language`** (almacenamiento local, hasta que lo borres): el idioma que elegiste en el menú de idiomas o en la barra de idioma, y cada idioma cuya sugerencia cerraste, para no volver a ofrecerlo. Base jurídica: interés legítimo.
- **`mintlify_anonymous_id`** (almacenamiento local en docs.tablepro.app, lo guarda Mintlify, solo si permites Google Analytics allí): el ID de visitante descrito en [Sitio web](#website). Al rechazar se elimina. La documentación guarda su propia respuesta `tablepro:analytics-consent`. Base jurídica: consentimiento.
- **Cookies que comienzan por `crisp-client/`** (Crisp, por ejemplo `crisp-client/session/…`; 6 meses, renovados cuando vuelves; establecidas en todas las páginas al cargar el chat): mantienen el chat y tu conversación entre páginas y visitas. Base jurídica: interés legítimo, para ofrecer soporte en todas las páginas.
- **`__Host-tp_session`** (cookie del portal de cuentas, 30 días desde que inicias sesión): mantiene tu sesión iniciada. Antes de iniciar sesión solo se establece mientras está en curso un inicio de sesión con llave de acceso, Apple, GitHub, Google o desde una app, durante 10 minutos como máximo. Cerrar sesión la elimina. Las solicitudes de boletín, compra y códigos de descuento desde el sitio público omiten las credenciales y nunca la reciben. Base jurídica: estrictamente necesaria.
- **`locale`, `context` y `sign-in-return-to`** (almacenamiento local del portal de cuentas): el idioma que elegiste allí antes de iniciar sesión y si abriste por última vez Personal o un equipo, ambos hasta que los borres, y durante 15 minutos la página a la que volver tras abrir un enlace de inicio de sesión recibido por correo. Base jurídica: interés legítimo.
- **`com.grafana.faro.session`** (almacenamiento de sesión del portal de cuentas, hasta que cierres la pestaña): el identificador aleatorio de visita de los informes de errores del portal. Base jurídica: interés legítimo.

Puedes cambiar o retirar tu respuesta sobre análisis en cualquier momento desde **Configuración de cookies** en el pie de todas las páginas, o aquí:

<cookie-settings></cookie-settings>

## Base jurídica {#lawful-basis}

Para lectores del Espacio Económico Europeo y del Reino Unido, las bases jurídicas según el RGPD y el RGPD del Reino Unido son:

- **Contrato** (art. 6.1.b): venta y provisión de licencias, tu cuenta con sus métodos de inicio de sesión y dispositivos, comprobaciones de licencia, portal de cuentas y Team Library.
- **Interés legítimo** (art. 6.1.f): datos de uso de la app para Mac y su análisis en PostHog, eventos sobre inicios de sesión, compras, dispositivos y equipos que nuestro servidor envía a PostHog, registro de auditoría de la cuenta, seguridad y prevención de abusos, incluido Cloudflare Turnstile en el formulario del boletín, registros del servidor web e informes de errores del portal de cuentas, Cloudflare Web Analytics, registro de atribución de compras, consulta de país para el idioma y el descuento regional, y chat en directo en todas las páginas.
- **Consentimiento** (art. 6.1.a): cookies de Google Analytics, informe de uso de la app para iPhone y iPad, boletín y conversaciones que inicias en el chat en directo.
- **Obligación legal** (art. 6.1.c): registros fiscales y contables y respuestas a solicitudes legítimas.

## Quién recibe datos {#sharing}

Solo compartimos datos personales con los servicios necesarios para operar TablePro:

- **{merchant}**, el merchant of record de las compras.
- **Resend**, que envía nuestros correos: enlaces y códigos de inicio de sesión, invitaciones de equipo, avisos de cuenta y de seguridad, y boletines. Conserva la lista del boletín y nos avisa cuando un correo a una dirección rebota o se marca como spam.
- **Nuestro proveedor de alojamiento y Cloudflare**, para el sitio web, el portal de cuentas y el servidor con el que se comunican las apps. Cloudflare también cuenta las visitas mediante Cloudflare Web Analytics y comprueba el formulario del boletín con Turnstile.
- **Google**, para Google Analytics en el sitio web y la documentación.
- **Crisp**, para el chat en directo en todas las páginas del sitio web y del portal de cuentas.
- **PostHog** (EU Cloud), nuestro servicio de analítica de producto, que recibe los informes de uso de las apps y los eventos de nuestro servidor sobre inicios de sesión, compras, dispositivos y equipos, con el identificador de tu cuenta pero nunca tu correo ni tu nombre. Los datos de uso que la app para Mac envía directamente llegan a PostHog con la dirección IP de tu Mac.
- **Grafana Labs** (Grafana Cloud), que recibe los registros y trazas de nuestro servidor y los informes de errores del portal de cuentas.
- **Apple, GitHub y Google**, cuando inicias sesión en tu cuenta con ellos.
- **jsDelivr**, que proporciona al navegador el script de compra de {merchant} cuando apuntas a un botón Comprar.
- **Mintlify**, que aloja la documentación en docs.tablepro.app.
- **GitHub**, que aloja el canal de actualizaciones, el catálogo de plugins y las descargas, y sirve el número de estrellas que muestra la documentación.

No vendemos datos personales ni los compartimos con anunciantes.

## Transferencias internacionales {#transfers}

Los servicios anteriores operan en varios países, por lo que tus datos pueden tratarse fuera del tuyo. {merchant}, Google, GitHub, Cloudflare y Mintlify tratan datos en Estados Unidos; Google lo hace según el Marco de Privacidad de Datos UE-EE. UU. y las Cláusulas Contractuales Tipo. PostHog los trata en la Unión Europea. Cuando la ley lo exige, las transferencias desde el EEE y el Reino Unido se basan en Cláusulas Contractuales Tipo u otro mecanismo aprobado.

## Cuánto tiempo conservamos los datos {#retention}

- **Informes de uso y eventos de análisis**: nuestro servidor no guarda ninguna copia una vez que los ha reenviado a PostHog. No hemos fijado un plazo para ellos en PostHog.
- **Registros de nuestro servidor anterior**: una copia de toda su base de datos se conserva indefinidamente en un archivo. Incluye licencias, pedidos y miembros de equipo con sus correos y nombres; los Mac activados con una licencia, con sus nombres; suscriptores del boletín e inscripciones a la beta; constancia de los correos que envió; y los informes de uso y los registros de solicitudes de licencia que guardaba, con sus direcciones IP.
- **Dispositivos**: se conservan mientras se usan. Un dispositivo que no se comunica en 180 días se quita, salvo que aún tenga un archivo sin conexión válido, y un dispositivo quitado se elimina un año después.
- **Registro de auditoría de tu cuenta**: se conserva mientras exista la cuenta, con la dirección IP y el navegador de cada cambio que hiciste. Al eliminar la cuenta se quitan de él tus direcciones de correo y la dirección IP y el navegador de lo que hiciste; queda el registro de cada cambio.
- **Pedidos**: se conservan para fines fiscales y contables. Al eliminar tu cuenta se quitan de ellos tu correo y tu cuenta.
- **Notificaciones de {merchant}, Resend y Apple**: 180 días. Las de {merchant} contienen tu nombre, correo y dirección de facturación; al eliminar tu cuenta, esos datos se quitan antes de las que tratan de tus compras.
- **Team Library**: hasta que un elemento se cambia o se elimina; un elemento eliminado se conserva 90 días. La biblioteca se elimina con su equipo y permanece cuando termina una licencia.
- **Enlaces y códigos de inicio de sesión**: caducan a los 15 minutos y se eliminan 7 días después. Las sesiones del portal duran 30 días. El token que mantiene la sesión de una app caduca 90 días después de que la app lo usara por última vez y se elimina 30 días más tarde.
- **Cuentas eliminadas**: la cuenta, sus métodos de inicio de sesión, dispositivos, licencias y membresías de equipo se eliminan de inmediato. Los pedidos y el registro de auditoría se conservan como se indica arriba. Lo que nuestro servidor anterior guardaba sobre ti sigue en su archivo, descrito arriba.
- **Boletín**: un enlace de confirmación y la dirección a la que se envió se eliminan 7 días después de que caduque el enlace. Una dirección confirmada, o traída de nuestro servidor anterior, permanece en nuestra lista en Resend hasta que la eliminemos a petición tuya; tras darte de baja se conserva como dada de baja, para que no le llegue ningún boletín.
- **Google Analytics**: datos de usuarios y eventos durante 2 meses, el plazo predeterminado de Google que usa nuestra propiedad. Sus cookies duran hasta 2 años o se eliminan al rechazarlas.
- **Cloudflare Web Analytics**: Cloudflare nos muestra los totales de visitas de los últimos seis meses. No se almacena nada en tu navegador.
- **Chat en directo y correos de soporte**: se conservan en Crisp y en nuestra bandeja hasta su eliminación. Solicita que eliminemos tus conversaciones y correos.
- **Registros del servidor web**: se conservan para seguridad y resolución de problemas. Todavía no hemos fijado un plazo.
- **Registros y trazas de nuestro servidor, e informes de errores del portal**: 14 días, en Grafana Cloud.

## Tus derechos {#rights}

Según dónde residas, puedes pedirnos que:

- te demos una copia de los datos personales que tenemos sobre ti (acceso);
- los corrijamos (rectificación);
- los eliminemos (supresión), salvo los que debamos conservar por ley;
- limitemos su uso (limitación);
- te los enviemos en un formato estructurado y legible por máquina (portabilidad);
- dejemos de usarlos según el interés legítimo (oposición).

Puedes retirar tu consentimiento en cualquier momento y reclamar ante tu autoridad de protección de datos. Para ejercer estos derechos, escribe a [{email}](mailto:{email}). Respondemos en 30 días. En el [portal de cuentas]({account}), los ajustes también te dan una copia de los datos de tu cuenta y la eliminan. Para todo lo demás, como una dirección del boletín o un Mac sin cuenta, indica el correo, la clave de licencia o el dispositivo correspondiente. Los datos que conservan {merchant}, Google, Crisp o GitHub también están cubiertos por sus propias políticas.

**Residentes de California.** La Ley de Privacidad del Consumidor de California te otorga el derecho a saber qué información personal recopilamos, pedirnos su eliminación, excluirte de su venta y no recibir un trato distinto por ejercer estos derechos. No vendemos información personal.

## Menores {#children}

TablePro no está dirigido a menores de 16 años y no recopilamos sus datos personales a sabiendas. Si crees que un menor nos ha proporcionado datos personales, contacta con nosotros y los eliminaremos.

## Seguridad {#security}

El tráfico entre las apps, el sitio web, el portal de cuentas y nuestro servidor usa HTTPS. Las cuentas de TablePro no tienen contraseñas. Los enlaces y códigos de inicio de sesión, los tokens que mantienen la sesión de las apps y los tokens de API de equipo se almacenan como hashes. La tarea que envía por correo un enlace y un código de inicio de sesión los guarda en texto plano hasta que se elimina: un día después de enviar el correo, o 7 días después de que dejemos de intentar enviarlo. Ambos dejan de funcionar 15 minutos después de que los pidas. El acceso a nuestros sistemas se limita a {publisherName} y a los proveedores de servicios indicados en [Quién recibe datos](#sharing). Ningún sistema es perfectamente seguro. Para informar de una vulnerabilidad, consulta la [página de seguridad](/es/security#report) o escribe a [{email}](mailto:{email}).

## Cambios en esta política {#changes}

Cuando cambia esta política, la actualizamos aquí con una nueva fecha de «Última actualización» y, cuando la ley lo exige, te lo comunicamos directamente.

## Contacto {#contact}

Si tienes preguntas sobre privacidad o esta política, escribe a [{email}](mailto:{email}).
