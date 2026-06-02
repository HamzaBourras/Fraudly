import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { LearningService } from '../service/learning.service';
import { AuthService } from '../core/services/auth.service';
import { Cours } from '../models/learning.model';

@Component({
  selector: 'app-allcours',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './allcours.html',
  styleUrl: './allcours.css'
})
export class Allcours implements OnInit {
  courses: Cours[] = [];
  loading = true;
  error = '';
  isTeacher = false;
  userId = '';

  // Enroll-by-code modal (student)
  showEnrollModal = false;
  enrollCode = '';
  enrollError = '';
  enrolling = false;

  deletingCourseId: string | null = null;

  // Students panel (teacher)
  showStudentsPanel = false;
  selectedCourseStudents: { studentId: string }[] = [];
  selectedCourseTitle = '';
  studentNames: Map<string, string> = new Map();

  constructor(
    private learningService: LearningService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.isTeacher = this.authService.isProfessor();
    this.userId = this.extractUserIdFromToken() ?? '';
    this.loadCourses();
  }

  loadCourses(): void {
    this.loading = true;
    this.error = '';

    this.learningService.getAllCourses().subscribe({
      next: (data) => {
        const all = Array.isArray(data) ? data : [];
        if (this.isTeacher) {
          this.courses = all;
        } else {
          // Student: show only courses where the student is enrolled
          this.courses = all.filter(course =>
            (course.enrollments ?? []).some(e => e.studentId === this.userId)
          );
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load courses. Please check your backend connection.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  navigateToChapters(courseId: string): void {
    this.router.navigate(['/chapitre', courseId]);
  }

  // --- Enroll-by-code modal ---

  openEnrollModal(): void {
    this.showEnrollModal = true;
    this.enrollCode = '';
    this.enrollError = '';
  }

  closeEnrollModal(): void {
    this.showEnrollModal = false;
    this.enrollCode = '';
    this.enrollError = '';
  }

  submitEnrollCode(): void {
    const code = this.enrollCode.trim();
    if (!code) return;

    this.enrolling = true;
    this.enrollError = '';

    this.learningService.enroll(code).subscribe({
      next: () => {
        this.enrolling = false;
        this.showEnrollModal = false;
        this.enrollCode = '';
        this.loadCourses();
      },
      error: (err) => {
        this.enrolling = false;
        this.enrollError =
          err?.error?.message ?? 'Enrollment failed. Please check the course code.';
        this.cdr.detectChanges();
      },
    });
  }

  openStudentsPanel(course: Cours): void {
    this.selectedCourseTitle = course.title;
    this.selectedCourseStudents = (course.enrollments ?? []).map(e => ({ studentId: e.studentId }));
    this.showStudentsPanel = true;
    this.loadStudentNames(this.selectedCourseStudents);
  }

  closeStudentsPanel(): void {
    this.showStudentsPanel = false;
  }

  loadStudentNames(enrollments: { studentId: string }[]): void {
    const uniqueIds = [...new Set(enrollments.map(e => e.studentId))];
    if (uniqueIds.length === 0) return;
    forkJoin(uniqueIds.map(id => this.learningService.getUserById(id))).subscribe({
      next: (users) => {
        users.forEach((user, i) => this.studentNames.set(uniqueIds[i], user.fullName));
        this.cdr.detectChanges();
      },
      error: () => { this.cdr.detectChanges(); },
    });
  }

  getStudentName(studentId: string): string {
    return this.studentNames.get(studentId) ?? 'Chargement...';
  }

  getStudentInitials(studentId: string): string {
    const name = this.studentNames.get(studentId);
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  }

  deleteCourse(courseId: string): void {
    this.deletingCourseId = courseId;
    this.learningService.deleteCourse(courseId).subscribe({
      next: () => {
        this.courses = this.courses.filter(c => c.id !== courseId);
        this.deletingCourseId = null;
        this.cdr.detectChanges();
      },
      error: () => {
        this.deletingCourseId = null;
        this.cdr.detectChanges();
      },
    });
  }

  private extractUserIdFromToken(): string | null {
    const token = localStorage.getItem('fraudly_access_token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1])) as Record<string, unknown>;
      return (payload['userId'] ?? payload['sub'] ?? null) as string | null;
    } catch {
      return null;
    }
  }
}
