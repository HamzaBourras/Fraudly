import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LearningService } from '../service/learning.service';
import { AssessmentService } from '../service/assessment.service';
import { AuthService } from '../core/services/auth.service';
import { ChapterForm } from '../chapter-form/chapter-form';
import { ExamResponse } from '../models/assessment.model';

@Component({
  selector: 'app-cours',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ChapterForm],
  templateUrl: './cours.html',
  styleUrl: './cours.css',
})
export class Cours implements OnInit {
  course: any = null;
  exams: ExamResponse[] = [];
  loading = true;
  error = '';
  courseId: string | null = null;
  isTeacher = false;
  isEnrolled = false;

  // Modal State
  showModal = false;
  editingChapter: any = null; // null = Add, object = Edit

  constructor(
    private route: ActivatedRoute,
    private learningService: LearningService,
    private assessmentService: AssessmentService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.isTeacher = this.authService.isProfessor();
    this.route.paramMap.subscribe(params => {
      this.courseId = params.get('courseId');
      if (this.courseId) this.loadCourse(this.courseId);
    });
  }

  loadCourse(id: string): void {
    this.loading = true;
    this.learningService.getCourseById(id).subscribe({
      next: (data) => {
        this.course = data;
        if (this.course?.chapters) {
          this.course.chapters.sort((a: any, b: any) => a.index - b.index);
        }

        const userId = this.authService.getUserId();
        this.isEnrolled = this.isTeacher || (this.course?.enrollments?.some((e: any) => e.studentId === userId) ?? false);

        // Fetch exams
        this.assessmentService.getExamsByCourse(id).subscribe({
          next: (res) => {
            this.exams = res.filter(e => e.status === 'PUBLISHED');
            this.loading = false;
            this.cdr.detectChanges();
          },
          error: () => {
            this.loading = false;
            this.cdr.detectChanges();
          }
        });
      },
      error: () => {
        this.error = 'Failed to load course details.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // --- CRUD HANDLERS ---
  openAddModal() {
    this.editingChapter = null; // Forces 'Add Mode' in modal
    this.showModal = true;
    this.cdr.detectChanges();
  }

  openEditModal(chapter: any) {
    this.editingChapter = { ...chapter };
    this.showModal = true;
    this.cdr.detectChanges();
  }

  deleteChapter(id: string) {
    if(!confirm('Are you sure you want to delete this chapter?')) return;
    this.learningService.deleteChapter(id).subscribe(() => this.loadCourse(this.courseId!));
  }

  closeAndReload() {
    this.showModal = false;
    this.editingChapter = null;
    this.loadCourse(this.courseId!);
  }

  enrollInCourse(): void {
    if (!this.course?.coursCode) return;
    this.learningService.enroll(this.course.coursCode).subscribe(() => this.loadCourse(this.courseId!));
  }
}
