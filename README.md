# 🍽️ EatATL - Atlanta Restaurant Directory

A modern, interactive web application for discovering Atlanta's finest dining experiences. Browse through curated restaurants, filter by cuisine type, and get directions with a single click.

![EatATL](https://img.shields.io/badge/EatATL-Restaurant%20Directory-FF6B6B?style=for-the-badge)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

## ✨ Features

- **Modern UI Design**: Beautiful gradient backgrounds with glass-morphism effects
- **Interactive Filtering**: Filter restaurants by cuisine type with smooth animations
- **Responsive Layout**: Works seamlessly on desktop, tablet, and mobile devices
- **Direct Navigation**: Click any restaurant card to open Google Maps directions
- **Smooth Animations**: Elegant fade-in effects and hover interactions
- **Comprehensive Directory**: 79+ curated Atlanta restaurants across various cuisines

## 🚀 Getting Started

### Prerequisites

- **Static mode (no Google API)**: no dependencies required; open `index.html`.
- **Google ratings/photos (public website)**: deploy on Vercel (includes serverless endpoints that keep your Google API key secret).

### Installation

1. Clone or download this repository
2. Open `index.html` in your web browser
   - **Option 1**: Double-click the `index.html` file
   - **Option 2**: Right-click → "Open with" → Choose your browser
   - **Option 3**: Drag and drop the file into your browser window

### Using Live Server (Recommended for Development)

For the best development experience with live reload:

1. Install [Live Server extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

## ⭐ Google ratings + photos (Legacy Places API) on Vercel

This project includes Vercel serverless endpoints under `api/places/*` that proxy Google Places requests so your **API key is never exposed in the browser**.

### Step 1: Create a Google Maps Platform API key

1. Create a project in Google Cloud Console
2. Enable **Places API**
3. Attach **billing** (required for Places)
4. Create an **API key**
5. In API key settings:
   - **API restrictions**: restrict to **Places API**
   - **Application restrictions**: keep the key **server-side only** (do not put it in frontend code)

### Step 2: Add the key to Vercel

In your Vercel project:
- Go to **Project Settings → Environment Variables**
- Add:
  - **Name**: `GOOGLE_MAPS_API_KEY`
  - **Value**: your API key

You can use the included `env.example` as a reference.

### Step 3: Deploy to Vercel

1. Import this repo into Vercel
2. Deploy

### Local development (so `/api` works)

If you want to test Google integration locally, run a local Vercel dev server (instead of opening `index.html` via `file://`):

```bash
npm i -g vercel
vercel dev
```

Then open the local URL Vercel prints (usually `http://localhost:3000`).

### What happens in the UI

- Cards render immediately using a lightweight food-themed SVG placeholder.
- When a card scrolls into view, the frontend calls:
  - `GET /api/places/find` (to resolve `place_id`)
  - `GET /api/places/details` (to fetch rating + photo metadata)
  - `GET /api/places/photo` (streams the image bytes)
- The UI updates:
  - **rating** is replaced with Google’s rating
  - **photo** is replaced with a Google Place photo
  - **photo attribution** is shown on the image (required)
  - “Powered by Google” appears in the footer (required when showing Places content without a map)

### Notes (important)

- **Cost/quota**: Each visitor can trigger API calls as they scroll; the app limits concurrency and caches results in `localStorage` for 7 days.
- **Compliance**: Display the returned photo attributions (the app does). Review Google Maps Platform terms before changing caching behavior.

## 📖 Usage

### Browsing Restaurants

- View all restaurants in a responsive grid layout
- Each restaurant card displays:
  - Restaurant name
  - Cuisine type
  - Star rating (⭐)
  - Neighborhood location

### Filtering

- Click any cuisine filter button at the top to view restaurants of that type
- Click "All Restaurants" to view the complete directory
- Active filter is highlighted with a gradient background

### Getting Directions

- Click on any restaurant card to open Google Maps in a new tab
- Search results will show the restaurant location with directions

## 🏗️ Project Structure

```
EatATL project/
│
├── index.html          # Main application file (HTML, CSS, JavaScript)
├── api/places/         # Vercel serverless endpoints (Google Places proxy)
├── env.example         # Example env var names (do NOT commit real keys)
└── README.md           # Project documentation
```

## 🎨 Design Features

### Color Scheme
- Vibrant animated gradient background (coral, pink, purple tones)
- Modern glass-morphism effects on buttons and cards
- Smooth transitions and hover effects

### Typography
- **Headings**: Poppins (Google Fonts) - Bold, modern sans-serif
- **Body Text**: Inter (Google Fonts) - Clean, readable sans-serif

### Animations
- Gradient background animation (15s cycle)
- Staggered card entry animations
- Smooth filter transitions
- Hover effects with scale and shadow

## 📝 Adding Restaurants

To add new restaurants, edit the `restaurants` array in `index.html`:

```javascript
const restaurants = [
    { 
        name: "Restaurant Name", 
        cuisine: "Cuisine Type", 
        rating: 4.5, 
        location: "Neighborhood", 
        googleUrl: "https://www.google.com/maps/search/Restaurant+Name+Atlanta" 
    },
    // Add more restaurants here...
];
```

### Restaurant Object Properties

- **name** (string): Restaurant name
- **cuisine** (string): Type of cuisine (e.g., "Italian", "American", "Thai")
- **rating** (number): Star rating (1.0 - 5.0, one decimal place)
- **location** (string): Neighborhood or area in Atlanta
- **googleUrl** (string): Google Maps search URL (automatically generated)

### Tips

- New cuisine types will automatically appear in the filter buttons
- Ensure proper JSON syntax (commas, quotes)
- Ratings typically range from 4.0 to 5.0 for quality restaurants

## 🍜 Supported Cuisine Types

The directory includes restaurants across various cuisines:

- American
- Italian
- Thai
- Japanese
- Korean
- Mexican
- Indian
- Spanish
- Seafood
- Steakhouse
- Southern
- Fine Dining
- Mediterranean
- Turkish
- Persian
- Brazilian
- French
- Greek
- Ethiopian
- And more...

## 🌐 Browser Compatibility

- ✅ Chrome (Recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Opera

## 📱 Responsive Design

The application is fully responsive with breakpoints optimized for:
- **Desktop**: Multi-column grid layout
- **Tablet**: Adaptive grid columns
- **Mobile**: Single column layout with optimized spacing

## 🔧 Customization

### Changing Colors

Edit the CSS variables in the `<style>` section of `index.html`:

- Background gradient: Modify `background` property in `body` selector
- Button colors: Edit `.filter-btn.active` background gradient
- Card colors: Modify `.restaurant-card` background

### Modifying Animations

- Animation duration: Adjust `animation` properties
- Transition speed: Modify `transition` properties
- Stagger delay: Change `animation-delay` in JavaScript

### Fonts

Replace Google Fonts by modifying the `<link>` tags in the `<head>` section.

## 🚧 Future Enhancements

Potential features for future development:

- [ ] Search functionality
- [ ] Sort by rating or name
- [ ] Restaurant details modal
- [ ] Favorites/bookmarking
- [ ] Price range indicators
- [ ] Reservation links
- [ ] User reviews integration
- [ ] Map view integration
- [ ] Export to PDF
- [ ] Dark mode toggle

## 📄 License

This project is open source and available for personal and educational use.

## 👤 Author

Created with ❤️ for Atlanta food enthusiasts

## 🙏 Acknowledgments

- Google Fonts for typography (Poppins, Inter)
- All the amazing restaurants in Atlanta
- The Atlanta food community

---

**Enjoy discovering Atlanta's culinary scene! 🍴**
