---
name: Bug report
about: Something isn't working the way you expected
title: "[bug] "
labels: bug
---

**What happened?**
<!-- A clear description of the bug. -->

**What did you expect to happen?**
<!-- -->

**Steps to reproduce**
1.
2.
3.

**Environment**
- CloudForge commit: <!-- git rev-parse HEAD -->
- OS: <!-- Windows 11 + WSL2, macOS 14, Ubuntu 22.04, etc. -->
- Docker version: <!-- docker version --format '{{.Server.Version}}' -->
- Browser (if frontend bug): <!-- Chrome 135, Firefox 127 -->

**Logs**
<!-- Paste relevant output from `docker compose logs backend` or the browser console. -->

```
```

**Cloud provider + resource (if Terraform generation bug)**
- Provider: <!-- aws / azure / gcp -->
- Resource type: <!-- e.g. aws_vpc, google_compute_instance -->
