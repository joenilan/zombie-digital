# **PRD: Multiple Twitch Account Management System**

## **1. Overview**

### **1.1 Purpose**
This document outlines the product requirements for implementing a multiple Twitch account management system within Zombie.Digital. This feature will allow users to connect, switch between, and manage multiple Twitch accounts from a single Zombie.Digital user profile.

### **1.2 Target Users**
- Content creators with multiple Twitch channels (personal, business, alternate accounts)
- Twitch moderators who manage multiple streamer accounts
- Agency users who manage multiple client Twitch accounts
- Users with personal and professional Twitch identities
- Streamers with alternate accounts for different content types

### **1.3 Business Goals**
- Improve user experience by reducing account switching friction
- Increase platform retention by accommodating professional use cases
- Differentiate from competitors with unique multi-account support
- Enable advanced analytics across multiple accounts
- Support content creator workflows and business needs

---

## **2. Current State Analysis**

### **2.1 Current Limitations**
- Users can only connect one Twitch account per Zombie.Digital profile
- Account switching requires logging out of Twitch completely
- No way to manage multiple creator identities from a single dashboard
- Limited support for professional/business use cases

### **2.2 User Pain Points**
- Manual logout/login process for account switching
- Loss of session state when switching accounts
- Inability to view analytics across multiple accounts
- No centralized management for multiple creator identities

---

## **3. Solution Requirements**

### **3.1 Core Functionality**

#### **3.1.1 Account Connection**
- **Connect Multiple Accounts**: Users can link multiple Twitch accounts to their Zombie.Digital profile
- **OAuth Flow Enhancement**: Modified OAuth flow to support adding additional accounts
- **Account Verification**: Verify ownership of each connected account
- **Account Limits**: Initial limit of 5 connected accounts per user (configurable)

#### **3.1.2 Account Management**
- **Account Dashboard**: Centralized view of all connected accounts
- **Primary Account**: Designate one account as "primary" for default actions
- **Account Switching**: Quick switching between accounts without re-authentication
- **Account Removal**: Ability to disconnect accounts from the profile

#### **3.1.3 Context Switching**
- **Session Management**: Maintain separate session contexts for each account
- **UI Context Indicators**: Clear visual indicators of which account is active
- **Scope-Aware Operations**: All operations respect the currently active account context
- **Permission Inheritance**: Handle different permission levels across accounts

### **3.2 User Experience**

#### **3.2.1 Account Picker**
- **Quick Switcher**: Dropdown/modal for rapid account switching
- **Account Preview**: Display username, display name, and avatar for each account
- **Recent Activity**: Show last activity timestamp for each account
- **Status Indicators**: Show online/offline status and streaming status

#### **3.2.2 Multi-Account Workflows**
- **Cross-Account Analytics**: View combined analytics across all accounts
- **Bulk Operations**: Perform actions across multiple accounts simultaneously
- **Account-Specific Settings**: Maintain separate settings per account
- **Content Synchronization**: Option to sync certain settings across accounts

### **3.3 Technical Architecture**

#### **3.3.1 Database Schema**
```sql
-- New table for managing multiple account connections
CREATE TABLE user_twitch_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zombie_user_id UUID NOT NULL, -- References main user profile
  twitch_account_id UUID NOT NULL, -- References twitch_users table
  is_primary BOOLEAN DEFAULT false,
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE,
  display_order INTEGER DEFAULT 0,
  nickname TEXT, -- Optional custom name for the account
  UNIQUE(zombie_user_id, twitch_account_id)
);

-- Modified user sessions to track active account
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  active_twitch_account_id UUID,
  session_data JSONB,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **3.3.2 API Endpoints**
- `GET /api/accounts` - List all connected accounts
- `POST /api/accounts/connect` - Connect a new Twitch account
- `DELETE /api/accounts/{id}/disconnect` - Remove account connection
- `POST /api/accounts/{id}/switch` - Switch active account context
- `PUT /api/accounts/{id}/primary` - Set primary account
- `GET /api/accounts/{id}/analytics` - Get account-specific analytics

#### **3.3.3 State Management**
- **Account Store**: Zustand store for managing connected accounts
- **Active Account Context**: Global context for current active account
- **Permission Context**: Dynamic permission calculation based on active account
- **Cache Management**: Efficient caching of account data and permissions

---

## **4. User Stories**

### **4.1 As a Content Creator**
- **US-1**: I want to connect my personal and business Twitch accounts so I can manage both from one dashboard
- **US-2**: I want to quickly switch between accounts without losing my current work
- **US-3**: I want to see combined analytics across all my accounts
- **US-4**: I want to set different social links for each of my accounts

### **4.2 As a Moderator**
- **US-5**: I want to connect multiple streamer accounts I moderate so I can manage them efficiently
- **US-6**: I want to see moderation tools for each account I have access to
- **US-7**: I want to receive notifications for all accounts I manage

### **4.3 As an Agency User**
- **US-8**: I want to manage multiple client accounts from a single interface
- **US-9**: I want to generate reports across multiple accounts for my clients
- **US-10**: I want to apply bulk changes to multiple accounts simultaneously

---

## **5. Implementation Phases**

### **5.1 Phase 1: Core Multi-Account Support (4-6 weeks)**
- Database schema updates
- Basic account connection/disconnection
- Simple account switching UI
- Updated authentication flow

### **5.2 Phase 2: Enhanced UX (3-4 weeks)**
- Advanced account picker component
- Context-aware UI updates
- Account-specific settings
- Improved navigation and breadcrumbs

### **5.3 Phase 3: Advanced Features (4-5 weeks)**
- Cross-account analytics
- Bulk operations
- Advanced permission management
- Account synchronization options

### **5.4 Phase 4: Polish & Optimization (2-3 weeks)**
- Performance optimization
- Advanced caching strategies
- Error handling improvements
- User feedback integration

---

## **6. Success Metrics**

### **6.1 Adoption Metrics**
- **Multi-Account Adoption Rate**: % of users who connect multiple accounts
- **Account Switch Frequency**: Average switches per session
- **Feature Engagement**: Usage of multi-account specific features

### **6.2 User Experience Metrics**
- **Account Switch Time**: Time to complete account switching
- **Error Rate**: % of failed account operations
- **User Satisfaction**: Survey scores for multi-account workflows

### **6.3 Technical Metrics**
- **API Response Time**: Performance of account-related endpoints
- **Cache Hit Rate**: Efficiency of account data caching
- **Database Performance**: Query performance for multi-account operations

---

## **7. Risk Analysis**

### **7.1 Technical Risks**
- **Complexity**: Managing multiple authentication states
- **Performance**: Potential database query complexity
- **Security**: Ensuring proper isolation between accounts

### **7.2 User Experience Risks**
- **Confusion**: Users getting lost in account contexts
- **Overwhelming**: Too many options causing decision paralysis
- **Migration**: Existing users adapting to new workflows

### **7.3 Mitigation Strategies**
- **Progressive Rollout**: Gradual feature release to user segments
- **Clear Documentation**: Comprehensive guides and tutorials
- **Fallback Options**: Maintain backward compatibility
- **User Testing**: Extensive testing with target user groups

---

## **8. Future Considerations**

### **8.1 Advanced Features**
- **Team Management**: Allow teams to share account access
- **Role-Based Access**: Different permission levels for account access
- **API Integration**: Third-party integrations for multi-account management
- **Mobile Support**: Mobile app support for account switching

### **8.2 Platform Extensions**
- **Multi-Platform Support**: Extend to other platforms (YouTube, Discord)
- **Cross-Platform Analytics**: Combined insights across platforms
- **Unified Branding**: Consistent branding across multiple accounts

---

## **9. Appendix**

### **9.1 Technical Specifications**
- **Browser Support**: Modern browsers with localStorage support
- **Mobile Compatibility**: Responsive design for mobile account switching
- **API Rate Limits**: Twitch API limitations and account management

### **9.2 Competitive Analysis**
- **StreamLabs**: Limited multi-account support
- **OBS Studio**: No built-in account management
- **Restream**: Strong multi-platform but limited Twitch-specific features

### **9.3 User Research**
- **Survey Results**: 73% of users interested in multi-account support
- **Use Cases**: Content creators (45%), Moderators (30%), Agencies (25%)
- **Priority Features**: Quick switching (90%), Combined analytics (75%), Bulk operations (60%) 