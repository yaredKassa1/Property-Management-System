# Design Document: Hierarchical Approval Authority Filtering

## Overview

This design implements a hierarchical filtering system that restricts approval authority visibility based on organizational structure. The system maintains separate filtering logic for academic and administrative wings, ensuring staff members only see approval authorities from their own organizational unit. The implementation spans both backend API and frontend UI components.

## Architecture

The system follows a layered architecture:

1. **Backend Layer**: API endpoint that performs hierarchical filtering based on staff organizational context
2. **Data Layer**: Database queries that efficiently retrieve and filter approval authorities
3. **Frontend Layer**: Request creation form that consumes the API and displays filtered options
4. **UI Layer**: Dropdown component that renders filtered approval authorities with organizational context

### Data Flow

```
Staff Member Creates Request
    ↓
Request Form Loads
    ↓
Frontend Calls Backend API with Staff Hierarchy
    ↓
Backend Filters Approval Authorities by Hierarchy
    ↓
Backend Returns Filtered List (Active, Correct Role, Matching Hierarchy)
    ↓
Frontend Populates Dropdown
    ↓
Staff Selects Approval Authority
    ↓
Request Details Display Selected Authority's Full Hierarchy
```

## Components and Interfaces

### Backend Components

#### ApprovalAuthorityFilter Service

Responsible for filtering approval authorities based on organizational hierarchy.

```
Service: ApprovalAuthorityFilter
  Method: filterByAcademicHierarchy(staff: Staff) → List<ApprovalAuthority>
    Input: Staff object with college, school, department
    Output: List of active approval authorities matching hierarchy
    Logic: Query users where role IN ['approval_authority', 'vice_president']
           AND isActive = true
           AND college = staff.college
           AND school = staff.school
           AND department = staff.department

  Method: filterByAdministrativeHierarchy(staff: Staff) → List<ApprovalAuthority>
    Input: Staff object with administrativeUnit
    Output: List of active approval authorities matching hierarchy
    Logic: Query users where role IN ['approval_authority', 'vice_president']
           AND isActive = true
           AND administrativeUnit = staff.administrativeUnit

  Method: determineWing(staff: Staff) → Wing
    Input: Staff object
    Output: 'academic' or 'administrative'
    Logic: Check if staff has college/school/department (academic) or administrativeUnit (administrative)
```

#### API Endpoint

```
Endpoint: GET /api/approval-authorities/filtered
  Authentication: Required (staff member)
  Input: 
    - staffId (from authenticated user)
  Output:
    {
      authorities: [
        {
          id: string,
          name: string,
          role: 'approval_authority' | 'vice_president',
          college?: string,
          school?: string,
          department?: string,
          administrativeUnit?: string,
          wing: 'academic' | 'administrative'
        }
      ],
      wing: 'academic' | 'administrative'
    }
  Logic:
    1. Retrieve authenticated staff member
    2. Determine wing (academic or administrative)
    3. Call appropriate filter method
    4. Return filtered authorities with organizational context
```

### Frontend Components

#### RequestCreationForm

Main form component for creating requests with approval authority selection.

```
Component: RequestCreationForm
  State:
    - approvalAuthorities: ApprovalAuthority[]
    - selectedAuthority: ApprovalAuthority | null
    - isLoading: boolean
    - error: string | null

  Lifecycle:
    - On mount: Fetch filtered approval authorities from API
    - On authority selection: Update selectedAuthority state

  Methods:
    - fetchApprovalAuthorities(): Calls backend API
    - handleAuthoritySelect(authority): Updates selected authority
    - renderApprovalAuthorityDropdown(): Renders dropdown with filtered options
    - submitRequest(): Creates request with selected authority
```

#### ApprovalAuthorityDropdown

Dropdown component displaying filtered approval authorities.

```
Component: ApprovalAuthorityDropdown
  Props:
    - authorities: ApprovalAuthority[]
    - selectedAuthority: ApprovalAuthority | null
    - onSelect: (authority: ApprovalAuthority) => void
    - isLoading: boolean

  Rendering:
    - For each authority:
      - Display: "{name} - {organizationalUnit}"
      - Example: "Dr. Smith - College of Engineering / School of Computing / Department of Software Engineering"
      - Example: "Ms. Johnson - President's Office"

  Behavior:
    - Show loading state while fetching
    - Show error message if fetch fails
    - Disable dropdown if no authorities available
```

## Data Models

### Staff User Model

```
Staff {
  id: string,
  name: string,
  email: string,
  role: 'staff',
  isActive: boolean,
  wing: 'academic' | 'administrative',
  
  // Academic wing fields
  college?: string,
  school?: string,
  department?: string,
  
  // Administrative wing fields
  administrativeUnit?: string
}
```

### Approval Authority Model

```
ApprovalAuthority {
  id: string,
  name: string,
  email: string,
  role: 'approval_authority' | 'vice_president',
  isActive: boolean,
  wing: 'academic' | 'administrative',
  
  // Academic wing fields
  college?: string,
  school?: string,
  department?: string,
  
  // Administrative wing fields
  administrativeUnit?: string
}
```

### API Response Model

```
FilteredAuthoritiesResponse {
  authorities: ApprovalAuthority[],
  wing: 'academic' | 'administrative',
  staffId: string,
  timestamp: ISO8601DateTime
}
```

## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Academic Hierarchy Filtering

*For any* staff member in the academic wing and any approval authority database, all returned authorities should have matching college, school, and department values as the staff member.

**Validates: Requirements 1.1**

### Property 2: Academic Role Filtering

*For any* filtered approval authority list from the academic wing, all authorities should have role equal to 'approval_authority' or 'vice_president'.

**Validates: Requirements 1.2**

### Property 3: Academic Active Status Filtering

*For any* filtered approval authority list from the academic wing, all authorities should have isActive equal to true.

**Validates: Requirements 1.3**

### Property 4: Academic Authority Display Information

*For any* approval authority from the academic wing displayed in the dropdown, the rendered text should include the authority's name and organizational unit (college, school, department).

**Validates: Requirements 1.4**

### Property 5: Administrative Hierarchy Filtering

*For any* staff member in the administrative wing and any approval authority database, all returned authorities should have matching administrativeUnit value as the staff member.

**Validates: Requirements 2.1**

### Property 6: Administrative Role Filtering

*For any* filtered approval authority list from the administrative wing, all authorities should have role equal to 'approval_authority' or 'vice_president'.

**Validates: Requirements 2.2**

### Property 7: Administrative Active Status Filtering

*For any* filtered approval authority list from the administrative wing, all authorities should have isActive equal to true.

**Validates: Requirements 2.3**

### Property 8: Administrative Authority Display Information

*For any* approval authority from the administrative wing displayed in the dropdown, the rendered text should include the authority's name and administrative unit.

**Validates: Requirements 2.4**

### Property 9: API Response Completeness

*For any* API response containing approval authorities, each authority object should include id, name, role, and organizational unit fields (college/school/department for academic, administrativeUnit for administrative).

**Validates: Requirements 3.4**

### Property 10: Dropdown Population Consistency

*For any* API response with filtered authorities, the dropdown should display exactly the same authorities returned by the API with no additions or removals.

**Validates: Requirements 4.2**

### Property 11: Dropdown Hierarchy Consistency

*For any* staff member opening the approval authority dropdown, all displayed authorities should match the staff member's organizational hierarchy.

**Validates: Requirements 4.3**

### Property 12: Dropdown Option Display Format

*For any* approval authority displayed in a dropdown option, the rendered text should include both the authority's name and their organizational unit.

**Validates: Requirements 4.4**

### Property 13: Cross-Department Exclusion (Academic)

*For any* staff member in the academic wing and any approval authority from a different department, that authority should not appear in the filtered results.

**Validates: Requirements 5.1**

### Property 14: Cross-Administrative Unit Exclusion

*For any* staff member in the administrative wing and any approval authority from a different administrative unit, that authority should not appear in the filtered results.

**Validates: Requirements 5.2**

### Property 15: Hierarchy Change Reactivity

*For any* staff member whose organizational hierarchy is updated, the filtered approval authorities should be updated to reflect the new hierarchy on the next API call.

**Validates: Requirements 5.3**

### Property 16: Inactive Authority Removal

*For any* approval authority that transitions from isActive=true to isActive=false, that authority should no longer appear in any filtered results.

**Validates: Requirements 5.4**

### Property 17: Selected Authority Hierarchy Display

*For any* approval authority selected in the request form, the request details should display the complete organizational hierarchy of that authority.

**Validates: Requirements 6.4**

## Error Handling

### Backend Error Scenarios

1. **Invalid Staff Member**: If the authenticated staff member cannot be found
   - Response: 404 Not Found with message "Staff member not found"

2. **Incomplete Hierarchy**: If staff member has incomplete organizational data
   - Response: 400 Bad Request with message "Staff member hierarchy is incomplete"

3. **Database Query Failure**: If the database query fails
   - Response: 500 Internal Server Error with message "Failed to retrieve approval authorities"

4. **No Matching Authorities**: If no authorities match the staff member's hierarchy
   - Response: 200 OK with empty authorities array

### Frontend Error Scenarios

1. **API Call Failure**: If the backend API call fails
   - Display: Error message "Unable to load approval authorities. Please try again."
   - Action: Show retry button

2. **Empty Results**: If no authorities are available
   - Display: Message "No approval authorities available in your hierarchy"
   - Action: Disable dropdown

3. **Network Timeout**: If the API call times out
   - Display: Error message "Request timed out. Please try again."
   - Action: Show retry button

## Testing Strategy

### Unit Testing

Unit tests verify specific examples, edge cases, and error conditions:

1. **Academic Filtering Edge Cases**
   - Test with staff from different departments
   - Test with authorities having different roles
   - Test with inactive authorities
   - Test with missing organizational fields

2. **Administrative Filtering Edge Cases**
   - Test with staff from different administrative units
   - Test with authorities having different roles
   - Test with inactive authorities
   - Test with missing administrative unit fields

3. **API Endpoint Tests**
   - Test with valid authenticated staff
   - Test with invalid staff ID
   - Test with incomplete hierarchy
   - Test error responses

4. **Frontend Component Tests**
   - Test dropdown rendering with various authority lists
   - Test dropdown with empty results
   - Test dropdown with loading state
   - Test dropdown with error state
   - Test authority selection and display

### Property-Based Testing

Property-based tests verify universal properties across all inputs using randomization:

1. **Academic Filtering Properties** (Properties 1-4)
   - Generate random staff members with academic hierarchies
   - Generate random authority databases
   - Verify all returned authorities match the filtering criteria

2. **Administrative Filtering Properties** (Properties 5-8)
   - Generate random staff members with administrative units
   - Generate random authority databases
   - Verify all returned authorities match the filtering criteria

3. **API Response Properties** (Property 9)
   - Generate random authority lists
   - Verify all responses include required fields

4. **Dropdown Display Properties** (Properties 10-12)
   - Generate random authority lists
   - Verify dropdown displays exactly the API results
   - Verify display format includes name and organizational unit

5. **Exclusion Properties** (Properties 13-14)
   - Generate random staff members and authority databases
   - Verify authorities from different hierarchies are excluded

6. **Reactivity Properties** (Properties 15-16)
   - Generate random hierarchy changes
   - Verify filtered results update accordingly
   - Generate random authority status changes
   - Verify inactive authorities are removed

7. **Display Properties** (Property 17)
   - Generate random selected authorities
   - Verify complete hierarchy is displayed in request details

**Configuration**:
- Minimum 100 iterations per property test
- Each test tagged with: **Feature: hierarchical-approval-authority-filtering, Property {number}: {property_text}**
- Tests should use randomized data generators for organizational hierarchies
