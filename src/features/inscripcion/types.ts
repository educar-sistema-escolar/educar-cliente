export type EnrollmentStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'archived';

export interface EnrollmentRequestInput {
  studentFirstName: string;
  studentLastName: string;
  studentDni: string;
  birthDate: string;
  educationalLevel: string;
  schoolYear: string;
  turn: string;
  responsibleFullName: string;
  responsibleDni: string;
  responsibleRelation: string;
  phone: string;
  email: string;
  notes: string;
}

export interface EnrollmentRequest extends EnrollmentRequestInput {
  id: string;
  academicYear: number;
  createdAt: string;
  updatedAt: string;
  status: EnrollmentStatus;
  source: 'public-form';
  approvedCourseId: string | null;
  studentId: string | null;
  enrollmentId: string | null;
  rejectionReason: string | null;
}
