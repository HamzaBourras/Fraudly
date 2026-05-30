import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Cours,
  Chapter,
  Enrollment,
  CreateCoursRequest,
  CreateChapterRequest,
} from '../models/learning.model';

@Injectable({ providedIn: 'root' })
export class LearningService {
  private readonly baseUrl = `${environment.apiUrl}/learning`;
  private readonly resourcesUrl = `${environment.apiUrl}/resources`;

  constructor(private http: HttpClient) {}

  // ==========================================
  // COURS MANAGEMENT (/api/learning/courses)
  // ==========================================

  // CoursPostDto: { title, description, category } — no profId, no coursCode
  createCourse(request: CreateCoursRequest): Observable<Cours> {
    return this.http.post<Cours>(`${this.baseUrl}/courses`, request);
  }

  getAllCourses(): Observable<Cours[]> {
    return this.http.get<Cours[]>(`${this.baseUrl}/courses`);
  }

  getCourseById(courseId: string): Observable<Cours> {
    return this.http.get<Cours>(`${this.baseUrl}/courses/${courseId}`);
  }

  updateCourse(courseId: string, request: CreateCoursRequest): Observable<Cours> {
    return this.http.put<Cours>(`${this.baseUrl}/courses/${courseId}`, request);
  }

  deleteCourse(courseId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/courses/${courseId}`);
  }

  getCoursesByProfessor(profId: string): Observable<Cours[]> {
    return this.http.get<Cours[]>(`${this.baseUrl}/courses/prof/${profId}`);
  }

  getEnrolledCourses(studentId: string): Observable<Cours[]> {
    return this.http.get<Cours[]>(`${this.baseUrl}/courses/student/${studentId}`);
  }

  // ==========================================
  // CHAPITRE MANAGEMENT (/api/learning/chapitres)
  // ==========================================

  // ChapitrDto for POST: { title } only — courseId goes in URL path, not body
  createChapter(courseId: string, request: CreateChapterRequest): Observable<Chapter> {
    return this.http.post<Chapter>(`${this.baseUrl}/chapitres/${courseId}`, request);
  }

  getChapterById(chapterId: string): Observable<Chapter> {
    return this.http.get<Chapter>(`${this.baseUrl}/chapitres/${chapterId}`);
  }

  updateChapter(chapterId: string, request: CreateChapterRequest): Observable<Chapter> {
    return this.http.put<Chapter>(`${this.baseUrl}/chapitres/${chapterId}`, request);
  }

  deleteChapter(chapterId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/chapitres/${chapterId}`);
  }

  getChaptersByCourse(courseId: string): Observable<Chapter[]> {
    return this.http.get<Chapter[]>(`${this.baseUrl}/chapitres/course/${courseId}`);
  }

  // ==========================================
  // ENROLLMENT MANAGEMENT (/api/learning/enrolements)
  // ==========================================

  // POST /enrolements/{coursCode} — userId comes from JWT, no body needed
  enroll(coursCode: string): Observable<Enrollment> {
    return this.http.post<Enrollment>(`${this.baseUrl}/enrolements/${coursCode}`, {});
  }

  unenroll(enrolementId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/enrolements/${enrolementId}`);
  }

  // ==========================================
  // RESOURCES MANAGEMENT (/api/resources)
  // ==========================================

  uploadResource(file: File | null, type: string, lien: string, chapterId: string): Observable<any> {
    const formData = new FormData();
    if (file !== null) {
      formData.append('file', file);
    }
    formData.append('type', type);
    formData.append('lien', lien);
    return this.http.post<any>(`${this.resourcesUrl}/${chapterId}`, formData);
  }

  // ==========================================
  // AI TUTOR (/api/learning/tutor)
  // ==========================================

  askTutor(question: string, studentId: string, courseId: string): Observable<{ answer: string }> {
    return this.http.post<{ answer: string }>(`${this.baseUrl}/tutor/ask`, {
      question,
      studentId,
      courseId,
    });
  }
}
