# System Workflows and Diagrams

## Overview

This document outlines the key workflows and user journeys within the Tree of Life Agency platform, visualized through Mermaid diagrams. These workflows cover the complete lifecycle from user onboarding through service delivery and completion.

## User Onboarding Workflows

### Client Onboarding Flow

```mermaid
flowchart TD
    A[Visit Platform] --> B[Connect Wallet]
    B --> C{Existing User?}
    C -->|Yes| D[Authenticate & Login]
    C -->|No| E[Create Profile]
    E --> F[Complete Onboarding]
    F --> G[Verify Email/Identity]
    G --> H[Access Marketplace]
    D --> H
    H --> I[Browse Services]

    style A fill:#e1f5fe
    style B fill:#f3e5f5
    style H fill:#e8f5e8
    style I fill:#fff3e0
```

### Agent Onboarding Flow

```mermaid
flowchart TD
    A[Express Interest] --> B[Connect Wallet]
    B --> C[Submit Application]
    C --> D[Profile Creation]
    D --> E[Skills Assessment]
    E --> F{Pass Assessment?}
    F -->|Yes| G[Portfolio Review]
    F -->|No| H[Provide Feedback]
    H --> I[Reapply Later]
    G --> J{Approved?}
    J -->|Yes| K[Verification Process]
    J -->|No| L[Rejection Notice]
    K --> M{Verification Complete?}
    M -->|Yes| N[Agent Status Granted]
    M -->|No| O[Additional Documentation]
    O --> K
    N --> P[Marketplace Access]
    P --> Q[Create Service Listings]

    style A fill:#e1f5fe
    style N fill:#e8f5e8
    style P fill:#fff3e0
```

## Service Discovery and Purchase

### Service Browsing Workflow

```mermaid
flowchart TD
    A[Client Dashboard] --> B[Service Categories]
    B --> C[Filter Options]
    C --> D[Search Results]
    D --> E[Service Details]
    E --> F[Agent Profile]
    F --> G[Portfolio Review]
    G --> H[Reviews & Ratings]
    H --> I{Interested?}
    I -->|Yes| J[Contact Agent]
    I -->|No| K[Continue Browsing]
    J --> L[Discussion Phase]
    L --> M{Agree on Terms?}
    M -->|Yes| N[Proceed to Order]
    M -->|No| O[Negotiate Terms]
    O --> L

    style A fill:#e1f5fe
    style E fill:#f3e5f5
    style N fill:#e8f5e8
```

### Order Creation Process

```mermaid
flowchart TD
    A[Service Selected] --> B[Order Details Form]
    B --> C[Define Requirements]
    C --> D[Set Milestones]
    D --> E[Calculate Total]
    E --> F[Review Order]
    F --> G{Confirm Order?}
    G -->|Yes| H[Payment Method]
    G -->|No| I[Edit Order]
    I --> F
    H --> J[Escrow Setup]
    J --> K[Fund Escrow]
    K --> L[Order Created]
    L --> M[Notify Agent]
    M --> N[Project Begins]

    style A fill:#e1f5fe
    style L fill:#e8f5e8
    style N fill:#fff3e0
```

## Project Execution Workflows

### Agile Development Workflow

```mermaid
flowchart TD
    A[Order Accepted] --> B[Sprint Planning]
    B --> C[Backlog Creation]
    C --> D[Sprint 1 Start]
    D --> E[Daily Standups]
    E --> F[Development Work]
    F --> G{Code Complete?}
    G -->|No| E
    G -->|Yes| H[Testing Phase]
    H --> I{Sprint Goal Met?}
    I -->|Yes| J[Sprint Review]
    I -->|No| K[Adjust Backlog]
    K --> E
    J --> L[Client Feedback]
    L --> M{Satisfied?}
    M -->|Yes| N[Sprint Retrospective]
    M -->|No| O[Address Concerns]
    O --> J
    N --> P{Next Sprint?}
    P -->|Yes| Q[Sprint N]
    P -->|No| R[Project Complete]

    style A fill:#e1f5fe
    style R fill:#e8f5e8
```

### Milestone-Based Delivery

```mermaid
flowchart TD
    A[Milestone Defined] --> B[Work Begins]
    B --> C[Progress Updates]
    C --> D{Deadline Approaching?}
    D -->|Yes| E[Client Notification]
    D -->|No| C
    E --> F[Work Submission]
    F --> G[Client Review]
    G --> H{Satisfied?}
    H -->|Yes| I[Milestone Approval]
    H -->|No| J[Revision Request]
    J --> K[Revisions Made]
    K --> F
    I --> L[Fund Release]
    L --> M[Reputation Update]
    M --> N{Next Milestone?}
    N -->|Yes| O[Next Milestone]
    N -->|No| P[Project Complete]
    O --> B

    style A fill:#e1f5fe
    style I fill:#e8f5e8
    style P fill:#fff3e0
```

## Payment and Escrow Workflows

### Escrow Fund Management

```mermaid
stateDiagram-v2
    [*] --> Pending: Order Created
    Pending --> Funded: Client Deposits
    Funded --> Active: Agent Starts Work
    Active --> PartialRelease: Milestone Complete
    PartialRelease --> Active: Continue Work
    Active --> Completed: All Milestones Done
    Active --> Disputed: Issue Raised
    Disputed --> Resolved: Admin Decision
    Resolved --> Completed: Funds Distributed
    Resolved --> Refunded: Client Refund
    Completed --> [*]
    Refunded --> [*]

    note right of Funded
        Smart contract holds funds
        securely until completion
    end note

    note right of Disputed
        Admin reviews evidence
        and makes final decision
    end note
```

### Smart Contract Interaction Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant F as Frontend
    participant SC as Smart Contract
    participant A as Agent
    participant B as Backend

    C->>F: Initiate Escrow
    F->>SC: Deploy Contract
    SC-->>F: Contract Address
    F->>C: Request Payment
    C->>SC: Deposit Funds
    SC-->>F: Funded Confirmation
    F->>B: Update Order Status
    B->>A: Notify Agent
    A->>F: Submit Deliverable
    F->>B: Store Deliverable
    B->>C: Notify Client
    C->>F: Review & Approve
    F->>SC: Release Funds
    SC-->>F: Transaction Confirmed
    F->>B: Update Records
    B->>A: Payment Received
    B->>C: Service Complete
```

## Reputation and Review System

### Review Submission Workflow

```mermaid
flowchart TD
    A[Project Complete] --> B[Review Request Sent]
    B --> C[Client Receives Email]
    C --> D{Submit Review?}
    D -->|Yes| E[Rate Agent 1-5]
    D -->|No| F[Auto 5-star after 7 days]
    E --> G[Write Comments]
    G --> H[Submit Review]
    H --> I[Update Reputation]
    I --> J[Badge Check]
    J --> K{New Badge Earned?}
    K -->|Yes| L[Mint NFT Badge]
    K -->|No| M[End Process]
    F --> I

    style A fill:#e1f5fe
    style H fill:#e8f5e8
    style L fill:#fff3e0
```

### Reputation Score Calculation

```mermaid
flowchart TD
    A[New Review Submitted] --> B[Calculate Weighted Score]
    B --> C[Update User Reputation]
    C --> D[Check Badge Thresholds]
    D --> E{Threshold Reached?}
    E -->|Yes| F[Trigger Badge Minting]
    E -->|No| G[Continue Monitoring]
    F --> H[Update On-chain Reputation]
    H --> I[Notify User]
    I --> J[Update Leaderboards]
    J --> K[End Process]

    style A fill:#e1f5fe
    style F fill:#e8f5e8
    style J fill:#fff3e0
```

## Administrative Workflows

### Dispute Resolution Process

```mermaid
flowchart TD
    A[Dispute Raised] --> B[Gather Evidence]
    B --> C[Client Submission]
    C --> D[Agent Response]
    D --> E[Admin Review]
    E --> F{Evidence Sufficient?}
    F -->|Yes| G[Make Decision]
    F -->|No| H[Request More Info]
    H --> C
    G --> I{Decision}
    I -->|Client Favored| J[Refund Client]
    I -->|Agent Favored| K[Release to Agent]
    I -->|Split Decision| L[Partial Release]
    J --> M[Update Records]
    K --> M
    L --> M
    M --> N[Close Dispute]
    N --> O[Reputation Impact]
    O --> P[Notify Parties]

    style A fill:#ffecb3
    style G fill:#ffcdd2
    style N fill:#e8f5e8
```

### Agent Verification Workflow

```mermaid
flowchart TD
    A[Application Submitted] --> B[Initial Review]
    B --> C{Passes Initial?}
    C -->|Yes| D[Skills Assessment]
    C -->|No| E[Rejection Notice]
    D --> F{Assessment Passed?}
    F -->|Yes| G[Portfolio Review]
    F -->|No| H[Feedback Provided]
    H --> I[Reapply Allowed]
    G --> J{Portfolio Approved?}
    J -->|Yes| K[Identity Verification]
    J -->|No| L[Improvement Suggestions]
    L --> I
    K --> M{Verification Complete?}
    M -->|Yes| N[Agent Status Granted]
    M -->|No| O[Additional Documents]
    O --> K
    N --> P[Welcome Email]
    P --> Q[Marketplace Training]

    style A fill:#e1f5fe
    style N fill:#e8f5e8
    style P fill:#fff3e0
```

## Analytics and Reporting Workflows

### Real-time Dashboard Updates

```mermaid
flowchart TD
    A[User Action] --> B[Event Captured]
    B --> C[Queue Processing]
    C --> D[Data Aggregation]
    D --> E[Cache Update]
    E --> F[Dashboard Refresh]
    F --> G[Real-time Display]
    G --> H{More Actions?}
    H -->|Yes| A
    H -->|No| I[Session End]

    style A fill:#e1f5fe
    style G fill:#e8f5e8
```

### Automated Report Generation

```mermaid
flowchart TD
    A[Scheduled Trigger] --> B[Data Collection]
    B --> C[Metric Calculation]
    C --> D[Report Generation]
    D --> E[Format Selection]
    E --> F[Distribution]
    F --> G[Email Delivery]
    G --> H[Archive Storage]
    H --> I[Next Schedule]

    style A fill:#e1f5fe
    style D fill:#e8f5e8
    style G fill:#fff3e0
```

## Error Handling and Recovery

### Transaction Failure Recovery

```mermaid
flowchart TD
    A[Transaction Failed] --> B{Error Type}
    B -->|Network| C[Retry with Backoff]
    B -->|Insufficient Funds| D[Notify User]
    B -->|Contract Error| E[Admin Investigation]
    B -->|Timeout| F[Status Check]
    C --> G{Success?}
    G -->|Yes| H[Continue Process]
    G -->|No| I[Manual Intervention]
    D --> J[User Resolution]
    E --> K[Contract Fix]
    F --> L[Resume if Confirmed]
    I --> M[Admin Override]
    J --> H
    K --> H
    L --> H
    M --> H

    style A fill:#ffecb3
    style H fill:#e8f5e8
```

These workflows provide a comprehensive view of the user journeys and system interactions within the Tree of Life Agency platform, ensuring smooth operation and clear user experiences throughout the service delivery process.</target_file>