# Requirements Document: Hierarchical Approval Authority Filtering

## Introduction

This feature enables staff members to create requests with an approval authority dropdown that intelligently filters options based on their organizational hierarchy. The system must respect both academic and administrative wing structures, ensuring staff only see approval authorities from their own organizational unit.

## Glossary

- **Staff**: A user with role 'staff' who creates requests
- **Approval_Authority**: A user with role 'approval_authority' or 'vice_president' who can approve requests
- **Academic_Wing**: Organizational structure with college, school, and department hierarchy
- **Administrative_Wing**: Organizational structure with administrative units
- **Organizational_Hierarchy**: The complete path of organizational units a user belongs to
- **Active_User**: A user with isActive=true status
- **Request**: A document created by staff that requires approval

## Requirements

### Requirement 1: Filter Approval Authorities by Academic Hierarchy

**User Story:** As a staff member in the academic wing, I want to see only approval authorities from my department, so that I can route my request to the appropriate authority within my organizational structure.

#### Acceptance Criteria

1. WHEN a staff member from the academic wing creates a request, THE System SHALL retrieve all approval authorities with matching college, school, and department
2. WHEN filtering academic approval authorities, THE System SHALL only include users with role 'approval_authority' or 'vice_president'
3. WHEN filtering academic approval authorities, THE System SHALL only include users with isActive=true
4. WHEN a staff member selects an approval authority from the academic wing, THE System SHALL display the authority's name and organizational unit (college, school, department)

### Requirement 2: Filter Approval Authorities by Administrative Hierarchy

**User Story:** As a staff member in the administrative wing, I want to see only approval authorities from my administrative unit, so that I can route my request to the appropriate authority within my administrative structure.

#### Acceptance Criteria

1. WHEN a staff member from the administrative wing creates a request, THE System SHALL retrieve all approval authorities with matching administrativeUnit
2. WHEN filtering administrative approval authorities, THE System SHALL only include users with role 'approval_authority' or 'vice_president'
3. WHEN filtering administrative approval authorities, THE System SHALL only include users with isActive=true
4. WHEN a staff member selects an approval authority from the administrative wing, THE System SHALL display the authority's name and administrative unit

### Requirement 3: Backend API Endpoint for Filtered Approval Authorities

**User Story:** As a frontend developer, I want a backend API endpoint that returns filtered approval authorities, so that I can populate the dropdown with appropriate options.

#### Acceptance Criteria

1. WHEN the frontend requests filtered approval authorities, THE API_Endpoint SHALL accept the staff member's organizational hierarchy as input
2. WHEN the API receives a request, THE API_Endpoint SHALL return only active approval authorities matching the staff member's hierarchy
3. WHEN the API processes a request, THE API_Endpoint SHALL distinguish between academic and administrative wing filtering logic
4. WHEN the API returns results, THE API_Endpoint SHALL include user name, role, and organizational unit information

### Requirement 4: Frontend Request Creation Form Integration

**User Story:** As a staff member, I want the request creation form to automatically populate the approval authority dropdown with filtered options, so that I can quickly select an appropriate approver.

#### Acceptance Criteria

1. WHEN the request creation form loads, THE Request_Form SHALL call the backend API to fetch filtered approval authorities
2. WHEN the API returns filtered authorities, THE Request_Form SHALL populate the dropdown with the results
3. WHEN a staff member opens the approval authority dropdown, THE Request_Form SHALL display only authorities from their organizational hierarchy
4. WHEN the dropdown is displayed, THE Request_Form SHALL show approval authority name and organizational unit for each option

### Requirement 5: Exclusion of Cross-Hierarchy Approval Authorities

**User Story:** As a system administrator, I want to ensure that approval authorities from different organizational units are never visible to staff, so that requests are routed only within appropriate hierarchies.

#### Acceptance Criteria

1. WHEN filtering approval authorities, THE System SHALL exclude all authorities from different departments (for academic wing)
2. WHEN filtering approval authorities, THE System SHALL exclude all authorities from different administrative units (for administrative wing)
3. WHEN a staff member's hierarchy changes, THE System SHALL update the filtered approval authorities accordingly
4. IF an approval authority becomes inactive, THEN THE System SHALL remove them from the dropdown for all staff members

### Requirement 6: Display of Organizational Context

**User Story:** As a staff member, I want to see the organizational context of each approval authority, so that I can verify I'm selecting the correct person.

#### Acceptance Criteria

1. WHEN displaying an approval authority in the dropdown, THE Request_Form SHALL show the authority's full name
2. WHEN displaying an approval authority in the dropdown, THE Request_Form SHALL show their organizational unit (college/school/department for academic, administrativeUnit for administrative)
3. WHEN a staff member hovers over an approval authority, THE Request_Form SHALL display additional context if available
4. WHEN an approval authority is selected, THE Request_Form SHALL display their complete organizational hierarchy in the request details
