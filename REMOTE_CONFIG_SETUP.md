# Firebase Remote Config Setup

## Important: Remote Config Does NOT Have an Emulator

Unlike Firestore, Auth, and Functions, Firebase Remote Config does not have a local emulator. This means:

- Remote Config always connects to your **real Firebase project**
- You must deploy the config template to Firebase
- Changes require redeployment to take effect

## Setup Steps

### 1. Deploy Remote Config Template

Deploy the current template to Firebase:

```bash
firebase deploy --only remoteconfig
```

This will upload the configuration from `remoteconfig.template.json` to your Firebase project.

### 2. Verify Deployment

After deployment, you can verify in Firebase Console:
- Go to https://console.firebase.google.com
- Select your project: `dev-ecom-test-010126`
- Navigate to: Remote Config section
- You should see the `enable_category_filter` parameter

### 3. Test the Banner

The banner on the products page (`/products`) is controlled by the `enable_category_filter` parameter.

**To show the banner:**
1. Set `enable_category_filter` to `"true"` in `remoteconfig.template.json`
2. Run: `firebase deploy --only remoteconfig`
3. Refresh the products page

**To hide the banner:**
1. Set `enable_category_filter` to `"false"` in `remoteconfig.template.json`
2. Run: `firebase deploy --only remoteconfig`
3. Refresh the products page (may need to clear cache)

## Current Configuration

The banner checks the `enable_category_filter` parameter:
- **true** → Shows "🔥 30% OFF SALE! 🔥" banner
- **false** → No banner shown

## Troubleshooting

### Banner Not Updating?

1. **Clear browser cache**: Remote Config is cached client-side
2. **Check console logs**: Look for Remote Config logs in browser DevTools
3. **Verify deployment**: 
   ```bash
   firebase remoteconfig:get
   ```
4. **Force refresh**: Use `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)

### Cannot Deploy?

Make sure you're logged in:
```bash
firebase login
firebase use dev-ecom-test-010126
```

## Testing Different Values

Edit `remoteconfig.template.json` and change the value:

```json
{
  "parameters": {
    "enable_category_filter": {
      "defaultValue": {
        "value": "false"  ← Change this to "true" or "false"
      },
      ...
    }
  }
}
```

Then deploy:
```bash
firebase deploy --only remoteconfig
```

## Quick Toggle Script

You can create a script to quickly toggle the banner:

```bash
# To enable banner
sed -i 's/"value": "false"/"value": "true"/' remoteconfig.template.json
firebase deploy --only remoteconfig

# To disable banner
sed -i 's/"value": "true"/"value": "false"/' remoteconfig.template.json
firebase deploy --only remoteconfig
```
