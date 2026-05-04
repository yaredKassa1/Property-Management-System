'use client';

import { useState } from 'react';
import { ACADEMIC_COLLEGES, ACADEMIC_SCHOOLS, ACADEMIC_DEPARTMENTS } from './organizationalData';

interface AcademicWingFormProps {
  formData: any;
  errors: Record<string, string>;
  onFormDataChange: (field: string, value: string) => void;
  colleges: string[];
  schools: Record<string, string[] | null>;
  departments: Record<string, string[]>;
  onAddCollege: (college: string) => void;
  onAddSchool: (school: string) => void;
  onAddDepartment: (department: string) => void;
}

export function AcademicWingForm({
  formData,
  errors,
  onFormDataChange,
  colleges,
  schools,
  departments,
  onAddCollege,
  onAddSchool,
  onAddDepartment,
}: AcademicWingFormProps) {
  const [newCollege, setNewCollege] = useState('');
  const [newSchool, setNewSchool] = useState('');
  const [newDepartment, setNewDepartment] = useState('');
  const [showNewCollege, setShowNewCollege] = useState(false);
  const [showNewSchool, setShowNewSchool] = useState(false);
  const [showNewDepartment, setShowNewDepartment] = useState(false);

  // Get schools for selected college (null means no schools)
  const collegeHasSchools = formData.college ? schools[formData.college] !== null : false;
  const schoolsArray = formData.college && schools[formData.college] ? (schools[formData.college] as string[]) : [];
  
  // Get departments - either from school or directly from college if no schools
  let departmentsArray: string[] = [];
  if (formData.school) {
    departmentsArray = departments[formData.school] || [];
  } else if (formData.college && !collegeHasSchools) {
    departmentsArray = departments[formData.college] || [];
  }

  const handleAddCollege = () => {
    if (newCollege.trim()) {
      onAddCollege(newCollege);
      setNewCollege('');
      setShowNewCollege(false);
    }
  };

  const handleAddSchool = () => {
    if (newSchool.trim()) {
      onAddSchool(newSchool);
      setNewSchool('');
      setShowNewSchool(false);
    }
  };

  const handleAddDepartment = () => {
    if (newDepartment.trim()) {
      onAddDepartment(newDepartment);
      setNewDepartment('');
      setShowNewDepartment(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* College Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          College *
        </label>
        <div className="flex gap-2">
          <select
            key={`college-${formData.college}`}
            value={formData.college}
            onChange={(e) => {
              onFormDataChange('college', e.target.value);
              onFormDataChange('school', '');
              onFormDataChange('department', '');
            }}
            className={`flex-1 px-3 py-2 border rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.college ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select College</option>
            {colleges.map((college) => (
              <option key={college} value={college}>
                {college}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setShowNewCollege(!showNewCollege)}
            className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            title="Add new college"
          >
            +
          </button>
        </div>
        {showNewCollege && (
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              value={newCollege}
              onChange={(e) => setNewCollege(e.target.value)}
              placeholder="Enter new college name"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
            />
            <button
              type="button"
              onClick={handleAddCollege}
              className="px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Add
            </button>
          </div>
        )}
        {errors.college && <p className="text-red-500 text-xs mt-1">{errors.college}</p>}
      </div>

      {/* School Selection - Always show, but disable if college has no schools */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          School {collegeHasSchools ? '(Optional)' : '(N/A)'}
        </label>
        <div className="flex gap-2">
          <select
            value={formData.school}
            onChange={(e) => {
              onFormDataChange('school', e.target.value);
              onFormDataChange('department', '');
            }}
            disabled={!collegeHasSchools}
            className={`flex-1 px-3 py-2 border rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              !collegeHasSchools ? 'bg-gray-100 cursor-not-allowed opacity-50' : ''
            } ${errors.school ? 'border-red-500' : 'border-gray-300'}`}
          >
            <option value="">
              {!collegeHasSchools ? 'No schools for this college' : 'Select School (Optional)'}
            </option>
            {schoolsArray.map((school) => (
              <option key={school} value={school}>
                {school}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setShowNewSchool(!showNewSchool)}
            disabled={!collegeHasSchools}
            className={`px-3 py-2 rounded-md ${
              collegeHasSchools
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            title="Add new school"
          >
            +
          </button>
        </div>
        {showNewSchool && collegeHasSchools && (
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              value={newSchool}
              onChange={(e) => setNewSchool(e.target.value)}
              placeholder="Enter new school name"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
            />
            <button
              type="button"
              onClick={handleAddSchool}
              className="px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Add
            </button>
          </div>
        )}
        {errors.school && <p className="text-red-500 text-xs mt-1">{errors.school}</p>}
      </div>

      {/* Department Selection - Always show */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Department *
        </label>
        <div className="flex gap-2">
          <select
            value={formData.department}
            onChange={(e) => onFormDataChange('department', e.target.value)}
            disabled={!formData.college}
            className={`flex-1 px-3 py-2 border rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              !formData.college ? 'bg-gray-100 cursor-not-allowed opacity-50' : ''
            } ${errors.department ? 'border-red-500' : 'border-gray-300'}`}
          >
            <option value="">
              {!formData.college ? 'Select college first' : 'Select Department'}
            </option>
            {departmentsArray.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setShowNewDepartment(!showNewDepartment)}
            disabled={!formData.college}
            className={`px-3 py-2 rounded-md ${
              formData.college
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            title="Add new department"
          >
            +
          </button>
        </div>
        {showNewDepartment && formData.college && (
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              value={newDepartment}
              onChange={(e) => setNewDepartment(e.target.value)}
              placeholder="Enter new department name"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
            />
            <button
              type="button"
              onClick={handleAddDepartment}
              className="px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Add
            </button>
          </div>
        )}
        {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department}</p>}
      </div>
    </div>
  );
}
