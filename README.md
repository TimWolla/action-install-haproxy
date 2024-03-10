# GitHub Actions: Install HAProxy

This GitHub action allows you to easily install the latest HAProxy snapshot for
a given branch.

## Usage

```yaml
- name: Install HAProxy 2.2.
  uses: timwolla/action-install-haproxy@main
  id: install-haproxy
  with:
    branch: '2.2'
    use_openssl: yes
```
