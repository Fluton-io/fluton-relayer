import { Worker } from "worker_threads";
import path from "path";

export function decryptInWorker(payload: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(path.join(__dirname, "decrypt.worker.mjs"));

    worker.postMessage(payload);

    worker.on("message", (msg) => {
      worker.terminate();
      msg.ok ? resolve(msg.decrypted) : reject(msg.error);
    });

    worker.on("error", reject);
  });
}

export function encryptInWorker(payload: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(path.join(__dirname, "encrypt.worker.mjs"));

    worker.postMessage(payload);

    worker.on("message", (msg) => {
      worker.terminate();

      if (!msg.ok) {
        reject(new Error(msg.error));
        return;
      }

      resolve(msg.encrypted);
    });

    worker.on("error", reject);
  });
}

export function fhenixDecryptInWorker(payload: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(path.join(__dirname, "fhenix-decrypt.worker.cjs"));

    worker.postMessage(payload);

    worker.on("message", (msg) => {
      worker.terminate();
      msg.ok ? resolve(msg.decrypted) : reject(new Error(msg.error));
    });

    worker.on("error", reject);
  });
}

export function fhenixEncryptInWorker(payload: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(path.join(__dirname, "fhenix-encrypt.worker.cjs"));

    worker.postMessage(payload);

    worker.on("message", (msg) => {
      worker.terminate();

      if (!msg.ok) {
        reject(new Error(msg.error));
        return;
      }

      resolve(msg.encrypted);
    });

    worker.on("error", reject);
  });
}
