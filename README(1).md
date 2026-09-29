# AirPulse – AI-Powered Urban Air Quality & Pollution Analytics

## 📌 Project Overview

AirPulse is a smart urban air-quality monitoring and pollution analytics system designed to analyze air-quality and weather data across different locations.

The system uses parameters such as **PM2.5, PM10, CO, NO₂, temperature, humidity, and wind conditions** to understand pollution levels, identify changing pollution trends, detect potential hotspots, and provide location-based alerts and recommendations.

An interactive **Tamil Nadu pollution map** helps users visualize pollution conditions across major locations.

---

## 🎯 Problem Statement

Urban air pollution changes depending on location, traffic, industrial activity, weather, and wind conditions. Raw environmental data can be difficult for ordinary users to understand.

AirPulse aims to convert air-quality and weather data into simple and useful information by:

- Monitoring important air-quality parameters
- Analyzing pollution levels and trends
- Identifying potential pollution hotspots
- Displaying pollution conditions on an interactive map
- Providing location-based alerts
- Generating understandable recommendations

---

## 💡 Proposed Solution

AirPulse combines data collection, backend processing, analytics, and visualization in a single dashboard.

### System Flow

**Air Quality & Weather Data → Data Processing → Analytics → Hotspot Detection → Alerts & Recommendations → Interactive Dashboard**

The current prototype can obtain environmental data through APIs. The architecture can also be extended to receive data from ESP32-based physical sensor nodes.

---

## ✨ Key Features

- 🌫️ PM2.5 and PM10 monitoring
- 🏭 CO and NO₂ monitoring
- 🌡️ Temperature and humidity monitoring
- 💨 Wind-condition analysis
- 📊 Pollution-level classification
- 📈 Pollution trend analysis
- 📍 Location-based monitoring
- 🔥 Potential hotspot identification
- 🗺️ Interactive Tamil Nadu pollution map
- 🚨 Pollution alerts
- 💡 Location-based recommendations
- 📱 Responsive web dashboard
- 🔌 Extendable to ESP32-based sensor hardware

---

## 🧪 Parameters Monitored

| Parameter | Purpose |
|---|---|
| PM2.5 | Fine particulate matter monitoring |
| PM10 | Coarse particulate matter monitoring |
| CO | Carbon monoxide monitoring |
| NO₂ | Nitrogen dioxide monitoring |
| Temperature | Weather condition |
| Humidity | Atmospheric condition |
| Wind Speed | Helps understand pollutant movement |
| Wind Direction | Helps analyze pollution dispersion |
| Location | Geographic pollution analysis |

---

## 🏗️ System Architecture

```text
              DATA SOURCES
                   │
        ┌──────────┴──────────┐
        │                     │
 Air Quality APIs       Weather APIs
        │                     │
        └──────────┬──────────┘
                   │
                   ▼
             FLASK BACKEND
                   │
             Data Processing
                   │
                   ▼
          AI / DATA ANALYTICS
          ┌────────┼────────┐
          │        │        │
        Trend   Hotspot   Pollution
       Analysis Detection Classification
          │        │        │
          └────────┼────────┘
                   │
                   ▼
             WEB DASHBOARD
          ┌────────┼────────┐
          │        │        │
        Charts    Map     Alerts
                   │
                   ▼
              END USERS
```

---

## 🛠️ Technology Stack

### Frontend
- HTML5
- CSS3
- JavaScript
- Leaflet.js
- OpenStreetMap

### Backend
- Python
- Flask
- Flask-CORS
- Requests

### Data & Analytics
- Air-quality API
- Weather API
- Python-based data processing
- Pollution classification
- Trend and hotspot analysis

### Future Hardware
- ESP32
- PMS5003/PMS7003 particulate matter sensor
- BME280/DHT22
- CO sensor
- NO₂ sensor
- GPS module
- Anemometer and wind vane

---

## 📁 Project Structure

```text
AirPulse/
│
├── ai/
│
├── backend/
│   └── app.py
│
├── data/
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   └── maps/
│       └── TamilNadu.geojson
│
└── README.md
```

---

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd AirPulse
```

### 2. Install Python dependencies

```bash
pip install flask flask-cors requests
```

### 3. Start the backend

```bash
cd backend
python app.py
```

The Flask backend runs on:

```text
http://127.0.0.1:5000
```

### 4. Start the frontend

Open another terminal:

```bash
cd frontend
python -m http.server 5500
```

Open the dashboard in your browser:

```text
http://127.0.0.1:5500
```

---

## 🔗 API Endpoint

The backend provides air-quality information through:

```text
GET /api/air-quality
```

Example:

```text
http://127.0.0.1:5000/api/air-quality
```

The response contains parameters such as:

```json
{
  "location": "Karur",
  "pm25": 45,
  "pm10": 72,
  "co": 1.2,
  "no2": 28,
  "temperature": 31,
  "humidity": 68,
  "wind_speed": 8
}
```

*The exact values depend on the current data source and location.*

---

## 🗺️ Tamil Nadu Pollution Map

The dashboard uses **Leaflet.js** and **OpenStreetMap** to display an interactive map.

The Tamil Nadu GeoJSON boundary is used to show the state boundary, while pollution monitoring locations can be displayed using color-coded markers.

Example classification:

- 🟢 Good
- 🟡 Moderate
- 🟠 Poor
- 🔴 Very Poor

The map can be extended with additional cities, live data, and sensor locations.

---

## 🤖 Analytics

AirPulse can analyze pollution data to provide:

### Pollution Classification
Classifies the observed pollution condition based on pollutant levels.

### Trend Analysis
Compares current and previous observations to identify increasing, decreasing, or stable pollution conditions.

### Hotspot Detection
Uses location-based pollution information to identify areas showing comparatively higher pollution.

### Alert Generation
Generates alerts when pollution conditions cross configured thresholds.

### Recommendations
Converts analytical results into simple location-specific recommendations.

---

## 🔌 Future Hardware Integration

The software architecture can be connected to an ESP32-based environmental monitoring node.

```text
Sensors
   ↓
ESP32
   ↓
Wi-Fi
   ↓
Backend/API
   ↓
Analytics
   ↓
Dashboard
```

A physical deployment can use particulate-matter, temperature/humidity, gas, GPS, and wind sensors.

The current hackathon prototype primarily demonstrates the software and data-analytics workflow.

---

## 🌍 Applications

- Smart-city environmental monitoring
- Pollution hotspot analysis
- Public awareness
- Environmental dashboards
- City-level pollution analytics
- Location-based pollution alerts
- Future IoT-based air-quality monitoring

---

## 🚀 Future Enhancements

- Real-time ESP32 sensor integration
- More monitoring locations
- Historical pollution database
- Machine-learning-based pollution forecasting
- Improved anomaly detection
- Automated notification system
- Mobile application
- City and district-level analytics
- Advanced wind-based pollution dispersion analysis

---

## 👥 Team Contribution

The project can be divided into four major areas:

1. **Data/API Integration** – Collecting air-quality and weather data.
2. **AI & Analytics** – Pollution classification, trend analysis, and hotspot detection.
3. **Backend & Hardware Integration** – Flask backend, APIs, and future ESP32 sensor integration.
4. **Frontend & Visualization** – Dashboard, charts, map, alerts, and recommendations.

---

## 📜 Project Status

**Hackathon Prototype – AirPulse**

The current prototype demonstrates:

- Air-quality data retrieval
- Weather data retrieval
- Flask backend
- Web dashboard
- Pollution analytics
- Interactive Tamil Nadu map
- Potential hotspot visualization
- Alert and recommendation concepts

---

## 📄 License

This project is developed as an educational and hackathon prototype.

---

## 🙏 Acknowledgements

- Open-Meteo for environmental and weather data APIs
- OpenStreetMap for map data
- Leaflet.js for interactive mapping
- Python and Flask for backend development
