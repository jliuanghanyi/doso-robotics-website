"""Renew www.dosorobotics.com through OSS without persisting cloud credentials.

Run by the GitHub Actions workflow. Never print the private key, ACME token,
or temporary Alibaba Cloud credentials.
"""

from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
import os
import re
import socket
import ssl
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.request
from pathlib import Path


DOMAIN = "www.dosorobotics.com"
BUCKET = "doso-robotics-site"
REGION = "cn-shanghai"
CHALLENGE_PREFIX = ".well-known/acme-challenge/"
TOKEN_PATTERN = re.compile(r"[A-Za-z0-9_-]{16,256}\Z")


def live_certificate() -> dict:
    context = ssl.create_default_context()
    with socket.create_connection((DOMAIN, 443), timeout=15) as connection:
        with context.wrap_socket(connection, server_hostname=DOMAIN) as tls:
            certificate = tls.getpeercert()
    if not certificate or not certificate.get("notAfter"):
        raise RuntimeError("The live TLS certificate has no expiration date")
    expires = dt.datetime.fromtimestamp(
        ssl.cert_time_to_seconds(certificate["notAfter"]), dt.timezone.utc
    )
    return {"expires": expires, "certificate": certificate}


def due(days: int, force: bool) -> int:
    try:
        current = live_certificate()
    except ssl.SSLCertVerificationError:
        # An expired or otherwise invalid live certificate must not block recovery.
        print("LIVE_CERT_VALIDATION=failed")
        print("RENEWAL_DUE=yes")
        return 0
    remaining = current["expires"] - dt.datetime.now(dt.timezone.utc)
    print(f"LIVE_CERT_EXPIRES_UTC={current['expires'].isoformat()}")
    print(f"DAYS_REMAINING={remaining.total_seconds() / 86400:.1f}")
    if force or remaining <= dt.timedelta(days=days):
        print("RENEWAL_DUE=yes")
        return 0
    print("RENEWAL_DUE=no")
    return 3


def challenge_values(require_validation: bool = True) -> tuple[str, str]:
    identifier = os.environ.get("CERTBOT_IDENTIFIER") or os.environ.get("CERTBOT_DOMAIN")
    token = os.environ.get("CERTBOT_TOKEN", "")
    validation = os.environ.get("CERTBOT_VALIDATION", "")
    if identifier != DOMAIN or not TOKEN_PATTERN.fullmatch(token):
        raise RuntimeError("Unexpected ACME identifier or token")
    if require_validation and (not validation.isascii() or not validation or len(validation) > 2048):
        raise RuntimeError("Invalid ACME validation content")
    return token, validation


def ossutil(*arguments: str, cwd: Path | None = None) -> None:
    for name in ("OSS_ACCESS_KEY_ID", "OSS_ACCESS_KEY_SECRET", "OSS_SESSION_TOKEN"):
        if not os.environ.get(name):
            raise RuntimeError(f"Missing short-lived Alibaba Cloud credential: {name}")
    subprocess.run(
        ["ossutil", *arguments, "--region", REGION],
        cwd=cwd,
        check=True,
        stdout=subprocess.DEVNULL,
    )


def auth() -> None:
    token, validation = challenge_values()
    with tempfile.TemporaryDirectory() as temporary:
        source = Path(temporary) / token
        source.write_text(validation, encoding="ascii")
        source.chmod(0o600)
        ossutil("cp", str(source), f"oss://{BUCKET}/{CHALLENGE_PREFIX}{token}")

    url = f"http://{DOMAIN}/{CHALLENGE_PREFIX}{token}"
    # HTTP-01 may redirect to an HTTPS endpoint whose old certificate has
    # expired. Match the exact challenge body; the CA validates independently.
    challenge_context = ssl._create_unverified_context()
    for attempt in range(20):
        try:
            with urllib.request.urlopen(url, timeout=15, context=challenge_context) as response:
                actual = response.read(2049).decode("ascii")
            if actual == validation:
                print("ACME_CHALLENGE_PUBLIC=verified")
                return
        except (OSError, UnicodeError, urllib.error.URLError):
            pass
        if attempt < 19:
            time.sleep(5)
    raise RuntimeError("The public HTTP-01 challenge did not match the uploaded file")


def cleanup() -> None:
    token, _ = challenge_values(require_validation=False)
    ossutil("rm", f"oss://{BUCKET}/{CHALLENGE_PREFIX}{token}", "-f")
    print("ACME_CHALLENGE_CLEANED=yes")


def openssl_public_key(*arguments: str) -> bytes:
    return subprocess.run(
        ["openssl", *arguments],
        check=True,
        capture_output=True,
    ).stdout


def deploy(config_dir: Path) -> None:
    live_dir = config_dir / "live" / DOMAIN
    fullchain_path = live_dir / "fullchain.pem"
    private_key_path = live_dir / "privkey.pem"
    fullchain = fullchain_path.read_text(encoding="ascii")
    private_key = private_key_path.read_text(encoding="ascii")
    if not fullchain.startswith("-----BEGIN CERTIFICATE-----"):
        raise RuntimeError("Certbot did not provide a PEM certificate")
    if "-----BEGIN PRIVATE KEY-----" not in private_key and "-----BEGIN RSA PRIVATE KEY-----" not in private_key:
        raise RuntimeError("Certbot did not provide a PEM private key")

    certificate_text = subprocess.run(
        ["openssl", "x509", "-in", str(fullchain_path), "-noout", "-ext", "subjectAltName", "-enddate"],
        check=True,
        capture_output=True,
        text=True,
    ).stdout
    if f"DNS:{DOMAIN}" not in certificate_text:
        raise RuntimeError("Issued certificate does not cover the OSS domain")
    if hashlib.sha256(openssl_public_key("x509", "-in", str(fullchain_path), "-pubkey", "-noout")).digest() != hashlib.sha256(
        openssl_public_key("pkey", "-in", str(private_key_path), "-pubout")
    ).digest():
        raise RuntimeError("Issued certificate and private key do not match")

    new_serial = subprocess.run(
        ["openssl", "x509", "-in", str(fullchain_path), "-noout", "-serial"],
        check=True,
        capture_output=True,
        text=True,
    ).stdout.strip().split("=", 1)[1].lower()
    document = {
        "Cname": {
            "Domain": DOMAIN,
            "CertificateConfiguration": {
                "Certificate": fullchain,
                "PrivateKey": private_key,
                "Force": True,
            },
        }
    }
    with tempfile.TemporaryDirectory() as temporary:
        path = Path(temporary) / "cname.json"
        path.write_text(json.dumps(document), encoding="utf-8")
        path.chmod(0o600)
        try:
            ossutil(
                "api", "put-cname", "--bucket", BUCKET,
                "--cname-configuration", "file://cname.json", cwd=Path(temporary)
            )
        finally:
            path.unlink(missing_ok=True)

    for attempt in range(30):
        try:
            with socket.create_connection((DOMAIN, 443), timeout=15) as connection:
                with ssl.create_default_context().wrap_socket(connection, server_hostname=DOMAIN) as tls:
                    observed = tls.getpeercert(binary_form=True)
            with tempfile.TemporaryDirectory() as temporary:
                path = Path(temporary) / "live.der"
                path.write_bytes(observed)
                current_serial = subprocess.run(
                    ["openssl", "x509", "-inform", "DER", "-in", str(path), "-noout", "-serial"],
                    check=True, capture_output=True, text=True
                ).stdout.strip().split("=", 1)[1].lower()
            if current_serial == new_serial:
                print("OSS_CERTIFICATE_LIVE=verified")
                return
        except (OSError, ssl.SSLError, subprocess.CalledProcessError):
            pass
        if attempt < 29:
            time.sleep(10)
    raise RuntimeError("OSS accepted the certificate, but the public TLS endpoint did not show it yet")


def main() -> int:
    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers(dest="command", required=True)
    check = sub.add_parser("due")
    check.add_argument("--days", type=int, default=30)
    check.add_argument("--force", action="store_true")
    sub.add_parser("auth")
    sub.add_parser("cleanup")
    deployment = sub.add_parser("deploy")
    deployment.add_argument("--config-dir", type=Path, required=True)
    args = parser.parse_args()
    if args.command == "due":
        return due(args.days, args.force)
    if args.command == "auth":
        auth()
    elif args.command == "cleanup":
        cleanup()
    else:
        deploy(args.config_dir)
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as error:
        print(f"CERT_RENEWAL_ERROR={error.__class__.__name__}: {error}", file=sys.stderr)
        sys.exit(1)
