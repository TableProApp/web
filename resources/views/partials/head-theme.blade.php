{{-- Shared with TableProApp/web and TableProApp/license at resources/views/partials/head-theme.blade.php. Change both in the same release. See docs/shared-files.md. --}}
<meta name="theme-color" content="#ffffff">
<script>
(function () {
  var choice = 'system';
  try {
    var t = localStorage.getItem('theme');
    if (t === 'dark' || t === 'system' || t === 'light') { choice = t; }
  } catch (e) {}
  var dark = choice === 'dark' || (choice === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  var root = document.documentElement;
  if (dark) { root.classList.add('dark'); }
  root.dataset.themeChoice = choice;          /* drives the control's icon without hydration */
  root.style.colorScheme = dark ? 'dark' : 'light';
  var m = document.querySelector('meta[name="theme-color"]');
  if (m) { m.setAttribute('content', dark ? '#121212' : '#ffffff'); }
})();
</script>
