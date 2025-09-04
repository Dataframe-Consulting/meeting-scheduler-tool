# 🚂 Deploying to Railway

This guide will help you deploy the Microsoft Teams Meeting Scheduler tool to Railway.

## Prerequisites

- Railway account ([railway.app](https://railway.app))
- GitHub account (for automatic deployments)
- Microsoft Azure app registration with Graph API credentials

## Deployment Steps

### 1. Prepare Your Repository

Push your code to GitHub:
```bash
git init
git add .
git commit -m "Initial commit for Railway deployment"
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 2. Create New Railway Project

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Connect your GitHub account if not already connected
5. Select your `tool-meeting-scheduler` repository

### 3. Configure Environment Variables

In Railway dashboard, go to your project and add these environment variables:

#### Required Microsoft Graph API Credentials:
- `CLIENT_ID` - Your Azure app client ID
- `CLIENT_SECRET` - Your Azure app client secret
- `TENANT_ID` - Your Azure tenant ID
- `USER_ID` - Default organizer email (optional)

#### Optional Configuration:
- `PORT` - Railway will auto-assign this (don't set manually)
- `NODE_ENV` - Set to `production`
- `LOG_LEVEL` - Set to `info` or `debug`
- `API_KEY_AUTH` - Set to `true` for production
- `VALID_API_KEYS` - Comma-separated list of API keys

### 4. Deploy

Railway will automatically:
1. Detect the Dockerfile
2. Build the Docker image
3. Deploy the container
4. Assign a public URL

### 5. Verify Deployment

Once deployed, Railway will provide a URL like:
```
https://meeting-scheduler-production.up.railway.app
```

Test the health endpoint:
```bash
curl https://your-app.up.railway.app/health
```

## Environment Variable Setup in Railway

1. Click on your service in Railway dashboard
2. Go to **"Variables"** tab
3. Add variables using **"RAW Editor"** or one by one:

```env
CLIENT_ID=your-azure-app-client-id
CLIENT_SECRET=your-azure-app-client-secret
TENANT_ID=your-azure-tenant-id
USER_ID=organizer@yourdomain.com
NODE_ENV=production
LOG_LEVEL=info
```

## Using the Deployed Tool

### Health Check
```bash
curl https://your-app.up.railway.app/health
```

### Create Meeting
```bash
curl -X POST https://your-app.up.railway.app/api/execute \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-api-key" \
  -d '{
    "input_data": {
      "subject": "Team Meeting",
      "startDateTime": "2025-12-15T14:30:00Z",
      "endDateTime": "2025-12-15T15:30:00Z",
      "attendees": ["user@example.com"]
    }
  }'
```

## Automatic Deployments

Railway automatically deploys when you push to your main branch:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

## Monitoring

### View Logs
In Railway dashboard:
1. Click on your service
2. Go to **"Deployments"** tab
3. Click on any deployment to view logs

### Metrics
Railway provides:
- CPU usage
- Memory usage
- Network I/O
- Response times

## Custom Domain (Optional)

1. Go to **"Settings"** in your Railway service
2. Under **"Domains"**, click **"Generate Domain"** for a railway.app subdomain
3. Or click **"Add Custom Domain"** to use your own domain
4. Update your DNS records as instructed

## Troubleshooting

### Common Issues

**Port Configuration**
- Don't set PORT manually - Railway assigns it automatically
- The tool reads from `process.env.PORT` automatically

**Build Failures**
- Check build logs in Railway dashboard
- Ensure all dependencies are in package.json
- Verify TypeScript compilation succeeds locally

**Runtime Errors**
- Check environment variables are set correctly
- Verify Microsoft Graph API credentials
- Check application logs in Railway dashboard

**Health Check Failures**
- Ensure `/health` endpoint returns 200 status
- Check if application started successfully
- Verify PORT environment variable is being read

### Debug Commands

View recent logs:
```bash
railway logs
```

Run locally with Railway environment:
```bash
railway run npm start
```

## Cost Considerations

Railway offers:
- **$5 free credits** per month
- **500 hours** of usage included
- Automatic sleep after inactivity

For production use, consider:
- Upgrading to Team plan for more resources
- Setting up auto-sleep to save credits
- Monitoring usage in Railway dashboard

## Security Best Practices

1. **Never commit secrets** - Use Railway environment variables
2. **Enable API authentication** in production
3. **Use custom domain** with HTTPS (automatic)
4. **Rotate secrets** regularly
5. **Monitor access logs** for suspicious activity

## Support

- [Railway Documentation](https://docs.railway.app)
- [Railway Discord](https://discord.gg/railway)
- [Tool Issues](https://github.com/your-repo/issues)

---

**Deployment Checklist:**
- [ ] Code pushed to GitHub
- [ ] Railway project created
- [ ] Environment variables configured
- [ ] Deployment successful
- [ ] Health endpoint tested
- [ ] Custom domain configured (optional)
- [ ] Monitoring set up