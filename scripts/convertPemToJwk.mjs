import fs from "fs/promises"
import rsaPemToJwk from "rsa-pem-to-jwk"
import path from "path"

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const privateKey =  await fs.readFile(path.join(__dirname, "../certs/private.pem"))
const jwk = rsaPemToJwk(privateKey, {use : "sig"}, 'public');

console.log(JSON.stringify(jwk))