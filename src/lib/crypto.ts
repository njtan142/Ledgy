// Browser-native WebCrypto implementation for AES-256-GCM and HKDF

export async function deriveKeyFromTotp(totpSecret: string, salt: Uint8Array): Promise<CryptoKey> {
    // 1. Convert secret to key material
    const encoder = new TextEncoder();
    const secretKeyMaterial = await crypto.subtle.importKey(
        "raw",
        encoder.encode(totpSecret),
        { name: "HKDF" },
        false,
        ["deriveKey"]
    );

    // 2. Derive AES-256-GCM key
    return await crypto.subtle.deriveKey(
        {
            name: "HKDF",
            hash: "SHA-256",
            salt: salt,
            info: new Uint8Array(), // Empty info array
        },
        secretKeyMaterial,
        { name: "AES-GCM", length: 256 },
        false, // extractable
        ["encrypt", "decrypt"]
    );
}

export async function encryptPayload(key: CryptoKey, plaintext: string): Promise<{ iv: number[], ciphertext: ArrayBuffer }> {
    const encoder = new TextEncoder();
    const data = encoder.encode(plaintext);
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const ciphertext = await crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv,
        },
        key,
        data
    );

    return {
        iv: Array.from(iv),
        ciphertext,
    };
}

export async function decryptPayload(key: CryptoKey, iv: Uint8Array, ciphertext: ArrayBuffer): Promise<string> {
    const decrypted = await crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: iv,
        },
        key,
        ciphertext
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
}
