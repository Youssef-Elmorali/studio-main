# Blood Donation System - Entity Relationship Diagram

```mermaid
erDiagram
    User {
        string id PK
        string name
        string email
        string phone
        string bloodType
        date lastDonation
        string location
        object locationCoords
        boolean isVerified
        timestamp createdAt
        timestamp updatedAt
    }

    BloodBank {
        string id PK
        string name
        string location
        object locationCoords
        string contactPhone
        string operatingHours
        string website
        object inventory
        timestamp lastInventoryUpdate
        array servicesOffered
        timestamp createdAt
        timestamp updatedAt
    }

    Donation {
        string id PK
        string userId FK
        string bloodBankId FK
        string bloodType
        float quantity
        string status
        timestamp donationDate
        string notes
        timestamp createdAt
        timestamp updatedAt
    }

    Emergency {
        string id PK
        string title
        string description
        string bloodType
        float quantity
        string location
        object locationCoords
        string status
        string contactPhone
        timestamp deadline
        timestamp createdAt
        timestamp updatedAt
    }

    User ||--o{ Donation : "makes"
    BloodBank ||--o{ Donation : "receives"
    User ||--o{ Emergency : "creates"
    BloodBank ||--o{ Emergency : "handles"

```

## Entity Descriptions

### User
- Represents blood donors and users of the system
- Stores personal information and donation history
- Tracks blood type and last donation date
- Includes location information for mapping

### BloodBank
- Represents blood donation centers and hospitals
- Stores location and contact information
- Maintains inventory of different blood types
- Tracks operating hours and services offered

### Donation
- Records individual blood donations
- Links users to blood banks
- Tracks donation status and quantity
- Includes timestamps for tracking

### Emergency
- Represents urgent blood requests
- Includes required blood type and quantity
- Tracks location and deadline
- Links to users and blood banks

## Relationships
- Users can make multiple donations
- Blood banks can receive multiple donations
- Users can create multiple emergency requests
- Blood banks can handle multiple emergency requests 