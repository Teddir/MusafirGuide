# MusafirGuide 🌍✈️

**MusafirGuide** is a modern, privacy-first web application designed to help Muslim travelers determine their prayer status (Jamak and Qasar) with ease.

By inputting an origin and destination, the app calculates the travel distance and checks against the rulings of the four major Mazhabs (Shafi'i, Hanafi, Maliki, Hambali), providing an instant recommendation on whether you can shorten (Qasar) or combine (Jamak) your prayers.

## 🚀 About The Project

Traversing the world should not mean compromising on your religious obligations. **MusafirGuide** simplifies the complex jurisprudence of travel (Click to Pray) by combining modern mapping technology with reliable Islamic scholarship rulings.

### Key Features
- **Smart Distance Calculation**: Uses road distance (not just straight line) to determine travel status.
- **Multi-Mazhab Support**: switchable logic for Shafi'i, Hanafi, Maliki, and Hambali schools.
- **Mosque Finder**: Automatically locates mosques near your destination.
- **Interactive Guide**: Step-by-step intention (Niat) guides for Jamak and Qasar.
- **Privacy First**: No backend, no tracking. All calculations happen in your browser.

## 🛠️ Technology Stack

This project is built with a modern, performant frontend stack:

- **Framework**: [Angular 19](https://angular.dev) (Signals, Standalone Components, SSR/Prerendering)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com) (Utility-first styling)
- **Maps**: [Leaflet](https://leafletjs.com) & [Leaflet Routing Machine](https://www.liedman.net/leaflet-routing-machine/)
- **Data**: 
  - Geocoding: [Nominatim (OSM)](https://nominatim.org)
  - Mosques: [Overpass API](https://overpass-api.de)
- **Icons**: [Ng-Icons](https://ng-icons.github.io/ng-icons/) (Heroicons)

## 🤝 How to Contribute

We welcome contributions from the community to make this tool more accurate and useful for the Ummah!

1.  **Fork the Repository**
2.  **Create a Branch**: `git checkout -b feature/AmazingFeature`
3.  **Commit Changes**: `git commit -m 'Add some AmazingFeature'`
4.  **Push to Branch**: `git push origin feature/AmazingFeature`
5.  **Open a Pull Request**

### Development Setup
```bash
# Install dependencies
npm install

# Run development server
npm start
```

## 🔮 Roadmap / Contribution Ideas

Here is a list of features we need help with to make MusafirGuide truly powerful:

- [ ] **Prayer Times Integration**: Show prayer times for the destination city.
- [ ] **Qibla Finder**: Add a compass feature on the map.
- [ ] **Offline Mode (Robust PWA)**: Improve caching strategies for map tiles so it works completely offline.
- [ ] **More Detailed Rulings**: Add edge cases (e.g., stopovers, intention to stay < 4 days vs > 4 days).
- [ ] **Internationalization (i18n)**: Translate the UI into English, Arabic, and other languages.
- [ ] **Unit & E2E Tests**: Increase test coverage to ensure reliability.
- [ ] **Dark Mode Polish**: Refine custom map tiles and UI contrast for dark mode.

## ⚠️ Disclaimer

**MusafirGuide is a tool, not a Mufti.** 

- The calculations are based on standard distances and general rulings.
- Individual circumstances (niat, duration of stay, purpose of travel) affect the validity of Jamak/Qasar.
- We **strongly recommend** consulting with a qualified religious scholar for specific personal rulings.
- The developers are not liable for any errors in worship resulting from the use of this app. Use it as a reference aid only.
