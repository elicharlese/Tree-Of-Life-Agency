# User Roles and Permissions

## Overview

The Tree of Life Agency platform implements a role-based access control (RBAC) system with three primary user roles: Clients, Agents, and Admins. Each role has specific permissions and capabilities designed to support the service-selling marketplace functionality.

## Role Definitions

### 1. Clients
**Description**: End users who purchase services from agents on the platform.

**Primary Responsibilities**:
- Browse and discover available services
- Place orders for services
- Manage escrow payments through smart contracts
- Track project progress and milestones
- Approve completed work and release payments
- Leave reviews and ratings for agents
- Access transaction history and receipts

**Permissions**:
- ✅ Read: Service listings, agent profiles, reviews
- ✅ Create: Orders, reviews, support tickets
- ✅ Update: Own profile, order requirements
- ✅ Delete: Own reviews (within time limits)
- ❌ No access to other users' data
- ❌ No access to admin functions

**Wallet Requirements**:
- Must connect a Web3 wallet for authentication
- Required for escrow funding and payment releases
- Used for NFT receipt collection

### 2. Agents
**Description**: Service providers who offer their skills and expertise on the platform.

**Primary Responsibilities**:
- Create and manage service listings
- Respond to client inquiries and proposals
- Execute work according to project specifications
- Submit milestone deliverables for approval
- Maintain portfolio and reputation
- Handle client communications
- Manage availability and scheduling

**Permissions**:
- ✅ Read: Own analytics, client profiles (for assigned projects)
- ✅ Create: Services, proposals, project updates
- ✅ Update: Own services, profile, project status
- ✅ Delete: Own services, proposals
- ❌ No access to other agents' data
- ❌ No access to admin functions
- ❌ Cannot modify client data

**Verification Requirements**:
- Wallet connection for authentication
- Profile verification (skills, experience)
- Portfolio submission
- Background check (optional but recommended)

### 3. Admins
**Description**: Platform administrators who manage system operations and user oversight.

**Primary Responsibilities**:
- User account management and verification
- Service listing moderation and approval
- Dispute resolution and escrow management
- Platform analytics and reporting
- System configuration and maintenance
- Content moderation and policy enforcement
- Support ticket handling

**Permissions**:
- ✅ Full CRUD on all entities
- ✅ Access to admin dashboard and analytics
- ✅ User role management and permissions
- ✅ System configuration and settings
- ✅ Dispute resolution tools
- ✅ Emergency pause/freeze capabilities

**Access Requirements**:
- Wallet-based authentication
- Multi-signature approval for critical actions
- Audit logging for all administrative actions

## Permission Matrix

| Feature | Client | Agent | Admin |
|---------|--------|-------|-------|
| Browse Services | ✅ | ✅ | ✅ |
| Create Services | ❌ | ✅ | ✅ |
| Edit Services | ❌ | ✅ (own) | ✅ |
| Delete Services | ❌ | ✅ (own) | ✅ |
| Place Orders | ✅ | ❌ | ✅ |
| Accept Orders | ❌ | ✅ | ✅ |
| View Orders | ✅ (own) | ✅ (assigned) | ✅ |
| Update Order Status | ❌ | ✅ (assigned) | ✅ |
| Release Payments | ✅ (own) | ❌ | ✅ |
| View Analytics | ❌ | ✅ (own) | ✅ |
| Manage Users | ❌ | ❌ | ✅ |
| System Config | ❌ | ❌ | ✅ |

## Authentication Flow

### Wallet-Based Authentication
1. User initiates login/connect
2. Platform requests wallet signature
3. User signs authentication message
4. Platform verifies signature and wallet ownership
5. JWT token issued for session management
6. Role-based permissions applied

### Session Management
- JWT tokens with wallet address as subject
- Automatic token refresh on activity
- Session invalidation on wallet disconnect
- Cross-device session synchronization

## Role Transition Workflows

### Client to Agent
1. Client expresses interest in becoming agent
2. Complete agent profile with skills/portfolio
3. Submit verification documents
4. Admin review and approval
5. Role update and marketplace access granted

### Agent Verification Process
1. Profile completion (skills, experience, portfolio)
2. Identity verification (optional)
3. Skills assessment or portfolio review
4. Background check (optional)
5. Admin approval and badge assignment

## Security Considerations

### Wallet Security
- No private key storage on platform
- Signature verification only
- No transaction execution without user approval
- Emergency disconnect capabilities

### Permission Boundaries
- Strict role-based access control
- API-level permission checks
- Database-level row security policies
- Audit logging for sensitive operations

### Dispute Resolution
- Admin oversight for payment disputes
- Smart contract arbitration mechanisms
- Reputation impact assessment
- Escalation procedures for complex cases

## User Experience Considerations

### Onboarding Flow
- Progressive profile completion
- Guided tutorials for each role
- Verification status indicators
- Role-specific dashboard layouts

### Communication Channels
- In-platform messaging system
- Email notifications for important events
- Push notifications for mobile
- Support ticket system for issues

### Reputation System
- Rating and review mechanisms
- Badge system for achievements
- Trust scores for marketplace confidence
- Dispute history transparency

This role structure provides a secure, scalable foundation for the service-selling marketplace while maintaining clear boundaries and responsibilities for each user type.</target_file>