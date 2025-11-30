# UI Update - Login & Register Pages

## Changes Made

The login and register pages have been updated with a new split-screen design from safevax-repo:

### New Features:
- **Split-screen layout**: Form on the left, background image on the right
- **Responsive design**: Mobile-friendly with collapsible right panel on small screens
- **Modern UI**: Clean, professional design with better spacing and typography
- **Back to Home button**: Easy navigation back to the homepage
- **Improved visual hierarchy**: Better organized form elements

### Required Setup:

**Add Background Image:**
You need to add a background image for the login/register pages:
1. Place an image named `login-bg.jpg` in the `/frontend/public/` folder
2. Recommended image specs:
   - Resolution: 1920x1080 or higher
   - Format: JPG or PNG
   - Theme: Healthcare, vaccination, or medical related
   - Example sources:
     - Unsplash (https://unsplash.com/s/photos/healthcare)
     - Pexels (https://www.pexels.com/search/medical/)

Alternatively, you can use a placeholder image from the internet temporarily:
- https://images.unsplash.com/photo-1576091160399-112ba8d25d1d (Medical team)
- https://images.unsplash.com/photo-1631815589968-fdb09a223b1e (Healthcare)

### Preserved Functionality:
- ✅ Google OAuth login (with id_token validation)
- ✅ Profile completion flow for new Google users
- ✅ Email/password login
- ✅ Role-based navigation (Admin, Doctor, Cashier, Patient)
- ✅ Form validation
- ✅ Error handling

### Design Inspiration:
The new UI is based on the safevax-repo design pattern which features:
- Clean, minimal interface
- Professional color scheme (Blue/Gray)
- Clear call-to-action buttons
- Improved user experience flow
