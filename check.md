
WOLDIA UNIVERSITY
INSTITUTE OF TECHNOLOGY
SCHOOL OF COMPUTING
DEPARTMENT OF SOFTWARE ENGINEERING
Web-based Property Management System for Woldia University
A Senior Project Documentation Submitted to Woldia University in Partial Fulfillment of the            Requirement for the Degree of Bachelor of Science in Software Engineering
                                           Group Members
     NAME                     	ID NO                                                                 
Aklilu Mengesha            	WDU1300244
Betelhem Asmiro          	WDU1306222
Yared Kassa                	WDU1303033
Haftamu Teamr             	WDU1201031
Mastewal Tilay               	WDU1303033
                                                                 Advisor: Zeleke C.
                                                      Submission Date: 08/05/2018 E.C                                                              Woldia, Ethiopia

Approval
This is to certify that the project report entitled “Woldia University Property Management System”, submitted by Software Engineering students to the School of Computing, Department of Software Engineering, is submitted in partial fulfillment of the requirements for the award of the degree of Bachelor of Science in Software Engineering.
This project is an original work carried out by the group members under my supervision. The contents of this project are reliable and represent genuine work completed by the students. Furthermore, this project has not been submitted, either in whole or in part, to this University or to any other university or institution for the fulfillment of the requirements of any other degree or qualification.
Team member’s                   Signature                               Date 
Aklilu Mengesha              __________________________      ________________
Betelhem Asmiro             __________________________      ________________
Haftamu Teamr               __________________________      ________________
Mastewal Tilaye              __________________________       ________________
Yared Kassa                 __________________________        ________________
Project Title: Woldia University Property Management System
This is to certify that we have read and evaluated this project report and, in our opinion, it is adequate in scope and quality for the fulfillment of the requirements for the award of the degree of Bachelor of Science in Software Engineering.
    Name of Advisor Role                        Signature                          Date
Zeleke Chekol (MSc) Advisor                     ___________                ___________


Examining committee members                       Signature                               Date
Examiner 1: ________________________            _________________              _________
Examiner 2: ________________________             _________________             _________
Examiner 3: ________________________            _________________              _________
It is approved that this project has been written in compliance with the formatting rules laid down by the department. ________________
                               


Acknowledgements
We would like to express our sincere gratitude to our advisor, Zeleke C, for his invaluable guidance and support throughout this project. We also thank the Property Management Office at Woldia University for providing insights into the current system. Special thanks to our group members for their collaborative efforts and to the Department of Software Engineering for the resources provided.
 
 
 
 
 
 
 
 
 
 
 
 
 
 


Abstract
This project is presented the Software Requirements Specification (SRS) for the Woldia University Property Management System (WDUPMS). The system aims to automate the management of university-owned assets, replacing inefficient manual processes with a centralized and secure web application. This project is covered the entire asset lifecycle, including registration, assignment, tracking, transfer, return and reporting. By addressing issues such as data loss, delays, and lack of transparency, the Woldia University Property Management System (WDUPMS) enhances operational efficiency, accountability, and resource utilization across the university's campuses. The project employs an iterative development approach using Object-Oriented System Analysis and Design (OOSAD), UML modeling, and technologies like Next.js, JavaScript (ES6+) and Node.js with Express.js. Feasibility studies confirm its viability, and the system is scoped to university-wide property management, excluding purchasing and external integrations.
 
 
 
 
 
 
 
 
 
 
 
  
 


Table of Contents
Approval	i
Acknowledgements	iii
Abstract	iv
List of Figures	viii
List of Tables	ix
Acronyms and Abbreviations	x
Chapter 1 INTRODUCTION	1
1.1. Project Overview	1
1.2. Problem Statement	2
1.3. Project Objectives	3
1.3.1. General Objective	3
1.3.2. Specific Objectives	3
1.4. Scope and Limitations	3
1.4.1 Scope	3
1.4.2 Limitation	4
1.5. Project Significance	4
1.6. Project Beneficiaries	5
1.7. Feasibility Study	5
1.8. Methodologies	6
1.9. System Analysis and Design	6
1.10. System Development	6
1.11. Development Tools	7
1.12. Team Roles and Responsibilities	7
Chapter 2 ANALYSIS OF THE CURRENT SYSTEM	9
2.1. Description of the Current System	9
2.2. Overview	10
2.3. Structure of the Existing System	10
Chapter 3 Software Requirements Specification	13
3.1. Proposed System Overview	13
3.2. Functional Requirement	13
3.3. Non Functional Requirement	17
3.4. Use Case Models	17
3.4.1. Use Case Diagram	18
3.4.2 Use Case Description	18
3.5. Object Model	41
3.5.1. Class Diagram	42
3.6. Dynamic Models	43
3.6.1. Sequence Diagram	43
3.6.2. Activity Diagram	46
Chapter 4 System Design	49
4.1 Introduction	49
4.2 System Purpose	49
4.3 Design goals	50
4.4. Current Software Architecture	51
4.5. Proposed Software Architecture	51
4.5.1. Overview	52
4.5.2. Subsystem Decomposition	52
4.5.3. Hardware/Software Mapping	54
4.5.4. Database Design	54
4.5.5. Access Control and Security	56
4.5.6. Boundary Conditions	56
4.6. User Interface Design	57
4.6.1 Navigational Paths	57
4.6.2. Screen Mock-ups	61
Reference	63



List of Figures
Figure 3.1- Use Case Diagram	18
Figure 3.2-Class Diagram	42
Figure 3.3-Sequence Diagram for Login	43
Figure 3.4-Sequence Diagram for Register Asset	44
Figure 3.5-Sequence Diagram for Update Assets	45
Figure 3.6-Activity Diagram for Login	46
Figure 3.7-Activity Diagram for Register Asset	47
Figure 3.8-Activity Diagram for Update Asset	48
Figure 4.1-Proposed Software Architecture	52
Figure 4.2-Database Diagram Design	55
Figure 4.3-screen mock-up	61
Figure 4.4-UI Property management system	61
Figure 4.5-property officer dashboard	62



List of Tables
Table 1.1- Team Roles and Responsibilities	8
Table 3.1- Use Case Description for Login	19
Table 3.2- Use Case Description for Manage User Account	20
Table 3.3- Use Case Description for Register Assets	21
Table 3.4-Use Case Description for Update Assets	22
Table 3.5-Use Case Description for Maintain Inventory Records	23
Table 3.6-Use Case Description for Initiate Transfer Request	24
Table 3.7-Use Case Description for Approve/ Reject Request	24
Table 3.8-Use Case Description for Process Approved Request	25
Table 3.9-Use Case Description for Initiate Return Request	26
Table 3.10-Use Case Description for Receive Notifications	27
Table 3.11-Use Case Description for Logout	28
Table 3.12-Use Case Description for Purchase Assets	29
Table 3.13-Use Case Description for Review Property	30
Table 3.14-Use Case Description for Submit Property Requests to VP	31
Table 3.15-Use Case Description for Approve Withdrawal	32
Table 3.16-Use Case Description for Use Assigned Assets	33
Table 3.17-Use Case Description for Authenticate User	34
Table 3.18-Use Case Description for View Asset Details	35
Table 3.19-Use Case Description for Manage Transfers	36
Table 3.20-Use Case Description for Manage Returns	37
Table 3.21-Use Case Description for Verify Product Quality	38
Table 3.22-Use Case Description for Reject Defective Product	40
Table 3.23 - Use Case Description for Assign User Roles	41
Table 4.1 Navgational Paths	58

 
 
 
 
 
 

Acronyms and Abbreviations
Acronyms	Description
ER	Entity-Relationship
JWT	JavaScript Object Notation Web Tokens
OOSAD	Object-Oriented System Analysis and Design
RBAC	Role-Based Access Control
SDLC	Software Development Life Cycle
SRS	Software Requirements Specification
UI	User Interface
UML	Unified Modeling Language
WDUPMS	Woldia University Property Management System
 
 
 
 
 
 
Chapter 1INTRODUCTION
1.1. Project Overview
Woldia University, established in 2011, is a public higher education institution serving over 10,000 students across multiple campuses. The university manages a wide range of assets including bookshelves, computers, laboratory instruments, IT hardware, and office supplies. Prior to this project, the property management system at Woldia University was entirely manual, relying on paper-based forms and records. This traditional approach resulted in several challenges such as data loss, delays in processing, inaccurate records, and limited scalability.
To address these problems, the Woldia University Property Management System (WDUPMS) was developed as a web-based application to digitize and streamline the management of university-owned assets. The system was designed to support asset tracking, allocation, maintenance, and reporting in a secure and efficient manner. An iterative development model was adopted, applying Object-Oriented System Analysis and Design (OOSAD) principles throughout the development process.
The system was implemented using modern technologies, including Next.js for the frontend, Node.js with Express.js for the backend, and PostgreSQL as the database management system. The main objectives of the project were to automate the asset lifecycle management process, enhance data security, and reduce administrative workload.
The scope of the system covered core functionalities such as user role management, inventory tracking, and workflow automation, while excluding purchasing modules and external system integrations. Feasibility analysis confirmed that the project was economically, technically, and operationally viable. As a result, the system improved accountability, efficiency, and transparency for key stakeholders including administrators and property officers.
 
1.2. Problem Statement
Woldia University currently relies on a manual, paper-based system to manage its property. The manual system involves a variety of handwritten forms, logbooks, and spreadsheets maintained by different departments, leading to several significant challenges:
Delayed Information Flow: The reliance on paper forms and manual input results in slow communication and information transfer across departments. This delay can hinder timely decision-making and response to asset-related inquiries.
Data Loss: Handwritten records are susceptible to physical damage, loss, or misplacement. This introduces a risk of incomplete or lost information, complicating asset management and reporting processes.
Lack of Visibility: The fragmented nature of the current system makes it difficult to gain a comprehensive view of the university's assets. The university society may not have real-time access to information about asset availability, status, or location.
Time-Consuming Reporting: Generating reports related to asset management is a labor-intensive process due to manual data entry and retrieval. This not only consumes valuable time but also diverts attention from more strategic activities.
Difficulty Retrieving Records: Searching through physical logbooks and spreadsheets to locate specific asset records is cumbersome and inefficient, leading to frustration and increased administrative burden.
Inaccurate Documentation: Human errors in data entry can result in inconsistencies and inaccuracies in asset records. This can lead to misplaced assets, financial discrepancies, and issues during audits.
The manual processes employed by Woldia University consume significant space for physical storage and require a considerable amount of manpower for management. This results in:
High Operating Costs: The resources spent on paper, printing, and physical storage contribute to elevated costs in asset management.
Human Errors: The risk of errors increases with manual data entry, which can lead to costly mistakes and resource misallocation.
Limited Accessibility: Accessing information remotely or retrieving specific records in a timely manner is challenging, particularly for stakeholders who need information quickly.
Inefficient Maintenance: Maintenance of assets and inventory management becomes inefficient due to the lack of an integrated system to track and manage assets.
1.3. Project Objectives
1.3.1. General Objective
The main objective of this project is to develop automated property management system for Woldia University.
1.3.2. Specific Objectives
To study, analyze, and transition the manual system to an automated system
To store overall property records in a permanent database.
To minimize employee workload.
To solve data security issues.
To minimize unnecessary expenses for data recording.
To enhance management flexibility.
To ensure system availability.
1.4. Scope and Limitations
1.4.1 Scope
The proposed (WDUPMS) is provided a centralized, web-based platform for managing assets. The scope of the system includes:
Asset Registration: Recording all fixed and fixed-consumable assets into the system
Assignment: Assigning property to departments or individual staff members, tracked through digital records.
Asset Transfer: Managing property transfers between departments or users, ensuring accountability with proper documentation.
Asset Return: Recording the return of property to the central store (Gimja House) and updating inventory records.
Reporting: Generate different types of reports like asset status, transfers, withdrawals, depreciation, and overall inventory for administrators and auditors.
Role-Based Access Control: Ensuring secure access through authentication (e.g., JWT) and privileges based on user roles (Vice President, Purchase Department, Quality Assurance, Property Officers, Approval Authority, Staff).
Workflow Automation: Digitizing the existing manual process, including request approvals, quality assurance checks, and store intake/distribution using electronic equivalents of Model 19, Model 20, and Model 22 forms.
Audit Trail: Maintaining a complete history of asset movements and transactions for transparency and accountability.
1.4.2 Limitation
While the WDUPMS addresses core property management needs, certain processes and integrations are intentionally excluded from the system’s scope:
Procurement and Payment Processes: The system does not handle bidding, direct purchase, or financial transactions. These remain under the responsibility of the purchase department.
Integration with Other University Systems: No direct integration with financial, HR, or student clearance systems is included in this version.
Automated Maintenance Scheduling: The system does not provide predictive or scheduled maintenance features for assets.
Mobile Applications: The solution is web-based only; no native mobile applications are included.
External Supplier Management: While procurement involves suppliers, the system does not manage supplier contracts or bidding processes digitally.
Exclude the registration and management of the consumable properties.
1.5. Project Significance
This automated system is reduced resource wastage, improved accountability, enhanced security, reduced workload, simplified management, provided fast information access, increased accuracy, and improved operational speed. It supported data-driven decisions and efficient asset utilization.
1.6. Project Beneficiaries
Woldia University Property Management Office
Dormitory Administration Staff
Department Heads
University Administration (higher officials)
Store and Inventory Officers
Students (Group Members)
Staff and Stakeholders (as users of assigned property)
1.7. Feasibility Study
 
In feasibility studies, it is crucial to make decisions on how beneficial or practical the developing system is. Before we are going to develop the system, first we should notify the feasibility of the system that is going to be implemented.
Economic Feasibility: The development of the proposed Property Management System for Woldia University is economically feasible. The project requires only a modest budget for software development, basic hosting, and maintenance. Since the system will be built using widely available and cost-effective technologies, the overall implementation cost remains low.
Technical Feasibility: The proposed system is technically feasible because it relies on readily available and widely supported technologies. The hardware and software requirements such as computers, mobile devices, servers, relational databases, and standard development tools are already accessible within the university or can be acquired at minimal cost. Additionally, the development team possesses the necessary technical skills to design, code, test, and deploy the system effectively.
Operational Feasibility: The proposed Property Management System is operationally feasible because it directly addresses the core challenges identified in the current manual workflow. It improves property tracking, enhances accountability, simplifies clearance, and speeds up data sharing among administrators and departments.
1.8. Methodologies
 
To gather the information necessary for developing the proposed Woldia University Property Management System, we are used three primary data collection methods: interview, observation, and review of previous documents.
Interview
We conducted interview with the Property Manager of Woldia University and other staff members involved in managing assigned university property. Through these interviews, we obtained detailed information about the current processes, challenges, and user requirements.
Observation
We observed the existing manual property management workflow used for assigning and returning to university property. This observation helped us identify process gaps, inefficiencies, and the specific problems that the proposed system aims to solve. 
Document Analysis 
We reviewed existing records, s property assignment sheets, and other related documents used by Woldia University. These documents allowed us to understand how property information was recorded and managed and helped us identify inconsistencies or weaknesses in the manual system.
1.9. System Analysis and Design
The System is designed using Object-Oriented System Analysis and Design (OOSAD) principles to ensure modularity, maintainability, and scalability. OOSAD allows us to model real-world entities as objects, define their relationships, and represent interactions clearly.
1.10. System Development
The project adopted an Iterative Software Development Life Cycle (SDLC) model, which emphasizes building the system in small, manageable increments rather than attempting to deliver the entire solution at once. Each iteration produces a functional version of the system that is reviewed, tested, and refined before moving to the next cycle.
This approach ensures that development is incremental, adaptive, and responsive to feedback, while reducing risks and improving efficiency.
1.11. Development Tools
Frontend: Next.js, Tailwind CSS, JavaScript (ES6+).
Backend: Node.js with Express.js, Postgres, JWT (JSON Web Token) for authentication and role-based access control.
Editors: Visual Studio Code, Chrome for debugging.
Modeling: UML tools (Enterprise Architect, Microsoft Visio, Lucidchart).
Version Control: Git/GitHub.
1.12. Team Roles and Responsibilities
The project is developed by a team whose members share responsibilities based on their skills and roles. Each member contributes to the successful completion of the Woldya University Property Management System project.
 
Name	Team Member Role	Responsibilities and Tasks
Betelhem Asmiro	Requirement Elicitor	Collect system requirements through interviews, observation, and document review; communicate with stakeholders; identify user needs
Haftamu Teamr	Requirement Analyst	Analyze collected requirements, document functional and non-functional requirements, identify system constraints and priorities
Mastewal Tilaye	System Designer	Design system architecture, database structure, and UML diagrams (use case, class, sequence diagrams)
Yared Kassa	Backend Developer	Develop server-side logic using Node.js and Express; implement APIs, database integration, and authentication
Aklilu Mengesha	Frontend Developer	Design and implement user interfaces using Next.js; ensure responsiveness and usability
Betelhem Asmiro	Deployment Engineer	Deploy the system on the hosting environment (Render, Vercel, or university server); configure server, environment variables, and basic security

Table 1.1- Team Roles and Responsibilities

 
 


Chapter 2ANALYSIS OF THE CURRENT SYSTEM
2.1. Description of the Current System
The current property management system at Woldia University is entirely manual, relying on paper-based forms and records for asset registration, assignment, transfer, and return. Assets are categorized into fixed assets (e.g., bookshelves, computers, office furniture), non-fixed assets (e.g., pens, paper, printer ink, clothing), and fixed-consumable assets (e.g., laboratory chemicals, cleaning materials, maintenance supplies, and printer cartridges). Their management is overseen by Approval Authorities and property officers.
Workflow of the Current System
Request Submission: When staff members require property, they submit a request to the university’s Gimja Bet (Property Administration Office).
Approval Process: The Gimja Bet reviews and accepts the request.
Procurement/Engagement: If the requested property is not available internally, external companies that supply property are contacted to provide the required items.
Distribution: Once approved or procured, the Gimja Bet distributes the property to staff members.
Documentation: All transactions are recorded using paper-based forms and cards.
Forms and Records Used
The manual system relies on several standardized forms and record cards, including:
User Card – tracks property assigned to individual staff members.
Stock Record Card – records items stocked in and out of the store.
Property Transfer Form – documents the transfer of property between users or departments.
BIN-CARD – controls property received and withdrawn from storage.
Model 19 – receipt for articles or property received.
Model 20 – request form for withdrawal of property.
Model 22 – receipt for articles or property withdrawn.
Limitations
Because the system is paper based, it is prone to inefficiencies, delays, and errors. Tracking property movement, verifying records, and generating reports require significant manual effort, making the process time consuming and difficult to manage at scale.
2.2. Overview
The current property management process at Woldia University relies heavily on physical documentation, such as paper forms and manual record cards. This approach creates significant inefficiencies, including the risk of data loss, delays in information flow, and difficulties in retrieving past records. Because all records are stored in hard copy, they are vulnerable to damage, misplacement, or duplication of errors.
Moreover, the absence of a centralized digital platform means that departments cannot share information seamlessly or track assets in real time. As a result, property officers and administrators spend considerable effort compiling reports, verifying transfers, and managing clearance procedures. This manual workflow not only consumes time and resources but also reduces transparency and accountability across the university.
In short, the existing system is slow, error-prone, and lacks visibility, making it increasingly unsuitable for a growing institution like Woldia University that requires efficient, reliable, and scalable property management practices.
2.3. Structure of the Existing System
The current property management process at Woldia University is manual and paper-based, coordinated across departments and central administrative units. All acquired materials—fixed or consumable—must pass quality inspection before the store (Gimja House) accepts them. Procurement is managed by the Purchase Department, using bid processes for large/fixed assets and direct purchase for small/consumable items.


Roles and responsibilities
Vice President: Reviews departmental request letters; approves or declines. Issues approval letters to Purchase Department.
Purchase Department (Purchase House): Procures all requested property.
Uses bidding for large/fixed assets.
Uses direct purchase for small/consumable materials.
Quality Assurance Department: Checks and approves quality for all property types; without QA approval, the store will not accept items.
Gimja House (Central Store): Receives, records, and distributes property; only accepts items with QA approval (Model 19).
Requesting Approval Authorities: Confirms essentiality and approves withdrawal requests (Model 20).
Property Officers/Store Clerks: Maintain stock records, receipts, and movement documents.
Step-by-step process
1. Department Request Submission
The department prepares and submits a formal property request letter to the Vice President. The request is entered into the administrative review process for evaluation.

2. Vice President Review and Decision
The Vice President reviews the submitted request and makes a decision to approve or decline it. If approved, an official approval letter is issued and forwarded to the Purchase Department for further processing.
 
3. Procurement by Purchase Department
The Purchase Department procures the requested property based on the approval provided.Large and fixed assets are procured through formal bidding proceduresSmall and consumable items are procured through direct purchasing methods. All procured items are prepared for quality assurance inspection.
 

4. Quality Assurance Inspection
The Quality Assurance Officer inspects all procured items, including fixed and consumable assets. Items are either approved or rejected based on inspection results. Items that do not receive QA approval are not accepted by the Central Store (Gimja House).
 
5. Store Intake (Gimja House)
Upon QA approval, the procured items are received into the Central Store using Model 19 (Receipt for Property Received). Stock records are updated accordingly, and items are recorded as available inventory.
 
6. Withdrawal Request from Department
The department submits a Model 20 (Request for Withdrawal of Property). The Approval Authority reviews and approves the request to confirm necessity. Approved requests are forwarded to the Central Store for processing.
 
7. Distribution to Department
The Central Store processes the approved withdrawal request and issues Model 22 (Receipt for Property Withdrawal). User records and stock records are updated, and the requested property is distributed to the department.
 
8. Ongoing Records and Asset Movement Tracking
Standard cards and digital forms are used to track asset assignments, transfers, and stock changes. All movements are documented to maintain a complete audit trail for reporting and accountability purposes.
 


Chapter 3Software Requirements Specification
3.1. Proposed System Overview
The Woldia University Property Management System (WDUPMS) is designed as a distributed web-based application that provides a centralized platform for managing all university-owned assets. The system integrates a central database to record, update, and retrieve property information, ensuring that data is consistent, accurate, and accessible across departments.
Access to the system is controlled through role-based privileges, allowing administrators, property officers, stock managers, and other authorized users to perform tasks according to their responsibilities. This ensures accountability and prevents unauthorized actions.
The system features Graphical User Interface (GUI) that is intuitive and user friendly, enabling staff members to easily navigate and perform property management tasks such as asset registration, assignment, transfer, return, and reporting.
By digitizing the entire property management workflow, the WDUPMS enhances transparency, reduces manual workload, minimizes errors, and provides real time visibility into the status of university assets.
3.2. Functional Requirement
1. User Management and Authentication
The Administrator shall create, update, deactivate, and delete user accounts.
The Administrator shall assign one or more roles to a user account.
The User shall reset their password through a secure password recovery mechanism.
The system shall authenticate users using secure login credentials (username and password).
The system shall implement JWT-based authentication for session management.
The system shall enforce role-based access control (RBAC) with predefined roles: Vice President, Purchase Department, Property Officer, Approval Authorities, and Staff.
2. Asset Registration and Management
The Property Officer shall register new fixed assets in the central database.
The Property Officer shall update asset information, including location, condition, and status.
The Property Officer shall mark assets as disposed, damaged, lost, or retired with appropriate documentation.
The User shall search and view assets by Asset ID, Name, Category, Location, Department, or Assigned User.
The system shall generate a unique identifier (Asset ID/Tag) for each registered asset automatically.
The system shall categorize assets into predefined categories: Fixed Assets and Fixed-Consumable Assets.
The system shall display the complete profile/details of any selected asset, including its history.
The system shall track the current custodian (individual or department) for each asset.
3. Asset Assignment Management
The Property Officer shall assign assets to specific departments.
The Property Officer shall assign assets to individual staff members within departments.
The Property Officer shall maintain a digital User Card for each staff member showing currently assigned assets.
The Property Officer shall record assignment details: Asset ID, Assignee Name, Assignee Department, Assignment Date, Expected Return Date, and Condition at Assignment.
The Property Officer shall allow bulk assignment of multiple assets to a single department or user.
The system shall prevent assignment of assets that are already assigned, disposed, or under maintenance.

4. Asset Transfer Management
The User shall initiate transfer requests for assets between departments or users.
The source Approval Authorities shall approve asset transfer requests.
The receiving Department/User shall acknowledge asset transfer requests.
The system shall implement a digital Property Transfer Form capturing all transfer details.
The system shall update asset location and custodian information automatically upon transfer completion.
The system shall maintain complete transfer history for each asset.
5. Asset Return Management
The Staff shall initiate return requests for assigned assets to the Central Store.
The Property Officer shall inspect and acknowledge asset returns before updating inventory.
The Property Officer shall record condition changes or damages during return inspection.
The system shall record asset return details: Asset ID, Returning User, Return Date, Condition, Reason, and Receiving Officer.
The system shall update the asset status to "Available" upon successful return processing.
The system shall update the User Card of the returning staff member by removing the returned asset.
6. Workflow Automation (Request and Approval)
The Approval Authority shall approve withdrawal requests (Model 20) before processing by the Central Store.
The Approval Authority shall submit formal property request letters to the  vice     president
The Vice President shall review, approve, or decline property requests.
The system shall automatically route approved requests to the Purchase Department with the approval letter.
The system shall implement digital forms: Model 19, Model 20, and Model 22.
The system shall track and display the current status of each request/workflow.
The system shall maintain a complete workflow history including approvals, rejections, and timestamps.
7. Inventory Management
The system shall implement digital Stock Record Cards for each asset category.
The system shall implement a digital BIN-CARD system for property received and withdrawn.
The system shall automatically update stock levels when assets are received, assigned, transferred, or returned.
The system shall display current inventory levels by category, location, and status.
The system shall provide alerts when stock levels fall below minimum thresholds.
The system shall support inventory counting/reconciliation.
8. Reporting and Analytics
The system shall generate reports: Asset Status, Transfer, Withdrawal, Inventory Summary, Assignment, and Audit Trail.
The system shall allow report filtering by date, department, category, status, and user.
The system shall support exporting reports in PDF, Excel, and CSV.
The system shall provide a dashboard with visual analytics (charts, graphs).
9. Notification Management
The system shall generate in-application notifications for pending approvals, request status changes, and alerts.
The system shall display unread notification count.
The system shall allow users to view notification history.
The system shall notify approvers of pending requests.
The system shall notify requestors of approval or rejection.
 
3.3. Non Functional Requirement
It is a requirement how the system should that related to software quality. A Non-Functional 
Requirement is usually some form of constraint or restriction that must be considered when designing the solution. Such as: 
User interface: the system should have to provide interactive and easily manageable user interface for users
Accuracy: mean that we can get right information at right time. 
Security: the system has to be well protected from unauthorized access. 
Availability: The system should have to be functional at any given time. 
Performance: the system should have to perform in a proper way without any problem. 
Maintainability: The system should have to be developed for easy maintenance and future expansion. The system has to be easily understandable for the users and have to be easy for maintenance.
3.4. Use Case Models
The use case description of the Woldia University Property Management System explains in detail how different users (actors) interact with the system to accomplish specific tasks related to university property management. It provides a structured and detailed explanation of each system function identified in the use case diagram.
 
 
 
 
 
 
3.4.1. Use Case Diagram
 
Figure 3.1- Use Case Diagram
3.4.2 Use Case Description
Use case descriptions provide clear, structured information to developers and stakeholders on how a particular feature of the system should behave in real- world scenarios. List of use cases and their description is given below using tabular format.


UC–01: Login
Item	Description
Use Case ID	UC–01
Use Case Name	Login
Description	Allows users to log into the system using valid credentials
Goal	Authenticate users and grant system access
Actors	Administrator, Property Officer, Approval Authoritiy, VP, Purchase Department, Staff
Pre-condition	User must have a registered account
Main Flow	1. The user enters username and password in the login form.
2. The system validates credentials() against stored user accounts.
3. If valid, access is granted and the system displays the appropriate home page.
4. The user continues to access the system.
5. Use case ends.
Alternative Flow	2a. Invalid credentials → The system displays an error message (e.g., “Incorrect Username or Password”).
2b. The flow returns to Step 1 (user re-enters credentials).
c. Use case ends.
Post-condition	User dashboard is displayed
Business Rule	Only authenticated users may access the system

Table 3.1- Use Case Description for Login
UC–02: Manage User Account
Item	Description
Use Case ID	UC–02
Use Case Name	Manage User Account
Description	Administrator creates, updates, and deactivates user accounts
Goal	Control system users and access
Actors	Administrator
Pre-condition	Administrator is logged in
Main Flow	1. Administrator selects User Management option.
2. Administrator creates or updates user details.
3. Administrator assigns role and permissions to the user account.
4. System saves changes.
5. Use case ends.
Alternative Flow	a, Invalid input → System displays an error message then the system returns to Step 2.
b. Use case ends.
Post-condition	User account updated
Business Rule	Roles must match job responsibility
Assumptions	Admin has full privileges

Table 3.2- Use Case Description for Manage User Account



UC–03: Register Assets
Item	Description
Use Case ID	UC–03
Use Case Name	Register Assets
Description	Records new assets into the system
Goal	Maintain accurate asset records
Actors	Property Officer
Pre-condition	Property officer logged in
Main Flow	1. Enter asset details.
2. Submit asset record.
3. System saves data.
4. Use case ends.
Alternative Flow	1. Missing data → system prompts correction, then return to Step 1 (Enter asset details).
2. Use case ends.
Post-condition	Asset is registered
Business Rule	Asset ID must be unique
Assumptions	Asset is physically available

Table 3.3- Use Case Description for Register Assets

UC–04: Update Assets
Item	Description
Use Case ID	UC–04
Use Case Name	Update Assets
Description	Modify existing asset information
Goal	Keep asset data up-to-date
Actors	Property Officer
Pre-condition	Asset already exists
Main Flow	1. Property Officer searches for the asset.
2. Property Officer updates asset details (e.g., location, condition, status).
3. System saves the changes.
4. Use case ends.
Alternative Flow	1. Asset not found → system displays error message and returns to Step 1.
2. Use case ends.
Post-condition	Asset record updated
Business Rule	Only authorized users can edit
Assumptions	Asset status change is valid

Table 3.4-Use Case Description for Update Assets
UC–05: Maintain Inventory Records
Item	Description
Use Case ID	UC–05
Use Case Name	Maintain Inventory Records
Description	Tracks asset quantity, status, and location
Goal	Accurate inventory control
Actors	Property Officer
Pre-condition	Assets exist in system
Main Flow	1. Property Officer views the inventory list.
2. Property Officer updates asset status or location.
3. System saves the changes.
4. Use case ends.
Alternative Flow	1. Invalid update → system rejects the change and returns to Step 2.
2. Use case ends.
Post-condition	Inventory records updated
Business Rule	Inventory updates must be logged
Assumptions	Inventory audit is ongoing

Table 3.5-Use Case Description for Maintain Inventory Records
UC–06: Initiate Transfer Request
Item	Description
Use Case ID	UC–06
Use Case Name	Initiate Transfer Request
Description	Requests asset transfer between departments
Goal	Move assets officially
Actors	Approval Authoritiy
Pre-condition	Asset is assigned
Main Flow	1. Approval Authoritiy selects the asset to transfer.
2. Approval Authoritiy submits the transfer request.
3. System records the request as pending approval.
4. Use case ends.
Alternative Flow	1. Asset unavailable → system displays error and returns to Step 1.
2. Use case ends.
Post-condition	Request pending approval
Business Rule	Transfers require approval
Assumptions	Receiving department exists

Table 3.6-Use Case Description for Initiate Transfer Request
UC–07: Approve / Reject Request
Item	Description
Use Case ID	UC–07
Use Case Name	Approve / Reject Request
Description	Reviews asset-related requests
Goal	Ensure controlled asset movement
Actors	VP
Pre-condition	Request submitted
Main Flow	1. VP reviews the submitted request.
2. VP approves or rejects the request.
3. System records the decision.
4. Use case ends.
Alternative Flow	1. Rejected request → system records rejection and closes the request (no resubmission).
2. Use case ends.
Post-condition	Decision recorded
Business Rule	VP has final authority
Assumptions	Request is valid

Table 3.7-Use Case Description for Approve/ Reject Request
 
 
UC–08: Process Approved Request
Item	Description
Use Case ID	UC–08
Use Case Name	Process Approved Request
Description	Executes approved asset actions
Goal	Complete approved workflow
Actors	Property Officer
Pre-condition	Request approved
Main Flow	1. Property Officer updates the asset status.
2. System notifies relevant users of the update.
3. System records the transaction.
4. Use case ends.
Alternative Flow	1. Processing error → system displays error message and returns to Step 1.
2. Use case ends.
Post-condition	Asset transferred/returned
Business Rule	Only approved requests processed
Assumptions	Asset available

Table 3.8-Use Case Description for Process Approved Request
UC–09: Initiate Return Request
Item	Description
Use Case ID	UC–09
Use Case Name	Initiate Return Request
Description	Requests asset return
Goal	Return assigned assets
Actors	Staff
Pre-condition	Asset assigned to user
Main Flow	1. Staff selects the assigned asset.
2. Staff submits the return request.
3. System records the request as submitted.
4. Use case ends.
Alternative Flow	1. Asset already returned → system displays error message.
2. Use case ends.
Post-condition	Return request submitted
Business Rule	Returned assets must be inspected
Assumptions	Asset is functional

Table 3.9-Use Case Description for Initiate Return Request
UC–10: Receive Notifications
Item	Description
Use Case ID	UC–10
Use Case Name	Receive Notifications
Description	Notifies users of system actions
Goal	Keep users informed
Actors	All Users
Pre-condition	User logged in
Main Flow	1. System generates and sends a notification.
2. User views the notification message.
3. Use case ends.
Alternative Flow	1. Notification delayed → system queues the message and delivers once the network is available.
2. Use case ends.
Post-condition	User informed
Business Rule	Notifications are system-generated
Assumptions	Network available

Table 3.10-Use Case Description for Receive Notifications
UC–11: Logout
Item	Description
Use Case ID	UC–11
Use Case Name	Logout
Description	Ends user session
Goal	Secure session termination
Actors	All Users
Pre-condition	User logged in
Main Flow	1. User clicks the Logout button.
2. System terminates the active session.
3. Use case ends.
Alternative Flow	1. Session timeout → system automatically ends the session and logs the user out.
2. Use case ends.
Post-condition	User logged out
Business Rule	Session must be terminated
Assumptions	User finished work

Table 3.11-Use Case Description for Logout
UC–12: Purchase Assets
Item	Description
Use Case ID	UC–12
Use Case Name	Purchase Assets
Description	Allows the purchase department to record the acquisition of new assets based on approved requests
Goal	Acquire new property for the university
Actors	Purchase Department
Pre-condition	Purchase request is approved and funds are allocated
Main Flow	1. Purchase Department selects the approved request.
2. Purchase Department enters purchase details.
3. Purchase Department confirms the purchase.
4. System records the asset as purchased.
5. Use case ends.
Alternative Flow	1. Insufficient budget → system defers the purchase and notifies the Purchase Department.
2. Use case ends.
Post-condition	Asset is marked as "Purchased" and pending registration
Business Rule	Purchases must correspond to an approved budget/request
Assumptions	Vendor is registered in the system
 
Table 3.12-Use Case Description for Purchase Assets
UC–13: Review Property
Item	Description
Use Case ID	UC–13
Use Case Name	Review Property
Description	Systematic review of existing assets to check condition and utility
Goal	Ensure all university property is accounted for and in good condition
Actors	Vice President (VP), Property Officer
Pre-condition	Assets are registered in the system
Main Flow	1. Property Officer generates the property list from the system.
2. Property Officer verifies the physical presence and condition of each asset.
3. Property Officer updates the review status in the system.
4. Use case ends.
Alternative Flow	1. Discrepancy found → system logs the issue for investigation and continues with Step 2.
2. Use case ends.
Post-condition	Review log is updated
Business Rule	Property review must be conducted annually/semiannually
Assumptions	Property Officer has physical access to assets

Table 3.13-Use Case Description for Review Property
UC–14: Submit Property Requests to VP
Item	Description
Use Case ID	UC–14
Use Case Name	Submit Property Requests to VP
Description	Forwarding departmental asset requests to the Vice President for final authorization
Goal	Escalate requests for high-level approval
Actors	Approval Authority
Pre-condition	Departmental request is finalized
Main Flow	1. Approval Authority selects the finalized request.
2. Approval Authority adds justification for the request.
3. Approval Authority submits the request to the VP.
4. System updates the request status to “Pending VP Approval.”
5. Use case ends.
Alternative Flow	1. Incomplete justification → system prompts for additional information and returns to Step.
2. Use case ends.
Post-condition	Request status changes to "Pending VP Approval"
Business Rule	Only Approval Authorities can submit to the VP
Assumptions	VP is available to receive digital requests

Table 3.14-Use Case Description for Submit Property Requests to VP
UC–15: Approve Withdrawal Request
Item	Description
Use Case ID	UC–15
Use Case Name	Approve Withdrawal Request
Description	Staffs submit withdrawal requests for assets, and the Property Officer reviews and approves them based on asset type and availability.
Goal	Ensure proper authorization and tracking of asset withdrawals from the store.
Actors	Staff/User, Property Officer
Pre-condition	Staff must be logged in and have a valid account; requested assets must exist in the store inventory.
Main Flow	1. Staff selects the “Withdrawal Request” option in the system.
2. Staff enters details of the requested asset (type, quantity, purpose).
3. System forwards the request to the Property Officer.
4. Property Officer reviews the request and checks asset availability.
5. If valid, Property Officer approves the withdrawal request.
6. System updates inventory and records the approved transaction.
7. Use case ends.
Alternative Flow	1. Asset not available → System notifies Property Officer and rejects the request.
2. Request incomplete or invalid → System prompts Staff to correct details and resubmit.
3. Property Officer rejects request → System records rejection and notifies Staff.
4. Use case ends.
Post-condition	Approved requests are logged, and inventory is updated.
Staff can collect the approved assets from the store.
Business Rule	Only authorized Property Officers can approve withdrawal requests.
Asset withdrawals must match job responsibility and store availability.
Assumptions	Store inventory records are accurate and up-to-date.
Staffs provide valid reasons for asset withdrawal.
Table 3.15-Use Case Description for Approve Withdrawal
UC–16: Use Assigned Assets
Item	Description
Use Case ID	UC–16
Use Case Name	Use Assigned Assets
Description	The actual utilization of assets by the staff or user they are assigned to
Goal	Facilitate university work through proper asset use
Actors	Staff / User
Pre-condition	Asset is officially assigned and handed over
Main Flow	1. User accepts the assigned asset.
2. System updates and tracks the asset status as “In Use.”
3. Use case ends.
Alternative Flow	1. Asset fails during use → system prompts user to initiate a repair request, and asset status changes to “Under Maintenance.”
2. Use case ends.
Post-condition	User is responsible for the asset until return
Business Rule	Assets must be used for university-related tasks only
Assumptions	User follows university property policy

Table 3.16-Use Case Description for Use Assigned Assets
UC–17: Authenticate User
Item	Description
Use Case ID	UC–17
Use Case Name	Authenticate User with Access Control
Description	Internal process that checks user permissions for every action performed
Goal	Ensure system security and data integrity
Actors	System (Internal), Administrator
Pre-condition	User is attempting a restricted action
Main Flow	1. System checks the user’s role.
2. System verifies the user’s permission for the specific module or action.
3. If permission is valid, the system allows the action.
4. If permission is invalid, the system blocks the action.
5. Use case ends.
Alternative Flow	1. Unauthorized access attempt → system denies access, logs the attempt, and notifies the Administrator.
2. Use case ends.
Post-condition	Access logs are updated
Business Rule	Permission must be verified before every database write
Assumptions	Roles are correctly assigned by the Administrator
 
Table 3.17-Use Case Description for Authenticate User
UC–18: View Asset Details
Item	Description
Use Case ID	UC–18
Use Case Name	View Asset Details
Description	Allows users to view comprehensive information about a specific asset
Goal	Provide transparency and information regarding university property
Actors	All Users
Pre-condition	User is logged into the system
Main Flow	1. User searches for or selects an asset.
2. System retrieves the asset data from the database.
3. System displays asset details.
4. Use case ends.
Alternative Flow	1. Asset ID not found → system displays “No record found” message then returns to step 1.
2. Use case ends.
Post-condition	Asset information is displayed on the screen
Business Rule	Sensitive data (e.g., cost) may be hidden based on user role
Assumptions	Database contains current asset records
 
Table 3.18-Use Case Description for View Asset Details
UC–19: Manage Transfers
Item	Description
Use Case ID	UC–19
Use Case Name	Manage Transfers
Description	Overseeing the end-to-end process of moving assets between locations or departments
Goal	Ensure efficient and tracked relocation of university property
Actors	Property Officer, Approval Authoritiy.
Pre-condition	Asset is currently available for relocation
Main Flow	1. Property Officer selects the asset for transfer.
2. Property Officer assigns the new location and staff.
3. System updates the transfer status to “In Progress.”
4. Transfer record is created and tracked.
5. Use case ends.
Alternative Flow	1a. Transfer cancelled → system records cancellation, asset remains in original location, and status updated to “Cancelled.”
1b. Use case ends.
Post-condition	Transfer record is created and tracked
Business Rule	Transfers must be approved before physical movement occurs
Assumptions	Both sending and receiving departments are active in the system
 

Table 3.19-Use Case Description for Manage Transfers
UC–20: Manage Returns
Item	Description
Use Case ID	UC–20
Use Case Name	Manage Returns
Description	Handling the return of assets from users to the central store or property office
Goal	Secure the return of assigned property and update inventory
Actors	Property Officer
Pre-condition	Return request has been initiated by a staff member
Main Flow	1. Property Officer receives the return request.
2. Property Officer inspects the returned asset.
3. Property Officer confirms the return and updates the asset status to “In Store.”
4. Use case ends.
Alternative Flow	1. Asset damaged on return → system records the damage, initiates a damage report, applies fine if applicable, and updates asset status to “Under Maintenance” or “Pending Repair.”
2. Use case ends.
Post-condition	Asset is back in inventory and user liability is cleared
Business Rule	Assets must be verified against their original condition
Assumptions	The user has the asset physically present for the return
Table 3.20-Use Case Description for Manage Returns
UC–21: Verify Product Quality
Item	Description
Use Case ID	UC–21
Use Case Name	Verify Product Quality
Description	Ensures that products meet defined quality standards before approval.
Goal	Secure the return of assigned property and update inventory
Actors	Quality Assurance 
Pre-condition	Products are manufactured and ready for inspection.
Main Flow	1. Quality Assurance Officer selects a batch of products for inspection.
2. Officer verifies product quality against predefined standards and checklists.
3. If products meet quality standards, they are approved for distribution.
4.  Approved products are recorded in the system as “Quality Verified.”
5. Use case ends.
Alternative Flow	1. Product fails inspection → System records defect and prompts corrective action.
2. Product remains unverified until corrected.
3. Use case ends.
Post-condition	Products are either approved and marked “Quality Verified” or flagged for correction.
Business Rule	Products must meet all quality standards before approval.
Assumptions	Quality Assurance Officer has access to inspection tools and standards.
Products are physically available for inspection.

Table 3.21-Use Case Description for Verify Product Quality
 
UC–22: Reject Defective Products
Item	Description
Use Case ID	UC–22
Use Case Name	Reject Defective Products
Description	Handles the rejection of defective products identified during quality inspection.
Goal	Prevent defective products from being distributed and ensure corrective action is taken.
Actors	Quality Assurance 
Pre-condition	Products have been inspected and defects identified.
Main Flow	1.  Quality Assurance Officer identifies defective products during inspection.
2. Officer marks the product as “Defective” in the system.
3. System generates a defect report and updates product status.
4.  Defective products are separated for return to production or disposal.
5. Use case ends.
Alternative Flow	1. System error while recording defect → Officer retries marking product as defective.
2. If error persists, manual defect log is created.
3. Use case ends.
Post-condition	Defective products are rejected and recorded in the system with a defect report.
Business Rule	Defective products must not be approved for distribution.
All rejected products must have a defect report logged.
Assumptions	Quality Assurance Officer has authority to reject products.
Defective products are physically available for return or disposal.

Table 3.22-Use Case Description for Reject Defective Product

UC–23: Assign User Roles
Item	Description
Use Case ID	UC–23
Use Case Name	Assign User Roles
Description	Allows the Administrator to assign, update, or remove roles for system users
Goal	
Ensure proper access control by assigning correct permissions

Actors	Administrator
Pre-condition	User account already exists in the system
Main Flow	1.  Administrator logs into the system.
2. Administrator selects a user account.
3. System displays available roles.
4.  Administrator assigns or updates role(s).
5. System validates the assignment.
6. System saves the changes.
7. Use case ends.
Alternative Flow	1. Invalid role selection → system displays error message.
2. Administrator cancels operation → no changes saved.
3. Use case ends.
Post-condition	User roles are updated successfully
Business Rule	Each user must have at least one valid role
Assumptions	Administrator has authority to manage roles
Table 3.23 - Use Case Description for Assign User Roles

3.5. Object Model 
The object model of the Woldia University Property Management System represents the system by identifying key objects involved in managing university-owned properties. These objects include Property Item, Department, Staff, Assignment Record, Damage or Loss Report, and User. Each object contains relevant attributes and behaviors and defines relationships among them. The model reflects real-world property management processes at Woldia University and supports effective tracking, accountability, and maintainability of university property using object-oriented principles.
3.5.1. Class Diagram

Figure 3.2-Class Diagram





3.6. Dynamic Models 
3.6.1. Sequence Diagram
 
 
 
 
Figure 3.3-Sequence Diagram for Login
 
 
 
 
 
 
 
 

Figure 3.4-Sequence Diagram for Register Asset
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
Figure 3.5-Sequence Diagram for Update Assets
 


3.6.2. Activity Diagram
 
 
 
 

Figure 3.6-Activity Diagram for Login
 
 
 
 
 
 
 
 
 
 
 
 
Figure 3.7-Activity Diagram for Register Asset

 
 
 
 
 
 
 
Figure 3.8-Activity Diagram for Update Asset
 
 
 
 
 
 
 


Chapter 4System Design
4.1 Introduction 
 
Systems design implies a systematic and rigorous approach to design, an approach demanded by the scale and complexity of many systems problems. System design is the process of defining the components, modules, interfaces, and data for a system to satisfy specified requirements. System development is the process of creating or altering systems, requirements. System development is the process of creating or altering systems, along with the processes, practices, models, and methodologies used to develop them.
 
System designing is the transformation of the analysis model into a system design model. Until this system designing step the system were in the problem domain. Here System design is the first part to get into the solution domain in a software development. This chapter focuses on transforming the analysis model into the design model that takes into account the nonfunctional requirements and constraints described in the problem statement and requirement analysis sections discussed earlier in the previous parts.
 
The objective of designing a system is to clearly show the direction how the system is built and to obtain clear and enough information needed to drive the actual implementation of the system. It is based on understanding of the model the software built on. The objectives of design are to model the system with high quality. Implementing of high quality system depend on the nature of design created by the designer. If one want to changes to the system after it has been put in to operation depends on the quality of the system design. So if the system is design effetely, it will be easy to make changes to it.
4.2 System Purpose
System design is a process through which the requirements are translated into software. The goal of design process is to provide a blue print for implementation, testing and maintenance activities. As we tried to put the overall the objective of the property management system on the requirement analysis part, improve an access by using personal computer over the internet and to improve the quality and effectiveness of management by using a computer to support a property management process is the main goal of the system.
4.3 Design goals 
The design goal illustrates the desired qualities of the system and provides a consistent set of criteria that must be considered when making the design decisions in system designing. Basically it is based on the non-functional requirements. This means that non-functional requirement is the description of the feature characteristics and attribute of the system as well as any constraints that may limit the boundary of the proposed solution. Here we are listing some of the major design goals that have to be fulfilled for efficient functionality of the system. 
A. Robustness: the proposed property management system has to be robust enough to manage any valid input from the users. 
B. Reliability: the proposed system has to be reliable. The system has to perform operations without any errors. 
C. Security: unauthorized access to the system has to be maintained effectively. The proposed system has to be secured from any unauthorized access to the data in the system. 
D. Modifiability: the proposed system has to be able to modify and enhance for further advanced modification in the future. 
E. Performance: the proposed system has to perform very fast in respond to high throughput. It has to give activity in a fast and efficient way. The system is going to handle multiple user requests and process them efficiently. This helps the system to be accessed from different locations. 
F. Availability: the proposed system has to be available for multiple accesses. The system must run on multiple operating systems and support windows operating system. 
G. End User: The system have simple and interactive graphical user Interface. All the interfaces, forms and buttons are designed in a simple language or common language so that the user can access it without any difficult. So user should access the system without any complexity. The web pages are deigned to be more user friendly such as forms and buttons which have descriptive names. 
H. Response time: the proposed system should respond the user requests within a specified period of time and up to the standard response time after the request has been issued.
4.4. Current Software Architecture 
Currently, Woldia University doesn’t have any kind of automated property management system. The current system is manual. The proposed system will be the first of its kind for Woldia University. 
4.5. Proposed Software Architecture 
Woldia university property management system will be web based system, which is used to automate the current manual system. Because of this, the system will have its own software architecture. In order to propose the proposed system software architecture, we will use 3-tier architecture. The reason why we choose this type of architecture is because of latest web applications are deployed in this type of architecture. 
Tier 1: Presentation layer (tier on the top) 
In this tier, Woldia university property management system users browse in order to display user data using graphical interface. 
Tier 2: Business layer (tier in the middle) 
The proposed system business layer uses Woldia university web server to handle the data validation. 
Tier 3: Data access layer (tier at the bottom) 
The proposed system data access layer uses the Postgres database server to communicate with the database by constructing different SQL queries. 
The proposed software architecture of Woldia university property management system Is presented below.
 
 
Figure 4.1-Proposed Software Architecture

4.5.1. Overview
This section presents the proposed software architecture for the Woldia University Property Management System (WDUPMS). The architecture is designed to meet the system’s functional and nonfunctional requirements, including scalability, security, maintainability, and performance. To achieve these objectives, the system adopts a threetier (3tier) architectural model, which separates the system into presentation, application (business logic), and data management layers.
The WDUPMS is implemented as a distributed, webbased application that enables centralized management of university property while allowing access from multiple departments and campuses. The separation of concerns provided by the 3tier architecture enhances modularity, supports future system evolution, and simplifies testing, deployment, and maintenance activities.
4.5.2. Subsystem Decomposition
To reduce system complexity and promote clear responsibility allocation, the WDUPMS is decomposed into distinct subsystems. Each subsystem encapsulates a specific set of functionalities and interacts with others through welldefined interfaces.


a) Presentation Subsystem
The Presentation Subsystem represents the user interface layer of the system. It provides all graphical components through which users interact with the WDUPMS. This subsystem is implemented using modern web technologies and is responsible for:
Capturing user input through forms and interface controls.
Displaying asset information, dashboards, notifications, and reports.
Performing basic clientside input validation.
The user interface dynamically adapts based on user roles, ensuring that each actor (Vice President, Property Officer, Approval Authority, Purchase Department, and Staff) accesses only relevant system functions.
b) Application (Business Logic) Subsystem
The Application Subsystem contains the core processing logic of the WDUPMS and enforces all business rules defined in the Software Requirements Specification. Its responsibilities include:
Managing asset registration, assignment, transfer, return, and withdrawal processes.
Automating approval workflows corresponding to Model 19, Model 20, and Model 22 forms.
Handling user authentication and rolebased authorization.
Maintaining inventory records and asset life cycle status.
Generating reports and maintaining audit trails.
This subsystem acts as an intermediary between the presentation layer and the database, ensuring controlled and validated data access.
c) Data Management Subsystem
The Data Management Subsystem is responsible for persistent storage and retrieval of system data. It manages structured data using a relational database management system and ensures data accuracy, integrity, and consistency. Key responsibilities include:
Storing asset, user, department, and transaction records.
Enforcing referential integrity through constraints and relationships.
Supporting efficient querying for reporting, auditing, and monitoring purposes.

4.5.3. Hardware/Software Mapping
The WDUPMS follows a client–server deployment model, where hardware and software components are logically mapped to support distributed access and centralized control. 
Client Side
Hardware: Desktop computers, laptops, or mobile devices.
Software: Standard web browsers such as Google Chrome, Mozilla Firefox, or Microsoft Edge.
No additional clientside software installation is required, which simplifies system adoption and usage.
Server Side
Hardware: University onpremise server or cloudbased hosting infrastructure.
Operating System: Windows Server.
Application Server: Node.js with Express.js.
Database Server: PostgreSQL.
Frontend Framework: Next.js.
Security Mechanism: JSON Web Token (JWT).
This configuration supports centralized business logic execution, secure data storage, and scalable system deployment. 
4.5.4. Database Design
The database of the WDUPMS is designed using a relational data model to ensure structured data organization, efficient access, and strong integrity enforcement. The design supports all core property management processes and reporting requirements.
Major database entities include:
User: Stores authentication credentials, roles, and account status.
Department: Maintains departmental information.
Asset: Records asset identifiers, categories, conditions, locations, and statuses.
Assignment Record: Tracks assets assigned to users or departments.
Transfer Record: Logs asset movements between custodians or locations.
Return Record: Captures asset return details and inspection outcomes.
Request and Approval: Maintains workflow and decision histories.
Report Generation: Stores and manages system-generated reports such as asset status, inventory summaries, transfer history, and withdrawal records.
 

Figure 4.2-Database Diagram Design
 
 
   
Primary keys, foreign keys, and integrity constraints are applied to enforce consistency and prevent invalid data states. The database design is extensible to accommodate future system enhancements.
 
4.5.5. Access Control and Security
Security is a fundamental design consideration of the WDUPMS. The system implements RoleBased Access Control (RBAC) to ensure that users can only perform actions authorized by their assigned roles.
Key security mechanisms include:
Secure user authentication using username and password credentials.
JWTbased authorization to validate user identity and privileges for each request.
Rolespecific access rights for Vice President, Property Officer, Approval Authoritiy, Purchase Department, and Staff.
Tokenbased session management with expiration control.
Audit logging of sensitive operations such as approvals, transfers, and withdrawals.
These measures collectively ensure confidentiality, integrity, and accountability of university property data.
4.5.6. Boundary Conditions
Boundary conditions define the operational and technical limits within which the WDUPMS operates.
System Boundaries.
The system manages only universityowned fixed and fixedconsumable assets.
Procurement, bidding, and payment processes are outside the system scope.
External system integration's (finance, HR, student systems) are not included.
User Boundaries
System access is restricted to authenticated and authorized users.
Users can perform actions strictly according to their assigned roles.
Technical Boundaries
The system requires network connectivity (internet or intranet).
The application is webbased with no native mobile implementation.
The graphical user interface is provided in Amharic and English only.
Operational Boundaries
All asset transactions must follow predefined approval workflows.
Physical inspection is mandatory during asset registration and return.
These boundaries ensure controlled system operation, compliance with university policies, and reduced risk of misuse.
4.6. User Interface Design
4.6.1 Navigational Paths
 
      User Role	       Task	Navigational Path & Key Screens
 Property Officer	Register a new fixed asset	1. Dashboard → 2. "Asset Management" Menu → 3. "Register New Asset" Button → 4. Asset Registration Form (enter details) → 5. Confirmation Screen
Property Officer	Assign asset to staff member	1. Dashboard → 2. "Asset Assignment" Menu → 3. Select Available Asset → 4. "Assign" Button → 5. Select Staff Member → 6. Enter Assignment Details → 7. Generate Assignment Receipt
Approval Authority	Approve asset transfer request	1. Dashboard (with "Pending Approvals" notification) → 2. "Transfer Requests" Menu → 3. View Transfer Details → 4. Check Asset Availability → 5. Approve/Reject with Comments → 6. Notification to Requester
Property Officer	Process asset return	1. Dashboard → 2. "Asset Returns" Menu → 3. Scan/Enter Asset ID → 4. Asset Condition Check Form → 5. Record Damages/Comments → 6. Update Asset Status → 7. Generate Return Acknowledgment
Admin	Generate asset inventory report	1. Dashboard → 2. "Reports" Menu → 3. "Inventory Summary" → 4. Select Date Range & Department → 5. Filter by Asset Category → 6. Generate Report → 7. Export as PDF/Excel
Staff Member	Request asset transfer	1. Dashboard → 2. "My Assets" Tab → 3. Select Asset to Transfer → 4. "Request Transfer" Button → 5. Select Target Department/User → 6. Submit Request → 7. Track Request Status
Table 4.1 Navgational Paths

 

1. Login Screen
Layout: Centered card on gradient background with form fields
Content: System title and logo
Role selection buttons (Admin, Property Officer, Approval Authority, Staff)
 Username and password fields Login button
Forgot password link
Purpose: Secure authentication with role-based access control
2. Dashboard (Role-Based)
Layout: Sidebar navigation, top header with user info, main content area
Content:
Top Header: User avatar, role, notification bell, logout button Sidebar: Role-specific menu items Main Area:
Quick stats cards (Total Assets, Assigned, Available, Pending Requests)
Recent activities feed
Quick action buttons
Search bar for assets/users
Purpose: Central hub showing key metrics and quick access to frequent tasks
3. Asset Registration Screen
Layout: Form-based interface with validation
Content:
Asset details form (Name, Category, Serial Number, Value, Purchase Date)
Category selection (Fixed Assets, Fixed-Consumable)
Location assignment dropdown
Condition assessment
Warranty information
Attachments upload (invoice, warranty card)
Submit/Cancel buttons
Purpose: Comprehensive asset entry with all required details
4. Asset Assignment Screen
Layout: Two-panel interface
Content:
Left Panel: Available assets list with filters
Right Panel: Assignee selection and assignment details
Assignment form (Assignee, Department, Assignment Date, Expected Return)
Condition at assignment checklist
Terms and conditions
Generate User Card button
Purpose: Clear workflow for assigning assets with proper documentation
5. Transfer Request Screen
Layout: Multi-step workflow interface
Content:
Step 1: Select asset and current custodian details
Step 2: Select target department/user
Step 3: Reason for transfer and effective date
Step 4: Approval workflow status
Step 5: Digital Property Transfer Form preview
Purpose: Streamlined transfer process with approval workflow tracking
6. Inventory Management Screen
Layout: Dashboard view with filtering and export options
Content:
Asset summary by category/department
Filter options (Status, Location, Category, Date)
Low stock alerts
Bulk actions (Export, Update Status)
Stock Record Cards view
BIN-CARD system interface
Purpose: Comprehensive inventory control with real-time updates
7. Reports Dashboard
.Layout: Tabbed interface with preview options
Content:
Report type selection (Asset Status, Transfer History, Assignment, Audit Trail)
Date range filters
Department/category filters
Preview pane
Export options (PDF, Excel, and CSV)
Scheduled reports section
Purpose: Flexible reporting with multiple export formats
4.6.2. Screen Mock-ups

 
 
 
Figure 4.3-screen mock-up
 
 
Figure 4.4-UI Property management system
 
 
 
 
Figure 4.5-property officer dashboard


Reference
[1] Brueghel, B. (2000). Object-Oriented Software Engineering: Conquering Complex and Changing Systems. Upper Saddle River: Prentice Hall.
[2] Wirfs-Brock, R., Wilkerson, B., & Wiener, L. (1990). Designing Object-Oriented Software. Englewood Cliffs: Prentice Hall.
[3] Kendall, K. E., & Kendall, J. E. (2019). Systems Analysis and Design (10th ed.). Pearson Education.
[4] Fowler, M. (2004). UML Distilled: A Brief Guide to the Standard Object Modeling Language (3rd ed.). Addison-Wesley.
[5] Woldia University. Property Management Policy and Procedures. Unpublished institutional document.
