# PrimeIndex Research & Analytics

Next.js 14 + PostgreSQL (Prisma) + Vercel Blob + Resend.

## Deploy on Vercel
1. Upload this folder's contents to a new private GitHub repository.
2. In Vercel: Add New > Project > import the repository.
3. In Vercel Storage create a Neon Postgres database (copy DATABASE_URL) and a Blob store (adds BLOB_READ_WRITE_TOKEN).
4. Create a Resend account, make an API key, verify your domain.
5. Create the admin password hash on your computer:
   npm install
   node -e "console.log(require('bcryptjs').hashSync('YOUR-STRONG-PASSWORD',12))"
6. In Vercel > Settings > Environment Variables, add every name in .env.example:
   DATABASE_URL, AUTH_SECRET (random 32+ chars), ADMIN_EMAIL, ADMIN_PASSWORD_HASH,
   RESEND_API_KEY, MAIL_FROM, NOTIFY_EMAIL, BLOB_READ_WRITE_TOKEN, SITE_URL.
   In the hash value, escape each $ as \$ if Vercel shows the hash truncated.
7. Click Deploy. The build creates the database tables (prisma db push).
8. Sign in at /admin. Test a request with a file, status change, article, CSV export.
9. Custom domain: Project > Settings > Domains. Then update SITE_URL and redeploy.

## Local (Windows)
Copy .env.example to .env, fill it in, then: npm install, npx prisma db push, npm run dev.

## Notes
- Client files are in Vercel Blob behind long random URLs (not login-protected).
- One admin account (set via environment variables).
- Code was written without running it; fix any first-build errors from the Vercel log.
- Privacy notice is draft text: have it reviewed (Nigeria Data Protection Act 2023).
