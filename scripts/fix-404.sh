#!/bin/bash
# Post-build: replace 404.html with SPA redirect
cat > out/404.html << 'HTML'
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Arena Analytics</title>
  <script>
    var basePath = '/arena-analytics';
    var path = window.location.pathname;
    if (path.startsWith(basePath)) {
      // Store the attempted path for potential future use
      sessionStorage.setItem('redirect_path', path);
    }
    window.location.replace(basePath + '/dashboard/overview');
  </script>
</head>
<body><p>Redirecting...</p></body>
</html>
HTML
echo "404.html replaced with SPA redirect"
