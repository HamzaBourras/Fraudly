export interface Resource {
  id: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
}

export interface Chapter {
  id: string;
  title: string;
  dateChapitre: string | null;
  resources: Resource[];
}

export interface Enrollment {
  id: string;
  studentId: string;
  enrollmentDate: string | null;
}

export interface Cours {
  id: string;
  title: string;
  description: string;
  category: string;
  profId: string;
  chapterCount: number;
  coursCode: string;
  chapters: Chapter[];
  enrollments: Enrollment[];
}

export interface CreateCoursRequest {
  title: string;
  description: string;
  category: string;
  profId: string;
}

export interface CreateChapterRequest {
  title: string;
}
