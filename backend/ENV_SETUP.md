# Environment Configuration Guide

## Quick Start

1. **Copy the template file:**
   ```bash
   cp .env.template .env
   ```

2. **Fill in your credentials** in the `.env` file

3. **Never commit `.env`** to git (it's in `.gitignore`)

## Required Variables

### 🔴 Critical (Must Set)
These variables are **required** for the application to start:

```bash
DB_URL=jdbc:postgresql://localhost:5432/vaxsafe_db
DB_USERNAME=postgres
DB_PASSWORD=your_password
JWT_SECRET=minimum_256_bits_secret_key
```

### 🟡 Important (Needed for Features)
Required for specific features:

```bash
# For OAuth login
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# For image upload
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# For email notifications
MAIL_PASSWORD=... (Gmail App Password)
```

### 🟢 Optional (Can Use Defaults)
These have default values in `application.properties`:

```bash
BLOCKCHAIN_SERVICE_URL=http://localhost:4000
REMINDER_DAYS_BEFORE=1,3,7
REMINDER_CRON=0 0 8 * * ?
```

## Setup Instructions by Service

### 1. Database Setup
```bash
# Install PostgreSQL
# Create database
createdb vaxsafe_db

# Set in .env
DB_URL=jdbc:postgresql://localhost:5432/vaxsafe_db
DB_USERNAME=postgres
DB_PASSWORD=your_secure_password
```

### 2. JWT Secret
```bash
# Generate a secure secret
openssl rand -base64 64

# Set in .env
JWT_SECRET=<generated_secret>
JWT_ACCESS_TOKEN_VALIDITY=86400000    # 1 day
JWT_REFRESH_TOKEN_VALIDITY=604800000  # 7 days
```

### 3. Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create project → Enable Google+ API
3. Create OAuth 2.0 credentials
4. Set authorized redirect URI: `http://localhost:8080/login/oauth2/code/google`
5. Copy Client ID and Secret to `.env`

### 4. Cloudinary (Image Storage)
1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Go to Dashboard
3. Copy Cloud Name, API Key, API Secret
4. Paste to `.env`

### 5. Email Service (Gmail)
1. Enable 2-Step Verification on your Gmail
2. Go to [App Passwords](https://myaccount.google.com/apppasswords)
3. Generate app password for "Mail"
4. Copy 16-character password to `.env`
   ```bash
   MAIL_PASSWORD=abcd efgh ijkl mnop  # Remove spaces
   ```

### 6. Payment Gateways

#### VNPay (Vietnam)
1. Register at [VNPay Sandbox](https://sandbox.vnpayment.vn/)
2. Get TMN Code and Hash Secret
3. Set in `.env`

#### PayPal
1. Create app at [PayPal Developer](https://developer.paypal.com/)
2. Get Client ID and Secret
3. Set mode to `sandbox` for testing, `live` for production

### 7. Blockchain Service
```bash
# If running blockchain microservice
BLOCKCHAIN_SERVICE_URL=http://localhost:4000

# If not available, service will log warnings but won't crash
```

## Environment-Specific Configurations

### Development
```bash
APP_BASE_URL=http://localhost:8080
CORS_ALLOWED_ORIGINS=http://localhost:5173
PAYPAL_MODE=sandbox
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
```

### Production
```bash
APP_BASE_URL=https://api.vaxsafe.com
CORS_ALLOWED_ORIGINS=https://vaxsafe.com
PAYPAL_MODE=live
VNPAY_URL=https://vnpayment.vn/paymentv2/vpcpay.html
```

## Verification

After setting up `.env`, verify:

```bash
# Check if file exists
ls -la .env

# Test database connection
./mvnw spring-boot:run

# Look for these in logs:
# ✅ "Started BackendApplication"
# ❌ Any "Error creating bean" messages
```

## Security Best Practices

- ❌ **Never commit** `.env` to git
- ❌ **Never share** `.env` file publicly
- ✅ **Use different credentials** for dev/staging/prod
- ✅ **Rotate secrets** regularly
- ✅ **Use App Passwords** for Gmail (not account password)
- ✅ **Store production secrets** in secure vault (AWS Secrets Manager, etc.)

## Troubleshooting

### Error: "Could not connect to database"
- Check PostgreSQL is running: `pg_isready`
- Verify DB credentials in `.env`
- Check database exists: `psql -l`

### Error: "UnsatisfiedDependencyException: RestTemplate"
- Ensure `RestTemplateConfig.java` exists
- Restart application

### Error: "Mail server connection failed"
- Use Gmail App Password, not account password
- Enable 2-Step Verification first
- Remove spaces from 16-character password

### Error: "Invalid OAuth credentials"
- Check Google Client ID and Secret
- Verify redirect URI matches exactly
- Enable Google+ API in console

## Files

- `.env.example` - Empty template (committed to git)
- `.env.template` - Template with examples (committed to git)
- `.env` - Your actual config (**NOT committed** to git)
- `ENV_SETUP.md` - This file (committed to git)

## Support

For production deployment help, see `PRODUCTION_FIX.md`
