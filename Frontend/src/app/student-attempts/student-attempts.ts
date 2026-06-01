import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { AssessmentService } from '../service/assessment.service';
import { LearningService } from '../service/learning.service';
import { AuthService } from '../core/services/auth.service';
import { ExamAttemptResponse, AttemptStatus, ExamResponse } from '../models/assessment.model';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-student-attempts',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink],
  templateUrl: './student-attempts.html',
})
export class StudentAttemptsComponent implements OnInit {
  studentId = '';
  attempts: ExamAttemptResponse[] = [];
  availableExams: (ExamResponse & { courseName?: string })[] = [];
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private assessmentService: AssessmentService,
    private learningService: LearningService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.studentId = this.route.snapshot.paramMap.get('studentId') || this.authService.getUserId() || '';
    if (this.studentId) {
      this.loadDashboardData();
    } else {
      this.error = 'Student ID not found.';
      this.loading = false;
    }
  }

  loadDashboardData(): void {
    this.loading = true;
    
    // Fetch both attempts and enrolled courses
    forkJoin({
      attempts: this.assessmentService.getAttemptsByStudent(this.studentId),
      courses: this.learningService.getEnrolledCourses(this.studentId)
    }).subscribe({
      next: (data) => {
        this.attempts = data.attempts;
        this.fetchExamsForCourses(data.courses);
      },
      error: (err) => {
        console.error('Failed to load initial data', err);
        this.error = 'Failed to load dashboard data.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  fetchExamsForCourses(courses: any[]): void {
    if (!courses || courses.length === 0) {
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }

    const examObservables = courses.map(course => 
      this.assessmentService.getExamsByCourse(course.id).pipe(
        catchError(() => of([])) // Ignore individual course failures
      )
    );

    forkJoin(examObservables).subscribe({
      next: (examsArrays) => {
        const allPublishedExams: (ExamResponse & { courseName?: string })[] = [];
        
        examsArrays.forEach((exams, index) => {
          const course = courses[index];
          exams.forEach(exam => {
            if (exam.status === 'PUBLISHED') {
              allPublishedExams.push({
                ...exam,
                courseName: course.title
              });
            }
          });
        });

        this.availableExams = allPublishedExams;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to fetch exams', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  scoreDisplay(attempt: ExamAttemptResponse): string {
    if (attempt.score === null) return '—';
    return `${attempt.score} / ${attempt.maxScore ?? '?'}`;
  }

  statusClass(status: AttemptStatus): string {
    const map: Record<AttemptStatus, string> = {
      STARTED: 'bg-blue-50 text-blue-600',
      IN_PROGRESS: 'bg-yellow-50 text-yellow-600',
      SUBMITTED: 'bg-slate-100 text-slate-600',
      GRADED: 'bg-green-50 text-green-600',
    };
    return map[status] ?? 'bg-slate-100 text-slate-600';
  }
}
