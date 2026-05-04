// Academic Wing Data - Woldia University Structure
export const ACADEMIC_COLLEGES = [
  'College of Engineering',
  'College of Natural Sciences',
  'College of Social Sciences and Humanities',
  'College of Business and Economics',
  'College of Agriculture',
  'College of Health Sciences',
  'College of Education',
  'College of Law',
];

// Schools by College (null means no schools, departments directly under college)
export const ACADEMIC_SCHOOLS: Record<string, string[] | null> = {
  'College of Engineering': [
    'School of Civil Engineering',
    'School of Electrical Engineering',
    'School of Mechanical Engineering',
    'School of Computing',
  ],
  'College of Natural Sciences': [
    'School of Physics',
    'School of Chemistry',
    'School of Biology',
  ],
  'College of Social Sciences and Humanities': null, // No schools, departments directly under college
  'College of Business and Economics': [
    'School of Accounting',
    'School of Management',
    'School of Economics',
  ],
  'College of Agriculture': null, // No schools, departments directly under college
  'College of Health Sciences': [
    'School of Medicine',
    'School of Nursing',
    'School of Public Health',
  ],
  'College of Education': null, // No schools, departments directly under college
  'College of Law': null, // No schools, departments directly under college
};

// Departments by School (or by College if no schools)
export const ACADEMIC_DEPARTMENTS: Record<string, string[]> = {
  // College of Engineering - Schools
  'School of Civil Engineering': [
    'Department of Structural Engineering',
    'Department of Water Resources Engineering',
    'Department of Transportation Engineering',
  ],
  'School of Electrical Engineering': [
    'Department of Power Systems',
    'Department of Electronics',
    'Department of Telecommunications',
  ],
  'School of Mechanical Engineering': [
    'Department of Thermal Engineering',
    'Department of Manufacturing Engineering',
    'Department of Mechanical Design',
  ],
  'School of Computing': [
    'Department of Software Engineering',
    'Department of Computer Science',
    'Department of Information Technology',
  ],
  
  // College of Natural Sciences - Schools
  'School of Physics': [
    'Department of Theoretical Physics',
    'Department of Applied Physics',
  ],
  'School of Chemistry': [
    'Department of Organic Chemistry',
    'Department of Inorganic Chemistry',
    'Department of Physical Chemistry',
  ],
  'School of Biology': [
    'Department of Molecular Biology',
    'Department of Ecology',
    'Department of Microbiology',
  ],
  
  // College of Social Sciences and Humanities - No Schools (Direct Departments)
  'College of Social Sciences and Humanities': [
    'Department of History',
    'Department of Archaeology',
    'Department of Philosophy',
    'Department of Theology',
    'Department of English',
    'Department of Amharic',
    'Department of Foreign Languages',
  ],
  
  // College of Business and Economics - Schools
  'School of Accounting': [
    'Department of Financial Accounting',
    'Department of Management Accounting',
  ],
  'School of Management': [
    'Department of Business Administration',
    'Department of Human Resource Management',
  ],
  'School of Economics': [
    'Department of Microeconomics',
    'Department of Macroeconomics',
  ],
  
  // College of Agriculture - No Schools (Direct Departments)
  'College of Agriculture': [
    'Department of Crop Science',
    'Department of Horticulture',
    'Department of Animal Production',
    'Department of Veterinary Medicine',
  ],
  
  // College of Health Sciences - Schools
  'School of Medicine': [
    'Department of Internal Medicine',
    'Department of Surgery',
    'Department of Pediatrics',
  ],
  'School of Nursing': [
    'Department of Clinical Nursing',
    'Department of Community Health Nursing',
  ],
  'School of Public Health': [
    'Department of Epidemiology',
    'Department of Health Management',
  ],
  
  // College of Education - No Schools (Direct Departments)
  'College of Education': [
    'Department of Science Education',
    'Department of Mathematics Education',
    'Department of Educational Administration',
    'Department of Educational Planning',
  ],
  
  // College of Law - No Schools (Direct Departments)
  'College of Law': [
    'Department of Criminal Law',
    'Department of Commercial Law',
    'Department of Family Law',
    'Department of Property Law',
  ],
};

// Administrative Wing Data
export const ADMINISTRATIVE_UNITS = [
  "President's Office",
  'Legal Service Executive',
  'Ethics and Anti-Corruption Executive',
  'Audit Executive',
  'Women and Social Affairs',
  'Strategic Affairs Manager',
  'Institutional Change Executive',
  'Media / Communication Center',
  'Administration and Development Council',
  'Resource Development and Income Generation',
  'Human Resource and Management Administration',
  'Procurement Executive',
  'Finance Executive',
  'Property Administration',
  'Garage, Deployment, and Transport Services',
  'General Services Executive',
  'Security and Peace Executive',
];
