# SmartOPD

**Smart queue and patient arrival management for government hospital OPDs.**

> Don't make patients wait for the hospital. Make the queue wait for the patient.

Built by **Code Ninjaas** for the Geeks2Code Hackathon.

**Live demo:** YOUR-VERCEL-LINK
The backend runs on Render's free tier, so the first request can take about 50 seconds to wake up.

## The problem
Elderly and rural patients travel for hours, then wait 4 to 6 hours without knowing when they are actually needed. A static token gives position. Patients need timing.

## Our solution
An SMS-first dynamic queue: register remotely, get a token, monitor the queue, and receive an arrival window telling you when to reach the hospital. The estimate recalculates automatically after every doctor delay or emergency.

## Queue engine
Estimated time = patients ahead x average consultation time + current delay + emergency adjustment

- Arrival window = estimated time minus 20 minutes, up to the estimated time
- Every staff action (call next, pause, doctor delay, emergency, requeue) recalculates all waiting tokens
- Each recalculation writes a patient notification to an SMS log

## Features
- Patient registration with phone verification (simulated OTP)
- Live token status with queue position and arrival window
- Staff desk: Call Next, Pause Queue, Doctor Delay, Emergency, Requeue
- Senior fast-track detection (age 60+)
- Simulated SMS notifications stored in an sms_log table
- Mobile-first responsive UI

## Tech stack
- **Backend:** Java 21, Spring Boot 3, Spring Data JPA, H2 (in-memory)
- **Frontend:** React, Vite, Tailwind CSS
- **Design:** Google Stitch (design system and screens)
- **Deployment:** Render (backend, Docker) and Vercel (frontend)

## Run locally
Backend: `cd backend`, then `./mvnw spring-boot:run` (Windows: `mvnw.cmd spring-boot:run`). It starts on port 8080.

Frontend: `cd frontend`, create a `.env` file containing `VITE_API_URL=http://localhost:8080`, then run `npm install` and `npm run dev`. It opens on port 5173.

## Roadmap
Real SMS gateway, IVR, regional languages, video consults, hospital kiosks, PostgreSQL, predictive queue times from historical data.

## Note
The demo uses an in-memory database with seeded sample data. It resets whenever the server restarts. SMS messages are simulated.
