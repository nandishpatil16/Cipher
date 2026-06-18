# Cipher 🔒

**Cipher** is a premium, zero-knowledge, local-first web password manager built with modern Web Crypto APIs. It features a clean, responsive, and beautiful light user interface designed for maximum security and ease of use.

## Features

- **Zero-Knowledge Encryption**: All cryptographic operations occur strictly on your device. Your master password and unencrypted vault are never sent to any server.
- **Military-Grade Cryptography**: Uses PBKDF2 with 100,000 iterations for key derivation and AES-256-GCM for file-level and item-level encryption.
- **Dynamic Category & Logo System**: Visual category selector supporting custom site logos, gaming, social media, finance, and other categories.
- **75+ Pre-configured Site Templates**: Auto-populate fields and find logo matches for popular web services instantly.
- **Password Strength Generator**: Instantly generate highly secure, customizable passwords with entropy indicators.
- **Auto-Lock Security**: Automatically locks the vault after inactivity to keep your data safe from physical access.
- **Breach Detection**: Integrated HaveIBeenPwned API check to verify if your passwords have been exposed in known public breaches.
- **Clipboard Management**: Secure copy-to-clipboard actions with clipboard history tracking.
- **Backup & Restore**: Easily export and import your encrypted vault in standard JSON format.

## Technology Stack

- **Frontend**: Pure semantic HTML5 and Vanilla ES6 JavaScript (No bulky frameworks or build systems).
- **Styling**: Vanilla CSS3 with custom properties for rich gradients, glassmorphic elements, and micro-animations.
- **Crypto Engine**: Web Crypto API (Native browser support for hardware-accelerated encryption).

## Hosting & Deployment

Since Cipher is a pure client-side application, it can be hosted for free on **GitHub Pages**, Vercel, Netlify, or any static hosting service.

### Hosting on GitHub Pages
1. Push this repository to your GitHub account (e.g., `https://github.com/nandishpatil16/Cipher.git`).
2. Go to the repository settings on GitHub.
3. In the sidebar, click **Pages**.
4. Under **Build and deployment**, select **Deploy from a branch**.
5. Set the branch to `main` (or `master`) and folder to `/ (root)`.
6. Click **Save**.
7. Your application will be live at `https://nandishpatil16.github.io/Cipher/` within a few minutes.

> ⚠️ **Important Security Note**: Modern browser Web Crypto APIs require a secure context (**HTTPS**) to function properly. Running the app over standard `http://` on remote hosts will cause encryption tools to fail. Local development on `http://localhost` is allowed by browsers.

## License

This project is licensed under the MIT License.
