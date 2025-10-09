# 🎮 PnutGo System Architecture Diagram

This document contains comprehensive system diagrams for the PnutGo AR location-based companion collection game.

## 🏗️ System Architecture Overview

```mermaid
graph TB
    subgraph "Mobile Client"
        MA[Mobile App<br/>AR Interface]
        ML[Location Services]
        MC[Camera/AR View]
        MN[Push Notifications]
    end

    subgraph "API Gateway"
        AG[Laravel API<br/>Sanctum Auth]
    end

    subgraph "Core Services"
        subgraph "Game Logic"
            GL1[Spawn Generation<br/>GenerateSpawnsAction]
            GL2[Capture Processing<br/>CaptureCompanionAction]
            GL3[Quest Management<br/>UpdateQuestProgressAction]
            GL4[Badge System<br/>CheckBadgeProgressionAction]
        end
        
        subgraph "Controllers"
            MC1[MapController<br/>Location & Spawns]
            MC2[QuestController<br/>Quest Management]
            MC3[UserController<br/>Profile & Stats]
            MC4[CompanionController<br/>Public Data]
        end
    end

    subgraph "Authorization"
        PA[Policy System]
        SP[SpawnPolicy]
        QP[QuestPolicy]
        CP[CompanionPolicy]
    end

    subgraph "Database Layer"
        DB[(MySQL Database)]
        subgraph "Core Tables"
            T1[users]
            T2[companions]
            T3[spawns]
            T4[quests]
            T5[badges]
            T6[spawn_rules]
        end
        
        subgraph "Junction Tables"
            J1[user_companions]
            J2[users_quests]
            J3[users_badges]
            J4[spawn_companions]
        end
    end

    subgraph "External Services"
        GEO[Geolocation APIs]
        PUSH[Push Notification Service]
        CACHE[Redis Cache]
    end

    MA --> AG
    ML --> AG
    AG --> MC1
    AG --> MC2
    AG --> MC3
    AG --> MC4
    
    MC1 --> GL1
    MC1 --> GL2
    MC2 --> GL3
    MC1 --> GL4
    
    MC1 --> SP
    MC2 --> QP
    MC3 --> CP
    
    GL1 --> DB
    GL2 --> DB
    GL3 --> DB
    GL4 --> DB
    
    DB --> T1
    DB --> T2
    DB --> T3
    DB --> T4
    DB --> T5
    DB --> T6
    DB --> J1
    DB --> J2
    DB --> J3
    DB --> J4
    
    GL1 --> GEO
    GL4 --> PUSH
    AG --> CACHE
```

## 🗄️ Database Entity Relationship Diagram

```mermaid
erDiagram
    USERS {
        bigint id PK
        string firstname
        string lastname
        date dob
        string email
        timestamp email_verified_at
        string password
        string remember_token
        timestamps created_at_updated_at
    }

    COMPANIONS {
        bigint id PK
        string name
        text description
        string type
        enum rarity
        timestamps created_at_updated_at
    }

    SPAWNS {
        bigint id PK
        bigint companion_id FK "nullable for multi-companion spawns"
        decimal lat
        decimal lng
        timestamp spawned_at
        timestamp expires_at
        bigint captured_by FK
        timestamp captured_at
        timestamps created_at_updated_at
    }

    SPAWN_COMPANIONS {
        bigint id PK
        bigint spawn_id FK
        bigint companion_id FK
        timestamps created_at_updated_at
    }

    SPAWN_RULES {
        bigint id PK
        bigint companion_id FK
        decimal spawn_rate
        decimal lat_min
        decimal lat_max
        decimal lng_min
        decimal lng_max
        time time_window_start
        time time_window_end
        int max_per_day
        timestamps created_at_updated_at
    }

    QUESTS {
        bigint id PK
        string title
        text description
        enum quest_type
        json requirement
        json reward
        date available_from
        date available_to
        timestamps created_at_updated_at
    }

    BADGES {
        bigint id PK
        bigint companion_id FK
        string name
        text description
        int level
        json requirement
        timestamps created_at_updated_at
    }

    USER_COMPANIONS {
        bigint id PK
        bigint user_id FK
        bigint companion_id FK
        bigint spawn_id FK
        timestamp captured_at
        timestamps created_at_updated_at
    }

    USERS_QUESTS {
        bigint id PK
        bigint user_id FK
        bigint quest_id FK
        int progress
        boolean completed
        timestamp completed_at
        timestamps created_at_updated_at
    }

    USERS_BADGES {
        bigint id PK
        bigint user_id FK
        bigint badge_id FK
        timestamp earned_at
        timestamps created_at_updated_at
    }

    %% Relationships
    USERS ||--o{ USER_COMPANIONS : captures
    USERS ||--o{ USERS_QUESTS : participates
    USERS ||--o{ USERS_BADGES : earns
    USERS ||--o{ SPAWNS : captures

    COMPANIONS ||--o{ SPAWNS : generates
    COMPANIONS ||--o{ SPAWN_RULES : has
    COMPANIONS ||--o{ BADGES : has
    COMPANIONS ||--o{ USER_COMPANIONS : captured_as

    SPAWNS ||--o{ USER_COMPANIONS : source
    SPAWNS }o--|| COMPANIONS : is_type_of

    QUESTS ||--o{ USERS_QUESTS : assigned_to
    BADGES ||--o{ USERS_BADGES : awarded_to
    BADGES }o--|| COMPANIONS : specific_to

    SPAWN_RULES }o--|| COMPANIONS : configures
    
    SPAWNS ||--o{ SPAWN_COMPANIONS : contains
    COMPANIONS ||--o{ SPAWN_COMPANIONS : available_in
    SPAWN_COMPANIONS }o--|| SPAWNS : belongs_to
    SPAWN_COMPANIONS }o--|| COMPANIONS : links_to
```

## 🎮 Game Flow Diagram

### Modified

```mermaid
sequenceDiagram
    participant U as User/Mobile App
    participant API as Laravel API
    participant DB as Database
    participant SA as Spawn Algorithm
    participant BA as Badge System
    participant QA as Quest System

    Note over U,QA: 1. Map Discovery Flow
    U->>API: User moves -> GET /api/map/companions?lat=X&lng=Y
    API->>DB: Query existing spawns <br /> (discoverable: locked, shown, capturable) in area
    API->>U: Return spawns with visibility states

    Note over U,QA: 2. Companion Capture Flow
    U->>API: POST /api/map/spawns/{id}/capture <br/> (optionally with companion_id for multi-companion spawns)
    API->>DB: Validate spawn is active <br/> Check if specific companion available in spawn
    API->>DB: Create user_companions record for captured companion
    API->>DB: Update spawn capture status <br/> (mark as captured when all companions taken)
    API->>BA: Check badge progression for captured companion
    BA->>DB: Award new badges if eligible
    API->>QA: Update quest progress
    QA->>DB: Update quest completion
    API->>U: Return capture success + rewards

    Note over U,QA: 3. Quest Management Flow
    U->>API: GET /api/quests
    API->>DB: Get available quests
    API->>DB: Auto-assign daily quests
    API->>U: Return quests with progress

    U->>API: POST /api/quests/{id}/complete
    API->>DB: Validate completion requirements
    API->>DB: Process quest rewards
    API->>U: Return completion confirmation

    Note over U,QA: 4. Profile & Statistics Flow
    U->>API: GET /api/me/companions
    API->>DB: Aggregate capture statistics
    API->>U: Return captured/missing collection with counts (only captured)

    U->>API: GET /api/me/badges
    API->>DB: Get earned badges with metadata
    API->>U: Return badge achievement history
```

```mermaid
sequenceDiagram
    participant U as User/Mobile App
    participant API as Laravel API
    participant DB as Database
    participant SA as Spawn Algorithm
    participant BA as Badge System
    participant QA as Quest System

    Note over U,QA: 1. Map Discovery Flow
    U->>API: GET /api/map/companions?lat=X&lng=Y&radius=Z
    API->>DB: Query existing spawns in area (both single & multi-companion)
    API->>SA: Generate new spawns if needed
    SA->>DB: Create spawn records <br/> (single companion or multi-companion via pivot table)
    API->>U: Return spawns with companion data <br/> (showing all available companions per spawn)

    Note over U,QA: 2. Companion Capture Flow
    U->>API: POST /api/map/spawns/{id}/capture
    API->>DB: Validate spawn is active
    API->>DB: Create user_companions record
    API->>BA: Check badge progression
    BA->>DB: Award new badges if eligible
    API->>QA: Update quest progress
    QA->>DB: Update quest completion
    API->>U: Return capture success + rewards

    Note over U,QA: 3. Quest Management Flow
    U->>API: GET /api/quests
    API->>DB: Get available quests
    API->>DB: Auto-assign daily quests
    API->>U: Return quests with progress

    U->>API: POST /api/quests/{id}/complete
    API->>DB: Validate completion requirements
    API->>DB: Process quest rewards
    API->>U: Return completion confirmation

    Note over U,QA: 4. Profile & Statistics Flow
    U->>API: GET /api/me/companions
    API->>DB: Aggregate capture statistics
    API->>U: Return collection with counts

    U->>API: GET /api/me/badges
    API->>DB: Get earned badges with metadata
    API->>U: Return badge achievement history
```

## 🔄 Core Game Mechanics

```mermaid
flowchart TD
    subgraph "Spawn Generation"
        SG1[User requests map data]
        SG2[Check existing spawns in radius]
        SG3{Sufficient spawns?}
        SG4{Specific companions requested?}
        SG5[Create targeted spawn<br/>single or multi-companion]
        SG6[Query spawn rules for companions]
        SG7[Apply geographic constraints]
        SG8[Roll probability dice]
        SG9[Generate new spawns]
        SG10{Multi-companion spawn?}
        SG11[Create spawn_companions records]
        SG12[Set expiration timers]
        SG13[Return spawn data]
        
        SG1 --> SG2
        SG2 --> SG3
        SG3 -->|No| SG4
        SG3 -->|Yes| SG13
        SG4 -->|Yes| SG5
        SG4 -->|No| SG6
        SG5 --> SG12
        SG6 --> SG7
        SG7 --> SG8
        SG8 --> SG9
        SG9 --> SG10
        SG10 -->|Yes| SG11
        SG10 -->|No| SG12
        SG11 --> SG12
        SG12 --> SG13
    end

    subgraph "Capture Mechanics"
        CM1[User attempts capture]
        CM2{Spawn active?}
        CM3{Within capture radius?}
        CM4{Companion available in spawn?}
        CM5{Already captured this companion?}
        CM6[Process capture]
        CM7{All companions captured from spawn?}
        CM8[Update spawn status]
        CM9[Create user_companions record]
        CM10[Trigger badge check]
        CM11[Update quest progress]
        CM12[Return success]
        
        CM1 --> CM2
        CM2 -->|No| CMF[Capture failed]
        CM2 -->|Yes| CM3
        CM3 -->|No| CMF
        CM3 -->|Yes| CM4
        CM4 -->|No| CMF
        CM4 -->|Yes| CM5
        CM5 -->|Yes| CMF
        CM5 -->|No| CM6
        CM6 --> CM7
        CM7 -->|Yes| CM8
        CM7 -->|No| CM9
        CM8 --> CM9
        CM9 --> CM10
        CM10 --> CM11
        CM11 --> CM12
    end

    subgraph "Progression Systems"
        subgraph "Badge System"
            BS1[Capture event]
            BS2[Count total captures for companion]
            BS3[Check badge requirements]
            BS4[Award eligible badges]
            BS5[Notify user]
        end
        
        subgraph "Quest System"
            QS1[Game action occurs]
            QS2[Match action to quest requirements]
            QS3[Update progress counters]
            QS4[Check completion thresholds]
            QS5[Process rewards]
            QS6[Mark quest complete]
        end
    end

    CM8 --> BS1
    CM9 --> QS1
    
    BS1 --> BS2
    BS2 --> BS3
    BS3 --> BS4
    BS4 --> BS5
    
    QS1 --> QS2
    QS2 --> QS3
    QS3 --> QS4
    QS4 --> QS5
    QS5 --> QS6
```

## 🔌 API Architecture

```mermaid
graph LR
    subgraph "Public APIs"
        PUB1[GET /api/companions<br/>List all companions]
        PUB2[GET /api/companions/{id}<br/>Companion details]
    end

    subgraph "Authenticated APIs"
        subgraph "Map & Location"
            MAP1[GET /api/map/companions<br/>Location-based spawns<br/>Shows single & multi-companion spawns]
            MAP2[POST /api/map/spawns/{id}/capture<br/>Capture companion<br/>Optional: companion_id for multi-companion spawns]
        end
        
        subgraph "Quest Management" 
            QUEST1[GET /api/quests<br/>Active quests with progress]
            QUEST2[POST /api/quests/{id}/complete<br/>Complete quest]
        end
        
        subgraph "User Profile"
            USER1[GET /api/me<br/>Profile with statistics]
            USER2[GET /api/me/badges<br/>Achievement history]
            USER3[GET /api/me/companions<br/>Collection with counts]
        end
        
        subgraph "Authentication"
            AUTH1[POST /auth/login<br/>Sanctum token auth]
            AUTH2[GET /auth/me<br/>Current user]
            AUTH3[POST /auth/logout<br/>Revoke token]
        end
    end

    subgraph "Request Validation"
        VAL1[MapCompanionsRequest<br/>Lat/lng/radius validation]
        VAL2[Form Requests<br/>Input sanitization]
    end

    subgraph "Response Resources"
        RES1[CompanionResource<br/>Companion data formatting]
        RES2[MapSpawnResource<br/>Spawn with visibility state]
        RES3[QuestResource<br/>Quest with progress data]
        RES4[BadgeResource<br/>Badge with earn timestamp]
        RES5[UserCompanionCollectionResource<br/>Collection statistics]
    end

    MAP1 --> VAL1
    MAP2 --> VAL1
    
    PUB1 --> RES1
    PUB2 --> RES1
    MAP1 --> RES2
    QUEST1 --> RES3
    USER2 --> RES4
    USER3 --> RES5
```

## 🛡️ Security & Authorization

```mermaid
graph TD
    subgraph "Authentication Layer"
        AUTH[Laravel Sanctum<br/>Token-based Auth]
        TOKENS[API Tokens<br/>Personal Access Tokens]
    end

    subgraph "Authorization Policies"
        SP[SpawnPolicy<br/>Capture validation]
        QP[QuestPolicy<br/>Quest access control]
        CP[CompanionPolicy<br/>Public data access]
    end

    subgraph "Validation Rules"
        GEO[Geographic Validation<br/>Lat/lng bounds checking]
        RATE[Rate Limiting<br/>API throttling]
        INPUT[Input Sanitization<br/>XSS/injection prevention]
    end

    subgraph "Security Checks"
        SC1{User authenticated?}
        SC2{Within capture radius?}
        SC3{Spawn still active?}
        SC4{Quest completion valid?}
        SC5{Rate limit exceeded?}
    end

    AUTH --> TOKENS
    TOKENS --> SC1
    SC1 --> SP
    SC1 --> QP
    SC1 --> CP
    
    SP --> SC2
    SP --> SC3
    QP --> SC4
    RATE --> SC5
    
    GEO --> INPUT
```

## 🚀 Scaling Architecture

```mermaid
graph TB
    subgraph "Load Balancing"
        LB[Load Balancer<br/>Multiple API Instances]
    end

    subgraph "Caching Layer"
        REDIS[Redis Cache<br/>Session & Data Cache]
        SPAWN_CACHE[Spawn Data Cache<br/>Location-based caching]
        QUEST_CACHE[Quest Progress Cache<br/>User state caching]
    end

    subgraph "Database Optimization"
        DB_MAIN[(Primary MySQL<br/>Write Operations)]
        DB_READ[(Read Replicas<br/>Read Operations)]
        INDEXES[Optimized Indexes<br/>Geographic & Time-based]
    end

    subgraph "Background Processing"
        QUEUE[Laravel Queues<br/>Async processing]
        SPAWN_JOB[Spawn Cleanup Job<br/>Remove expired spawns]
        BADGE_JOB[Badge Processing Job<br/>Batch badge awards]
        QUEST_JOB[Quest Reset Job<br/>Daily quest resets]
    end

    subgraph "Monitoring & Analytics"
        LOGS[Application Logs<br/>Laravel Telescope]
        METRICS[Performance Metrics<br/>Response times & usage]
        ALERTS[Error Monitoring<br/>Exception tracking]
    end

    LB --> REDIS
    LB --> DB_MAIN
    LB --> DB_READ
    
    REDIS --> SPAWN_CACHE
    REDIS --> QUEST_CACHE
    
    DB_MAIN --> INDEXES
    DB_READ --> INDEXES
    
    QUEUE --> SPAWN_JOB
    QUEUE --> BADGE_JOB
    QUEUE --> QUEST_JOB
    
    LB --> LOGS
    LOGS --> METRICS
    METRICS --> ALERTS
```

## 📊 Data Flow Summary

### Key Features Implemented:
- **Location-based spawn system** with dynamic generation
- **Multi-companion spawn support** with backward compatibility
- **Companion collection** with rarity-based spawning
- **Quest system** with daily/event-based tasks
- **Badge progression** with capture milestone tracking
- **Real-time map interface** with visibility states
- **User progression tracking** with comprehensive statistics
- **Policy-based authorization** for secure game mechanics
- **Comprehensive API** with proper JsonResource formatting
- **Flexible capture mechanics** supporting companion selection

### Technical Highlights:
- **Laravel 12** with Sanctum authentication
- **MySQL database** with optimized relationships
- **Action-based architecture** for business logic
- **Policy-driven authorization** for security
- **Comprehensive test coverage** with Pest framework
- **Geographic calculations** for spawn mechanics
- **JSON-based requirement/reward system** for flexibility

This architecture supports the core gameplay loop of discovery → capture → progression while maintaining scalability for millions of users.

---

## 🎯 Multi-Companion Spawn Architecture

### Enhanced Spawn System Design

```mermaid
graph TB
    subgraph "Spawn Creation Logic"
        SC1[GenerateSpawnsAction]
        SC2{Companion IDs provided?}
        SC3[Legacy spawn generation<br/>uses spawn rules]
        SC4{Single or multiple companions?}
        SC5[Create single companion spawn<br/>set companion_id]
        SC6[Create multi-companion spawn<br/>companion_id = null]
        SC7[Create spawn_companions records<br/>via pivot table]
        
        SC1 --> SC2
        SC2 -->|No| SC3
        SC2 -->|Yes| SC4
        SC4 -->|Single| SC5
        SC4 -->|Multiple| SC6
        SC6 --> SC7
    end

    subgraph "Capture Processing Logic"
        CP1[CaptureCompanionAction]
        CP2{Legacy spawn?}
        CP3[Capture single companion<br/>from companion_id]
        CP4{Companion ID specified?}
        CP5[Validate companion in spawn<br/>via spawn_companions]
        CP6[Capture specified companion]
        CP7[Capture first available companion]
        CP8{All companions captured?}
        CP9[Mark spawn as captured]
        CP10[Leave spawn active]
        
        CP1 --> CP2
        CP2 -->|Yes| CP3
        CP2 -->|No| CP4
        CP4 -->|Yes| CP5
        CP4 -->|No| CP7
        CP5 --> CP6
        CP6 --> CP8
        CP7 --> CP8
        CP8 -->|Yes| CP9
        CP8 -->|No| CP10
    end

    subgraph "Database Architecture"
        subgraph "Legacy Support"
            LS1[spawns.companion_id<br/>nullable field]
            LS2[Direct companion relationship<br/>for backward compatibility]
        end
        
        subgraph "Multi-Companion Support"
            MS1[spawn_companions table<br/>pivot relationship]
            MS2[Many-to-many relationship<br/>spawns ↔ companions]
            MS3[Unique constraint<br/>spawn_id + companion_id]
        end
        
        subgraph "Unified Access"
            UA1[getAllCompanions() method<br/>returns Collection]
            UA2[isLegacySpawn() method<br/>type detection]
            UA3[hasMultipleCompanions() method<br/>count check]
        end
    end

    SC7 --> MS1
    CP5 --> MS2
    CP6 --> UA1
```

### Data Flow Patterns

```mermaid
sequenceDiagram
    participant API as API Controller
    participant GSA as GenerateSpawnsAction
    participant CCA as CaptureCompanionAction
    participant SM as Spawn Model
    participant DB as Database

    Note over API,DB: Multi-Companion Spawn Creation
    API->>GSA: execute($lat, $lng, $radius, [123, 456, 789])
    GSA->>DB: Create spawn (companion_id = null)
    GSA->>DB: Insert spawn_companions records
    GSA->>API: Return spawn with companions loaded

    Note over API,DB: Multi-Companion Capture Flow
    API->>CCA: execute($user, $spawn, $companionId)
    CCA->>SM: isLegacySpawn()
    SM->>CCA: false (multi-companion)
    CCA->>SM: companions->contains($companionId)
    SM->>CCA: true (companion available)
    CCA->>DB: Create user_companions record
    CCA->>SM: areAllCompanionsCaptured()
    SM->>DB: Count captured vs total companions
    DB->>SM: 2 of 3 captured
    SM->>CCA: false (spawn remains active)
    CCA->>API: Return UserCompanion record

    Note over API,DB: Legacy Compatibility Check
    API->>CCA: execute($user, $legacySpawn)
    CCA->>SM: isLegacySpawn()
    SM->>CCA: true (has companion_id)
    CCA->>DB: Create user_companions record
    CCA->>DB: Mark spawn as captured immediately
    CCA->>API: Return UserCompanion record
```

### Key Implementation Benefits

#### 🔄 **Backward Compatibility**
- Existing single companion spawns continue to work unchanged
- No migration required for existing data
- Gradual adoption of multi-companion features

#### 🎮 **Enhanced Gameplay**
- Players can choose which companion to capture from multi-companion spawns
- Spawns remain active until all companions are captured
- More strategic gameplay decisions

#### 🏗️ **Technical Flexibility**
- Hybrid approach supports both spawn types
- Unified model interface (`getAllCompanions()`)
- Clear separation of concerns between single and multi-companion logic

#### 📊 **Data Integrity**
- Foreign key constraints ensure referential integrity
- Unique constraints prevent duplicate spawn-companion pairs
- Proper indexing for efficient queries

### Migration Strategy

1. **Phase 1**: Database schema changes (completed)
   - Add `spawn_companions` table
   - Make `companion_id` nullable in `spawns`

2. **Phase 2**: Model enhancements (completed)
   - Add relationships and helper methods
   - Update actions to support both spawn types

3. **Phase 3**: API enhancements (ready)
   - Optional `companion_id` parameter in capture endpoint
   - Enhanced spawn resources showing all companions

4. **Phase 4**: Client updates (future)
   - UI for companion selection in multi-companion spawns
   - Visual indicators for spawn types

This enhanced architecture maintains the simplicity of the original system while adding powerful new capabilities for richer gameplay experiences.
