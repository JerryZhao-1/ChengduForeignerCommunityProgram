#!/usr/bin/env node
import { randomBytes, scrypt as scryptCallback } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const password = process.argv[2];

if (!password) {
  console.error("Usage: node scripts/hash_admin_password.mjs <password>");
  process.exit(1);
}

const n = 16384;
const r = 8;
const p = 1;
const salt = randomBytes(16);
const key = await scrypt(password, salt, 64, { N: n, r, p });

console.log(
  `API_ADMIN_PASSWORD_SCRYPT=scrypt$${n}$${r}$${p}$${salt.toString("base64url")}$${key.toString("base64url")}`
);
