# Production Deployment Fix

## Error Fixed
```
UnsatisfiedDependencyException: Error creating bean with name 'blockchainService': 
Injection of autowired dependencies failed
```

## Root Cause
`BlockchainService` requires `RestTemplate` bean which was not configured.

## Solution Applied

### 1. Created RestTemplate Configuration
**File:** `backend/src/main/java/com/dapp/backend/config/RestTemplateConfig.java`

```java
@Configuration
public class RestTemplateConfig {
    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        return builder
                .setConnectTimeout(Duration.ofSeconds(10))
                .setReadTimeout(Duration.ofSeconds(30))
                .build();
    }
}
```

### 2. Environment Variables Required

Add this to your production environment:

```bash
# Required - Blockchain service URL
BLOCKCHAIN_SERVICE_URL=http://your-blockchain-service:4000

# Optional - Email configuration (for reminders)
MAIL_PASSWORD=your_gmail_app_password_here
```

### 3. If Blockchain Service is NOT Available

If you don't have the blockchain microservice running in production, you have two options:

#### Option A: Disable Blockchain Features (Quick Fix)
Make `BlockchainService` methods return gracefully:

Add to `application.properties`:
```properties
blockchain.service.enabled=${BLOCKCHAIN_ENABLED:false}
```

#### Option B: Use Mock/Stub Service
Point to a mock endpoint that returns success responses.

## Deployment Steps

### Step 1: Rebuild Application
```bash
cd backend
./mvnw clean package -DskipTests
```

### Step 2: Set Environment Variables
```bash
export BLOCKCHAIN_SERVICE_URL=http://localhost:4000
# or set in your deployment platform (Docker, K8s, etc.)
```

### Step 3: Deploy
```bash
docker build -t vaxsafe-backend:latest .
docker run -e BLOCKCHAIN_SERVICE_URL=http://blockchain:4000 vaxsafe-backend:latest
```

## Verification

After deployment, check logs:
```bash
# Should see successful bean creation
grep "RestTemplate" logs/application.log

# Should NOT see UnsatisfiedDependencyException
grep "UnsatisfiedDependencyException" logs/application.log
```

Test the health endpoint:
```bash
curl http://your-production-url:8080/actuator/health
```

## Emergency Rollback

If issues persist, temporarily disable blockchain features:

1. Comment out `BlockchainService` injection in:
   - `IdentityService`
   - `VaccineRecordService`
   
2. Or add conditional `@ConditionalOnProperty` to `BlockchainService`:
```java
@Service
@ConditionalOnProperty(name = "blockchain.service.enabled", havingValue = "true")
public class BlockchainService { ... }
```

## Files Changed
- ✅ `backend/src/main/java/com/dapp/backend/config/RestTemplateConfig.java` (NEW)
- ✅ `backend/.env.example` (UPDATED - added BLOCKCHAIN_SERVICE_URL)

## Next Steps After Fix
1. Commit this configuration
2. Redeploy to production
3. Monitor logs for 10 minutes
4. Test user registration flow
5. Verify no dependency errors
