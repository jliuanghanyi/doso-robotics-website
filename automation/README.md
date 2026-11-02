# www.dosorobotics.com HTTPS renewal

The GitHub workflow checks the public certificate each Monday at 11:17 China time. When 30 or fewer days remain, it requests a new Let's Encrypt certificate through HTTP-01, updates the certificate on the existing OSS CNAME, and checks the public TLS endpoint. It never commits a certificate or private key.

**Current setup status:** Local automation is prepared. It is **not active** until the RAM OIDC provider, role and policy are connected, the GitHub repository variables are set, and a staging and production run both pass.

## Alibaba Cloud authorization

Use a dedicated OIDC provider named `DOSOGitHubActions`: issuer `https://token.actions.githubusercontent.com`, client ID `sts.aliyuncs.com`. Get its TLS fingerprint with the RAM console's **Get Fingerprint** button and verify it against the issuer certificate. Create role `DOSOCertificateRenewal` with the trust policy in `ram-trust-template.json`, replacing `ACCOUNT_ID` with the real Alibaba Cloud account ID. Attach only `ram-policy.json` to the role.

**Review the policy before granting it.** Alibaba Cloud documents three Certificate Management permissions as required for `PutCname` with a certificate. The private-key read permission uses `Resource: "*"`; this role can read other certificates' private keys in the same Alibaba Cloud account, even though the GitHub workflow itself never requests them. The OIDC trust restricts role assumption to the repository's `main` branch, but anyone who can change that branch's workflow can use those role permissions. Protect `main` and remove the role if this risk is unacceptable.

## GitHub repository variables

In repository **Settings → Secrets and variables → Actions → Variables**, set:

- `ALIYUN_OIDC_PROVIDER_ARN` = `acs:ram::<ACCOUNT_ID>:oidc-provider/DOSOGitHubActions`
- `ALIYUN_CERT_ROLE_ARN` = `acs:ram::<ACCOUNT_ID>:role/DOSOCertificateRenewal`
- `ACME_CONTACT_EMAIL` = the address for Let's Encrypt expiry notices

No AccessKey or certificate private key belongs in GitHub settings, issues, chat, or the repository.

## Activation checks

1. Run **Renew DOSO OSS HTTPS certificate** manually in `check` mode. The job should report the live expiry date and require no Alibaba Cloud permission.
2. Run it in `staging` mode. This verifies that the OIDC role, OSS challenge upload, public HTTP-01 route, and Let's Encrypt staging request work. It does not replace the live certificate.
3. Run it once in `production` mode. Confirm `OSS_CERTIFICATE_LIVE=verified` and check the new expiration in a browser. This does replace the live certificate.
4. Check GitHub Actions after each scheduled run. A separate monthly workflow commits a maintenance timestamp because GitHub may disable scheduled workflows in a public repository after 60 days without activity. This safeguard still depends on the workflow running and branch writes being allowed; verify the run history before relying on it.

If a future renewal fails, the current certificate continues serving until its expiry. The workflow must be fixed before then; GitHub's scheduled jobs are not a service-level guarantee.
