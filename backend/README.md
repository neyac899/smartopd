# SmartOPD Queue Management Backend

Spring Boot 3 + Java 21 backend service for the SmartOPD smart outpatient department queue management system.

## Tech Stack
- **Framework**: Spring Boot 3.3.5
- **Java**: Java 21 (LTS)
- **Database**: H2 In-Memory Database (`jdbc:h2:mem:smartopd`)
- **Build Tool**: Maven (`mvn` / `mvnw.cmd`)
- **Persistence**: Spring Data JPA / Hibernate

---

## Domain Model & Entities

1. **Doctor**: Represents a medical practitioner (`id`, `name`, `department`, `roomNumber`, `avgConsultMinutes`, `active`).
2. **OpdSession**: Represents an active OPD session for a doctor (`id`, `doctor`, `sessionDate`, `isPaused`, `currentDelayMinutes`, `emergencyAdjustmentMinutes`, `sessionStatus`).
3. **Token**: Queue entry for a patient (`id`, `tokenNumber`, `phone`, `department`, `doctor`, `session`, `status`, `queuePosition`, `patientsAhead`, `estimatedWaitMinutes`, `estimatedConsultationTime`, `arrivalWindowStart`, `arrivalWindowEnd`, `arrivalWindowFormatted`).
4. **SmsLog**: Historical log representing the `sms_log` table (`id`, `phone`, `tokenNumber`, `message`, `eventType`, `sentAt`, `status`).

---

## QueueEngine Logic

The queue engine uses deterministic calculations:

$$\text{estimatedWaitMinutes} = (\text{patientsAhead} \times \text{avgConsultMinutes}) + \text{currentDelay} + \text{emergencyAdjustment}$$

- **Arrival Window**:
  $$\text{Arrival Window} = [\text{estimatedTime} - 20\text{ min},\; \text{estimatedTime}]$$
- **Automatic Recalculation**:
  Every staff action (`call-next`, `pause`, `doctor-delay`, `emergency`, `requeue`) recalculates all waiting tokens in the session and logs notification SMS entries to `sms_log`.

---

## REST Endpoints

### Patient Endpoints
- `POST /tokens`: Issues a new token. Body: `{"phone": "9999988888", "department": "Cardiology"}`
- `GET /tokens/{id}`: Returns token wait times, queue position, and arrival window.
- `GET /tokens`: Returns all tokens (optional query param: `?department=Cardiology`).

### Staff Endpoints
- `POST /staff/call-next`: Completes current consultation, calls next waiting patient, recalculates queue.
- `POST /staff/pause`: Toggles pause status for doctor's OPD session.
- `POST /staff/doctor-delay?minutes=15`: Adds doctor delay and recalculates waiting tokens.
- `POST /staff/emergency?minutes=20`: Adds emergency adjustment and recalculates waiting tokens.
- `POST /staff/requeue/{id}`: Moves token back to waiting queue and recalculates.
- `GET /staff/queue`: Current queue overview.
- `GET /sms-logs`: View all SMS logs from `sms_log` table.
- `GET /doctors`: View all registered doctors.

### H2 Database Console
- URL: `http://localhost:8080/h2-console`
- JDBC URL: `jdbc:h2:mem:smartopd`
- Username: `sa`
- Password: *(empty)*

---

## Running Locally

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

### Running Tests

```powershell
cd backend
.\mvnw.cmd test
```
